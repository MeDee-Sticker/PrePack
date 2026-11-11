import {
  ClipboardCopy,
  Download,
  Loader2,
  Printer,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import type { PrepackRecord } from '../types';
import { daysUntil, expiryState, formatThaiDate, formatTimestamp } from '../lib/date';

interface RecordsTableProps {
  records: PrepackRecord[];
  allCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  sheetConnected: boolean;
  busy: boolean;
  unsyncedCount: number;
  onPrint: (record: PrepackRecord) => void;
  onDelete: (record: PrepackRecord) => void;
  onSyncOne: (record: PrepackRecord) => void;
  onSyncAll: () => void;
  onExportCSV: () => void;
  onCopyTSV: () => void;
  onLoadSample: () => void;
}

function ExpiryChip({ expDate }: { expDate: string }) {
  const state = expiryState(expDate);
  if (state === 'valid') return null;

  const days = daysUntil(expDate);
  const label = state === 'expired' ? 'หมดอายุแล้ว' : `ใกล้หมดอายุ ${days} วัน`;

  return (
    <span
      className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
        state === 'expired' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {label}
    </span>
  );
}

export default function RecordsTable({
  records,
  allCount,
  search,
  onSearchChange,
  sheetConnected,
  busy,
  unsyncedCount,
  onPrint,
  onDelete,
  onSyncOne,
  onSyncAll,
  onExportCSV,
  onCopyTSV,
  onLoadSample,
}: RecordsTableProps) {
  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="relative max-w-md flex-grow">
          <Search
            className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาชื่อยา, รหัส Pre-pack, เลข Lot, ชื่อผู้เตรียม..."
            className="field py-2 pl-10"
            aria-label="ค้นหารายการ Pre-pack"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCopyTSV}
            className="btn gap-1.5 border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-hospital-800 hover:bg-emerald-100"
          >
            <ClipboardCopy className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <span>คัดลอกตารางไปวางใน Google Sheet</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="btn gap-1.5 bg-slate-100 px-3.5 py-2 text-slate-700 hover:bg-slate-200"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>ดาวน์โหลด CSV</span>
          </button>

          {sheetConnected && unsyncedCount > 0 && (
            <button
              type="button"
              onClick={onSyncAll}
              disabled={busy}
              className="btn gap-1.5 bg-hospital-600 px-3.5 py-2 text-white shadow-sm hover:bg-hospital-700"
            >
              <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{`ซิงค์รายการที่ค้าง (${unsyncedCount})`}</span>
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-600">
                <th className="p-3.5">รหัส / เวลาบันทึก</th>
                <th className="p-3.5">ชื่อยา (Drug Name)</th>
                <th className="p-3.5">Lot No.</th>
                <th className="p-3.5">วันบรรจุ ➔ วันหมดอายุ</th>
                <th className="p-3.5 text-center">ขนาด × จำนวน</th>
                <th className="p-3.5">ผู้พรีแพ็ค / ภก.ผู้ตรวจ</th>
                <th className="p-3.5 text-center">สถานะ Sheet</th>
                <th className="p-3.5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((record) => {
                const expired = expiryState(record.expDate) === 'expired';
                return (
                  <tr key={record.id} className="transition hover:bg-slate-50/80">
                    <td className="p-3.5 align-top">
                      <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-hospital-700">
                        {record.id}
                      </span>
                      <div className="mt-1 text-[11px] whitespace-nowrap text-slate-400">
                        {formatTimestamp(record.createdAt)}
                      </div>
                    </td>
                    <td className={`p-3.5 align-top font-bold ${expired ? 'text-slate-400' : 'text-slate-800'}`}>
                      {record.drugName}
                    </td>
                    <td className="p-3.5 align-top font-mono text-xs text-slate-700">{record.lotNo}</td>
                    <td className="p-3.5 align-top text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">บรรจุ:</span>
                        <strong className="font-mono text-emerald-700">
                          {formatThaiDate(record.prepackDate)}
                        </strong>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-slate-500">หมดอายุ:</span>
                        <strong className="font-mono text-rose-600">{formatThaiDate(record.expDate)}</strong>
                      </div>
                      <ExpiryChip expDate={record.expDate} />
                    </td>
                    <td className="p-3.5 align-top text-center">
                      <div className="font-bold text-slate-800">{record.totalPacks} ซอง</div>
                      <div className="text-[11px] text-slate-500">
                        ({record.packSize} {record.unit} ={' '}
                        {(record.packSize * record.totalPacks).toLocaleString()})
                      </div>
                    </td>
                    <td className="p-3.5 align-top text-xs">
                      <div>
                        <span className="text-slate-400">ผู้เตรียม:</span>{' '}
                        <span className="font-semibold text-slate-700">{record.preparedBy}</span>
                      </div>
                      <div className="mt-0.5">
                        <span className="text-slate-400">ผู้ตรวจ:</span>{' '}
                        <span className="font-semibold text-indigo-700">{record.checkedBy}</span>
                      </div>
                    </td>
                    <td className="p-3.5 align-top text-center">
                      {record.synced ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          ✓ ส่งเข้า Sheet แล้ว
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSyncOne(record)}
                          disabled={busy}
                          className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 transition hover:bg-amber-200 disabled:opacity-60"
                          title={
                            sheetConnected
                              ? 'คลิกเพื่อส่งรายการนี้'
                              : 'ยังไม่ได้เชื่อม Google Sheet — คลิกเพื่อตั้งค่า'
                          }
                        >
                          {busy ? 'กำลังส่ง...' : '↻ รอส่ง (คลิกเพื่อส่ง)'}
                        </button>
                      )}
                    </td>
                    <td className="p-3.5 align-top">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onPrint(record)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-700 transition hover:bg-emerald-100 hover:text-hospital-700"
                          title={`พิมพ์ฉลาก ${record.id}`}
                          aria-label={`พิมพ์ฉลาก ${record.id}`}
                        >
                          <Printer className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(record)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-rose-100 hover:text-rose-600"
                          title={`ลบรายการ ${record.id}`}
                          aria-label={`ลบรายการ ${record.id}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {records.length === 0 && (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <p className="text-sm font-semibold text-slate-500">
              {allCount === 0 ? 'ยังไม่มีรายการ Pre-pack' : 'ไม่พบรายการที่ตรงกับการค้นหา'}
            </p>
            {allCount === 0 && (
              <>
                <p className="max-w-md text-xs text-slate-400">
                  เริ่มบันทึกจากแท็บ “บันทึกทำ Pre-pack” ข้อมูลจะถูกเก็บไว้ในเบราว์เซอร์เครื่องนี้
                  และส่งเข้า Google Sheet ได้ทุกเมื่อ
                </p>
                <button
                  type="button"
                  onClick={onLoadSample}
                  className="btn mt-1 border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
                >
                  โหลดข้อมูลตัวอย่าง 3 รายการ
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {busy && (
        <p className="flex items-center justify-end gap-2 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          กำลังส่งข้อมูลเข้า Google Sheet...
        </p>
      )}
    </div>
  );
}
