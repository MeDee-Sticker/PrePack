import type { PrepackRecord } from '../types';
import { formatThaiDate } from './date';

export function normalizeSheetUrl(url: string): string {
  return url.trim();
}

export function isValidSheetUrl(url: string): boolean {
  return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/(exec|dev)$/.test(
    normalizeSheetUrl(url),
  );
}

/**
 * Append one pre-pack row to the Google Sheet.
 * Apps Script web apps answer opaque CORS responses, so this resolves once the
 * request is sent; the sheet itself is the system of record.
 */
export async function sendToSheet(url: string, record: PrepackRecord): Promise<void> {
  const body = new FormData();
  body.append('prepackCode', record.id);
  body.append('drugName', record.drugName);
  body.append('lotNo', record.lotNo);
  body.append('packDate', formatThaiDate(record.prepackDate));
  body.append('expDate', formatThaiDate(record.expDate));
  body.append('packSize', `${record.packSize} ${record.unit}`);
  body.append('totalPacks', String(record.totalPacks));
  body.append('totalUnits', String(record.packSize * record.totalPacks));
  body.append('preparedBy', record.preparedBy);
  body.append('checkedBy', record.checkedBy);
  body.append('status', 'Approved');

  await fetch(normalizeSheetUrl(url), {
    method: 'POST',
    body,
    mode: 'no-cors',
    keepalive: true,
  });
}

export const APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "รหัส Pre-pack", "ชื่อยา", "Lot No.", "วันบรรจุ", "วันหมดอายุ", "ขนาดบรรจุ", "จำนวนแพ็ค", "จำนวนยารวม", "ผู้พรีแพ็ค", "เภสัชกรผู้ตรวจ", "สถานะ"]);
  }
  sheet.appendRow([
    new Date(),
    e.parameter.prepackCode,
    e.parameter.drugName,
    e.parameter.lotNo,
    e.parameter.packDate,
    e.parameter.expDate,
    e.parameter.packSize,
    e.parameter.totalPacks,
    e.parameter.totalUnits,
    e.parameter.preparedBy,
    e.parameter.checkedBy,
    e.parameter.status || "Approved"
  ]);
  return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;
