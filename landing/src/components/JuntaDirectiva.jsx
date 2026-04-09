import { useEffect, useRef } from 'react'
import styles from './JuntaDirectiva.module.css'
import { pub } from '../pub'

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
    id: 'juan-vargas-prado',
    nombre: 'D. Juan Vargas Prado',
    cargo: 'Adjunto a Relaciones Públicas',
    bnFile:    '/images/junta/juan_vargas_prado.jpg',
    colorFile: '/images/junta/juan_vargas_prado.jpg',
  },
  {
    id: 'fernando-vocal',
    nombre: 'Don Fernando Blanco Fernández',
    cargo: 'Vocal',
  },
  {
    id: 'angeles-gomez',
    nombre: 'Ángeles Gómez Sánchez',
    cargo: 'Vocal',
    bnFile:    '/images/junta/angeles_gomez_sanchez.jpg',
    colorFile: '/images/junta/angeles_gomez_sanchez.jpg',
  },
  {
    id: 'sonia-vargas',
    nombre: 'Sonia Vargas Rodríguez',
    cargo: 'Vocal',
    bnFile:    '/images/junta/sonia_vargas.jpg',
    colorFile: '/images/junta/sonia_vargas.jpg',
  },
  {
    id: 'alejandro-benitez',
    nombre: 'Alejandro Benítez Escobar',
    cargo: 'Vocal',
    bnFile:    '/images/junta/alejandro_benitez_escobar.jpg',
    colorFile: '/images/junta/alejandro_benitez_escobar.jpg',
  },
  {
    id: 'miguel-cabral',
    nombre: 'Miguel Ángel Cabral Román',
    cargo: 'Vocal',
  },
  {
    id: 'juan-antonio-abucha',
    nombre: 'Juan Antonio Abucha',
    cargo: 'Gestor de Redes Sociales',
    bnFile:    '/images/junta/juan_Antonio_Abucha.jpeg',
    colorFile: '/images/junta/juan_Antonio_Abucha.jpeg',
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
  const bnSrc    = miembro.bnFile    ? pub(miembro.bnFile)    : pub(`/images/junta/${miembro.id}-bn.png`)
  const colorSrc = miembro.colorFile ? pub(miembro.colorFile) : pub(`/images/junta/${miembro.id}-color.png`)

  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className={styles.imgWrap}>
        <img
          key={bnSrc}
          src={bnSrc}
          alt={miembro.nombre}
          className={`${styles.img} ${styles.imgBn}`}
        />
        <img
          key={colorSrc}
          src={colorSrc}
          alt=""
          className={`${styles.img} ${styles.imgColor}`}
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
