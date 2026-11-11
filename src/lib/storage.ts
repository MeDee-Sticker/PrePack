import type { PrepackRecord, Settings } from '../types';
import { shiftDaysISO } from './date';

const RECORDS_KEY = 'prepack.records.v1';
const SETTINGS_KEY = 'prepack.settings.v1';

export const DEFAULT_SETTINGS: Settings = {
  sheetUrl: '',
  preparers: ['จพ.ภ. สมศรี มีสุข', 'จพ.ภ. วีระ ขยันยิ่ง', 'พช.ภ. นภา ใจดี'],
  pharmacists: [
    'ภก. สมชาย ใจดี (ภ.12345)',
    'ภญ. สมหญิง รักษา (ภ.23456)',
    'ภก. กิตติพงศ์ พิทักษ์ (ภ.34567)',
  ],
  drugs: [
    'Paracetamol 500 mg Tablet',
    'Amoxicillin 500 mg Capsule',
    'Amlodipine 5 mg Tablet',
    'Metformin 500 mg Tablet',
    'Omeprazole 20 mg Capsule',
    'Simvastatin 20 mg Tablet',
    'Cetirizine 10 mg Tablet',
    'Domperidone 10 mg Tablet',
    'Ibuprofen 400 mg Tablet',
    'Losartan 50 mg Tablet',
    'Hydrochlorothiazide 25 mg Tablet',
    'Chlorpheniramine 4 mg Tablet',
  ],
};

function isRecord(value: unknown): value is PrepackRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<PrepackRecord>;
  return (
    typeof record.id === 'string' &&
    typeof record.drugName === 'string' &&
    typeof record.lotNo === 'string' &&
    typeof record.prepackDate === 'string' &&
    typeof record.expDate === 'string'
  );
}

export function loadRecords(): PrepackRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecord).map((record, index) => ({
      ...record,
      seq: typeof record.seq === 'number' ? record.seq : index + 1,
      synced: Boolean(record.synced),
    }));
  } catch {
    return [];
  }
}

export function saveRecords(records: PrepackRecord[]): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Storage can be full or blocked; the UI keeps working in memory.
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      sheetUrl: typeof parsed.sheetUrl === 'string' ? parsed.sheetUrl : '',
      preparers: Array.isArray(parsed.preparers) ? parsed.preparers : DEFAULT_SETTINGS.preparers,
      pharmacists: Array.isArray(parsed.pharmacists)
        ? parsed.pharmacists
        : DEFAULT_SETTINGS.pharmacists,
      drugs: Array.isArray(parsed.drugs) ? parsed.drugs : DEFAULT_SETTINGS.drugs,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore quota/permission failures.
  }
}

/** Demo rows so the table and label preview can be explored safely. */
export function makeSampleRecords(): PrepackRecord[] {
  const now = new Date().toISOString();
  const base = {
    unit: 'เม็ด/ซอง' as const,
    preparedBy: 'จพ.ภ. สมศรี มีสุข',
    checkedBy: 'ภก. สมชาย ใจดี (ภ.12345)',
  };
  return [
    {
      ...base,
      id: 'PP-PAR0001',
      seq: 1,
      createdAt: now,
      drugName: 'Paracetamol 500 mg Tablet',
      lotNo: 'L670901',
      packSize: 10,
      prepackDate: shiftDaysISO(-12),
      expDate: shiftDaysISO(158),
      totalPacks: 100,
      synced: true,
      syncedAt: now,
    },
    {
      ...base,
      id: 'PP-AMO0002',
      seq: 2,
      createdAt: now,
      drugName: 'Amoxicillin 500 mg Capsule',
      lotNo: 'AM680215',
      packSize: 10,
      unit: 'แคปซูล/ซอง',
      prepackDate: shiftDaysISO(-3),
      expDate: shiftDaysISO(21),
      totalPacks: 50,
      synced: false,
    },
    {
      ...base,
      id: 'PP-MET0003',
      seq: 3,
      createdAt: now,
      drugName: 'Metformin 500 mg Tablet',
      lotNo: 'MF671130',
      packSize: 20,
      prepackDate: shiftDaysISO(-40),
      expDate: shiftDaysISO(9),
      totalPacks: 120,
      preparedBy: 'จพ.ภ. วีระ ขยันยิ่ง',
      checkedBy: 'ภญ. สมหญิง รักษา (ภ.23456)',
      synced: true,
      syncedAt: now,
    },
  ];
}
