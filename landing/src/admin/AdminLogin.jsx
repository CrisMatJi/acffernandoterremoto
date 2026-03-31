import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './AdminLogin.module.css'
import { pub } from '../pub'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [user,    setUser]    = useState('')
  const [pass,    setPass]    = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Small artificial delay so the button feel doesn't flash
    await new Promise(r => setTimeout(r, 300))

    const ok =
      user === import.meta.env.VITE_ADMIN_USER &&
      pass === import.meta.env.VITE_ADMIN_PASSWORD

    if (ok) {
      sessionStorage.setItem('admin_session', '1')
      navigate('/eventos/admin/resumen', { replace: true })
    } else {
      setError('Usuario o contraseña incorrectos')
      setLoading(false)
    }
  }

  return (
    <div className={styles.page} style={{'--lobby-bg': `url('${pub('/images/lobby_background.png')}')`}}>
      <form className={styles.card} onSubmit={handleSubmit} autoComplete="off">
        <div className={styles.logoWrap}>
      <img src={pub('/images/logo.jpg')} alt="ACF Fernando Terremoto" className={styles.logo} />
        </div>
        <h1 className={styles.title}>Panel de Gestión</h1>
        <p className={styles.sub}>ACF Fernando Terremoto</p>

        <div className={styles.field}>
          <label className={styles.label}>Usuario</label>
          <input
            className={styles.input}
            type="text"
            value={user}
            onChange={e => { setUser(e.target.value); setError('') }}
            autoFocus
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Contraseña</label>
          <input
            className={styles.input}
            type="password"
            value={pass}
            onChange={e => { setPass(e.target.value); setError('') }}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Comprobando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
