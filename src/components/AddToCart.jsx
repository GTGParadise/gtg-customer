import { Minus, Plus, ShoppingBasket } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

// "Add to cart" at the bottom of a card; turns into a  − 2 +  stepper once added.
export default function AddToCart({ item }) {
  const { user } = useAuth(), cart = useCart()
  const q = cart.qty(item)
  const add = () => (user ? cart.add(item) : window.dispatchEvent(new Event('gtg:need-auth')))
  const btn = { border: 0, background: '#1f6b3a', color: '#fff', font: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 6 }
  if (!q) return (
    <button type="button" onClick={add} aria-label={`Add ${item.name} to cart`}
      style={{ ...btn, width: '100%', padding: '7px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <ShoppingBasket size={14} /> Add to cart
    </button>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
      <button type="button" onClick={() => cart.add(item, -1)} aria-label={`Remove one ${item.name}`} style={{ ...btn, width: 32, height: 32 }}><Minus size={14} /></button>
      <b aria-live="polite">{q}</b>
      <button type="button" onClick={add} aria-label={`Add one more ${item.name}`} style={{ ...btn, width: 32, height: 32 }}><Plus size={14} /></button>
    </div>
  )
}
