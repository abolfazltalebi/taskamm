import { create } from 'zustand';
import { 
  type Task, 
  type Board, 
  type ListColumn, 
  type ActiveTab, 
  type TaskPriority, 
  type ThemeMode, 
  type UndoAction,
  type TaskStatus 
} from '../types';
import { db, initializeDatabase } from '../lib/db';
import { sounds, triggerHaptic } from '../lib/audio';
import confetti from 'canvas-confetti';

interface TimerState {
  taskId: string;
  mode: 'pomodoro' | 'stopwatch';
  remainingSeconds: number; // for pomodoro (e.g. 25 * 60)
  durationSeconds: number;
  elapsedSeconds: number; // for stopwatch
  isRunning: boolean;
  intervalId?: number;
}

interface AppState {
  // Navigation & UI
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeBoardId: string | null;
  setActiveBoardId: (boardId: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterPriority: TaskPriority | 'all';
  setFilterPriority: (priority: TaskPriority | 'all') => void;
  filterTag: string | null;
  setFilterTag: (tag: string | null) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Data
  tasks: Task[];
  boards: Board[];
  lists: ListColumn[];
  isLoading: boolean;

  // Undo Toast (5 seconds)
  undoAction: UndoAction | null;
  setUndoAction: (action: UndoAction | null) => void;
  triggerUndo: () => Promise<void>;

  // Active Timer / Focus
  activeTimer: TimerState | null;
  startPomodoro: (taskId: string, minutes?: number) => void;
  startStopwatch: (taskId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (logSpentTime?: boolean) => Promise<void>;
  tickTimer: () => void;

  // Actions
  initStore: () => Promise<void>;
  loadInitialData: () => Promise<void>;
  addTask: (taskData: Partial<Task>) => Promise<Task>;
  bulkImportTasks: (lines: string[], boardId?: string) => Promise<void>;
  resetAllData: () => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  moveTask: (taskId: string, targetListId: string, newOrder?: number, newStatus?: TaskStatus) => Promise<void>;
  
  // Board & List management
  addBoard: (boardData: Partial<Board>) => Promise<Board>;
  updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  addList: (listData: Partial<ListColumn>) => Promise<ListColumn>;
  updateList: (listId: string, updates: Partial<ListColumn>) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;

  // Time logging
  logTime: (taskId: string, minutes: number, note?: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'today',
  setActiveTab: (tab) => {
    triggerHaptic('light');
    set({ activeTab: tab });
  },
  activeBoardId: null,
  setActiveBoardId: (boardId) => set({ activeBoardId: boardId }),
  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  isQuickAddOpen: false,
  setIsQuickAddOpen: (open) => set({ isQuickAddOpen: open }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  filterPriority: 'all',
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  filterTag: null,
  setFilterTag: (tag) => set({ filterTag: tag }),
  theme: 'light',
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
      }
    }
  },
  soundEnabled: true,
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

  tasks: [],
  boards: [],
  lists: [],
  isLoading: true,
  undoAction: null,
  setUndoAction: (action) => set({ undoAction: action }),

  activeTimer: null,

  triggerUndo: async () => {
    const { undoAction } = get();
    if (undoAction) {
      await undoAction.undo();
      set({ undoAction: null });
      sounds.playPop();
      triggerHaptic('medium');
    }
  },

  startPomodoro: (taskId: string, minutes: number = 25) => {
    triggerHaptic('medium');
    set({
      activeTimer: {
        taskId,
        mode: 'pomodoro',
        remainingSeconds: minutes * 60,
        durationSeconds: minutes * 60,
        elapsedSeconds: 0,
        isRunning: true,
      },
    });
  },

  startStopwatch: (taskId: string) => {
    triggerHaptic('medium');
    set({
      activeTimer: {
        taskId,
        mode: 'stopwatch',
        remainingSeconds: 0,
        durationSeconds: 0,
        elapsedSeconds: 0,
        isRunning: true,
      },
    });
  },

  pauseTimer: () => {
    const { activeTimer } = get();
    if (!activeTimer) return;
    triggerHaptic('light');
    set({
      activeTimer: { ...activeTimer, isRunning: false },
    });
  },

  resumeTimer: () => {
    const { activeTimer } = get();
    if (!activeTimer) return;
    triggerHaptic('light');
    set({
      activeTimer: { ...activeTimer, isRunning: true },
    });
  },

  stopTimer: async (logSpentTime: boolean = true) => {
    const { activeTimer, logTime } = get();
    if (!activeTimer) return;

    if (logSpentTime) {
      let loggedMinutes = 0;
      if (activeTimer.mode === 'pomodoro') {
        // e.g. 25m minus remaining
        const spentSecs = Math.max(0, 25 * 60 - activeTimer.remainingSeconds);
        loggedMinutes = Math.max(1, Math.round(spentSecs / 60));
      } else {
        loggedMinutes = Math.max(1, Math.round(activeTimer.elapsedSeconds / 60));
      }
      if (loggedMinutes > 0) {
        await logTime(activeTimer.taskId, loggedMinutes, activeTimer.mode === 'pomodoro' ? 'جلسه پومودورو' : 'کرنومتر فوکوس');
      }
    }

    set({ activeTimer: null });
    triggerHaptic('light');
  },

  tickTimer: () => {
    const { activeTimer } = get();
    if (!activeTimer || !activeTimer.isRunning) return;

    if (activeTimer.mode === 'pomodoro') {
      if (activeTimer.remainingSeconds <= 1) {
        // Finished pomodoro!
        sounds.playPomodoroFinish();
        triggerHaptic('success');
        get().stopTimer(true);
      } else {
        set({
          activeTimer: {
            ...activeTimer,
            remainingSeconds: activeTimer.remainingSeconds - 1,
            elapsedSeconds: activeTimer.elapsedSeconds + 1,
          },
        });
      }
    } else {
      set({
        activeTimer: {
          ...activeTimer,
          elapsedSeconds: activeTimer.elapsedSeconds + 1,
        },
      });
    }
  },

  initStore: async () => {
    await get().loadInitialData();
  },

  loadInitialData: async () => {
    set({ isLoading: true });
    try {
      await initializeDatabase();
      
      // Purge legacy sample tasks if any exist in indexedDB
      const legacySamples = await db.tasks.filter((t) => t.id.startsWith('task_sample_')).toArray();
      if (legacySamples.length > 0) {
        await Promise.all(legacySamples.map((t) => db.tasks.delete(t.id)));
      }

      const [tasks, boards, lists] = await Promise.all([
        db.tasks.filter((t) => !t.deletedAt).toArray(),
        db.boards.toArray(),
        db.lists.toArray(),
      ]);

      set({
        tasks,
        boards,
        lists,
        activeBoardId: boards[0]?.id || null,
        isLoading: false,
      });
    } catch (err) {
      console.error('Database load error:', err);
      set({ isLoading: false });
    }
  },

  bulkImportTasks: async (lines: string[], boardId?: string) => {
    const { addTask } = get();
    for (const line of lines) {
      if (line.trim()) {
        await addTask({
          title: line.trim(),
          boardId: boardId || get().boards[0]?.id,
        });
      }
    }
  },

  resetAllData: async () => {
    await db.tasks.clear();
    await db.boards.clear();
    await db.lists.clear();
    await db.timeLogs.clear();
    await initializeDatabase();
    await get().loadInitialData();
  },

  addTask: async (taskData) => {
    const { boards, lists, tasks } = get();
    const now = Date.now();
    const defaultBoardId = taskData.boardId || boards[0]?.id || 'board_personal';
    const boardLists = lists.filter((l) => l.boardId === defaultBoardId);
    const defaultListId = taskData.listId || boardLists[0]?.id || 'list_p_todo';

    const newTask: Task = {
      id: `task_${now}_${Math.random().toString(36).substring(2, 7)}`,
      boardId: defaultBoardId,
      listId: defaultListId,
      title: taskData.title || 'تسک بدون عنوان',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'none',
      estimateMinutes: taskData.estimateMinutes || 0,
      spentMinutes: taskData.spentMinutes || 0,
      dueAt: taskData.dueAt ?? null,
      startAt: taskData.startAt ?? null,
      remindAt: taskData.remindAt ?? (taskData.dueAt && taskData.reminderMinutesBefore !== null && taskData.reminderMinutesBefore !== undefined ? taskData.dueAt - (taskData.reminderMinutesBefore * 60 * 1000) : null),
      completedAt: null,
      recurrence: taskData.recurrence || (taskData.habitDaysTotal ? 'daily' : 'none'),
      habitDaysTotal: taskData.habitDaysTotal ?? null,
      habitDaysCompleted: taskData.habitDaysCompleted ?? 0,
      habitStreak: taskData.habitStreak ?? 0,
      habitTimeOfDay: taskData.habitTimeOfDay ?? null,
      reminderMinutesBefore: taskData.reminderMinutesBefore ?? null,
      tags: taskData.tags || [],
      subtasks: taskData.subtasks || [],
      checklist: [],
      attachments: [],
      order: tasks.filter((t) => t.listId === defaultListId).length,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    // Optimistic UI update
    set({ tasks: [newTask, ...tasks] });
    await db.tasks.add(newTask);
    sounds.playPop();
    triggerHaptic('light');
    return newTask;
  },

  updateTask: async (taskId, updates) => {
    const { tasks } = get();
    const now = Date.now();
    const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt: now } : t));
    set({ tasks: updatedTasks });
    await db.tasks.update(taskId, { ...updates, updatedAt: now });
  },

  deleteTask: async (taskId) => {
    const { tasks } = get();
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    // Optimistic remove
    set({ tasks: tasks.filter((t) => t.id !== taskId) });
    await db.tasks.update(taskId, { deletedAt: Date.now() });

    // Set 5-second undo toast
    set({
      undoAction: {
        id: `undo_del_${taskId}`,
        message: `تسک «${target.title.slice(0, 24)}» حذف شد`,
        timestamp: Date.now(),
        undo: async () => {
          await db.tasks.update(taskId, { deletedAt: null });
          set({ tasks: [...get().tasks, target] });
        },
      },
    });

    triggerHaptic('medium');
  },

  toggleTaskComplete: async (taskId) => {
    const { tasks, updateTask } = get();
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const isNowDone = target.status !== 'done';
    const newStatus: TaskStatus = isNowDone ? 'done' : 'todo';
    const completedAt = isNowDone ? Date.now() : null;

    if (isNowDone) {
      sounds.playTaskComplete();
      triggerHaptic('success');
      
      const newDaysCompleted = (target.habitDaysCompleted || 0) + 1;
      const newStreak = (target.habitStreak || 0) + 1;
      const isHabit = !!target.habitDaysTotal || target.recurrence === 'daily';
      const isGoalReached = target.habitDaysTotal ? newDaysCompleted >= target.habitDaysTotal : false;

      if (isGoalReached) {
        // Grand celebration for challenge completion
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.7 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#fbbf24'],
        });
      } else {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.85 },
          colors: ['#059669', '#10b981', '#0d9488', '#fbbf24'],
          disableForReducedMotion: true,
        });
      }

      // Handle recurrence / multi-day habit challenge:
      // If recurring and hasn't exceeded total days, create next day occurrence!
      if (target.recurrence && target.recurrence !== 'none' && !isGoalReached) {
        const nextDue = new Date(target.dueAt || Date.now());
        if (target.recurrence === 'daily') {
          nextDue.setDate(nextDue.getDate() + 1);
        } else if (target.recurrence === 'weekly') {
          nextDue.setDate(nextDue.getDate() + 7);
        } else if (target.recurrence === 'weekdays') {
          // Sat to Thu (skip Fri)
          const jsDay = nextDue.getDay();
          const addDays = jsDay === 4 ? 2 : 1; // if Thursday, jump to Saturday
          nextDue.setDate(nextDue.getDate() + addDays);
        } else if (target.recurrence === 'monthly') {
          nextDue.setMonth(nextDue.getMonth() + 1);
        }

        // Keep explicit daily time if specified
        if (target.habitTimeOfDay) {
          const [h, m] = target.habitTimeOfDay.split(':').map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            nextDue.setHours(h, m, 0, 0);
          }
        }

        // Calculate next reminder
        const nextRemindAt = target.reminderMinutesBefore !== null && target.reminderMinutesBefore !== undefined
          ? nextDue.getTime() - (target.reminderMinutesBefore * 60 * 1000)
          : null;

        // Add next recurring instance
        const now = Date.now();
        const nextTask: Task = {
          ...target,
          id: `task_${now}_${Math.random().toString(36).substring(2, 7)}`,
          status: 'todo',
          completedAt: null,
          dueAt: nextDue.getTime(),
          remindAt: nextRemindAt,
          spentMinutes: 0,
          habitDaysTotal: target.habitDaysTotal || null,
          habitDaysCompleted: newDaysCompleted,
          habitStreak: newStreak,
          habitTimeOfDay: target.habitTimeOfDay || null,
          reminderMinutesBefore: target.reminderMinutesBefore ?? null,
          subtasks: target.subtasks.map((s) => ({ ...s, isDone: false })),
          createdAt: now,
          updatedAt: now,
        };
        await db.tasks.add(nextTask);
        set({ tasks: [nextTask, ...get().tasks] });
      }

      await updateTask(taskId, { 
        status: newStatus, 
        completedAt,
        habitDaysCompleted: newDaysCompleted,
        habitStreak: newStreak 
      });

      // Customized Persian celebratory feedback
      let toastMessage = 'تسک با موفقیت انجام شد ✨';
      if (isGoalReached) {
        toastMessage = `🏆 تبریک! چالش ${target.habitDaysTotal} روزه «${target.title.slice(0, 20)}» با موفقیت تکمیل شد!`;
      } else if (target.habitDaysTotal) {
        toastMessage = `🔥 روز ${newDaysCompleted} از ${target.habitDaysTotal} ثبت شد! تسک فردا خودکار آماده است.`;
      } else if (target.recurrence === 'daily') {
        toastMessage = `✨ تسک امروز تکمیل شد (استریک: ${newStreak} روز)؛ تسک فردا خودکار ثبت شد.`;
      }

      // Set 5-second undo toast
      set({
        undoAction: {
          id: `undo_toggle_${taskId}`,
          message: toastMessage,
          timestamp: Date.now(),
          undo: async () => {
            await updateTask(taskId, {
              status: target.status,
              completedAt: target.completedAt,
              habitDaysCompleted: target.habitDaysCompleted,
              habitStreak: target.habitStreak,
            });
          },
        },
      });
    } else {
      sounds.playPop();
      triggerHaptic('light');
      await updateTask(taskId, { status: newStatus, completedAt });

      set({
        undoAction: {
          id: `undo_toggle_${taskId}`,
          message: 'تسک به حالت انجام‌نشده برگشت',
          timestamp: Date.now(),
          undo: async () => {
            await updateTask(taskId, {
              status: target.status,
              completedAt: target.completedAt,
            });
          },
        },
      });
    }
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const { tasks, updateTask } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, isDone: !s.isDone } : s
    );

    sounds.playPop();
    triggerHaptic('light');
    await updateTask(taskId, { subtasks: updatedSubtasks });
  },

  addSubtask: async (taskId, title) => {
    const { tasks, updateTask } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !title.trim()) return;

    const newSubtask = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      taskId,
      title: title.trim(),
      isDone: false,
      order: task.subtasks.length,
    };

    await updateTask(taskId, { subtasks: [...task.subtasks, newSubtask] });
  },

  deleteSubtask: async (taskId, subtaskId) => {
    const { tasks, updateTask } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.filter((s) => s.id !== subtaskId);
    await updateTask(taskId, { subtasks: updatedSubtasks });
  },

  moveTask: async (taskId, targetListId, newOrder, newStatus) => {
    const { tasks, updateTask, lists } = get();
    const targetList = lists.find((l) => l.id === targetListId);
    const updates: Partial<Task> = {
      listId: targetListId,
    };

    if (newOrder !== undefined) {
      updates.order = newOrder;
    }

    if (newStatus) {
      updates.status = newStatus;
      if (newStatus === 'done') {
        updates.completedAt = Date.now();
        sounds.playTaskComplete();
      }
    } else if (targetList?.statusKey) {
      updates.status = targetList.statusKey;
      if (targetList.statusKey === 'done') {
        updates.completedAt = Date.now();
        sounds.playTaskComplete();
      }
    }

    await updateTask(taskId, updates);
    triggerHaptic('light');
  },

  logTime: async (taskId, minutes, note) => {
    const { tasks, updateTask } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const now = Date.now();
    const newSpent = (task.spentMinutes || 0) + minutes;
    await updateTask(taskId, { spentMinutes: newSpent });

    await db.timeLogs.add({
      id: `log_${now}_${Math.random().toString(36).substring(2, 5)}`,
      taskId,
      startedAt: now - minutes * 60000,
      endedAt: now,
      durationMinutes: minutes,
      note: note || 'ثبت زمان کاری',
    });

    triggerHaptic('light');
  },

  addBoard: async (boardData) => {
    const now = Date.now();
    const newBoard: Board = {
      id: `board_${now}`,
      workspaceId: 'ws_personal',
      name: boardData.name || 'برد جدید',
      emoji: boardData.emoji || '📁',
      color: boardData.color || '#6366f1',
      viewDefault: boardData.viewDefault || 'kanban',
      createdAt: now,
      updatedAt: now,
    };

    await db.boards.add(newBoard);

    // Create 3 default columns for this board
    const defaultCols = [
      { id: `list_${now}_1`, boardId: newBoard.id, name: 'برای انجام', order: 0, statusKey: 'todo' as const },
      { id: `list_${now}_2`, boardId: newBoard.id, name: 'در حال انجام', order: 1, statusKey: 'in_progress' as const },
      { id: `list_${now}_3`, boardId: newBoard.id, name: 'انجام شد ✨', order: 2, statusKey: 'done' as const },
    ];
    await db.lists.bulkAdd(defaultCols);

    set({
      boards: [...get().boards, newBoard],
      lists: [...get().lists, ...defaultCols],
      activeBoardId: newBoard.id,
    });
    return newBoard;
  },

  updateBoard: async (boardId, updates) => {
    const { boards } = get();
    const updated = boards.map((b) => (b.id === boardId ? { ...b, ...updates, updatedAt: Date.now() } : b));
    set({ boards: updated });
    await db.boards.update(boardId, { ...updates, updatedAt: Date.now() });
  },

  deleteBoard: async (boardId) => {
    const { boards } = get();
    if (boards.length <= 1) return; // Keep at least one board
    const remaining = boards.filter((b) => b.id !== boardId);
    set({
      boards: remaining,
      activeBoardId: remaining[0]?.id || null,
    });
    await db.boards.delete(boardId);
  },

  addList: async (listData) => {
    const { lists, activeBoardId } = get();
    const now = Date.now();
    const boardId = listData.boardId || activeBoardId || 'board_personal';
    const newList: ListColumn = {
      id: `list_${now}`,
      boardId,
      name: listData.name || 'ستون جدید',
      order: lists.filter((l) => l.boardId === boardId).length,
      wipLimit: listData.wipLimit,
      statusKey: listData.statusKey || 'todo',
    };

    await db.lists.add(newList);
    set({ lists: [...lists, newList] });
    return newList;
  },

  updateList: async (listId, updates) => {
    const { lists } = get();
    const updated = lists.map((l) => (l.id === listId ? { ...l, ...updates } : l));
    set({ lists: updated });
    await db.lists.update(listId, updates);
  },

  deleteList: async (listId) => {
    const { lists } = get();
    set({ lists: lists.filter((l) => l.id !== listId) });
    await db.lists.delete(listId);
  },
}));
