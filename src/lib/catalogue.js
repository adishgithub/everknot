import { config } from '../config'
import { sampleProducts } from '../data/sampleProducts'

// Turns Google Drive share links into URLs an <img> tag can actually load.
export function imageUrl(u) {
  const s = String(u || '').trim()
  const m = s.match(/drive\.google\.com\/file\/d\/([\w-]+)/) || s.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?[^#]*id=([\w-]+)/) || s.match(/lh3\.googleusercontent\.com\/d\/([\w-]+)/)
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000` : s
}
const num = (v) => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v))
const toList = (v) => (Array.isArray(v) ? v : String(v ?? '').split(/[,;\n]+/)).map((x) => String(x).trim()).filter(Boolean)
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function pics(r) {
  let v = r.images ?? r.image ?? r.imageUrls ?? r.photos ?? []
  if (typeof v === 'string') v = v.split(/[\n;,]+/)
  return (Array.isArray(v) ? v : [v]).map((i) => {
    if (typeof i === 'string') { const [url, caption] = i.split('|'); return { url: url.trim(), caption: (caption || '').trim() } }
    return i
  }).filter((i) => i?.url).map((i) => ({ ...i, url: imageUrl(i.url) }))
}
// Every field except the name is optional. Missing data is left out, never invented.
function clean(r, idx) {
  const name = String(r.name).trim()
  const cat = String(r.category || '').toLowerCase()
  const tiers = (Array.isArray(r.tiers) ? r.tiers : []).map((t) => ({ min: num(t.min), max: num(t.max), price: num(t.price) }))
    .filter((t) => t.min != null && t.price != null && t.price > 0 && (t.max == null || t.max >= t.min)).sort((a, b) => a.min - b.min)
  return { id: String(r.id || '').trim() || slug(name) || `item-${idx}`, name,
    category: cat.includes('premium') ? 'Premium' : cat.includes('budget') ? 'Budget Friendly' : '',
    sizes: toList(r.sizes ?? r.size), description: String(r.description || '').trim(), colours: toList(r.colours ?? r.colour),
    images: pics(r), tiers,
    addons: (Array.isArray(r.addons) ? r.addons : []).filter((a) => a?.name && num(a.charge) != null)
      .map((a) => ({ ...a, charge: Number(a.charge), unit: a.unit === 'card' ? 'card' : 'order' })),
    minQuantity: num(r.minQuantity), designCharge: num(r.designCharge) }
}
export async function loadCatalogue() {
  if (!config.catalogueUrl) return { products: sampleProducts, sample: true }
  const res = await fetch(config.catalogueUrl)
  if (!res.ok) throw new Error(`Catalogue request failed (${res.status})`)
  const data = await res.json()
  const rows = Array.isArray(data) ? data : data.products
  if (!Array.isArray(rows)) throw new Error('Catalogue format not recognised')
  const hasStatus = rows.some((r) => r && 'status' in r) // no status column at all = show every named row
  const products = rows.filter((r) => r && String(r.name || '').trim() && (!hasStatus || String(r.status).trim().toLowerCase() === 'published')).map(clean)
  return { products, sample: false }
}
