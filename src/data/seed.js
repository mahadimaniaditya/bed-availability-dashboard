import { subHours, subDays, addHours, addDays } from 'date-fns'

const WARDS = [
  ['GEN', 'General Ward', 1, 'General care', 16, ['Standard']],
  ['ICU', 'Intensive Care', 2, 'Critical care', 8, ['ICU']],
  ['MAT', 'Maternity', 2, 'Maternity', 10, ['Maternity']],
  ['PED', 'Paediatrics', 3, 'Paediatric care', 10, ['Paediatric']],
  ['SUR', 'Surgical Ward', 3, 'Surgical care', 14, ['Standard', 'Semi-Private']],
  ['PVT', 'Private Suites', 4, 'Private care', 12, ['Private', 'Deluxe']],
]
const FIRST = ['Aarav', 'Meera', 'Rohan', 'Anaya', 'Kabir', 'Ishita', 'Vihaan', 'Diya', 'Arjun', 'Saanvi', 'Neel', 'Tara', 'Ravi', 'Kavya', 'Dev', 'Nisha', 'Ishaan', 'Riya', 'Yash', 'Pooja']
const LAST = ['Sharma', 'Iyer', 'Rao', 'Menon', 'Gupta', 'Nair', 'Reddy', 'Das', 'Patel', 'Kulkarni']
const PATTERN = ['Occupied', 'Occupied', 'Available', 'Occupied', 'Reserved', 'Occupied', 'Available', 'Cleaning', 'Occupied', 'Available', 'Maintenance', 'Occupied', 'Available', 'Occupied']

// Builds a fully fictional, deterministic dataset (70 beds, ~40 patients).
export function buildSeed() {
  const now = new Date()
  const iso = (d) => d.toISOString()
  const db = { wards: [], beds: [], patients: [], admissions: [], reservations: [], events: [] }
  let n = 0, pi = 0
  const patient = (wi) => {
    const code = WARDS[wi][0]
    const age = code === 'PED' ? 2 + (pi % 12) : code === 'MAT' ? 22 + (pi % 14) : 24 + ((pi * 7) % 60)
    const p = { id: 'p' + pi, patientCode: 'DEMO-' + (1000 + pi), fullName: `${FIRST[pi % 20]} ${LAST[(pi * 3) % 10]}`, age, contactLabel: 'Family contact' }
    db.patients.push(p); pi++
    return p
  }
  WARDS.forEach(([code, name, floor, care, cap, types], wi) => {
    db.wards.push({ id: 'w' + wi, wardCode: code, name, floor, careCategory: care, capacity: cap, description: care })
    for (let i = 1; i <= cap; i++) {
      const status = PATTERN[(n * 5 + wi) % PATTERN.length]
      n++
      const at = subHours(now, ((n * 7) % 60) + 1)
      const bed = { id: `b${wi}-${i}`, bedNumber: `${code}-${String(i).padStart(2, '0')}`, wardId: 'w' + wi, bedType: types[i % types.length], status, currentAdmissionId: null, lastUpdatedAt: iso(at), notes: '' }
      const ev = (type, note, admissionId) => db.events.push({ id: `e${db.events.length}`, bedId: bed.id, admissionId, eventType: type, previousStatus: 'Available', newStatus: status, timestamp: iso(at), actorLabel: 'Seed (demo)', note })
      if (status === 'Occupied') {
        const p = patient(wi)
        const a = { id: 'a' + db.admissions.length, patientId: p.id, bedId: bed.id, wardId: bed.wardId, admissionAt: iso(subHours(now, 10 + ((pi * 17) % 130))), expectedDischargeAt: iso(addHours(now, 6 + ((pi * 11) % 90))), dischargedAt: null, status: 'Active', note: 'Routine stay' }
        db.admissions.push(a); bed.currentAdmissionId = a.id
        ev('Admission', 'Demo admission', a.id)
      } else if (status === 'Reserved') {
        const r = { id: 'r' + db.reservations.length, patientLabel: `Pending – ${LAST[n % 10]} family`, bedId: bed.id, expectedArrivalAt: iso(n % 3 === 0 ? subHours(now, 5) : addHours(now, 4 + (n % 20))), createdAt: iso(subHours(now, 12)), status: 'Active', note: 'Expected from emergency desk' }
        db.reservations.push(r); ev('Reservation', r.note)
      } else if (status === 'Cleaning') ev('Cleaning started', 'Post-discharge turnover')
      else if (status === 'Maintenance') { bed.notes = 'Mattress replacement'; ev('Maintenance started', 'Mattress replacement') }
      db.beds.push(bed)
    }
  })
  // A few completed discharges for history and trend charts
  for (let k = 0; k < 9; k++) {
    const p = patient(k % 6)
    const adm = subDays(now, 4 + (k % 3)), dis = subHours(now, 6 + k * 9)
    db.admissions.push({ id: 'a' + db.admissions.length, patientId: p.id, bedId: `b${k % 6}-${1 + (k % 6)}`, wardId: 'w' + (k % 6), admissionAt: iso(adm), expectedDischargeAt: null, dischargedAt: iso(dis), status: 'Discharged', note: 'Recovered' })
  }
  db.events.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  return db
}
