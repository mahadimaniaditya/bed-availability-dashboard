import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { buildSeed } from '../data/seed'
import { STATUSES, ALLOWED } from '../lib/constants'

const KEY = 'bed-availability-demo-v1'
const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

const load = () => { try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s) } catch { /* ignore */ } return buildSeed() }
const uid = (p) => p + Math.random().toString(36).slice(2, 9)
const now = () => new Date().toISOString()
const find = (list, id) => list.find((x) => x.id === id)

// Single place where bed status changes AND the history event are written together.
function setStatus(d, bed, next, type, note, admissionId = null) {
  d.events.unshift({ id: uid('e'), bedId: bed.id, admissionId, eventType: type, previousStatus: bed.status, newStatus: next, timestamp: now(), actorLabel: 'Receptionist (local demo)', note: note || '' })
  bed.status = next
  bed.lastUpdatedAt = now()
}

export function StoreProvider({ children }) {
  const [db, setDb] = useState(load)
  const [toasts, setToasts] = useState([])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* ignore */ } }, [db])

  const toast = (msg, tone = 'ok') => {
    const id = uid('t')
    setToasts((t) => [...t, { id, msg, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }
  // Runs a mutation on a copy; the mutation returns an error string to abort.
  const run = (fn, okMsg) => {
    const d = structuredClone(db)
    const err = fn(d)
    if (err) { toast(err, 'err'); return false }
    setDb(d); if (okMsg) toast(okMsg)
    return true
  }

  const act = {
    changeStatus: (bedId, next, note) => run((d) => {
      const b = find(d.beds, bedId)
      if (!note?.trim()) return 'A note is required for manual status changes.'
      if (!ALLOWED[b.status].includes(next)) return `A ${b.status} bed cannot move to ${next}.`
      if (b.status === 'Reserved') d.reservations.filter((r) => r.bedId === bedId && r.status === 'Active').forEach((r) => (r.status = 'Cancelled'))
      setStatus(d, b, next, `Manual change (${next})`, note)
    }, 'Bed status updated (local demo change)'),

    reserve: ({ bedId, patientLabel, expectedAt, note }) => run((d) => {
      const b = find(d.beds, bedId)
      if (b.status !== 'Available') return `Bed ${b.bedNumber} is ${b.status}, so it can't be reserved.`
      d.reservations.unshift({ id: uid('r'), patientLabel, bedId, expectedArrivalAt: new Date(expectedAt).toISOString(), createdAt: now(), status: 'Active', note: note || '' })
      setStatus(d, b, 'Reserved', 'Reservation', note)
    }, 'Bed reserved'),

    cancelReservation: (id) => run((d) => {
      const r = find(d.reservations, id)
      r.status = 'Cancelled'
      setStatus(d, find(d.beds, r.bedId), 'Available', 'Reservation cancelled', r.note)
    }, 'Reservation cancelled'),

    admit: (f) => run((d) => {
      const b = find(d.beds, f.bedId)
      const res = f.reservationId && d.reservations.find((r) => r.id === f.reservationId && r.status === 'Active' && r.bedId === b.id)
      if (!(b.status === 'Available' || (res && b.status === 'Reserved'))) return `Bed ${b.bedNumber} is not eligible for admission.`
      let p = d.patients.find((x) => x.patientCode.toLowerCase() === f.patientCode.toLowerCase())
      if (p && d.admissions.some((a) => a.patientId === p.id && a.status === 'Active')) return `${p.fullName} already has an active bed.`
      if (!p) { p = { id: uid('p'), patientCode: f.patientCode, fullName: f.fullName, age: Number(f.age), contactLabel: f.contactLabel || '' }; d.patients.push(p) }
      const a = { id: uid('a'), patientId: p.id, bedId: b.id, wardId: b.wardId, admissionAt: new Date(f.admissionAt).toISOString(), expectedDischargeAt: null, dischargedAt: null, status: 'Active', note: f.note || '' }
      d.admissions.unshift(a)
      if (res) res.status = 'Converted'
      b.currentAdmissionId = a.id
      setStatus(d, b, 'Occupied', 'Admission', f.note, a.id)
    }, 'Admission registered'),

    transfer: (aid, toId) => run((d) => {
      const a = find(d.admissions, aid), to = find(d.beds, toId), from = find(d.beds, a.bedId)
      if (!to || to.status !== 'Available') return 'The destination bed must be Available.'
      from.currentAdmissionId = null
      setStatus(d, from, 'Cleaning', 'Transfer out', `Transferred to ${to.bedNumber}`, aid)
      a.bedId = to.id; a.wardId = to.wardId; to.currentAdmissionId = aid
      setStatus(d, to, 'Occupied', 'Transfer in', `Transferred from ${from.bedNumber}`, aid)
    }, 'Transfer complete — previous bed sent to cleaning'),

    discharge: (aid, at, note) => run((d) => {
      const a = find(d.admissions, aid), b = find(d.beds, a.bedId)
      a.status = 'Discharged'; a.dischargedAt = new Date(at).toISOString(); b.currentAdmissionId = null
      setStatus(d, b, 'Cleaning', 'Discharge', note, aid)
    }, 'Discharged — bed sent to cleaning'),

    reset: () => { setDb(buildSeed()); toast('Demo data reset') },
  }

  const value = useMemo(() => {
    const by = (l) => Object.fromEntries(l.map((x) => [x.id, x]))
    const c = Object.fromEntries(STATUSES.map((s) => [s, 0]))
    db.beds.forEach((b) => c[b.status]++)
    const total = db.beds.length
    return { db, act, toasts, wardById: by(db.wards), bedById: by(db.beds), patientById: by(db.patients), admissionById: by(db.admissions), stats: { ...c, total, occ: total ? Math.round((c.Occupied / total) * 100) : 0 } }
    // eslint-disable-next-line
  }, [db, toasts])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
