import { useState, useEffect, useRef } from 'react'
import styles from './Referentes.module.css'
import { pub } from '../pub'

const referentes = [
  {
    id: 'terremoto-de-jerez',
    nombre: 'Terremoto de Jerez',
    periodo: '1934 – 1981',
    imagen: '/images/terremoto.jpeg',
    paginas: [
      `Fernando Fernández Monje, conocido como "Terremoto de Jerez", fue un cantaor flamenco gitano nacido en Jerez de la Frontera en 1934 y fallecido el 6 de septiembre de 1981. Cantaor heterodoxo, destacó por bulerías y seguiriyas. Criado en el barrio de Santiago, está considerado la figura jerezana del cante más importante de la segunda mitad del siglo XX y uno de los mejores cantaores de la historia.

Inició sus primeros pasos como bailaor. Más tarde se decantó como cantaor, distinguiéndose con el sello único e inconfundible de su voz tan característica. En 1955 intervino en el rodaje de una película junto a Carmen Sevilla, y en 1958 grabó su primer disco, con cantes por bulerías, soleá y seguiriyas; dedicándose ya plenamente al cante, aunque sin abandonar su baile, con el que gustaba de rematar sus actuaciones por bulerías de Jerez.`,

      `Sus primeros discos los grabó en los años 60, acompañado por el guitarrista Manuel Morao. Su última producción "Sonidos negros" es una antología de sus cantes. Numerosos discos conservan la voz, el eco y el duende de su cante, que llevó su arte a todos los festivales andaluces, a los tablaos españoles y a los teatros, siendo al mismo tiempo cantaor de cantaores: sus primeros admiradores se contaban entre sus propios y más famosos compañeros, que solían escucharle con todo recogimiento al pie de los escenarios.

Estaba en posesión de varios premios otorgados por la Cátedra de Flamencología de Jerez: la Copa Jerez y el Premio Nacional de Cante de 1965; el Nombramiento de Caballero Cabal de la Orden Jonda en 1968; y el Premio El Gloria entregado en 1972.`,

      `Terremoto de Jerez dedicó al flamenco más de treinta años de vida profesional. Estaba casado con Isabel Pantoja Carpió y tenían tres hijos. Su hijo Fernando Fernández Pantoja "Terremoto hijo" falleció joven. Su nieta, María Terremoto, también es cantaora.

De familia de cantaores, heredó el nombre artístico "Terremoto de Jerez" de su hermano mayor Curro, que fue bailaor, perteneciendo a la llamada escuela del cante jerezano. El Ayuntamiento de Jerez le dedicó un monumento y rotuló una calle con su nombre. Anunciado para encabezar el cartel de la XV Fiesta de la Bulería, la fiesta se convirtió en su homenaje póstumo tras fallecer la madrugada del 5 al 6 de septiembre de 1981.`,
    ],
  },
  {
    id: 'fernando-terremoto',
    nombre: 'Fernando Terremoto',
    periodo: '1969 – 2010',
    imagen: '/images/fernando_terremoto_hijo.jpg',
    paginas: [
      `Fernando Fernández Pantoja, conocido artísticamente como "Fernando Terremoto", nació en Jerez de la Frontera el 11 de mayo de 1969 y falleció el 13 de febrero de 2010 a los 40 años, después de una larga enfermedad. Forma parte de la estirpe "Terremoto", heredada de su padre Fernando Fernández Monje, y que continúa su hija María.

Fernando se dedicó inicialmente al aprendizaje de la guitarra de la mano de Manuel Morao, y no fue hasta cumplir los veinte años cuando decidió dedicarse al cante. Debutó en la Peña Don Antonio Chacón de Jerez, acompañado por Manuel Moreno Junquera (Moraíto Chico), con una actuación que ha pasado a la historia del flamenco.`,

      `Llega a Madrid contratado por el tablao Zambra, compartiendo cartel con las primeras figuras del flamenco. En 1990 participa en la final del primer Concurso de la Comunidad Autónoma Andaluza. En 1996 le otorgan el Primer Premio de Cante del Concurso de Jóvenes Intérpretes de la IX Bienal de Flamenco de Sevilla y el Giraldillo de Sevilla. Desde entonces deja de figurar como "Terremoto hijo" para firmar como Fernando Terremoto.

En 1998 se presenta al Concurso Nacional de Arte Flamenco de Córdoba, consiguiendo las tres modalidades: "Manuel Torre" de Seguiriya y Tonás, "Niña de los Peines" de Soleá por Bulerías y Bulerías, y "Don Antonio Chacón" de Malagueñas y Taranto. En 2001 le otorgan la Copa de Jerez de la Cátedra de Flamencología.`,

      `Junto a Israel Galván y Alfredo Lago protagonizó durante varios años el espectáculo "La Edad de Oro", llenando todos los recintos donde se presentó por España y el mundo. Entre sus discos destacan La herencia de la sangre, Cantes de la campiña, Bahía y Sierra, Cosa Natural y su último trabajo "TERREMOTO", nominado al mejor disco de flamenco del año.

En 2004 fue nominado a los Premios Goya por la canción que interpretó para la película "Carmen" de Vicente Aranda. Organizó también la tradicional Zambomba de Navidad en el Teatro Villamarta, siendo su director artístico y autor de la música y letra de todos los villancicos presentados, un espectáculo que sigue siendo referente hasta hoy.`,
    ],
  },
  {
    id: 'maria-terremoto',
    nombre: 'María Terremoto',
    periodo: 'Jerez de la Frontera',
    imagen: '/images/maria_terremoto.jpg',
    paginas: [
      `María Terremoto es hija del cantaor Fernando Fernández Pantoja "Fernando Terremoto" y nieta del legendario cantaor Fernando Fernández Monge "Terremoto de Jerez". Comenzó a cantar a una edad temprana y se formó en la Fundación Cristina Heeren de Arte Flamenco en Sevilla. Debutó en el escenario a los 9 años en el Festival Flamenco de Jerez.

A los 9 años fue reclamada por su propio padre, Fernando Terremoto, para subir a las tablas de la peña flamenca que lleva su nombre. Ese día se produjo un momento trascendental: sin pretenderlo, Fernando pasaba el testigo artístico a su hija María en lo que sería su despedida definitiva de los escenarios.`,

      `En 2016 tiene lugar uno de los puntos de inflexión en su carrera: participa en la gala "Música para la investigación" protagonizada por Miguel Poveda en el Teatro Liceo de Barcelona y emitida por TVE, donde su actuación deja impresionada a toda la afición. Ese mismo año, en el Festival de Jerez, ofrece un recital que genera una alabanza de la crítica sin precedentes para una artista de su edad.

Su consagración llegó en la XIX Bienal de Flamenco de Sevilla de 2016, logrando el Giraldillo Revelación, siendo la artista más joven de la historia en conseguirlo, premio respaldado al año siguiente con la Venencia Flamenca como la artista joven con más proyección.`,

      `Entre sus premios destacan el Premio Cruzcampo a la mejor actuación en el Festival La Isla Ciudad Flamenca, Premio Ciudad de Jerez Joven 2019, Premio a Nuevos Creadores 2019 del Secretariado Gitano, Premio Radiolé 2022 y la Medalla de Oro de la Asociación Santo Ángel de la Policía de Jerez en 2023.

En septiembre de 2018 publica su primer disco 'La huella de mi Sentío', con el que recorre España, Europa y Estados Unidos. En 2022 pasa por la Expo de Dubai, realiza giras por EEUU, colabora con Tim Ries (Rolling Stones) y actúa en el New York City Center. Presenta su espectáculo 'Cantaora' con gran éxito en Sudamérica. En la actualidad recorre como primera figura los festivales más importantes a nivel nacional e internacional y dirige la Fiesta de La Bulería Joven de Jerez.`,
    ],
  },
]

