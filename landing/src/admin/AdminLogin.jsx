import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseAdmin } from '../supabase'
import styles from './AdminLogin.module.css'
import { pub } from '../pub'

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const [user,    setUser]    = useState('')
  const [pass,    setPass]    = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')

    // Fetch stored credentials from Supabase
    const [{ data: userRow }, { data: passRow }] = await Promise.all([
      supabaseAdmin.from('configuracion').select('valor_text').eq('parametro', 'admin_user').maybeSingle(),
      supabaseAdmin.from('configuracion').select('valor_text').eq('parametro', 'admin_pass').maybeSingle(),
    ])

    const storedUser = userRow?.valor_text ?? import.meta.env.VITE_ADMIN_USER
    const storedHash = passRow?.valor_text   // null when not yet set via panel

    if (user !== storedUser) {
      setLoading(false)
      setError('Usuario o contraseña incorrectos')
      return
    }

    // If hash stored → compare SHA-256; otherwise plain comparison against env var
    let passOk = false
    if (storedHash) {
      passOk = (await sha256(pass)) === storedHash
    } else {
      passOk = pass === import.meta.env.VITE_ADMIN_PASSWORD
    }

    setLoading(false)
    if (passOk) {
      sessionStorage.setItem('admin_session', '1')
      navigate('/eventos/admin/resumen', { replace: true })
    } else {
      setError('Usuario o contraseña incorrectos')
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
