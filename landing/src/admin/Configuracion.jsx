import { useState, useEffect } from 'react'
import { supabaseAdmin } from '../supabase'
import s from './admin.module.css'

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function Configuracion() {
  const [usuario,     setUsuario]     = useState('')
  const [loadingUser, setLoadingUser] = useState(true)
  const [savingUser,  setSavingUser]  = useState(false)
  const [userOk,      setUserOk]      = useState(false)
  const [userError,   setUserError]   = useState('')

  const [passActual,  setPassActual]  = useState('')
  const [passNueva,   setPassNueva]   = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [savingPass,  setSavingPass]  = useState(false)
  const [passOk,      setPassOk]      = useState(false)
  const [passError,   setPassError]   = useState('')

  useEffect(() => {
    supabaseAdmin
      .from('configuracion')
      .select('valor_text')
      .eq('parametro', 'admin_user')
      .maybeSingle()
      .then(({ data }) => {
        setUsuario(data?.valor_text ?? import.meta.env.VITE_ADMIN_USER ?? '')
        setLoadingUser(false)
      })
  }, [])

  async function handleSaveUser(e) {
    e.preventDefault()
    setSavingUser(true); setUserOk(false); setUserError('')
    const { error } = await supabaseAdmin
      .from('configuracion')
      .upsert(
        { parametro: 'admin_user', valor: 0, valor_text: usuario.trim() },
        { onConflict: 'parametro' }
      )
    setSavingUser(false)
    if (error) setUserError(error.message)
    else setUserOk(true)
  }

  async function handleSavePass(e) {
    e.preventDefault()
    setPassOk(false); setPassError('')
    if (passNueva !== passConfirm) { setPassError('Las contraseñas nuevas no coinciden'); return }
    if (passNueva.length < 6)      { setPassError('La contraseña debe tener al menos 6 caracteres'); return }

    setSavingPass(true)

    const { data: hashRow } = await supabaseAdmin
      .from('configuracion')
      .select('valor_text')
      .eq('parametro', 'admin_pass')
      .maybeSingle()

    const storedHash = hashRow?.valor_text

    // Verify current password: if hash stored → compare hashes; else plain env fallback
    let passOkFlag = false
    if (storedHash) {
      passOkFlag = (await sha256(passActual)) === storedHash
    } else {
      passOkFlag = passActual === import.meta.env.VITE_ADMIN_PASSWORD
    }

    if (!passOkFlag) {
      setSavingPass(false)
      setPassError('La contraseña actual no es correcta')
      return
    }

    const newHash = await sha256(passNueva)
    const { error } = await supabaseAdmin
      .from('configuracion')
      .upsert(
        { parametro: 'admin_pass', valor: 0, valor_text: newHash },
        { onConflict: 'parametro' }
      )
    setSavingPass(false)
    if (error) {
      setPassError(error.message)
    } else {
      setPassOk(true)
      setPassActual(''); setPassNueva(''); setPassConfirm('')
    }
  }

  return (
    <div className={s.section}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>Configuración</h2>
      </div>

      {/* ── Usuario ─────────────────────────────────────── */}
      <div className={s.configBlock}>
        <h3 className={s.configBlockTitle}>Usuario de acceso</h3>
        {loadingUser ? (
          <p className={s.empty}>Cargando…</p>
        ) : (
          <form className={s.configForm} onSubmit={handleSaveUser}>
            <div className={s.field} style={{ maxWidth: 340 }}>
              <label className={s.label}>Nombre de usuario</label>
              <input
                className={s.input}
                value={usuario}
                onChange={e => { setUsuario(e.target.value); setUserOk(false) }}
                required
              />
            </div>
            {userError && <p className={s.modalError}>{userError}</p>}
            {userOk    && <p className={s.successMsg}>Usuario actualizado.</p>}
            <div>
              <button className={s.btnPrimary} type="submit" disabled={savingUser}>
                {savingUser ? 'Guardando…' : 'Guardar usuario'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Contraseña ──────────────────────────────────── */}
      <div className={s.configBlock}>
        <h3 className={s.configBlockTitle}>Cambiar contraseña</h3>
        <form className={s.configForm} onSubmit={handleSavePass}>
          <div className={s.field} style={{ maxWidth: 340 }}>
            <label className={s.label}>Contraseña actual</label>
            <input
              className={s.input}
              type="password"
              value={passActual}
              onChange={e => { setPassActual(e.target.value); setPassOk(false); setPassError('') }}
              required
            />
          </div>
          <div className={s.field} style={{ maxWidth: 340 }}>
            <label className={s.label}>Nueva contraseña</label>
            <input
              className={s.input}
              type="password"
              value={passNueva}
              onChange={e => { setPassNueva(e.target.value); setPassOk(false); setPassError('') }}
              required
            />
          </div>
          <div className={s.field} style={{ maxWidth: 340 }}>
            <label className={s.label}>Confirmar nueva contraseña</label>
            <input
              className={s.input}
              type="password"
              value={passConfirm}
              onChange={e => { setPassConfirm(e.target.value); setPassOk(false); setPassError('') }}
              required
            />
          </div>
          {passError && <p className={s.modalError}>{passError}</p>}
          {passOk    && <p className={s.successMsg}>Contraseña actualizada correctamente.</p>}
          <div>
            <button className={s.btnPrimary} type="submit" disabled={savingPass}>
              {savingPass ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