export default function Referentes() {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.08 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="referentes" className={styles.section}>
      <SectionDivider />

      <div className={styles.inner} ref={ref}>
        <div className={styles.header}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            <span>Las figuras que nos inspiran</span>
          </div>
          <h2 className={styles.heading}>
            Nuestros <em>referentes</em>
          </h2>
        </div>

        <div className={styles.grid}>
          {referentes.map((r, i) => (
            <ReferenteCard key={r.id} referente={r} delay={i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ReferenteCard({ referente, delay }) {
  const [pagina, setPagina] = useState(0)
  const total = referente.paginas.length

  return (
    <article className={styles.card} style={{ animationDelay: `${delay}s` }}>
      <div className={styles.imageWrap}>
        <img src={pub(referente.imagen)} alt={referente.nombre} className={styles.cardImage} />
        <div className={styles.imageOverlay} />
      </div>

      <div className={styles.cardBody}>
        <p className={styles.periodo}>{referente.periodo}</p>
        <h3 className={styles.nombre}>{referente.nombre}</h3>
        <div className={styles.cardDivider} />

        <div className={styles.textWrap}>
          <p className={styles.descripcion}>{referente.paginas[pagina]}</p>
        </div>

        {/* Paginación */}
        <div className={styles.paginacion}>
          <button
            className={styles.pageBtn}
            onClick={() => setPagina(p => Math.max(0, p - 1))}
            disabled={pagina === 0}
            aria-label="Anterior"
          >
            ‹
          </button>

          <div className={styles.dots}>
            {referente.paginas.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${pagina === i ? styles.dotActive : ''}`}
                onClick={() => setPagina(i)}
                aria-label={`Página ${i + 1}`}
              />
            ))}
          </div>

          <button
            className={styles.pageBtn}
            onClick={() => setPagina(p => Math.min(total - 1, p + 1))}
            disabled={pagina === total - 1}
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>
      </div>
    </article>
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
