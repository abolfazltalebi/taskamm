import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TaskCard } from '../task/TaskCard';
import { 
  formatJalaliDate, 
  toPersianDigits, 
  formatDuration 
} from '../../lib/jalali';
import { Clock, Calendar, AlertCircle, Sparkles } from 'lucide-react';

export const TimelineView: React.FC = () => {
  const { tasks, boards } = useAppStore();

  const activeTasks = tasks
    .filter((t) => !t.deletedAt)
    .sort((a, b) => {
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      return a.dueAt - b.dueAt;
    });

  const scheduledTasks = activeTasks.filter((t) => t.dueAt);
  const unscheduledTasks = activeTasks.filter((t) => !t.dueAt);

  return (
    <div id="timeline-view-container" className="space-y-6">
      <div className="bg-slate-900/70 p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              تایم‌لاین و خط زمانی کارها
            </h2>
            <p className="text-[11px] text-slate-400">مرور کارهای زمان‌بندی‌شده بر اساس تاریخ تحویل</p>
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative border-s-2 border-indigo-500/30 ms-4 sm:ms-6 ps-4 sm:ps-8 space-y-6">
        {scheduledTasks.map((task) => {
          const isDone = task.status === 'done';
          const isOverdue = task.dueAt && task.dueAt < Date.now() && !isDone;

          return (
            <div key={task.id} className="relative group">
              {/* Dot on vertical line */}
              <div
                className={`absolute -start-[25px] sm:-start-[41px] top-4 w-4 h-4 rounded-full border-2 transition ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-300'
                    : isOverdue
                    ? 'bg-rose-500 border-rose-300 animate-pulse'
                    : 'bg-indigo-600 border-indigo-400'
                }`}
              />

              {/* Date banner */}
              <div className="text-xs font-semibold text-indigo-400 mb-1.5 flex items-center gap-2">
                <span>{formatJalaliDate(task.dueAt!, 'full')}</span>
                {isOverdue && (
                  <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                    عقب‌افتاده
                  </span>
                )}
              </div>

              {/* Task card */}
              <TaskCard task={task} />
            </div>
          );
        })}

        {scheduledTasks.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-xs">
            <span>هیچ تسک زمان‌بندی‌شده‌ای برای نمایش در خط زمانی وجود ندارد.</span>
          </div>
        )}
      </div>

      {/* Unscheduled section */}
      {unscheduledTasks.length > 0 && (
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-400">
            کارهای بدون زمان‌بندی ({toPersianDigits(unscheduledTasks.length)})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unscheduledTasks.map((task) => (
              <TaskCard key={task.id} task={task} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
