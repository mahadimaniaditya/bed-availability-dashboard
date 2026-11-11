import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, BedDouble, Building2, ClipboardList, CalendarClock, LogOut, SprayCan, BarChart3, Settings, Menu, X, ChevronDown, FlaskConical, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useStore } from '../store/StoreContext'

const NAV = [
  ['/', 'Dashboard', LayoutDashboard], ['/beds', 'Beds', BedDouble], ['/wards', 'Wards', Building2], ['/admissions', 'Admissions', ClipboardList],
  ['/reservations', 'Reservations', CalendarClock], ['/discharges', 'Discharges', LogOut], ['/cleaning', 'Cleaning', SprayCan], ['/reports', 'Reports', BarChart3], ['/settings', 'Settings', Settings],
]
const PRIMARY = NAV.slice(0, 6), MORE = NAV.slice(6)
const link = ({ isActive }) => `flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-[0_3px_0_#0a4f48]' : 'text-slate-600 hover:bg-brand-50'}`

function MoreMenu() {
  const [o, setO] = useState(false)
  const ref = useRef(null)
  const loc = useLocation()
  const active = MORE.some(([to]) => loc.pathname.startsWith(to))
  useEffect(() => setO(false), [loc.pathname])
  useEffect(() => {
    if (!o) return
    const d = (e) => !ref.current?.contains(e.target) && setO(false)
    const k = (e) => e.key === 'Escape' && setO(false)
    document.addEventListener('mousedown', d); document.addEventListener('keydown', k)
    return () => { document.removeEventListener('mousedown', d); document.removeEventListener('keydown', k) }
  }, [o])
  return (
    <div ref={ref} className="relative">
      <button aria-expanded={o} aria-haspopup="true" onClick={() => setO(!o)} className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition ${active ? 'bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-[0_3px_0_#0a4f48]' : 'text-slate-600 hover:bg-brand-50'}`}>
        More<ChevronDown size={15} aria-hidden className={`transition ${o ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {o && (
          <motion.div className="absolute right-0 top-12 z-40 w-52 space-y-1 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {MORE.map(([to, label, Icon]) => <NavLink key={to} to={to} className={(st) => link(st) + ' w-full'}><Icon size={16} aria-hidden />{label}</NavLink>)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const { toasts } = useStore()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6">
          <NavLink to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-300 text-brand-900 shadow-[0_4px_0_#0a4f48]"><BedDouble size={20} /></span>
            <span className="hidden font-display text-sm font-semibold leading-tight sm:block lg:hidden xl:block">Bed Availability<br /><span className="text-xs font-normal text-slate-500">Reception demo</span></span>
          </NavLink>
          <nav aria-label="Main" className="ml-2 hidden flex-1 items-center gap-1 lg:flex">
            {PRIMARY.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} className={link}><Icon size={16} aria-hidden className="hidden xl:block" />{label}</NavLink>)}
            <MoreMenu />
          </nav>
          <button className="btn-ghost ml-auto !p-2 lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.nav aria-label="Mobile" className="grid grid-cols-2 gap-1 border-t border-slate-100 bg-white p-3 lg:hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              {NAV.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={link}><Icon size={16} aria-hidden />{label}</NavLink>)}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <div className="bg-amber-100 py-1.5 text-center text-xs font-semibold text-amber-900"><FlaskConical size={13} className="mr-1.5 inline" aria-hidden />Demo data. Fictional and stored in this browser, not a live bed board.</div>
      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}><Outlet /></motion.div>
        </AnimatePresence>
      </main>
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }} className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${t.tone === 'err' ? 'bg-rose-600' : 'bg-brand-700'}`}>
              {t.tone === 'err' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}{t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
