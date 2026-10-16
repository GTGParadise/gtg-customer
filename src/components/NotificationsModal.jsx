import { useEffect, useState } from 'react'
import { X, ShoppingCart, CalendarCheck, Leaf, Package, Bell, ChevronRight } from 'lucide-react'
import { useScrollLock } from '../hooks/useScrollLock'

const G = '#1f6b3a'

// Works out which page a notification belongs to. Uses explicit columns when the table has them
// (kind / ref_id), otherwise reads the wording of the notification.
export function targetOf(n) {
  const title = String(n.title || ''), low = (title + ' ' + (n.body || '')).toLowerCase(), tl = title.toLowerCase()
  const kind = String(n.kind || n.type || n.ref_kind || '').toLowerCase()
  const num = (title.match(/#(\d{3,})/) || [])[1] || (n.ref_id ? String(n.ref_id).slice(-6) : '')
  const date = (title.match(/\d{4}-\d{2}-\d{2}/) || [])[0] || ''
  if (kind.startsWith('order') || (!kind && /\border\b/.test(tl))) return { tab: 'orders', icon: 'order', focus: { tab: 'orders', last6: num } }
  if (kind.startsWith('sub') || kind.includes('plan') || (!kind && /subscription|\bplan\b/.test(tl))) return { tab: 'plans', icon: 'plan', focus: { tab: 'plans' } }
  if (/package/.test(kind + tl)) return { tab: 'bookings', icon: 'package', focus: { tab: 'bookings', date } }
  if (kind.includes('book') || kind.includes('enq') || /visit|booking|enquiry|request/.test(low)) return { tab: 'bookings', icon: 'visit', focus: { tab: 'bookings', date } }
  return null
}
const ICON = { order: ShoppingCart, plan: Leaf, visit: CalendarCheck, package: Package }

const ago = t => {
  const d = new Date(t), s = (Date.now() - d.getTime()) / 1000
  if (!Number.isFinite(s)) return ''
  if (s < 60) return 'Just now'
  if (s < 3600) return Math.floor(s / 60) + ' min ago'
  const same = d.toDateString() === new Date().toDateString()
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  if (same) return 'Today, ' + time
  const y = new Date(); y.setDate(y.getDate() - 1)
  if (d.toDateString() === y.toDateString()) return 'Yesterday, ' + time
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + time
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,17,.55)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0, overscrollBehavior: 'contain' }

export default function NotificationsModal({ items, markAllRead, onClose, onOpen }) {
  useScrollLock(true)
  // remember which rows were unread when the panel opened, so the "New" markers stay visible while it is open
  const [fresh] = useState(() => new Set(items.filter(n => !n.read).map(n => n.id)))
  const [wide, setWide] = useState(() => window.innerWidth >= 600)
  useEffect(() => { markAllRead() }, [markAllRead])
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose()
    const r = () => setWide(window.innerWidth >= 600)
    document.addEventListener('keydown', k); window.addEventListener('resize', r)
    return () => { document.removeEventListener('keydown', k); window.removeEventListener('resize', r) }
  }, [onClose])

  return (
    <div style={{ ...overlay, alignItems: wide ? 'center' : 'flex-end', padding: wide ? 20 : 0 }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Notifications" onClick={e => e.stopPropagation()}
        style={{ background: '#f6faf7', width: '100%', maxWidth: 460, maxHeight: wide ? 'min(80dvh, 640px)' : '88dvh', display: 'flex', flexDirection: 'column',
          borderRadius: wide ? 20 : '20px 20px 0 0', overflow: 'hidden', boxShadow: '0 18px 50px rgba(0,0,0,.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 12px 14px 20px', background: '#fff', borderBottom: '1px solid #e1eee5' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20 }}>Notifications</h3>
            <small style={{ color: '#64748B' }}>{items.length ? 'Tap one to see the details' : 'Updates on your orders and bookings'}</small>
          </div>
          <button onClick={onClose} aria-label="Close" className="icon-btn"><X size={20} /></button>
        </div>
        <div style={{ overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 12px', color: '#64748B' }}>
              <Bell size={36} style={{ color: '#b7d3c0', marginBottom: 8 }} />
              <div style={{ fontWeight: 600, color: '#1F2937' }}>No notifications yet</div>
              <small>We will let you know when your order or booking changes.</small>
            </div>
          )}
          {items.map(n => {
            const t = targetOf(n), Icon = ICON[t?.icon] || Bell, isNew = fresh.has(n.id)
            const Tag = t ? 'button' : 'div'
            return (
              <Tag key={n.id} {...(t ? { type: 'button', onClick: () => onOpen(t) } : {})}
                style={{ display: 'flex', gap: 12, alignItems: 'flex-start', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: t ? 'pointer' : 'default',
                  background: '#fff', border: '1px solid ' + (isNew ? '#86efac' : '#e1eee5'), boxShadow: isNew ? '0 0 0 3px rgba(34,197,94,.12)' : 'none', borderRadius: 14, padding: '12px 12px' }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, background: '#ecfdf3', color: G, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon size={20} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <b style={{ fontSize: 15, lineHeight: 1.3, color: '#1F2937' }}>{n.title}</b>
                    {isNew && <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.04em', background: '#22c55e', color: '#fff', borderRadius: 999, padding: '1px 7px' }}>NEW</span>}
                  </span>
                  <span style={{ display: 'block', fontSize: 13.5, color: '#475569', marginTop: 2 }}>{n.body}</span>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: '#64748B' }}>
                    <span>{ago(n.created_at)}</span>
                    {t && <span style={{ color: G, fontWeight: 600 }}>View</span>}
                  </span>
                </span>
                {t && <ChevronRight size={18} style={{ color: '#9ab3ad', alignSelf: 'center', flex: 'none' }} />}
              </Tag>
            )
          })}
        </div>
      </div>
    </div>
  )
}
