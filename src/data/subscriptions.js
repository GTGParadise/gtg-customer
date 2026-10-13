// Single source of truth for subscription plans. Source: Plant_Subscription_Plan_Complete.pdf
// Plant data lives in plantAdditions.json (new plants per tier only). Each plan's full list is DERIVED here.
import additions from './plantAdditions.json'

export const CATEGORY_ORDER = ['Greens', 'Herbs and flavour plants', 'Vegetables', 'Everyday pots', 'Extras', 'Climbers', 'Trees and perennials', 'Tubers']
const TIERS = ['basic', 'standard', 'premium']

const META = {
  basic: { name: 'Basic', title: 'Daily Cooking Kit', approx: 22, visits: 'Fortnightly', space: '40–50 sq ft', yield: '5–8 kg per month', level: 'Beginner / small spaces', emoji: '🥬🍅🌿',
    blurb: 'The plants used in everyday cooking, so you get value from the first week.',
    ownServices: ['Grow bags', 'Soil mix', 'Seeds / saplings', 'Watering and feeding guidance'],
    bestFor: 'Beginners, small balconies and daily cooking needs' },
  standard: { name: 'Standard', title: 'Family Kitchen Garden', approx: 36, visits: 'Fortnightly, with compost and bio-pesticide care', space: '70–90 sq ft', yield: '10–15 kg per month', level: 'Family / balcony or sit-out', emoji: '🥒🥕🌼',
    blurb: 'More vegetable variety and regular harvests for the whole family.',
    ownServices: ['Compost', 'Bio-pesticide care', 'Seasonal crop rotation'],
    bestFor: 'Families wanting variety and regular harvest' },
  premium: { name: 'Premium', title: 'Terrace Farm', approx: 49, visits: 'Weekly', space: '120–150 sq ft', yield: '18–30 kg per month', level: 'Terrace / large space', emoji: '🍋🎃🌳',
    blurb: 'A near-complete home farm with climbers, fruit trees and tubers.',
    ownServices: ['Trellis / pandal setup', 'Plant replacement', 'Soil and pest program', 'Harvest guidance'],
    bestFor: 'Terrace owners wanting a near-complete home farm' },
}

export const PLANS = TIERS.map((id, i) => {
  const lower = TIERS.slice(0, i)
  const inherited = lower.flatMap(t => additions[t].map(p => ({ ...p, from: t })))
  const added = additions[id].map(p => ({ ...p, from: id }))
  const plants = [...inherited, ...added]
  const m = META[id]
  const services = [...(i ? [`Everything in ${META[lower[i - 1]].name}`] : []), ...m.ownServices]
  const allServices = TIERS.slice(0, i + 1).flatMap(t => META[t].ownServices)
  return { id, ...m, services, allServices, plants, addedCount: added.length, inheritedCount: inherited.length,
    totalPots: plants.reduce((s, p) => s + p.qty, 0), species: plants.length }
})
export const getPlan = id => PLANS.find(p => p.id === id)
export const planLabel = p => `${p.name} — ${p.title}`

export const groupByCategory = plants => CATEGORY_ORDER.map(cat => ({ cat, items: plants.filter(p => p.cat === cat) })).filter(g => g.items.length)

// Optional add-ons: NOT part of any plan's included plants.
export const ADD_ONS = [
  { group: 'Flowers', items: ['Jasmine', 'Hibiscus', 'Crossandra (Kanagambaram)', 'Nithyakalyani'] },
  { group: 'Medicinal pots', items: ['Keezhanelli', 'Adathodai', 'Nilavembu', 'Thoothuvalai', 'Karpooravalli (ajwain)'] },
  { group: 'Microgreens kits', items: ['Low effort, quick harvest, good entry product'] },
  { group: 'Fruits (Premium customers)', items: ['Dwarf mango', 'Fig', 'Sapota (dwarf)', 'Passion fruit'] },
]
