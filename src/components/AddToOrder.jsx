import { Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

// "+" button for the top-right corner of a plant/material card (the card needs position: relative).
// Each tap adds one; the button then shows +1, +2, ...
export default function AddToOrder({ item, kind }) {
  const { user } = useAuth(), cart = useCart()
  const it = { ...item, kind }, q = cart.qty(it)
  const click = e => {
    e.stopPropagation()
    if (!user) return window.dispatchEvent(new Event('gtg:need-auth'))
    cart.add(it)
  }
  return (
    <button type="button" onClick={click} aria-label={`Add ${item.name} to order${q ? `, ${q} added` : ''}`}
      style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, minWidth: 36, height: 36, padding: '0 10px', borderRadius: 18, border: 0,
        background: '#1f6b3a', color: '#fff', font: 'inherit', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,.3)' }}>
      {q > 0 ? `+${q}` : <Plus size={18} />}
    </button>
  )
}
