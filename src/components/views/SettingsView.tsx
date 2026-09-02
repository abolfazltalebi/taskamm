import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { db } from '../../lib/db';
import { 
  Download, 
  Upload, 
  Bell, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Database, 
  Check, 
  FileSpreadsheet, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { requestNotificationPermission, getPlatformCapabilities } from '../../lib/notifications';
import { toPersianDigits } from '../../lib/jalali';

interface SettingsViewProps {
  onOpenInstallGuide: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenInstallGuide }) => {
  const { 
    soundEnabled, 
    setSoundEnabled, 
    tasks, 
    boards, 
    lists, 
    bulkImportTasks, 
    resetAllData 
  } = useAppStore();

  const [bulkTextInput, setBulkTextInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [notifGranted, setNotifGranted] = useState(
    typeof Notification !== 'undefined' ? Notification.permission === 'granted' : false
  );

  const caps = getPlatformCapabilities();

  // Export JSON
  const handleExportJSON = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      boards,
      lists,
      tasks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskame-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['شناسه', 'عنوان', 'توضیحات', 'وضعیت', 'اولویت', 'تخمین_دقیقه', 'صرف_دقیقه', 'برچسب‌ها', 'تاریخ_ثبت'];
    const rows = tasks.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.estimateMinutes,
      t.spentMinutes,
      `"${(t.tags || []).join(',')}"`,
      new Date(t.createdAt).toISOString(),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskame-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON File
  const handleImportJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          // Store directly in DB
          if (parsed.boards) await db.boards.bulkPut(parsed.boards);
          if (parsed.lists) await db.lists.bulkPut(parsed.lists);
          await db.tasks.bulkPut(parsed.tasks);
          window.location.reload();
        } else {
          setImportStatus('ساختار فایل پشتیبان معتبر نیست.');
        }
      } catch (err) {
        setImportStatus('خطا در خواندن فایل JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Bulk Import line-by-line
  const handleBulkTextImport = async () => {
    if (!bulkTextInput.trim()) return;
    const lines = bulkTextInput.split('\n');
    await bulkImportTasks(lines, boards[0]?.id || 'board_personal');
    setBulkTextInput('');
    setImportStatus(`${toPersianDigits(lines.length)} تسک با موفقیت اضافه شد.`);
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
  };

  const handleResetData = async () => {
    if (confirm('آیا مطمئن هستید؟ با این کار تمام داده‌ها و تسک‌های شما به حالت اولیه بازنشانی می‌شوند.')) {
      await resetAllData();
      window.location.reload();
    }
  };

  return (
    <div id="settings-view-container" className="space-y-6 max-w-3xl mx-auto">
      {/* Title */}
      <div className="bg-slate-900/70 p-5 rounded-3xl border border-slate-800">
        <h2 className="text-lg font-black text-white">تنظیمات و مدیریت داده‌ها</h2>
        <p className="text-xs text-slate-400 mt-1">پشتیبان‌گیری، خروجی اکسل، واردسازی دسته‌جمعی و اعلان‌ها</p>
      </div>

      {/* Backup & Export Section */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>پشتیبان‌گیری و خروجی داده‌ها</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          داده‌های تسکامه در حافظه مرورگر شما (IndexedDB) ذخیره هستند. می‌توانید در هر زمان نسخه کامل را به صورت فایل دانلود کنید.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium text-xs shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>دانلود پشتیبان کامل (JSON)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>خروجی اکسل (CSV)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 cursor-pointer transition">
            <Upload className="w-4 h-4 text-sky-400" />
            <span>بازیابی از فایل JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSONFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Bulk Line-by-Line Task Importer */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>وارد کردن دسته‌جمعی و سریع تسک‌ها (Bulk Import)</span>
        </h3>
        <p className="text-xs text-slate-400">
          لیست کارهای خود را خط به خط در کادر زیر قرار دهید. سیستم به صورت خودکار تاریخ و اولویت‌های هر خط را شناسایی می‌کند.
        </p>

        <textarea
          rows={4}
          value={bulkTextInput}
          onChange={(e) => setBulkTextInput(e.target.value)}
          placeholder={`مثال:\nتماس با علی فردا ساعت ۱۲ !فوری\nارسال گزارش مالی شنبه ۲ ساعت #کاری\nخرید میوه و نان امروز ساعت ۲۰`}
          className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono"
        />

        <div className="flex items-center justify-between">
          <button
            onClick={handleBulkTextImport}
            disabled={!bulkTextInput.trim()}
            className="px-5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition disabled:opacity-40"
          >
            افزودن همه خطوط به لیست تسک‌ها
          </button>

          {importStatus && (
            <span className="text-xs text-emerald-400 font-medium">
              {importStatus}
            </span>
          )}
        </div>
      </div>

      {/* Audio & Notification Controls */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-sky-400" />
          <span>تنظیمات صدا و اعلان‌ها</span>
        </h3>

        <div className="space-y-3">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-indigo-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <span className="text-xs font-semibold text-white block">افکت‌های صوتی ملایم</span>
                <span className="text-[11px] text-slate-400">تولید هارمونیک صوتی هنگام تکمیل تسک و پایان پومودورو</span>
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                soundEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {soundEnabled ? 'فعال' : 'غیرفعال'}
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-sky-400" />
              <div>
                <span className="text-xs font-semibold text-white block">مجوز نوتیفیکیشن مرورگر</span>
                <span className="text-[11px] text-slate-400">
                  وضعیت کنونی: {notifGranted ? 'مجاز است ✓' : 'غیرمجاز / در انتظار تایید'}
                </span>
              </div>
            </div>
            {!notifGranted ? (
              <button
                onClick={handleRequestNotifications}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition"
              >
                فعال‌سازی
              </button>
            ) : (
              <span className="text-xs text-emerald-400 font-semibold px-2">فعال است</span>
            )}
          </div>
        </div>

        <button
          onClick={onOpenInstallGuide}
          className="text-xs text-indigo-400 hover:underline flex items-center gap-1.5 pt-1"
        >
          <Info className="w-3.5 h-3.5" />
          <span>مشاهده راهنمای نصب PWA روی آیفون و اندروید</span>
        </button>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="bg-rose-950/20 rounded-3xl border border-rose-500/20 p-5 sm:p-6 space-y-3">
        <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>منطقه خطر: بازنشانی داده‌ها</span>
        </h3>
        <p className="text-xs text-slate-400">
          با زدن این دکمه، تمام تسک‌های شما پاک شده و نمونه داده‌های اولیه بارگذاری خواهند شد.
        </p>
        <button
          onClick={handleResetData}
          className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition"
        >
          بازنشانی کامل داده‌ها
        </button>
      </div>
    </div>
  );
};
