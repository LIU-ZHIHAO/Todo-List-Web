export enum Quadrant {
  Q1 = 'Q1', // Urgent & Important
  Q2 = 'Q2', // Not Urgent & Important
  Q3 = 'Q3', // Urgent & Not Important
  Q4 = 'Q4', // Not Urgent & Not Important
}

export enum Tag {
  STUDY = '学习',
  LIFE = '生活',
  WORK = '工作',
  ENTERTAINMENT = '娱乐',
  HEALTH = '健康',
  SOCIAL = '社交',
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
}

export type SortMode = 'custom' | 'created' | 'progress';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  mode: SortMode;
  direction: SortDirection;
}

export type StreamMode = 'static' | 'scroll' | 'hidden';
export type StreamSpeed = number; // Pixels per second (e.g., 20 to 150)

export interface StreamConfig {
  mode: StreamMode;
  speed: StreamSpeed;
}