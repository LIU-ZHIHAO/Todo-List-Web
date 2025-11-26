export enum Quadrant {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

export enum Tag {
  Work = '工作',
  Personal = '生活',
  Study = '学习',
  Health = '健康',
  Finance = '财务',
  Home = '家庭',
  Social = '社交',
  Travel = '旅行',
  Hobby = '爱好',
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  subtasks?: Subtask[];
  date: string; // ISO YYYY-MM-DD
  quadrant: Quadrant;
  tag: Tag;
  completed: string | null; // ISO YYYY-MM-DD or null
  completedAt?: number; // Timestamp when completed
  progress: number; // 0 to 100
  createdAt: number;
  order: number; // For sorting
  isOverdue?: boolean; // Auto-migrated flag
}

export interface QuickNote {
  id: string;
  content: string;
  createdAt: number;
  tags?: string[];
  linkedTaskId?: string;
  isStarred?: boolean;
  color?: string;
  attachments?: string[];
}

export type SortMode = 'custom' | 'created' | 'progress';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  mode: SortMode;
  direction: SortDirection;
}

export type StreamSpeed = number; // Pixels per second (e.g., 20 to 150)

export interface StreamConfig {
  speed: StreamSpeed;
}