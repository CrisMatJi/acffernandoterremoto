import { useEffect, useRef, useState } from 'react'
import styles from './Noticias.module.css'

const WIDGET_ID = import.meta.env.VITE_BEHOLD_WIDGET_ID
const SKELETON_COUNT = 6

export default function Noticias() {
  const scriptRef  = useRef(null)
  const widgetRef  = useRef(null)
  const [loaded, setLoaded] = useState(false)

  // Carga el script de Behold
  useEffect(() => {
    if (!WIDGET_ID) return
    if (scriptRef.current) return

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

  // Detecta cuando Behold inyecta contenido en el custom element
  useEffect(() => {
    if (!WIDGET_ID) return
    const el = widgetRef.current
    if (!el) return

    const observer = new MutationObserver(() => {
      if (el.shadowRoot?.childElementCount || el.childElementCount) {
        setLoaded(true)
        observer.disconnect()
      }
    })
    observer.observe(el, { childList: true, subtree: true })

    // Fallback: tras 8s mostramos igualmente
    const fallback = setTimeout(() => setLoaded(true), 8000)

    return () => {
      observer.disconnect()
      clearTimeout(fallback)
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
          {!loaded && (
            <div className={styles.skeleton}>
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonShimmer} />
                </div>
              ))}
            </div>
          )}
          <behold-widget
            ref={widgetRef}
            feed-id={WIDGET_ID}
            className={loaded ? styles.widgetVisible : styles.widgetHidden}
          />
        </div>
      </div>
    </section>
  )
}
