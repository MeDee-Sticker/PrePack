import type { PrepackRecord } from '../types';
import { formatThaiDate, formatTimestamp } from './date';

const HEADERS = [
  'Timestamp',
  'รหัส Pre-pack',
  'ชื่อยา',
  'Lot No.',
  'วันบรรจุ',
  'วันหมดอายุ',
  'ขนาดบรรจุ',
  'จำนวนแพ็ค',
  'จำนวนยารวม',
  'ผู้พรีแพ็ค',
  'เภสัชกรผู้ตรวจ',
  'สถานะ',
];

function toRow(record: PrepackRecord): string[] {
  return [
    formatTimestamp(record.createdAt),
    record.id,
    record.drugName,
    record.lotNo,
    formatThaiDate(record.prepackDate),
    formatThaiDate(record.expDate),
    `${record.packSize} ${record.unit}`,
    String(record.totalPacks),
    String(record.packSize * record.totalPacks),
    record.preparedBy,
    record.checkedBy,
    record.synced ? 'ส่งเข้า Sheet แล้ว' : 'รอส่ง',
  ];
}

export function buildTSV(records: PrepackRecord[]): string {
  const rows = records.map((record) =>
    toRow(record)
      .map((cell) => cell.replace(/\t/g, ' '))
      .join('\t'),
  );
  return [HEADERS.join('\t'), ...rows].join('\n');
}

export function buildCSV(records: PrepackRecord[]): string {
  const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
  const rows = records.map((record) => toRow(record).map(escape).join(','));
  return '\uFEFF' + [HEADERS.map(escape).join(','), ...rows].join('\r\n');
}

export function downloadCSV(records: PrepackRecord[]): void {
  const blob = new Blob([buildCSV(records)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `prepack_medicines_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Copy text, falling back to a hidden textarea on insecure origins. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path below.
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
