import { useState, useEffect } from 'react'
import { Minus, Plus, Check, X as XIcon, ChevronDown, MessageCircle } from 'lucide-react'
import Modal from './Modal'
import { useAuth } from '../hooks/useAuth'
import { useAbout } from '../hooks/useAbout'
import { insertRow, myRows, supabase, configured } from '../lib/supabase'

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

// ---- status tracking (Amazon style) ----
// Status values the admin app writes (lowercase). Unknown values still show as a badge.
const FLOW = {
  order: [['pending', 'Order placed'], ['confirmed', 'Confirmed'], ['packed', 'Packed'], ['shipped', 'Out for delivery'], ['delivered', 'Delivered']],
  enquiry: [['pending', 'Request received'], ['confirmed', 'Confirmed'], ['completed', 'Completed']],
}
const ALIAS = { placed: 'pending', new: 'pending', accepted: 'confirmed', approved: 'confirmed', processing: 'packed',
  dispatched: 'shipped', 'out for delivery': 'shipped', out_for_delivery: 'shipped', done: 'completed', rejected: 'cancelled', canceled: 'cancelled' }
const norm = s => { const k = String(s || '').toLowerCase().trim(); return ALIAS[k] || k }
const when = t => t ? new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : ''
const G = '#1f6b3a'

// Business number comes from the About record (same source as the About section): whatsapp if set, else phone.
// Stored as a 10-digit Indian number, so +91 is added when the country code is missing.
const waNumber = about => {
  const d = String(about?.whatsapp || about?.phone || '').replace(/\D/g, '')
  return d.length === 10 ? '91' + d : d
}
const fmtDate = t => t ? new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''

function reachUsLink(number, tab, r, name) {
  const placed = fmtDate(r.time || r.createdAt)
  const lines = tab === 'orders'
    ? ['Hello GTG Paradise, I need help with my order.', '',
       'Name: ' + (name || r.user || ''),
       'Order number: #' + String(r.id).slice(-6),
       'Status: ' + r.status,
       'Order date: ' + placed]
    : ['Hello GTG Paradise, I need help with my booking.', '',
       'Name: ' + (name || r.user || ''),
       'Booking: ' + (r.type === 'package' ? r.pkgName : (r.purpose || r.service || '')),
       'Booking ref: #' + String(r.id || '').slice(-6),
       'Status: ' + r.status,
       'Booking date: ' + [r.date, r.slot].filter(Boolean).join(' · '),
       'Requested on: ' + placed]
  return 'https://wa.me/' + number + '?text=' + encodeURIComponent(lines.join('\n'))
}

function Track({ kind, row, events = [] }) {
  const steps = FLOW[kind], cur = norm(row.status), cancelled = cur === 'cancelled'
  const at = k => events.find(e => norm(e.status) === k)?.created_at
  const idx = steps.findIndex(s => s[0] === cur)
  const first = row.time || row.createdAt
  const list = steps.map(([k, label], n) => ({ k, label, time: at(k) || (n === 0 ? first : ''),
    done: cancelled ? (n === 0 || !!at(k)) : n <= idx }))
  const shown = cancelled ? [...list.filter(s => s.done), { k: 'cancelled', label: 'Cancelled', time: at('cancelled'), done: true, bad: true }] : list
  return <div style={{ margin: '12px 0 4px' }}>
    {shown.map((s, n) => {
      const last = n === shown.length - 1, current = !cancelled && s.k === cur && s.k !== steps[steps.length - 1][0]
      const color = s.bad ? '#c62828' : s.done ? G : '#c9d3cc'
      return <div key={s.k} style={{ display: 'flex', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: s.done ? color : '#fff', border: '2px solid ' + color, boxShadow: current ? '0 0 0 4px rgba(31,107,58,.18)' : 'none', color: '#fff' }}>
            {s.done && (s.bad ? <XIcon size={13} /> : <Check size={13} />)}</span>
          {!last && <span style={{ width: 2, flex: 1, minHeight: 22, background: shown[n + 1].done ? G : '#dfe6e1' }} />}
        </div>
        <div style={{ paddingBottom: last ? 0 : 14 }}>
          <div style={{ fontSize: 14, fontWeight: s.done ? 600 : 400, color: s.bad ? '#c62828' : s.done ? '#1a2433' : '#8a968e' }}>{s.label}</div>
          {s.time && <small style={{ color: '#5b6b60' }}>{when(s.time)}</small>}
        </div>
      </div>
    })}
    {idx < 0 && !cancelled && <small className="muted">Status: {row.status}</small>}
  </div>
}

