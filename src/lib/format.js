import { format, formatDistanceToNow } from 'date-fns'
export const fmt = (d) => (d ? format(new Date(d), 'dd MMM, HH:mm') : '—')
export const ago = (d) => formatDistanceToNow(new Date(d), { addSuffix: true })
export const localNow = () => format(new Date(), "yyyy-MM-dd'T'HH:mm")
export function downloadCsv(name, rows) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = name
  a.click()
}
