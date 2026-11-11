import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts'
import { endOfDay, subDays, format } from 'date-fns'
import { useStore } from '../store/StoreContext'
import { CountUp } from './Motion'

// Charts start drawing only when scrolled into view, so the animation is seen.
export function InView({ children, h = 260 }) {
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, margin: '-60px' })
  return <div ref={ref} style={{ minHeight: h }}>{seen && children}</div>
}

// ---------- Bold dark "neon" charts for the dashboard ----------
const axis = { tick: { fill: '#9ccfc8', fontSize: 12 }, axisLine: false, tickLine: false }
const darkTip = { contentStyle: { background: '#06232a', border: '1px solid rgba(94,234,212,.4)', borderRadius: 14, color: '#fff' }, labelStyle: { color: '#5eead4' }, cursor: { stroke: 'rgba(94,234,212,.4)' } }

export function NeonTrend({ days = 7 }) {
  const { db } = useStore()
  const data = Array.from({ length: days }, (_, i) => {
    const day = subDays(new Date(), days - 1 - i), end = endOfDay(day)
    const occ = db.admissions.filter((a) => new Date(a.admissionAt) <= end && (!a.dischargedAt || new Date(a.dischargedAt) > end)).length
    return { day: format(day, 'dd MMM'), Occupancy: Math.round((occ / db.beds.length) * 100) }
  })
  return (
    <InView h={280}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="nFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.55} /><stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} /></linearGradient>
            <linearGradient id="nLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#5eead4" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} /><XAxis dataKey="day" {...axis} /><YAxis unit="%" {...axis} /><Tooltip {...darkTip} />
          <Area type="monotone" dataKey="Occupancy" stroke="url(#nLine)" strokeWidth={4} fill="url(#nFill)" animationDuration={2000} style={{ filter: 'drop-shadow(0 0 8px rgba(45,212,191,.8))' }} dot={{ r: 5, fill: '#06232a', stroke: '#5eead4', strokeWidth: 2.5 }} activeDot={{ r: 9, fill: '#fbbf24', stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </InView>
  )
}

export function NeonFlow({ days = 7 }) {
  const { db } = useStore()
  const same = (a, b) => format(new Date(a), 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd')
  const data = Array.from({ length: days }, (_, i) => {
    const d = subDays(new Date(), days - 1 - i)
    return { day: format(d, 'dd MMM'), Admissions: db.admissions.filter((a) => same(a.admissionAt, d)).length, Discharges: db.admissions.filter((a) => a.dischargedAt && same(a.dischargedAt, d)).length }
  })
  return (
    <InView h={280}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 12, left: -20, bottom: 0 }} barGap={4}>
          <defs>
            <linearGradient id="bAdm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5eead4" /><stop offset="100%" stopColor="#0d9488" /></linearGradient>
            <linearGradient id="bDis" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde68a" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} /><XAxis dataKey="day" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip {...darkTip} cursor={{ fill: 'rgba(255,255,255,.06)' }} />
          <Bar dataKey="Admissions" fill="url(#bAdm)" radius={[10, 10, 0, 0]} barSize={16} animationDuration={1400} style={{ filter: 'drop-shadow(0 0 6px rgba(45,212,191,.6))' }} />
          <Bar dataKey="Discharges" fill="url(#bDis)" radius={[10, 10, 0, 0]} barSize={16} animationBegin={250} animationDuration={1400} style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,.6))' }} />
        </BarChart>
      </ResponsiveContainer>
      <ul className="mt-1 flex justify-center gap-5 text-xs text-brand-100"><li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-300" />Admissions</li><li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-300" />Discharges</li></ul>
    </InView>
  )
}

export function NeonGauge() {
  const { stats } = useStore()
  const r = 72, c = 2 * Math.PI * r
  return (
    <InView h={280}>
      <div className="relative mx-auto aspect-square w-full max-w-[260px]">
        <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={`${stats.occ}% of beds occupied`}>
          <defs><linearGradient id="gGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#5eead4" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient></defs>
          {Array.from({ length: 36 }, (_, i) => <line key={i} x1="100" y1="6" x2="100" y2={i % 3 ? 11 : 16} stroke="rgba(255,255,255,.25)" strokeWidth="2" transform={`rotate(${i * 10} 100 100)`} />)}
          <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="16" />
          <motion.circle cx="100" cy="100" r={r} fill="none" stroke="url(#gGrad)" strokeWidth="16" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - stats.occ / 100) }} transition={{ duration: 1.8, ease: 'easeOut' }} transform="rotate(-90 100 100)" style={{ filter: 'drop-shadow(0 0 10px rgba(94,234,212,.9))' }} />
          <motion.circle cx="100" cy="100" r={r + 16} fill="none" stroke="#5eead4" strokeWidth="1" initial={{ opacity: 0.6, scale: 0.9 }} animate={{ opacity: 0, scale: 1.12 }} transition={{ duration: 2.2, repeat: Infinity }} style={{ transformOrigin: '100px 100px' }} />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center"><div><p className="font-impact text-6xl leading-none"><CountUp to={stats.occ} suffix="%" /></p><p className="mt-1 text-xs uppercase tracking-widest text-brand-100">occupied</p></div></div>
      </div>
    </InView>
  )
}
