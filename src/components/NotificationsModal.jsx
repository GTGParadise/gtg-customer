import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
const box = { background: '#fff', borderRadius: 14, width: '100%', maxWidth: 460, maxHeight: '80vh', overflow: 'auto', padding: 20 }

export default function NotificationsModal({ items, markAllRead, onClose }) {
  // remember which rows were unread when the panel opened, so the green dots stay visible while it is open
  const [fresh] = useState(() => new Set(items.filter(n => !n.read).map(n => n.id)))
  useEffect(() => { markAllRead() }, [markAllRead])
  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Notifications</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 0, cursor: 'pointer' }}><X size={20} /></button>
        </div>
        {items.length === 0 && <p style={{ color: '#666' }}>No notifications yet.</p>}
        {items.map(n => (
          <div key={n.id} style={{ padding: '10px 0', borderTop: '1px solid #eee' }}>
            {fresh.has(n.id) && <span aria-label="New" style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: '#22c55e', marginRight: 8 }} />}
            <b>{n.title}</b>
            <div style={{ fontSize: 14, color: '#444' }}>{n.body}</div>
            <small style={{ color: '#888' }}>{new Date(n.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
