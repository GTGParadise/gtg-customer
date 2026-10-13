import { useState, useEffect } from 'react'
import { MessageCircle, Phone, Mail, MapPin, Clock } from 'lucide-react'
import Modal, { Field } from './Modal'
import { Title } from './Sections'
import { useAuth } from '../hooks/useAuth'
import { insertRow, supabase, configured } from '../lib/supabase'
const SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
const PHONE = /^[+]?[\d\s-]{8,15}$/
const waLink = (c, text) => `https://wa.me/${String(c.whatsapp || c.phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
const iso = d => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10) }

export function BookVisit({ slots, openAuth, toast, refresh }) {
  const { user } = useAuth()
  const [f, setF] = useState({ name: '', wa: '', purpose: 'New Terrace Garden Setup', date: '', slot: '' })
  const [full, setFull] = useState({}), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { if (user) setF(p => ({ ...p, name: p.name || user.name, wa: p.wa || user.whatsapp })) }, [user])
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
    if (!PHONE.test(f.wa.trim())) return setErr('Please enter a valid WhatsApp number.')
    if (!f.date) return setErr('Please select a date.')
    if (!f.slot) return setErr('Please select a time slot.')
    setBusy(true); setErr('')
    try {
      await insertRow('enquiry', { id: Date.now(), name: f.name.trim(), wa: f.wa.trim(), purpose: f.purpose, date: f.date, slot: f.slot,
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
      <Field label="WhatsApp number"><input type="tel" value={f.wa} onChange={e => setF({ ...f, wa: e.target.value })} placeholder="+91 XXXXX XXXXX" /></Field>
      <Field label="Purpose of visit"><select value={f.purpose} onChange={e => setF({ ...f, purpose: e.target.value })}>{['New Terrace Garden Setup', 'Balcony Garden Consultation', 'Maintenance Discussion', 'Material Purchase Enquiry', 'General Enquiry'].map(o => <option key={o}>{o}</option>)}</select></Field>
      {err && <p className="err box" role="alert">{err}</p>}
      <button className="btn primary full" disabled={busy}>{busy ? 'Saving…' : 'Confirm booking'}</button>
    </form></div></section>
}

export function Contact({ contact: c }) {
  const [f, setF] = useState({ name: '', phone: '', service: 'Home Gardening', location: '', message: '', website: '' })
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false), { user } = useAuth()
  const wa = () => waLink(c, c.whatsappMessage || `Hi GTG Paradise, I'd like a quote. ${f.message}`)
  async function submit(e) {
    e.preventDefault(); if (busy || f.website) return
    if (!f.name.trim()) return setErr('Please enter your name.')
    if (!PHONE.test(f.phone.trim())) return setErr('Please enter a valid phone number.')
    if (!f.message.trim()) return setErr('Please enter a message.')
    setBusy(true); setErr('')
    try {
      await insertRow('enquiry', { id: Date.now(), name: f.name.trim(), phone: f.phone.trim(), service: f.service,
        message: f.message.trim() + (f.location ? '\nLocation: ' + f.location : ''), type: 'general', status: 'pending',
        createdAt: new Date().toISOString(), user: user?.name || 'guest', userId: user?.uid || null })
      setF({ ...f, name: '', phone: '', location: '', message: '' }); setErr(''); setSent(true)
    } catch { setErr('Could not send enquiry. Please try again or use WhatsApp.') } finally { setBusy(false) }
  }
  const [sent, setSent] = useState(false)
  return <section id="contact" className="alt"><div className="wrap"><Title tag="Reach Us" h="Contact Us" p="Get in touch for a free site visit and quotation" />
    <div className="grid g-contact"><div className="card pad info"><h3>GTG Paradise, Coimbatore</h3>
      <p><MapPin size={18} />{c.address}</p><p><Phone size={18} /><a href={'tel:' + String(c.phone).replace(/\s/g, '')}>{c.phone}</a></p>
      <p><Mail size={18} /><a href={'mailto:' + c.email}>{c.email}</a></p><p><Clock size={18} />{c.hours}</p>
      {c.instagram && <p><a href={c.instagram.startsWith('http') ? c.instagram : 'https://instagram.com/' + c.instagram.replace('@', '')} target="_blank" rel="noreferrer">Instagram</a></p>}</div>
    <form className="card pad" onSubmit={submit} noValidate><h3>Send an Enquiry</h3>
      <Field label="Your name"><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
      <Field label="Phone number"><input type="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></Field>
      <Field label="Service interested in"><select value={f.service} onChange={e => setF({ ...f, service: e.target.value })}>{['Home Gardening', 'Terrace Gardening', 'Balcony Gardening', 'Landscaping', 'Garden Maintenance'].map(o => <option key={o}>{o}</option>)}</select></Field>
      <Field label="Location"><input value={f.location} onChange={e => setF({ ...f, location: e.target.value })} placeholder="Area in Coimbatore" /></Field>
      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={e => setF({ ...f, website: e.target.value })} />
      <Field label="Message"><textarea rows={4} value={f.message} onChange={e => { setSent(false); setF({ ...f, message: e.target.value }) }} /></Field>
      {err && <p className="err box" role="alert">{err}</p>}{sent && <p className="ok box" role="status">Enquiry received. We will contact you soon.</p>}
      <button className="btn primary full" disabled={busy}>{busy ? 'Sending…' : 'Send enquiry'}</button>
      <a className="btn outline full wa" href={wa()} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Send via WhatsApp instead</a></form></div></div></section>
}

export function PlanModal({ plan, onClose, openAuth, toast, refresh }) {
  const { user } = useAuth(); const [f, setF] = useState({ name: user?.name || '', wa: user?.whatsapp || '', addr: '', msg: '' })
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); if (busy) return
    if (!f.name.trim()) return setErr('Please enter your name.')
    if (!PHONE.test(f.wa.trim())) return setErr('Please enter a valid WhatsApp number.')
    setBusy(true)
    try {
      await insertRow('enquiry', { type: 'package', pkgId: plan.id, pkgName: plan.name, pkgPrice: plan.price, pkgPeriod: plan.period, name: f.name.trim(), wa: f.wa.trim(),
        address: f.addr, message: f.msg, status: 'pending', userId: user?.uid || null, user: user?.name || f.name.trim(), createdAt: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-IN'), slot: 'Package Request' })
      toast(`${plan.name} request sent. We'll contact you soon.`); refresh(); onClose()
    } catch { setErr('Could not submit your request. Please try again.'); setBusy(false) }
  }
  return <Modal title={`Book: ${plan.name}`} onClose={onClose}><form onSubmit={submit} noValidate>
    <p className="muted">₹{Number(plan.price).toLocaleString('en-IN')} {plan.period}</p>
    <Field label="Your name"><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
    <Field label="WhatsApp number"><input type="tel" value={f.wa} onChange={e => setF({ ...f, wa: e.target.value })} /></Field>
    <Field label="Address (optional)"><input value={f.addr} onChange={e => setF({ ...f, addr: e.target.value })} /></Field>
    <Field label="Message (optional)"><textarea rows={3} value={f.msg} onChange={e => setF({ ...f, msg: e.target.value })} /></Field>
    {err && <p className="err box" role="alert">{err}</p>}<button className="btn primary full" disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}</button></form></Modal>
}
