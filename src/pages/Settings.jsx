import { RotateCcw, ShieldAlert } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { PageHead } from '../components/ui'

const LIMITS = ['No Hospital Information System or live bed-management integration', 'No real-time or multi-user sync: data lives only in this browser profile', 'No authentication, authorization or role-based security', 'No clinical triage, treatment decisions or medical records', 'No billing, insurance, staff assignment or equipment tracking', 'No alerts, SMS, email or external integrations']

export default function Settings() {
  const { db, act } = useStore()
  const counts = [['Wards', db.wards.length], ['Beds', db.beds.length], ['Patients', db.patients.length], ['Admissions', db.admissions.length], ['Reservations', db.reservations.length], ['Events', db.events.length]]
  return (
    <div className="max-w-3xl">
      <PageHead title="Settings / demo data" sub="Everything here is fictional and stored in this browser's localStorage." />
      <section className="card mb-6 p-5">
        <h2 className="font-display font-semibold">Stored records</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{counts.map(([l, v]) => <div key={l} className="rounded-2xl bg-white p-3 shadow-sm"><p className="font-display text-xl font-semibold">{v}</p><p className="text-xs text-slate-500">{l}</p></div>)}</div>
        <button className="btn-danger mt-5" onClick={() => window.confirm('Reset all demo data to the original seed? Your local changes will be lost.') && act.reset()}><RotateCcw size={16} />Reset demo data</button>
      </section>
      <section className="card p-5">
        <h2 className="flex items-center gap-2 font-display font-semibold"><ShieldAlert size={18} />Scope limits</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">{LIMITS.map((l) => <li key={l}>{l}</li>)}</ul>
        <p className="mt-4 text-sm font-medium">All availability and patient information is demonstration data, not an operational source of truth.</p>
      </section>
    </div>
  )
}