export function MineModal({ onClose, tick }) {
  const { user } = useAuth(); const [tab, setTab] = useState('orders'), [rows, setRows] = useState(null), [err, setErr] = useState(false)
  const [ev, setEv] = useState({}), [open, setOpen] = useState('')
  const { about } = useAbout(), waTo = waNumber(about)
  const kind = tab === 'orders' ? 'order' : 'enquiry'
  useEffect(() => {
    let off = false
    setRows(null); setErr(false); setEv({}); setOpen('')
    myRows(tab === 'orders' ? 'orders' : 'enquiry', user.uid).then(async list => {
      if (off) return
      setRows(list)
      if (!list.length || !configured) return
      try {   // status history written by the database; falls back to the current status if missing
        const { data } = await supabase.from('tracking_events').select('ref_id,status,created_at').eq('kind', kind)
          .in('ref_id', list.map(r => String(r.id))).order('created_at')
        const g = {}; (data || []).forEach(e => { (g[e.ref_id] ||= []).push(e) })
        if (!off) setEv(g)
      } catch { /* ignore */ }
    }).catch(() => !off && setErr(true))
    return () => { off = true }
  }, [tab, user.uid, tick])
  return <Modal title="My orders & bookings" onClose={onClose} wide>
    <div className="tabs"><button className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>My Orders</button><button className={tab === 'bookings' ? 'on' : ''} onClick={() => setTab('bookings')}>My Bookings &amp; Requests</button></div>
    {err ? <p className="err box">Could not load. Please try again.</p> : !rows ? <p className="muted center">Loading…</p> : !rows.length ? <p className="muted center">Nothing here yet.</p> :
      rows.map(r => {
        const id = String(r.id || r.time || r.createdAt), isOpen = open === id
        return <div key={id} className="card pad rec">
          <div className="rec-h"><b>{tab === 'orders' ? 'Order #' + String(r.id).slice(-6) : r.type === 'package' ? r.pkgName : (r.purpose || r.service)}</b><span className={'st ' + r.status}>{r.status}</span></div>
          {tab === 'orders'
            ? <>{(r.products || []).map((p, n) => <div key={n} style={{ fontSize: 14 }}>{p.emoji} {p.name} × {p.qty}</div>)}
                {r.total ? <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>Total ₹{Number(r.total).toLocaleString('en-IN')}</div> : null}
                {r.location && <small className="muted">Deliver to: {r.location}</small>}</>
            : <p>{r.date} · {r.slot}</p>}
          <div><small className="muted">{new Date(r.time || r.createdAt).toLocaleString('en-IN')}</small></div>
          <button type="button" onClick={() => setOpen(isOpen ? '' : id)} aria-expanded={isOpen}
            style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, padding: 0, border: 'none', background: 'none', color: G, font: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {tab === 'orders' ? 'Track order' : 'Track request'}<ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} /></button>
          {isOpen && <Track kind={kind} row={r} events={ev[String(r.id)]} />}
          {waTo && <a href={reachUsLink(waTo, tab, r, user.name)} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '8px 14px', borderRadius: 999, background: '#25D366', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            <MessageCircle size={16} />Reach us on WhatsApp</a>}
        </div>
      })}
  </Modal>
}
