import { useState, useEffect, useMemo } from 'react'
import { supabaseAdmin } from '../supabase'
import s from './admin.module.css'

const EMPTY = { nombre: '', apellidos: '', dni: '', n_socio: '', activo: 1 }

export default function Socios() {
  const [socios,  setSocios]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(null)   // null | { mode:'create'|'edit', data }
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  async function fetchSocios() {
    setLoading(true)
    const { data, error } = await supabaseAdmin
      .from('socios')
      .select('*')
      .order('n_socio', { ascending: true })
    if (!error) setSocios(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchSocios() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return socios
    return socios.filter(s =>
      s.nombre?.toLowerCase().includes(q) ||
      s.apellidos?.toLowerCase().includes(q) ||
      s.dni?.toLowerCase().includes(q)
    )
  }, [socios, search])

  function openCreate() {
    const nextN = socios.length ? Math.max(...socios.map(s => s.n_socio ?? 0)) + 1 : 1
    setForm({ ...EMPTY, n_socio: nextN })
    setError('')
    setModal({ mode: 'create' })
  }

  function openEdit(socio) {
    setForm({ nombre: socio.nombre ?? '', apellidos: socio.apellidos ?? '',
              dni: socio.dni ?? '', n_socio: socio.n_socio ?? '', activo: socio.activo ?? 1 })
    setError('')
    setModal({ mode: 'edit', id: socio.id })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setError('')
    const payload = {
      nombre:    form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      dni:       form.dni.trim().toUpperCase(),
      n_socio:   parseInt(form.n_socio, 10) || null,
      activo:    form.activo ? 1 : 0,
    }
    let err
    if (modal.mode === 'create') {
      ;({ error: err } = await supabaseAdmin.from('socios').insert(payload))
    } else {
      ;({ error: err } = await supabaseAdmin.from('socios').update(payload).eq('id', modal.id))
    }
    setSaving(false)
    if (err) { setError(err.message); return }
    setModal(null)
    fetchSocios()
  }

  async function toggleActivo(socio) {
    await supabaseAdmin
      .from('socios')
      .update({ activo: socio.activo === 1 ? 0 : 1 })
      .eq('id', socio.id)
    fetchSocios()
  }

  return (
    <div className={s.section}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>
          Socios <span>({filtered.length})</span>
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            className={s.searchInput}
            type="text"
            placeholder="Buscar nombre, apellidos o DNI…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className={s.btnPrimary} onClick={openCreate}>+ Nuevo socio</button>
        </div>
      </div>

      <div className={s.tableWrap}>
        {loading ? (
          <p className={s.empty}>Cargando…</p>
        ) : filtered.length === 0 ? (
          <p className={s.empty}>No se encontraron socios.</p>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Nº Socio</th>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(socio => (
                <tr key={socio.id}>
                  <td>{socio.n_socio}</td>
                  <td>{socio.dni}</td>
                  <td>{socio.nombre}</td>
                  <td>{socio.apellidos}</td>
                  <td>
                    <span className={`${s.badge} ${socio.activo === 1 ? s.badgeOn : s.badgeOff}`}>
                      {socio.activo === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className={s.tdActions}>
                      <button className={s.btnSecondary} onClick={() => openEdit(socio)}>Editar</button>
                      <button
                        className={`${s.btnToggle} ${socio.activo === 1 ? s.btnToggleOn : s.btnToggleOff}`}
                        onClick={() => toggleActivo(socio)}
                      >
                        {socio.activo === 1 ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className={s.overlay} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <form className={s.modal} onSubmit={handleSave}>
            <h3 className={s.modalTitle}>
              {modal.mode === 'create' ? 'Nuevo socio' : 'Editar socio'}
            </h3>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label className={s.label}>Nombre</label>
                <input className={s.input} value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
              </div>
              <div className={s.field}>
                <label className={s.label}>Apellidos</label>
                <input className={s.input} value={form.apellidos}
                  onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))} required />
              </div>
            </div>

            <div className={s.fieldRow}>
              <div className={s.field}>
                <label className={s.label}>DNI / NIE</label>
                <input className={s.input} value={form.dni}
                  onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} required />
              </div>
              <div className={s.field}>
                <label className={s.label}>Nº Socio</label>
                <input className={s.input} type="number" value={form.n_socio}
                  onChange={e => setForm(f => ({ ...f, n_socio: e.target.value }))} required />
              </div>
            </div>

            <div className={s.checkRow}>
              <input type="checkbox" id="activo" checked={form.activo === 1}
                onChange={e => setForm(f => ({ ...f, activo: e.target.checked ? 1 : 0 }))} />
              <label htmlFor="activo">Socio activo</label>
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
