import { Bell } from 'lucide-react'

// Green dot = there is something new (order / subscription update). Count is kept for screen readers.
export default function NotificationBell({ unread = 0, onClick }) {
  return (
    <button onClick={onClick} aria-label={unread > 0 ? `Notifications, ${unread} new` : 'Notifications'}
      style={{ position: 'relative', width: 40, height: 40, border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <Bell size={22} />
      {unread > 0 && (
        <span aria-hidden="true"
          style={{ position: 'absolute', top: 6, right: 7, width: 11, height: 11, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff', boxShadow: '0 0 0 0 rgba(34,197,94,.6)', animation: 'gtgDot 1.8s ease-out infinite' }} />
      )}
      <style>{'@keyframes gtgDot{0%{box-shadow:0 0 0 0 rgba(34,197,94,.55)}100%{box-shadow:0 0 0 8px rgba(34,197,94,0)}}'}</style>
    </button>
  )
}
