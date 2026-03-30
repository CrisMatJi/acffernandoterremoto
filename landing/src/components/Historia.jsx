import { useState, useEffect, useRef } from 'react'
import styles from './Historia.module.css'

// ─── CONTENIDO ────────────────────────────────────────────────────────────────
// Sustituye estos textos con el contenido real de la web cuando lo tengas
const capitulos = [
  {
    id: 'figura',
    titulo: 'Fernando Terremoto',
    subtitulo: 'El cantaor que nos inspira',
    texto: `Fernando Fernández Pantoja "Fernando Terremoto" (Jerez de la Frontera, 1934–1981)
    fue uno de los cantaores más sobresalientes del flamenco jerezano del siglo XX. Heredero
    de la más honda tradición gitana de la calle Nueva, su voz encarnaba la esencia del cante
    jondo en estado puro. Su profundidad, su quejío y su verdad flamenca le granjearon el
    reconocimiento de los más grandes entendidos y el amor incondicional del pueblo de Jerez.`,
  },
  {
    id: 'fundacion',
    titulo: 'Los orígenes',
    subtitulo: 'El nacimiento de la peña',
    texto: `La Asociación Cultural Flamenca Fernando Terremoto nació del impulso de un grupo
    de aficionados jerezanos que querían honrar la memoria del gran cantaor y mantener viva
    la llama del flamenco puro de Jerez. Desde sus primeros días, la peña se convirtió en
    punto de encuentro esencial para aficionados, artistas y familias unidas por el amor
    al cante jondo. La sede social abrió sus puertas con la vocación de ser un hogar
    para el flamenco más genuino.`,
  },
  {
    id: 'trayectoria',
    titulo: 'Décadas de historia',
    subtitulo: 'Más de treinta años de flamenco',
    texto: `A lo largo de más de tres décadas, la Asociación ha organizado centenares de
    actuaciones, recitales, veladas flamencas y jornadas culturales que han contribuido
    a difundir y preservar este arte en toda su pureza. Artistas de primer orden nacional
    e internacional han pisado nuestro escenario, dejando momentos imborrables en la
    memoria de socios y aficionados. La peña se ha consolidado como referente
    indiscutible del flamenco jerezano.`,
  },
  {
    id: 'actividad',
    titulo: 'Nuestra actividad',
    subtitulo: 'Cante, baile y toque',
    texto: `La asociación organiza a lo largo del año un programa estable de actividades:
    veladas flamencas con artistas invitados, actuaciones especiales en fechas señaladas,
    encuentros con jóvenes valores del flamenco jerezano y participación en los
    principales festivales de la ciudad. Cada evento es un espacio donde el flamenco
    se vive con la intensidad y el respeto que merece, fiel a la pureza del arte
    que Fernando Terremoto encarnó.`,
  },
  {
    id: 'mision',
    titulo: 'Nuestra misión',
    subtitulo: 'Preservar y difundir',
    texto: `La Asociación sigue fiel a sus principios fundacionales: promover y difundir
    el arte flamenco en todas sus expresiones —cante, baile y toque—, fomentar la
    cultura andaluza y jerezana, y honrar la memoria del gran Fernando Terremoto.
    Con especial atención a los nuevos talentos, trabajamos para que las generaciones
    futuras reciban este patrimonio vivo. Nuestras puertas están abiertas a socios,
    aficionados e invitados que compartan la pasión por el flamenco más auténtico.`,
  },
]

export default function Historia() {
  const [activo, setActivo] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="historia" className={styles.section}>
      <div className={styles.inner} ref={ref}>
        <div className={styles.header}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            <span>Historia de la peña</span>
          </div>
          <h2 className={styles.heading}>
            Nuestra <em>historia</em>
          </h2>
        </div>

        <div className={styles.layout}>
          {/* Sidebar de navegación */}
          <nav className={styles.nav}>
            {capitulos.map((c, i) => (
              <button
                key={c.id}
                className={`${styles.navItem} ${activo === i ? styles.navActive : ''}`}
                onClick={() => setActivo(i)}
              >
                <span className={styles.navNum}>0{i + 1}</span>
                <div className={styles.navText}>
                  <span className={styles.navTitulo}>{c.titulo}</span>
                  <span className={styles.navSub}>{c.subtitulo}</span>
                </div>
                <span className={styles.navArrow}>›</span>
              </button>
            ))}
          </nav>

          {/* Panel de contenido */}
          <div className={styles.content} key={activo}>
            <div className={styles.contentNumber}>0{activo + 1}</div>
            <h3 className={styles.contentTitle}>{capitulos[activo].titulo}</h3>
            <p className={styles.contentText}>{capitulos[activo].texto}</p>

            {/* Imagen decorativa lateral */}
            <div className={styles.contentDeco}>
              <img
                src="/images/fernando_terremoto.jpg"
                alt="Fernando Terremoto"
                className={styles.decoImg}
              />
              <div className={styles.decoFrame} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
