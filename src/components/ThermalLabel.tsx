import type { PackUnit } from '../types';
import { formatThaiDate } from '../lib/date';
import Barcode from './Barcode';

export interface LabelData {
  id: string;
  drugName: string;
  lotNo: string;
  packSize: number;
  unit: PackUnit;
  prepackDate: string;
  expDate: string;
  totalPacks: number;
  preparedBy: string;
  checkedBy: string;
}

/**
 * A real-size 60 x 40 mm thermal sticker. Used for both the on-screen preview
 * and the print area, so what is previewed is exactly what prints.
 */
export default function ThermalLabel({ data }: { data: LabelData }) {
  return (
    <div className="box-border flex h-[40mm] w-[60mm] flex-col overflow-hidden bg-white px-[3mm] py-[1.8mm] text-black">
      <div className="flex items-start justify-between gap-1 border-b-2 border-black pb-[0.8mm]">
        <div className="min-w-0">
          <div className="text-[5.5pt] font-bold tracking-wide">งานเภสัชกรรม · MedPre-Pack</div>
          <div className="text-[8.5pt] leading-[1.15] font-extrabold break-words">
            {data.drugName || 'ชื่อยา'}
          </div>
        </div>
        <div className="shrink-0 border border-black px-[1mm] py-[0.3mm] font-mono text-[6pt] font-bold">
          {data.id}
        </div>
      </div>

      <div className="mt-[0.9mm] flex items-end justify-between text-[6.5pt]">
        <span>
          ขนาดบรรจุ:{' '}
          <b className="text-[8pt]">
            {data.packSize} {data.unit}
          </b>
        </span>
        <span>
          จำนวน: <b>{data.totalPacks} ซอง</b>
        </span>
      </div>

      <div className="mt-[0.6mm] flex items-center justify-between text-[6.5pt]">
        <span>
          Lot: <b className="font-mono">{data.lotNo || '-'}</b>
        </span>
        <span>
          บรรจุ: <b className="font-mono">{formatThaiDate(data.prepackDate)}</b>
        </span>
      </div>

      <div className="mt-[0.6mm] flex items-center justify-between rounded-[0.8mm] bg-black px-[1.2mm] py-[0.5mm] text-white">
        <span className="text-[6.5pt] font-bold">EXP</span>
        <b className="font-mono text-[8.5pt] font-extrabold">{formatThaiDate(data.expDate)}</b>
      </div>

      <div className="mt-[0.5mm] flex justify-between gap-1 text-[5.5pt]">
        <span className="truncate">ผู้เตรียม: {data.preparedBy || '-'}</span>
        <span className="truncate text-right">ผู้ตรวจ: {data.checkedBy || '-'}</span>
      </div>

      <div className="mt-auto flex justify-center">
        <Barcode value={data.id} className="max-w-full" />
      </div>
    </div>
  );
}
