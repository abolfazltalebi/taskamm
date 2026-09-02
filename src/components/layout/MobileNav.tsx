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
    { id: 'focus', label: 'فوکوس', icon: <Play className="w-5 h-5" /> },
    { id: 'review', label: 'مرور هفته', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'تنظیمات', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <nav 
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl border-t border-gray-200/80 dark:border-slate-800/80 pb-safe shadow-lg transition-colors"
    >
      <div className="flex items-center justify-around h-16 px-2 relative">
        {tabs.slice(0, 2).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-all relative cursor-pointer ${
                isActive ? 'text-indigo-700 dark:text-indigo-400 font-bold scale-105' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -end-2 w-4 h-4 rounded-full bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center shadow">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Center Floating Plus Quick Add Button */}
        <div className="relative -top-3">
          <button
            id="mobile-center-add-btn"
            onClick={() => setIsQuickAddOpen(true)}
            className="w-13 h-13 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 active:scale-95 transition cursor-pointer"
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
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-all relative cursor-pointer ${
                isActive ? 'text-indigo-700 dark:text-indigo-400 font-bold scale-105' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {isTimerRunning && (
                  <span className="absolute -top-1 -end-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
