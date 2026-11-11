import { CheckCircle2, Clock, UserRound, Sparkles, Wrench } from 'lucide-react'

export const STATUSES = ['Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance']
// Status is always shown with text + icon + colour (never colour alone)
export const STATUS = {
  Available: { hex: '#10b981', cls: 'bg-emerald-50 text-emerald-800 ring-emerald-300', Icon: CheckCircle2 },
  Reserved: { hex: '#f59e0b', cls: 'bg-amber-50 text-amber-800 ring-amber-300', Icon: Clock },
  Occupied: { hex: '#f43f5e', cls: 'bg-rose-50 text-rose-800 ring-rose-300', Icon: UserRound },
  Cleaning: { hex: '#0ea5e9', cls: 'bg-sky-50 text-sky-800 ring-sky-300', Icon: Sparkles },
  Maintenance: { hex: '#64748b', cls: 'bg-slate-100 text-slate-700 ring-slate-300', Icon: Wrench },
}
// Valid manual transitions. Occupied is changed only via discharge/transfer.
export const ALLOWED = {
  Available: ['Cleaning', 'Maintenance'],
  Cleaning: ['Available', 'Maintenance'],
  Maintenance: ['Available'],
  Reserved: ['Available'],
  Occupied: [],
}
