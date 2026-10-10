import { config } from '../config'
import { sampleProducts } from '../data/sampleProducts'
const num = (v) => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v))
function clean(r) {
  const tiers = (r.tiers || []).map((t) => ({ min: num(t.min), max: num(t.max), price: num(t.price) }))
    .filter((t) => t.min != null && t.price != null && t.price > 0 && (t.max == null || t.max >= t.min)).sort((a, b) => a.min - b.min)
  return { id: String(r.id || r.name || ''), name: r.name || 'Untitled design', category: r.category === 'Premium' ? 'Premium' : 'Budget Friendly',
    sizes: r.sizes?.length ? r.sizes : r.size ? [r.size] : [], description: r.description || '', colours: r.colours || [],
    images: (r.images || []).filter((i) => i?.url), tiers, addons: (r.addons || []).filter((a) => a.name && num(a.charge) != null)
      .map((a) => ({ ...a, charge: Number(a.charge), unit: a.unit === 'card' ? 'card' : 'order' })), minQuantity: num(r.minQuantity), designCharge: num(r.designCharge), status: r.status }
}
export async function loadCatalogue() {
  if (!config.catalogueUrl) return { products: sampleProducts, sample: true }
  const res = await fetch(config.catalogueUrl)
  if (!res.ok) throw new Error(`Catalogue request failed (${res.status})`)
  const data = await res.json()
  const rows = Array.isArray(data) ? data : data.products
  if (!Array.isArray(rows)) throw new Error('Catalogue format not recognised')
  return { products: rows.filter((r) => String(r.status).toLowerCase() === 'published').map(clean), sample: false }
}
