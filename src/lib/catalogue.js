import { config } from '../config'
import { sampleProducts } from '../data/sampleProducts'
// Turns Google Drive share links into URLs an <img> tag can actually load.
export function imageUrl(u) {
  const s = String(u || '').trim()
  const m = s.match(/drive\.google\.com\/file\/d\/([\w-]+)/) || s.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?[^#]*id=([\w-]+)/) || s.match(/lh3\.googleusercontent\.com\/d\/([\w-]+)/)
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000` : s
}
const num = (v) => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v))
function pics(r) {
  let v = r.images ?? r.image ?? r.imageUrls ?? r.photos ?? []
  if (typeof v === 'string') v = v.split(/[\n;,]+/)
  return (Array.isArray(v) ? v : [v]).map((i) => {
    if (typeof i === 'string') { const [url, caption] = i.split('|'); return { url: url.trim(), caption: (caption || '').trim() } }
    return i
  }).filter((i) => i?.url).map((i) => ({ ...i, url: imageUrl(i.url) }))
}
function clean(r) {
  const tiers = (r.tiers || []).map((t) => ({ min: num(t.min), max: num(t.max), price: num(t.price) }))
    .filter((t) => t.min != null && t.price != null && t.price > 0 && (t.max == null || t.max >= t.min)).sort((a, b) => a.min - b.min)
  return { id: String(r.id || r.name || ''), name: r.name || 'Untitled design', category: r.category === 'Premium' ? 'Premium' : 'Budget Friendly',
    sizes: r.sizes?.length ? r.sizes : r.size ? [r.size] : [], description: r.description || '', colours: r.colours || [],
    images: pics(r), tiers, addons: (r.addons || []).filter((a) => a.name && num(a.charge) != null)
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
