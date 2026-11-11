import { useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'
import { subDays } from 'date-fns'
import { useStore } from '../store/StoreContext'
import { PageHead } from '../components/ui'
import { NeonFlow, InView } from '../components/Charts'
import { CountUp } from '../components/Motion'

const tip = { contentStyle: { borderRadius: 14, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,.18)' }, cursor: { fill: 'rgba(20,184,166,.08)' } }
const COLORS = ['#0d9488', '#14b8a6', '#0ea5e9', '#f59e0b', '#10b981', '#6366f1']

// Reports = analytics over time. Current bed counts live on the Dashboard only.
export default function Reports() {
  const { db } = useStore()
  const [days, setDays] = useState(7)
  const since = subDays(new Date(), days)
  const adm = db.admissions.filter((a) => new Date(a.admissionAt) >= since)
  const dis = db.admissions.filter((a) => a.dischargedAt && new Date(a.dischargedAt) >= since)
  const done = db.admissions.filter((a) => a.dischargedAt)
  const los = done.length ? (done.reduce((n, a) => n + (new Date(a.dischargedAt) - new Date(a.admissionAt)), 0) / done.length / 86400000).toFixed(1) : '0'
  const resTotal = db.reservations.length, converted = db.reservations.filter((r) => r.status === 'Converted').length
  const overdue = db.reservations.filter((r) => r.status === 'Active' && new Date(r.expectedArrivalAt) < new Date()).length
  const byWard = db.wards.map((w) => ({ name: w.wardCode, Admissions: adm.filter((a) => a.wardId === w.id).length }))
  const byType = [...new Set(db.beds.map((b) => b.bedType))].map((t) => { const l = db.beds.filter((b) => b.bedType === t); return { name: t, Rate: Math.round((l.filter((b) => b.status === 'Occupied').length / l.length) * 100) } })
  const tiles = [[`Admissions (${days}d)`, adm.length, ''], [`Discharges (${days}d)`, dis.length, ''], ['Avg stay (days)', los, ''], ['Reservations converted', resTotal ? Math.round((converted / resTotal) * 100) : 0, '%'], ['Overdue reservations', overdue, '']]

  return (
    <div className="space-y-6">
      <PageHead title="Reports & analytics" sub="Activity and performance over time. Demo data only.">
        <select aria-label="Date range" className="input !mt-0 !w-auto" value={days} onChange={(e) => setDays(+e.target.value)}><option value={7}>Last 7 days</option><option value={14}>Last 14 days</option><option value={30}>Last 30 days</option></select>
      </PageHead>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5" style={{ perspective: 900 }}>
        {tiles.map(([l, v, u]) => <div key={l} className="card tilt p-4"><p className="font-display text-3xl font-semibold">{typeof v === 'number' ? <CountUp to={v} suffix={u} /> : v}</p><p className="text-sm text-slate-600">{l}</p></div>)}
      </div>
      <section className="card-dark p-6"><h2 className="font-display text-lg font-semibold">Admissions and discharges per day</h2><p className="mb-3 text-xs text-brand-100">Last {days} days</p><NeonFlow days={days} /></section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6"><h2 className="font-display text-lg font-semibold">Admissions by ward</h2><p className="mb-3 text-xs text-slate-500">Last {days} days</p>
          <InView><ResponsiveContainer width="100%" height={260}><BarChart data={byWard}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip {...tip} /><Bar dataKey="Admissions" radius={[10, 10, 0, 0]} animationDuration={1300}>{byWard.map((_, i) => <Cell key={i} fill={COLORS[i % 6]} />)}</Bar></BarChart></ResponsiveContainer></InView></section>
        <section className="card p-6"><h2 className="font-display text-lg font-semibold">Occupancy rate by bed type</h2><p className="mb-3 text-xs text-slate-500">Percent of beds occupied right now</p>
          <InView><ResponsiveContainer width="100%" height={260}><BarChart data={byType} layout="vertical" margin={{ left: 20 }}><CartesianGrid horizontal={false} strokeDasharray="3 3" /><XAxis type="number" unit="%" domain={[0, 100]} /><YAxis type="category" dataKey="name" width={90} /><Tooltip {...tip} /><Bar dataKey="Rate" radius={[0, 10, 10, 0]} animationDuration={1300}>{byType.map((_, i) => <Cell key={i} fill={COLORS[i % 6]} />)}</Bar></BarChart></ResponsiveContainer></InView></section>
      </div>
    </div>
  )
}
