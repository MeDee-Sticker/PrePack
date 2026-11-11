import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import type { ToastState } from '../types';

const STYLES = {
  success: { dot: 'bg-emerald-400', icon: CheckCircle2 },
  warning: { dot: 'bg-amber-400', icon: AlertTriangle },
  error: { dot: 'bg-rose-400', icon: AlertTriangle },
} as const;

export default function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  const style = STYLES[toast.kind];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-white shadow-2xl sm:right-6 sm:bottom-6"
    >
      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
      <p className="text-sm leading-snug font-medium">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-0.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        aria-label="ปิดการแจ้งเตือน"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
