import { fetchPlans, groupByCategory, planLabel } from '../hooks/usePlans'
// Builds the PDF from the same DB-driven plan data shown on screen.
export async function downloadPlanPdf(planId, customer = {}) {
  const plans = await fetchPlans()
  const getPlan = id => plans.find(p => p.id === id)
  const plan = getPlan(planId)
  if (!plan) throw new Error('Plan not found')
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = 18
  const W = 210, M = 16
  const line = (t, size = 10, bold = false, color = [31, 41, 55]) => {
    if (y > 280) { doc.addPage(); y = 18 }
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...color)
    doc.splitTextToSize(String(t), W - 2 * M).forEach(s => { doc.text(s, M, y); y += size * 0.45 + 1.4 })
  }
  doc.setFillColor(20, 83, 45); doc.rect(0, 0, W, 26, 'F')
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text('GTG Paradise - Grow to Green', M, 15)
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.text('Plant Subscription Plan - Coimbatore', M, 21)
  y = 36
  line(planLabel(plan).replace('—', '-'), 16, true, [20, 83, 45])
  line(`Prepared on ${new Date().toLocaleDateString('en-IN')}${customer.name ? ' for ' + customer.name : ''}`, 9, false, [100, 116, 139]); y += 2
  line(['Total plants / pots: ' + plan.totalPots, 'Plant types: ' + plan.species, plan.visits && 'Visits: ' + plan.visits].filter(Boolean).join('   |   '), 10, true)
  const meta = [plan.space && 'Recommended space: ' + plan.space, plan.yield && `Estimated monthly yield: ${plan.yield} (estimate, not guaranteed)`].filter(Boolean)
  if (meta.length) line(meta.join('   |   '), 10)
  y += 2
  if (plan.services.length) { line('Included services', 12, true, [20, 83, 45]); plan.services.forEach(s => line('- ' + s)); y += 2 }
  line('Included plants (quantity)', 12, true, [20, 83, 45])
  const tiered = plan.addedCount < plan.species
  groupByCategory(plan.plants).forEach(g => {
    y += 1; line(g.cat, 10, true, [101, 163, 13])
    g.items.forEach(p => {
      const tag = !tiered ? '' : p.from === plan.id ? `   - New in ${plan.name}` : `   - Included from ${getPlan(p.from)?.name || 'lower tier'}`
      line(`${p.en}  x ${p.qty}   (${p.size || '-'})${tag}`, 9.5)
    })
  })
  y += 2; line(`Total: ${plan.totalPots} plants / pots`, 11, true); y += 2
  y += 2; line('Quantities and yield are approximate and vary with season, variety, sunlight and care. Pricing is confirmed by GTG Paradise.', 8.5, false, [100, 116, 139])
  doc.save(`GTG-Paradise-${plan.name}-Plan.pdf`)
}
