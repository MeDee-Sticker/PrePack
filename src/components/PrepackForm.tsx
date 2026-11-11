import { FilePlus2, Loader2, RotateCcw, Save, ShieldCheck, UserCheck } from 'lucide-react';
import type { FormErrors } from '../lib/form';
import type { PackUnit, PrepackFormValues, Settings } from '../types';
import { PACK_UNITS } from '../types';
import { addMonthsISO } from '../lib/date';

interface PrepackFormProps {
  form: PrepackFormValues;
  errors: FormErrors;
  code: string;
  busy: boolean;
  sheetConnected: boolean;
  settings: Settings;
  onChange: <K extends keyof PrepackFormValues>(key: K, value: PrepackFormValues[K]) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const inputClass = (invalid: boolean) =>
  `field ${invalid ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/30' : ''}`;

export default function PrepackForm({
  form,
  errors,
  code,
  busy,
  sheetConnected,
  settings,
  onChange,
  onSubmit,
  onReset,
}: PrepackFormProps) {
  const totalUnits = (Number(form.packSize) || 0) * (Number(form.totalPacks) || 0);

  const numberChange = (key: 'packSize' | 'totalPacks') => (value: string) =>
    onChange(key, value === '' ? '' : Number(value));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="card p-5 sm:p-6 lg:col-span-7 xl:col-span-8"
      noValidate
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-hospital-700">
            <FilePlus2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">ฟอร์มบันทึกข้อมูล Pre-pack ยา</h2>
            <p className="text-xs text-slate-500">
              กรอกรายการยา Lot. และวันหมดอายุโดยตรง (ไม่ต้องตัดจากคลังใหญ่)
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-[11px] text-slate-400">รหัสอ้างอิงอัตโนมัติ</span>
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-sm font-bold text-hospital-700">
            {code}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="field-label" htmlFor="drugName">
            ชื่อยา / ความแรง / รูปแบบ (Drug Name) <span className="text-rose-500">*</span>
          </label>
          <input
            id="drugName"
            type="text"
            list="common-drugs"
            autoComplete="off"
            value={form.drugName}
            onChange={(e) => onChange('drugName', e.target.value)}
            className={inputClass(Boolean(errors.drugName))}
            placeholder="พิมพ์หรือเลือกชื่อยา เช่น Paracetamol 500 mg Tablet"
            aria-invalid={Boolean(errors.drugName)}
          />
          <datalist id="common-drugs">
            {settings.drugs.map((drug) => (
              <option key={drug} value={drug} />
            ))}
          </datalist>
          {errors.drugName && <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.drugName}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="lotNo">
            เลขที่ผลิต (Lot No.) <span className="text-rose-500">*</span>
          </label>
          <input
            id="lotNo"
            type="text"
            value={form.lotNo}
            onChange={(e) => onChange('lotNo', e.target.value)}
            className={`${inputClass(Boolean(errors.lotNo))} font-mono uppercase`}
            placeholder="เช่น L670812"
            aria-invalid={Boolean(errors.lotNo)}
          />
          {errors.lotNo && <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.lotNo}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="packSize">
            ขนาดบรรจุย่อย (Pack Size) <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="packSize"
              type="number"
              min={1}
              inputMode="numeric"
              value={form.packSize}
              onChange={(e) => numberChange('packSize')(e.target.value)}
              className={`${inputClass(Boolean(errors.packSize))} text-right font-mono`}
              placeholder="เช่น 10"
              aria-invalid={Boolean(errors.packSize)}
            />
            <select
              value={form.unit}
              onChange={(e) => onChange('unit', e.target.value as PackUnit)}
              className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-hospital-500/40"
              aria-label="หน่วยบรรจุ"
            >
              {PACK_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          {errors.packSize && (
            <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.packSize}</p>
          )}
        </div>

        <div>
          <label className="field-label flex items-center justify-between" htmlFor="prepackDate">
            <span>วันบรรจุ (Pre-pack Date) <span className="text-rose-500">*</span></span>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-normal text-emerald-600">
              อยู่ก่อนวันหมดอายุ
            </span>
          </label>
          <input
            id="prepackDate"
            type="date"
            value={form.prepackDate}
            onChange={(e) => onChange('prepackDate', e.target.value)}
            className={`${inputClass(Boolean(errors.prepackDate))} border-emerald-300 bg-emerald-50/40`}
            aria-invalid={Boolean(errors.prepackDate)}
          />
          {errors.prepackDate && (
            <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.prepackDate}</p>
          )}
        </div>

