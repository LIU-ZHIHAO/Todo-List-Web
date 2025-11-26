import React from 'react';
import { Plus } from 'lucide-react';
import { Task, Quadrant } from '../../core/types';
import { QUADRANT_INFO } from '../../core/constants/theme';
import { TaskCard } from './TaskCard';

interface QuadrantSectionProps {
    quadrant: Quadrant;
    tasks: Task[];
    dragOverQuadrant: Quadrant | null;
    onAddClick: (q: Quadrant) => void;
    onDragEnter: (e: React.DragEvent, q: Quadrant) => void;
    onDrop: (e: React.DragEvent, q: Quadrant, targetId?: string, pos?: 'top' | 'bottom') => void;
    onTaskUpdate: (task: Task) => Promise<void>;
    onTaskDelete: (id: string) => Promise<void>;
    onTaskEdit: (task: Task) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
}

export const QuadrantSection: React.FC<QuadrantSectionProps> = React.memo(({
    quadrant,
    tasks,
    dragOverQuadrant,
    onAddClick,
    onDragEnter,
    onDrop,
    onTaskUpdate,
    onTaskDelete,
    onTaskEdit,
    onDragStart
}) => {
    const info = QUADRANT_INFO[quadrant];
    const isOver = dragOverQuadrant === quadrant;

    return (
        <div
            onClick={() => onAddClick(quadrant)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => onDragEnter(e, quadrant)}
            onDrop={(e) => onDrop(e, quadrant)}
            className={`flex flex-col h-full rounded-2xl border backdrop-blur-sm p-4 transition-all duration-300 ease-out group relative overflow-hidden cursor-pointer
        ${isOver
                    ? `border-${info.color.split('-')[1]}-400 shadow-lg scale-[1.01] bg-slate-100 dark:bg-slate-800/80 z-30`
                    : `${info.bgColor} ${info.borderColor} hover:shadow-lg hover:scale-[1.01] hover:z-20`
                }
      `}
        >
            {/* Active Drop Glow */}
            {isOver && <div className={`absolute inset-0 bg-${info.color.split('-')[1]}-500/10 pointer-events-none z-0 animate-pulse`} />}

            {/* Title Row */}
            <div className="flex items-center gap-2 mb-3 relative z-10 flex-shrink-0 pointer-events-none">
                <h2 className={`text-xl font-bold tracking-tight ${info.color} flex items-center gap-2`}>
                    {info.label}
                    <span className="text-sm font-normal opacity-70">({info.description})</span>
                </h2>
                <div className="flex-1" />
                <span className={`px-2 py-0.5 rounded text-xs font-bold bg-black/5 dark:bg-white/10 ${info.color}`}>
                    {tasks.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 relative z-10 pb-2">
                {tasks.length === 0 && !isOver ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500/50 border-2 border-dashed border-slate-300/50 dark:border-slate-700/50 rounded-xl p-4 select-none transition-colors group-hover:border-slate-400 dark:group-hover:border-slate-600">
                        <Plus size={24} className="mb-2 opacity-50" />
                        <span className="text-xs font-medium">点击空白处新建任务</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {tasks.map(task => (
                            <div key={task.id} onClick={(e) => e.stopPropagation()} className="cursor-auto">
                                <TaskCard
                                    task={task}
                                    onUpdate={onTaskUpdate}
                                    onDelete={onTaskDelete}
                                    onEdit={onTaskEdit}
                                    draggable={true}
                                    onDragStart={onDragStart}
                                    onDrop={(e, targetId, pos) => onDrop(e, quadrant, targetId, pos)}
                                />
                            </div>
                        ))}
                        {isOver && (
                            <div className="h-12 rounded-lg border-2 border-dashed border-blue-400/50 bg-blue-500/5 flex items-center justify-center animate-pulse">
                                <span className="text-blue-400/50 text-xs font-medium">放置于此</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});
