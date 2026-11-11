import { createPortal } from 'react-dom';
import ThermalLabel from './ThermalLabel';
import type { PrepackRecord } from '../types';

/**
 * Portal target for printing. It must be a direct child of <body>, because the
 * print stylesheet hides every other top-level element.
 */
export default function PrintArea({ record }: { record: PrepackRecord | null }) {
  return createPortal(
    <div id="print-area">{record ? <ThermalLabel data={record} /> : null}</div>,
    document.body,
  );
}
