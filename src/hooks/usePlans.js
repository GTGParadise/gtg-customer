import { useEffect, useState, useCallback } from 'react'
import { supabase, configured } from '../lib/supabase'

let cache = null, inflight = null

async function load() {
  if (!configured) throw new Error('Backend not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  const [p, pp, pl] = await Promise.all([
    supabase.from('plans').select('*').order('sort_order'),
    supabase.from('plan_plants').select('plan_id, plant_id, qty'),
    supabase.from('plants').select('*').eq('is_active', true),
  ])
  const err = p.error || pp.error || pl.error
  if (err) throw err

  const plantMap = new Map(pl.data.map(x => [x.id, x]))
  const byPlan = {}
  pp.data.forEach(r => (byPlan[r.plan_id] ||= []).push(r))

  // Plans are cumulative: a plant is "new" in the first plan (by sort_order) that lists it.
  const running = new Map() // plantId -> { qty, from }
  return p.data.map((row, i) => {
    ;(byPlan[row.id] || []).forEach(r => {
      if (!plantMap.has(r.plant_id)) return
      const cur = running.get(r.plant_id)
      running.set(r.plant_id, { qty: r.qty, from: cur ? cur.from : row.id })
    })
    const plants = [...running].map(([id, v]) => {
      const x = plantMap.get(id)
      return {
        id, en: x.name, ta: x.tamil_name, category: x.category || 'Other',
        qty: v.qty, size: x.container, from: v.from, image: x.image_path,
        regrows: x.regrows, harvestMin: x.harvest_days_min, harvestMax: x.harvest_days_max,
      }
    })
    const totalPots = plants.reduce((s, x) => s + x.qty, 0)
    const addedCount = plants.filter(x => x.from === row.id).length
    return {
      level: `Tier ${i + 1}`, title: '', blurb: '', emoji: '🌱', visits: '',
      space: '', yield: '',
      ...row,
      bestFor: row.best_for ?? row.bestFor ?? '',
      services: row.services || [],
      plants, totalPots, approx: totalPots, species: plants.length,
      addedCount, inheritedCount: plants.length - addedCount,
    }
  })
}

// For non-React callers (e.g. PDF export): returns the same cached DB data.
export async function fetchPlans() {
  if (cache) return cache
  inflight ||= load()
  try { cache = await inflight; return cache } catch (e) { inflight = null; throw e }
}

export function usePlans() {
  const [plans, setPlans] = useState(cache || [])
  const [loading, setLoading] = useState(!cache)
  const [error, setError] = useState('')

  useEffect(() => {
    if (cache) return
    inflight ||= load()
    inflight
      .then(r => { cache = r; setPlans(r) })
      .catch(e => { console.error('usePlans:', e); inflight = null; setError('Could not load plans. Please try again.') })
      .finally(() => setLoading(false))
  }, [])

  const getPlan = useCallback(id => plans.find(p => p.id === id), [plans])
  return { plans, addOns: [], loading, error, getPlan }
}

export const planLabel = p => (p.title ? `${p.name} — ${p.title}` : p.name)

export function groupByCategory(list) {
  const m = new Map()
  list.forEach(x => { if (!m.has(x.category)) m.set(x.category, []); m.get(x.category).push(x) })
  return [...m].map(([cat, items]) => ({ cat, items }))
}
