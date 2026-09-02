import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { TodayView } from './components/views/TodayView';
import { KanbanView } from './components/views/KanbanView';
import { CalendarView } from './components/views/CalendarView';
import { TimelineView } from './components/views/TimelineView';
import { FocusView } from './components/views/FocusView';
import { WeeklyReviewView } from './components/views/WeeklyReviewView';
import { SearchView } from './components/views/SearchView';
import { SettingsView } from './components/views/SettingsView';
import { TaskDetailModal } from './components/task/TaskDetailModal';
import { QuickAddTask } from './components/task/QuickAddTask';
import { InstallGuideModal } from './components/pwa/InstallGuideModal';
import { UndoToast } from './components/common/UndoToast';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

export function App() {
  const { 
    initStore, 
    activeTab, 
    setActiveTab, 
    isQuickAddOpen, 
    setIsQuickAddOpen, 
    theme,
    selectedTaskId
  } = useAppStore();

  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);

  // Initialize store and local IndexedDB on mount
  useEffect(() => {
    initStore();
  }, [initStore]);

  // Apply dark/light class to root document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Global Keyboard Shortcuts (N for new task, Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Command + K or Ctrl + K for Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveTab('search');
        return;
      }

      if (isInput) return;

      // Press 'N' for quick add task
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, setIsQuickAddOpen]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1E293B] dark:bg-slate-950 dark:text-slate-100 flex flex-col antialiased selection:bg-indigo-600 selection:text-white pb-20 md:pb-8 transition-colors">
      {/* Top Header */}
      <Header onOpenInstallGuide={() => setIsInstallGuideOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        {activeTab === 'today' && <TodayView />}
        {activeTab === 'boards' && <KanbanView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'focus' && <FocusView />}
        {activeTab === 'review' && <WeeklyReviewView />}
        {activeTab === 'search' && <SearchView />}
        {activeTab === 'settings' && (
          <SettingsView onOpenInstallGuide={() => setIsInstallGuideOpen(true)} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Floating Modal: Quick Add Task Dialog */}
      {isQuickAddOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsQuickAddOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
            <QuickAddTask onClose={() => setIsQuickAddOpen(false)} />
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTaskId && <TaskDetailModal />}

      {/* PWA iOS / Android Installation Guide Modal */}
      <InstallGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
      />

      {/* 5-Second Undo Toast Bar */}
      <UndoToast />

      {/* Offline and Reconnected Indicator Toast */}
      <OfflineIndicator />
    </div>
  );
}

export default App;
