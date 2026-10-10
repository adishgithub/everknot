import { config } from '../config'
import { inr } from './pricing'
export const waUrl = (text) => `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`
export const enquiryUrl = () => waUrl(`Hello ${config.businessName}!\n\nI would like to enquire about your wedding invitations.\n\nThank you!`)

// Builds the product-specific message. Works even when a price can't be calculated (c.error),
// so the admin always sees which design and what the customer selected.
export function orderText(p, o, c) {
  const priced = c && !c.error
  const qtyText = Number.isInteger(o.qty) ? `${o.qty} cards` : 'Not specified'
  const L = [`Hello ${config.businessName}!`, '',
    priced ? 'I would like to enquire about the following invitation:' : 'I would like a quote for the following invitation:', '',
    `Product: ${p.name}`, p.id ? `Product ID: ${p.id}` : null, p.category ? `Category: ${p.category}` : null,
    o.size ? `Size: ${o.size}` : null, o.colour ? `Colour: ${o.colour}` : null, `Quantity: ${qtyText}`]
  if (priced) {
    L.push(`Price per card: ${inr(c.rate)}`, `Printing cost: ${inr(c.printing)}`, `Designing charge: ${inr(c.design)}`)
    c.addonLines.forEach((a) => L.push(`Add-on: ${a.name} (${inr(a.charge)} ${a.unit === 'card' ? 'per card' : 'per order'}) = ${inr(a.total)}`))
    L.push(`Estimated total excluding shipping: ${inr(c.total)}`)
  } else {
    (o.addons || []).forEach((a) => L.push(`Add-on: ${a.name} (${inr(a.charge)} ${a.unit === 'card' ? 'per card' : 'per order'})`))
    L.push('Note: No online price is listed for this selection. Please send a quote.')
  }
  L.push(p.id ? `Link: ${location.origin}/#product-${p.id}` : null, '',
    'Please confirm availability, delivery charges, and the next steps for placing my order.', '',
    'I understand this is an enquiry and my order is confirmed only after confirmation from EverKnot.', '', 'Thank you!')
  return L.filter((x) => x !== null).join('\n')
}
export const orderUrl = (p, o, c) => waUrl(orderText(p, o, c))
