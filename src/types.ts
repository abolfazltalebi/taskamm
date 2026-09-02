import { z } from 'zod';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'waiting' | 'canceled';
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'weekdays' | 'monthly' | 'custom';
export type BoardViewType = 'list' | 'kanban' | 'calendar' | 'timeline';
export type ActiveTab = 'today' | 'boards' | 'calendar' | 'timeline' | 'focus' | 'review' | 'search' | 'settings' | 'install-guide';
export type ThemeMode = 'dark' | 'light' | 'system';

// Zod Schemas
export const SubtaskSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  title: z.string().min(1, 'عنوان زیرکار الزامی است'),
  isDone: z.boolean().default(false),
  order: z.number().default(0),
});
export type Subtask = z.infer<typeof SubtaskSchema>;

export const TimeLogSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  startedAt: z.number(),
  endedAt: z.number().optional(),
  durationMinutes: z.number().default(0),
  note: z.string().optional(),
});
export type TimeLog = z.infer<typeof TimeLogSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
  taskId: z.string(),
  type: z.enum(['created', 'updated', 'status_changed', 'time_logged', 'subtask_toggled']),
  payload: z.string(),
  createdAt: z.number(),
});
export type Activity = z.infer<typeof ActivitySchema>;

export const TaskSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  listId: z.string(),
  title: z.string().min(1, 'عنوان تسک الزامی است'),
  description: z.string().default(''),
  status: z.enum(['todo', 'in_progress', 'done', 'waiting', 'canceled']).default('todo'),
  priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).default('none'),
  estimateMinutes: z.number().default(0),
  spentMinutes: z.number().default(0),
  dueAt: z.number().nullable().default(null), // timestamp
  startAt: z.number().nullable().default(null), // timestamp
  remindAt: z.number().nullable().default(null), // timestamp
  completedAt: z.number().nullable().default(null),
  recurrence: z.enum(['none', 'daily', 'weekly', 'weekdays', 'monthly', 'custom']).default('none'),
  habitDaysTotal: z.number().nullable().optional().default(null),
  habitDaysCompleted: z.number().optional().default(0),
  habitStreak: z.number().optional().default(0),
  habitTimeOfDay: z.string().nullable().optional().default(null),
  reminderMinutesBefore: z.number().nullable().optional().default(null),
  tags: z.array(z.string()).default([]),
  subtasks: z.array(SubtaskSchema).default([]),
  checklist: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),
  coverColor: z.string().optional(),
  assignedTo: z.string().optional(),
  order: z.number().default(0),
  createdAt: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().nullable().default(null),
});
export type Task = z.infer<typeof TaskSchema>;

export const ListColumnSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  name: z.string(),
  order: z.number().default(0),
  wipLimit: z.number().optional(),
  statusKey: z.enum(['todo', 'in_progress', 'done', 'waiting', 'canceled']).optional(),
});
export type ListColumn = z.infer<typeof ListColumnSchema>;

export const BoardSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  emoji: z.string().default('📋'),
  color: z.string().default('#3b82f6'),
  viewDefault: z.enum(['list', 'kanban', 'calendar', 'timeline']).default('kanban'),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type Board = z.infer<typeof BoardSchema>;

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['personal', 'team']).default('personal'),
  ownerId: z.string(),
  createdAt: z.number(),
});
export type Workspace = z.infer<typeof WorkspaceSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().default('کاربر تسکامه'),
  email: z.string().optional(),
  avatar: z.string().optional(),
  timezone: z.string().default('Asia/Tehran'),
  theme: z.enum(['dark', 'light', 'system']).default('dark'),
  createdAt: z.number(),
});
export type User = z.infer<typeof UserSchema>;

export const WeeklyReviewSchema = z.object({
  id: z.string(),
  weekStartJalali: z.string(),
  generatedSummary: z.string(),
  completedCount: z.number(),
  totalEstimate: z.number(),
  totalSpent: z.number(),
  highlights: z.array(z.string()),
  createdAt: z.number(),
});
export type WeeklyReview = z.infer<typeof WeeklyReviewSchema>;

export interface SyncQueueItem {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  data: unknown;
  timestamp: number;
}

export interface NaturalParsedResult {
  title: string;
  dueAt: number | null;
  estimateMinutes: number;
  priority: TaskPriority;
  tags: string[];
  confidence: number;
  habitDaysTotal?: number | null;
  habitTimeOfDay?: string | null;
  recurrence?: TaskRecurrence;
  reminderMinutesBefore?: number | null;
  extractedText: {
    dateStr?: string;
    timeStr?: string;
    estimateStr?: string;
    priorityStr?: string;
    tagStr?: string;
    habitStr?: string;
  };
}

export interface UndoAction {
  id: string;
  message: string;
  undo: () => Promise<void>;
  timestamp: number;
}
