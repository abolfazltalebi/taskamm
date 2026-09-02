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

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'today', label: 'امروز', icon: <CheckSquare className="w-5 h-5" />, badge: pendingTodayCount > 0 ? pendingTodayCount : undefined },
    { id: 'boards', label: 'بردها', icon: <Kanban className="w-5 h-5" /> },
    { id: 'focus', label: 'تمرکز', icon: <Play className="w-5 h-5" /> },
    { id: 'review', label: 'گزارش', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'تنظیمات', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <div 
      id="mobile-bottom-navigation-container"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-safe pointer-events-none mb-1.5"
    >
      <nav 
        id="mobile-bottom-navigation"
        className="pointer-events-auto max-w-md mx-auto apple-liquid-glass rounded-[26px] px-2 py-1.5 transition-all"
      >
        <div className="flex items-center justify-around h-14 relative">
          {tabs.slice(0, 2).map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center min-w-[52px] py-1 px-2.5 rounded-2xl transition-all relative cursor-pointer active:scale-95 ${
                  isActive 
                    ? 'apple-liquid-pill-active text-emerald-800 dark:text-emerald-300 font-black' 
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -end-2 w-4 h-4 rounded-full bg-emerald-600 text-[9px] font-black text-white flex items-center justify-center shadow-xs border border-white/60 dark:border-slate-800">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 font-bold tracking-tight">{item.label}</span>
              </button>
            );
          })}

          {/* Center Floating Apple Glass Plus Quick Add Button */}
          <div className="relative -top-3">
            <button
              id="mobile-center-add-btn"
              onClick={() => setIsQuickAddOpen(true)}
              className="apple-glass-fab w-12 h-12 rounded-2xl text-white flex items-center justify-center active:scale-95 hover:scale-105 transition-all cursor-pointer"
              aria-label="ثبت سریع تسک"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {tabs.slice(2).map((item) => {
            const isActive = activeTab === item.id;
            const isTimerRunning = item.id === 'focus' && activeTimer?.isRunning;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center min-w-[52px] py-1 px-2.5 rounded-2xl transition-all relative cursor-pointer active:scale-95 ${
                  isActive 
                    ? 'apple-liquid-pill-active text-emerald-800 dark:text-emerald-300 font-black' 
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {isTimerRunning && (
                    <span className="absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 font-bold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
