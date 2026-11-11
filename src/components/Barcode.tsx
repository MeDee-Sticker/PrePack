import JsBarcode from 'jsbarcode';
import { useEffect, useRef } from 'react';

interface BarcodeProps {
  value: string;
  /** Module width in px; keep >= 1 for thermal printers. */
  width?: number;
  height?: number;
  className?: string;
}

/** Renders a scannable Code128 barcode as inline SVG. */
export default function Barcode({ value, width = 1.4, height = 30, className }: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    try {
      JsBarcode(svg, value, {
        format: 'CODE128',
        displayValue: false,
        margin: 0,
        width,
        height,
        background: '#ffffff',
        lineColor: '#000000',
      });
    } catch {
      // Value not encodable as Code128 — leave the SVG empty rather than crash the label.
    }
  }, [value, width, height]);

  return <svg ref={svgRef} className={className} role="img" aria-label={`บาร์โค้ด ${value}`} />;
}
