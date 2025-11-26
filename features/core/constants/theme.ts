import { Tag, Quadrant } from '../types';

export const TAG_COLORS: Record<Tag, string> = {
    [Tag.Work]: 'bg-blue-500',
    [Tag.Personal]: 'bg-emerald-500',
    [Tag.Study]: 'bg-amber-500',
    [Tag.Health]: 'bg-rose-500',
    [Tag.Finance]: 'bg-violet-500',
    [Tag.Home]: 'bg-orange-500',
    [Tag.Social]: 'bg-pink-500',
    [Tag.Travel]: 'bg-cyan-500',
    [Tag.Hobby]: 'bg-indigo-500',
};

export const TAG_BORDER_COLORS: Record<Tag, string> = {
    [Tag.Work]: 'border-blue-500',
    [Tag.Personal]: 'border-emerald-500',
    [Tag.Study]: 'border-amber-500',
    [Tag.Health]: 'border-rose-500',
    [Tag.Finance]: 'border-violet-500',
    [Tag.Home]: 'border-orange-500',
    [Tag.Social]: 'border-pink-500',
    [Tag.Travel]: 'border-cyan-500',
    [Tag.Hobby]: 'border-indigo-500',
};

export const QUADRANT_INFO = {
    [Quadrant.Q1]: {
        label: '重要且紧急',
        description: '马上做',
        color: 'text-rose-500 dark:text-rose-400',
        bgColor: 'bg-rose-50 dark:bg-rose-900/20',
        borderColor: 'border-rose-200 dark:border-rose-500/30',
        dotColor: 'bg-rose-500',
        gradient: 'from-rose-500 to-pink-600'
    },
    [Quadrant.Q2]: {
        label: '重要不紧急',
        description: '计划做',
        color: 'text-emerald-500 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-500/30',
        dotColor: 'bg-emerald-500',
        gradient: 'from-emerald-500 to-teal-600'
    },
    [Quadrant.Q3]: {
        label: '紧急不重要',
        description: '授权做',
        color: 'text-blue-500 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-500/30',
        dotColor: 'bg-blue-500',
        gradient: 'from-blue-500 to-indigo-600'
    },
    [Quadrant.Q4]: {
        label: '不重要不紧急',
        description: '减少做', // Updated description to match image
        color: 'text-amber-500 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-500/30',
        dotColor: 'bg-amber-500',
        gradient: 'from-amber-500 to-orange-600'
    }
};
