import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import styles from './Eventos.module.css'

export default function Eventos() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  useEffect(() => {
    async function fetchEventos() {
      const { data, error } = await supabase
        .from('eventos')
        .select('id, nombre, fecha, hora, activo, activo_invitado')
        .or('activo.eq.1,activo_invitado.eq.1')
        .order('fecha', { ascending: true })

      if (!error && data) setEventos(data)
      setLoading(false)
    }
    fetchEventos()
  }, [])

  useEffect(() => {
    if (loading || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [loading])

  return (
    <section id="eventos" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            <span>Agenda</span>
          </div>
          <h2 className={styles.heading}>
            Próximos <em>Eventos</em>
          </h2>
          <p className={styles.subheading}>
            Vive el flamenco en su estado más puro
          </p>
        </div>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : eventos.length === 0 ? (
          <div className={styles.empty} ref={ref}>
            <div className={styles.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="4" y="7" width="32" height="29" rx="2" />
                <line x1="13" y1="4" x2="13" y2="10" />
                <line x1="27" y1="4" x2="27" y2="10" />
                <line x1="4" y1="16" x2="36" y2="16" />
                <line x1="13" y1="24" x2="27" y2="24" strokeOpacity="0.4" />
              </svg>
            </div>
            <p className={styles.emptyTitle}>No hay eventos próximos</p>
            <p className={styles.emptyText}>
              Próximamente anunciaremos nuevas actuaciones.<br />
              Visita esta página para estar al tanto.
            </p>
          </div>
        ) : (
          <div className={styles.grid} ref={ref}>
            {eventos.map((evento, i) => (
              <EventCard key={evento.id} evento={evento} index={i} />
            ))}
          </div>
        )}

        <div className={styles.cta}>
          <a href="/eventos" className={styles.ctaBtn}>
            <span>Ver todos los eventos y reservar</span>
            <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  )
}

function EventCard({ evento, index }) {
  const fecha = new Date(evento.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className={styles.card} style={{ animationDelay: `${index * 0.15}s` }}>
      <div className={styles.cardTop}>
        <span className={styles.cardType}>
          {evento.activo_invitado ? 'Invitados' : 'Acceso anticipado para socios'}
        </span>
        <div className={styles.cardDate}>
          <CalendarIcon />
          <span>{fecha}</span>
          <span className={styles.dot}>·</span>
          <ClockIcon />
          <span>{evento.hora}</span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{evento.nombre}</h3>
      </div>

      <div className={styles.cardFooter}>
        <a href="/eventos" className={styles.reserveBtn}>
          Reservar plaza
        </a>
        <div className={styles.cardAccent} />
      </div>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="2" width="10" height="9" rx="1" />
      <line x1="4" y1="1" x2="4" y2="3" />
      <line x1="8" y1="1" x2="8" y2="3" />
      <line x1="1" y1="5" x2="11" y2="5" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="6" cy="6" r="5" />
      <polyline points="6,3 6,6 8,7" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="2" y1="8" x2="13" y2="8" />
      <polyline points="9,4 13,8 9,12" />
    </svg>
  )
}
