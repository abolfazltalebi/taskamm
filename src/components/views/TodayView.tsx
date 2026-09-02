import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TaskCard } from '../task/TaskCard';
import { QuickAddTask } from '../task/QuickAddTask';
import { 
  formatJalaliDate, 
  toPersianDigits, 
  formatDuration 
} from '../../lib/jalali';
import { 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  Sparkles, 
  Plus, 
  Filter, 
  Flame, 
  ListFilter 
} from 'lucide-react';
import { type TaskPriority } from '../../types';

export const TodayView: React.FC = () => {
  const { tasks, setIsQuickAddOpen } = useAppStore();
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'urgent' | 'done'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const now = new Date();
  const todayDateString = now.toDateString();

  // All active tasks
  const activeTasks = tasks.filter((t) => !t.deletedAt);

  // Overdue tasks (due date is before today, not done)
  const overdueTasks = activeTasks.filter((t) => {
    if (t.status === 'done' || !t.dueAt) return false;
    const dueDate = new Date(t.dueAt);
    return dueDate < now && dueDate.toDateString() !== todayDateString;
  });

  // Today's tasks (due today, or created today, or in progress)
  const todayTasks = activeTasks.filter((t) => {
    if (!t.dueAt) return t.status === 'in_progress';
    const dueDate = new Date(t.dueAt);
    return dueDate.toDateString() === todayDateString;
  });

  // Filter today tasks
  const filteredTodayTasks = todayTasks.filter((t) => {
    if (filterType === 'pending') return t.status !== 'done';
    if (filterType === 'urgent') return t.priority === 'urgent' || t.priority === 'high';
    if (filterType === 'done') return t.status === 'done';
    if (selectedTag) return t.tags?.includes(selectedTag);
    return true;
  });

  // Statistics
  const completedTodayCount = todayTasks.filter((t) => t.status === 'done').length;
  const totalTodayCount = todayTasks.length;
  const progressPercent = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;
  const totalTodaySpentMinutes = todayTasks.reduce((acc, t) => acc + (t.spentMinutes || 0), 0);

  // Get all unique tags from today's tasks
  const allTags = Array.from(new Set(todayTasks.flatMap((t) => t.tags || [])));

  return (
    <div id="today-view-container" className="space-y-6">
      {/* Top Welcome & Daily Progress Summary Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#131F2E] border border-gray-200/90 dark:border-slate-800/80 p-5 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/70 dark:border-emerald-500/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>برنامه امروز</span>
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                {formatJalaliDate(Date.now(), 'dayOfWeek')}
              </span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-snug">
              {totalTodayCount === 0
                ? 'امروز تسکی تعریف نشده است.'
                : completedTodayCount === totalTodayCount && totalTodayCount > 0
                ? 'فوق‌العاده است! تمام کارهای امروز تکمیل شدند ✨'
                : `${toPersianDigits(totalTodayCount - completedTodayCount)} کار برای رسیدگی باقی مانده است.`}
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1 font-normal">
              زمان ثبت‌شده امروز: <strong className="text-emerald-800 dark:text-emerald-300 font-bold">{formatDuration(totalTodaySpentMinutes)}</strong>
            </p>
          </div>

          {/* Circular / Bar Progress Metric */}
          <div className="flex items-center gap-4 bg-gray-50/90 dark:bg-[#0B131E]/60 p-4 rounded-2xl border border-gray-200/80 dark:border-slate-800 shrink-0 shadow-2xs">
            <div className="text-center">
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                %{toPersianDigits(progressPercent)}
              </span>
              <span className="block text-[11px] text-gray-500 dark:text-slate-400 font-medium">پیشرفت امروز</span>
            </div>

            <div className="w-px h-10 bg-gray-200 dark:bg-slate-800" />

            <div className="text-center">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {toPersianDigits(completedTodayCount)}/{toPersianDigits(totalTodayCount)}
              </span>
              <span className="block text-[11px] text-gray-500 dark:text-slate-400 font-medium">انجام‌شده</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Tasks Alert Section (if any) */}
      {overdueTasks.length > 0 && (
        <div 
          id="overdue-tasks-section"
          className="rounded-2xl bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{toPersianDigits(overdueTasks.length)} تسک عقب‌افتاده از روزهای قبل</span>
            </div>
            <span className="text-[11px] text-rose-600 dark:text-rose-300/80 font-medium">مهلت گذشته</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {overdueTasks.map((task) => (
              <TaskCard key={task.id} task={task} compact />
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Inline Bar */}
      <QuickAddTask inline />

      {/* Filter and Category Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs no-scrollbar">
          <button
            onClick={() => { setFilterType('all'); setSelectedTag(null); }}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              filterType === 'all' && !selectedTag
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 dark:bg-[#131F2E] dark:text-slate-300 dark:hover:text-white dark:border-slate-800'
            }`}
          >
            همه ({toPersianDigits(todayTasks.length)})
          </button>
          <button
            onClick={() => { setFilterType('pending'); setSelectedTag(null); }}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              filterType === 'pending'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 dark:bg-[#131F2E] dark:text-slate-300 dark:hover:text-white dark:border-slate-800'
            }`}
          >
            در انتظار انجام ({toPersianDigits(todayTasks.filter((t) => t.status !== 'done').length)})
          </button>
          <button
            onClick={() => { setFilterType('urgent'); setSelectedTag(null); }}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              filterType === 'urgent'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 dark:bg-[#131F2E] dark:text-slate-300 dark:hover:text-white dark:border-slate-800'
            }`}
          >
            فوری و مهم
          </button>
          <button
            onClick={() => { setFilterType('done'); setSelectedTag(null); }}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              filterType === 'done'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 dark:bg-[#131F2E] dark:text-slate-300 dark:hover:text-white dark:border-slate-800'
            }`}
          >
            انجام‌شده ({toPersianDigits(completedTodayCount)})
          </button>

          {/* Tags */}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1.5 rounded-xl transition text-[11px] cursor-pointer whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 dark:bg-[#131F2E] dark:text-slate-300 dark:hover:text-white dark:border-slate-800'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Grid */}
      {filteredTodayTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTodayTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-[#131F2E]/50 border border-gray-200/90 dark:border-slate-800/60 space-y-3 shadow-2xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/70 dark:border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {todayTasks.length === 0 ? 'هیچ تسکی برای امروز ثبت نشده' : 'تسکی با این فیلتر یافت نشد'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            با استفاده از کادر بالا یا کلید <kbd className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-white font-mono border border-gray-200 dark:border-slate-700">N</kbd> اولین تسک امروز را سریع ثبت کنید.
          </p>
        </div>
      )}
    </div>
  );
};
