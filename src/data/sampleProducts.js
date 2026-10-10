// Placeholder artwork (SVG) — replace with real photos via the Google Sheet.
const art = (bg, fg, label) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750"><rect width="600" height="750" fill="#F7E7EC"/><rect x="90" y="80" width="420" height="590" fill="${bg}"/><rect x="110" y="100" width="380" height="550" fill="none" stroke="${fg}" stroke-width="2"/><text x="300" y="360" font-family="Georgia,serif" font-size="46" text-anchor="middle" fill="${fg}">${label}</text><text x="300" y="410" font-family="Georgia,serif" font-size="22" text-anchor="middle" fill="${fg}">sample artwork</text></svg>`)
const addons = [{ name: 'Envelope', charge: 3, unit: 'card' }, { name: 'Wax seal', charge: 8, unit: 'card' }]
export const sampleProducts = [
  { id: 'EK-001', name: 'Green Premium', category: 'Premium', sizes: ['A5'], colours: ['Green'], status: 'Published',
    description: 'A rich green card with fine gold detailing. Sample description — replace in your sheet.',
    images: [{ url: art('#2F6B4F', '#E9D9A6', 'Green'), caption: 'Front of card' }, { url: art('#2F6B4F', '#E9D9A6', 'Inside'), caption: 'Inside layout' }],
    tiers: [{ min: 25, max: 100, price: 12 }, { min: 101, max: 300, price: 11 }, { min: 301, max: 600, price: 10 }, { min: 601, max: 1000, price: 9 }, { min: 1001, max: null, price: 8 }],
    addons },
  { id: 'EK-002', name: 'Blush Classic', category: 'Budget Friendly', sizes: ['A5', '5x7 in'], colours: ['Pink', 'Ivory'], status: 'Published',
    description: 'A soft, simple design. Sample prices only — not the Green Premium rates.',
    images: [{ url: art('#FAF7F2', '#D9537B', 'Blush'), caption: 'Front of card' }],
    tiers: [{ min: 25, max: 200, price: 7 }, { min: 201, max: 500, price: 6 }], addons: [{ name: 'Envelope', charge: 150, unit: 'order' }] },
  { id: 'EK-003', name: 'Teal Royale', category: 'Premium', sizes: ['A5'], colours: ['Teal'], status: 'Published',
    description: 'Deep teal with antique gold. No price tiers entered yet, so it shows enquiry-only.',
    images: [{ url: art('#123E43', '#D8BE8C', 'Teal'), caption: 'Front of card' }], tiers: [], addons: [] },
]
