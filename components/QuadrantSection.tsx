import React from 'react';
import { Plus } from 'lucide-react';
import { Task, Quadrant } from '../types';
import { QUADRANT_INFO } from '../constants/theme';
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
    const isTop = quadrant === Quadrant.Q1 || quadrant === Quadrant.Q2;
    const hoverClass = isTop ? 'hover:translate-y-2' : 'hover:-translate-y-2';

    return (
        <div
            onClick={() => onAddClick(quadrant)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => onDragEnter(e, quadrant)}
            onDrop={(e) => onDrop(e, quadrant)}
            className={`flex flex-col h-full rounded-2xl border backdrop-blur-sm p-4 transition-all duration-500 ease-out group relative overflow-hidden cursor-pointer z-10
        ${isOver
                    ? `border-${info.color.split('-')[1]}-400 shadow-lg scale-[1.01] ${info.bgColor.replace('/80', '/90')} dark:bg-${info.color.split('-')[1]}-900/30 z-30`
                    : `${info.bgColor} ${info.borderColor} 
              hover:shadow-2xl hover:scale-[1.02] hover:z-30 ${hoverClass} hover:shadow-${info.color.split('-')[1]}-500/30`
                }
      `}
        >
            {/* Active Drop Glow */}
            {isOver && <div className={`absolute inset-0 bg-${info.color.split('-')[1]}-500/10 pointer-events-none z-0 animate-pulse`} />}

            {/* Title Row */}
            <div className="flex items-baseline gap-2 mb-2 relative z-10 flex-shrink-0 pointer-events-none">
                <h2 className={`text-2xl font-bold tracking-tight ${info.color} relative`}>
                    {info.label}
                </h2>
                <span className="text-sm font-medium text-slate-500/80 dark:text-gray-400/80">
                    ({info.description})
                </span>
                <div className="flex-1" />
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-white/60 dark:bg-white/10 ${info.color} border border-white/30 dark:border-white/5 shadow-sm`}>
                    {tasks.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 relative z-10 pb-2">
                {tasks.length === 0 && !isOver ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-500/40 border-2 border-dashed border-slate-300/50 dark:border-gray-500/10 rounded-xl p-4 select-none transition-colors">
                        <Plus size={24} className="mb-2 opacity-50" />
                        <span className="text-xs font-medium">点击空白处新建任务</span>
                    </div>
                ) : (
                    <>
                        {tasks.map(task => (
                            <div key={task.id} onClick={(e) => e.stopPropagation()} className="cursor-auto transform transition-transform duration-200 hover:scale-[1.01]">
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
                    </>
                )}
            </div>

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 pointer-events-none bg-gradient-to-br from-white/0 to-white/0 dark:${info.gradient} opacity-100 transition-opacity duration-700`}></div>
        </div>
    );
});
