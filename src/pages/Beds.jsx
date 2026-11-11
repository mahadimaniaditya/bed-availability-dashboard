import { lazy, Suspense, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, BedDouble } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { STATUSES, STATUS } from '../lib/constants'
import { PageHead, StatusBadge, Empty } from '../components/ui'
import { ReserveModal, StatusModal } from '../components/Workflows'
import { ago, fmt } from '../lib/format'
import { BedPhoto } from '../components/BedArt'

const Bed3D = lazy(() => import('../components/Bed3D'))

export default function Beds() {
  const { db, wardById, patientById, admissionById, act } = useStore()
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const [f, setF] = useState({ q: '', ward: sp.get('ward') || '', type: '', floor: '', status: sp.get('status') || '', sort: 'ward' })
  const [selId, setSelId] = useState(null)
  const [reserve, setReserve] = useState(null)
  const [statusT, setStatusT] = useState(null)
  const [showF, setShowF] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const pname = (b) => (b.currentAdmissionId ? patientById[admissionById[b.currentAdmissionId]?.patientId]?.fullName || '' : '')

  const rows = useMemo(() => {
    const q = f.q.toLowerCase()
    const r = db.beds.filter((b) => (!f.ward || b.wardId === f.ward) && (!f.type || b.bedType === f.type) && (!f.floor || String(wardById[b.wardId].floor) === f.floor) && (!f.status || b.status === f.status)
      && (!q || [b.bedNumber, wardById[b.wardId].name, pname(b)].some((x) => x.toLowerCase().includes(q))))
    const key = { ward: (a, b) => a.wardId.localeCompare(b.wardId) || a.bedNumber.localeCompare(b.bedNumber), bed: (a, b) => a.bedNumber.localeCompare(b.bedNumber), status: (a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status), updated: (a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt) }
    return r.sort(key[f.sort])
    // eslint-disable-next-line
  }, [db, f])

  const bed = db.beds.find((b) => b.id === selId)
  const types = [...new Set(db.beds.map((b) => b.bedType))], floors = [...new Set(db.wards.map((w) => w.floor))].sort()
  const res = bed && db.reservations.find((r) => r.bedId === bed.id && r.status === 'Active')
  const adm = bed && admissionById[bed.currentAdmissionId]

  return (
    <div>
      <PageHead title="Bed availability" sub={`${rows.length} of ${db.beds.length} beds shown. Status is demo data and changes only in this browser.`}>
        <button className="btn-ghost md:hidden" onClick={() => setShowF(!showF)}><SlidersHorizontal size={16} />Filters</button>
      </PageHead>
      <div className={`card mb-6 grid-cols-2 gap-3 p-4 md:grid-cols-6 ${showF ? 'grid' : 'hidden md:grid'}`}>
        <label className="relative col-span-2"><span className="sr-only">Search</span><Search size={16} className="absolute left-3 top-4 text-slate-400" /><input className="input !pl-9" placeholder="Bed, ward or patient" value={f.q} onChange={set('q')} /></label>
        <select aria-label="Ward" className="input" value={f.ward} onChange={set('ward')}><option value="">All wards</option>{db.wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
        <select aria-label="Bed type" className="input" value={f.type} onChange={set('type')}><option value="">All types</option>{types.map((t) => <option key={t}>{t}</option>)}</select>
        <select aria-label="Floor" className="input" value={f.floor} onChange={set('floor')}><option value="">All floors</option>{floors.map((x) => <option key={x} value={x}>Floor {x}</option>)}</select>
        <select aria-label="Status" className="input" value={f.status} onChange={set('status')}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select aria-label="Sort" className="input col-span-2 md:col-span-1" value={f.sort} onChange={set('sort')}><option value="ward">Sort: ward</option><option value="bed">Sort: bed number</option><option value="status">Sort: status</option><option value="updated">Sort: last update</option></select>
      </div>

      {rows.length === 0 ? <Empty>No beds match these filters. Clear a filter to see more beds.</Empty> : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" style={{ perspective: 1000 }}>
          {rows.map((b, i) => (
            <motion.button layout key={b.id} initial={{ opacity: 0, y: 24, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: Math.min(i * 0.02, 0.4) }} onClick={() => setSelId(b.id)} className="card tilt p-4 text-left" style={{ borderTop: `5px solid ${STATUS[b.status].hex}` }}>
              <BedPhoto bed={b} hex={STATUS[b.status].hex} />
              <div className="flex items-center justify-between"><span className="font-display font-semibold">{b.bedNumber}</span><BedDouble size={18} className="text-slate-400" aria-hidden /></div>
              <p className="mt-1 text-xs text-slate-500">{wardById[b.wardId].name} · {b.bedType}</p>
              <div className="mt-3"><StatusBadge s={b.status} /></div>
              <p className="mt-2 truncate text-xs text-slate-600">{pname(b) || '\u00a0'}</p>
              <p className="text-[11px] text-slate-400">Updated {ago(b.lastUpdatedAt)}</p>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {bed && (
          <motion.div className="fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSelId(null)} />
            <motion.aside role="dialog" aria-label={`Bed ${bed.bedNumber} details`} className="absolute inset-y-0 right-0 w-full max-w-md overflow-auto bg-white p-6 shadow-2xl" initial={{ x: 460 }} animate={{ x: 0 }} exit={{ x: 460 }}>
              <div className="flex items-start justify-between"><div><h2 className="font-display text-2xl font-semibold">{bed.bedNumber}</h2><p className="text-sm text-slate-500">{wardById[bed.wardId].name} · Floor {wardById[bed.wardId].floor} · {bed.bedType}</p></div><button className="btn-ghost !p-2" aria-label="Close details" onClick={() => setSelId(null)}><X size={18} /></button></div>
              <div className="mt-4 h-56 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 to-sky-50"><Suspense fallback={null}><Bed3D hex={STATUS[bed.status].hex} /></Suspense></div>
              <p className="mt-1 text-center text-xs text-slate-400">Drag to rotate</p>
              <div className="mt-4 flex items-center gap-3"><StatusBadge s={bed.status} /><span className="text-xs text-slate-500">Updated {fmt(bed.lastUpdatedAt)} · local demo change</span></div>
              {adm && <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm"><b>{patientById[adm.patientId].fullName}</b> · {patientById[adm.patientId].patientCode}<br />Age {patientById[adm.patientId].age} · admitted {fmt(adm.admissionAt)}</div>}
              {res && <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm">Reserved for <b>{res.patientLabel}</b><br />Expected {fmt(res.expectedArrivalAt)}</div>}
              <div className="mt-5 flex flex-wrap gap-2">
                {bed.status === 'Available' && <><button className="btn" onClick={() => setReserve(bed)}>Reserve bed</button><button className="btn-ghost" onClick={() => nav(`/admissions?new=1&bed=${bed.id}`)}>Admit patient</button></>}
                {bed.status === 'Reserved' && res && <><button className="btn" onClick={() => nav('/admissions?new=1', { state: { reservationId: res.id } })}>Convert to admission</button><button className="btn-danger" onClick={() => window.confirm('Cancel this reservation?') && act.cancelReservation(res.id)}>Cancel reservation</button></>}
                {bed.status === 'Occupied' && <button className="btn" onClick={() => nav(`/admissions?q=${bed.bedNumber}`)}>Transfer or discharge</button>}
                {['Available', 'Cleaning', 'Maintenance'].includes(bed.status) && <button className="btn-ghost" onClick={() => setStatusT({ bed })}>Change status</button>}
              </div>
              <h3 className="mb-2 mt-7 font-display font-semibold">Status history</h3>
              <ol className="space-y-3 border-l-2 border-brand-100 pl-4">{db.events.filter((e) => e.bedId === bed.id).slice(0, 8).map((e) => (
                <li key={e.id} className="text-sm"><b>{e.eventType}</b>: {e.previousStatus} to {e.newStatus}<br /><span className="text-xs text-slate-500">{fmt(e.timestamp)} · {e.actorLabel}{e.note ? ` · ${e.note}` : ''}</span></li>
              ))}</ol>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
      <ReserveModal bed={reserve} onClose={() => setReserve(null)} />
      <StatusModal target={statusT} onClose={() => setStatusT(null)} />
    </div>
  )
}
