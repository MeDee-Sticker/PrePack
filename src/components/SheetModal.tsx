import { useEffect, useState } from 'react';
import { CheckCircle2, Copy, Sheet, X } from 'lucide-react';
import { APPS_SCRIPT_TEMPLATE, isValidSheetUrl, normalizeSheetUrl } from '../lib/sheets';
import { copyText } from '../lib/export';

interface SheetModalProps {
  open: boolean;
  sheetUrl: string;
  onClose: () => void;
  onSave: (url: string) => void;
  onDisconnect: () => void;
}

export default function SheetModal({
  open,
  sheetUrl,
  onClose,
  onSave,
  onDisconnect,
}: SheetModalProps) {
  const [draft, setDraft] = useState(sheetUrl);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(sheetUrl);
    setError('');
    setCopied(false);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, sheetUrl, onClose]);

  if (!open) return null;

  const handleCopyScript = async () => {
    if (await copyText(APPS_SCRIPT_TEMPLATE)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } else {
      setError('คัดลอกอัตโนมัติไม่สำเร็จ กรุณาเลือกข้อความในกล่องโค้ดแล้วกด Ctrl+C');
    }
  };

  const handleSave = () => {
    const url = normalizeSheetUrl(draft);
    if (!url) {
      setError('กรุณาวาง Web App URL ก่อนบันทึก');
      return;
    }
    if (!isValidSheetUrl(url)) {
      setError(
        'ลิงก์ต้องขึ้นต้นด้วย https://script.google.com/macros/s/... และลงท้ายด้วย /exec',
      );
      return;
    }
    onSave(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <Sheet className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h3 id="sheet-modal-title" className="text-lg font-bold text-slate-800">
                ตั้งค่าเชื่อมต่อ Google Sheet อัตโนมัติ
              </h3>
              <p className="text-xs text-slate-500">
                วางลิงก์ Web App URL ด้านล่างเพื่อเชื่อมฐานข้อมูลทันทีโดยไม่ต้องแก้ไขโค้ด
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="ปิดหน้าต่างตั้งค่า"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              ขั้นตอนที่ 1: คัดลอกโค้ดไปวางใน Google Sheet (ส่วนขยาย &gt; Apps Script)
            </span>
            <button
              type="button"
              onClick={handleCopyScript}
              className="btn shrink-0 gap-1.5 bg-emerald-600 px-3 py-1.5 text-white shadow-sm hover:bg-emerald-700"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{copied ? '✓ คัดลอกโค้ดแล้ว!' : 'คัดลอกโค้ด Apps Script'}</span>
            </button>
          </div>

          <pre className="max-h-40 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-emerald-300">
            {APPS_SCRIPT_TEMPLATE}
          </pre>

          <ol className="list-decimal space-y-1 pl-4 text-xs text-slate-600">
            <li>
              เปิด Google Sheet ของคุณ แล้วไปที่เมนู <strong>ส่วนขยาย (Extensions) &gt; Apps Script</strong>
            </li>
            <li>
              ลบโค้ดเดิมทิ้ง วางโค้ดด้านบนลงไป กดบันทึก 💾 แล้วไปที่ <strong>การทำให้ใช้งานได้ (Deploy) &gt; การทำให้ใช้งานได้รายการใหม่</strong>
            </li>
            <li>
              เลือกประเภทเป็น <strong>เว็บแอป (Web app)</strong> และตั้งค่าผู้มีสิทธิ์เข้าถึงเป็น{' '}
              <strong>“ทุกคน (Anyone)”</strong> กด Deploy แล้วคัดลอกลิงก์ Web App URL
            </li>
          </ol>
        </div>

        <div>
          <label className="field-label" htmlFor="sheet-url">
            ขั้นตอนที่ 2: วาง Web App URL ที่ได้จาก Google Apps Script
          </label>
          <input
            id="sheet-url"
            type="url"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError('');
            }}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            className={`field font-mono ${error ? 'border-rose-400 bg-rose-50/40' : ''}`}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'sheet-url-error' : undefined}
          />
          {error ? (
            <p id="sheet-url-error" className="mt-1.5 text-[11px] font-semibold text-rose-600">
              {error}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-500">
              ลิงก์จะขึ้นต้นด้วย{' '}
              <code className="rounded bg-slate-100 px-1">https://script.google.com/macros/s/...</code>{' '}
              และลงท้ายด้วย <code className="rounded bg-slate-100 px-1">/exec</code>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          {sheetUrl ? (
            <button
              type="button"
              onClick={onDisconnect}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              ยกเลิกการเชื่อมต่อ URL ปัจจุบัน
            </button>
          ) : (
            <span className="text-xs text-slate-400">ยังไม่ได้เชื่อมต่อ Google Sheet</span>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn bg-slate-100 px-4 py-2.5 text-slate-700 hover:bg-slate-200"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn gap-1.5 bg-hospital-700 px-5 py-2.5 text-white shadow-md hover:bg-hospital-800"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>บันทึกและเชื่อมต่อทันที</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
