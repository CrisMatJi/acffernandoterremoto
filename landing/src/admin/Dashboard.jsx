import { useState, useEffect } from 'react'
import { supabaseAdmin } from '../supabase'
import s from './admin.module.css'

function fmtFecha(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function StatCard({ label, value, sub }) {
  return (
    <div className={s.statCard}>
      <span className={s.statValue}>{value ?? '—'}</span>
      <span className={s.statLabel}>{label}</span>
      {sub && <span className={s.statSub}>{sub}</span>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [proximos, setProximos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    Promise.all([
      supabaseAdmin.from('socios').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('socios').select('*', { count: 'exact', head: true }).eq('activo', 1),
      supabaseAdmin.from('reserva').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('eventos')
        .select('id, nombre, fecha, hora, activo')
        .gte('fecha', today)
        .order('fecha')
        .limit(5),
    ]).then(([r1, r2, r3, r4]) => {
      setStats({
        totalSocios:   r1.count ?? 0,
        sociosActivos: r2.count ?? 0,
        totalReservas: r3.count ?? 0,
      })
      setProximos(r4.data ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <p className={s.empty}>Cargando…</p>

  return (
    <div className={s.section}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>Resumen</h2>
      </div>

      <div className={s.statsGrid}>
        <StatCard
          label="Socios activos"
          value={stats.sociosActivos}
          sub={`de ${stats.totalSocios} totales`}
        />
        <StatCard
          label="Socios inactivos"
          value={stats.totalSocios - stats.sociosActivos}
        />
        <StatCard
          label="Reservas totales"
          value={stats.totalReservas}
        />
      </div>

      {proximos.length > 0 && (
        <>
          <h3 className={s.subTitle}>Próximas actuaciones</h3>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {proximos.map(ev => (
                  <tr key={ev.id}>
                    <td>{ev.nombre}</td>
                    <td>{fmtFecha(ev.fecha)}</td>
                    <td>{ev.hora ?? '—'}</td>
                    <td>
                      <span className={`${s.badge} ${ev.activo === 1 ? s.badgeOn : s.badgeOff}`}>
                        {ev.activo === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {proximos.length === 0 && (
        <p className={s.empty} style={{ textAlign:'left', padding: '1rem 0' }}>
          No hay actuaciones próximas programadas.
        </p>
      )}
    </div>
  )
}
