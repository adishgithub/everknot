// Read-only catalogue endpoint. Paste into Extensions > Apps Script in your Google Sheet,
// then Deploy > New deployment > Web app > Execute as: Me, Access: Anyone. Copy the /exec URL.
// Expected sheet "Products" columns: id | name | category | size | description | colours (comma separated) |
// tiers (e.g. 25-100:12; 101-300:11; 1001+:8) | addons (e.g. Envelope:3:card; Wax seal:150:order) |
// images (url|caption; url|caption) | status
function doGet() {
  const rows = SpreadsheetApp.getActive().getSheetByName('Products').getDataRange().getValues();
  const h = rows.shift();
  const list = (s, sep) => String(s || '').split(sep).map(x => x.trim()).filter(Boolean);
  const out = rows.map(r => { const o = {}; h.forEach((k, i) => o[k] = r[i]); return o; })
    .filter(o => String(o.status).toLowerCase() === 'published')   // only published rows ever leave the sheet
    .map(o => ({
      id: o.id, name: o.name, category: o.category, size: o.size, description: o.description, status: o.status,
      colours: list(o.colours, ','),
      tiers: list(o.tiers, ';').map(t => { const [rng, p] = t.split(':'); const m = rng.match(/(\d+)\s*(?:-\s*(\d+)|\+)/);
        return m ? { min: +m[1], max: m[2] ? +m[2] : null, price: +p } : null; }).filter(Boolean),
      addons: list(o.addons, ';').map(a => { const [name, charge, unit] = a.split(':'); return { name, charge: +charge, unit }; }),
      images: list(o.images, ';').map(i => { const [url, caption] = i.split('|'); return { url, caption }; })
    }));
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
