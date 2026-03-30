import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import styles from './AdminLayout.module.css'
import { pub } from '../pub'

const NAV = [
  { to: '/eventos/admin/resumen',       label: 'Resumen' },
  { to: '/eventos/admin/socios',        label: 'Socios' },
  { to: '/eventos/admin/actuaciones',   label: 'Actuaciones' },
  { to: '/eventos/admin/reservas',      label: 'Reservas' },
  { to: '/eventos/admin/configuracion', label: 'Configuración' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  // Guard síncrono — sin useEffect, sin bucle infinito
  if (!sessionStorage.getItem('admin_session')) {
    return <Navigate to="/eventos/admin" replace />
  }

  function logout() {
    sessionStorage.removeItem('admin_session')
    navigate('/eventos/admin', { replace: true })
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <img src={pub('/images/logo.jpg')} alt="ACF" className={styles.logo} />
          <span className={styles.brand}>Panel Admin</span>
        </div>
        <nav className={styles.nav}>
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <button className={styles.logoutBtn} onClick={logout}>Cerrar sesión</button>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
