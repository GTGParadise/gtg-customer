import { ShoppingBasket } from 'lucide-react'

// Fixed bottom-right order button (after sign-in); the badge shows how many items are selected.
export default function OrderFab({ onClick, count = 0 }) {
  return (
    <button onClick={onClick} aria-label={`Order plants and materials${count ? `, ${count} selected` : ''}`}
      style={{ position: 'fixed', right: 16, bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', zIndex: 900,
        width: 56, height: 56, borderRadius: '50%', border: 0, background: '#1f6b3a', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}>
      <ShoppingBasket size={24} />
      {count > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 22, height: 22, padding: '0 5px', borderRadius: 11, background: '#e53935', color: '#fff', fontSize: 12, lineHeight: '22px', textAlign: 'center' }}>{count > 99 ? '99+' : count}</span>}
    </button>
  )
}
