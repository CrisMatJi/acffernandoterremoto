import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { supabaseAdmin } from '../supabase'
import s from './admin.module.css'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const IconExcel = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }}>
    <rect width="24" height="24" rx="3" fill="#1D6F42"/>
    <path d="M7 7l3.5 5L7 17h2.5l2.25-3.5L14 17h2.5l-3.5-5 3.5-5H14l-2.25 3.5L9.5 7H7z" fill="white"/>
  </svg>
)

export default function Reservas() {
  const [eventos,    setEventos]    = useState([])
  const [eventoId,   setEventoId]   = useState('')
  const [reservas,   setReservas]   = useState([])
  const [loadingEv,  setLoadingEv]  = useState(true)
  const [loadingRes, setLoadingRes] = useState(false)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    supabaseAdmin
      .from('eventos')
      .select('id, nombre, fecha')
      .order('fecha', { ascending: false })
      .then(({ data }) => { setEventos(data ?? []); setLoadingEv(false) })
  }, [])

  async function fetchReservas(id) {
    setLoadingRes(true)
    const { data } = await supabaseAdmin
      .from('reserva')
      .select('id, asiento_id, socio_id, invitado_id, nombre_apellidos, created_at')
      .eq('evento_id', id)
      .order('created_at', { ascending: true })
    setReservas(data ?? [])
    setLoadingRes(false)
  }

  function handleEventoChange(e) {
    const id = e.target.value
    setEventoId(id)
    if (id) fetchReservas(id)
    else setReservas([])
  }

  async function cancelar(reserva) {
    if (!confirm(`¿Cancelar la reserva de ${reserva.nombre_apellidos} (${reserva.asiento_id})?`)) return
    setCancelling(reserva.id)
    await supabaseAdmin.from('reserva').delete().eq('id', reserva.id)
    setCancelling(null)
    fetchReservas(eventoId)
  }

  function exportExcel() {
    const eventoNombre = eventos.find(e => String(e.id) === String(eventoId))?.nombre ?? eventoId
    const filas = reservas.map(r => ({
      'Nombre':          r.nombre_apellidos ?? '',
      'Tipo':            r.socio_id ? 'Socio' : 'Invitado',
      'Nº Socio / DNI': r.socio_id ?? r.invitado_id ?? '',
      'Asiento':         r.asiento_id ?? '',
      'Fecha reserva':   r.created_at ? new Date(r.created_at).toLocaleString('es-ES') : '',
    }))
    const ws = XLSX.utils.json_to_sheet(filas)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reservas')
    XLSX.writeFile(wb, `reservas-${eventoNombre.replace(/\s+/g, '-')}.xlsx`)
  }

  const eventoNombre = eventos.find(e => String(e.id) === String(eventoId))?.nombre ?? ''

  return (
    <div className={s.section}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>
          Reservas
          {reservas.length > 0 && <span>({reservas.length})</span>}
        </h2>
        {reservas.length > 0 && (
          <button className={s.btnExcel} onClick={exportExcel}>
            <IconExcel />Exportar a Excel
          </button>
        )}
      </div>

      <div style={{ maxWidth: 420 }}>
        <label className={s.label} style={{ display: 'block', marginBottom: '0.4rem' }}>
          Selecciona una actuación
        </label>
        {loadingEv ? (
          <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
            Cargando actuaciones…
          </p>
        ) : (
          <select className={s.select} value={eventoId} onChange={handleEventoChange}>
            <option value="">— Selecciona —</option>
            {eventos.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.nombre}{ev.fecha ? ` · ${ev.fecha}` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {eventoId && (
        <div className={s.tableWrap}>
          {loadingRes ? (
            <p className={s.empty}>Cargando reservas…</p>
          ) : reservas.length === 0 ? (
            <p className={s.empty}>No hay reservas para esta actuación.</p>
          ) : (
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>ID / DNI</th>
                  <th>Asiento(s)</th>
                  <th>Fecha reserva</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(r => (
                  <tr key={r.id}>
                    <td>{r.nombre_apellidos ?? '—'}</td>
                    <td>
                      <span className={`${s.badge} ${r.socio_id ? s.badgeOn : s.badgeOff}`}>
                        {r.socio_id ? 'Socio' : 'Invitado'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {r.socio_id ?? r.invitado_id ?? '—'}
                    </td>
                    <td><strong>{r.asiento_id}</strong></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {fmtDate(r.created_at)}
                    </td>
                    <td>
                      <button
                        className={s.btnDanger}
                        onClick={() => cancelar(r)}
                        disabled={cancelling === r.id}
                      >
                        {cancelling === r.id ? '…' : 'Cancelar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
