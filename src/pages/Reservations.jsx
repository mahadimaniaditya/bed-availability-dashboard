import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { PageHead, Empty } from '../components/ui'
import { fmt } from '../lib/format'

export default function Reservations() {
  const { db, bedById, wardById, act } = useStore()
  const nav = useNavigate()
  const list = db.reservations
  return (
    <div>
      <PageHead title="Reservations" sub="Held beds are unavailable to other patients until converted or cancelled.">
        <button className="btn" onClick={() => nav('/beds?status=Available')}>Reserve a bed</button>
      </PageHead>
      {list.length === 0 ? <Empty>No reservations yet. Pick an Available bed to reserve it.</Empty> : (
        <div className="grid gap-4 md:grid-cols-2" style={{ perspective: 1000 }}>
          {list.map((r) => {
            const b = bedById[r.bedId], overdue = r.status === 'Active' && new Date(r.expectedArrivalAt) < new Date()
            return (
              <div key={r.id} className="card tilt p-5">
                <div className="flex items-start justify-between gap-2"><div><h2 className="font-display font-semibold">{r.patientLabel}</h2><p className="text-sm text-slate-500">{b.bedNumber} · {wardById[b.wardId].name}</p></div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold ring-1 ring-slate-300">{r.status}</span></div>
                <p className="mt-3 text-sm">Expected arrival {fmt(r.expectedArrivalAt)}</p>
                {overdue && <p className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900"><AlertTriangle size={13} />Overdue — review this reservation</p>}
                {r.note && <p className="mt-2 text-sm text-slate-600">{r.note}</p>}
                {r.status === 'Active' && <div className="mt-4 flex gap-2"><button className="btn !py-2" onClick={() => nav('/admissions?new=1', { state: { reservationId: r.id } })}>Convert to admission</button><button className="btn-danger !py-2" onClick={() => window.confirm('Cancel this reservation?') && act.cancelReservation(r.id)}>Cancel</button></div>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
