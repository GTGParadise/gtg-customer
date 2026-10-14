import { useState, useEffect } from 'react'
import Modal, { Field } from './Modal'
import { Title } from './Sections'
import PhoneInput, { cleanPhone, isValidPhone, toFullPhone } from './PhoneInput'
import { useAuth } from '../hooks/useAuth'
import { insertRow, supabase, configured } from '../lib/supabase'
const SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
const iso = d => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10) }

export function BookVisit({ slots, openAuth, toast, refresh }) {
  const { user } = useAuth()
  const [f, setF] = useState({ name: '', wa: '', purpose: 'New Terrace Garden Setup', date: '', slot: '' })
  const [full, setFull] = useState({}), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { if (user) setF(p => ({ ...p, name: p.name || user.name, wa: p.wa || cleanPhone(user.whatsapp) })) }, [user])
  useEffect(() => {
    if (!f.date || !configured) return
    supabase.from('enquiry').select('slot').eq('date', f.date).then(({ data }) => {
      const c = {}; (data || []).forEach(r => { c[r.slot] = (c[r.slot] || 0) + 1 }); setFull(c) })
  }, [f.date])
  const blocked = s => (slots[f.date] || {})[s] === false || (full[s] || 0) >= 3
  async function submit(e) {
    e.preventDefault(); if (busy) return
    if (!user) { toast('Please sign in to book a visit.'); return openAuth('signin') }
    if (!f.name.trim()) return setErr('Please enter your name.')
    if (!isValidPhone(f.wa)) return setErr('Please enter a valid 10-digit WhatsApp number.')
    if (!f.date) return setErr('Please select a date.')
    if (!f.slot) return setErr('Please select a time slot.')
    setBusy(true); setErr('')
    try {
      await insertRow('enquiry', { id: Date.now(), name: f.name.trim(), wa: toFullPhone(f.wa), purpose: f.purpose, date: f.date, slot: f.slot,
        status: 'pending', createdAt: new Date().toISOString(), user: user.name, userId: user.uid })
      toast(`Booking confirmed for ${f.date} at ${f.slot}.`); setF({ ...f, date: '', slot: '' }); refresh()
    } catch { setErr('Could not save your booking. Please try again.') } finally { setBusy(false) }
  }
  return <section id="visit-booking"><div className="wrap narrow"><Title tag="Customer Care" h="Book a Site Visit" p="Select your preferred date and time – we'll confirm your slot" />
    <form className="card pad" onSubmit={submit} noValidate>
      {!user && <p className="notice">Please <button type="button" className="link" onClick={() => openAuth('signin')}>sign in</button> or <button type="button" className="link" onClick={() => openAuth('register')}>register</button> to book a visit.</p>}
      <Field label="Preferred date"><input type="date" min={iso(new Date())} value={f.date} onChange={e => setF({ ...f, date: e.target.value, slot: '' })} /></Field>
      <div className="field"><span>Time slot</span>{f.date ? <div className="slots">{SLOTS.map(s => <button type="button" key={s} disabled={blocked(s)} className={'slot' + (f.slot === s ? ' on' : '')} onClick={() => setF({ ...f, slot: s })}>{s}{blocked(s) ? ' (unavailable)' : ''}</button>)}</div> : <small className="muted">Select a date first.</small>}</div>
      <Field label="Your name"><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
      <Field label="WhatsApp number"><PhoneInput value={f.wa} onChange={v => setF(p => ({ ...p, wa: v }))} name="wa" /></Field>
      <Field label="Purpose of visit"><select value={f.purpose} onChange={e => setF({ ...f, purpose: e.target.value })}>{['New Terrace Garden Setup', 'Balcony Garden Consultation', 'Maintenance Discussion', 'Material Purchase Enquiry', 'General Enquiry'].map(o => <option key={o}>{o}</option>)}</select></Field>
      {err && <p className="err box" role="alert">{err}</p>}
      <button className="btn primary full" disabled={busy}>{busy ? 'Saving…' : 'Confirm booking'}</button>
    </form></div></section>
}

export function PlanModal({ plan, onClose, openAuth, toast, refresh }) {
  const { user } = useAuth(); const [f, setF] = useState({ name: user?.name || '', wa: cleanPhone(user?.whatsapp), addr: '', msg: '' })
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); if (busy) return
    if (!f.name.trim()) return setErr('Please enter your name.')
    if (!isValidPhone(f.wa)) return setErr('Please enter a valid 10-digit WhatsApp number.')
    setBusy(true)
    try {
      await insertRow('enquiry', { type: 'package', pkgId: plan.id, pkgName: plan.name, pkgPrice: plan.price, pkgPeriod: plan.period, name: f.name.trim(), wa: toFullPhone(f.wa),
        address: f.addr, message: f.msg, status: 'pending', userId: user?.uid || null, user: user?.name || f.name.trim(), createdAt: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-IN'), slot: 'Package Request' })
      toast(`${plan.name} request sent. We'll contact you soon.`); refresh(); onClose()
    } catch { setErr('Could not submit your request. Please try again.'); setBusy(false) }
  }
  return <Modal title={`Book: ${plan.name}`} onClose={onClose}><form onSubmit={submit} noValidate>
    <p className="muted">₹{Number(plan.price).toLocaleString('en-IN')} {plan.period}</p>
    <Field label="Your name"><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
    <Field label="WhatsApp number"><PhoneInput value={f.wa} onChange={v => setF(p => ({ ...p, wa: v }))} name="wa" /></Field>
    <Field label="Address (optional)"><input value={f.addr} onChange={e => setF({ ...f, addr: e.target.value })} /></Field>
    <Field label="Message (optional)"><textarea rows={3} value={f.msg} onChange={e => setF({ ...f, msg: e.target.value })} /></Field>
    {err && <p className="err box" role="alert">{err}</p>}<button className="btn primary full" disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}</button></form></Modal>
                                                                                            }
