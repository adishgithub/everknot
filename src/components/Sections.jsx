import { useEffect, useMemo, useState } from 'react'
import { Menu, X, MessageCircle, Instagram, Package, Palette, FileText, Truck, Clock, Video, Search, Heart, PenLine, Tag, Banknote } from 'lucide-react'
import { config } from '../config'
import { enquiryUrl } from '../lib/whatsapp'
import { loadCatalogue } from '../lib/catalogue'
import { ProductCard, ProductDetails } from './Product'

const links = [['home', 'Home'], ['invitations', 'Our Invitations'], ['about', 'About Us'], ['how', 'How It Works'], ['info', 'Important Information'], ['contact', 'Contact']]
export const WhatsAppButton = ({ children, className = 'btn wa' }) => <a className={className} href={enquiryUrl()} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> {children}</a>
const Insta = ({ className = 'btn ghost' }) => config.instagramUrl
  ? <a className={className} href={config.instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram size={18} /> Instagram</a>
  : <span className={className + ' disabled'} title="Set instagramUrl in src/config.js"><Instagram size={18} /> Instagram link not set</span>

export function Header() {
  const [open, setOpen] = useState(false)
  return (<><div className="announce">Beautiful invitations, thoughtfully made for your special day.</div>
    <header className="header"><a href="#home" className="brand"><img src={config.logo} alt="" width="44" height="44" /><span>EverKnot</span></a>
      <nav className={'nav' + (open ? ' open' : '')} aria-label="Main">{links.map(([id, l]) => <a key={id} href={'#' + id} onClick={() => setOpen(false)}>{l}</a>)}</nav>
      <a className="iconbtn wa" href={enquiryUrl()} target="_blank" rel="noopener noreferrer" aria-label="Enquire on WhatsApp"><MessageCircle /></a>
      <button className="iconbtn menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">{open ? <X /> : <Menu />}</button></header></>)
}

export const Hero = () => (<section id="home" className="hero"><img className="herologo" src={config.logo} alt="EverKnot Wedding Invitations logo" />
  <div><h1>Make Your Special Day Unforgettable</h1>
    <p>Elegant wedding invitations, thoughtfully designed and beautifully printed for your once-in-a-lifetime celebration.</p>
    <div className="cta"><a className="btn pri" href="#invitations">Explore Invitations</a><WhatsAppButton>Enquire on WhatsApp</WhatsAppButton></div></div></section>)

export function CatalogueSection() {
  const [st, setSt] = useState({ loading: true }); const [view, setView] = useState(null)
  const [f, setF] = useState({ cat: '', size: '', colour: '', q: '' })
  const load = () => { setSt({ loading: true }); loadCatalogue().then((r) => setSt(r)).catch((e) => setSt({ error: e.message })) }
  useEffect(load, [])
  useEffect(() => { const h = location.hash.match(/^#product-(.+)/); if (h && st.products) setView(st.products.find((p) => p.id === decodeURIComponent(h[1])) || null) }, [st.products])
  const P = st.products || []
  const uniq = (k) => [...new Set(P.flatMap((p) => p[k]))]
  const shown = useMemo(() => P.filter((p) => (!f.cat || p.category === f.cat) && (!f.size || p.sizes.includes(f.size)) && (!f.colour || p.colours.includes(f.colour)) && p.name.toLowerCase().includes(f.q.toLowerCase())), [P, f])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  return (<section id="invitations" className="sec"><h2>Our Invitations</h2>
    {st.sample && <p className="notice">Development mode: showing sample products. Set <code>VITE_CATALOGUE_URL</code> to load your live catalogue.</p>}
    <div className="filters">
      <label className="search"><Search size={16} /><span className="sr">Search by name</span><input placeholder="Search by name" value={f.q} onChange={set('q')} /></label>
      {P.some((p) => p.category) && <label><span className="sr">Category</span><select value={f.cat} onChange={set('cat')}><option value="">All categories</option><option>Budget Friendly</option><option>Premium</option></select></label>}
      {uniq('sizes').length > 0 && <label><span className="sr">Size</span><select value={f.size} onChange={set('size')}><option value="">All sizes</option>{uniq('sizes').map((s) => <option key={s}>{s}</option>)}</select></label>}
      {uniq('colours').length > 0 && <label><span className="sr">Colour</span><select value={f.colour} onChange={set('colour')}><option value="">All colours</option>{uniq('colours').map((s) => <option key={s}>{s}</option>)}</select></label>}</div>
    {st.loading && <p className="state" role="status">Loading invitations…</p>}
    {st.error && <div className="state" role="alert"><p>We couldn't load the catalogue. Check your connection and try again.</p><button className="btn ghost" onClick={load}>Try again</button></div>}
    {!st.loading && !st.error && shown.length === 0 && <div className="state"><p>No designs match these filters.</p><button className="btn ghost" onClick={() => setF({ cat: '', size: '', colour: '', q: '' })}>Clear filters</button></div>}
    <div className="grid">{shown.map((p) => <ProductCard key={p.id} product={p} onView={setView} />)}</div>
    {view && <ProductDetails product={view} onClose={() => setView(null)} />}</section>)
}

const values = [[PenLine, 'Thoughtful design', 'Every invitation is designed to feel personal, elegant and ready to share.'], [Tag, 'Clear pricing', 'Per-card prices, add-ons and the designing charge are shown before you order.'], [Heart, 'Personal service', 'You talk to us directly on WhatsApp, from first question to final confirmation.']]
export const AboutSection = () => (<section id="about" className="sec about"><h2>About EverKnot</h2>
  <p className="lead">EverKnot creates elegant wedding invitations for couples who want their first announcement to feel as special as the day itself. We keep ordering simple and the details clear, so you can focus on your celebration.</p>
  <div className="mv"><div className="pcard"><h3>Our Mission</h3><p>To help every couple announce their wedding with an invitation that is beautiful, personal and easy to order, with honest pricing and friendly guidance at every step.</p></div>
    <div className="pcard"><h3>Our Vision</h3><p>To be the invitation brand couples trust to begin the story of their wedding.</p></div></div>
  <div className="vals">{values.map(([I, t, d]) => <div key={t}><I color="#A88652" /><h3>{t}</h3><p>{d}</p></div>)}</div></section>)

const steps = ['Explore the invitation designs.', 'Choose your preferred design, colour, quantity, and add-ons.', 'Send your selection to us through WhatsApp.', 'Confirm your order and receive preparation and shipping details.']
export const HowItWorks = () => (<section id="how" className="sec tint"><h2>How It Works</h2><ol className="steps">{steps.map((s) => <li key={s}>{s}</li>)}</ol>
  <p className="muted center">Preparation begins only after your order has been confirmed.</p></section>)

const pol = [[Package, 'Minimum Order', 'The minimum order quantity is 25 invitation cards.'], [Palette, 'Designing Charge', 'A designing charge of ₹300 applies per order.'],
  [FileText, 'PDF File', 'A PDF file of the card design will be provided.'], [Truck, 'Shipping Charges', 'Shipping charges will be determined by the weight of the package and the destination.'],
  [Clock, 'Preparation Time', 'The standard preparation time is 3–7 days after the order has been confirmed. This does not include shipping time.'], [Video, 'Video Previews', 'Videos of our invitation cards are available on Instagram.'], [Banknote, 'Cash on Delivery', 'Cash on delivery is not available.']]
export const PoliciesSection = () => (<section id="info" className="sec"><h2>Before You Place Your Order</h2>
  <div className="pgrid">{pol.map(([I, t, d]) => <div className="pcard" key={t}><I color="#A88652" /><h3>{t}</h3><p>{d}</p></div>)}</div><div className="center"><Insta /></div></section>)

export const Footer = () => (<><section id="contact" className="sec tint center"><h2>Contact</h2><p>Message us on WhatsApp to ask about designs, availability, or delivery.</p>
  <div className="cta c"><WhatsAppButton>Chat on WhatsApp</WhatsAppButton><Insta /></div></section>
  <footer className="footer"><img src={config.logo} alt="" width="56" height="56" /><p>{config.businessName}</p>
    <nav aria-label="Footer">{links.map(([id, l]) => <a key={id} href={'#' + id}>{l}</a>)}</nav>
    <p className="small">Minimum order 25 cards · Preparation {config.prepTime} after confirmation · Cash on delivery not available</p>
    <p className="small">© {new Date().getFullYear()} {config.businessName}. All rights reserved.</p></footer>
  <a className="sticky" href={enquiryUrl()} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Enquire on WhatsApp</a></>)
