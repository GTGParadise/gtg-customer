import { useState, useEffect, useMemo } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { insertRow } from '../lib/supabase'

// Category of an item (plants/materials from the catalog); change the field name here if yours differs
const catOf = i => i.category || i.cat || i.group || 'Other'

// Order window: opens under the top bar (the bar stays visible), lists plants and
// materials by category, and saves the order to the `orders` table like before.
export default function OrderPanel({ plants = [], materials = [], onClose, toast, openMine }) {
  const { user } = useAuth()
  const [tab, setTab] = useState('plant')
  const [cat, setCat] = useState('All')
  const [cart, setCart] = useState({})
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [pos, setPos] = useState({ top: 64, z: 60 })

  // Sit directly below the top bar, and freeze the page behind
  useEffect(() => {
    const bar = document.querySelector('.topbar')
    const measure = () => {
      if (!bar) return
      const zi = parseInt(getComputedStyle(bar).zIndex, 10)
      setPos({ top: Math.max(0, Math.round(bar.getBoundingClientRect().bottom)), z: Number.isFinite(zi) ? Math.max(zi - 1, 1) : 60 })
    }
    measure()
    window.addEventListener('resize', measure)
    const prevBody = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('resize', measure)
      document.documentElement.style.overflow = ''
      document.body.style.overflow = prevBody
    }
  }, [])

  const all = useMemo(() => [
    ...plants.map(p => ({ ...p, kind: 'plant' })),
    ...materials.map(m => ({ ...m, kind: 'material' })),
  ], [plants, materials])

  const key = i => i.kind + i.id
  const qty = i => cart[key(i)] || 0
  const chg = (i, d) => setCart(c => ({ ...c, [key(i)]: Math.max(0, (c[key(i)] || 0) + d) }))
  const picked = all.filter(i => qty(i) > 0)
  const countOf = kind => picked.filter(i => i.kind === kind).reduce((s, i) => s + qty(i), 0)

  const tabItems = all.filter(i => i.kind === tab)
  const cats = ['All', ...new Set(tabItems.map(catOf))]
  const shown = cat === 'All' ? tabItems : tabItems.filter(i => catOf(i) === cat)
  const groups = shown.reduce((g, i) => { (g[catOf(i)] ||= []).push(i); return g }, {})

  const switchTab = t => { setTab(t); setCat('All') }

  async function place() {
    if (busy) return
    if (!picked.length) return setErr('Add at least one plant or material.')
    setBusy(true); setErr('')
    try {
      await insertRow('orders', {
        id: Date.now(), userId: user.uid, user: user.name, whatsapp: user.whatsapp, location: user.location,
        products: picked.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, type: i.kind, category: catOf(i), qty: qty(i) })),
        notes: notes.trim(), time: new Date().toISOString(), status: 'pending', adminSeen: false,
      })
      toast('Order placed. We will contact you shortly.'); onClose(); openMine()
    } catch (e) { setErr('Failed to place order: ' + (e.message || 'please try again.')); setBusy(false) }
  }

  const tabBtn = on => ({
    flex: 1, padding: '10px 8px', border: 0, cursor: 'pointer', font: 'inherit', fontWeight: 600,
    background: on ? '#1f6b3a' : '#eef4ef', color: on ? '#fff' : '#1f6b3a',
  })
  const chip = on => ({
    flexShrink: 0, padding: '6px 14px', borderRadius: 999, cursor: 'pointer', font: 'inherit', fontSize: 14,
    border: on ? '1px solid #1f6b3a' : '1px solid #cfd8d2', background: on ? '#1f6b3a' : '#fff', color: on ? '#fff' : '#1a1a1a',
  })

  return (
    <div role="dialog" aria-label="Order plants and materials"
      style={{ position: 'fixed', top: pos.top, left: 0, right: 0, bottom: 0, zIndex: pos.z, background: '#fff', color: '#1a1a1a', display: 'flex', flexDirection: 'column', boxShadow: '0 -2px 12px rgba(0,0,0,.2)' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #e5e5e5' }}>
        <h3 style={{ margin: 0 }}>Place an order</h3>
        <button className="icon-btn" onClick={onClose} aria-label="Close order window"><X /></button>
      </div>

      <div style={{ display: 'flex' }}>
        <button type="button" style={tabBtn(tab === 'plant')} onClick={() => switchTab('plant')}>Plants{countOf('plant') ? ` (${countOf('plant')})` : ''}</button>
        <button type="button" style={tabBtn(tab === 'material')} onClick={() => switchTab('material')}>Materials{countOf('material') ? ` (${countOf('material')})` : ''}</button>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 16px', borderBottom: '1px solid #eee' }}>
        {cats.map(c => <button key={c} type="button" style={chip(cat === c)} onClick={() => setCat(c)}>{c}</button>)}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '8px 16px' }}>
        {!shown.length && <p className="muted center">Nothing available here right now.</p>}
        {Object.entries(groups).map(([name, list]) => (
          <div key={name} style={{ marginBottom: 12 }}>
            <h4 style={{ margin: '12px 0 4px', color: '#1f6b3a' }}>{name}</h4>
            {list.map(i => (
              <div key={key(i)} className="order-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span>{i.emoji} {i.name}</span>
                <div className="qty" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="icon-btn" onClick={() => chg(i, -1)} aria-label={'Less ' + i.name}><Minus size={16} /></button>
                  <b style={{ minWidth: 20, textAlign: 'center' }}>{qty(i)}</b>
                  <button className="icon-btn" onClick={() => chg(i, 1)} aria-label={'More ' + i.name}><Plus size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 16px calc(10px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid #e5e5e5', background: '#fff' }}>
        {picked.length > 0 && (
          <small className="muted" style={{ display: 'block', marginBottom: 6 }}>
            {picked.map(i => `${i.name} × ${qty(i)}`).join(', ')}
          </small>
        )}
        <textarea rows={1} placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #ccc', font: 'inherit' }} />
        {err && <p className="err box" role="alert">{err}</p>}
        <button className="btn primary full" onClick={place} disabled={busy}>
          {busy ? 'Placing order…' : `Place order${picked.length ? ` (${picked.reduce((s, i) => s + qty(i), 0)} items)` : ''}`}
        </button>
      </div>
    </div>
  )
}
