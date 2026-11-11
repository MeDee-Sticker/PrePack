# MedPre-Pack

ระบบบันทึกการจัดทำ Pre-pack ยา และพิมพ์ฉลากบาร์โค้ด สำหรับงานเภสัชกรรม OPD / IPD

A Thai-language pharmacy web app for recording pre-packed medicine batches, printing 60 × 40 mm
thermal sticker labels with scannable Code128 barcodes, and syncing every record to a Google Sheet.

## Features

- **Pre-pack entry form** — drug name, lot number, pack size/unit, pre-pack date, expiry date,
  packs produced, preparer and checking pharmacist, with automatic reference codes (`PP-PAR0001`).
- **Live thermal label** — a real-size 60 × 40 mm sticker rendered from the form, including a
  genuine Code128 barcode. Printing hides the entire UI and prints only the label.
- **Stock history** — searchable table of every batch with expiry warnings, per-row reprint, sync
  status and delete.
- **Google Sheet sync** — paste an Apps Script Web App URL in the in-app settings dialog (the
  script is provided and copyable) to append each record to your sheet. Records are kept locally
  until they reach the sheet, and pending rows can be retried individually or all at once.
- **Export** — download CSV (UTF-8 with BOM, opens correctly in Excel) or copy a tab-separated
  table straight into a Google Sheet.
- **Offline-friendly storage** — records and settings persist in `localStorage`; no backend needed.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # typecheck + production build into dist/
npm run preview  # serve the production build
```

## Connecting a Google Sheet

1. Open your spreadsheet → **Extensions → Apps Script**.
2. Copy the script from the app's settings dialog (header → *ตั้งค่าเชื่อม Google Sheet*), paste it
   over the default code and save.
3. **Deploy → New deployment → Web app**, set *Execute as: Me* and *Who has access: Anyone*, deploy,
   and copy the Web App URL (ends with `/exec`).
4. Paste the URL into the app's settings dialog and save.

Without a sheet URL the app records everything locally and labels still print normally.

### Saving the connection for every device

The URL a user saves in the settings dialog lives in that browser's `localStorage`. To have the
whole team connect automatically, put the same Web App URL in `public/sheet-config.json`:

```json
{ "sheetUrl": "https://script.google.com/macros/s/AKfycb.../exec" }
```

The app fetches this file at startup, so rebuilding and redeploying connects every device that
opens the site. A URL saved in an individual browser still takes precedence, and "ยกเลิกการเชื่อมต่อ"
disconnects only that browser while the site default stays available.

Note: this URL ends up in the public app bundle; anyone who can open the app can append rows to the
sheet. Keep the sheet itself restricted and treat the URL as internal to the pharmacy.

## Printing labels

Set the thermal printer to **60 × 40 mm** media with scaling at 100%. The page size and label
dimensions are declared in `src/index.css`, and the label itself is a single 60 × 40 mm element used
for both preview and print, so the preview matches the sticker.

## Project layout

```
src/
  App.tsx                 app state: records, settings, printing, sync
  components/
    PrepackForm.tsx       entry form with validation
    ThermalLabel.tsx      60×40 mm label (preview + print)
    Barcode.tsx           Code128 SVG barcode
    LabelPreview.tsx      dark preview panel
    RecordsTable.tsx      stock table, search and exports
    SheetModal.tsx        Google Sheets setup + Apps Script snippet
    PrintArea.tsx         print-only portal
    Header.tsx, Toast.tsx
  lib/
    date.ts               Thai (Buddhist-era) dates, clamped month arithmetic
    form.ts               defaults, validation, record building
    storage.ts            localStorage persistence
    sheets.ts             Apps Script payload + URL validation
    export.ts             CSV / TSV / clipboard
    codes.ts              reference code generation
```
