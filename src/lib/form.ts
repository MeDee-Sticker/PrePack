import type { PrepackFormValues, PrepackRecord } from '../types';
import { addMonthsISO, parseISODate, todayISO } from './date';

export type FormErrors = Partial<Record<keyof PrepackFormValues, string>>;

export function createInitialForm(): PrepackFormValues {
  const prepackDate = todayISO();
  return {
    drugName: '',
    lotNo: '',
    packSize: 10,
    unit: 'เม็ด/ซอง',
    prepackDate,
    expDate: addMonthsISO(prepackDate, 6),
    totalPacks: 50,
    preparedBy: '',
    checkedBy: '',
  };
}

export function validateForm(form: PrepackFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!form.drugName.trim()) errors.drugName = 'กรุณาระบุชื่อยา';
  if (!form.lotNo.trim()) errors.lotNo = 'กรุณาระบุเลข Lot';
  if (!form.preparedBy.trim()) errors.preparedBy = 'กรุณาระบุชื่อผู้จัดเตรียม';
  if (!form.checkedBy.trim()) errors.checkedBy = 'กรุณาระบุชื่อเภสัชกรผู้ตรวจสอบ';

  const packSize = Number(form.packSize);
  if (!Number.isFinite(packSize) || packSize < 1) {
    errors.packSize = 'ขนาดบรรจุต้องมากกว่า 0';
  }

  const totalPacks = Number(form.totalPacks);
  if (!Number.isFinite(totalPacks) || totalPacks < 1) {
    errors.totalPacks = 'จำนวนแพ็คต้องมากกว่า 0';
  }

  const prepack = parseISODate(form.prepackDate);
  const exp = parseISODate(form.expDate);

  if (!prepack) errors.prepackDate = 'กรุณาระบุวันบรรจุ';
  if (!exp) {
    errors.expDate = 'กรุณาระบุวันหมดอายุ';
  } else if (prepack && exp.getTime() <= prepack.getTime()) {
    errors.expDate = 'วันหมดอายุต้องอยู่หลังวันบรรจุ';
  }

  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildRecord(
  form: PrepackFormValues,
  seq: number,
  code: string,
): PrepackRecord {
  return {
    id: code,
    seq,
    createdAt: new Date().toISOString(),
    drugName: form.drugName.trim(),
    lotNo: form.lotNo.trim().toUpperCase(),
    packSize: Number(form.packSize),
    unit: form.unit,
    prepackDate: form.prepackDate,
    expDate: form.expDate,
    totalPacks: Number(form.totalPacks),
    preparedBy: form.preparedBy.trim(),
    checkedBy: form.checkedBy.trim(),
    synced: false,
  };
}

export function totalUnitsOf(form: Pick<PrepackFormValues, 'packSize' | 'totalPacks'>): number {
  return (Number(form.packSize) || 0) * (Number(form.totalPacks) || 0);
}
