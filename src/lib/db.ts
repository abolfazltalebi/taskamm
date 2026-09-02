import Dexie, { type Table } from 'dexie';
import { 
  type Task, 
  type Subtask, 
  type Board, 
  type ListColumn, 
  type Workspace, 
  type User, 
  type TimeLog, 
  type Activity, 
  type WeeklyReview,
  type SyncQueueItem 
} from '../types';

export class TaskameDatabase extends Dexie {
  users!: Table<User, string>;
  workspaces!: Table<Workspace, string>;
  boards!: Table<Board, string>;
  lists!: Table<ListColumn, string>;
  tasks!: Table<Task, string>;
  subtasks!: Table<Subtask, string>;
  timeLogs!: Table<TimeLog, string>;
  activities!: Table<Activity, string>;
  weeklyReviews!: Table<WeeklyReview, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super('TaskameDB');
    this.version(1).stores({
      users: 'id, email, theme',
      workspaces: 'id, type, ownerId',
      boards: 'id, workspaceId, order',
      lists: 'id, boardId, order',
      tasks: 'id, boardId, listId, status, priority, dueAt, startAt, recurrence, order, createdAt, updatedAt, deletedAt, *tags',
      subtasks: 'id, taskId, order',
      timeLogs: 'id, taskId, startedAt',
      activities: 'id, taskId, createdAt',
      weeklyReviews: 'id, weekStartJalali, createdAt',
      syncQueue: 'id, table, timestamp',
    });
  }
}

export const db = new TaskameDatabase();

