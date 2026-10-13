import { useState } from 'react'
import { Check, Download, Sprout } from 'lucide-react'
import Modal, { Field } from './Modal'
import { Title } from './Sections'
import { useAuth } from '../hooks/useAuth'
import { insertRow } from '../lib/supabase'
import { downloadPlanPdf } from '../lib/subscriptionPdf'
import { PLANS, getPlan, planLabel, groupByCategory, ADD_ONS } from '../data/subscriptions'

export function Subscriptions({ selected, onSelect, onView }) {
  const rows = [
    ['Total plants / pots', p => p.totalPots], ['Plant types', p => p.species], ['Recommended garden space', p => p.space],
    ['Estimated monthly harvest*', p => p.yield], ['Maintenance visits', p => p.visits],
    ['Included services', p => <ul className="mini">{p.allServices.map(s => <li key={s}>{s}</li>)}</ul>],
    ['Plants available in this tier', p => p.id === 'basic' ? `All ${p.addedCount} base plant types` : `${p.inheritedCount} from lower tiers + ${p.addedCount} new: ${p.plants.filter(x => x.from === p.id).map(x => x.en).join(', ')}`]]
  return <section id="subscriptions"><div className="wrap"><Title tag="Plant Subscriptions" h="Choose Your Garden Plan" p="Plant provision and maintenance for Coimbatore homes. Pricing is shared on request." />
    <div className="grid g-pkg">{PLANS.map(p => <article key={p.id} className={'card sub' + (selected === p.id ? ' sel' : '')}>
      <div className="sub-img" aria-hidden="true">{p.emoji}</div>
      <div className="pad"><span className="lvl">{p.level}</span><h3>{p.name} — {p.title}</h3><p>{p.blurb}</p>
        <div className="chips"><span>About {p.approx} plants</span><span>{p.visits.split(',')[0]} visits</span></div>
        <ul className="ticks">{p.services.map(s => <li key={s}>{s}</li>)}</ul>
        <p className="best"><b>Best for:</b> {p.bestFor}</p>
        <button className="btn primary full" onClick={() => onView(p.id)}>View Included Plants</button></div></article>)}</div>
    <h3 className="cat mt">Compare plans</h3>
    <div className="table-wrap"><table className="cmp"><thead><tr><th></th>{PLANS.map(p => <th key={p.id} className={selected === p.id ? 'sel' : ''}>{p.name}<small>{p.title}</small></th>)}</tr></thead>
      <tbody>{rows.map(([l, f]) => <tr key={l}><th scope="row">{l}</th>{PLANS.map(p => <td key={p.id} className={selected === p.id ? 'sel' : ''}>{f(p)}</td>)}</tr>)}</tbody></table></div>
    <p className="muted small">*Harvest figures are estimates for container growing under normal care once established (2–3 months), not guaranteed results.</p>
    <div className="card pad addons"><h3>Optional add-ons <span className="badge-o">Not included in any plan</span></h3>
      <div className="grid g-info">{ADD_ONS.map(a => <div key={a.group}><b>{a.group}</b><p>{a.items.join(', ')}</p></div>)}</div></div></div></section>
}

