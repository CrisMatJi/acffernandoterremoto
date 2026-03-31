import { useEffect, useRef } from 'react'
import styles from './Noticias.module.css'

const WIDGET_ID = import.meta.env.VITE_BEHOLD_WIDGET_ID

export default function Noticias() {
  const scriptRef = useRef(null)

  useEffect(() => {
    if (!WIDGET_ID) return
    if (scriptRef.current) return // ya cargado

    const script = document.createElement('script')
    script.src  = 'https://w.behold.so/widget.js'
    script.type = 'module'
    document.head.appendChild(script)
    scriptRef.current = script

    return () => {
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current)
        scriptRef.current = null
      }
    }
  }, [])

  if (!WIDGET_ID) return null

  return (
    <section id="noticias" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            <span>Síguenos en Instagram</span>
          </div>
          <h2 className={styles.heading}>
            Nuestras <em>noticias</em>
          </h2>
          <a
            href="https://www.instagram.com/acffterremoto"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.igLink}
          >
            @acffterremoto
          </a>
        </div>

        <div className={styles.feedWrap}>
          <behold-widget feed-id={WIDGET_ID} />
        </div>
      </div>
    </section>
  )
}
