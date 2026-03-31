import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import emailjs from '@emailjs/browser'
import styles from './Contacto.module.css'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const MAPS_URL = 'https://maps.google.com/?q=C.+Terremoto+de+Jerez,+1,+11406+Jerez+de+la+Frontera,+C%C3%A1diz'

export default function Contacto() {
  const ref     = useRef(null)
  const formRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | sending | ok | error

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

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const form = formRef.current
    // Sincronizar campos ocultos requeridos por la plantilla
    form.elements['name'].value    = form.elements['from_name'].value
    form.elements['reply_to'].value = form.elements['from_email'].value
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form, { publicKey: PUBLIC_KEY })
      setStatus('ok')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contacto" className={styles.section}>
      <div className={styles.bgArt} aria-hidden="true">
        <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" className={styles.artSvg}>
          <circle cx="300" cy="200" r="280" stroke="rgba(201,168,76,0.04)" strokeWidth="1" fill="none" />
          <circle cx="300" cy="200" r="220" stroke="rgba(201,168,76,0.06)" strokeWidth="1" fill="none" />
          <circle cx="300" cy="200" r="160" stroke="rgba(201,168,76,0.08)" strokeWidth="1" fill="none" />
          <circle cx="300" cy="200" r="80"  stroke="rgba(201,168,76,0.1)"  strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className={styles.inner} ref={ref}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelLine} />
            <span>Contáctanos</span>
          </div>
          <h2 className={styles.heading}>
            Ven a <em>visitarnos</em>
          </h2>
          <p className={styles.subtitle}>
            Únete a nuestra familia flamenca. Estamos en el corazón de Jerez.
          </p>
        </div>

        {/* Content: info + form */}
        <div className={styles.content}>
          {/* Left: contact info */}
          <div className={styles.info}>
            <ContactCard
              icon={<EmailIcon />}
              label="Correo electrónico"
              value="info@acffernandoterremoto.es"
              href="mailto:info@acffernandoterremoto.es"
            />
            <ContactCard
              icon={<LocationIcon />}
              label="Dónde estamos"
              value="C. Terremoto de Jerez, 1 · Jerez de la Frontera"
              href={MAPS_URL}
              external
            />
            <ContactCard
              icon={<InstagramIcon />}
              label="Instagram"
              value="@acffterremoto"
              href="https://www.instagram.com/acffterremoto/"
              external
            />
            <ContactCard
              icon={<FacebookIcon />}
              label="Facebook"
              value="ACF Fernando Terremoto"
              href="https://www.facebook.com/profile.php?id=61556623589504"
              external
            />
          </div>

          {/* Right: contact form */}
          <div className={styles.formWrap}>
            {status === 'ok' ? (
              <div className={styles.successMsg}>
                <span className={styles.successIcon}>✓</span>
                <p>¡Mensaje enviado correctamente!</p>
                <p className={styles.successSub}>Te responderemos lo antes posible.</p>
                <button className={styles.resetBtn} onClick={() => setStatus('idle')}>
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className={styles.form} noValidate>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="from_name">Nombre</label>
                    <input
                      id="from_name"
                      name="from_name"
                      type="text"
                      className={styles.input}
                      placeholder="Tu nombre"
                      required
                    />
                    {/* campo 'name' duplicado requerido por la plantilla */}
                    <input type="hidden" name="name" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="from_email">Correo</label>
                    <input
                      id="from_email"
                      name="from_email"
                      type="email"
                      className={styles.input}
                      placeholder="tu@email.com"
                      required
                    />
                    {/* reply_to con el mismo valor que from_email */}
                    <input type="hidden" name="reply_to" />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="subject">Asunto</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    className={styles.input}
                    placeholder="Motivo de tu consulta"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="message">Mensaje</label>
                  <textarea
                    id="message"
                    name="message"
                    className={styles.textarea}
                    placeholder="¿En qué podemos ayudarte?"
                    rows={5}
                    required
                  />
                </div>
                {status === 'error' && (
                  <p className={styles.errorMsg}>
                    No se pudo enviar el mensaje. Inténtalo de nuevo.
                  </p>
                )}
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Reserva CTA */}
        <div className={styles.reservaCta}>
          <div className={styles.reservaInner}>
            <p className={styles.reservaText}>
              ¿Quieres reservar tu asiento para el próximo evento?
            </p>
            <Link to="/eventos" className={styles.reservaBtn}>
              Acceder a Teatro Terremoto
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactCard({ icon, label, value, href, external }) {
  return (
    <a
      href={href}
      className={styles.card}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <div className={styles.cardIcon}>{icon}</div>
      <div className={styles.cardContent}>
        <span className={styles.cardLabel}>{label}</span>
        <span className={styles.cardValue}>{value}</span>
      </div>
      <div className={styles.cardArrow}>→</div>
    </a>
  )
}

function EmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="18" height="13" rx="2" />
      <polyline points="2,5 11,13 20,5" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.5 1H3a2 2 0 0 0-2 2 16 16 0 0 0 16 16 2 2 0 0 0 2-2v-3.5l-4-1.5-1.5 1.5a11 11 0 0 1-5-5L10 7 8.5 3 6.5 1z" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 2a7 7 0 0 1 7 7c0 5-7 12-7 12S4 14 4 9a7 7 0 0 1 7-7z" />
      <circle cx="11" cy="9" r="2.5" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}
