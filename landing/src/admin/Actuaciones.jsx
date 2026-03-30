import { useState, useEffect } from 'react'
import { supabaseAdmin } from '../supabase'
import s from './admin.module.css'

const EMPTY = { nombre: '', fecha: '', hora: '', activo: 0, activo_invitado: 0 }

function fmtFecha(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Actuaciones() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  async function fetchItems() {
    setLoading(true)
    const { data, error } = await supabaseAdmin
      .from('eventos')
      .select('*')
      .order('fecha', { ascending: false })
    if (!error) setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  function openCreate() {
    setForm(EMPTY); setError('')
    setModal({ mode: 'create' })
  }

  function openEdit(item) {
    setForm({
      nombre: item.nombre ?? '', fecha: item.fecha ?? '',
      hora: item.hora ?? '', activo: item.activo ?? 0,
      activo_invitado: item.activo_invitado ?? 0,
    })
    setError('')
    setModal({ mode: 'edit', id: item.id })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setError('')
    const payload = {
      nombre: form.nombre.trim(), fecha: form.fecha,
      hora: form.hora, activo: form.activo ? 1 : 0,
      activo_invitado: form.activo_invitado ? 1 : 0,
    }
    let err
    if (modal.mode === 'create') {
      ;({ error: err } = await supabaseAdmin.from('eventos').insert(payload))
    } else {
      ;({ error: err } = await supabaseAdmin.from('eventos').update(payload).eq('id', modal.id))
    }
    setSaving(false)
    if (err) { setError(err.message); return }
    setModal(null); fetchItems()
  }

  async function toggleField(item, field) {
    await supabaseAdmin
      .from('eventos')
      .update({ [field]: item[field] === 1 ? 0 : 1 })
      .eq('id', item.id)
    fetchItems()
  }

  return (
    <div className={s.section}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>Actuaciones <span>({items.length})</span></h2>
        <button className={s.btnPrimary} onClick={openCreate}>+ Nueva actuación</button>
      </div>

      <div className={s.tableWrap}>
        {loading ? (
          <p className={s.empty}>Cargando…</p>
        ) : items.length === 0 ? (
          <p className={s.empty}>No hay actuaciones.</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Socios</th>
                <th>Invitados</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>{fmtFecha(item.fecha)}</td>
                  <td>{item.hora ?? '—'}</td>
                  <td>
                    <button
                      className={`${s.btnToggle} ${item.activo === 1 ? s.btnToggleOn : s.btnToggleOff}`}
                      onClick={() => toggleField(item, 'activo')}
                    >
                      {item.activo === 1 ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <button
                      className={`${s.btnToggle} ${item.activo_invitado === 1 ? s.btnToggleOn : s.btnToggleOff}`}
                      onClick={() => toggleField(item, 'activo_invitado')}
                    >
                      {item.activo_invitado === 1 ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <div className={s.tdActions}>
                      <button className={s.btnSecondary} onClick={() => openEdit(item)}>Editar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className={s.overlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <form className={s.modal} onSubmit={handleSave}>
            <h3 className={s.modalTitle}>
              {modal.mode === 'create' ? 'Nueva actuación' : 'Editar actuación'}
            </h3>

            <div className={s.field}>
              <label className={s.label}>Nombre</label>
              <input className={s.input} value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
            </div>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label className={s.label}>Fecha</label>
                <input className={s.input} type="date" value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required />
              </div>
              <div className={s.field}>
                <label className={s.label}>Hora</label>
                <input className={s.input} type="time" value={form.hora}
                  onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} />
              </div>
            </div>

            <div className={s.checkRow}>
              <input type="checkbox" id="activo" checked={form.activo === 1}
                onChange={e => setForm(f => ({ ...f, activo: e.target.checked ? 1 : 0 }))} />
              <label htmlFor="activo">Activo para socios</label>
            </div>
            <div className={s.checkRow}>
              <input type="checkbox" id="activo_inv" checked={form.activo_invitado === 1}
                onChange={e => setForm(f => ({ ...f, activo_invitado: e.target.checked ? 1 : 0 }))} />
              <label htmlFor="activo_inv">Activo para invitados</label>
            </div>

            {error && <p className={s.modalError}>{error}</p>}

            <div className={s.modalActions}>
              <button type="button" className={s.btnSecondary} onClick={() => setModal(null)}>
                Cancelar
              </button>
              <button type="submit" className={s.btnPrimary} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
