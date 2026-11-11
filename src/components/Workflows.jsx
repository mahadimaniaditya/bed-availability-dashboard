import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, Field } from './ui'
import { StatusBadge } from './ui'
import { useStore } from '../store/StoreContext'
import { admitSchema, reserveSchema, statusSchema } from '../lib/schemas'
import { ALLOWED } from '../lib/constants'
import { localNow, fmt } from '../lib/format'

const Actions = ({ onClose, label, disabled }) => (
  <div className="mt-4 flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn" disabled={disabled}>{label}</button></div>
)

function AdmitForm({ onClose, bedId, reservation }) {
  const { db, act } = useStore()
  const ok = db.beds.filter((b) => b.status === 'Available' || b.id === reservation?.bedId)
  const pre = ok.find((b) => b.id === (bedId || reservation?.bedId))
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(admitSchema),
    defaultValues: { fullName: reservation?.patientLabel || '', patientCode: 'DEMO-' + (2000 + db.patients.length), age: '', admissionAt: localNow(), wardId: pre?.wardId || '', bedId: pre?.id || '', contactLabel: '', note: '' },
  })
  const ward = watch('wardId')
  const opts = ok.filter((b) => b.wardId === ward)
  return (
    <form onSubmit={handleSubmit((f) => act.admit({ ...f, reservationId: reservation?.id }) && onClose())}>
      <Field label="Patient name (fictional)" error={errors.fullName}><input className="input" {...register('fullName')} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Demo patient ID" error={errors.patientCode}><input className="input" {...register('patientCode')} /></Field>
        <Field label="Age" error={errors.age}><input className="input" inputMode="numeric" {...register('age')} /></Field>
      </div>
      <Field label="Contact label (optional)"><input className="input" {...register('contactLabel')} /></Field>
      <Field label="Admission date and time" error={errors.admissionAt}><input type="datetime-local" className="input" {...register('admissionAt')} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ward" error={errors.wardId}>
          <select className="input" {...register('wardId', { onChange: () => setValue('bedId', '') })}><option value="">Select ward</option>{db.wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
        </Field>
        <Field label="Available bed" error={errors.bedId}>
          <select className="input" {...register('bedId')}><option value="">Select bed</option>{opts.map((b) => <option key={b.id} value={b.id}>{b.bedNumber} · {b.bedType}</option>)}</select>
        </Field>
      </div>
      <Field label="Note"><textarea className="input" rows={2} {...register('note')} /></Field>
      <Actions onClose={onClose} label="Confirm admission" />
    </form>
  )
}
export const AdmitModal = ({ state, onClose }) => (
  <Modal open={!!state} onClose={onClose} title="Register admission">{state && <AdmitForm onClose={onClose} {...state} />}</Modal>
)

function ReserveForm({ bed, onClose }) {
  const { act } = useStore()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(reserveSchema), defaultValues: { patientLabel: '', expectedAt: localNow(), note: '' } })
  return (
    <form onSubmit={handleSubmit((f) => act.reserve({ ...f, bedId: bed.id }) && onClose())}>
      <p className="mb-3 rounded-xl bg-brand-50 p-3 text-sm">Reserving bed <b>{bed.bedNumber}</b> ({bed.bedType}). It will be held and unavailable to others.</p>
      <Field label="Patient label or demo ID" error={errors.patientLabel}><input className="input" {...register('patientLabel')} /></Field>
      <Field label="Expected arrival" error={errors.expectedAt}><input type="datetime-local" className="input" {...register('expectedAt')} /></Field>
      <Field label="Reservation note"><textarea className="input" rows={2} {...register('note')} /></Field>
      <Actions onClose={onClose} label="Confirm reservation" />
    </form>
  )
}
export const ReserveModal = ({ bed, onClose }) => (
  <Modal open={!!bed} onClose={onClose} title="Reserve bed">{bed && <ReserveForm bed={bed} onClose={onClose} />}</Modal>
)

function StatusForm({ bed, next, onClose }) {
  const { act } = useStore()
  const opts = ALLOWED[bed.status]
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(statusSchema), defaultValues: { status: next && opts.includes(next) ? next : opts[0] || '', note: '' } })
  return (
    <form onSubmit={handleSubmit((f) => act.changeStatus(bed.id, f.status, f.note) && onClose())}>
      <p className="mb-3 flex items-center gap-2 text-sm">Bed <b>{bed.bedNumber}</b> is currently <StatusBadge s={bed.status} /></p>
      {opts.length ? (
        <>
          <Field label="Change status to"><select className="input" {...register('status')}>{opts.map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Reason / note (required)" error={errors.note}><textarea className="input" rows={2} {...register('note')} /></Field>
          <p className="text-xs text-slate-500">Recorded as a local demo change.</p>
          <Actions onClose={onClose} label="Confirm change" />
        </>
      ) : <p className="text-sm text-slate-600">Occupied beds change status through transfer or discharge.</p>}
    </form>
  )
}
export const StatusModal = ({ target, onClose }) => (
  <Modal open={!!target} onClose={onClose} title="Change bed status">{target && <StatusForm {...target} onClose={onClose} />}</Modal>
)

function TransferForm({ adm, onClose }) {
  const { db, act, bedById, wardById, patientById } = useStore()
  const [to, setTo] = useState('')
  const cur = bedById[adm.bedId], dest = bedById[to]
  const avail = db.beds.filter((b) => b.status === 'Available')
  return (
    <div>
      <p className="mb-3 text-sm">Transfer <b>{patientById[adm.patientId].fullName}</b> from <b>{cur.bedNumber}</b> ({wardById[cur.wardId].name}).</p>
      <Field label="Destination bed (Available only)">
        <select className="input" value={to} onChange={(e) => setTo(e.target.value)}><option value="">Select bed</option>{avail.map((b) => <option key={b.id} value={b.id}>{b.bedNumber} · {wardById[b.wardId].name} · {b.bedType}</option>)}</select>
      </Field>
      {dest && <p className="rounded-xl bg-brand-50 p-3 text-sm">{cur.bedNumber} will go to <b>Cleaning</b>; {dest.bedNumber} will become <b>Occupied</b>.</p>}
      <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn" disabled={!to} onClick={() => act.transfer(adm.id, to) && onClose()}>Confirm transfer</button></div>
    </div>
  )
}
export const TransferModal = ({ adm, onClose }) => <Modal open={!!adm} onClose={onClose} title="Transfer patient">{adm && <TransferForm adm={adm} onClose={onClose} />}</Modal>

function DischargeForm({ adm, onClose }) {
  const { act, bedById, patientById } = useStore()
  const [at, setAt] = useState(localNow()), [note, setNote] = useState('')
  return (
    <div>
      <p className="mb-3 text-sm">Discharge <b>{patientById[adm.patientId].fullName}</b> from <b>{bedById[adm.bedId].bedNumber}</b>, admitted {fmt(adm.admissionAt)}. The bed will move to <b>Cleaning</b>.</p>
      <Field label="Discharge date and time"><input type="datetime-local" className="input" value={at} onChange={(e) => setAt(e.target.value)} /></Field>
      <Field label="Note (optional)"><textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn" disabled={!at} onClick={() => act.discharge(adm.id, at, note) && onClose()}>Confirm discharge</button></div>
    </div>
  )
}
export const DischargeModal = ({ adm, onClose }) => <Modal open={!!adm} onClose={onClose} title="Discharge patient">{adm && <DischargeForm adm={adm} onClose={onClose} />}</Modal>
