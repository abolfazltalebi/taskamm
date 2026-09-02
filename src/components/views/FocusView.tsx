import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Target
} from 'lucide-react';
import { toPersianDigits, formatDuration } from '../../lib/jalali';
import { sounds, triggerHaptic } from '../../lib/audio';

export const FocusView: React.FC = () => {
  const { 
    tasks, 
    activeTimer, 
    startPomodoro, 
    startStopwatch, 
    pauseTimer, 
    resumeTimer, 
    stopTimer, 
    tickTimer,
    toggleTaskComplete 
  } = useAppStore();

  const [selectedTaskIdForFocus, setSelectedTaskIdForFocus] = useState<string>(
    activeTimer?.taskId || tasks.find((t) => t.status !== 'done')?.id || ''
  );

  const activeTask = tasks.find((t) => t.id === (activeTimer?.taskId || selectedTaskIdForFocus));

  // Timer Tick Driver (runs only when timer is running)
  useEffect(() => {
    if (!activeTimer?.isRunning) return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isRunning, tickTimer]);

  const remainingSeconds = activeTimer?.remainingSeconds || 25 * 60;
  const initialDuration = activeTimer?.durationSeconds || 25 * 60;
  const isStopwatch = activeTimer?.mode === 'stopwatch';

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;

  const progressPercent = isStopwatch 
    ? 100 
    : ((initialDuration - remainingSeconds) / initialDuration) * 100;

  const formatTimerDigits = (num: number) => {
    return toPersianDigits(num < 10 ? `0${num}` : `${num}`);
  };

  const handleStartDefaultPomodoro = () => {
    if (activeTask) {
      startPomodoro(activeTask.id, 25);
    }
  };

  const handleStartShortBreak = () => {
    startPomodoro(activeTask?.id || '', 5);
  };

  return (
    <div id="focus-view-container" className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Task Selector Banner */}
      <div className="bg-white dark:bg-slate-900/80 rounded-3xl p-5 border border-gray-200/90 dark:border-slate-800 shadow-2xs space-y-3">
        <label className="block text-xs font-bold text-gray-600 dark:text-slate-400">
          تسک انتخابی برای جلسه تمرکز و پومودورو:
        </label>
        <select
          value={activeTimer?.taskId || selectedTaskIdForFocus}
          onChange={(e) => setSelectedTaskIdForFocus(e.target.value)}
          disabled={activeTimer?.isRunning}
          className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
        >
          {tasks
            .filter((t) => !t.deletedAt)
            .map((t) => (
              <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                {t.status === 'done' ? '✓ ' : ''}{t.title} ({formatDuration(t.spentMinutes || 0)} صرف‌شده)
              </option>
            ))}
        </select>
      </div>

      {/* Big Circular Focus Timer Stage */}
      <div className="relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/90 dark:border-slate-800 shadow-xs">
        {/* Ambient Glow */}
        <div className="absolute w-64 h-64 bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Circular Progress Ring */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-gray-100 dark:text-slate-800/80 stroke-current"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Animated progress */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-indigo-600 dark:text-indigo-500 stroke-current transition-all duration-1000 ease-linear"
              strokeWidth="6"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-6xl font-black text-[#1E1B4B] dark:text-white font-mono tracking-tight">
              {formatTimerDigits(mins)}:{formatTimerDigits(secs)}
            </span>
            <span className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold mt-1">
              {isStopwatch ? 'کرنومتر آزاد' : 'زمان تمرکز عمیق'}
            </span>
            {activeTask && (
              <span className="text-xs text-gray-500 dark:text-slate-400 max-w-[180px] sm:max-w-[220px] truncate mt-2 font-medium">
                {activeTask.title}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-8">
          {!activeTimer || !activeTimer.isRunning ? (
            <button
              onClick={() => {
                if (activeTimer) resumeTimer();
                else handleStartDefaultPomodoro();
              }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{activeTimer ? 'ادامه تمرکز' : 'شروع ۲۵ دقیقه'}</span>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              <Pause className="w-5 h-5" />
              <span>توقف موقت</span>
            </button>
          )}

          {activeTimer && (
            <button
              onClick={stopTimer}
              className="p-3.5 rounded-2xl bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-600/20 dark:hover:text-rose-400 dark:text-slate-400 border border-gray-200 dark:border-slate-700 transition cursor-pointer"
              title="پایان جلسه و ذخیره زمان"
            >
              <Square className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mode preset triggers */}
        <div className="flex items-center gap-2 mt-6 text-xs">
          <button
            onClick={() => startPomodoro(activeTask?.id || '', 25)}
            className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition font-medium cursor-pointer"
          >
            ۲۵ د پومودورو
          </button>
          <button
            onClick={() => startPomodoro(activeTask?.id || '', 50)}
            className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition font-medium cursor-pointer"
          >
            ۵۰ د کار عمیق
          </button>
          <button
            onClick={handleStartShortBreak}
            className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition font-medium cursor-pointer"
          >
            ۵ د استراحت
          </button>
          <button
            onClick={() => startStopwatch(activeTask?.id || '')}
            className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition font-medium cursor-pointer"
          >
            کرنومتر
          </button>
        </div>
      </div>
    </div>
  );
};
