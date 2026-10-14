import { Bell } from 'lucide-react'

export default function NotificationBell({ unread = 0, onClick }) {
  return (
    <button onClick={onClick} aria-label="Notifications"
      style={{ position: 'relative', width: 40, height: 40, border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <Bell size={22} />
      {unread > 0 && (
        <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, background: '#e53935', color: '#fff', fontSize: 11, lineHeight: '18px', textAlign: 'center' }}>
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </button>
  )
}
