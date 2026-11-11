export const PACK_UNITS = ['เม็ด/ซอง', 'แคปซูล/ซอง', 'เม็ด/กระปุก', 'ซอง/แพ็ค'] as const;
export type PackUnit = (typeof PACK_UNITS)[number];

/** A single pre-pack batch recorded by the pharmacy. */
export interface PrepackRecord {
  /** Human/barcode reference, e.g. PP-PAR0001 */
  id: string;
  /** Monotonic sequence used to keep codes unique, even after deletions. */
  seq: number;
  /** ISO timestamp of when the record was saved. */
  createdAt: string;
  drugName: string;
  lotNo: string;
  packSize: number;
  unit: PackUnit;
  /** YYYY-MM-DD */
  prepackDate: string;
  /** YYYY-MM-DD */
  expDate: string;
  totalPacks: number;
  preparedBy: string;
  checkedBy: string;
  synced: boolean;
  syncedAt?: string;
}

export interface PrepackFormValues {
  drugName: string;
  lotNo: string;
  packSize: number | '';
  unit: PackUnit;
  prepackDate: string;
  expDate: string;
  totalPacks: number | '';
  preparedBy: string;
  checkedBy: string;
}

export interface Settings {
  /**
   * Per-browser choice for the Google Sheet connection.
   * `null` = follow the site-wide default from /sheet-config.json,
   * `''` = explicitly disconnected on this browser,
   * any other value = a URL saved on this browser only.
   */
  sheetUrlOverride: string | null;
  preparers: string[];
  pharmacists: string[];
  drugs: string[];
}

export type ToastKind = 'success' | 'warning' | 'error';

export interface ToastState {
  id: number;
  message: string;
  kind: ToastKind;
}

export type TabKey = 'operation' | 'stock';
