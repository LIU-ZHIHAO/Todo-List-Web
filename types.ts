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
  completed: boolean;
  progress: number; // 0 to 100
  createdAt: number;
  order: number; // For sorting
}

export interface QuickNote {
  id: string;
  content: string;
  createdAt: number;
}

export const TAG_COLORS: Record<Tag, string> = {
  [Tag.STUDY]: 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
  [Tag.LIFE]: 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]',
  [Tag.WORK]: 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]',
  [Tag.ENTERTAINMENT]: 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]',
  [Tag.HEALTH]: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
  [Tag.SOCIAL]: 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]',
};

// Helper for inactive tag state (Border only)
export const TAG_BORDER_COLORS: Record<Tag, string> = {
    [Tag.STUDY]: 'border-purple-500/50 text-purple-300 hover:bg-purple-500/10',
    [Tag.LIFE]: 'border-pink-500/50 text-pink-300 hover:bg-pink-500/10',
    [Tag.WORK]: 'border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10',
    [Tag.ENTERTAINMENT]: 'border-orange-500/50 text-orange-300 hover:bg-orange-500/10',
    [Tag.HEALTH]: 'border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10',
    [Tag.SOCIAL]: 'border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10',
};

export const QUADRANT_INFO = {
  [Quadrant.Q1]: {
    label: '重要且紧急',
    description: '马上做',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    dotColor: 'bg-red-500',
    gradient: 'from-red-500/20 to-red-900/20'
  },
  [Quadrant.Q2]: {
    label: '重要不紧急',
    description: '计划做',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    dotColor: 'bg-blue-500',
    gradient: 'from-blue-500/20 to-blue-900/20'
  },
  [Quadrant.Q3]: {
    label: '紧急不重要',
    description: '授权做',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    dotColor: 'bg-yellow-500',
    gradient: 'from-yellow-500/20 to-yellow-900/20'
  },
  [Quadrant.Q4]: {
    label: '不重要不紧急',
    description: '稍后做',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    gradient: 'from-emerald-500/20 to-emerald-900/20'
  },
};