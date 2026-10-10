// ===== EverKnot central configuration — edit values here only =====
export const config = {
  businessName: 'EverKnot Wedding Invitations',
  logo: '/logo.png',
  whatsappNumber: '916282360621', // country code + number, no "+" or spaces. VERIFY before launch.
  instagramUrl: 'https://www.instagram.com/everknotinvites',               // TODO: paste your profile URL, e.g. https://www.instagram.com/yourname
  catalogueUrl: import.meta.env.VITE_CATALOGUE_URL || '', // Apps Script /exec URL. Empty = sample data.
  minQuantity: 25,
  designChargeDefault: 300,
  prepDays: 10,
}
