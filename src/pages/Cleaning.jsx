import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { PageHead, StatusBadge, Empty } from '../components/ui'
import { StatusModal } from '../components/Workflows'
import { ago } from '../lib/format'

export default function Cleaning() {
  const { db, wardById } = useStore()
  const [t, setT] = useState(null)
  const beds = db.beds.filter((b) => b.status === 'Cleaning' || b.status === 'Maintenance')
  return (
    <div>
      <PageHead title="Cleaning & maintenance" sub="A bed returns to Available only after you record completion with a note." />
      {beds.length === 0 ? <Empty>No beds are waiting. Discharges and transfers will appear here.</Empty> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" style={{ perspective: 1000 }}>
          {beds.map((b) => (
            <div key={b.id} className="card tilt p-5">
              <div className="flex items-center justify-between"><h2 className="font-display font-semibold">{b.bedNumber}</h2><StatusBadge s={b.status} /></div>
              <p className="mt-1 text-sm text-slate-500">{wardById[b.wardId].name} · since {ago(b.lastUpdatedAt)}</p>
              {b.notes && <p className="mt-2 text-sm">{b.notes}</p>}
              <button className="btn mt-4 !py-2" onClick={() => setT({ bed: b, next: 'Available' })}>{b.status === 'Cleaning' ? 'Mark cleaned' : 'Release bed'}</button>
            </div>
          ))}
        </div>
      )}
      <StatusModal target={t} onClose={() => setT(null)} />
    </div>
  )
}
