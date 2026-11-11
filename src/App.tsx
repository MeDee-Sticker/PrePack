import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Boxes, Link2Off, PackagePlus, PlugZap } from 'lucide-react';
import Header from './components/Header';
import PrepackForm from './components/PrepackForm';
import LabelPreview from './components/LabelPreview';
import RecordsTable from './components/RecordsTable';
import SheetModal from './components/SheetModal';
import Toast from './components/Toast';
import PrintArea from './components/PrintArea';
import { buildCode, nextSequence } from './lib/codes';
import {
  buildRecord,
  createInitialForm,
  hasErrors,
  validateForm,
  type FormErrors,
} from './lib/form';
import { buildTSV, copyText, downloadCSV } from './lib/export';
import { sendToSheet } from './lib/sheets';
import { loadRecords, loadSettings, makeSampleRecords, saveRecords, saveSettings } from './lib/storage';
import { loadSiteConfig } from './lib/siteConfig';
import { expiryState, todayISO } from './lib/date';
import type { PrepackFormValues, PrepackRecord, Settings, TabKey, ToastKind, ToastState } from './types';

export default function App() {
  const [tab, setTab] = useState<TabKey>('operation');
  const [form, setForm] = useState<PrepackFormValues>(createInitialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [records, setRecords] = useState<PrepackRecord[]>(loadRecords);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [siteSheetUrl, setSiteSheetUrl] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [printJob, setPrintJob] = useState<{ record: PrepackRecord; nonce: number } | null>(null);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    let active = true;
    void loadSiteConfig().then((config) => {
      if (active && config.sheetUrl) setSiteSheetUrl(config.sheetUrl);
    });
    return () => {
      active = false;
    };
  }, []);

  const notify = useCallback((message: string, kind: ToastKind = 'success') => {
    setToast({ id: Date.now(), message, kind });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const printRecord = useCallback((record: PrepackRecord) => {
    setPrintJob({ record, nonce: Date.now() });
  }, []);

  useEffect(() => {
    if (!printJob) return;
    const timer = window.setTimeout(() => window.print(), 150);
    return () => window.clearTimeout(timer);
  }, [printJob]);

  function updateField<K extends keyof PrepackFormValues>(key: K, value: PrepackFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function resetForm(keepStaff = false) {
    const fresh = createInitialForm();
    setForm((prev) => ({
      ...fresh,
      preparedBy: keepStaff ? prev.preparedBy : '',
      checkedBy: keepStaff ? prev.checkedBy : '',
    }));
    setErrors({});
  }

  /** Unsaved draft that mirrors the form, used by both the preview and its print button. */
  const draft = useMemo<PrepackRecord>(() => {
    const seq = nextSequence(records);
    return {
      id: buildCode(form.drugName, seq),
      seq,
      createdAt: new Date().toISOString(),
      drugName: form.drugName.trim() || 'ตัวอย่างชื่อยา 500 mg',
      lotNo: form.lotNo.trim() || 'LOT-XXXX',
      packSize: Number(form.packSize) || 0,
      unit: form.unit,
      prepackDate: form.prepackDate,
      expDate: form.expDate,
      totalPacks: Number(form.totalPacks) || 0,
      preparedBy: form.preparedBy.trim(),
      checkedBy: form.checkedBy.trim(),
      synced: false,
    };
  }, [records, form]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;
    return records.filter((record) =>
      [record.drugName, record.id, record.lotNo, record.preparedBy, record.checkedBy].some(
        (field) => field.toLowerCase().includes(query),
      ),
    );
  }, [records, search]);

  const unsyncedCount = records.filter((record) => !record.synced).length;
  const todayCount = records.filter((record) => record.prepackDate === todayISO()).length;
  const expiringCount = records.filter((record) => expiryState(record.expDate) !== 'valid').length;
  const sheetUrl = settings.sheetUrlOverride ?? siteSheetUrl;
  const sheetConnected = Boolean(sheetUrl);

  async function handleSubmit() {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      notify('กรุณาตรวจสอบข้อมูลในฟอร์มก่อนบันทึก', 'error');
      return;
    }

    const seq = nextSequence(records);
    const record = buildRecord(form, seq, buildCode(form.drugName, seq));
    setBusy(true);

    let synced = false;
    let syncFailed = false;
    if (sheetUrl) {
      try {
        await sendToSheet(sheetUrl, record);
        synced = true;
      } catch {
        syncFailed = true;
      }
    }

    const saved: PrepackRecord = {
      ...record,
      synced,
      syncedAt: synced ? new Date().toISOString() : undefined,
    };

    setRecords((prev) => [saved, ...prev]);

    if (!settings.drugs.some((drug) => drug.toLowerCase() === record.drugName.toLowerCase())) {
      setSettings((prev) => ({ ...prev, drugs: [...prev.drugs, record.drugName] }));
    }

    resetForm(true);
    setBusy(false);

    if (syncFailed) {
      notify(`บันทึก ${record.id} ในเครื่องแล้ว แต่ส่งเข้า Google Sheet ไม่สำเร็จ — ตรวจสอบ URL`, 'error');
    } else if (sheetConnected) {
      notify(`บันทึกและส่งเข้า Google Sheet แล้ว · ${record.id}`, 'success');
    } else {
      notify(`บันทึกลงเครื่องแล้ว · ${record.id}`, 'warning');
    }
  }

  async function handleSyncOne(record: PrepackRecord) {
    if (!sheetUrl) {
      setSheetOpen(true);
      return;
    }
    setBusy(true);
    try {
      await sendToSheet(sheetUrl, record);
      setRecords((prev) =>
        prev.map((item) =>
          item.id === record.id ? { ...item, synced: true, syncedAt: new Date().toISOString() } : item,
        ),
      );
      notify(`ซิงค์รายการ ${record.id} เข้า Google Sheet สำเร็จ`, 'success');
    } catch {
      notify('ส่งข้อมูลไม่สำเร็จ กรุณาตรวจสอบ Web App URL', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleSyncAll() {
    if (!sheetUrl) {
      setSheetOpen(true);
      return;
    }
    const pending = records.filter((record) => !record.synced);
    if (pending.length === 0) {
      notify('ไม่มีรายการที่รอซิงค์', 'warning');
      return;
    }

    setBusy(true);
    const sent = new Set<string>();
    let failed = 0;
    for (const record of pending) {
      try {
        await sendToSheet(sheetUrl, record);
        sent.add(record.id);
      } catch {
        failed += 1;
      }
    }
    if (sent.size > 0) {
      const stamp = new Date().toISOString();
      setRecords((prev) =>
        prev.map((item) =>
          sent.has(item.id) ? { ...item, synced: true, syncedAt: stamp } : item,
        ),
      );
    }
    setBusy(false);
    notify(
      failed > 0
        ? `ซิงค์สำเร็จ ${sent.size} รายการ · ล้มเหลว ${failed} รายการ`
        : `ซิงค์เข้า Google Sheet สำเร็จ ${sent.size} รายการ`,
      failed > 0 ? 'error' : 'success',
    );
  }

  function handleDelete(record: PrepackRecord) {
    if (!window.confirm(`ต้องการลบรายการ ${record.id} (${record.drugName}) หรือไม่?`)) return;
    setRecords((prev) => prev.filter((item) => item.id !== record.id));
    notify(`ลบรายการ ${record.id} แล้ว`, 'warning');
  }

  async function handleCopyTSV() {
    if (filteredRecords.length === 0) {
      notify('ไม่มีข้อมูลให้คัดลอก', 'warning');
      return;
    }
    const ok = await copyText(buildTSV(filteredRecords));
    notify(
      ok
        ? `คัดลอก ${filteredRecords.length} รายการแล้ว — เปิด Google Sheet แล้วกด Ctrl+V วางได้ทันที`
        : 'คัดลอกไม่สำเร็จ กรุณาใช้ปุ่มดาวน์โหลด CSV แทน',
      ok ? 'success' : 'error',
    );
  }

  function handleExportCSV() {
    if (filteredRecords.length === 0) {
      notify('ไม่มีข้อมูลให้ดาวน์โหลด', 'warning');
      return;
    }
    downloadCSV(filteredRecords);
    notify(`ดาวน์โหลด CSV ${filteredRecords.length} รายการแล้ว`, 'success');
  }

  const tabs: { key: TabKey; label: string; icon: typeof PackagePlus; badge?: number }[] = [
    { key: 'operation', label: '1. บันทึกทำ Pre-pack', icon: PackagePlus },
    { key: 'stock', label: '2. คลังยา Pre-pack & ประวัติ', icon: Boxes, badge: records.length },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header sheetConnected={sheetConnected} onOpenSettings={() => setSheetOpen(true)} />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-6 sm:px-6 lg:px-8">
        {!sheetConnected && (
          <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 rounded-xl bg-amber-100 p-2 text-amber-700">
                <Link2Off className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  ระบบกำลังทำงานในโหมดบันทึกในเครื่อง (Local Storage)
                </h3>
                <p className="mt-0.5 text-xs text-amber-700">
                  บันทึกข้อมูลและพิมพ์ฉลากได้ทันที และเมื่อต้องการส่งข้อมูลเข้า Google Sheet
                  อัตโนมัติ ให้กดปุ่ม <strong>“ตั้งค่าเชื่อม Google Sheet”</strong> โดยไม่ต้องแก้โค้ด
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="btn shrink-0 gap-1.5 bg-amber-600 px-4 py-2 text-white shadow-sm hover:bg-amber-700"
            >
              <PlugZap className="h-4 w-4" aria-hidden="true" />
              <span>เชื่อม Google Sheet เลย</span>
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200">
          <div className="flex gap-1" role="tablist" aria-label="หน้าจอการทำงาน">
            {tabs.map(({ key, label, icon: Icon, badge }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 rounded-t-xl border-b-2 px-4 py-3 text-sm transition-all sm:px-5 ${
                    active
                      ? 'border-hospital-600 bg-white font-bold text-hospital-700 shadow-sm'
                      : 'border-transparent text-slate-500 hover:bg-white/50 hover:text-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{label}</span>
                  {badge !== undefined && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-hospital-800">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 pb-2 text-xs text-slate-600 sm:pb-0">
            <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
              <span className="text-slate-400">ทำวันนี้:</span>
              <strong className="text-hospital-700">{todayCount} รายการ</strong>
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
              <span className="text-slate-400">รอส่ง Sheet:</span>
              <strong className={unsyncedCount > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                {unsyncedCount}
              </strong>
            </span>
            {expiringCount > 0 && (
              <span className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700">
                <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                <strong>{expiringCount} รายการใกล้/หมดอายุ</strong>
              </span>
            )}
          </div>
        </div>

        {tab === 'operation' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <PrepackForm
              form={form}
              errors={errors}
              code={draft.id}
              busy={busy}
              sheetConnected={sheetConnected}
              settings={settings}
              onChange={updateField}
              onSubmit={handleSubmit}
              onReset={() => resetForm(false)}
            />
            <LabelPreview data={draft} code={draft.id} onPrint={() => printRecord(draft)} />
          </div>
        ) : (
          <RecordsTable
            records={filteredRecords}
            allCount={records.length}
            search={search}
            onSearchChange={setSearch}
            sheetConnected={sheetConnected}
            busy={busy}
            unsyncedCount={unsyncedCount}
            onPrint={printRecord}
            onDelete={handleDelete}
            onSyncOne={handleSyncOne}
            onSyncAll={handleSyncAll}
            onExportCSV={handleExportCSV}
            onCopyTSV={handleCopyTSV}
            onLoadSample={() => {
              setRecords(makeSampleRecords());
              notify('เพิ่มข้อมูลตัวอย่าง 3 รายการแล้ว', 'success');
            }}
          />
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white/60 py-4 text-center text-[11px] text-slate-400">
        MedPre-Pack · ข้อมูลถูกเก็บในเบราว์เซอร์เครื่องนี้ และส่งเข้า Google Sheet ได้ทุกเมื่อ
      </footer>

      <PrintArea record={printJob?.record ?? null} />

      <SheetModal
        open={sheetOpen}
        effectiveUrl={sheetUrl}
        override={settings.sheetUrlOverride}
        siteUrl={siteSheetUrl}
        onClose={() => setSheetOpen(false)}
        onSave={(url) => {
          setSettings((prev) => ({ ...prev, sheetUrlOverride: url }));
          setSheetOpen(false);
          notify('บันทึกและเชื่อมต่อ Google Sheet แล้ว! พร้อมส่งข้อมูลอัตโนมัติ', 'success');
        }}
        onDisconnect={() => {
          setSettings((prev) => ({ ...prev, sheetUrlOverride: '' }));
          setSheetOpen(false);
          notify('ยกเลิกการเชื่อมต่อ Google Sheet บนเบราว์เซอร์นี้แล้ว', 'warning');
        }}
        onUseSiteDefault={() => {
          setSettings((prev) => ({ ...prev, sheetUrlOverride: null }));
          setSheetOpen(false);
          notify('ใช้ลิงก์ Google Sheet ที่ตั้งค่าไว้ส่วนกลางแล้ว', 'success');
        }}
      />

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