        <div>
          <div className="field-label flex items-center justify-between">
            <label htmlFor="expDate">
              วันหมดอายุ (Exp Date) <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              {[3, 6, 12].map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => onChange('expDate', addMonthsISO(form.prepackDate, months))}
                  className="text-[11px] font-normal text-rose-600 hover:underline"
                >
                  +{months} ด.
                </button>
              ))}
            </div>
          </div>
          <input
            id="expDate"
            type="date"
            value={form.expDate}
            onChange={(e) => onChange('expDate', e.target.value)}
            className={`${inputClass(Boolean(errors.expDate))} border-rose-300 bg-rose-50/30`}
            aria-invalid={Boolean(errors.expDate)}
          />
          {errors.expDate && <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.expDate}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="totalPacks">
            จำนวนซอง/แพ็คที่ผลิต (Total Packs) <span className="text-rose-500">*</span>
          </label>
          <input
            id="totalPacks"
            type="number"
            min={1}
            inputMode="numeric"
            value={form.totalPacks}
            onChange={(e) => numberChange('totalPacks')(e.target.value)}
            className={`${inputClass(Boolean(errors.totalPacks))} text-right font-mono`}
            placeholder="เช่น 50"
            aria-invalid={Boolean(errors.totalPacks)}
          />
          {errors.totalPacks && (
            <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.totalPacks}</p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-900 p-3.5 text-white">
          <div>
            <span className="block text-xs text-slate-400">จำนวนยารวมทั้งหมด (Total Units)</span>
            <span className="text-[11px] text-emerald-400">
              {(Number(form.packSize) || 0).toLocaleString()} ×{' '}
              {(Number(form.totalPacks) || 0).toLocaleString()} แพ็ค
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono text-2xl font-bold text-emerald-400">
              {totalUnits.toLocaleString()}
            </span>
            <span className="ml-1 text-xs text-slate-300">{form.unit.split('/')[0]}</span>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="field-label" htmlFor="preparedBy">
            <UserCheck className="mr-1 inline h-4 w-4 text-emerald-600" aria-hidden="true" />
            ชื่อคนพรีแพ็ค / ผู้จัดเตรียม (Prepared By) <span className="text-rose-500">*</span>
          </label>
          <input
            id="preparedBy"
            type="text"
            list="staff-list"
            autoComplete="off"
            value={form.preparedBy}
            onChange={(e) => onChange('preparedBy', e.target.value)}
            className={inputClass(Boolean(errors.preparedBy))}
            placeholder="ระบุชื่อผู้ทำการบรรจุยา"
            aria-invalid={Boolean(errors.preparedBy)}
          />
          <datalist id="staff-list">
            {settings.preparers.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {errors.preparedBy && (
            <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.preparedBy}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="field-label" htmlFor="checkedBy">
            <ShieldCheck className="mr-1 inline h-4 w-4 text-indigo-600" aria-hidden="true" />
            เภสัชกรผู้ตรวจสอบ (Checked By) <span className="text-rose-500">*</span>
          </label>
          <input
            id="checkedBy"
            type="text"
            list="pharmacist-list"
            autoComplete="off"
            value={form.checkedBy}
            onChange={(e) => onChange('checkedBy', e.target.value)}
            className={inputClass(Boolean(errors.checkedBy))}
            placeholder="เลือกหรือพิมพ์ชื่อเภสัชกร"
            aria-invalid={Boolean(errors.checkedBy)}
          />
          <datalist id="pharmacist-list">
            {settings.pharmacists.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {errors.checkedBy && (
            <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.checkedBy}</p>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row md:col-span-2">
          <button
            type="button"
            onClick={onReset}
            className="btn w-full gap-1.5 px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>ล้างฟอร์ม</span>
          </button>

          <button
            type="submit"
            disabled={busy}
            className="btn w-full gap-2 bg-hospital-700 px-6 py-3 text-sm text-white shadow-lg shadow-emerald-600/20 hover:bg-hospital-800 sm:w-auto"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            <span>
              {busy
                ? 'กำลังบันทึกและส่งเข้า Google Sheet...'
                : sheetConnected
                  ? 'บันทึกและส่งเข้า Google Sheet'
                  : 'บันทึกรายการ (เก็บในเครื่อง)'}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
