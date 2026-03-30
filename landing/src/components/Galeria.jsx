import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './Galeria.module.css'

const fotos = [
  { src: '/images/galeria/galeria-1.png',   alt: 'Momento flamenco 1' },
  { src: '/images/galeria/galeria-2.png',   alt: 'Momento flamenco 2' },
  { src: '/images/galeria/galeria-3.png',   alt: 'Momento flamenco 3' },
  { src: '/images/galeria/galeria-4.png',   alt: 'Momento flamenco 4' },
  { src: '/images/galeria/galeria-5.png',   alt: 'Momento flamenco 5' },
  { src: '/images/galeria/galeria-6.png',   alt: 'Momento flamenco 6' },
  { src: '/images/galeria/galeria-7.png',   alt: 'Momento flamenco 7' },
  { src: '/images/galeria/galeria-8.png',   alt: 'Momento flamenco 8' },
  { src: '/images/galeria/galeria-9.png',   alt: 'Momento flamenco 9' },
  { src: '/images/galeria/galeria-10.png',  alt: 'Momento flamenco 10' },
  { src: '/images/galeria/galeria-11.jpeg', alt: 'Momento flamenco 11' },
]

const AUTOPLAY_MS = 4500

export default function Galeria() {
  const [current, setCurrent]   = useState(0)
  const [prev, setPrev]         = useState(null)
  const [fading, setFading]     = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [paused, setPaused]     = useState(false)
  const thumbsRef               = useRef(null)
  const timerRef                = useRef(null)

  const goTo = useCallback((idx) => {
    if (idx === current || fading) return
    setPrev(current)
    setFading(true)
    setCurrent(idx)
    setTimeout(() => { setPrev(null); setFading(false) }, 800)
  }, [current, fading])

  const next = useCallback(() => goTo((current + 1) % fotos.length), [current, goTo])
  const prev_ = useCallback(() => goTo((current - 1 + fotos.length) % fotos.length), [current, goTo])

  // Autoplay
  useEffect(() => {
    if (paused || lightbox !== null) return
    timerRef.current = setTimeout(next, AUTOPLAY_MS)
    return () => clearTimeout(timerRef.current)
  }, [current, paused, lightbox, next])

  // Scroll thumbnail activa al centro (solo horizontal, sin mover la página)
  useEffect(() => {
    const container = thumbsRef.current
    const el = container?.children[current]
    if (!container || !el) return
    const target = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
    container.scrollTo({ left: target, behavior: 'smooth' })
  }, [current])

  // Teclado
  useEffect(() => {
    const onKey = (e) => {
      if (lightbox !== null) {
        if (e.key === 'Escape')     setLightbox(null)
        if (e.key === 'ArrowRight') setLightbox(i => (i + 1) % fotos.length)
        if (e.key === 'ArrowLeft')  setLightbox(i => (i - 1 + fotos.length) % fotos.length)
      } else {
        if (e.key === 'ArrowRight') next()
        if (e.key === 'ArrowLeft')  prev_()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, next, prev_])

  return (
    <section id="galeria" className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.sectionLabel}>
          <span className={styles.labelLine} />
          <span>Galería</span>
        </div>
        <h2 className={styles.heading}>
          Momentos <em>flamencos</em>
        </h2>
      </div>

      {/* Carrusel principal */}
      <div className={styles.stageWrap}>
      <div
        className={styles.stage}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Capa saliente (fade-out) */}
        {prev !== null && (
          <div className={`${styles.slide} ${styles.slideOut}`}>
            <img src={fotos[prev].src} alt={fotos[prev].alt} className={styles.slideImg} />
          </div>
        )}

        {/* Capa entrante */}
        <div
          className={`${styles.slide} ${styles.slideIn}`}
          key={current}
        >
          <img
            src={fotos[current].src}
            alt={fotos[current].alt}
            className={styles.slideImg}
          />
        </div>

        {/* Gradiente inferior */}
        <div className={styles.gradient} />

        {/* Contador */}
        <div className={styles.counter}>
          <span className={styles.counterCurrent}>{String(current + 1).padStart(2, '0')}</span>
          <span className={styles.counterSep} />
          <span className={styles.counterTotal}>{String(fotos.length).padStart(2, '0')}</span>
        </div>

        {/* Flechas */}
        <button className={`${styles.arrow} ${styles.arrowL}`} onClick={prev_} aria-label="Anterior">
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="9,1 1,9 9,17" />
          </svg>
        </button>
        <button className={`${styles.arrow} ${styles.arrowR}`} onClick={next} aria-label="Siguiente">
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="1,1 9,9 1,17" />
          </svg>
        </button>

        {/* Barra de progreso autoplay */}
        {!paused && (
          <div className={styles.progressBar} key={`${current}-progress`}>
            <div className={styles.progressFill} style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />
          </div>
        )}

        {/* Click para lightbox */}
        <div className={styles.clickZone} onClick={() => setLightbox(current)} title="Ver ampliada" />
      </div>

      {/* Tira de miniaturas */}
      <div className={styles.thumbsWrap}>
        <div className={styles.thumbs} ref={thumbsRef}>
          {fotos.map((f, i) => (
            <button
              key={i}
              className={`${styles.thumb} ${i === current ? styles.thumbActive : ''}`}
              onClick={() => goTo(i)}
              aria-label={f.alt}
            >
              <img src={f.src} alt={f.alt} className={styles.thumbImg} />
              {i === current && <div className={styles.thumbOverlay} />}
            </button>
          ))}
        </div>
      </div>
      </div>{/* stageWrap */}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lbClose} onClick={() => setLightbox(null)}>✕</button>
          <button
            className={`${styles.lbArrow} ${styles.lbPrev}`}
            onClick={e => { e.stopPropagation(); setLightbox(i => (i - 1 + fotos.length) % fotos.length) }}
          >‹</button>
          <img
            src={fotos[lightbox].src}
            alt={fotos[lightbox].alt}
            className={styles.lbImg}
            onClick={e => e.stopPropagation()}
          />
          <button
            className={`${styles.lbArrow} ${styles.lbNext}`}
            onClick={e => { e.stopPropagation(); setLightbox(i => (i + 1) % fotos.length) }}
          >›</button>
          <div className={styles.lbCounter}>{lightbox + 1} / {fotos.length}</div>
        </div>
      )}
    </section>
  )
}
