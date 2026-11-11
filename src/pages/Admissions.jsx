import { useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Plus, Download, Search } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { PageHead, Empty } from '../components/ui'
import { AdmitModal, TransferModal, DischargeModal } from '../components/Workflows'
import { fmt, downloadCsv } from '../lib/format'

// One component powers both the Admissions page and the Discharges page.
export default function Admissions({ view }) {
  const { db, patientById, bedById, wardById } = useStore()
  const [sp] = useSearchParams()
  const loc = useLocation()
  const [q, setQ] = useState(sp.get('q') || '')
  const [ward, setWard] = useState('')
  const status = view === 'discharges' ? 'Discharged' : 'Active'
  const [from, setFrom] = useState('')
  const [admit, setAdmit] = useState(null)
  const [transfer, setTransfer] = useState(null)
  const [discharge, setDischarge] = useState(null)

  useEffect(() => {
    if (view === 'admissions' && sp.get('new')) setAdmit({ bedId: sp.get('bed'), reservation: db.reservations.find((r) => r.id === loc.state?.reservationId) })
    // eslint-disable-next-line
  }, [])

  const rows = useMemo(() => db.admissions.filter((a) => {
    const p = patientById[a.patientId], b = bedById[a.bedId]
    const hay = [p.fullName, p.patientCode, b.bedNumber, wardById[a.wardId].name].join(' ').toLowerCase()
    return (!q || hay.includes(q.toLowerCase())) && (!ward || a.wardId === ward) && (!status || a.status === status) && (!from || a.admissionAt.slice(0, 10) >= from)
  }).sort((a, b) => (b.dischargedAt || b.admissionAt).localeCompare(a.dischargedAt || a.admissionAt)), [db, q, ward, status, from])

  const csv = () => downloadCsv('admissions-demo.csv', rows.map((a) => ({ Patient: patientById[a.patientId].fullName, DemoID: patientById[a.patientId].patientCode, Ward: wardById[a.wardId].name, Bed: bedById[a.bedId].bedNumber, Admitted: fmt(a.admissionAt), Discharged: fmt(a.dischargedAt), Status: a.status })))
  const title = view === 'discharges' ? 'Discharges' : 'Admissions'

  return (
    <div>
      <PageHead title={title} sub={view === 'discharges' ? 'Completed discharges. Discharge a patient from the Admissions page; the bed then moves to Cleaning.' : 'Patients currently in a bed. Register, transfer or discharge. All records are fictional.'}>
        <button className="btn-ghost" onClick={csv}><Download size={16} />Export CSV</button>
        {view === 'admissions' && <button className="btn" onClick={() => setAdmit({})}><Plus size={16} />New admission</button>}
      </PageHead>
      <div className="card mb-5 grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
        <label className="relative col-span-2"><span className="sr-only">Search</span><Search size={16} className="absolute left-3 top-4 text-slate-400" /><input className="input !pl-9" placeholder="Patient, demo ID, bed or ward" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <select aria-label="Ward" className="input" value={ward} onChange={(e) => setWard(e.target.value)}><option value="">All wards</option>{db.wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
        <input aria-label="Admitted from" type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      {rows.length === 0 ? <Empty>No records match. Adjust the filters or register a new admission.</Empty> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs text-slate-500"><tr>{['Patient', 'Ward / bed', 'Admitted', ...(view === 'discharges' ? ['Discharged'] : []), ''].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{rows.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="px-4 py-3"><b>{patientById[a.patientId].fullName}</b><br /><span className="text-xs text-slate-500">{patientById[a.patientId].patientCode} · age {patientById[a.patientId].age}</span></td>
                <td className="px-4 py-3">{wardById[a.wardId].name}<br /><span className="text-xs text-slate-500">{bedById[a.bedId].bedNumber}</span></td>
                <td className="px-4 py-3">{fmt(a.admissionAt)}</td>{view === 'discharges' && <td className="px-4 py-3">{fmt(a.dischargedAt)}</td>}
                <td className="px-4 py-3 text-right">{a.status === 'Active' && <div className="flex justify-end gap-2"><button className="btn-ghost !px-3 !py-1.5" onClick={() => setTransfer(a)}>Transfer</button><button className="btn !px-3 !py-1.5" onClick={() => setDischarge(a)}>Discharge</button></div>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <AdmitModal state={admit} onClose={() => setAdmit(null)} />
      <TransferModal adm={transfer} onClose={() => setTransfer(null)} />
      <DischargeModal adm={discharge} onClose={() => setDischarge(null)} />
    </div>
  )
}
