import { lazy, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useStore } from '../store/StoreContext'
import { BedArt } from './BedArt'

const ScrollBed = lazy(() => import('./ScrollBed'))
const webgl = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } })()
const Big = ({ children, style, className = '' }) => <motion.h2 style={style} className={`absolute whitespace-nowrap font-impact uppercase leading-[0.85] tracking-tight text-brand-900 text-[21vw] md:text-[13vw] ${className}`}>{children}</motion.h2>
const Plus = ({ style, className }) => <motion.svg style={style} viewBox="0 0 100 100" className={className} aria-hidden><path d="M38 0h24v38h38v24H62v38H38V62H0V38h38z" fill="#f5c518" /></motion.svg>

function Polaroid({ p, ward, rot, className }) {
  const y = useTransform(p, [0.3, 0.46], [200, 0])
  const o = useTransform(p, [0.3, 0.42, 0.62, 0.72], [0, 1, 1, 0])
  return (
    <motion.div style={{ y, opacity: o, rotate: rot }} className={`absolute z-20 w-36 rounded-xl bg-white p-2 shadow-[0_20px_30px_-12px_rgba(0,0,0,.4)] sm:w-48 ${className}`}>
      <div className="rounded-lg bg-gradient-to-br from-brand-50 to-sky-50"><BedArt hex="#14b8a6" className="h-20 w-full sm:h-24" /></div>
      <p className="mt-2 font-display text-sm font-semibold">{ward.name}</p><p className="text-xs text-slate-500">Floor {ward.floor} · {ward.careCategory}</p>
    </motion.div>
  )
}

export default function Tour3D() {
  const ref = useRef(null)
  const { db } = useStore()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const a = useTransform(p, [0, 0.2, 0.3], [1, 1, 0])
  const aL = useTransform(p, [0, 0.3], ['0%', '-30%']), aR = useTransform(p, [0, 0.3], ['0%', '30%'])
  const b = useTransform(p, [0.3, 0.4, 0.62, 0.72], [0, 1, 1, 0])
  const bL = useTransform(p, [0.3, 0.72], ['8%', '-8%']), bR = useTransform(p, [0.3, 0.72], ['-8%', '8%'])
  const bandY = useTransform(p, [0.75, 0.9], ['105%', '0%'])
  const c = useTransform(p, [0.86, 0.96], [0, 1])
  const rotL = useTransform(p, [0.8, 1], [-50, 10]), rotR = useTransform(p, [0.8, 1], [50, -10])
  const [w0, w1, w2] = db.wards

  return (
    <section ref={ref} className="relative -mx-4 -mt-4 h-[420vh] sm:-mx-6 sm:-mt-6" aria-label="3D bed tour">
      <div className="sticky top-[61px] h-[calc(100vh-61px)] overflow-hidden bg-white">
        <motion.div style={{ opacity: a }} className="absolute inset-0 z-0">
          <Big style={{ x: aL }} className="left-[3%] top-[22%]">Every bed,</Big>
          <Big style={{ x: aR }} className="right-[3%] top-[46%] text-right">One view.</Big>
          <p className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#f5c518] px-4 py-1.5 text-sm font-bold text-brand-900">Scroll to open the bed</p>
        </motion.div>
        <motion.div style={{ opacity: b }} className="absolute inset-0 z-0">
          <Big style={{ x: bL }} className="left-0 top-[10%]">Ready when</Big>
          <Big style={{ x: bR }} className="right-0 top-[56%] text-right">they arrive</Big>
        </motion.div>
        <Polaroid p={p} ward={w0} rot={-7} className="left-[4%] top-[38%]" />
        <Polaroid p={p} ward={w1} rot={6} className="right-[4%] top-[6%]" />
        <Polaroid p={p} ward={w2} rot={-3} className="bottom-[6%] right-[24%] hidden sm:block" />

        {webgl ? <Suspense fallback={null}><ScrollBed progress={p} /></Suspense> : <BedArt hex="#14b8a6" className="absolute inset-0 m-auto w-96" />}

        <motion.div style={{ y: bandY }} className="absolute inset-x-0 bottom-0 z-20 h-[46%]">
          <div className="h-[30px] w-full" style={{ background: 'radial-gradient(circle at 50% 100%, #0f766e 29px, transparent 30px) bottom/60px 30px repeat-x' }} />
          <div className="h-full bg-brand-700" />
          <Plus style={{ rotate: rotL }} className="absolute -top-2 left-[4%] h-24 w-24 md:h-40 md:w-40" />
          <Plus style={{ rotate: rotR }} className="absolute -top-2 right-[4%] h-24 w-24 md:h-40 md:w-40" />
          <motion.div style={{ opacity: c }} className="absolute inset-x-0 top-12 text-center text-white">
            <p className="font-impact text-6xl uppercase leading-none md:text-8xl">Find the right bed</p>
            <p className="mt-2 text-sm text-brand-100">Demo data. Not a live bed board.</p>
            <div className="mt-5 flex justify-center gap-3"><Link to="/beds?status=Available" className="btn-yellow">Find a bed</Link><Link to="/admissions?new=1" className="btn-ghost !rounded-full !border-white/40 !bg-white/10 !text-white">Register admission</Link></div>
          </motion.div>
        </motion.div>
        <motion.div style={{ scaleX: p }} className="absolute bottom-0 left-0 z-30 h-1.5 w-full origin-left bg-[#f5c518]" />
      </div>
    </section>
  )
}
