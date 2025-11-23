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
        description: '立即去做',
        color: 'text-rose-600 dark:text-rose-400',
        bgColor: 'bg-rose-50 dark:bg-rose-500/10',
        borderColor: 'border-rose-200 dark:border-rose-500/20',
        dotColor: 'bg-rose-500',
        gradient: 'from-rose-500 to-pink-600'
    },
    [Quadrant.Q2]: {
        label: '重要不紧急',
        description: '计划去做',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-500/10',
        borderColor: 'border-blue-200 dark:border-blue-500/20',
        dotColor: 'bg-blue-500',
        gradient: 'from-blue-500 to-cyan-600'
    },
    [Quadrant.Q3]: {
        label: '紧急不重要',
        description: '授权去做',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-500/10',
        borderColor: 'border-amber-200 dark:border-amber-500/20',
        dotColor: 'bg-amber-500',
        gradient: 'from-amber-500 to-orange-600'
    },
    [Quadrant.Q4]: {
        label: '不重要不紧急',
        description: '尽量不做',
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
        borderColor: 'border-emerald-200 dark:border-emerald-500/20',
        dotColor: 'bg-emerald-500',
        gradient: 'from-emerald-500 to-teal-600'
    }
};
