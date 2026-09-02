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
    theme: 'light',
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
      color: '#059669',
      viewDefault: 'kanban',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: boardWorkId,
      workspaceId,
      name: 'پروژه‌های کاری',
      emoji: '💼',
      color: '#0d9488',
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
}
