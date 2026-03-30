import { useEffect, useRef } from 'react'
import styles from './JuntaDirectiva.module.css'

// id  → nombre de fichero base en /images/junta/
// Si el miembro no tiene variante -bn/-color se especifica bnFile/colorFile directamente
const miembros = [
  {
    id: 'paco-suarez',
    nombre: 'Don Francisco Ruiz Suárez',
    cargo: 'Presidencia y Secretaría',
  },
  {
    id: 'don-manuel-blanco',
    nombre: 'Don Manuel Blanco Abucha',
    cargo: 'Vicepresidencia',
    bnFile:    '/images/junta/don-manuel-blanco.png',
    colorFile: '/images/junta/don-manuel-blanco.png',
  },
  {
    id: 'manuel-moreno-rpublicas',
    nombre: 'Don Manuel Moreno Román',
    cargo: 'Relaciones Públicas',
  },
  {
    id: 'juan-angel-tesoreria',
    nombre: 'Don Juan Ángel Blanco Abucha',
    cargo: 'Tesorería',
  },
  {
    id: 'praxedes',
    nombre: 'Don Práxedes Neira Gómez',
    cargo: 'Vocal',
  },
  {
    id: 'fernando-vocal',
    nombre: 'Don Fernando Blanco Fernández',
    cargo: 'Vocal',
  },
  {
    id: 'juan-jose-vocal',
    nombre: 'Don Juan José Ruiz Suárez',
    cargo: 'Vocal',
  },
  {
    id: 'antonio-morion',
    nombre: 'Don Antonio Morión Ruiz',
    cargo: 'Vocal',
  },
  {
    id: 'porto',
    nombre: 'Don Antonio Martínez Porto',
    cargo: 'Vocal',
  },
  {
    id: 'diaz-borrego',
    nombre: 'Don Antonio León Díaz-Borrego',
    cargo: 'Vocal',
  },
  {
    id: 'fernando-morion',
    nombre: 'Don Fernando Morión Fernández',
    cargo: 'Vocal',
  },
  {
    id: 'miguel-cabral',
    nombre: 'Miguel Ángel Cabral Román',
    cargo: 'Vocal',
  },
]

export default function JuntaDirectiva() {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.05 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="junta" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            <span>Junta Directiva</span>
          </div>
          <h2 className={styles.heading}>
            Las personas que hacen <em>posible nuestra asociación</em>
          </h2>
          <p className={styles.subtitle}>
            Pasa el cursor sobre cada miembro para descubrirlos
          </p>
        </div>

        <div className={styles.grid} ref={ref}>
          {miembros.map((m, i) => (
            <MemberCard key={m.id} miembro={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function MemberCard({ miembro, index }) {
  const bnSrc    = miembro.bnFile    ?? `/images/junta/${miembro.id}-bn.png`
  const colorSrc = miembro.colorFile ?? `/images/junta/${miembro.id}-color.png`

  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className={styles.imgWrap}>
        <img
          src={bnSrc}
          alt={miembro.nombre}
          className={`${styles.img} ${styles.imgBn}`}
          onError={e => { e.target.style.display = 'none' }}
        />
        <img
          src={colorSrc}
          alt=""
          className={`${styles.img} ${styles.imgColor}`}
          onError={e => { e.target.style.display = 'none' }}
        />
        <div className={styles.imgOverlay} />
      </div>
      <div className={styles.info}>
        <span className={styles.cargo}>{miembro.cargo}</span>
        <span className={styles.nombre}>{miembro.nombre}</span>
      </div>
    </div>
  )
}
