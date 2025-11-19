import React, { useState, useMemo, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Task, QUADRANT_INFO } from '../types';
import { TaskCard } from './TaskCard';
import { List, Calendar as CalendarIcon, CheckCircle2, Circle, BarChart3, Download, Upload, Database } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onDelete: (id: string) => void;
  onUpdate: (task: Task) => void;
  onImport?: (tasks: Task[]) => void;
}

type ViewMode = 'list' | 'calendar';
type Filter = 'all' | 'todo' | 'done';

const FILTER_LABELS = {
  all: '全部',
  todo: '待办',
  done: '已完成'
};

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, tasks, onDelete, onUpdate, onImport }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats
  const stats = useMemo(() => ({
    all: tasks.length,
    todo: tasks.filter(t => !t.completed).length,
    done: tasks.filter(t => t.completed).length,
  }), [tasks]);

  // List View Data
  const filteredListTasks = useMemo(() => {
    let filtered = [...tasks];
    if (filter === 'todo') filtered = filtered.filter(t => !t.completed);
    if (filter === 'done') filtered = filtered.filter(t => t.completed);
    return filtered.sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending
  }, [tasks, filter]);

  // Export Handler
  const handleExport = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eisenhower-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedTasks = JSON.parse(content) as Task[];
        
        if (Array.isArray(importedTasks) && importedTasks.every(t => t.id && t.title)) {
          if (window.confirm(`确认导入 ${importedTasks.length} 个任务吗？这将合并到当前列表。`)) {
            onImport?.(importedTasks);
            alert('导入成功！');
          }
        } else {
          alert('文件格式错误，请使用本应用导出的 JSON 文件。');
        }
      } catch (error) {
        console.error(error);
        alert('解析文件失败');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days: daysInMonth, firstDay } = getDaysInMonth(currentMonth);

  const changeMonth = (delta: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));
    setSelectedDate(null);
  };

  const renderCalendar = () => {
    const days = [];
    // Padding for empty start days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`pad-${i}`} className="aspect-square" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = tasks.filter(t => t.date === dateStr);
      
      const completedTasks = dayTasks.filter(t => t.completed);
      const incompleteTasks = dayTasks.filter(t => !t.completed);
      
      const isSelected = selectedDate === dateStr;
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <button
          key={d}
          onClick={() => setSelectedDate(dateStr)}
          className={`
            aspect-square relative rounded-xl overflow-hidden transition-all duration-200 border
            ${isSelected 
              ? 'bg-blue-500/20 border-blue-500 text-white ring-2 ring-blue-500/30 z-10' 
              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-gray-300'
            }
            ${isToday && !isSelected ? 'border-blue-400/40' : ''}
          `}
        >
          {/* Date Number: Absolute Center to remain stable regardless of dots */}
          <span className={`
            absolute inset-0 flex items-center justify-center text-sm font-medium z-10 pointer-events-none select-none
            ${isToday ? 'text-blue-400 font-bold' : ''}
          `}>
            {d}
          </span>

          {/* Dots Layout Container */}
          <div className="absolute inset-0 flex flex-col justify-between p-[3px] pointer-events-none">
            
            {/* Top Area: Completed Tasks (Green) */}
            <div className="flex flex-wrap content-start justify-center gap-[2px] w-full max-h-[42%] overflow-hidden">
              {completedTasks.map(t => (
                <div 
                  key={t.id} 
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400/90 shadow-[0_0_2px_rgba(52,211,153,0.6)]" 
                  title={t.title}
                />
              ))}
            </div>

            {/* Bottom Area: Incomplete Tasks (Red) */}
            <div className="flex flex-wrap content-end justify-center gap-[2px] w-full max-h-[42%] overflow-hidden">
              {incompleteTasks.map(t => (
                <div 
                  key={t.id} 
                  className="w-1.5 h-1.5 rounded-full bg-red-400/90 shadow-[0_0_2px_rgba(248,113,113,0.6)]"
                  title={t.title}
                />
              ))}
            </div>

          </div>
        </button>
      );
    }
    return days;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="历史回顾与分析" className="max-w-5xl h-[85vh] flex flex-col">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        {/* View Switcher */}
        <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 self-start">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:text-white'}
            `}
          >
            <List size={16} /> 列表视图
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${viewMode === 'calendar' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:text-white'}
            `}
          >
            <CalendarIcon size={16} /> 日历视图
          </button>
        </div>

        {/* Data Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2 text-xs text-gray-400 mr-2 hidden md:flex">
                <Database size={14} />
                <span>本地数据库: {tasks.length} 条记录</span>
            </div>
            <button
                onClick={handleExport}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 hover:text-white transition-all flex items-center gap-2"
                title="导出数据备份"
            >
                <Download size={16} /> 导出
            </button>
            <label className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer">
                <Upload size={16} /> 导入
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden" 
                />
            </label>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === 'list' ? (
          <>
            {/* Filters (Only for List View) */}
            <div className="flex mb-4">
                <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
                {(['all', 'todo', 'done'] as Filter[]).map(f => (
                    <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                        ${filter === f ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}
                    `}
                    >
                    {f === 'all' && <BarChart3 size={16} />}
                    {f === 'todo' && <Circle size={16} />}
                    {f === 'done' && <CheckCircle2 size={16} />}
                    <span>{FILTER_LABELS[f]}</span>
                    <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${filter === f ? 'bg-white/20' : 'bg-white/5'}`}>
                        {stats[f]}
                    </span>
                    </button>
                ))}
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {filteredListTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                         <div className="p-4 rounded-full bg-white/5 mb-3">
                            <List size={32} className="opacity-20" />
                         </div>
                         暂无任务
                    </div>
                ) : (
                    filteredListTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-4 group">
                        <div className={`w-1.5 h-full rounded-full ${QUADRANT_INFO[task.quadrant].dotColor} self-stretch my-1 opacity-50`} />
                        <div className="flex-1">
                            <TaskCard 
                                task={task} 
                                onUpdate={onUpdate} 
                                onDelete={onDelete} 
                                noStrikethrough={true} // Disable strikethrough for history view
                            />
                        </div>
                    </div>
                    ))
                )}
            </div>
          </>
        ) : (
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
            {/* Calendar Grid */}
            <div className="lg:col-span-2 flex flex-col h-full">
               <div className="flex items-center justify-between mb-4 px-2 bg-white/5 p-3 rounded-xl border border-white/10">
                 <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg text-gray-300 transition-colors">←</button>
                 <h3 className="text-lg font-bold text-white">
                   {currentMonth.toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' })}
                 </h3>
                 <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-lg text-gray-300 transition-colors">→</button>
               </div>
               <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider py-2">
                 <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-7 gap-2 pr-1 auto-rows-fr">
                        {renderCalendar()}
                    </div>
               </div>
            </div>

            {/* Selected Date Details */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col h-full overflow-hidden">
              <h3 className="text-md font-bold text-white mb-4 border-b border-white/10 pb-3 flex items-center justify-between">
                 <span>{selectedDate ? new Date(selectedDate).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }) : '任务详情'}</span>
                 {selectedDate && (
                   <span className="px-2 py-1 rounded-md bg-white/10 text-xs text-blue-200">
                     {tasks.filter(t => t.date === selectedDate).length} 个任务
                   </span>
                 )}
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                {selectedDate ? (
                   tasks.filter(t => t.date === selectedDate).length > 0 ? (
                     tasks.filter(t => t.date === selectedDate).map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onUpdate={onUpdate} 
                            onDelete={onDelete}
                            noStrikethrough={true} // Consistent styling in details view
                        />
                     ))
                   ) : (
                     <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p>当日无任务</p>
                     </div>
                   )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-6">
                    <CalendarIcon size={48} className="mb-4 opacity-10" />
                    <p className="text-sm">点击日历上的日期<br/>查看当日任务详情</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};