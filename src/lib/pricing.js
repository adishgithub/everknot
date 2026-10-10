import { config } from '../config'
export const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
export const rateFor = (tiers = [], qty) => tiers.find((t) => qty >= t.min && (t.max == null || qty <= t.max)) || null
export const startingPrice = (p) => (p.tiers?.length ? Math.min(...p.tiers.map((t) => t.price)) : null)
export const tierLabel = (t) => (t.max == null ? `Above ${(t.min - 1).toLocaleString('en-IN')}` : `${t.min.toLocaleString('en-IN')}–${t.max.toLocaleString('en-IN')}`)
export function calculate(product, qty, addons = []) {
  const min = product.minQuantity || config.minQuantity
  if (!Number.isInteger(qty) || qty < min) return { error: `Minimum order is ${min} cards.` }
  let tier = rateFor(product.tiers, qty)
  // No price listed for this quantity: apply the lowest-quantity (first) rate, and flag it so the customer and admin can see.
  const fallback = !tier && product.tiers?.length > 0
  if (fallback) tier = product.tiers[0]
  if (!tier) return { error: 'No prices are listed for this design yet. Please send an enquiry on WhatsApp for a quote.', enquiry: true }
  const printing = qty * tier.price
  const design = product.designCharge ?? config.designChargeDefault
  const addonLines = addons.map((a) => ({ ...a, total: a.unit === 'card' ? a.charge * qty : a.charge }))
  const addonTotal = addonLines.reduce((s, a) => s + a.total, 0)
  return { rate: tier.price, fallback, printing, design, addonLines, total: printing + design + addonTotal }
}
