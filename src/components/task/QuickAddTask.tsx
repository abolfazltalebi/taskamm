import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { parseNaturalPersianTask } from '../../lib/parser';
import { 
  Plus, 
  Sparkles, 
  Calendar, 
  Clock, 
  Tag, 
  AlertCircle, 
  CornerDownLeft, 
  X, 
  Layers
} from 'lucide-react';
import { formatJalaliDate, toPersianDigits } from '../../lib/jalali';
import { type TaskPriority } from '../../types';

interface QuickAddTaskProps {
  defaultBoardId?: string;
  defaultListId?: string;
  onClose?: () => void;
  inline?: boolean;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({ 
  defaultBoardId, 
  defaultListId, 
  onClose,
  inline = false 
}) => {
  const { addTask, boards, lists, activeBoardId } = useAppStore();
  const [inputText, setInputText] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState(defaultBoardId || activeBoardId || boards[0]?.id || '');
  const [selectedListId, setSelectedListId] = useState(defaultListId || '');
  const [manualPriority, setManualPriority] = useState<TaskPriority | null>(null);
  const [manualEstimate, setManualEstimate] = useState<number | null>(null);
  const [manualDueDate, setManualDueDate] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Update lists when board changes
  const currentBoardLists = lists.filter((l) => l.boardId === (selectedBoardId || boards[0]?.id));

  useEffect(() => {
    if (!selectedListId && currentBoardLists.length > 0) {
      setSelectedListId(currentBoardLists[0].id);
    }
  }, [selectedBoardId, currentBoardLists, selectedListId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Parse natural language in real-time
  const parsed = parseNaturalPersianTask(inputText);

  const finalPriority = manualPriority || parsed.priority;
  const finalEstimate = manualEstimate !== null ? manualEstimate : parsed.estimateMinutes;
  const finalDueDate = manualDueDate !== null ? manualDueDate : parsed.dueAt;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const title = parsed.title.trim();
    if (!title) return;

    await addTask({
      title,
      boardId: selectedBoardId || boards[0]?.id,
      listId: selectedListId || currentBoardLists[0]?.id,
      priority: finalPriority,
      estimateMinutes: finalEstimate,
      dueAt: finalDueDate,
      tags: parsed.tags,
    });

    setInputText('');
    setManualPriority(null);
    setManualEstimate(null);
    setManualDueDate(null);

    if (onClose) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  // Quick preset helpers
  const setQuickDate = (offsetDays: number, hour: number = 18) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    setManualDueDate(d.getTime());
  };

  return (
    <div 
      id="quick-add-task-container"
      className={`${inline ? 'w-full' : 'w-full max-w-2xl mx-auto rounded-3xl bg-white dark:bg-[#131F2E] backdrop-blur-2xl border border-gray-200/90 dark:border-slate-800 shadow-2xl p-4 sm:p-5 text-gray-900 dark:text-slate-100 transition-colors'}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border border-emerald-200/70 dark:border-emerald-500/30">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white">ثبت سریع تسک</h3>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">به فارسی بنویسید؛ زمان، تخمین و اولویت هوشمند استخراج می‌شوند</p>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main Title Input with Floating Parser Hint */}
        <div className="relative">
          <input
            id="quick-task-title-input"
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="مثال: فردا ساعت ۱۸ گزارش عملکرد ۳ ساعت #کاری !فوری"
            className="w-full rounded-2xl bg-gray-50/80 dark:bg-[#0B131E] border border-gray-200 dark:border-slate-700 px-4 py-3 pe-12 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 dark:focus:border-emerald-500 transition font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute end-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white disabled:opacity-30 disabled:pointer-events-none transition shadow-xs cursor-pointer"
            title="افزودن (Enter)"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Natural Language Extracted Preview Pills */}
        {inputText.trim() && parsed.confidence > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-500/30 text-[11px] text-emerald-900 dark:text-emerald-200 overflow-x-auto no-scrollbar">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span className="shrink-0 font-bold">شناسایی هوشمند:</span>
            {parsed.extractedText.dateStr && (
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-600/40 shrink-0 shadow-2xs font-medium">
                📅 {parsed.extractedText.dateStr} {parsed.extractedText.timeStr || ''}
              </span>
            )}
            {parsed.extractedText.estimateStr && (
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-600/40 shrink-0 shadow-2xs font-medium">
                ⏱️ تخمین: {parsed.extractedText.estimateStr}
              </span>
            )}
            {parsed.extractedText.priorityStr && (
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-600/40 shrink-0 shadow-2xs font-medium">
                🚨 اولویت: {parsed.extractedText.priorityStr}
              </span>
            )}
            {parsed.extractedText.tagStr && (
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-600/40 shrink-0 shadow-2xs font-medium">
                🏷️ {parsed.extractedText.tagStr}
              </span>
            )}
          </div>
        )}

        {/* Quick Attribute Chips (One-tap selection) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          {/* Due date quick presets */}
          <div className="flex items-center gap-1 bg-gray-100/90 dark:bg-slate-800/60 p-1 rounded-xl border border-gray-200 dark:border-slate-700/60">
            <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400 ms-1" />
            <button
              type="button"
              onClick={() => setQuickDate(0, 18)}
              className={`px-2 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                finalDueDate && new Date(finalDueDate).toDateString() === new Date().toDateString()
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-medium'
              }`}
            >
              امروز
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(1, 18)}
              className={`px-2 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                finalDueDate && new Date(finalDueDate).toDateString() === new Date(Date.now() + 86400000).toDateString()
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-medium'
              }`}
            >
              فردا
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(7, 18)}
              className="px-2 py-1 rounded-lg text-[11px] text-gray-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer font-medium"
            >
              هفته بعد
            </button>
          </div>

          {/* Estimate quick presets */}
          <div className="flex items-center gap-1 bg-gray-100/90 dark:bg-slate-800/60 p-1 rounded-xl border border-gray-200 dark:border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400 ms-1" />
            {[15, 30, 60, 120].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setManualEstimate(mins)}
                className={`px-2 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                  finalEstimate === mins
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-medium'
                }`}
              >
                {mins === 60 ? '۱س' : mins === 120 ? '۲س' : `${toPersianDigits(mins)}د`}
              </button>
            ))}
          </div>

          {/* Priority quick presets */}
          <div className="flex items-center gap-1 bg-gray-100/90 dark:bg-slate-800/60 p-1 rounded-xl border border-gray-200 dark:border-slate-700/60">
            <AlertCircle className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400 ms-1" />
            <button
              type="button"
              onClick={() => setManualPriority('urgent')}
              className={`px-2 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                finalPriority === 'urgent'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-medium'
              }`}
            >
              فوری
            </button>
            <button
              type="button"
              onClick={() => setManualPriority('high')}
              className={`px-2 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                finalPriority === 'high'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-medium'
              }`}
            >
              مهم
            </button>
          </div>
        </div>

        {/* Board & List Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 text-xs border-t border-gray-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gray-100/90 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700">
              <Layers className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
              <select
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                className="bg-transparent text-gray-800 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                    {b.emoji} {b.name}
                  </option>
                ))}
              </select>
            </div>

            {currentBoardLists.length > 0 && (
              <div className="flex items-center gap-1.5 bg-gray-100/90 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700">
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="bg-transparent text-gray-800 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  {currentBoardLists.map((l) => (
                    <option key={l.id} value={l.id} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!inputText.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer ms-auto"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت تسک</span>
          </button>
        </div>
      </form>
    </div>
  );
};
