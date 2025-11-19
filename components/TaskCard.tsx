import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Task, TAG_COLORS, Subtask } from '../types';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
  noStrikethrough?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDrop?: (e: React.DragEvent, targetId: string, position: 'top' | 'bottom') => void;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, onUpdate, onDelete, onEdit, noStrikethrough = false,
  draggable, onDragStart, onDrop 
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(task.progress || 0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);

  // Inline Editing States
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
    const newStatus = !task.completed;
    const newProgress = newStatus ? 100 : 0;
    
    setProgress(newProgress);
    if (newStatus && !noStrikethrough) {
        setIsExiting(true);
        setTimeout(() => {
            onUpdate({ ...task, completed: true, progress: 100 });
        }, 400);
    } else {
        onUpdate({ ...task, completed: newStatus, progress: newProgress });
    }
  };

  const handleProgressClick = (level: number) => {
    const newProgress = level * 20;
    setProgress(newProgress);
    const isComplete = newProgress === 100;
    
    if (isComplete && !task.completed && !noStrikethrough) {
       setIsExiting(true);
       setTimeout(() => {
          onUpdate({ ...task, completed: true, progress: newProgress });
       }, 400);
    } else {
       onUpdate({ ...task, completed: isComplete, progress: newProgress });
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

  const tagStyle = TAG_COLORS[task.tag] || 'bg-gray-500/40 text-gray-100 border-gray-400/30';
  const titleStyle = task.completed
    ? noStrikethrough ? 'text-emerald-400/90' : 'line-through text-gray-500' 
    : 'text-gray-100';

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
      className={`group relative rounded-lg border transition-all duration-300 ease-out flex flex-col
        ${isExiting ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100'}
        ${isDragging ? 'opacity-40 border-dashed border-blue-400/70 scale-[0.98] bg-[#1a1f35] z-50' : ''}
        ${task.completed 
          ? 'bg-white/5 border-white/5' 
          : 'bg-white/5 border-white/10 hover:bg-white/[0.07] hover:border-white/20 hover:shadow-lg'
        }
      `}
    >
      {/* Bright Drop Indicators */}
      {dropPosition === 'top' && (
          <div className="absolute -top-[2px] left-0 right-0 h-[2px] bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)] rounded-full z-50 animate-pulse" />
      )}
      {dropPosition === 'bottom' && (
          <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)] rounded-full z-50 animate-pulse" />
      )}

      {/* MAIN ROW: Flat Layout */}
      <div className="flex items-center p-2.5 gap-3 h-12">
        
        {/* 1. Drag Handle (Hover) & Checkbox */}
        <div className="flex items-center gap-2 flex-shrink-0">
            <button 
                onClick={toggleComplete}
                className={`transition-all duration-300 ${task.completed ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`}
            >
                {task.completed ? <CheckCircle2 size={18} className="drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> : <Circle size={18} />}
            </button>
        </div>

        {/* 2. Center Area: Title + Description + Metadata */}
        <div className="flex-1 min-w-0 flex items-center gap-3 mr-2">
            {/* Title: Limited width to allow description space, truncates if too long */}
            <h3 
                onClick={() => onEdit && onEdit(task)} 
                className={`text-sm font-medium truncate cursor-pointer select-none flex-shrink-0 max-w-[30%] sm:max-w-[150px] md:max-w-[200px] ${titleStyle}`}
                title={task.title}
            >
                {task.title}
            </h3>
            
            {/* Description / Note Area (Editable Inline) */}
            <div className="flex-1 min-w-0 relative group/desc">
                 {isEditingDesc ? (
                    <input 
                        autoFocus
                        value={descInput}
                        onChange={(e) => setDescInput(e.target.value)}
                        onBlur={handleSaveDesc}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveDesc()}
                        className="w-full bg-transparent border-b border-blue-500/50 text-xs text-gray-200 focus:outline-none pb-0.5"
                        placeholder="输入备注..."
                        onClick={(e) => e.stopPropagation()}
                    />
                 ) : (
                    <div 
                        onClick={(e) => { e.stopPropagation(); setIsEditingDesc(true); }}
                        className={`text-xs truncate cursor-text py-1 ${task.description ? 'text-gray-400' : 'text-gray-600/70 hover:text-gray-500'}`}
                        title={task.description || "点击添加备注"}
                    >
                        {task.description || "添加备注..."}
                    </div>
                 )}
            </div>

            {/* Tag & Date */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <span className={`text-[9px] px-1.5 py-[1px] rounded border font-medium ${tagStyle} opacity-80`}>
                    {task.tag}
                </span>
                <span className="text-[10px] text-gray-500 font-mono pt-[1px]">{task.date}</span>
            </div>
        </div>

        {/* 3. Right Side Actions: Progress & Chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
            
            {/* Progress Bar */}
            <div className="w-24 sm:w-32 h-4 flex items-center gap-[2px] group/progress" title={`当前进度: ${progress}%`}>
                {[20, 40, 60, 80, 100].map((level) => {
                    const isActive = progress >= level;
                    const isFull = level === 100;
                    
                    let colorClass = 'bg-gray-700/30 border border-white/5';
                    if (isActive) {
                        if (isFull) colorClass = 'bg-emerald-500 shadow-[0_0_5px_rgba(16,182,129,0.6)] border-emerald-400/50';
                        else if (level >= 80) colorClass = 'bg-blue-400 border-blue-300/50';
                        else if (level >= 40) colorClass = 'bg-blue-500/80 border-blue-400/40';
                        else colorClass = 'bg-blue-600/60 border-blue-500/30';
                    }

                    return (
                        <button
                            key={level}
                            onClick={(e) => { e.stopPropagation(); handleProgressClick(level / 20); }}
                            className={`flex-1 h-2 rounded-[1px] transition-all duration-200 ${colorClass} hover:h-3 hover:brightness-125 transform origin-center`}
                        />
                    );
                })}
            </div>

            {/* Expand Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className={`p-1 text-gray-500 hover:text-white transition-all rounded hover:bg-white/10 ${isExpanded ? 'bg-white/10 text-blue-400' : ''}`}
            >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
        </div>
      </div>

      {/* EXPANDED AREA (Subtasks) */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 animate-in slide-in-from-top-1 duration-200">
            <div className="pl-8 pr-1 space-y-3 pt-2 border-t border-white/5 mt-1">
                
                {/* Mobile Tag/Date Backup */}
                <div className="sm:hidden flex items-center gap-2 text-[10px] mb-2">
                    <span className={`px-1.5 py-0.5 rounded border font-medium ${tagStyle}`}>{task.tag}</span>
                    <span className="text-gray-400">{task.date}</span>
                </div>

                {/* Subtasks List */}
                {(task.subtasks && task.subtasks.length > 0) || newSubtaskTitle ? (
                    <div className="space-y-1.5">
                        {task.subtasks?.map(st => (
                            <div key={st.id} 
                                 className={`flex items-center gap-2 p-1.5 rounded border transition-all ml-1
                                    ${st.completed 
                                        ? 'bg-emerald-500/5 border-emerald-500/10' 
                                        : 'bg-black/20 border-white/5 hover:bg-white/5'
                                    }`}
                            >
                                <button 
                                    onClick={() => toggleSubtask(st.id)}
                                    className={`flex-shrink-0 transition-colors ${st.completed ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {st.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                </button>
                                <span className={`text-xs break-words flex-1 font-medium transition-colors ${st.completed ? 'text-emerald-400' : 'text-gray-300'}`}>
                                    {st.title}
                                </span>
                                <button 
                                    type="button" 
                                    onClick={() => onUpdate({ ...task, subtasks: task.subtasks?.filter(s => s.id !== st.id) })}
                                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : null}

                {/* Add Subtask Input (Inline in Dropdown) */}
                <div className="flex items-center gap-2 ml-1">
                    <div className="text-gray-500">
                        <Plus size={14} />
                    </div>
                    <input 
                        type="text"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                        placeholder="新增子任务..."
                        className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-600 focus:outline-none py-1"
                    />
                    {newSubtaskTitle && (
                        <button 
                            onClick={handleAddSubtask}
                            className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                        >
                            添加
                        </button>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end pt-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                        className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-red-400 transition-colors py-1 px-2 rounded hover:bg-red-500/10"
                    >
                        <Trash2 size={12} /> 删除任务
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};