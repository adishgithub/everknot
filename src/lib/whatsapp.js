import { config } from '../config'
import { inr } from './pricing'
export const waUrl = (text) => `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`
export const enquiryUrl = () => waUrl(`Hello ${config.businessName}!\n\nI would like to enquire about your wedding invitations.\n\nThank you!`)
export function orderUrl(p, o, c) {
  const L = [`Hello ${config.businessName}!`, '', 'I would like to enquire about the following invitation:', '',
    `Product: ${p.name}`, p.id ? `Product ID: ${p.id}` : null, `Category: ${p.category}`, o.size ? `Size: ${o.size}` : null, o.colour ? `Colour: ${o.colour}` : null,
    `Quantity: ${o.qty} cards`, `Price per card: ${inr(c.rate)}`, `Printing cost: ${inr(c.printing)}`, `Designing charge: ${inr(c.design)}`]
  c.addonLines.forEach((a) => L.push(`Add-on: ${a.name} (${inr(a.charge)} ${a.unit === 'card' ? 'per card' : 'per order'}) = ${inr(a.total)}`))
  L.push(`Estimated total excluding shipping: ${inr(c.total)}`, p.id ? `Link: ${location.origin}/#product-${p.id}` : null, '',
    'Please confirm availability, delivery charges, and the next steps for placing my order.', '', 'Thank you!')
  return waUrl(L.filter((x) => x !== null).join('\n'))
}
