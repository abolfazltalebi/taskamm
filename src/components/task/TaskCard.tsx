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
  AlertTriangle
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
    low: 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:bg-emerald-500/10',
    medium: 'border-sky-200 text-sky-700 bg-sky-50 dark:border-sky-500/30 dark:text-sky-400 dark:bg-sky-500/10',
    high: 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:bg-amber-500/10',
    urgent: 'border-rose-200 text-rose-700 bg-rose-50 dark:border-rose-500/40 dark:text-rose-400 dark:bg-rose-500/15 animate-pulse',
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
          ? 'bg-gray-50/70 dark:bg-slate-900/40 border-gray-200/70 dark:border-slate-800/60 opacity-65'
          : 'bg-white dark:bg-slate-900/90 hover:border-indigo-300 dark:hover:border-slate-700 border-gray-200/90 dark:border-slate-800/90 shadow-2xs hover:shadow-xs'
      } ${compact ? 'p-3' : 'p-4'}`}
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
              : 'border-2 border-gray-300 dark:border-slate-600 hover:border-indigo-600 dark:hover:border-indigo-400 text-transparent hover:bg-indigo-50 dark:hover:bg-indigo-500/10 active:scale-90'
          }`}
          aria-label={isDone ? 'علامت به عنوان انجام‌نشده' : 'تکمیل تسک'}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Card Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className={`text-sm font-medium leading-snug truncate transition ${
                isDone ? 'line-through text-gray-400 dark:text-slate-500' : 'text-[#1E293B] dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
              }`}
            >
              {task.title}
            </h4>

            {/* Recurrence icon */}
            {task.recurrence && task.recurrence !== 'none' && (
              <span className="shrink-0 p-1 text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10 rounded-md" title="تکرارشونده">
                <Repeat className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Optional Short Description Preview */}
          {!compact && task.description && !isDone && (
            <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1 mt-1 font-normal">
              {task.description}
            </p>
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
                  className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${(doneSubtasks / totalSubtasks) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Metadata Row: Due Date, Spent/Estimate, Tags, Priority */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-gray-100 dark:border-slate-800/60 text-[11px]">
            {/* Due date */}
            {task.dueAt && (
              <span
                className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded-md border ${
                  dueInfo.isOverdue
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30'
                    : dueInfo.isToday
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30'
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
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40 font-medium'
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
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
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
