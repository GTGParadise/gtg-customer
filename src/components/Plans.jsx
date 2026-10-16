import { useEffect, useMemo, useState } from 'react'
import { supabase, configured } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Title, Snap, Img } from './Sections'

// Subscription plans, read from: subscription_plans, plan_plant_allowances, plant_types.
// Choosing a plan lets the customer pick plant varieties up to each type's limit.
// Picks are saved to customer_subscriptions + subscription_plant_picks.
const BUCKET = 'plants'

function usePlans() {
  const [plans, setPlans] = useState([])
  useEffect(() => {
    if (!configured) return
    let off = false
    ;(async () => {
      try {
        const [p, a] = await Promise.all([
          supabase.from('subscription_plans').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('plan_plant_allowances')
            .select('plan_id, plant_types_count, plant_types(key, label, sort_order, is_active)')
        ])
        if (off || p.error || !p.data) return
        const byPlan = {}
        ;(a.data || []).forEach(r => {
          if (!r.plant_types || r.plant_types.is_active === false || !r.plant_types_count) return
          ;(byPlan[r.plan_id] ||= []).push({
            key: r.plant_types.key, label: r.plant_types.label || r.plant_types.key,
            sort: r.plant_types.sort_order || 0, count: r.plant_types_count
          })
        })
        Object.values(byPlan).forEach(l => l.sort((x, y) => y.count - x.count || x.label.localeCompare(y.label)))
        setPlans(p.data.map(x => ({ ...x, allowances: byPlan[x.id] || [] })))
      } catch { /* leave empty */ }
    })()
    return () => { off = true }
  }, [])
  return plans
}

function PickModal({ plan, onClose, toast, refresh }) {
  const { user } = useAuth()
  const [plants, setPlants] = useState([])
  const [picked, setPicked] = useState({})   // plant id -> category
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const limits = useMemo(() => Object.fromEntries(plan.allowances.map(a => [a.key, a.count])), [plan])
  const total = plan.allowances.reduce((s, a) => s + a.count, 0)
  const used = cat => Object.values(picked).filter(c => c === cat).length
  const count = Object.keys(picked).length

  useEffect(() => {
    let off = false
    supabase.from('plants').select('id, name, tamil_name, category, image_path')
      .eq('is_active', true).in('category', Object.keys(limits)).order('name')
      .then(({ data }) => { if (!off) { setPlants(data || []); setLoading(false) } })
      .catch(() => setLoading(false))
    return () => { off = true }
  }, [limits])

  const toggle = p => setPicked(cur => {
    const next = { ...cur }
    if (next[p.id]) { delete next[p.id]; return next }
    if (Object.values(next).filter(c => c === p.category).length >= limits[p.category]) return cur
    next[p.id] = p.category
    return next
  })

  const confirm = async () => {
    if (!user || busy || !count) return
    setBusy(true)
    const { data: sub, error } = await supabase.from('customer_subscriptions')
      .insert({ user_id: user.id, plan_id: plan.id }).select('id').single()
    if (error) { setBusy(false); return toast('Could not start the subscription: ' + error.message) }
    const { error: e2 } = await supabase.from('subscription_plant_picks')
      .insert(Object.keys(picked).map(plant_id => ({ subscription_id: sub.id, plant_id })))
    if (e2) {
      await supabase.from('customer_subscriptions').delete().eq('id', sub.id)  // no half-saved plan
      setBusy(false)
      return toast('Could not save your plants: ' + e2.message)
    }
    setBusy(false); toast(`${plan.name} plan started with ${count} plants.`); refresh && refresh(); onClose()
  }

  const box = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }
  const card = { background: '#fff', color: '#1a1a1a', borderRadius: 14, width: '100%', maxWidth: 720, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }

  return <div style={box} onClick={onClose} role="dialog" aria-modal="true" aria-label={`Pick plants for ${plan.name}`}>
    <div style={card} onClick={e => e.stopPropagation()}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e5e5' }}>
        <h3 style={{ margin: 0 }}>{plan.name} plan: pick your plants</h3>
        <p style={{ margin: '4px 0 0', opacity: .75 }}>{count} of {total} varieties chosen</p>
      </div>
      <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
        {loading && <p>Loading plants…</p>}
        {!loading && plan.allowances.map(a => {
          const list = plants.filter(p => p.category === a.key)
          const full = used(a.key) >= a.count
          return <div key={a.key} style={{ marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 8px' }}>{a.label} <small style={{ fontWeight: 400, opacity: .75 }}>({used(a.key)}/{a.count})</small></h4>
            {!list.length && <p style={{ opacity: .7 }}>No plants available in this type right now.</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
              {list.map(p => {
                const on = !!picked[p.id], disabled = !on && full
                return <button key={p.id} type="button" onClick={() => toggle(p)} disabled={disabled} aria-pressed={on}
                  style={{ textAlign: 'left', padding: 8, borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1,
                    border: on ? '2px solid #2e7d32' : '1px solid #ccc', background: on ? '#e8f5e9' : '#fff', color: 'inherit', font: 'inherit' }}>
                  <Img cls="" src={p.image_path ? supabase.storage.from(BUCKET).getPublicUrl(p.image_path).data.publicUrl : ''}
                    emoji="🌿" alt={p.name} />
                  <b style={{ display: 'block', marginTop: 4 }}>{on ? '✓ ' : ''}{p.name}</b>
                  {p.tamil_name && <small style={{ opacity: .75 }}>{p.tamil_name}</small>}
                </button>
              })}
            </div>
          </div>
        })}
      </div>
      <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e5e5', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn outline" type="button" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="btn primary" type="button" onClick={confirm} disabled={busy || !count}>
          {busy ? 'Saving…' : `Confirm ${count} plant${count === 1 ? '' : 's'}`}
        </button>
      </div>
    </div>
  </div>
}

export function Plans({ openAuth, toast, refresh }) {
  const { user } = useAuth()
  const plans = usePlans()
  const [pick, setPick] = useState(null)
  if (!plans.length) return null   // hidden until subscription_plans has rows

  const choose = p => {
    if (!user) { toast('Please sign in first.'); return openAuth('signin') }
    setPick(p)
  }

  return <section id="subscriptions"><div className="wrap">
    <Title tag="Subscription Plans" h="Choose Your Plan" p="Pick a plan, then choose your own plant varieties" />
    <Snap>{plans.map(p => {
      const total = p.allowances.reduce((s, a) => s + a.count, 0)
      return <article key={p.id} className={'card pad pkg' + (p.is_featured ? ' feat' : '')}>
        {p.is_featured && <span className="badge">Most popular</span>}
        <h3>{p.name}</h3>
        <div className="pkg-price">{p.price != null && p.price !== '' ? <>₹{Number(p.price).toLocaleString('en-IN')}{p.period && <small> / {p.period}</small>}</> : <small>Price on request</small>}</div>
        <ul>
          <li><b>{total} plant varieties</b></li>
          {p.allowances.map(a => <li key={a.key}>{a.count} × {a.label}</li>)}
          {(p.features || []).map(f => <li key={f}>{f}</li>)}
        </ul>
        <button className={'btn full ' + (p.is_featured ? 'primary' : 'outline')} onClick={() => choose(p)}>Choose plan</button>
      </article>
    })}</Snap>
    {pick && <PickModal plan={pick} onClose={() => setPick(null)} toast={toast} refresh={refresh} />}
  </div></section>
}

export default Plans
          
