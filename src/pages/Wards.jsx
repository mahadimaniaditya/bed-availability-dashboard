import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { STATUSES, STATUS } from '../lib/constants'
import { PageHead } from '../components/ui'

export default function Wards() {
  const { db } = useStore()
  return (
    <div>
      <PageHead title="Wards" sub="Capacity and live-in-browser status mix for each ward. Select a ward to see its beds." />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" style={{ perspective: 1000 }}>
        {db.wards.map((w) => {
          const beds = db.beds.filter((b) => b.wardId === w.id)
          const c = Object.fromEntries(STATUSES.map((s) => [s, beds.filter((b) => b.status === s).length]))
          return (
            <Link key={w.id} to={`/beds?ward=${w.id}`} className="card tilt block p-5">
              <div className="flex items-start justify-between"><div><h2 className="font-display text-lg font-semibold">{w.name}</h2><p className="text-sm text-slate-500">{w.wardCode} · Floor {w.floor} · {w.careCategory}</p></div><span className="rounded-xl bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">{beds.length} beds</span></div>
              <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label="Status mix">{STATUSES.map((s) => <div key={s} style={{ width: `${(c[s] / beds.length) * 100}%`, background: STATUS[s].hex }} />)}</div>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">{STATUSES.map((s) => <li key={s}><span className="font-semibold">{c[s]}</span> {s}</li>)}</ul>
              <p className="mt-3 text-sm font-semibold text-brand-700">{Math.round((c.Occupied / beds.length) * 100)}% occupied</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
