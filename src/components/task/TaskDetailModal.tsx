import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  type TaskPriority, 
  type TaskRecurrence, 
  type TaskStatus 
} from '../../types';
import { 
  formatJalaliDate, 
  formatDuration, 
  toPersianDigits, 
  formatRelativeDueDate 
} from '../../lib/jalali';
import { 
  X, 
  Check, 
  Calendar, 
  Clock, 
  Tag, 
  AlertCircle, 
  Repeat, 
  Trash2, 
  Play, 
  Square, 
  Plus, 
  Layers, 
  CheckSquare, 
  Square as SquareEmpty, 
  FileText, 
  AlertTriangle,
  Flame,
  Bell 
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const { 
    selectedTaskId, 
    setSelectedTaskId, 
    tasks, 
    updateTask, 
    deleteTask, 
    toggleTaskComplete, 
    toggleSubtask, 
    addSubtask, 
    deleteSubtask, 
    boards, 
    lists, 
    logTime,
    startPomodoro,
    startStopwatch,
    activeTimer,
    stopTimer
  } = useAppStore();

  const task = tasks.find((t) => t.id === selectedTaskId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [customMinutesInput, setCustomMinutesInput] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  if (!task) return null;

  const isDone = task.status === 'done';
  const dueInfo = formatRelativeDueDate(task.dueAt);
  const isOverSpent = task.estimateMinutes > 0 && task.spentMinutes > task.estimateMinutes;
  const isTimerForThisTask = activeTimer?.taskId === task.id;

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
    }
  };

  const handleDescBlur = () => {
    if (description !== task.description) {
      updateTask(task.id, { description });
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const cleanTag = newTagInput.replace(/^[#]/, '').trim();
      if (cleanTag && !task.tags?.includes(cleanTag)) {
        updateTask(task.id, { tags: [...(task.tags || []), cleanTag] });
      }
      setNewTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateTask(task.id, { tags: task.tags?.filter((t) => t !== tagToRemove) });
  };

  const handleLogManualTime = () => {
    const mins = parseInt(customMinutesInput, 10);
    if (!isNaN(mins) && mins > 0) {
      logTime(task.id, mins, 'ثبت دستی');
      setCustomMinutesInput('');
    }
  };

  const handleDelete = async () => {
    if (confirm('آیا از حذف این تسک اطمینان دارید؟ (امکان بازگردانی تا ۵ ثانیه وجود دارد)')) {
      await deleteTask(task.id);
      setSelectedTaskId(null);
    }
  };

  return (
    <div 
      id="task-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
      onClick={() => setSelectedTaskId(null)}
    >
      <div 
        id="task-detail-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-[#131F2E] border border-gray-200 dark:border-slate-800 rounded-3xl shadow-xl text-gray-900 dark:text-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-gray-100 dark:border-slate-800/80 bg-gray-50/70 dark:bg-[#0B131E]/50">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => toggleTaskComplete(task.id)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isDone
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'border-2 border-gray-300 dark:border-slate-600 hover:border-emerald-600 text-transparent hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
            <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
              {isDone ? 'تکمیل‌شده' : 'در دست اقدام'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:text-slate-400 dark:hover:text-rose-400 transition cursor-pointer"
              title="حذف تسک"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedTaskId(null)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Editable Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="w-full bg-transparent text-base sm:text-lg font-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 rounded-xl px-2 py-1.5 border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
              placeholder="عنوان تسک..."
            />
          </div>

          {/* Quick Attribute Bar (Board, Priority, Recurrence, Status) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Status */}
            <div className="bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-gray-200/80 dark:border-slate-700/60">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1">وضعیت</label>
              <select
                value={task.status}
                onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                className="w-full bg-transparent text-xs font-semibold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="todo" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">برای انجام</option>
                <option value="in_progress" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">در حال انجام</option>
                <option value="waiting" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">در انتظار</option>
                <option value="done" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">انجام شد ✨</option>
                <option value="canceled" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">لغو شده</option>
              </select>
            </div>

            {/* Priority */}
            <div className="bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-gray-200/80 dark:border-slate-700/60">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1">اولویت</label>
              <select
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
                className="w-full bg-transparent text-xs font-semibold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="none" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">عادی (بدون اولویت)</option>
                <option value="low" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">پایین</option>
                <option value="medium" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">متوسط</option>
                <option value="high" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">مهم (بالا)</option>
                <option value="urgent" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">فوری 🚨</option>
              </select>
            </div>

            {/* Recurrence */}
            <div className="bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-gray-200/80 dark:border-slate-700/60">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1">تکرار</label>
              <select
                value={task.recurrence || 'none'}
                onChange={(e) => updateTask(task.id, { recurrence: e.target.value as TaskRecurrence })}
                className="w-full bg-transparent text-xs font-semibold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="none" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">یک‌بار (بدون تکرار)</option>
                <option value="daily" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">روزانه</option>
                <option value="weekdays" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">روزهای کاری</option>
                <option value="weekly" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">هفتگی</option>
                <option value="monthly" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">ماهانه</option>
              </select>
            </div>

            {/* Board */}
            <div className="bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-gray-200/80 dark:border-slate-700/60">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-1">برد پروژه</label>
              <select
                value={task.boardId}
                onChange={(e) => updateTask(task.id, { boardId: e.target.value })}
                className="w-full bg-transparent text-xs font-semibold text-gray-900 dark:text-white focus:outline-none cursor-pointer truncate"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                    {b.emoji} {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Management */}
          <div className="bg-gray-50/70 dark:bg-slate-800/40 rounded-2xl p-3.5 sm:p-4 border border-gray-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>مهلت و زمان‌بندی</span>
              </span>
              {task.dueAt && (
                <span className={`text-xs font-semibold ${dueInfo.colorClass}`}>
                  {dueInfo.text}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setHours(18, 0, 0, 0);
                  updateTask(task.id, { dueAt: d.getTime() });
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 font-medium transition cursor-pointer"
              >
                امروز ۱۸:۰۰
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  d.setHours(18, 0, 0, 0);
                  updateTask(task.id, { dueAt: d.getTime() });
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 font-medium transition cursor-pointer"
              >
                فردا ۱۸:۰۰
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 7);
                  d.setHours(18, 0, 0, 0);
                  updateTask(task.id, { dueAt: d.getTime() });
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 font-medium transition cursor-pointer"
              >
                هفته آینده
              </button>
              {task.dueAt && (
                <button
                  type="button"
                  onClick={() => updateTask(task.id, { dueAt: null })}
                  className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 font-medium transition ms-auto cursor-pointer"
                >
                  حذف مهلت
                </button>
              )}
            </div>
          </div>

          {/* 🎯 Habit Challenge & Daily Routine (N Days Goal & Custom Reminders) */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-3.5 sm:p-4 border border-emerald-200/90 dark:border-emerald-800/40 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-200">چالش و روتین روزانه (عادت‌ساز)</h4>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 font-medium">تعیین تعداد روزهای ثابت (مثلاً ۴۰ روز)، ساعت مقرر و یادآوری</p>
                </div>
              </div>

              {task.habitDaysTotal ? (
                <button
                  type="button"
                  onClick={() => updateTask(task.id, { habitDaysTotal: null, recurrence: 'none' })}
                  className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline cursor-pointer font-bold"
                >
                  لغو چالش
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => updateTask(task.id, { habitDaysTotal: 40, recurrence: 'daily', habitTimeOfDay: '18:00', reminderMinutesBefore: 15 })}
                  className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  فعال‌سازی چالش ۴۰ روزه
                </button>
              )}
            </div>

            {task.habitDaysTotal && (
              <div className="space-y-3 pt-1">
                {/* Progress Stats & Bar */}
                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>پیشرفت چالش:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-black">
                        روز {toPersianDigits(task.habitDaysCompleted || 0)} از {toPersianDigits(task.habitDaysTotal)}
                      </span>
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                      {toPersianDigits(Math.min(100, Math.round(((task.habitDaysCompleted || 0) / task.habitDaysTotal) * 100)))}٪
                    </span>
                  </div>

                  {/* Visual Progress Line */}
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-emerald-200/50 dark:border-emerald-900/40">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${Math.min(100, ((task.habitDaysCompleted || 0) / task.habitDaysTotal) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 pt-0.5">
                    <span>🔥 استریک پیوسته: {toPersianDigits(task.habitStreak || 0)} روز</span>
                    <span>{toPersianDigits(Math.max(0, task.habitDaysTotal - (task.habitDaysCompleted || 0)))} روز تا اتمام هدف باقی‌مانده</span>
                  </div>
                </div>

                {/* Preset Days & Custom Days */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300">انتخاب دوره چالش:</label>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {[21, 30, 40, 66, 100].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => updateTask(task.id, { habitDaysTotal: days, recurrence: 'daily' })}
                        className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                          task.habitDaysTotal === days
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-emerald-400'
                        }`}
                      >
                        {toPersianDigits(days)} روزه
                      </button>
                    ))}

                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-gray-200 dark:border-slate-700">
                      <span className="text-[11px] text-gray-500 dark:text-slate-400">تعداد دلخواه:</span>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={task.habitDaysTotal || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val > 0) {
                            updateTask(task.id, { habitDaysTotal: val, recurrence: 'daily' });
                          }
                        }}
                        className="w-12 bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none text-center"
                      />
                      <span className="text-[11px] text-gray-500 dark:text-slate-400">روز</span>
                    </div>
                  </div>
                </div>

                {/* Daily Time & Reminder Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Daily Scheduled Time */}
                  <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>ساعت مقرر روزانه:</span>
                    </span>
                    <input
                      type="time"
                      value={task.habitTimeOfDay || '18:00'}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        const [h, m] = newTime.split(':').map(Number);
                        const d = new Date(task.dueAt || Date.now());
                        if (!isNaN(h) && !isNaN(m)) {
                          d.setHours(h, m, 0, 0);
                        }
                        updateTask(task.id, { habitTimeOfDay: newTime, dueAt: d.getTime() });
                      }}
                      className="bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-900 dark:text-white px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-700 focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Reminder Time */}
                  <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>میزان یادآوری:</span>
                    </span>
                    <select
                      value={task.reminderMinutesBefore !== null && task.reminderMinutesBefore !== undefined ? task.reminderMinutesBefore : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const mins = val === '' ? null : parseInt(val, 10);
                        updateTask(task.id, { reminderMinutesBefore: mins });
                      }}
                      className="bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-900 dark:text-white px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="0">سر ساعت مقرر</option>
                      <option value="5">۵ دقیقه قبل</option>
                      <option value="15">۱۵ دقیقه قبل</option>
                      <option value="30">۳۰ دقیقه قبل</option>
                      <option value="60">۱ ساعت قبل</option>
                      <option value="">بدون یادآوری</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time Tracking & Focus */}
          <div className="bg-gray-50/70 dark:bg-slate-800/40 rounded-2xl p-3.5 sm:p-4 border border-gray-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>تخمین و ثبت زمان کاری</span>
              </span>
              {isOverSpent && (
                <span className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-500/30">
                  <AlertTriangle className="w-3 h-3" />
                  <span>زمان صرف‌شده بیشتر از تخمین شد</span>
                </span>
              )}
            </div>

            {/* Estimates and spent summary */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
              <div className="bg-white dark:bg-[#0B131E]/60 p-2.5 sm:p-3 rounded-xl border border-gray-200 dark:border-slate-800">
                <span className="text-gray-500 dark:text-slate-400 block text-[11px] font-medium">زمان تخمینی (دقیقه):</span>
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  {[15, 30, 60, 120].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => updateTask(task.id, { estimateMinutes: mins })}
                      className={`px-2 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                        task.estimateMinutes === mins
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-medium'
                      }`}
                    >
                      {mins === 60 ? '۱س' : mins === 120 ? '۲س' : `${toPersianDigits(mins)}د`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#0B131E]/60 p-2.5 sm:p-3 rounded-xl border border-gray-200 dark:border-slate-800">
                <span className="text-gray-500 dark:text-slate-400 block text-[11px] font-medium">زمان صرف‌شده:</span>
                <p className="text-sm sm:text-base font-black text-emerald-800 dark:text-emerald-300 mt-1">
                  {formatDuration(task.spentMinutes || 0)}
                </p>
              </div>
            </div>

            {/* Focus Timer Launchers */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => startPomodoro(task.id, 25)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>شروع ۲۵ د پومودورو</span>
              </button>
              <button
                type="button"
                onClick={() => startStopwatch(task.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>کرنومتر آزاد</span>
              </button>

              <div className="flex items-center gap-1.5 ms-auto">
                <input
                  type="number"
                  placeholder="دقیقه دستی"
                  value={customMinutesInput}
                  onChange={(e) => setCustomMinutesInput(e.target.value)}
                  className="w-20 sm:w-24 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleLogManualTime}
                  disabled={!customMinutesInput}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-medium disabled:opacity-40 cursor-pointer"
                >
                  ثبت
                </button>
              </div>
            </div>
          </div>

          {/* Subtasks / Checklist */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>زیرکارها و چک‌لیست</span>
            </span>

            <div className="space-y-1.5">
              {task.subtasks?.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200/80 dark:border-slate-700/40 transition group"
                >
                  <button
                    type="button"
                    onClick={() => toggleSubtask(task.id, sub.id)}
                    className="flex items-center gap-2.5 text-start flex-1 cursor-pointer"
                  >
                    {sub.isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <SquareEmpty className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        sub.isDone ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-800 dark:text-slate-200'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSubtask(task.id, sub.id)}
                    className="p-1 rounded-lg text-gray-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask input */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="افزودن زیرکار جدید..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim()}
                className="p-2 rounded-xl bg-gray-100 hover:bg-emerald-600 text-gray-600 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 dark:text-slate-300 transition disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Description & Long Notes with Enhanced Persian Typography */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>توضیحات و یادداشت‌ها</span>
            </span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescBlur}
              placeholder="توضیحات تکمیلی، لینک‌ها یا یادداشت‌های مرتبط با تسک..."
              className="w-full rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/80 p-3.5 text-xs sm:text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition leading-[1.85] resize-none font-normal persian-reading"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>برچسب‌ها</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {task.tags?.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-500/30 text-xs font-medium text-emerald-800 dark:text-emerald-300"
                >
                  <span>#{t}</span>
                  <button
                    onClick={() => removeTag(t)}
                    className="hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="+ برچسب جدید (Enter)"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/80 px-2.5 py-1 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-[#0B131E]/80 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span className="font-medium">ثبت: {formatJalaliDate(task.createdAt, 'short')}</span>
          <button
            onClick={() => setSelectedTaskId(null)}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer shadow-xs"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
