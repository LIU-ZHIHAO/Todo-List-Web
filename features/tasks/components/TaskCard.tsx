import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';
import { Task, Subtask } from '../../core/types';
import { TAG_COLORS } from '../../core/constants/theme';
import { generateId } from '../../core/utils/helpers';
import { triggerConfetti } from '../../core/utils/confetti';

interface TaskCardProps {
    task: Task;
    onUpdate: (task: Task) => void;
    onDelete: (id: string) => void;
    onEdit?: (task: Task) => void;
    noStrikethrough?: boolean;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent, id: string) => void;
    onDrop?: (e: React.DragEvent, targetId: string, position: 'top' | 'bottom') => void;
    variant?: 'default' | 'history';
    compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = React.memo(({
    task, onUpdate, onDelete, onEdit, noStrikethrough = false,
    draggable, onDragStart, onDrop, variant = 'default', compact = false
}) => {
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(task.progress || 0);
    const [isDragging, setIsDragging] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);

    const [descInput, setDescInput] = useState(task.description || '');
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    useEffect(() => {
        setProgress(task.progress || 0);
    }, [task.progress]);

    useEffect(() => {
        setDescInput(task.description || '');
    }, [task.description]);

    const handleSaveDesc = () => {
        setIsEditingDesc(false);
        if (descInput !== task.description) {
            onUpdate({ ...task, description: descInput });
        }
    };

    const handleAddSubtask = () => {
        if (!newSubtaskTitle.trim()) return;
        const newSub: Subtask = {
            id: generateId(),
            title: newSubtaskTitle.trim(),
            completed: false
        };
        onUpdate({ ...task, subtasks: [...(task.subtasks || []), newSub] });
        setNewSubtaskTitle('');
    };

    const toggleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isCurrentlyCompleted = !!task.completed;
        const newStatus = !isCurrentlyCompleted;
        const newProgress = newStatus ? 100 : 0;

        setProgress(newProgress);
        if (newStatus && !noStrikethrough) {
            const today = new Date().toISOString().split('T')[0];
            triggerConfetti();
            setIsExiting(true);
            setTimeout(() => {
                onUpdate({ ...task, completed: today, progress: 100 });
            }, 400);
        } else {
            onUpdate({ ...task, completed: newStatus ? new Date().toISOString().split('T')[0] : null, progress: newProgress });
        }
    };

    const handleProgressClick = (level: number) => {
        const newProgress = level * 20;
        setProgress(newProgress);
        const isComplete = newProgress === 100;
        const isCurrentlyCompleted = !!task.completed;

        if (isComplete && !isCurrentlyCompleted && !noStrikethrough) {
            const today = new Date().toISOString().split('T')[0];
            triggerConfetti();
            setIsExiting(true);
            setTimeout(() => {
                onUpdate({ ...task, completed: today, progress: newProgress });
            }, 400);
        } else if (isComplete && !isCurrentlyCompleted) {
            const today = new Date().toISOString().split('T')[0];
            triggerConfetti();
            onUpdate({ ...task, completed: today, progress: newProgress });
        } else if (!isComplete && isCurrentlyCompleted) {
            // Un-complete
            onUpdate({ ...task, completed: null, progress: newProgress });
        } else {
            onUpdate({ ...task, progress: newProgress });
        }
    };

    const toggleSubtask = (subId: string) => {
        const updatedSubtasks = task.subtasks?.map(s =>
            s.id === subId ? { ...s, completed: !s.completed } : s
        );
        onUpdate({ ...task, subtasks: updatedSubtasks });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const threshold = rect.height / 2;
        setDropPosition(y < threshold ? 'top' : 'bottom');
    };

    // Colors
    const tagStyle = TAG_COLORS[task.tag] || 'bg-slate-400 text-white';

    // Title Style Logic
    let titleStyle = 'font-semibold';
    if (task.completed) {
        if (noStrikethrough) {
            titleStyle += ' text-emerald-600 dark:text-emerald-400/90 font-medium';
        } else {
            titleStyle += ' line-through text-slate-400 dark:text-gray-500';
        }
    } else {
        // Visual Alert for Auto-moved Overdue Tasks
        if (task.isOverdue) {
            titleStyle += ' text-red-500 dark:text-red-400 animate-pulse font-bold';
        } else {
            titleStyle += ' text-slate-800 dark:text-gray-100';
        }
    }

    const renderProgressBar = () => (
        <div className={`${(variant === 'history' && !compact) ? 'w-full md:w-24 md:sm:w-32' : 'w-24 sm:w-32'} h-4 flex items-center gap-[2px] group/progress`} title={`当前进度: ${progress}%`}>
            {[20, 40, 60, 80, 100].map((level) => {
                const isActive = progress >= level;
                const isFull = level === 100;

                // Progress bar colors adjusted for Light Mode visibility
                let colorClass = 'bg-slate-200 dark:bg-gray-700/30 border border-transparent dark:border-white/5';
                if (isActive) {
                    if (isFull) colorClass = 'bg-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-[0_0_5px_rgba(16,182,129,0.6)] border-emerald-500';
                    else if (level >= 80) colorClass = 'bg-blue-400 border-blue-400';
                    else if (level >= 40) colorClass = 'bg-blue-500/80 border-blue-500/80';
                    else colorClass = 'bg-blue-600/60 border-blue-600/60';
                }

                return (
                    <button
                        key={level}
                        onClick={(e) => { e.stopPropagation(); handleProgressClick(level / 20); }}
                        className={`flex-1 h-2 rounded-[1px] transition-all duration-200 ${colorClass} hover:h-3 hover:brightness-110 transform origin-center`}
                    />
                );
            })}
        </div>
    );

    return (
        <div
            draggable={draggable}
            onDragStart={(e) => {
                setIsDragging(true);
                if (onDragStart) onDragStart(e, task.id);
            }}
            onDragEnd={() => {
                setIsDragging(false);
                setDropPosition(null);
            }}
            onDragOver={handleDragOver}
            onDragLeave={() => setDropPosition(null)}
            onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onDrop && dropPosition) onDrop(e, task.id, dropPosition);
                setDropPosition(null);
            }}
            className={`group relative rounded-lg transition-all duration-200 ease-out flex flex-col
        ${isExiting ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100'}
        ${isDragging ? 'opacity-40 border-dashed border-blue-400 scale-[0.98] bg-white z-50' : ''}
        ${task.completed
                    ? 'bg-slate-50/80 border-slate-100 dark:bg-white/5 dark:border-white/5'
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/[0.07] dark:hover:border-white/20 dark:hover:shadow-lg'
                }
        border
      `}
        >
            {dropPosition === 'top' && (
                <div className="absolute -top-[2px] left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] rounded-full z-50" />
            )}
            {dropPosition === 'bottom' && (
                <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] rounded-full z-50" />
            )}

            {/* CONTENT LAYOUT - 移动端分行，Web端横向 */}
            <div className={`flex flex-col ${compact ? '' : 'md:flex-row md:items-start'} p-2.5 gap-2 md:gap-3 min-h-12`}>

                {/* 第一行/左侧：标题、标签等主要信息 */}
                <div className="flex items-center flex-1 min-w-0 gap-3">

                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <button
                            data-testid="toggle-complete"
                            onClick={toggleComplete}
                            className={`transition-all duration-300 flex-shrink-0 ${task.completed ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-300'}`}
                        >
                            {task.completed ? <CheckCircle2 size={18} className="drop-shadow-sm" /> : <Circle size={18} />}
                        </button>

                        <h3
                            onClick={() => onEdit && onEdit(task)}
                            className={`text-sm cursor-pointer select-none whitespace-normal break-words leading-tight flex-1 min-w-0 ${titleStyle}`}
                            title={task.title}
                        >
                            {task.title}
                        </h3>

                        {(variant === 'default' || variant === 'history') && !compact && (
                            <div className="hidden md:flex flex-1 min-w-0 relative group/desc">
                                {isEditingDesc ? (
                                    <input
                                        autoFocus
                                        value={descInput}
                                        onChange={(e) => setDescInput(e.target.value)}
                                        onBlur={handleSaveDesc}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveDesc()}
                                        className="w-full bg-transparent border-b border-blue-500 text-xs text-slate-700 dark:text-gray-200 focus:outline-none pb-0.5"
                                        placeholder="输入备注..."
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <div
                                        onClick={(e) => { e.stopPropagation(); setIsEditingDesc(true); }}
                                        className={`text-xs truncate cursor-text py-1 ${task.description ? 'text-slate-500 dark:text-gray-400' : 'text-slate-300 hover:text-slate-400 dark:text-gray-600/70'}`}
                                        title={task.description || "点击添加备注"}
                                    >
                                        {task.description || "添加备注..."}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <div className="flex flex-col items-end">
                            <span className={`text-[9px] px-1.5 py-[1px] rounded font-bold tracking-wide ${tagStyle} shadow-sm opacity-90`}>
                                {task.tag}
                            </span>
                        </div>
                        {(variant === 'default' || variant === 'history') && !compact && (
                            <span className={`hidden md:block text-[10px] font-mono pt-[1px] ${task.isOverdue && !task.completed ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-gray-500'}`}>
                                {task.date}
                            </span>
                        )}
                    </div>
                </div>

                {/* 第二行/右侧：进度条和展开按钮 - Web端在右侧，移动端在下方 */}
                <div className={`flex items-center gap-3 flex-shrink-0 ${compact ? 'pl-7' : 'md:ml-0 pl-7 md:pl-0'}`}>
                    {variant === 'history' && task.description && !compact && (
                        <p className="md:hidden text-xs text-slate-500 dark:text-gray-500 line-clamp-2 flex-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {(variant === 'default' || variant === 'history') && (
                            <span className={`${compact ? '' : 'md:hidden'} text-[10px] font-mono ${task.isOverdue && !task.completed ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-gray-500'}`}>
                                {task.date}
                            </span>
                        )}
                        {renderProgressBar()}
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                            className={`p-1 text-slate-400 hover:text-slate-700 dark:text-gray-500 dark:hover:text-white transition-all rounded hover:bg-slate-100 dark:hover:bg-white/10 ${isExpanded ? 'bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400' : ''}`}
                        >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="px-3 pb-3 pt-0 animate-in slide-in-from-top-1 duration-200">
                    <div className="pl-8 pr-1 space-y-3 pt-2 border-t border-slate-100 dark:border-white/5 mt-1">

                        {variant === 'default' && (
                            <div className="sm:hidden flex items-center gap-2 text-[10px] mb-2">
                                <span className={`px-1.5 py-0.5 rounded font-medium ${tagStyle}`}>{task.tag}</span>
                                <span className={`text-slate-400 dark:text-gray-400 ${task.isOverdue ? 'text-red-500 font-bold' : ''}`}>{task.date}</span>
                            </div>
                        )}

                        {variant === 'history' && (
                            <div className="sm:hidden flex items-center gap-2 text-[10px] mb-1 text-slate-400 dark:text-gray-400">
                                <span>日期: {task.date}</span>
                            </div>
                        )}

                        {(task.subtasks && task.subtasks.length > 0) || newSubtaskTitle ? (
                            <div className="space-y-1.5">
                                {task.subtasks?.map(st => (
                                    <div key={st.id}
                                        className={`flex items-center gap-2 p-1.5 rounded transition-all ml-1
                                    ${st.completed
                                                ? 'bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10'
                                                : 'bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleSubtask(st.id)}
                                            className={`flex-shrink-0 transition-colors ${st.completed ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 hover:text-slate-500 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                        >
                                            {st.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                        </button>
                                        <span className={`text-xs break-words flex-1 font-medium transition-colors ${st.completed ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-gray-300'}`}>
                                            {st.title}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => onUpdate({ ...task, subtasks: task.subtasks?.filter(s => s.id !== st.id) })}
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        <div className="flex items-center gap-2 ml-1 mt-2">
                            <button
                                onClick={handleAddSubtask}
                                disabled={!newSubtaskTitle.trim()}
                                className="p-1 rounded bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/30 disabled:opacity-50 disabled:bg-transparent disabled:text-slate-400 dark:disabled:text-gray-500 transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                            <input
                                type="text"
                                value={newSubtaskTitle}
                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                                placeholder="新增子任务..."
                                className="flex-1 bg-transparent text-xs text-slate-700 dark:text-gray-300 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none py-1 border-b border-transparent focus:border-blue-500/30 transition-colors"
                            />
                        </div>

                        <div className="flex justify-end pt-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                                className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 transition-colors py-1 px-2 rounded hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                                <Trash2 size={12} /> 删除任务
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});