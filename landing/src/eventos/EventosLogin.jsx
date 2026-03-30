import { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { SessionContext } from '../SessionContext'
import styles from './EventosLogin.module.css'

// ─── NIF / NIE validation ───────────────────────────────────────────────────
function validarNIF(nif) {
  const clean = nif.trim().toUpperCase().replace(/[-\s]/g, '')
  const LETRAS = 'TRWAGMYFPDXBNJZSQVHLCKE'
  if (/^[XYZ]\d{7}[A-Z]$/.test(clean)) {
    const num = clean.replace('X', '0').replace('Y', '1').replace('Z', '2')
    return clean[8] === LETRAS[parseInt(num.slice(0, 8)) % 23]
  }
  if (/^\d{8}[A-Z]$/.test(clean)) {
    return clean[8] === LETRAS[parseInt(clean.slice(0, 8)) % 23]
  }
  return false
}

// ─── Date formatter ──────────────────────────────────────────────────────────
function formatFecha(isoDate) {
  if (!isoDate) return ''
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function EventosLogin() {
  const navigate = useNavigate()
  const { session, setSession } = useContext(SessionContext)

  const [eventos, setEventos]   = useState([])
  const [eventoId, setEventoId] = useState('')
  const [loadingEventos, setLoadingEventos] = useState(true)

  const [tab, setTab] = useState('socio') // 'socio' | 'invitado'

  // Socio form
  const [socioNum, setSocioNum] = useState('')
  const [socioDni, setSocioDni] = useState('')

  // Invitado form
  const [invDni,    setInvDni]    = useState('')
  const [invNombre, setInvNombre] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  // If already logged in, go straight to the seat map
  useEffect(() => {
    if (session) navigate('/eventos/reserva', { replace: true })
  }, [session, navigate])

  // Fetch active events
  useEffect(() => {
    supabase
      .from('eventos')
      .select('id, nombre, fecha, hora, activo, activo_invitado')
      .or('activo.eq.1,activo_invitado.eq.1')
      .order('fecha')
      .then(({ data }) => {
        const list = data ?? []
        setEventos(list)
        if (list.length) setEventoId(String(list[0].id))
        setLoadingEventos(false)
      })
  }, [])

  const evento = eventos.find(e => String(e.id) === eventoId)
  const invitadoActivo = !!evento?.activo_invitado

  // Reset tab if invitado not available for selected event
  useEffect(() => {
    if (tab === 'invitado' && !invitadoActivo) setTab('socio')
  }, [eventoId, invitadoActivo, tab])

  // ── Socio submit ────────────────────────────────────────────────────────
  async function handleSocio(e) {
    e.preventDefault()
    setError('')
    if (!eventoId) { setError('Selecciona un evento.'); return }
    setSubmitting(true)

    const { data, error: rpcErr } = await supabase.rpc('auth_socio', {
      p_id:  parseInt(socioNum, 10),
      p_dni: socioDni.trim().toUpperCase(),
    })

    if (rpcErr || !data?.length) {
      console.error('auth_socio error:', rpcErr)
      setError(rpcErr
        ? `Error Supabase: ${rpcErr.message}`
        : 'Número de socio o DNI incorrectos. Comprueba los datos.')
      setSubmitting(false)
      return
    }

    const socio = data[0]
    setSession({
      type:        'socio',
      id:          socio.id,
      nombre:      socio.nombre,
      apellidos:   socio.apellidos,
      n_socio:     socio.n_socio,
      eventoId:    parseInt(eventoId, 10),
      eventoNombre: evento.nombre,
      eventoFecha:  evento.fecha,
      eventoHora:   evento.hora,
    })
    navigate('/eventos/reserva')
  }

  // ── Invitado submit ─────────────────────────────────────────────────────
  async function handleInvitado(e) {
    e.preventDefault()
    setError('')
    if (!eventoId) { setError('Selecciona un evento.'); return }
    if (!validarNIF(invDni)) {
      setError('El DNI/NIE introducido no es válido. Comprueba la letra.')
      return
    }
    if (!invNombre.trim()) {
      setError('Introduce tu nombre completo.')
      return
    }

    setSession({
      type:         'invitado',
      id:           invDni.trim().toUpperCase(),
      nombre:       invNombre.trim(),
      eventoId:     parseInt(eventoId, 10),
      eventoNombre: evento.nombre,
      eventoFecha:  evento.fecha,
      eventoHora:   evento.hora,
    })
    navigate('/eventos/reserva')
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <img src="/images/logo.jpg" alt="Logo" className={styles.logo} />
          <span>ACF Fernando Terremoto</span>
        </Link>
        <Link to="/" className={styles.backLink}>← Volver a la web</Link>
      </header>

      {/* Main card */}
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>
              <span className={styles.labelLine} /> RESERVA DE ENTRADAS
            </span>
            <h1 className={styles.title}>Accede a tu <em>reserva</em></h1>
          </div>

          {/* ── Event selector ── */}
          <div className={styles.sectionBlock}>
            <p className={styles.fieldLabel}>Selecciona el evento</p>

            {loadingEventos ? (
              <div className={styles.eventList}>
                {[1,2].map(i => <div key={i} className={styles.eventCardSkeleton} />)}
              </div>
            ) : eventos.length === 0 ? (
              <div className={styles.noEventos}>
                <span className={styles.noEventosIcon}>🎭</span>
                <p>No hay eventos disponibles actualmente.</p>
                <p className={styles.noEventosSub}>Vuelve pronto para consultar la próxima programación.</p>
              </div>
            ) : (
              <div className={styles.eventList}>
                {eventos.map(ev => {
                  const isSelected = String(ev.id) === eventoId
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      className={`${styles.eventCard} ${isSelected ? styles.eventCardSelected : ''}`}
                      onClick={() => setEventoId(String(ev.id))}
                    >
                      <div className={styles.eventRadio}>
                        <div className={`${styles.radioDot} ${isSelected ? styles.radioDotActive : ''}`} />
                      </div>
                      <div className={styles.eventCardBody}>
                        <span className={styles.eventCardName}>{ev.nombre}</span>
                        <span className={styles.eventCardDate}>
                          {formatFecha(ev.fecha)}{ev.hora ? ` · ${ev.hora}h` : ''}
                        </span>
                      </div>
                      {ev.activo_invitado ? (
                        <span className={styles.invitadoBadge}>Invitados</span>
                      ) : (
                        <span className={styles.sociosBadge}>Solo socios</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Auth form (only when event selected) ── */}
          {eventoId && (
            <>
              {/* Tabs */}
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${tab === 'socio' ? styles.tabActive : ''}`}
                  onClick={() => setTab('socio')}
                  type="button"
                >
                  Soy socio
                </button>
                <button
                  className={`${styles.tab} ${tab === 'invitado' ? styles.tabActive : ''} ${!invitadoActivo ? styles.tabDisabled : ''}`}
                  onClick={() => invitadoActivo && setTab('invitado')}
                  type="button"
                  title={!invitadoActivo ? 'Este evento no permite acceso a invitados' : ''}
                >
                  Acceso invitado
                </button>
              </div>

              {tab === 'socio' ? (
                <form onSubmit={handleSocio} className={styles.form} noValidate>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="socioNum">Número de socio</label>
                      <input
                        id="socioNum"
                        type="number"
                        className={styles.input}
                        placeholder="Ej: 1"
                        value={socioNum}
                        onChange={e => setSocioNum(e.target.value)}
                        required min="1"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="socioDni">DNI</label>
                      <input
                        id="socioDni"
                        type="text"
                        className={styles.input}
                        placeholder="Ej: 12345678A"
                        value={socioDni}
                        onChange={e => setSocioDni(e.target.value)}
                        maxLength={9} required
                      />
                    </div>
                  </div>
                  {error && <p className={styles.error}>{error}</p>}
                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Verificando…' : 'Acceder'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleInvitado} className={styles.form} noValidate>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="invDni">DNI / NIE</label>
                      <input
                        id="invDni"
                        type="text"
                        className={styles.input}
                        placeholder="Ej: 12345678A"
                        value={invDni}
                        onChange={e => setInvDni(e.target.value)}
                        maxLength={9} required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel} htmlFor="invNombre">Nombre completo</label>
                      <input
                        id="invNombre"
                        type="text"
                        className={styles.input}
                        placeholder="Tu nombre y apellidos"
                        value={invNombre}
                        onChange={e => setInvNombre(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {error && <p className={styles.error}>{error}</p>}
                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Verificando…' : 'Acceder como invitado'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
