import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Tag as TagIcon, LayoutGrid, CheckSquare, ChevronLeft, ChevronRight, AlignLeft, ListTodo, Plus, Trash2, X } from 'lucide-react';
import { Task, Quadrant, Subtask, Tag } from '../../core/types';
import { generateId } from '../../core/utils/helpers';
import { getLunarDate } from '../../core/utils/lunar';
import { TAG_COLORS, TAG_BORDER_COLORS, QUADRANT_INFO } from '../../core/constants/theme';
import { Modal } from '../../shared/components/ui/Modal';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Task, isEdit: boolean) => void;
    initialTask?: Task | null;
    initialQuadrant?: Quadrant | null;
    initialContent?: string;
    zIndex?: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSave, initialTask, initialQuadrant, initialContent, zIndex = 'z-50' }) => {
    const [title, setTitle] = useState(initialTask?.title || '');
    const [description, setDescription] = useState(initialTask?.description || '');
    const [subtasks, setSubtasks] = useState<Subtask[]>(initialTask?.subtasks || []);
    const [date, setDate] = useState(initialTask?.date || new Date().toISOString().split('T')[0]);
    const [tag, setTag] = useState<Tag>(initialTask?.tag || Tag.Work);
    const [quadrant, setQuadrant] = useState<Quadrant>(initialTask?.quadrant || initialQuadrant || Quadrant.Q2);

    const [newSubtaskInput, setNewSubtaskInput] = useState('');
    const [isSelectingDate, setIsSelectingDate] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialTask) {
                setTitle(initialTask.title);
                setDescription(initialTask.description || '');
                setSubtasks(initialTask.subtasks || []);
                setDate(initialTask.date);
                setTag(initialTask.tag);
                setQuadrant(initialTask.quadrant);
            } else {
                setTitle(initialContent || '');
                setDescription('');
                setSubtasks([]);
                setDate(new Date().toISOString().split('T')[0]);
                setTag(Tag.Work);
                setQuadrant(initialQuadrant || Quadrant.Q2);
            }
            setIsSelectingDate(false);
        }
    }, [isOpen, initialTask, initialQuadrant, initialContent]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const task: Task = {
            id: initialTask ? initialTask.id : generateId(),
            title,
            description,
            subtasks,
            date,
            tag,
            quadrant,
            completed: initialTask ? initialTask.completed : null,
            completedAt: initialTask ? initialTask.completedAt : undefined,
            progress: initialTask ? initialTask.progress : 0,
            createdAt: initialTask ? initialTask.createdAt : Date.now(),
            order: initialTask ? initialTask.order : Date.now(),
            isOverdue: initialTask ? initialTask.isOverdue : false
        };

        onSave(task, !!initialTask);
        onClose();
    };

    const handleAddSubtask = () => {
        if (!newSubtaskInput.trim()) return;
        const newSubtask: Subtask = {
            id: generateId(),
            title: newSubtaskInput.trim(),
            completed: false
        };
        setSubtasks([...subtasks, newSubtask]);
        setNewSubtaskInput('');
    };

    const handleToggleSubtask = (id: string) => {
        setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
    };

    const handleDeleteSubtask = (id: string) => {
        setSubtasks(subtasks.filter(s => s.id !== id));
    };

    const handleMonthChange = (delta: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setViewDate(newDate);
    };

    const handleDateSelect = (day: number) => {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setDate(d.toISOString().split('T')[0]);
        setIsSelectingDate(false);
    };

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialTask ? '编辑任务' : '新建任务'} className="max-w-2xl" zIndex={zIndex}>
            <form onSubmit={handleSubmit} className={`flex flex-col gap-5 transition-opacity duration-300 ${isSelectingDate ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

                <div className="space-y-3">
                    {/* Title Input: Solid white in light mode, deep glass in dark */}
                    <input
                        type="text"
                        autoFocus={!initialTask}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="输入任务标题..."
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                        required
                    />

                    <div className="relative">
                        <div className="absolute top-2.5 left-3 text-slate-400 dark:text-gray-500">
                            <AlignLeft size={16} />
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="添加详细备注..."
                            rows={1}
                            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-700 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500/50 dark:focus:bg-white/10 transition-all resize-none overflow-hidden min-h-[40px]"
                        />
                    </div>
                </div>

                {/* Subtasks Section */}
                <div className="space-y-2 bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-white/5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-500 dark:text-gray-400 font-medium ml-1 flex items-center gap-1">
                            <ListTodo size={12} /> 子任务 ({subtasks.filter(s => s.completed).length}/{subtasks.length})
                        </label>
                    </div>
                    <div className="space-y-2">
                        {subtasks.map(st => (
                            <div key={st.id} className="flex items-center gap-2 group">
                                <button
                                    type="button"
                                    onClick={() => handleToggleSubtask(st.id)}
                                    className={`text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors ${st.completed ? 'text-emerald-500 dark:text-emerald-400' : ''}`}
                                >
                                    <CheckSquare size={16} className={st.completed ? 'opacity-100' : 'opacity-50'} />
                                </button>
                                <span className={`flex-1 text-sm ${st.completed ? 'line-through text-slate-400 dark:text-gray-500' : 'text-slate-700 dark:text-gray-200'}`}>
                                    {st.title}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteSubtask(st.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all p-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            type="button"
                            onClick={() => handleAddSubtask()}
                            disabled={!newSubtaskInput.trim()}
                            className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/40 disabled:opacity-30 transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                        <input
                            type="text"
                            value={newSubtaskInput}
                            onChange={(e) => setNewSubtaskInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                            placeholder="添加子任务..."
                            className="flex-1 bg-transparent border-b border-slate-200 dark:border-white/10 py-1 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500/50 placeholder-slate-400 dark:placeholder-gray-600"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={() => setIsSelectingDate(true)}
                        className="flex-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group"
                    >
                        <CalendarIcon size={18} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-slate-700 dark:text-gray-200 font-mono text-sm">
                            {date === new Date().toISOString().split('T')[0] ? '今天' : date}
                        </span>
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-slate-500 dark:text-gray-400 font-medium ml-1 flex items-center gap-1">
                        <TagIcon size={12} /> 分类标签
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {Object.values(Tag).map((t) => {
                            const isSelected = tag === t;
                            const activeClass = TAG_COLORS[t];
                            const inactiveClass = TAG_BORDER_COLORS[t];
                            return (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTag(t)}
                                    className={`
                                                    py-2 rounded-lg text-xs font-bold transition-all duration-200
                                                    ${isSelected
                                            ? `${activeClass} text-white scale-105 ring-1 ring-white/20`
                                            : `bg-transparent border ${inactiveClass} opacity-60 hover:opacity-100 hover:scale-105`
                                        }
                                                `}
                                >
                                    {t}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-slate-500 dark:text-gray-400 font-medium ml-1 flex items-center gap-1">
                        <LayoutGrid size={12} /> 优先级象限
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {[Quadrant.Q2, Quadrant.Q1, Quadrant.Q3, Quadrant.Q4].map((q) => {
                            const info = QUADRANT_INFO[q];
                            const isSelected = quadrant === q;
                            const baseStyle = `${info.bgColor} ${info.borderColor}`;
                            return (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => setQuadrant(q)}
                                    className={`relative p-4 rounded-2xl border text-left transition-all duration-300 group flex flex-col justify-between h-28
                                                    ${isSelected
                                            ? `${baseStyle} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1a1f35] ring-${info.color.split('-')[1]}-500 opacity-100 shadow-md scale-[1.02]`
                                            : `${baseStyle} opacity-60 hover:opacity-100 hover:scale-[1.02] hover:shadow-sm`
                                        }
                                                `}
                                >
                                    <div className="flex items-start justify-between w-full">
                                        <div className={`w-2.5 h-2.5 rounded-full ${info.dotColor} shadow-[0_0_8px_currentColor]`} />
                                        {isSelected && <CheckCircleIcon className={info.color} />}
                                    </div>
                                    <div>
                                        <div className={`text-xl font-bold ${info.color} mb-1`}>{info.label}</div>
                                        <div className="text-xs text-slate-500 dark:text-gray-400">{info.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!title || !quadrant}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg shadow-blue-500/20 border border-white/10 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {initialTask ? '保存修改' : '创建任务'}
                </button>
            </form>

            {/* Date Picker Overlay */}
            <div className={`absolute inset-0 bg-white dark:bg-[#1a1f35] z-20 flex flex-col transition-all duration-300 transform ${isSelectingDate ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">选择日期</h3>
                    <button onClick={() => setIsSelectingDate(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20} className="text-slate-500 dark:text-gray-400" /></button>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-xl flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <button type="button" onClick={(e) => handleMonthChange(-1, e)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all"><ChevronLeft size={24} /></button>
                        <span className="text-slate-800 dark:text-white font-bold text-xl font-mono">{viewDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}</span>
                        <button type="button" onClick={(e) => handleMonthChange(1, e)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all"><ChevronRight size={24} /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-slate-400 dark:text-gray-500 mb-2">
                        <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 text-center flex-1 content-start">
                        {calendarDays.map((day, idx) => {
                            if (day === null) return <div key={idx} />;
                            const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                            const dateStr = d.toLocaleDateString('en-CA');
                            const isSelected = dateStr === date;
                            const isToday = new Date().toDateString() === d.toDateString();
                            const lunarInfo = getLunarDate(dateStr);

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleDateSelect(day)}
                                    className={`aspect-[4/5] rounded-xl transition-all flex flex-col items-center justify-center relative overflow-hidden
                                                    ${isSelected
                                            ? 'bg-blue-600 text-white shadow-lg scale-105 z-10'
                                            : isToday
                                                ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30'
                                                : 'hover:bg-slate-100 dark:hover:bg-white/10'
                                        }
                                                `}
                                >
                                    <span className={`text-base font-medium ${isToday && !isSelected ? 'text-blue-600 dark:text-blue-400' : isSelected ? 'text-white' : 'text-slate-600 dark:text-gray-300'}`}>{day}</span>
                                    <span className={`text-[10px] mt-0.5 transform scale-90 origin-center
                                                    ${lunarInfo.festival
                                            ? (isSelected ? 'text-white font-bold' : 'text-red-500 dark:text-red-400 font-medium')
                                            : lunarInfo.term
                                                ? (isSelected ? 'text-blue-100' : 'text-emerald-600 dark:text-emerald-400')
                                                : 'text-slate-400 dark:text-gray-500'
                                        }
                                                `}>
                                        {lunarInfo.festival || lunarInfo.term || lunarInfo.lunar}
                                    </span>
                                    {isToday && !isSelected && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 text-center">
                        <button type="button" onClick={() => { setDate(new Date().toISOString().split('T')[0]); setIsSelectingDate(false); }} className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors">跳转回今天</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const CheckCircleIcon = ({ className }: { className: string }) => (
    <svg className={`w-5 h-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);