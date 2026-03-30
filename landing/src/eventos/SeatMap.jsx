import { useContext, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SessionContext } from '../SessionContext'
import styles from './SeatMap.module.css'

export default function SeatMap() {
  const navigate = useNavigate()
  const { session, setSession } = useContext(SessionContext)

  // Guard: redirect if no session
  useEffect(() => {
    if (!session) navigate('/eventos', { replace: true })
  }, [session, navigate])

  function handleLogout() {
    setSession(null)
    navigate('/eventos', { replace: true })
  }

  if (!session) return null

  const nombreCompleto = session.type === 'socio'
    ? `${session.nombre} ${session.apellidos}`
    : session.nombre

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
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Salir
          </button>
        </div>
      </header>

      {/* Event info */}
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

      {/* Seat map placeholder */}
      <main className={styles.main}>
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>🎭</div>
          <h2 className={styles.placeholderTitle}>Mapa de asientos</h2>
          <p className={styles.placeholderText}>
            Próximamente podrás seleccionar tu asiento desde aquí.
          </p>
          <p className={styles.placeholderSub}>
            {session.type === 'socio' ? 'Puedes reservar hasta 2 asientos.' : 'Puedes reservar 1 asiento.'}
          </p>
        </div>
      </main>
    </div>
  )
}
