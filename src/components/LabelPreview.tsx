import { Printer } from 'lucide-react';
import ThermalLabel, { type LabelData } from './ThermalLabel';

interface LabelPreviewProps {
  data: LabelData;
  code: string;
  onPrint: () => void;
}

export default function LabelPreview({ data, code, onPrint }: LabelPreviewProps) {
  return (
    <div className="space-y-4 lg:col-span-5 xl:col-span-4">
      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 text-white shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-bold">
            <Printer className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            ตัวอย่างสติ๊กเกอร์ (Thermal Label)
          </span>
          <span className="rounded bg-slate-700 px-2 py-0.5 text-[11px] text-slate-300">60 × 40 มม.</span>
        </div>

        <div className="mx-auto w-fit overflow-hidden rounded-xl bg-white shadow-inner">
          <ThermalLabel data={data} />
        </div>

        <p className="mt-3 text-center text-[11px] text-slate-400">
          บาร์โค้ด Code128 · รหัส {code} · สแกนได้จริง
        </p>

        <button
          type="button"
          onClick={onPrint}
          className="btn mt-4 w-full gap-2 bg-emerald-600 py-2.5 text-white shadow hover:bg-emerald-500"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          <span>ทดสอบพิมพ์สติ๊กเกอร์ใบนี้</span>
        </button>
      </div>

      <div className="card space-y-2 p-4 text-xs text-slate-600">
        <h3 className="text-sm font-bold text-slate-800">ขนาดกระดาษที่แนะนำ</h3>
        <p>
          ตั้งค่าเครื่องพิมพ์ความร้อนเป็น <strong>60 × 40 มม.</strong> และปิดการย่อหน้า
          (Scale 100%) เพื่อให้ฉลากตรงกับสติ๊กเกอร์จริง
        </p>
        <p className="text-[11px] text-slate-500">
          ระบบซ่อนทุกอย่างที่ไม่ใช่ฉลากเมื่อสั่งพิมพ์ จึงพิมพ์ได้ทีละใบโดยไม่ต้องครอปหน้า
        </p>
      </div>
    </div>
  );
}
