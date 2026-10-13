// Usage: pdftotext -layout Plant_Subscription_Plan_Complete.pdf p.txt && node scripts/validate-subscriptions.mjs p.txt
// (bundle first: npx esbuild scripts/validate-subscriptions.mjs --bundle --platform=node --outfile=/tmp/v.cjs)
import fs from 'fs'
import { PLANS } from '../src/data/subscriptions.js'
const L = fs.readFileSync(process.argv[2], 'utf8').replace(/\f/g, '').split('\n')
const start = L.findIndex(l => l.startsWith('Quantity per plan')) + 2
const pdf = { basic: {}, standard: {}, premium: {} }
for (const l of L.slice(start)) {
  if (l.startsWith('Total')) break
  const m = l.match(/([A-Za-z][A-Za-z ]*?(?: \([^)]*\))?)\s{2,}([\d-])\s+([\d-])\s+([\d-])\s+/)
  if (m) ['basic', 'standard', 'premium'].forEach((t, i) => { if (m[2 + i] !== '-') pdf[t][m[1].trim()] = +m[2 + i] })
}
let bad = 0
const expect = { basic: 22, standard: 36, premium: 49 }
for (const p of PLANS) {
  const got = Object.fromEntries(p.plants.map(x => [x.en, x.qty]))
  const a = JSON.stringify(Object.entries(got).sort()), b = JSON.stringify(Object.entries(pdf[p.id]).sort())
  const ok = a === b && p.totalPots === expect[p.id]
  if (!ok) bad++
  console.log(p.id, ok ? 'OK' : 'MISMATCH', 'pots', p.totalPots, 'types', p.species, 'new', p.addedCount, 'inherited', p.inheritedCount)
}
const dup = PLANS[2].plants.map(x => x.id); if (new Set(dup).size !== dup.length) { bad++; console.log('DUPLICATES') }
process.exit(bad ? 1 : 0)
