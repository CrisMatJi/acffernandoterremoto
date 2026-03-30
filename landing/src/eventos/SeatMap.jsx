import { useState, useEffect, useContext, useMemo, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { supabase } from '../supabase'
import { SessionContext } from '../SessionContext'
import TicketDocument from './TicketPDF'
import styles from './SeatMap.module.css'
import { pub } from '../pub'

const ROWS = 'ABCDEFG'.split('')
const COLS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]
const AISLE_AFTER = new Set([4, 9, 14]) // pasillos entre grupos de asientos

// Asientos reservados permanentemente (centro filas A y B — artistas/staff)
const BLOCKED_SEATS = new Set([
  'A5','A6','A7','A8','A9','A10','A11','A12','A13','A14',
  'B5','B6','B7','B8','B9','B10','B11','B12','B13','B14',
])

export default function SeatMap() {
  const navigate  = useNavigate()
  const { session, setSession } = useContext(SessionContext)

  const [reservas,       setReservas]       = useState([])
  const [reservaActual,  setReservaActual]  = useState([])  // asientos confirmados en BD
  const [selected,       setSelected]       = useState([])
  const [yaTieneReserva, setYaTieneReserva] = useState(false)
  const [fechaReserva,   setFechaReserva]   = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [confirmed,      setConfirmed]      = useState(false)
  const [loadError,      setLoadError]      = useState('')
  const [actionError,    setActionError]    = useState('')

  // ── Guard ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) navigate('/eventos', { replace: true })
  }, [session, navigate])

  // ── Fetch seat data ───────────────────────────────────────────────────────
  const fetchData = useCallback(async (signal) => {
    if (!session) return
    setLoading(true)
    setLoadError('')

    try {
      const { data: rvs, error } = await supabase
        .from('reserva').select('asiento_id, socio_id, invitado_id, created_at')
        .eq('evento_id', session.eventoId)

      if (error) {
        setLoadError(`No se pudo cargar el mapa de asientos: ${error.message}`)
        return
      }

      setReservas(rvs ?? [])

      // Pre-select user's existing reservation
      const myRv = (rvs ?? []).find(r =>
        session.type === 'socio'
          ? r.socio_id === String(session.id)
          : r.invitado_id === session.id
      )
      if (myRv) {
        const seats = myRv.asiento_id.split(',').filter(Boolean)
        setSelected(seats)
        setReservaActual(seats)
        setFechaReserva(myRv.created_at ?? null)
        setYaTieneReserva(true)
      } else {
        setSelected([])
        setReservaActual([])
        setFechaReserva(null)
        setYaTieneReserva(false)
      }
    } catch (err) {
      if (signal?.aborted) return
      setLoadError(`No se pudo cargar el mapa de asientos: ${err?.message ?? String(err)}`)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [session])

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [fetchData])

  // ── Derived state ─────────────────────────────────────────────────────────
  const logoUrl = `${window.location.origin}${import.meta.env.BASE_URL}images/logoEntrada.png`

  // ¿El usuario ha seleccionado asientos distintos a su reserva actual?
  const pendingChanges = useMemo(() => {
    if (!yaTieneReserva || !reservaActual.length) return false
    if (selected.length !== reservaActual.length) return true
    const a = [...selected].sort()
    const b = [...reservaActual].sort()
    return a.some((s, i) => s !== b[i])
  }, [selected, reservaActual, yaTieneReserva])

  const occupiedByOthers = useMemo(() => {
    const set = new Set()
    reservas.forEach(r => {
      const isOwn = session?.type === 'socio'
        ? r.socio_id === String(session?.id)
        : r.invitado_id === session?.id
      if (!isOwn) r.asiento_id.split(',').filter(Boolean).forEach(s => set.add(s))
    })
    return set
  }, [reservas, session])

  const MAX_SEATS = session?.type === 'socio' ? 2 : 1

  function getStatus(seatId) {
    if (BLOCKED_SEATS.has(seatId))    return 'bloqueado'
    if (selected.includes(seatId))    return 'seleccionado'
    if (occupiedByOthers.has(seatId)) return 'ocupado'
    return 'libre'
  }

  // ── Seat click ────────────────────────────────────────────────────────────
  function handleSeatClick(seatId) {
    const status = getStatus(seatId)
    if (status === 'ocupado' || status === 'bloqueado') return
    setConfirmed(false)
    setActionError('')

    if (selected.includes(seatId)) {
      setSelected(prev => prev.filter(s => s !== seatId))
    } else if (selected.length < MAX_SEATS) {
      setSelected(prev => [...prev, seatId])
    } else {
      setActionError(`Solo puedes seleccionar ${MAX_SEATS} asiento${MAX_SEATS > 1 ? 's' : ''}.`)
    }
  }

  // ── Confirm reservation ───────────────────────────────────────────────────
  async function confirmar() {
    if (!selected.length || saving) return
    setSaving(true)
    setActionError('')

    const nombreCompleto = session.type === 'socio'
      ? `${session.nombre} ${session.apellidos}`
      : session.nombre

    const { error } = await supabase.rpc('hacer_reserva', {
      p_evento_id:   session.eventoId,
      p_socio_id:    session.type === 'socio'    ? session.id : null,
      p_invitado_id: session.type === 'invitado' ? session.id : null,
      p_nombre:      nombreCompleto,
      p_asiento_id:  selected.join(','),
    })

    if (error) {
      setActionError('No se pudo completar la reserva. Inténtalo de nuevo.')
    } else {
      setConfirmed(true)
      setYaTieneReserva(true)
      await fetchData()
    }
    setSaving(false)
  }

  // ── Cancel reservation ────────────────────────────────────────────────────
  async function cancelarReserva() {
    if (saving) return
    setSaving(true)
    setActionError('')

    const { error } = await supabase.rpc('cancelar_reserva', {
      p_evento_id:   session.eventoId,
      p_socio_id:    session.type === 'socio'    ? session.id : null,
      p_invitado_id: session.type === 'invitado' ? session.id : null,
    })

    if (error) {
      setActionError('No se pudo cancelar la reserva.')
    } else {
      setSelected([])
      setYaTieneReserva(false)
      setConfirmed(false)
      await fetchData()
    }
    setSaving(false)
  }

  function handleLogout() {
    setSession(null)
    navigate('/eventos', { replace: true })
  }

  if (!session) return null

  const nombreCompleto = session.type === 'socio'
    ? `${session.nombre} ${session.apellidos}`
    : session.nombre

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page} style={{'--sala-bg': `url('${pub('/images/sala.jpg')}')`}}>
      {/* Header */}
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <img src={pub('/images/logo.jpg')} alt="Logo" className={styles.logo} />
          <span>ACF Fernando Terremoto</span>
        </Link>
        <div className={styles.headerRight}>
          <span className={styles.userInfo}>
            {session.type === 'socio' ? `Socio nº ${session.n_socio}` : 'Invitado'} · {nombreCompleto}
          </span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Salir</button>
        </div>
      </header>

      {/* Event bar */}
      <div className={styles.eventoBar}>
        <span className={styles.eventoNombre}>{session.eventoNombre}</span>
        {session.eventoFecha && (
          <span className={styles.eventoFecha}>
            {new Date(session.eventoFecha + 'T00:00:00').toLocaleDateString('es-ES', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
            {session.eventoHora ? ` · ${session.eventoHora}` : ''}
          </span>
        )}
      </div>

      {/* Main */}
      <main className={styles.main}>
        {loadError ? (
          <div className={styles.errorWrap}>
            <p>{loadError}</p>
            <button className={styles.retryBtn} onClick={fetchData}>Reintentar</button>
          </div>
        ) : (
          <div className={styles.mapWrap}>
            {/* Stage */}
            <div className={styles.stage}>
              <span>ESCENARIO</span>
            </div>

            {/* Seat grid */}
            <div className={styles.gridScroll}>
              <div className={styles.grid}>
                {/* Column headers */}
                <div className={styles.gridRow}>
                  <div className={styles.rowLabel} />
                  {COLS.map(c => (
                    <div
                      key={c}
                      className={`${styles.colLabel}${AISLE_AFTER.has(c) ? ` ${styles.aisle}` : ''}`}
                    >{c}</div>
                  ))}
                </div>

                {/* Rows */}
                {loading
                  ? ROWS.map(row => (
                      <div key={row} className={styles.gridRow}>
                        <div className={styles.rowLabel}>{row}</div>
                        {COLS.map(c => (
                          <div
                            key={c}
                            className={`${styles.seat} ${styles.skeleton}${AISLE_AFTER.has(c) ? ` ${styles.aisle}` : ''}`}
                          />
                        ))}
                      </div>
                    ))
                  : ROWS.map(row => (
                      <div key={row} className={styles.gridRow}>
                        <div className={styles.rowLabel}>{row}</div>
                        {COLS.map(col => {
                          const seatId = `${row}${col}`
                          const status = getStatus(seatId)
                          return (
                            <button
                              key={seatId}
                              className={`${styles.seat} ${styles[status]}${AISLE_AFTER.has(col) ? ` ${styles.aisle}` : ''}`}
                              onClick={() => handleSeatClick(seatId)}
                              disabled={status === 'ocupado' || status === 'bloqueado'}
                              aria-label={`Asiento ${seatId} — ${status}`}
                              title={`${seatId}`}
                            />
                          )
                        })}
                      </div>
                    ))
                }
              </div>
            </div>

            {/* Legend */}
            <div className={styles.legend}>
              {[
                { key: 'libre',       label: 'Libre' },
                { key: 'seleccionado', label: 'Seleccionado' },
                { key: 'ocupado',     label: 'Ocupado' },
                { key: 'bloqueado',   label: 'No disponible' },
              ].map(({ key, label }) => (
                <div key={key} className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles[key]}`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Action panel */}
            {!loading && (
              <div className={styles.panel}>
                {confirmed ? (
                  <div className={styles.confirmedWrap}>
                    <div className={styles.confirmedMsg}>
                      <span className={styles.confirmedIcon}>✓</span>
                      <div>
                        <strong>Reserva confirmada</strong>
                        <p>Asiento{reservaActual.length > 1 ? 's' : ''}: <em>{reservaActual.join(', ')}</em></p>
                      </div>
                    </div>
                    <div className={styles.panelBtns}>
                      <PDFDownloadLink
                        document={<TicketDocument session={session} asientos={reservaActual} logoUrl={logoUrl} fechaReserva={fechaReserva} />}
                        fileName={`entrada-${session.eventoNombre.replace(/\s+/g,'-')}.pdf`}
                        className={styles.downloadBtn}
                      >
                        {({ loading: pdfLoading }) => pdfLoading ? 'Preparando PDF…' : 'Descargar entrada'}
                      </PDFDownloadLink>
                      <button
                        className={styles.cancelBtn}
                        onClick={cancelarReserva}
                        disabled={saving}
                      >
                        {saving ? 'Procesando…' : 'Cancelar reserva'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.panelInner}>
                    {/* Reserva actual en BD (cuando el usuario está editando) */}
                    {yaTieneReserva && reservaActual.length > 0 && (
                      <div className={styles.reservaActualInfo}>
                        <span>Reserva actual: </span>
                        <strong>{reservaActual.join(', ')}</strong>
                      </div>
                    )}
                    <div className={styles.panelRow}>
                      <div className={styles.selectionInfo}>
                        {selected.length === 0 ? (
                          <span>Selecciona {MAX_SEATS === 1 ? 'un asiento' : 'hasta 2 asientos'}</span>
                        ) : (
                          <span>
                            Seleccionado{selected.length > 1 ? 's' : ''}:{' '}
                            <strong>{selected.join(', ')}</strong>{' '}
                            <em>({selected.length}/{MAX_SEATS})</em>
                          </span>
                        )}
                        {/* Aviso cuando el usuario va a sobreescribir su reserva anterior */}
                        {pendingChanges && selected.length > 0 && (
                          <div className={styles.updateWarning}>
                            Al confirmar, se cancelará tu reserva anterior ({reservaActual.join(', ')}) y se creará la nueva.
                          </div>
                        )}
                      </div>
                      <div className={styles.panelBtns}>
                        {yaTieneReserva && (
                          <>
                            {/* Solo mostrar descarga si la selección coincide con la reserva en BD */}
                            {!pendingChanges && (
                              <PDFDownloadLink
                                document={<TicketDocument session={session} asientos={reservaActual} logoUrl={logoUrl} fechaReserva={fechaReserva} />}
                                fileName={`entrada-${session.eventoNombre.replace(/\s+/g,'-')}.pdf`}
                                className={styles.downloadBtn}
                              >
                                {({ loading: pdfLoading }) => pdfLoading ? 'Preparando…' : 'Descargar entrada'}
                              </PDFDownloadLink>
                            )}
                            <button
                              className={styles.cancelBtn}
                              onClick={cancelarReserva}
                              disabled={saving}
                            >
                              Cancelar reserva
                            </button>
                          </>
                        )}
                        <button
                          className={styles.confirmBtn}
                          onClick={confirmar}
                          disabled={!selected.length || saving}
                        >
                          {saving
                            ? 'Procesando…'
                            : yaTieneReserva
                              ? 'Actualizar reserva'
                              : 'Confirmar reserva'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {actionError && <p className={styles.actionError}>{actionError}</p>}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
