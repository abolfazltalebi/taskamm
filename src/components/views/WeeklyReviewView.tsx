import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  formatJalaliDate, 
  toPersianDigits, 
  formatDuration 
} from '../../lib/jalali';
import { 
  BarChart3, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Share2, 
  Copy, 
  TrendingUp, 
  Calendar, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const WeeklyReviewView: React.FC = () => {
  const { tasks } = useAppStore();
  const [copied, setCopied] = useState(false);

  // Filter tasks completed in the last 7 days
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

  const thisWeekCompleted = tasks.filter(
    (t) => t.status === 'done' && t.completedAt && t.completedAt >= oneWeekAgo
  );

  const lastWeekCompleted = tasks.filter(
    (t) => t.status === 'done' && t.completedAt && t.completedAt >= twoWeeksAgo && t.completedAt < oneWeekAgo
  );

  const thisWeekSpentMinutes = tasks.reduce((sum, t) => {
    // If task was updated/completed this week
    if (t.updatedAt >= oneWeekAgo) return sum + (t.spentMinutes || 0);
    return sum;
  }, 0);

  // Incomplete / Overdue rollover tasks
  const rolloverTasks = tasks.filter(
    (t) => t.status !== 'done' && !t.deletedAt && t.dueAt && t.dueAt <= now
  );

  // Generate copyable Persian text report
  const generateReportText = () => {
    const header = `📊 گزارش هفتگی عملکرد من در «تسکامه» (${formatJalaliDate(now, 'dayOfWeek')})\n`;
    const stats = `\n✅ کارهای انجام‌شده: ${toPersianDigits(thisWeekCompleted.length)} تسک\n⏱ زمان کاری ثبت‌شده: ${formatDuration(thisWeekSpentMinutes)}\n`;
    const completedList = thisWeekCompleted.length > 0
      ? `\n🎯 مهم‌ترین دستاوردهای این هفته:\n` + thisWeekCompleted.slice(0, 5).map((t, idx) => `${toPersianDigits(idx + 1)}. ${t.title}`).join('\n')
      : '';
    const pendingList = rolloverTasks.length > 0
      ? `\n\n📌 اولویت‌های انتقال به هفته بعد:\n` + rolloverTasks.slice(0, 3).map((t) => `• ${t.title}`).join('\n')
      : '';
    const footer = `\n\n⚡ ثبت‌شده با وب‌اپلیکیشن تسکامه (Taskame)`;
    return header + stats + completedList + pendingList + footer;
  };

  const handleCopyReport = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div id="weekly-review-view-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-gray-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-500/30 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>گزارش و مرور هفته</span>
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400">{formatJalaliDate(now, 'dayOfWeek')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1E1B4B] dark:text-white">
            این هفته چه کارهایی به سرانجام رسید؟
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            مرور شفاف دستاوردها، ساعت‌های کاری و تنظیم اهداف برای هفته آینده
          </p>
        </div>

        <button
          onClick={handleCopyReport}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-xs transition self-start md:self-auto cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'متن گزارش کپی شد!' : 'کپی متن گزارش برای ارسال'}</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl border border-gray-200/90 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>تسک‌های تکمیل‌شده</span>
          </span>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-black text-[#1E1B4B] dark:text-white">
              {toPersianDigits(thisWeekCompleted.length)}
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500">
              (هفته قبل: {toPersianDigits(lastWeekCompleted.length)})
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl border border-gray-200/90 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>زمان ثبت‌شده</span>
          </span>
          <div className="pt-1">
            <span className="text-3xl font-black text-[#1E1B4B] dark:text-white">
              {formatDuration(thisWeekSpentMinutes)}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl border border-gray-200/90 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>نرخ رشد هفتگی</span>
          </span>
          <div className="pt-1">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {thisWeekCompleted.length >= lastWeekCompleted.length ? '+ ' : ''}
              {toPersianDigits(thisWeekCompleted.length - lastWeekCompleted.length)} تسک
            </span>
          </div>
        </div>
      </div>

      {/* Accomplishments Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completed This Week List */}
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-gray-200/90 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>دستاوردهای به ثمر رسیده ({toPersianDigits(thisWeekCompleted.length)})</span>
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pe-1">
            {thisWeekCompleted.length > 0 ? (
              thisWeekCompleted.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-200/80 dark:border-slate-700/50 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-medium text-gray-800 dark:text-slate-200 truncate">{t.title}</span>
                  </div>
                  {t.spentMinutes > 0 && (
                    <span className="text-gray-500 dark:text-slate-400 text-[11px] shrink-0 font-medium">
                      {formatDuration(t.spentMinutes)}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-xs">
                <span>هنوز تسکی در این هفته تکمیل نشده است.</span>
              </div>
            )}
          </div>
        </div>

        {/* Rollover / Pending into next week */}
        <div className="bg-white dark:bg-slate-900/80 rounded-3xl border border-gray-200/90 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>کارهای باقی‌مانده برای هفته آینده ({toPersianDigits(rolloverTasks.length)})</span>
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pe-1">
            {rolloverTasks.length > 0 ? (
              rolloverTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-200/80 dark:border-slate-700/50 text-xs"
                >
                  <span className="font-medium text-gray-800 dark:text-slate-200 truncate">{t.title}</span>
                  {t.dueAt && (
                    <span className="text-rose-600 dark:text-rose-400 text-[11px] shrink-0 font-medium">
                      {formatJalaliDate(t.dueAt, 'short')}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-xs">
                <span>عالی است! کار عقب‌افتاده‌ای ندارید.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