export function PlanDetails({ planId, onClose, onSwitch, onContinue }) {
  const [view, setView] = useState('all'), [busy, setBusy] = useState(false)
  const plan = getPlan(planId)
  const list = plan.plants.filter(p => view === 'all' || (view === 'new' ? p.from === plan.id : p.from !== plan.id))
  return <Modal title={planLabel(plan)} onClose={onClose} wide>
    <div className="tabs">{PLANS.map(p => <button key={p.id} className={p.id === planId ? 'on' : ''} onClick={() => { onSwitch(p.id); setView('all') }}>{p.name}</button>)}</div>
    <div className="stats"><div><b>{plan.totalPots}</b><span>plants / pots</span></div><div><b>{plan.species}</b><span>plant types</span></div><div><b>{plan.visits.split(',')[0]}</b><span>visits</span></div></div>
    <p className="muted small">{plan.space} · estimated {plan.yield} (estimate, not guaranteed)</p>
    <h4>Included services</h4><ul className="ticks">{plan.services.map(s => <li key={s}>{s}</li>)}</ul>
    {plan.id !== 'basic' && <div className="tabs sm">{[['all', `All (${plan.species})`], ['new', `New in ${plan.name} (${plan.addedCount})`], ['old', `From lower tiers (${plan.inheritedCount})`]].map(([k, t]) =>
      <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{t}</button>)}</div>}
    {groupByCategory(list).map(g => <div key={g.cat}><h4 className="gh">{g.cat}</h4><div className="table-wrap"><table className="pl"><thead><tr><th>Plant</th><th>Qty</th><th>Pot size</th></tr></thead><tbody>
      {g.items.map(p => <tr key={p.id}><td><b>{p.en}</b>{p.ta && <small lang="ta">{p.ta}</small>}{plan.id !== 'basic' && <em className={p.from === plan.id ? 'tg new' : 'tg'}>{p.from === plan.id ? 'New' : 'From ' + getPlan(p.from).name}</em>}</td><td>{p.qty}</td><td>{p.size}</td></tr>)}</tbody></table></div></div>)}
    <p className="total"><b>Total: {plan.totalPots} plants / pots</b></p>
    <div className="row"><button className="btn primary" onClick={() => onContinue(planId)}>Continue with This Plan</button>
      <button className="btn outline" disabled={busy} onClick={async () => { setBusy(true); await downloadPlanPdf(planId); setBusy(false) }}><Download size={16} /> Download plan PDF</button></div>
  </Modal>
}

export function ContinueModal({ planId, onClose, toast, refresh }) {
  const { user } = useAuth(); const plan = getPlan(planId)
  const [f, setF] = useState({ name: user?.name || '', wa: user?.whatsapp || '', addr: '' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [done, setDone] = useState(false)
  async function submit(e) {
    e.preventDefault(); if (busy) return
    if (!f.name.trim()) return setErr('Please enter your name.')
    if (!/^[+]?[\d\s-]{8,15}$/.test(f.wa.trim())) return setErr('Please enter a valid WhatsApp number.')
    setBusy(true); setErr('')
    try {
      await insertRow('enquiry', { id: Date.now(), type: 'subscription', pkgName: planLabel(plan), name: f.name.trim(), wa: f.wa.trim(), address: f.addr.trim(),
        message: `${plan.totalPots} plants/pots, ${plan.species} types, visits: ${plan.visits}`, status: 'pending', userId: user?.uid || null, user: user?.name || f.name.trim(),
        createdAt: new Date().toISOString(), date: new Date().toLocaleDateString('en-IN'), slot: 'Subscription Request' })
      setDone(true); refresh(); toast('Subscription request sent. We will contact you shortly.')
    } catch { setErr('Could not send your request. Please try again.') } finally { setBusy(false) }
  }
  return <Modal title={`Continue with ${plan.name}`} onClose={onClose}>
    {done ? <div><p className="ok box" role="status"><Check size={16} /> Request received for {planLabel(plan)}.</p>
      <button className="btn primary full" onClick={() => downloadPlanPdf(planId, { name: f.name })}><Download size={16} /> Download confirmation PDF</button>
      <button className="btn ghost full" onClick={onClose}>Close</button></div> :
    <form onSubmit={submit} noValidate><p className="muted"><Sprout size={14} /> {planLabel(plan)} · {plan.totalPots} plants / pots · {plan.visits.split(',')[0]} visits. Pricing is confirmed by our team.</p>
      <Field label="Your name"><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
      <Field label="WhatsApp number"><input type="tel" value={f.wa} onChange={e => setF({ ...f, wa: e.target.value })} /></Field>
      <Field label="Garden address / area (optional)"><input value={f.addr} onChange={e => setF({ ...f, addr: e.target.value })} /></Field>
      {err && <p className="err box" role="alert">{err}</p>}<button className="btn primary full" disabled={busy}>{busy ? 'Sending…' : 'Send subscription request'}</button></form>}
  </Modal>
}
