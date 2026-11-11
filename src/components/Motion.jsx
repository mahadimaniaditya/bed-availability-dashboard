import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'

export function CountUp({ to, suffix = '' }) {
  const [v, setV] = useState(0)
  useEffect(() => { const c = animate(0, to, { duration: 1.2, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) }); return () => c.stop() }, [to])
  return <>{v}{suffix}</>
}

// Fades/slides content in when it scrolls into view
export const Reveal = ({ children, delay = 0, className = '' }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, delay, ease: 'easeOut' }}>{children}</motion.div>
)
