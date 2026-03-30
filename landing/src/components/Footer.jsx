import { Link } from 'react-router-dom'
import styles from './Footer.module.css'
import { pub } from '../pub'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.topBar} />

      <div className={styles.inner}>
        <div className={styles.brand}>
          <img src={pub('/images/logo.jpg')} alt="Logo" className={styles.logo} />
          <div>
            <p className={styles.brandName}>ACF Fernando Terremoto</p>
            <p className={styles.brandSub}>Peña Flamenca · Jerez de la Frontera</p>
          </div>
        </div>

        <nav className={styles.nav}>
          <a href="#quienes-somos" className={styles.link}>Quiénes somos</a>
          <a href="#eventos"       className={styles.link}>Eventos</a>
          <a href="#galeria"       className={styles.link}>Galería</a>
          <a href="#contacto"      className={styles.link}>Contacto</a>
          <Link to="/eventos" className={styles.linkGold}>Reservar entradas</Link>
        </nav>

        <div className={styles.copy}>
          <p>© {year} Peña Flamenca Fernando Terremoto. Todos los derechos reservados.</p>
          <Link to="/eventos/admin" className={styles.linkAdmin}>Administración</Link>
        </div>
      </div>
    </footer>
  )
}
