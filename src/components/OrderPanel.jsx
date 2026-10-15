import { useState, useEffect, useMemo, useRef } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useCart, cartKey } from '../hooks/useCart'
import { insertRow, supabase, configured } from '../lib/supabase'

const catOf = i => i.category || i.cat || i.group || 'Other'
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN')

// Plants come from the `plants` table (name, category, price, image); falls back to the catalog.
function useDbPlants() {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    if (!configured) return
    let off = false
    ;(async () => {
      const [p, t] = await Promise.all([
        supabase.from('plants').select('*').eq('is_active', true).order('name'),
        supabase.from('plant_types').select('key,label,sort_order'),
      ])
      if (off || p.error || !p.data?.length) return
      const label = {}, sort = {}
      ;(t.data || []).forEach(x => { label[x.key] = x.label || x.key; sort[x.key] = x.sort_order ?? 999 })
      setRows(p.data.map(r => ({
        id: r.id, name: r.name, category: label[r.category] || r.category || 'Other', sort: sort[r.category] ?? 999,
        price: r.price, emoji: '🌿',
        img: r.image_path ? supabase.storage.from('plants').getPublicUrl(r.image_path).data.publicUrl : '',
      })).sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name)))
    })().catch(() => {})
    return () => { off = true }
  }, [])
  return rows
}

// Materials come from the `materials` table (same source as the Materials section)
function useDbMaterials() {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    if (!configured) return
    let off = false
    supabase.from('materials').select('*').eq('is_active', true).order('name')
      .then(({ data, error }) => {
        if (off || error || !data?.length) return
        setRows(data.map(r => ({ id: r.id, name: r.name, category: r.category || 'Materials', price: r.price, emoji: '🧰',
          img: r.image_path ? supabase.storage.from('materials').getPublicUrl(r.image_path).data.publicUrl : '' })))
      }).catch(() => {})
    return () => { off = true }
  }, [])
  return rows
}

