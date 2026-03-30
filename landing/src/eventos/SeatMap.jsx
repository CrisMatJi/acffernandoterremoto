import { useState, useEffect, useContext, useMemo, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { SessionContext } from '../SessionContext'
import styles from './SeatMap.module.css'

const ROWS = 'ABCDEFGHIJKLMNOPQRST'.split('')
const COLS = [1, 2, 3, 4, 5, 6, 7]

export default function SeatMap() {
  const navigate  = useNavigate()
  const { session, setSession } = useContext(SessionContext)

  const [asientos,       setAsientos]       = useState([])
  const [reservas,       setReservas]       = useState([])
  const [selected,       setSelected]       = useState([])
  const [yaTieneReserva, setYaTieneReserva] = useState(false)
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
  const fetchData = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setLoadError('')

    const [{ data: seats, error: e1 }, { data: rvs, error: e2 }] = await Promise.all([
      supabase.from('asientos').select('id, letra, numero, disponible').order('letra').order('numero'),
      supabase.from('reserva').select('asiento_id, socio_id, invitado_id').eq('evento_id', session.eventoId),
    ])

    if (e1 || e2) {
      const msg = e1?.message || e2?.message || 'Error desconocido'
      console.error('SeatMap fetchData error:', e1, e2)
      setLoadError(`No se pudo cargar el mapa de asientos: ${msg}`)
      setLoading(false)
      return
    }

    setAsientos(seats ?? [])
    setReservas(rvs   ?? [])

    // Pre-select user's existing reservation
    const myRv = (rvs ?? []).find(r =>
      session.type === 'socio'
        ? r.socio_id === String(session.id)
        : r.invitado_id === session.id
    )
    if (myRv) {
      setSelected(myRv.asiento_id.split(',').filter(Boolean))
      setYaTieneReserva(true)
    } else {
      setSelected([])
      setYaTieneReserva(false)
    }

    setLoading(false)
  }, [session])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Derived state ─────────────────────────────────────────────────────────
  const asientoMap = useMemo(
    () => Object.fromEntries((asientos).map(a => [a.id, a])),
    [asientos]
  )

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
    const asiento = asientoMap[seatId]
    if (!asiento || !asiento.disponible) return 'bloqueado'
    if (selected.includes(seatId))       return 'seleccionado'
    if (occupiedByOthers.has(seatId))    return 'ocupado'
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
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <img src="/images/logo.jpg" alt="Logo" className={styles.logo} />
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
                    <div key={c} className={styles.colLabel}>{c}</div>
                  ))}
                </div>

                {/* Rows */}
                {loading
                  ? ROWS.map(row => (
                      <div key={row} className={styles.gridRow}>
                        <div className={styles.rowLabel}>{row}</div>
                        {COLS.map(c => (
                          <div key={c} className={`${styles.seat} ${styles.skeleton}`} />
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
                              className={`${styles.seat} ${styles[status]}`}
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
                        <p>Asiento{selected.length > 1 ? 's' : ''}: <em>{selected.join(', ')}</em></p>
                      </div>
                    </div>
                    <button
                      className={styles.cancelBtn}
                      onClick={cancelarReserva}
                      disabled={saving}
                    >
                      {saving ? 'Procesando…' : 'Cancelar reserva'}
                    </button>
                  </div>
                ) : (
                  <div className={styles.panelInner}>
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
                    </div>
                    <div className={styles.panelBtns}>
                      {yaTieneReserva && (
                        <button
                          className={styles.cancelBtn}
                          onClick={cancelarReserva}
                          disabled={saving}
                        >
                          Cancelar reserva
                        </button>
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
