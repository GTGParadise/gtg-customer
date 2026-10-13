import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase' // adjust if your client is exported differently

let cache = null
let catOrder = []
export function loadPlans() {
  if (!cache) cache = fetchAll().catch(e => { cache = null; throw e })
  return cache
}
export const refreshPlans = () => { cache = null; return loadPlans() }

async function fetchAll() {
  const [p, pl, a, c] = await Promise.all([
    supabase.from('subscription_plans').select('*').order('sort_order'),
    supabase.from('subscription_plants').select('*').order('sort_order'),
    supabase.from('subscription_addons').select('*').order('sort_order'),
    supabase.from('subscription_categories').select('*').order('sort_order')])
  const err = p.error || pl.error || a.error || c.error
  if (err) throw err
  catOrder = c.data.map(x => x.name)
  const rank = Object.fromEntries(p.data.map(x => [x.id, x.sort_order]))
  const plans = p.data.map(r => {
    const plants = pl.data.filter(x => rank[x.plan_id] <= r.sort_order)
      .map(x => ({ id: x.id, from: x.plan_id, cat: x.category, en: x.name_en, ta: x.name_ta, qty: x.qty, size: x.pot_size }))
    const addedCount = plants.filter(x => x.from === r.id).length
    return { id: r.id, name: r.name, title: r.title, level: r.level, emoji: r.emoji, blurb: r.blurb, approx: r.approx_plants,
      visits: r.visits || '', space: r.space, yield: r.monthly_yield, bestFor: r.best_for, services: r.services || [], plants,
      totalPots: plants.reduce((s, x) => s + (x.qty || 0), 0), species: plants.length, addedCount, inheritedCount: plants.length - addedCount }
  })
  return { plans, addOns: a.data.map(x => ({ group: x.group_name, items: x.items || [] })) }
}

export function usePlans() {
  const [s, setS] = useState({ plans: [], addOns: [], loading: true, error: '' })
  useEffect(() => {
    let on = true
    loadPlans().then(d => on && setS({ ...d, loading: false, error: '' }))
      .catch(() => on && setS(x => ({ ...x, loading: false, error: 'Could not load plans. Please try again.' })))
    return () => { on = false }
  }, [])
  return { ...s, getPlan: id => s.plans.find(p => p.id === id) }
}
export const planLabel = p => `${p.name} — ${p.title}`
export function groupByCategory(list) {
  const m = new Map()
  list.forEach(p => { if (!m.has(p.cat)) m.set(p.cat, []); m.get(p.cat).push(p) })
  const rank = c => { const i = catOrder.indexOf(c); return i < 0 ? 999 : i }
  return [...m].map(([cat, items]) => ({ cat, items })).sort((x, y) => rank(x.cat) - rank(y.cat))
}
