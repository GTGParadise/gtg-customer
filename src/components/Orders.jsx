import { useState, useEffect } from 'react'
import { Minus, Plus } from 'lucide-react'
import Modal from './Modal'
import { useAuth } from '../hooks/useAuth'
import { insertRow, myRows } from '../lib/supabase'
export function OrderModal({ plants, materials, onClose, toast, openMine }) {
  const { user } = useAuth(); const [cart, setCart] = useState({}), [notes, setNotes] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const all = [...plants.map(p => ({ ...p, kind: 'plant' })), ...materials.map(m => ({ ...m, kind: 'material' }))]
  const key = i => i.kind + i.id, qty = i => cart[key(i)] || 0
  const chg = (i, d) => setCart(c => ({ ...c, [key(i)]: Math.max(0, (c[key(i)] || 0) + d) }))
  const picked = all.filter(i => qty(i) > 0)
  async function place() {
    if (busy) return
    if (!picked.length) return setErr('Add at least one plant or material.')
    setBusy(true); setErr('')
    try {
      await insertRow('orders', { id: Date.now(), userId: user.uid, user: user.name, whatsapp: user.whatsapp, location: user.location,
        products: picked.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, type: i.kind, qty: qty(i) })), notes: notes.trim(),
        time: new Date().toISOString(), status: 'pending', adminSeen: false })
      toast('Order placed. We will contact you shortly.'); onClose(); openMine()
    } catch (e) { setErr('Failed to place order: ' + (e.message || 'please try again.')); setBusy(false) }
  }
  return <Modal title="Order plants & materials" onClose={onClose} wide>
    <div className="order-list">{all.map(i => <div key={key(i)} className="order-row"><span>{i.emoji} {i.name}<small>{i.kind}</small></span>
      <div className="qty"><button className="icon-btn" onClick={() => chg(i, -1)} aria-label={'Less ' + i.name}><Minus size={16} /></button><b>{qty(i)}</b>
        <button className="icon-btn" onClick={() => chg(i, 1)} aria-label={'More ' + i.name}><Plus size={16} /></button></div></div>)}</div>
    <div className="summary"><b>Order summary</b>{picked.length ? picked.map(i => <div key={key(i)}>{i.name} × {qty(i)}</div>) : <small className="muted">Nothing selected yet.</small>}</div>
    <label className="field"><span>Notes (optional)</span><textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} /></label>
    {err && <p className="err box" role="alert">{err}</p>}<button className="btn primary full" onClick={place} disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button></Modal>
}
export function MineModal({ onClose, tick }) {
  const { user } = useAuth(); const [tab, setTab] = useState('orders'), [rows, setRows] = useState(null), [err, setErr] = useState(false)
  useEffect(() => { setRows(null); setErr(false); myRows(tab === 'orders' ? 'orders' : 'enquiry', user.uid).then(setRows).catch(() => setErr(true)) }, [tab, user.uid, tick])
  return <Modal title="My orders & bookings" onClose={onClose} wide>
    <div className="tabs"><button className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>My Orders</button><button className={tab === 'bookings' ? 'on' : ''} onClick={() => setTab('bookings')}>My Bookings &amp; Requests</button></div>
    {err ? <p className="err box">Could not load. Please try again.</p> : !rows ? <p className="muted center">Loading…</p> : !rows.length ? <p className="muted center">Nothing here yet.</p> :
      rows.map(r => <div key={r.id || r.time + r.createdAt} className="card pad rec"><div className="rec-h"><b>{tab === 'orders' ? 'Order' : r.type === 'package' ? r.pkgName : (r.purpose || r.service)}</b><span className={'st ' + r.status}>{r.status}</span></div>
        {tab === 'orders' ? <p>{(r.products || []).map(p => `${p.name}×${p.qty}`).join(', ')}</p> : <p>{r.date} · {r.slot}</p>}
        <small className="muted">{new Date(r.time || r.createdAt).toLocaleString('en-IN')}</small></div>)}
  </Modal>
}
