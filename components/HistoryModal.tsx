
import React, { useState, useMemo, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Task, QUADRANT_INFO } from '../types';
import { TaskCard } from './TaskCard';
import { List, Calendar as CalendarIcon, CheckCircle2, Circle, BarChart3, Download, Upload, Database, CalendarRange, CalendarDays, Clock } from 'lucide-react';
import { getLunarDate } from '../utils/lunar';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onDelete: (id: string) => void;
  onUpdate: (task: Task) => void;
  onImport?: (tasks: Task[]) => void;
  onEditTask?: (task: Task) => void;
}

type ViewMode = 'list' | 'calendar';
type StatusFilter = 'all' | 'todo' | 'done';
type DateRangeFilter = 'day' | 'week' | 'month' | 'year' | 'all_time';

const FILTER_LABELS = {
  all: '全部状态',
  todo: '待办',
  done: '已完成'
};

const DATE_FILTER_LABELS = {
  day: '今天',
  week: '本周',
  month: '本月',
  year: '本年',
  all_time: '全部时间'
};

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, tasks, onDelete, onUpdate, onImport, onEditTask }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('week'); // Default to Week
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Date Helper Logic
  const isDateInRunge = (dateStr: string, range: DateRangeFilter): boolean => {
      const d = new Date(dateStr);
      const today = new Date();
      
      // Reset hours for accurate day comparison
      d.setHours(0,0,0,0);
      today.setHours(0,0,0,0);

      if (range === 'all_time') return true;
      if (range === 'day') return d.getTime() === today.getTime();
      
      if (range === 'week') {
          const dayOfWeek = today.getDay() || 7; // 1 (Mon) to 7 (Sun)
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - dayOfWeek + 1);
          const endOfWeek = new Date(today);
          endOfWeek.setDate(today.getDate() + (7 - dayOfWeek));
          return d >= startOfWeek && d <= endOfWeek;
      }

      if (range === 'month') {
          return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      }

      if (range === 'year') {
          return d.getFullYear() === today.getFullYear();
      }

      return true;
  };

  // Filtered Data Logic
  const filteredListTasks = useMemo(() => {
    let filtered = [...tasks];
    
    // 1. Filter by Date Range
    filtered = filtered.filter(t => isDateInRunge(t.date, dateFilter));

    // 2. Filter by Status
    if (statusFilter === 'todo') filtered = filtered.filter(t => !t.completed);
    if (statusFilter === 'done') filtered = filtered.filter(t => t.completed);
    
    return filtered.sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending
  }, [tasks, statusFilter, dateFilter]);

  // Stats based on current filtered range (but respecting ALL statuses for counts)
  const stats = useMemo(() => {
    const rangeTasks = tasks.filter(t => isDateInRunge(t.date, dateFilter));
    return {
        all: rangeTasks.length,
        todo: rangeTasks.filter(t => !t.completed).length,
        done: rangeTasks.filter(t => t.completed).length,
    };
  }, [tasks, dateFilter]);

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
      const lunarInfo = getLunarDate(dateStr);

      days.push(
        <button
          key={d}
          onClick={() => setSelectedDate(dateStr)}
          className={`
            aspect-[4/5] relative rounded-xl overflow-hidden transition-all duration-200 flex flex-col items-center justify-center gap-0.5 border
            ${isSelected 
              ? 'bg-blue-600 text-white shadow-lg scale-105 z-10 border-blue-500' 
              : isToday
                ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
            }
          `}
        >
          <span className={`text-base font-medium ${isToday && !isSelected ? 'text-blue-400' : isSelected ? 'text-white' : 'text-gray-300'}`}>{d}</span>
          <span className={`text-[10px] transform scale-90 origin-center
                ${lunarInfo.festival 
                    ? (isSelected ? 'text-white font-bold' : 'text-red-400 font-medium') 
                    : lunarInfo.term 
                        ? (isSelected ? 'text-blue-100' : 'text-emerald-400') 
                        : (isSelected ? 'text-gray-300' : 'text-gray-500')
                }
          `}>
              {lunarInfo.festival || lunarInfo.term || lunarInfo.lunar}
          </span>

          {/* Dots Layout Container - Positioned at bottom */}
          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-[1px] px-1 pointer-events-none">
              {completedTasks.length > 0 && (
                 <div className="flex gap-[1px]">
                    {completedTasks.slice(0, 3).map(t => (
                        <div key={t.id} className="w-1 h-1 rounded-full bg-emerald-400/90" />
                    ))}
                    {completedTasks.length > 3 && <div className="w-1 h-1 rounded-full bg-emerald-400/50" />}
                 </div>
              )}
              {incompleteTasks.length > 0 && (
                 <div className="flex gap-[1px] ml-[1px]">
                    {incompleteTasks.slice(0, 3).map(t => (
                        <div key={t.id} className="w-1 h-1 rounded-full bg-red-400/90" />
                    ))}
                    {incompleteTasks.length > 3 && <div className="w-1 h-1 rounded-full bg-red-400/50" />}
                 </div>
              )}
          </div>
        </button>
      );
    }
    return days;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="历史回顾与分析" className="max-w-5xl h-[85vh] flex flex-col">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
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
            {/* FILTERS ROW */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 p-1">
                
                {/* Date Range Filter */}
                <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar">
                     {(['day', 'week', 'month', 'year', 'all_time'] as DateRangeFilter[]).map(r => (
                        <button
                            key={r}
                            onClick={() => setDateFilter(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                                ${dateFilter === r ? 'bg-white/10 text-blue-300 ring-1 ring-white/20' : 'text-gray-500 hover:text-gray-300'}
                            `}
                        >
                            {DATE_FILTER_LABELS[r]}
                        </button>
                     ))}
                </div>

                {/* Status Filter */}
                <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar">
                    {(['all', 'todo', 'done'] as StatusFilter[]).map(f => (
                        <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap
                            ${statusFilter === f ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}
                        `}
                        >
                        {f === 'all' && <BarChart3 size={16} />}
                        {f === 'todo' && <Circle size={16} />}
                        {f === 'done' && <CheckCircle2 size={16} />}
                        <span>{FILTER_LABELS[f]}</span>
                        <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === f ? 'bg-white/20' : 'bg-white/5'}`}>
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
                         <p>该时间段无任务</p>
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
                                noStrikethrough={true} 
                                onEdit={onEditTask}
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
                            noStrikethrough={true} 
                            variant="history" // Use compact/vertical layout for this narrow view
                            onEdit={onEditTask}
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
