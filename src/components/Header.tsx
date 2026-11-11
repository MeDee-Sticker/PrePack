import { ExternalLink, Link2Off, Pill, Settings2, Sheet } from 'lucide-react';

interface HeaderProps {
  sheetConnected: boolean;
  /** Saved Google Sheet link, when the site config provides one. */
  spreadsheetUrl: string;
  onOpenSettings: () => void;
}

export default function Header({ sheetConnected, spreadsheetUrl, onOpenSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-hospital-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/20 p-2.5">
            <Pill className="h-6 w-6 text-emerald-300" aria-hidden="true" />
          </div>
          <div>
            <h1 className="flex flex-wrap items-center gap-2 text-lg font-bold tracking-tight">
              <span>MedPre-Pack</span>
              <span className="rounded-full border border-emerald-700 bg-emerald-800 px-2 py-0.5 text-[11px] font-normal text-emerald-200">
                OPD / IPD Pharmacy
              </span>
            </h1>
            <p className="text-xs text-emerald-200">
              ระบบบันทึกการจัดทำ Pre-pack ยา และพิมพ์ฉลากบาร์โค้ด
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
              title="เปิดไฟล์ Google Sheet ของงานเภสัชกรรม"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span>เปิด Google Sheet</span>
            </a>
          )}

          <button
            type="button"
            onClick={onOpenSettings}
            className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              sheetConnected
                ? 'border-emerald-400/50 bg-emerald-950/80 text-emerald-200 hover:bg-emerald-900'
                : 'border-amber-400/50 bg-amber-950/80 text-amber-200 hover:bg-amber-900'
            }`}
            title="ตั้งค่าการเชื่อมต่อ Google Sheet"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                sheetConnected ? 'animate-pulse bg-emerald-400' : 'bg-amber-400'
              }`}
              aria-hidden="true"
            />
            <span>
              {sheetConnected ? 'เชื่อมต่อ Google Sheet แล้ว' : 'โหมดบันทึกในเครื่อง'}
            </span>
            {sheetConnected ? (
              <Sheet className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Link2Off className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-hospital-900 shadow-sm transition hover:bg-emerald-50"
          >
            <Settings2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <span>ตั้งค่าเชื่อม Google Sheet</span>
          </button>
        </div>
      </div>
    </header>
  );
}
