import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

export default function Hero() {
  const titleRef = useRef(null)

  useEffect(() => {
    // Staggered reveal animation on mount
    const el = titleRef.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(30px)'
    const t = setTimeout(() => {
      el.style.transition = 'opacity 1.2s ease, transform 1.2s var(--ease-out)'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <section id="hero" className={styles.hero}>
      {/* Background image with overlay */}
      <div className={styles.bgWrap}>
        <img
          src="/images/lobby_background.png"
          alt=""
          className={styles.bgImage}
        />
        <div className={styles.bgOverlay} />
        <div className={styles.bgGradient} />
      </div>

      {/* Decorative top border */}
      <div className={styles.topBorder} />

      {/* Content */}
      <div className={styles.content} ref={titleRef}>
        <div className={styles.eyebrow}>
          <OrnamentLeft />
          <span>Jerez de la Frontera</span>
          <OrnamentRight />
        </div>

        <h1 className={styles.title}>
          <span className={styles.titleLine1}>Asociación Cultural Flamenca</span>
          <span className={styles.titleLine2}>Fernando Terremoto</span>
        </h1>

        <p className={styles.subtitle}>
          La mejor peña flamenca de la ciudad
        </p>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <FlamencoRose />
          <span className={styles.dividerLine} />
        </div>

        <div className={styles.actions}>
          <a href="#eventos" className={styles.btnSecondary}>
            Próximos Eventos
          </a>
          <a href="/eventos" className={styles.btnPrimary}>
            Reservar Entradas
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollHint}>
        <div className={styles.scrollLine} />
        <span>Descubre más</span>
      </div>
    </section>
  )
}

function OrnamentLeft() {
  return (
    <svg width="40" height="8" viewBox="0 0 40 8" fill="none">
      <line x1="0" y1="4" x2="32" y2="4" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="36" cy="4" r="2" fill="currentColor" />
      <circle cx="40" cy="4" r="1" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

function OrnamentRight() {
  return (
    <svg width="40" height="8" viewBox="0 0 40 8" fill="none">
      <circle cx="0" cy="4" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="4" cy="4" r="2" fill="currentColor" />
      <line x1="8" y1="4" x2="40" y2="4" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  )
}

function FlamencoRose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <ellipse
          key={i}
          cx="12"
          cy="12"
          rx="2.5"
          ry="5"
          fill="var(--gold)"
          opacity={0.7 + i * 0.037}
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="2" fill="var(--gold)" />
    </svg>
  )
}
