import { useEffect, useRef } from 'react'
import styles from './VideoYoutube.module.css'

const VIDEO_ID = 'jLqetAua8AU'

export default function VideoYoutube() {
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
    <section id="video" className={styles.section}>
      <div className={styles.inner} ref={ref}>
        <div className={styles.header}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            <span>Experiencia flamenca</span>
          </div>
          <h2 className={styles.heading}>
            Vive el <em>flamenco</em>
          </h2>
        </div>

        <div className={styles.videoWrap}>
          <iframe
            className={styles.iframe}
            src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`}
            title="Peña Flamenca Fernando Terremoto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <p className={styles.caption}>
          Asociación Cultural Flamenca Fernando Terremoto · Jerez de la Frontera
        </p>
      </div>
    </section>
  )
}
