import { motion } from 'framer-motion'
import { BedDouble } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { STATUS, STATUSES } from '../lib/constants'
import { NeonTrend, NeonGauge } from '../components/Charts'
import { StatusBadge } from '../components/ui'
import { CountUp, Reveal } from '../components/Motion'
import Tour3D from '../components/Tour3D'
import { ago, fmt } from '../lib/format'

const KPIS = [{ k: 'total', label: 'Total beds', Icon: BedDouble, hex: '#0f766e' }, ...STATUSES.map((s) => ({ k: s, label: s, Icon: STATUS[s].Icon, hex: STATUS[s].hex }))]
const item = { h: { opacity: 0, y: 18, rotateX: -14 }, s: { opacity: 1, y: 0, rotateX: 0 } }

// Dashboard = overview only. Bed lists, ward details and analytics live on their own pages.
export default function Dashboard() {
  const { db, stats, bedById, patientById, wardById } = useStore()
  const upcoming = db.admissions.filter((a) => a.status === 'Active' && a.expectedDischargeAt).sort((a, b) => a.expectedDischargeAt.localeCompare(b.expectedDischargeAt)).slice(0, 5)
  return (
    <div className="space-y-6">
      <Tour3D />
      <div aria-hidden className="!mt-0 -mx-4 h-[30px] sm:-mx-6" style={{ background: 'radial-gradient(circle at 50% 0, #0f766e 29px, transparent 30px) top/60px 30px repeat-x' }} />

      <motion.section initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.07 } } }} className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-3 xl:grid-cols-6" style={{ perspective: 900 }}>
        {KPIS.map(({ k, label, Icon, hex }) => (
          <motion.div key={k} variants={item} className="card tilt p-4">
            <div className="grid h-10 w-10 place-items-center rounded-2xl text-white shadow-[0_4px_0_rgba(0,0,0,.18)]" style={{ background: hex }}><Icon size={18} aria-hidden /></div>
            <p className="mt-3 font-display text-3xl font-semibold"><CountUp to={stats[k]} /></p>
            <p className="text-sm text-slate-600">{label}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><motion.div className="h-full rounded-full" style={{ background: hex }} initial={{ width: 0 }} animate={{ width: `${k === 'total' ? 100 : (stats[k] / stats.total) * 100}%` }} transition={{ duration: 1.1, delay: 0.5 }} /></div>
          </motion.div>
        ))}
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2"><section className="card-dark h-full p-6"><h2 className="font-display text-lg font-semibold">Occupancy trend</h2><p className="mb-3 text-xs text-brand-100">Share of beds occupied, last 7 days</p><NeonTrend /></section></Reveal>
        <Reveal delay={0.1}><section className="card-dark h-full p-6"><h2 className="font-display text-lg font-semibold">Occupancy now</h2><p className="mb-3 text-xs text-brand-100">All wards combined</p><NeonGauge /></section></Reveal>
        <Reveal className="lg:col-span-3">
          <div className="grid gap-6 md:grid-cols-2">
            <section className="card p-6">
              <h2 className="font-display text-lg font-semibold">Expected discharges</h2>
              <ul className="mt-4 space-y-3">{upcoming.map((a, i) => (
                <motion.li key={a.id} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between rounded-2xl bg-white p-3 text-sm shadow-sm"><span><b>{patientById[a.patientId].fullName}</b><br /><span className="text-slate-500">{bedById[a.bedId].bedNumber} · {wardById[a.wardId].name}</span></span><span className="text-xs text-slate-500">{fmt(a.expectedDischargeAt)}</span></motion.li>
              ))}</ul>
            </section>
            <section className="card p-6">
              <h2 className="font-display text-lg font-semibold">Recent bed-status changes</h2>
              <ul className="mt-4 space-y-3">{db.events.slice(0, 5).map((e, i) => (
                <motion.li key={e.id} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between gap-2 rounded-2xl bg-white p-3 text-sm shadow-sm"><span><b>{bedById[e.bedId]?.bedNumber}</b> · {e.eventType}<br /><span className="text-xs text-slate-500">{ago(e.timestamp)}</span></span><StatusBadge s={e.newStatus} /></motion.li>
              ))}</ul>
            </section>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
