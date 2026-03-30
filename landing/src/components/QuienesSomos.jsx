import { useEffect, useRef } from 'react'
import styles from './QuienesSomos.module.css'

export default function QuienesSomos() {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="quienes-somos" className={styles.section}>
      <SectionDivider />

      <div className={styles.container} ref={ref}>
        <div className={styles.imageCol}>
          <div className={styles.imageFrame}>
            <img
              src="/images/terremoto.jpeg"
              alt="Fernando Terremoto"
              className={styles.portrait}
            />
            <div className={styles.imageAccent} />
          </div>
          <div className={styles.imageCaption}>
            <span className={styles.captionLine} />
            <p>Fernando Terremoto</p>
            <p className={styles.captionSub}>El gran cantaor gaditano</p>
          </div>
        </div>

        <div className={styles.textCol}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            <span>Sobre nosotros</span>
          </div>

          <h2 className={styles.heading}>
            ¿Quiénes
            <br />
            <em>somos?</em>
          </h2>

          <p className={styles.body}>
            Somos una peña flamenca fundada en honor al gran cantaor{' '}
            <strong>Fernando Terremoto</strong>. Nuestro objetivo es promover y
            difundir el arte flamenco a través de espectáculos, talleres y
            actividades culturales.
          </p>

          <p className={styles.body}>
            Desde nuestra fundación, hemos sido un punto de encuentro para
            los amantes del flamenco en Jerez de la Frontera, preservando la
            pureza de este arte patrimonio de la humanidad.
          </p>

        </div>
      </div>
    </section>
  )
}

function SectionDivider() {
  return (
    <div className={styles.divider}>
      <span className={styles.dividerLine} />
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {[0, 60, 120, 180, 240, 300].map((a, i) => (
          <ellipse
            key={i}
            cx="14" cy="14" rx="2" ry="5.5"
            fill="var(--gold)"
            opacity="0.65"
            transform={`rotate(${a} 14 14)`}
          />
        ))}
        <circle cx="14" cy="14" r="2" fill="var(--gold)" />
      </svg>
      <span className={styles.dividerLine} />
    </div>
  )
}
