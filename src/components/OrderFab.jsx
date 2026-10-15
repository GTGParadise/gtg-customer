import { ShoppingBasket } from 'lucide-react'

// Fixed bottom-right order button, shown after sign-in. Stays in place while scrolling.
export default function OrderFab({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Order plants and materials"
      style={{ position: 'fixed', right: 16, bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', zIndex: 900,
        width: 56, height: 56, borderRadius: '50%', border: 0, background: '#1f6b3a', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.3)' }}>
      <ShoppingBasket size={24} />
    </button>
  )
}
