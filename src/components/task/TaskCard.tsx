import React from 'react';
import { type Task } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { formatRelativeDueDate, toPersianDigits, formatDuration } from '../../lib/jalali';
import { 
  Check, 
  Clock, 
  Calendar, 
  AlertCircle, 
  Repeat, 
  Play, 
  ListChecks, 
  Sparkles,
  ChevronLeft,
  AlertTriangle,
  Flame,
  Bell
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, compact = false }) => {
  const { toggleTaskComplete, setSelectedTaskId, startPomodoro, activeTimer } = useAppStore();

  const isDone = task.status === 'done';
  const dueInfo = formatRelativeDueDate(task.dueAt);
  const totalSubtasks = task.subtasks?.length || 0;
  const doneSubtasks = task.subtasks?.filter((s) => s.isDone).length || 0;
  const isOverSpent = task.estimateMinutes > 0 && task.spentMinutes > task.estimateMinutes;

  const priorityColors = {
    none: 'border-gray-200 text-gray-400 dark:border-slate-800 dark:text-slate-400',
    low: 'border-emerald-200 text-emerald-800 bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-300 dark:bg-emerald-500/10',
    medium: 'border-teal-200 text-teal-800 bg-teal-50 dark:border-teal-500/30 dark:text-teal-300 dark:bg-teal-500/10',
    high: 'border-amber-200 text-amber-800 bg-amber-50 dark:border-amber-500/30 dark:text-amber-300 dark:bg-amber-500/10',
    urgent: 'border-rose-200 text-rose-800 bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:bg-rose-500/15',
  };

  const priorityLabels = {
    none: '',
    low: 'کم',
    medium: 'متوسط',
    high: 'مهم',
    urgent: 'فوری 🚨',
  };

  const isCurrentTimerActive = activeTimer?.taskId === task.id;

  return (
    <div
      id={`task-card-${task.id}`}
      onClick={() => setSelectedTaskId(task.id)}
      className={`group relative w-full text-start rounded-2xl transition-all duration-200 cursor-pointer select-none border ${
        isDone
          ? 'bg-gray-50/70 dark:bg-[#131F2E]/40 border-gray-200/70 dark:border-slate-800/60 opacity-65'
          : 'bg-white dark:bg-[#131F2E] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 border-gray-200/90 dark:border-slate-800/90 shadow-2xs hover:shadow-xs'
      } ${compact ? 'p-3' : 'p-3.5 sm:p-4'}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          id={`task-check-${task.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskComplete(task.id);
          }}
          className={`shrink-0 w-5.5 h-5.5 mt-0.5 rounded-lg flex items-center justify-center transition-all ${
            isDone
              ? 'bg-emerald-600 text-white font-bold shadow-xs scale-105'
              : 'border-2 border-gray-300 dark:border-slate-600 hover:border-emerald-600 dark:hover:border-emerald-400 text-transparent hover:bg-emerald-50 dark:hover:bg-emerald-500/10 active:scale-90'
          }`}
          aria-label={isDone ? 'علامت به عنوان انجام‌نشده' : 'تکمیل تسک'}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Card Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className={`text-xs sm:text-sm font-semibold leading-snug truncate transition ${
                isDone ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
              }`}
            >
              {task.title}
            </h4>

            {/* Recurrence icon */}
            {task.recurrence && task.recurrence !== 'none' && (
              <span className="shrink-0 p-1 text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10 rounded-md" title="تکرارشونده">
                <Repeat className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Optional Short Description Preview */}
          {!compact && task.description && !isDone && (
            <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mt-1 font-normal leading-[1.65]">
              {task.description}
            </p>
          )}

          {/* 🎯 Habit Challenge Progress Bar & Streak */}
          {task.habitDaysTotal && (
            <div className="mt-2 p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-200 font-bold">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-current" />
                  <span>چالش {toPersianDigits(task.habitDaysTotal)} روزه</span>
                  <span className="text-gray-500 dark:text-slate-400 font-normal">
                    (روز {toPersianDigits(task.habitDaysCompleted || 0)})
                  </span>
                </span>
                <span className="text-emerald-700 dark:text-emerald-300 font-black">
                  {toPersianDigits(Math.min(100, Math.round(((task.habitDaysCompleted || 0) / task.habitDaysTotal) * 100)))}٪
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-1.5 bg-gray-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((task.habitDaysCompleted || 0) / task.habitDaysTotal) * 100)}%` }}
                />
              </div>

              {/* Time & Streak meta */}
              <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-slate-400">
                {task.habitTimeOfDay && (
                  <span className="flex items-center gap-0.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <Clock className="w-2.5 h-2.5" />
                    <span>ساعت {toPersianDigits(task.habitTimeOfDay)}</span>
                    {task.reminderMinutesBefore !== null && task.reminderMinutesBefore !== undefined && (
                      <span className="text-gray-400 dark:text-slate-500 font-normal">
                        ({task.reminderMinutesBefore === 0 ? 'سر ساعت' : `${toPersianDigits(task.reminderMinutesBefore)}د قبل`})
                      </span>
                    )}
                  </span>
                )}
                <span>🔥 استریک: {toPersianDigits(task.habitStreak || 0)} روز</span>
              </div>
            </div>
          )}

          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-500 dark:text-slate-400">
              <ListChecks className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
              <span>
                {toPersianDigits(doneSubtasks)} از {toPersianDigits(totalSubtasks)} زیرکار
              </span>
              <div className="flex-1 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-[80px]">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${(doneSubtasks / totalSubtasks) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Metadata Row: Due Date, Spent/Estimate, Tags, Priority */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5 pt-2 border-t border-gray-100 dark:border-slate-800/60 text-[11px]">
            {/* Due date */}
            {task.dueAt && (
              <span
                className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded-md border ${
                  dueInfo.isOverdue
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30'
                    : dueInfo.isToday
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 font-semibold'
                    : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>{dueInfo.text}</span>
              </span>
            )}

            {/* Time Estimate / Spent */}
            {(task.estimateMinutes > 0 || task.spentMinutes > 0) && (
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                  isOverSpent
                    ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40 font-medium'
                    : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60'
                }`}
                title={`صرف‌شده: ${formatDuration(task.spentMinutes)} / تخمین: ${formatDuration(task.estimateMinutes)}`}
              >
                {isOverSpent ? <AlertTriangle className="w-3 h-3 text-amber-500" /> : <Clock className="w-3 h-3 text-gray-400 dark:text-slate-400" />}
                <span>
                  {task.spentMinutes > 0 ? toPersianDigits(task.spentMinutes) : '۰'}
                  {task.estimateMinutes > 0 ? ` / ${toPersianDigits(task.estimateMinutes)}د` : 'د'}
                </span>
              </span>
            )}

            {/* Priority Tag */}
            {task.priority !== 'none' && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                  priorityColors[task.priority]
                }`}
              >
                {priorityLabels[task.priority]}
              </span>
            )}

            {/* User Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {task.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50 text-[10px]"
                  >
                    #{tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">+{toPersianDigits(task.tags.length - 2)}</span>
                )}
              </div>
            )}

            {/* Focus / Pomodoro Fast Start Button */}
            {!isDone && (
              <div className="ms-auto flex items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startPomodoro(task.id, 25);
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                    isCurrentTimerActive
                      ? 'bg-emerald-600 text-white animate-pulse font-bold'
                      : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-300 dark:hover:bg-slate-800'
                  }`}
                  title="شروع تمرکز پومودورو"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span className="hidden sm:inline">تمرکز</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
