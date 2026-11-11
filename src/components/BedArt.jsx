import { useState } from 'react'
import { motion } from 'framer-motion'

// Illustrated pseudo-3D bed, tinted by status. Used when no real photo exists.
export function BedArt({ hex, className = '' }) {
  return (
    <svg viewBox="0 0 160 100" className={className} role="img" aria-label="Hospital bed illustration">
      <ellipse cx="80" cy="88" rx="62" ry="7" fill="#0f2a2e" opacity=".12" />
      <rect x="18" y="26" width="10" height="56" rx="4" fill="#0f766e" />
      <path d="M28 58h112l8 14H28z" fill="#cbd5e1" />
      <rect x="28" y="46" width="118" height="20" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
      <rect x="32" y="38" width="30" height="14" rx="7" fill="#fff" stroke="#e2e8f0" />
      <motion.path d="M70 44h72a6 6 0 016 6v12H70z" fill={hex} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} />
      <rect x="30" y="72" width="6" height="14" rx="2" fill="#64748b" />
      <rect x="138" y="72" width="6" height="14" rx="2" fill="#64748b" />
      <circle cx="33" cy="88" r="3.5" fill="#334155" /><circle cx="141" cy="88" r="3.5" fill="#334155" />
    </svg>
  )
}

export function BedPhoto({ bed, hex }) {
  const [err, setErr] = useState(false)
  const src = `/images/${bed.bedType.toLowerCase().replace(/[^a-z]+/g, '-')}.jpg`
  return (
    <div className="mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-white">
      {err ? <BedArt hex={hex} className="h-24 w-full" /> : <img src={src} alt={`${bed.bedType} bed`} loading="lazy" onError={() => setErr(true)} className="h-24 w-full object-cover" />}
    </div>
  )
}
