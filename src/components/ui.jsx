import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { STATUS } from '../lib/constants'

export const StatusBadge = ({ s }) => {
  const { cls, Icon } = STATUS[s]
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${cls}`}>{s === 'Available' ? <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" /><span className="relative h-2 w-2 rounded-full bg-emerald-600" /></span> : <Icon size={13} aria-hidden />}{s}</span>
}

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-end bg-slate-900/50 p-0 backdrop-blur-sm sm:place-items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
            className="card max-h-[92vh] w-full max-w-lg overflow-auto !bg-white p-6" style={{ transformPerspective: 900 }}
            initial={{ y: 50, rotateX: 10, opacity: 0 }} animate={{ y: 0, rotateX: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">{title}</h2>
              <button onClick={onClose} aria-label="Close dialog" className="btn-ghost !p-2"><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const Field = ({ label, error, children }) => (
  <label className="mb-3 block">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    {children}
    {error && <span role="alert" className="text-xs font-medium text-rose-600">{error.message}</span>}
  </label>
)

export const PageHead = ({ title, sub, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="font-impact text-4xl uppercase tracking-wide text-brand-900 sm:text-5xl">{title}</h1>
      {sub && <p className="mt-1 max-w-xl text-sm text-slate-600">{sub}</p>}
    </div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
)

export const Empty = ({ children }) => <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">{children}</div>
