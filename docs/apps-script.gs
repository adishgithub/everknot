/**
 * EverKnot read-only catalogue endpoint for the Google Form responses sheet.
 * Setup: open the sheet > Extensions > Apps Script > paste this file > Deploy > Manage deployments >
 * edit (pencil) > Version: New version > Deploy. Execute as: Me, Access: Anyone. The /exec URL stays the same.
 * Only Published rows are returned. Internal notes, timestamps and unpublished rows never leave the sheet.
 */
const SHEET_NAME = 'Form Responses 1';
const ADDON_UNIT_DEFAULT = 'card';   // CONFIRM: 'card' = charged per card, 'order' = charged once per order
const ADDON_UNITS = {};              // per add-on overrides, e.g. { 'Wax seal': 'order', 'Custom tag': 'order' }

const norm = (s) => String(s == null ? '' : s).toLowerCase().replace(/[\u2012-\u2015\u2212]/g, '-').replace(/\s+/g, ' ').trim();
const money = (v) => { if (v == null || String(v).trim() === '') return null; const n = Number(String(v).replace(/[^\d.]/g, '')); return isNaN(n) ? null : n; };  // empty = missing, never 0
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const splitList = (s) => String(s || '').split(/[,;\n]+/).map((x) => x.trim()).filter(Boolean);

// "quantity 25-200" -> {min:25,max:200}; "quantity above 600" -> {min:601,max:null}; "600+" -> {min:600,max:null}
function parseRange(h) {
  const t = h.replace(/,/g, '');
  let m = t.match(/quantity\s*(\d+)\s*-\s*(\d+)/); if (m) return { min: +m[1], max: +m[2] };
  m = t.match(/(?:above|over|more than)\s*(\d+)/); if (m) return { min: +m[1] + 1, max: null };
  m = t.match(/(\d+)\s*\+/); if (m) return { min: +m[1], max: null };
  return null;
}

function buildCatalogue(values) {
  const H = values[0].map(norm), rows = values.slice(1);
  const idx = (re) => H.findIndex((h) => re.test(h));
  const cell = (r, re) => { const i = idx(re); return i < 0 ? '' : String(r[i] == null ? '' : r[i]).trim(); };

  // Price columns: ranges come from the column headers, so editing the form's ranges just works.
  // If two columns overlap (e.g. 201-400 and 200-400) the first one is kept and the later one is ignored.
  const tierCols = [];
  H.forEach((h, i) => {
    if (!/^price per card/.test(h)) return;
    const r = parseRange(h); if (!r) return;
    const overlaps = tierCols.some((a) => r.min <= (a.max == null ? Infinity : a.max) && (r.max == null ? Infinity : r.max) >= a.min);
    if (!overlaps) tierCols.push({ i, min: r.min, max: r.max });
  });

  const photoNums = H.map((h) => (h.match(/^photo (\d+) - image url/) || [])[1]).filter(Boolean);
  return rows.map((r) => {
    const name = cell(r, /^product name/);
    const size = cell(r, /^invitation size/), custom = cell(r, /^custom size/);
    const sizes = /custom|other/i.test(size) && custom ? ['Custom (' + custom + ')'] : size ? [size] : [];
    const addons = splitList(cell(r, /^available add-?ons/)).map((n) => {
      const ci = H.indexOf('extra charge - ' + n.toLowerCase());
      const charge = ci < 0 ? null : money(r[ci]);
      return charge == null ? null : { name: n, charge: charge, unit: ADDON_UNITS[n] || ADDON_UNIT_DEFAULT };
    }).filter(Boolean);                // an add-on with no charge entered is not offered: a missing price is never treated as zero
    return {
      id: slug(name), name: name, category: cell(r, /^category/), sizes: sizes, description: cell(r, /^product description/),
      colours: splitList(cell(r, /^available colours?/)).concat(splitList(cell(r, /^other colour/))),
      tiers: tierCols.map((c) => ({ min: c.min, max: c.max, price: money(r[c.i]) })).filter((t) => t.price != null && t.price > 0),
      addons: addons,
      bulkPrice: money(cell(r, /^price per card - bulk/)),   // used for any quantity that has no listed price
      images: photoNums.map((n) => ({ url: cell(r, new RegExp('^photo ' + n + ' - image url')), caption: cell(r, new RegExp('^photo ' + n + ' - caption')) })).filter((p) => p.url),
      status: cell(r, /^publication status/)
    };
  }).filter((p) => p.name && p.status.toLowerCase() === 'published');
}

function doGet() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  return ContentService.createTextOutput(JSON.stringify(buildCatalogue(sh.getDataRange().getValues()))).setMimeType(ContentService.MimeType.JSON);
}
