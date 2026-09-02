import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  CheckSquare, 
  Kanban, 
  Plus, 
  BarChart3, 
  Settings as SettingsIcon,
  Play
} from 'lucide-react';
import { type ActiveTab } from '../../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsQuickAddOpen, tasks, activeTimer } = useAppStore();

  const pendingTodayCount = tasks.filter(
    (t) => t.status !== 'done' && t.dueAt && new Date(t.dueAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div 
      id="mobile-bottom-navigation-container"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-safe pointer-events-none mb-2"
    >
      <nav 
        id="mobile-bottom-navigation"
        className="pointer-events-auto max-w-md mx-auto apple-liquid-glass rounded-[24px] px-2 py-1.5 transition-all shadow-xl"
      >
        <div className="grid grid-cols-5 items-center justify-items-center h-13 relative">
          {/* 1. Today Tab */}
          <button
            id="mobile-tab-today"
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              activeTab === 'today'
                ? 'apple-liquid-pill-active text-emerald-800 dark:text-emerald-300 font-black'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <CheckSquare className="w-5 h-5" />
              {pendingTodayCount > 0 && (
                <span className="absolute -top-1 -end-2 w-3.5 h-3.5 rounded-full bg-emerald-600 text-[8px] font-black text-white flex items-center justify-center shadow-xs">
                  {pendingTodayCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-bold tracking-tight">امروز</span>
          </button>

          {/* 2. Boards Tab */}
          <button
            id="mobile-tab-boards"
            onClick={() => setActiveTab('boards')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              activeTab === 'boards'
                ? 'apple-liquid-pill-active text-emerald-800 dark:text-emerald-300 font-black'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <Kanban className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold tracking-tight">بردها</span>
          </button>

          {/* 3. Center Quick Add Button (Sleek flush Apple liquid glass pill) */}
          <button
            id="mobile-center-add-btn"
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            aria-label="افزودن تسک یا چالش جدید"
            title="ثبت سریع تسک یا چالش"
          >
            <Plus className="w-5.5 h-5.5 stroke-[2.5]" />
          </button>

          {/* 4. Focus Pomodoro Tab */}
          <button
            id="mobile-tab-focus"
            onClick={() => setActiveTab('focus')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              activeTab === 'focus'
                ? 'apple-liquid-pill-active text-emerald-800 dark:text-emerald-300 font-black'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Play className="w-5 h-5" />
              {activeTimer?.isRunning && (
                <span className="absolute -top-0.5 -end-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-bold tracking-tight">تمرکز</span>
          </button>

          {/* 5. Weekly Review / Reports Tab */}
          <button
            id="mobile-tab-review"
            onClick={() => setActiveTab('review')}
            className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              activeTab === 'review'
                ? 'apple-liquid-pill-active text-emerald-800 dark:text-emerald-300 font-black'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold tracking-tight">گزارش</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
