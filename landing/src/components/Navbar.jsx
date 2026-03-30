import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './Navbar.module.css'
import { pub } from '../pub'

const links = [
  { href: '#referentes',    label: 'Referentes' },
  { href: '#historia',      label: 'Historia' },
  { href: '#eventos',       label: 'Eventos' },
  { href: '#galeria',       label: 'Galería' },
  { href: '#junta',         label: 'Junta Directiva' },
  { href: '#contacto',      label: 'Contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLink = () => setOpen(false)

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <a href="#hero" className={styles.brand}>
        <img src={pub('/images/logo.jpg')} alt="Logo Peña Flamenca Fernando Terremoto" className={styles.logo} />
        <span className={styles.brandName}>ACF Fernando&nbsp;Terremoto</span>
      </a>

      <ul className={`${styles.links} ${open ? styles.open : ''}`}>
        {links.map(link => (
          <li key={link.href}>
            <a href={link.href} className={styles.link} onClick={handleLink}>
              {link.label}
            </a>
          </li>
        ))}
        <li>
          <Link to="/eventos" className={styles.ctaNav}>
            Teatro Terremoto
          </Link>
        </li>
      </ul>

      <button
        className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Menú"
      >
        <span /><span /><span />
      </button>
    </nav>
  )
}