// Initial database seeding
export async function initializeDatabase(): Promise<void> {
  const userCount = await db.users.count();
  if (userCount > 0) return;

  const now = Date.now();
  const userId = 'usr_default';
  const workspaceId = 'ws_personal';

  // Seed default user
  await db.users.add({
    id: userId,
    name: 'کاربر تسکامه',
    email: 'user@taskame.app',
    timezone: 'Asia/Tehran',
    theme: 'dark',
    createdAt: now,
  });

  // Seed default workspace
  await db.workspaces.add({
    id: workspaceId,
    name: 'فضای کاری من',
    type: 'personal',
    ownerId: userId,
    createdAt: now,
  });

  // Default Boards
  const boardPersonalId = 'board_personal';
  const boardWorkId = 'board_work';

  await db.boards.bulkAdd([
    {
      id: boardPersonalId,
      workspaceId,
      name: 'کارهای شخصی',
      emoji: '🎯',
      color: '#6366f1',
      viewDefault: 'kanban',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: boardWorkId,
      workspaceId,
      name: 'پروژه‌های کاری',
      emoji: '💼',
      color: '#3b82f6',
      viewDefault: 'kanban',
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // Default Lists for Personal Board
  const listPersonalTodo = 'list_p_todo';
  const listPersonalInProgress = 'list_p_progress';
  const listPersonalDone = 'list_p_done';

  await db.lists.bulkAdd([
    { id: listPersonalTodo, boardId: boardPersonalId, name: 'برای انجام', order: 0, statusKey: 'todo' },
    { id: listPersonalInProgress, boardId: boardPersonalId, name: 'در حال انجام', order: 1, statusKey: 'in_progress', wipLimit: 3 },
    { id: listPersonalDone, boardId: boardPersonalId, name: 'انجام شد ✨', order: 2, statusKey: 'done' },

    // Lists for Work Board
    { id: 'list_w_todo', boardId: boardWorkId, name: 'برنامه‌ریزی', order: 0, statusKey: 'todo' },
    { id: 'list_w_progress', boardId: boardWorkId, name: 'در حال توسعه', order: 1, statusKey: 'in_progress' },
    { id: 'list_w_review', boardId: boardWorkId, name: 'در انتظار تایید', order: 2, statusKey: 'waiting' },
    { id: 'list_w_done', boardId: boardWorkId, name: 'پایان یافته', order: 3, statusKey: 'done' },
  ]);

  // Today timestamp for due dates (set to 18:00 today)
  const todayDue = new Date();
  todayDue.setHours(18, 0, 0, 0);

  const tomorrowDue = new Date();
  tomorrowDue.setDate(tomorrowDue.getDate() + 1);
  tomorrowDue.setHours(14, 30, 0, 0);

  // Seed sample inspiring tasks
  await db.tasks.bulkAdd([
    {
      id: 'task_sample_1',
      boardId: boardPersonalId,
      listId: listPersonalInProgress,
      title: 'نصب تسکامه روی صفحه اصلی گوشی (PWA) 📱',
      description: 'برای دسترسی فوری، آفلاین و سریع، از منوی مرورگر گزینه «افزودن به صفحه اصلی» (Add to Home Screen) را انتخاب کنید.',
      status: 'in_progress',
      priority: 'urgent',
      estimateMinutes: 15,
      spentMinutes: 5,
      dueAt: todayDue.getTime(),
      startAt: now,
      remindAt: todayDue.getTime(),
      completedAt: null,
      recurrence: 'none',
      tags: ['مهم', 'راه‌اندازی'],
      subtasks: [
        { id: 'sub_1_1', taskId: 'task_sample_1', title: 'زدن دکمه نصب یا اشتراک‌گذاری', isDone: true, order: 0 },
        { id: 'sub_1_2', taskId: 'task_sample_1', title: 'فعال‌سازی یادآوری‌های داخل برنامه', isDone: false, order: 1 },
      ],
      checklist: [],
      attachments: [],
      order: 0,
      createdAt: now - 3600000,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'task_sample_2',
      boardId: boardPersonalId,
      listId: listPersonalTodo,
      title: 'بررسی گزارش کارهای این هفته در «مرور هفته» 📊',
      description: 'در تب مرور هفته، عملکرد، زمان صرف‌شده و خلاصه دستاوردهای هفتگی را با یک کلیک مشاهده و کپی کنید.',
      status: 'todo',
      priority: 'high',
      estimateMinutes: 30,
      spentMinutes: 0,
      dueAt: todayDue.getTime() + 7200000,
      startAt: null,
      remindAt: null,
      completedAt: null,
      recurrence: 'weekly',
      tags: ['برنامه‌ریزی', 'توسعه فردی'],
      subtasks: [],
      checklist: [],
      attachments: [],
      order: 1,
      createdAt: now - 7200000,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'task_sample_3',
      boardId: boardWorkId,
      listId: 'list_w_todo',
      title: 'جلسه بازبینی نقشه راه فصلی با تیم 🚀',
      description: 'بررسی اولویت‌های اسپرینت جدید و تخصیص وظایف.',
      status: 'todo',
      priority: 'medium',
      estimateMinutes: 60,
      spentMinutes: 0,
      dueAt: tomorrowDue.getTime(),
      startAt: null,
      remindAt: null,
      completedAt: null,
      recurrence: 'none',
      tags: ['کاری', 'استراتژی'],
      subtasks: [],
      checklist: [],
      attachments: [],
      order: 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: 'task_sample_4',
      boardId: boardPersonalId,
      listId: listPersonalDone,
      title: 'نوشتن اهداف اولیه و آشنایی با تسکامه ✨',
      description: 'اولین قدم برای مدیریت آرام و بدون استرس کارها.',
      status: 'done',
      priority: 'low',
      estimateMinutes: 20,
      spentMinutes: 20,
      dueAt: now - 86400000,
      startAt: now - 86400000,
      remindAt: null,
      completedAt: now - 3600000,
      recurrence: 'none',
      tags: ['شروع'],
      subtasks: [],
      checklist: [],
      attachments: [],
      order: 0,
      createdAt: now - 86400000,
      updatedAt: now - 3600000,
      deletedAt: null,
    },
  ]);
}
