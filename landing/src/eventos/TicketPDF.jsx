import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

// ── Paleta ───────────────────────────────────────────────────────────────────
const GOLD   = '#C9A84C'
const DARK   = '#0e0a0a'
const CREAM  = '#f5f0e8'
const MUTED  = '#b0a898'
const CREAM_BG = '#f5f0e8'

// Ticket apaisado 560 × 200 ptos (~198 × 70 mm)
const TICKET_W = 560
const TICKET_H = 200
const LEFT_W   = 148  // panel blanco del logo

const s = StyleSheet.create({
  page: {
    width:  TICKET_W,
    height: TICKET_H,
    backgroundColor: DARK,
    flexDirection: 'row',
    fontFamily: 'Helvetica',
  },

  // ─── Panel izquierdo (logo + asociación) ────────────────────────────────
  leftPanel: {
    width: LEFT_W,
    backgroundColor: CREAM_BG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
  },
  logoImg: {
    width: 118,
    height: 118,
    objectFit: 'contain',
  },

  // ─── Separador dorado ────────────────────────────────────────────────────
  separator: {
    width: 6,
    backgroundColor: GOLD,
  },

  // ─── Panel derecho (datos del evento) ────────────────────────────────────
  rightPanel: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  // Fila superior: título evento + caja asiento
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventBlock: {
    flex: 1,
    paddingRight: 12,
  },
  entradaLabel: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  eventName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 15,
    color: CREAM,
    letterSpacing: 0.4,
  },
  eventDate: {
    fontSize: 8,
    color: MUTED,
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // Caja de asiento
  seatBox: {
    border: `1pt solid ${GOLD}`,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 72,
  },
  seatLabel: {
    fontSize: 5.5,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  seatValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: CREAM,
    marginTop: 2,
    letterSpacing: 1,
  },

  // Separador fino
  divider: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(201,168,76,0.3)',
  },

  // Fila inferior: titular
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  holderName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: CREAM,
  },
  holderType: {
    fontSize: 7,
    color: MUTED,
    marginTop: 2,
    letterSpacing: 0.4,
  },
  validezLabel: {
    fontSize: 6.5,
    color: 'rgba(201,168,76,0.55)',
    letterSpacing: 0.5,
    fontFamily: 'Helvetica',
    textAlign: 'right',
  },
})

// ─── Helper: fecha en español ──────────────────────────────────────────────
const DIAS  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
const MESES = ['enero','febrero','marzo','abril','mayo','junio',
               'julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatFecha(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  return `${DIAS[d.getDay()].charAt(0).toUpperCase() + DIAS[d.getDay()].slice(1)}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TicketDocument({ session, asientos, logoUrl, fechaReserva }) {
  const seatDisplay    = asientos.join(' · ')
  const seatLabel      = asientos.length > 1 ? 'ASIENTOS' : 'ASIENTO'
  const nombreCompleto = session.type === 'socio'
    ? `${session.nombre} ${session.apellidos}`
    : session.nombre
  const tipoHolder     = session.type === 'socio'
    ? `SOCIO Nº ${session.n_socio}`
    : 'INVITADO'
  const fecha = [
    formatFecha(session.eventoFecha),
    session.eventoHora,
  ].filter(Boolean).join('  ·  ')

  const fechaReservaStr = fechaReserva
    ? (() => {
        const d = new Date(fechaReserva)
        const dd = String(d.getDate()).padStart(2,'0')
        const mm = String(d.getMonth()+1).padStart(2,'0')
        const yy = d.getFullYear()
        const hh = String(d.getHours()).padStart(2,'0')
        const min = String(d.getMinutes()).padStart(2,'0')
        return `Reservado el ${dd}/${mm}/${yy} a las ${hh}:${min}`
      })()
    : ''

  return (
    <Document title={`Entrada – ${session.eventoNombre}`} author="ACF Fernando Terremoto">
      <Page size={[TICKET_W, TICKET_H]} style={s.page}>

        {/* ── Panel izquierdo: solo logo (ya incluye el texto) ── */}
        <View style={s.leftPanel}>
          {logoUrl && (
            <Image src={logoUrl} style={s.logoImg} />
          )}
        </View>

        {/* ── Separador dorado ── */}
        <View style={s.separator} />

        {/* ── Panel derecho: datos ── */}
        <View style={s.rightPanel}>

          {/* Top: evento + asiento */}
          <View style={s.topRow}>
            <View style={s.eventBlock}>
              <Text style={s.entradaLabel}>Entrada</Text>
              <Text style={s.eventName}>{session.eventoNombre}</Text>
              {fecha ? <Text style={s.eventDate}>{fecha}</Text> : null}
            </View>
            <View style={s.seatBox}>
              <Text style={s.seatLabel}>{seatLabel}</Text>
              <Text style={s.seatValue}>{seatDisplay}</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Bottom: titular */}
          <View style={s.bottomRow}>
            <View>
              <Text style={s.holderName}>{nombreCompleto}</Text>
              <Text style={s.holderType}>{tipoHolder}</Text>
            </View>
            <Text style={s.validezLabel}>{fechaReservaStr}</Text>
          </View>

        </View>

      </Page>
    </Document>
  )
}
