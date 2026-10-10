import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, MessageCircle } from 'lucide-react'
import { config } from '../config'
import { inr, calculate, startingPrice, tierLabel } from '../lib/pricing'
import { orderUrl, orderText } from '../lib/whatsapp'

const FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750"><rect width="600" height="750" fill="#F7E7EC"/><text x="300" y="380" font-family="Georgia,serif" font-size="28" text-anchor="middle" fill="#A88652">Photo coming soon</text></svg>')
const onImgError = (e) => { console.warn('EverKnot: image failed to load ->', e.currentTarget.src); e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK }
export function ProductGallery({ images }) {
  const [i, setI] = useState(0)
  const x0 = useRef(null)
  if (!images.length) return <div className="noimg">No photos yet</div>
  const go = (d) => setI((i + d + images.length) % images.length)
  return (
    <figure className="gallery" onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - x0.current; if (Math.abs(d) > 40) go(d < 0 ? 1 : -1) }}>
      <img src={images[i].url} alt={images[i].caption || 'Invitation photo'} onError={onImgError} referrerPolicy="no-referrer" />
      {images.length > 1 && <>
        <button className="gnav l" onClick={() => go(-1)} aria-label="Previous photo"><ChevronLeft /></button>
        <button className="gnav r" onClick={() => go(1)} aria-label="Next photo"><ChevronRight /></button></>}
      <figcaption>{images[i].caption} {images.length > 1 && <span>({i + 1}/{images.length})</span>}</figcaption>
    </figure>)
}

export function ColourSelector({ colours, value, onChange }) {
  if (!colours.length) return null
  return (<fieldset><legend>Colour</legend><div className="chips">
    {colours.map((c) => <button key={c} type="button" aria-pressed={value === c} className={'chip' + (value === c ? ' on' : '')} onClick={() => onChange(c)}>{c}</button>)}
  </div></fieldset>)
}

export function AddOnSelector({ addons, selected, onToggle }) {
  if (!addons.length) return null
  return (<fieldset><legend>Optional add-ons</legend>
    {addons.map((a) => <label key={a.name} className="addon"><input type="checkbox" checked={selected.includes(a.name)} onChange={() => onToggle(a.name)} />
      <span>{a.name}</span><b>+{inr(a.charge)} {a.unit === 'card' ? 'per card' : 'per order'}</b></label>)}
  </fieldset>)
}

export function PriceCalculator({ product, qty, setQty, addons, colour, size }) {
  const c = calculate(product, qty, addons)
  const min = product.minQuantity || config.minQuantity
  return (<section aria-live="polite" className="calc">
    <label htmlFor="qty">Quantity (minimum {min})</label>
    <input id="qty" type="number" inputMode="numeric" min={min} value={Number.isNaN(qty) ? '' : qty} onChange={(e) => setQty(parseInt(e.target.value, 10))} />
    {c.error ? <p className="warn" role="alert">{c.error}</p> : <dl>
      <dt>Price per card</dt><dd>{inr(c.rate)}</dd>
      <dt>Printing cost</dt><dd>{inr(c.printing)}</dd>
      <dt>Designing charge (per order)</dt><dd>{inr(c.design)}</dd>
      {c.addonLines.map((a) => <div key={a.name} className="row"><dt>{a.name}</dt><dd>{inr(a.total)}</dd></div>)}
      <dt className="tot">Estimated total, excluding shipping</dt><dd className="tot">{inr(c.total)}</dd></dl>}
    <p className="muted small">Shipping depends on package weight and destination, so it is confirmed on WhatsApp. Cash on delivery is not available.</p>
    <details className="preview" open><summary>Message that will be sent to EverKnot</summary>
      <pre>{orderText(product, { qty, colour, size, addons }, c)}</pre></details>
    <p className="disclaimer"><b>Please note:</b> sending this message does not confirm your order. Your order is confirmed only after EverKnot confirms it with you on WhatsApp.</p>
    <a className="btn wa" href={orderUrl(product, { qty, colour, size, addons }, c)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> {c.error ? 'Enquire on WhatsApp' : 'Order on WhatsApp'}</a>
    <p className="muted small">Opening WhatsApp does not confirm an order. We confirm it with you in the chat.</p>
  </section>)
}

export function ProductDetails({ product, onClose }) {
  const [colour, setColour] = useState(product.colours[0] || '')
  const [size, setSize] = useState(product.sizes[0] || '')
  const [qty, setQty] = useState(product.minQuantity || config.minQuantity)
  const [sel, setSel] = useState([])
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = '' } }, [onClose])
  const addons = product.addons.filter((a) => sel.includes(a.name))
  return (<div className="overlay" onClick={onClose}><div className="modal" role="dialog" aria-modal="true" aria-label={product.name} onClick={(e) => e.stopPropagation()}>
    <button className="close" onClick={onClose} aria-label="Close details"><X /></button>
    <ProductGallery images={product.images} />
    <div className="mbody">{product.category && <span className="badge">{product.category}</span>}<h3>{product.name}</h3>{product.description && <p>{product.description}</p>}
      {product.sizes.length > 0 && <fieldset><legend>Size</legend><div className="chips">{product.sizes.map((s) => <button key={s} type="button" aria-pressed={size === s} className={'chip' + (size === s ? ' on' : '')} onClick={() => setSize(s)}>{s}</button>)}</div></fieldset>}
      <ColourSelector colours={product.colours} value={colour} onChange={setColour} />
      <h4>Price per card</h4>
      {product.tiers.length ? <table className="tiers"><tbody>{product.tiers.map((t) => <tr key={t.min}><td>{tierLabel(t)} cards</td><td>{inr(t.price)}</td></tr>)}</tbody></table>
        : <p className="muted">Prices for this design aren't listed yet. Please enquire on WhatsApp.</p>}
      <AddOnSelector addons={product.addons} selected={sel} onToggle={(n) => setSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]))} />
      <PriceCalculator product={product} qty={qty} setQty={setQty} addons={addons} colour={colour} size={size} />
    </div></div></div>)
}

export function ProductCard({ product, onView }) {
  const from = startingPrice(product)
  return (<article className="card">
    <img src={product.images[0]?.url || FALLBACK} alt={product.images[0]?.caption || product.name} loading="lazy" onError={onImgError} referrerPolicy="no-referrer" />
    <div className="cbody">{product.category && <span className="badge">{product.category}</span>}<h3>{product.name}</h3>
      <p className="muted small">{product.sizes.join(', ') || 'Size on request'}</p>
      <p className="price">{from ? <>From <b>{inr(from)}</b> per card</> : 'Price on enquiry'}</p>
      <div className="dots" aria-label={'Colours: ' + product.colours.join(', ')}>{product.colours.map((c) => <span key={c} className="muted small">{c}</span>)}</div>
      <div className="cbtns"><button className="btn ghost" onClick={() => onView(product)}>View Details</button>
        <button className="btn wa" onClick={() => onView(product)}>Order on WhatsApp</button></div></div></article>)
}
