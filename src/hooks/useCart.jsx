import { createContext, useContext, useState, useMemo, useCallback } from 'react'

// Shared order cart (kept in memory only: it is cleared on refresh)
const Ctx = createContext(null)
export const cartKey = i => i.kind + i.id
const snap = i => ({ id: i.id, name: i.name, emoji: i.emoji || '🌿', price: i.price, img: i.img || i.image || '',
  category: i.category || i.cat || i.group || 'Other', kind: i.kind })

export function CartProvider({ children }) {
  const [cart, setCart] = useState({})
  const add = useCallback((item, d = 1) => setCart(c => {
    const k = cartKey(item), q = (c[k]?.qty || 0) + d
    if (q <= 0) { const { [k]: _gone, ...rest } = c; return rest }
    return { ...c, [k]: { item: c[k]?.item || snap(item), qty: q } }
  }), [])
  const clear = useCallback(() => setCart({}), [])
  const value = useMemo(() => {
    const lines = Object.values(cart)
    return { lines, add, clear, qty: i => cart[cartKey(i)]?.qty || 0,
      count: lines.reduce((s, l) => s + l.qty, 0),
      total: lines.reduce((s, l) => s + l.qty * Number(l.item.price || 0), 0) }
  }, [cart, add, clear])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export const useCart = () => useContext(Ctx)
