import type { PrepackRecord } from '../types';

/** Next unused sequence number — based on the highest saved value, not the row count. */
export function nextSequence(records: PrepackRecord[]): number {
  return records.reduce((max, record) => Math.max(max, record.seq || 0), 0) + 1;
}

/** Build a reference code such as PP-PAR0001 from the drug name and sequence. */
export function buildCode(drugName: string, seq: number): string {
  const letters = drugName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const prefix = (letters.slice(0, 3) || 'MED').padEnd(3, 'X');
  return `PP-${prefix}${String(seq).padStart(4, '0')}`;
}
