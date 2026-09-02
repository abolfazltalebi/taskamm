import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { formatJalaliDate, getJalaliNow } from '../../lib/jalali';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Download, 
  Sparkles, 
  Sun, 
  Moon, 
  Calendar, 
  Clock, 
  BarChart3, 
  Settings as SettingsIcon, 
  Kanban, 
  Layers, 
  HelpCircle,
  Play
} from 'lucide-react';
import { type ActiveTab } from '../../types';

interface HeaderProps {
  onOpenInstallGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInstallGuide }) => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsQuickAddOpen, 
    theme, 
    setTheme, 
    tasks, 
    activeTimer 
  } = useAppStore();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const now = getJalaliNow();
  const todayDateStr = formatJalaliDate(Date.now(), 'dayOfWeek');

  const pendingTodayCount = tasks.filter(
    (t) => t.status !== 'done' && t.dueAt && new Date(t.dueAt).toDateString() === new Date().toDateString()
  ).length;

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'today', label: 'امروز', icon: <CheckSquare className="w-4 h-4" />, badge: pendingTodayCount > 0 ? pendingTodayCount : undefined },
    { id: 'boards', label: 'بردها و کانبان', icon: <Kanban className="w-4 h-4" /> },
    { id: 'calendar', label: 'تقویم شمسی', icon: <Calendar className="w-4 h-4" /> },
    { id: 'timeline', label: 'تایم‌لاین', icon: <Clock className="w-4 h-4" /> },
    { id: 'focus', label: 'حالت فوکوس', icon: <Play className="w-4 h-4" /> },
    { id: 'review', label: 'مرور هفته', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'تنظیمات', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <header 
      id="main-app-header"
      className="sticky top-0 z-40 w-full border-b border-emerald-950/5 bg-white/95 dark:border-emerald-500/10 dark:bg-[#0B131E]/95 backdrop-blur-xl transition-all shadow-2xs pt-safe"
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-2 sm:gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('today')}
              className="flex items-center gap-2 sm:gap-2.5 text-start group focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-800/15 group-hover:scale-105 transition">
                <span className="text-base sm:text-lg font-black text-white">
                  ت
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-emerald-950 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition">
                    تسکامه
                  </h1>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                    PWA
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-slate-400 hidden sm:block font-medium">
                  {todayDateStr}
                </p>
              </div>
            </button>

            {/* Active Focus Mode Floating Pill */}
            {activeTimer && (
              <button
                onClick={() => setActiveTab('focus')}
                className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-600/20 dark:text-emerald-300 dark:border-emerald-500/30 text-xs font-semibold animate-pulse hover:bg-emerald-100 dark:hover:bg-emerald-600/30 transition cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-ping" />
                <span>جلسه تمرکز فعال است</span>
              </button>
            )}
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition cursor-pointer relative ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-xs dark:bg-emerald-600 dark:text-white font-bold'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 font-medium'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive 
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-white dark:text-emerald-700 font-bold' 
                          : 'bg-emerald-100/60 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Bar (Search, Install, Quick Add, Theme) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search shortcut button */}
            <button
              onClick={() => setActiveTab('search')}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200/90 text-gray-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-300 text-xs transition cursor-pointer shadow-2xs min-h-[36px]"
              title="جستجو (⌘K)"
            >
              <Search className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden sm:inline font-medium">جستجو</span>
              <kbd className="hidden lg:inline text-[10px] bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* PWA Install Button */}
            {!isInstalled && (
              <>
                {isInstallable ? (
                  <button
                    onClick={install}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition cursor-pointer min-h-[36px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">نصب برنامه</span>
                  </button>
                ) : isIOS ? (
                  <button
                    onClick={onOpenInstallGuide}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 border border-emerald-200/70 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium transition cursor-pointer shadow-2xs min-h-[36px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">نصب در آیفون</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenInstallGuide}
                    className="p-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-400 text-xs transition cursor-pointer shadow-2xs min-h-[36px]"
                    title="راهنمای نصب PWA"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            {/* Quick Add Task Button */}
            <button
              id="header-quick-add-btn"
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm shadow-emerald-700/20 transition cursor-pointer min-h-[36px]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">تسک جدید</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-300 transition cursor-pointer shadow-2xs min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="تغییر تم"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