export default function OrderPanel({ plants = [], materials = [], onClose, toast, openMine }) {
  const { user } = useAuth()
  const dbPlants = useDbPlants(), dbMaterials = useDbMaterials()
  const [step, setStep] = useState('pick')
  const [tab, setTab] = useState('plant')
  const [cat, setCat] = useState('All')
  const cart = useCart()
  const done = useRef(false), closeRef = useRef(onClose)
  closeRef.current = onClose
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [pos, setPos] = useState({ top: 64, z: 60 })

  useEffect(() => {
    const bar = document.querySelector('.topbar')
    const measure = () => {
      if (!bar) return
      const zi = parseInt(getComputedStyle(bar).zIndex, 10)
      setPos({ top: bar.offsetHeight, z: Number.isFinite(zi) ? Math.max(zi - 1, 1) : 60 })
    }
    measure(); window.addEventListener('resize', measure)
    document.documentElement.style.overflow = 'hidden'   // html only, so the sticky top bar keeps working
    return () => { window.removeEventListener('resize', measure); document.documentElement.style.overflow = '' }
  }, [])

  const all = useMemo(() => [
    ...(dbPlants || plants).map(p => ({ ...p, kind: 'plant' })),
    ...(dbMaterials || materials).map(m => ({ ...m, kind: 'material' })),
  ], [dbPlants, dbMaterials, plants, materials])

  const key = cartKey
  const qty = i => cart.qty(i)
  const chg = (i, d) => cart.add({ ...i, category: catOf(i) }, d)
  const picked = cart.lines.map(l => ({ ...l.item, qty: l.qty }))
  const count = cart.count, total = cart.total
  const countOf = kind => cart.lines.filter(l => l.item.kind === kind).reduce((s, l) => s + l.qty, 0)

  const tabItems = all.filter(i => i.kind === tab)
  const cats = ['All', ...new Set(tabItems.map(catOf))]
  const inCat = i => cat === 'All' || catOf(i) === cat
  const selLines = cart.lines.filter(l => l.item.kind === tab && inCat(l.item))
  const selKeys = new Set(cart.lines.map(l => cartKey(l.item)))
  const groups = {}
  if (selLines.length) groups['Your selection'] = selLines.map(l => l.item)
  tabItems.filter(i => inCat(i) && !selKeys.has(cartKey(i))).forEach(i => { (groups[catOf(i)] ||= []).push(i) })
  const shown = Object.keys(groups)

  // Phone/browser back button: review -> list -> close
  useEffect(() => {
    if (window.history.state?.order !== 'pick') window.history.pushState({ order: 'pick' }, '')
    const onPop = e => {
      if (done.current) return
      if (e.state?.order === 'pick') setStep('pick'); else closeRef.current()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const closePanel = () => window.history.go(step === 'review' ? -2 : -1)
  const review = () => {
    if (!picked.length) return setErr('Add at least one plant or material.')
    setErr(''); window.history.pushState({ order: 'review' }, ''); setStep('review')
  }

  async function place() {
    if (busy) return
    setBusy(true); setErr('')
    try {
      await insertRow('orders', {
        id: Date.now(), userId: user.uid, user: user.name, whatsapp: user.whatsapp, location: user.location,
        products: picked.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, type: i.kind, category: catOf(i), qty: i.qty, price: Number(i.price || 0) })),
        total, notes: notes.trim(), time: new Date().toISOString(), status: 'pending', adminSeen: false,
      })
      toast('Order placed. We will contact you shortly.'); cart.clear(); done.current = true
      const h = () => { window.removeEventListener('popstate', h); closeRef.current(); openMine() }
      window.addEventListener('popstate', h); window.history.go(-2)
    } catch (e) { setErr('Failed to place order: ' + (e.message || 'please try again.')); setBusy(false) }
  }

  const tabBtn = on => ({ flex: 1, padding: '10px 8px', border: 0, cursor: 'pointer', font: 'inherit', fontWeight: 600, background: on ? '#1f6b3a' : '#eef4ef', color: on ? '#fff' : '#1f6b3a' })
  const chip = on => ({ flexShrink: 0, padding: '6px 14px', borderRadius: 999, cursor: 'pointer', font: 'inherit', fontSize: 14, border: on ? '1px solid #1f6b3a' : '1px solid #cfd8d2', background: on ? '#1f6b3a' : '#fff', color: on ? '#fff' : '#1a1a1a' })
  const line = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderBottom: '1px solid #f0f0f0' }
  const thumb = i => i.img
    ? <img src={i.img} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = 'none' }} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
    : <span style={{ width: 44, textAlign: 'center', fontSize: 26, flexShrink: 0 }}>{i.emoji}</span>

  return (
    <div role="dialog" aria-label="Order plants and materials"
      style={{ position: 'fixed', top: pos.top, left: 0, right: 0, bottom: 0, zIndex: pos.z, background: '#fff', color: '#1a1a1a', display: 'flex', flexDirection: 'column', boxShadow: '0 -2px 12px rgba(0,0,0,.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #e5e5e5' }}>
        <h3 style={{ margin: 0 }}>{step === 'pick' ? 'Place an order' : 'Review your order'}</h3>
        <button className="icon-btn" onClick={closePanel} aria-label="Close order window"><X /></button>
      </div>

      {step === 'pick' ? <>
        <div style={{ display: 'flex' }}>
          <button type="button" style={tabBtn(tab === 'plant')} onClick={() => { setTab('plant'); setCat('All') }}>Plants{countOf('plant') ? ` (${countOf('plant')})` : ''}</button>
          <button type="button" style={tabBtn(tab === 'material')} onClick={() => { setTab('material'); setCat('All') }}>Materials{countOf('material') ? ` (${countOf('material')})` : ''}</button>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 16px', borderBottom: '1px solid #eee' }}>
          {cats.map(c => <button key={c} type="button" style={chip(cat === c)} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '8px 16px' }}>
          {!shown.length && <p className="muted center">Nothing available here right now.</p>}
          {shown.map(name => { const list = groups[name]; return (
            <div key={name} style={{ marginBottom: 12 }}>
              <h4 style={{ margin: '12px 0 4px', color: '#1f6b3a' }}>{name}</h4>
              {list.map(i => (
                <div key={key(i)} style={line}>
                  {thumb(i)}
                  <span style={{ flex: 1, minWidth: 0 }}>{i.name}{i.price ? <small style={{ display: 'block', opacity: .75 }}>{money(i.price)}</small> : null}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="icon-btn" onClick={() => chg(i, -1)} aria-label={'Less ' + i.name}><Minus size={16} /></button>
                    <b style={{ minWidth: 20, textAlign: 'center' }}>{qty(i)}</b>
                    <button className="icon-btn" onClick={() => chg(i, 1)} aria-label={'More ' + i.name}><Plus size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )})}
        </div>
        <div style={{ padding: '10px 16px calc(10px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid #e5e5e5' }}>
          <small style={{ display: 'block', marginBottom: 6, opacity: .75 }}>Your selection is kept only until you refresh or close this page.</small>
          {err && <p className="err box" role="alert">{err}</p>}
          <button className="btn primary full" onClick={review}>Review order{count ? ` (${count} items${total ? ' · ' + money(total) : ''})` : ''}</button>
        </div>
      </> : <>
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '8px 16px' }}>
          {picked.map(i => (
            <div key={key(i)} style={line}>
              {thumb(i)}
              <span style={{ flex: 1, minWidth: 0 }}>{i.name}<small style={{ display: 'block', opacity: .75 }}>{i.qty} × {i.price ? money(i.price) : 'price on request'}</small></span>
              <b>{i.price ? money(i.qty * i.price) : ''}</b>
            </div>
          ))}
          <div style={{ ...line, borderBottom: 0, fontSize: 18 }}><b>Total ({count} items)</b><b>{total ? money(total) : 'We will confirm the price'}</b></div>
          <p style={{ margin: '4px 0', opacity: .8 }}>Delivery contact: {user.name}{user.whatsapp ? ' · ' + user.whatsapp : ''}{user.location ? ' · ' + user.location : ''}</p>
          <textarea rows={2} placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', marginTop: 8, padding: 8, borderRadius: 8, border: '1px solid #ccc', font: 'inherit' }} />
        </div>
        <div style={{ padding: '10px 16px calc(10px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid #e5e5e5', display: 'flex', gap: 8, flexDirection: 'column' }}>
          {err && <p className="err box" role="alert">{err}</p>}
          <button className="btn primary full" onClick={place} disabled={busy}>{busy ? 'Placing order…' : 'Confirm order'}</button>
          <button className="btn outline full" onClick={() => window.history.back()} disabled={busy}>Back to edit</button>
        </div>
      </>}
    </div>
  )
}
