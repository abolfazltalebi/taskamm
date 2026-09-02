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
      className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('today')}
              className="flex items-center gap-2.5 text-start group focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1E1B4B] dark:bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-900/10 group-hover:scale-105 transition">
                <span className="text-lg font-black text-white">
                  ت
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-extrabold tracking-tight text-[#1E1B4B] dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">
                    تسکامه
                  </h1>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 hidden sm:block">
                  {todayDateStr}
                </p>
              </div>
            </button>

            {/* Active Focus Mode Floating Pill */}
            {activeTimer && (
              <button
                onClick={() => setActiveTab('focus')}
                className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-600/20 dark:text-indigo-300 dark:border-indigo-500/30 text-xs font-semibold animate-pulse hover:bg-indigo-100 dark:hover:bg-indigo-600/30 transition"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
                <span>جلسه تمرکز فعال است</span>
              </button>
            )}
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/90 dark:bg-slate-900/90 p-1 rounded-2xl border border-gray-200/80 dark:border-slate-800">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer relative ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs dark:bg-indigo-600 dark:text-white font-semibold'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-200/50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive 
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-white dark:text-indigo-700 font-bold' 
                          : 'bg-gray-200 text-gray-700 dark:bg-indigo-500/20 dark:text-indigo-300'
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
          <div className="flex items-center gap-2">
            {/* Search shortcut button */}
            <button
              onClick={() => setActiveTab('search')}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-300 text-xs transition cursor-pointer shadow-2xs"
              title="جستجو (⌘K)"
            >
              <Search className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <span className="hidden sm:inline font-medium">جستجو</span>
              <kbd className="hidden lg:inline text-[10px] bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* PWA Install Button (Chromium / iOS Guide) */}
            {!isInstalled && (
              <>
                {isInstallable ? (
                  <button
                    onClick={install}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>نصب برنامه</span>
                  </button>
                ) : isIOS ? (
                  <button
                    onClick={onOpenInstallGuide}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 text-indigo-600 dark:text-sky-400 text-xs font-medium transition cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>نصب در آیفون</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenInstallGuide}
                    className="p-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-400 text-xs transition cursor-pointer shadow-2xs"
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">تسک جدید</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-300 transition cursor-pointer shadow-2xs"
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
