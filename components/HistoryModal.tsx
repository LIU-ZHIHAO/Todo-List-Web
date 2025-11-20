
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Task, QUADRANT_INFO, QuickNote, SortConfig } from '../types';
import { TaskCard } from './TaskCard';
import { List, Calendar as CalendarIcon, CheckCircle2, Circle, BarChart3, Download, Upload, Database, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { getLunarDate } from '../utils/lunar';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  quickNotes?: QuickNote[]; 
  onDelete: (id: string) => void;
  onUpdate: (task: Task) => void;
  onImport?: (tasks: Task[], notes: QuickNote[]) => void;
  onEditTask?: (task: Task) => void;
  sortConfig?: SortConfig;
}

type ViewMode = 'list' | 'calendar';
type StatusFilter = 'all' | 'todo' | 'done';
type DateRangeFilter = 'day' | 'week' | 'month' | 'year';

const FILTER_LABELS = {
  all: '全部状态',
  todo: '待办',
  done: '已完成'
};

const DATE_FILTER_LABELS = {
  day: '按日',
  week: '按周',
  month: '按月',
  year: '按年',
};

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, tasks, quickNotes = [], onDelete, onUpdate, onImport, onEditTask, sortConfig }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('week'); 
  const [selectedDate, setSelectedDate] = useState<string | null>(null); 
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [filterDate, setFilterDate] = useState(new Date()); 
  
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); 
  const [popupViewDate, setPopupViewDate] = useState(new Date()); 

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (isOpen) {
          setFilterDate(new Date());
          setPopupViewDate(new Date());
          setIsDatePickerOpen(false);
      }
  }, [isOpen]);

  useEffect(() => {
      setPopupViewDate(new Date(filterDate));
  }, [filterDate]);

  // Sorting Helper
  const applySystemSort = (list: Task[]) => {
      if (!sortConfig) return list.sort((a, b) => b.createdAt - a.createdAt);

      const { mode, direction } = sortConfig;
      return [...list].sort((a, b) => {
          if (mode === 'custom') return a.order - b.order;
          
          if (mode === 'created') {
              return direction === 'asc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
          }

          if (mode === 'progress') {
              if (a.progress !== b.progress) {
                  return direction === 'asc' ? a.progress - b.progress : b.progress - a.progress;
              }
              return a.order - b.order;
          }
          return a.order - b.order;
      });
  };

  const handlePrevRange = () => {
      const d = new Date(filterDate);
      switch (dateFilter) {
          case 'day': d.setDate(d.getDate() - 1); break;
          case 'week': d.setDate(d.getDate() - 7); break;
          case 'month': d.setMonth(d.getMonth() - 1); break;
          case 'year': d.setFullYear(d.getFullYear() - 1); break;
      }
      setFilterDate(d);
  };

  const handleNextRange = () => {
      const d = new Date(filterDate);
      switch (dateFilter) {
          case 'day': d.setDate(d.getDate() + 1); break;
          case 'week': d.setDate(d.getDate() + 7); break;
          case 'month': d.setMonth(d.getMonth() + 1); break;
          case 'year': d.setFullYear(d.getFullYear() + 1); break;
      }
      setFilterDate(d);
  };

  const getRangeLabel = () => {
      const y = filterDate.getFullYear();
      const m = filterDate.getMonth() + 1;
      const d = filterDate.getDate();

      if (dateFilter === 'day') return `${y}年${m}月${d}日`;
      if (dateFilter === 'month') return `${y}年${m}月`;
      if (dateFilter === 'year') return `${y}年`;
      if (dateFilter === 'week') {
           const currentDay = filterDate.getDay() || 7; 
           const start = new Date(filterDate);
           start.setDate(filterDate.getDate() - currentDay + 1);
           const end = new Date(filterDate);
           end.setDate(filterDate.getDate() + (7 - currentDay));
           return `${start.getMonth()+1}月${start.getDate()}日 - ${end.getMonth()+1}月${end.getDate()}日`;
      }
      return '';
  };

  const isDateInRunge = (dateStr: string, range: DateRangeFilter, targetDate: Date): boolean => {
      const d = new Date(dateStr);
      const current = new Date(targetDate);
      
      d.setHours(0,0,0,0);
      current.setHours(0,0,0,0);

      if (range === 'day') return d.getTime() === current.getTime();
      
      if (range === 'week') {
          const currentDayOfWeek = current.getDay() || 7; 
          const startOfWeek = new Date(current);
          startOfWeek.setDate(current.getDate() - currentDayOfWeek + 1);
          startOfWeek.setHours(0,0,0,0);

          const endOfWeek = new Date(current);
          endOfWeek.setDate(current.getDate() + (7 - currentDayOfWeek));
          endOfWeek.setHours(23,59,59,999);

          return d.getTime() >= startOfWeek.getTime() && d.getTime() <= endOfWeek.getTime();
      }

      if (range === 'month') return d.getMonth() === current.getMonth() && d.getFullYear() === current.getFullYear();
      if (range === 'year') return d.getFullYear() === current.getFullYear();
      return true;
  };

  const filteredListTasks = useMemo(() => {
    let filtered = [...tasks];
    filtered = filtered.filter(t => isDateInRunge(t.date, dateFilter, filterDate));
    
    if (statusFilter === 'todo') filtered = filtered.filter(t => !t.completed);
    if (statusFilter === 'done') filtered = filtered.filter(t => t.completed);
    
    // Apply System Sort Logic instead of default date sort
    return applySystemSort(filtered);
  }, [tasks, statusFilter, dateFilter, filterDate, sortConfig]);

  const stats = useMemo(() => {
    const rangeTasks = tasks.filter(t => isDateInRunge(t.date, dateFilter, filterDate));
    return {
        all: rangeTasks.length,
        todo: rangeTasks.filter(t => !t.completed).length,
        done: rangeTasks.filter(t => t.completed).length,
    };
  }, [tasks, dateFilter, filterDate]);

  const handleExport = () => {
    const exportData = {
        version: 2,
        exportDate: new Date().toISOString(),
        tasks: tasks,
        quickNotes: quickNotes
    };
    const dataStr = JSON.stringify(exportData, null, 2);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        let tasksToImport: Task[] = [];
        let notesToImport: QuickNote[] = [];
        if (Array.isArray(data)) {
            tasksToImport = data;
        } else if (data.tasks || data.quickNotes) {
            tasksToImport = data.tasks || [];
            notesToImport = data.quickNotes || [];
        } else {
            throw new Error("Invalid format");
        }
        if (window.confirm(`确认导入 ${tasksToImport.length} 个任务和 ${notesToImport.length} 条闪念吗？`)) {
            onImport?.(tasksToImport, notesToImport);
            alert('导入成功！');
        }
      } catch (error) {
        console.error(error);
        alert('文件格式错误。');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
    for (let i = 0; i < firstDay; i++) days.push(<div key={`pad-${i}`} className="aspect-square" />);
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
                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20'
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10'
            }
          `}
        >
          <span className={`text-base font-medium ${isToday && !isSelected ? 'text-blue-600 dark:text-blue-400' : isSelected ? 'text-white' : 'text-slate-600 dark:text-gray-300'}`}>{d}</span>
          <span className={`text-[10px] transform scale-90 origin-center
                ${lunarInfo.festival 
                    ? (isSelected ? 'text-white font-bold' : 'text-red-500 dark:text-red-400 font-medium') 
                    : lunarInfo.term 
                        ? (isSelected ? 'text-blue-100' : 'text-emerald-600 dark:text-emerald-400') 
                        : (isSelected ? 'text-gray-200' : 'text-slate-400 dark:text-gray-500')
                }
          `}>
              {lunarInfo.festival || lunarInfo.term || lunarInfo.lunar}
          </span>
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

  const renderDateSelectionPopup = () => {
    if (!isDatePickerOpen) return null;
    const currentYear = popupViewDate.getFullYear();
    const currentMonthIdx = popupViewDate.getMonth();

    if (dateFilter === 'day' || dateFilter === 'week') {
        const daysInPopupMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
        const firstDayPopup = new Date(currentYear, currentMonthIdx, 1).getDay();
        const calendarDays = [];
        for (let i = 0; i < firstDayPopup; i++) calendarDays.push(null);
        for (let i = 1; i <= daysInPopupMonth; i++) calendarDays.push(i);

        const handlePopupMonthChange = (delta: number) => {
            const newDate = new Date(popupViewDate);
            newDate.setMonth(newDate.getMonth() + delta);
            setPopupViewDate(newDate);
        };

        return (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-4 z-[100] w-80 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => handlePopupMonthChange(-1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-gray-400 hover:text-black dark:hover:text-white"><ChevronLeft size={20} /></button>
                    <span className="text-slate-800 dark:text-white font-bold text-lg font-mono">
                        {popupViewDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                    </span>
                    <button onClick={() => handlePopupMonthChange(1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-gray-400 hover:text-black dark:hover:text-white"><ChevronRight size={20} /></button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 dark:text-gray-500 mb-2">
                    <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                    {calendarDays.map((day, idx) => {
                        if (day === null) return <div key={idx} />;
                        
                        const d = new Date(currentYear, currentMonthIdx, day);
                        const dateStr = d.toLocaleDateString('en-CA');
                        const isToday = new Date().toDateString() === d.toDateString();
                        const isSelected = isDateInRunge(dateStr, dateFilter, filterDate);
                        const lunarInfo = getLunarDate(dateStr);

                        let weekStyle = "";
                        if (dateFilter === 'week' && isSelected) {
                            weekStyle = "bg-blue-100/50 dark:bg-blue-600/20"; 
                            const colIdx = idx % 7;
                            if (colIdx === 1) weekStyle += " rounded-l-lg";
                            if (colIdx === 0) weekStyle += " rounded-r-lg";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    setFilterDate(d);
                                    setIsDatePickerOpen(false);
                                }}
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all
                                    ${isSelected 
                                        ? 'bg-blue-600 text-white z-10' 
                                        : isToday 
                                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30' 
                                            : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10'
                                    }
                                `}
                            >
                                <span className="text-sm font-medium">{day}</span>
                                <span className={`text-[9px] transform scale-90 origin-center mt-[-2px]
                                    ${lunarInfo.festival 
                                        ? (isSelected ? 'text-white font-bold' : 'text-red-500 dark:text-red-400 font-medium') 
                                        : lunarInfo.term 
                                            ? (isSelected ? 'text-blue-100' : 'text-emerald-600 dark:text-emerald-400') 
                                            : (isSelected ? 'text-blue-200/70' : 'text-slate-400 dark:text-gray-500')
                                    }
                                `}>
                                    {lunarInfo.festival || lunarInfo.term || lunarInfo.lunar}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/10 text-center">
                     <button 
                        onClick={() => { setFilterDate(new Date()); setIsDatePickerOpen(false); }} 
                        className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                     >
                        回到今天
                     </button>
                </div>
            </div>
        );
    }

    if (dateFilter === 'year') {
        return (
             <div className="absolute top-full mt-2 left-0 bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-3 z-[100] w-64 animate-in zoom-in-95 duration-200">
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map(y => (
                        <button
                            key={y}
                            onClick={() => {
                                const d = new Date(filterDate);
                                d.setFullYear(y);
                                setFilterDate(d);
                                setIsDatePickerOpen(false);
                            }}
                            className={`p-2 rounded text-sm ${y === currentYear ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300'}`}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (dateFilter === 'month') {
        return (
             <div className="absolute top-full mt-2 left-0 bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-3 z-[100] w-64 animate-in zoom-in-95 duration-200">
                <div className="space-y-2">
                     <div className="flex items-center justify-between mb-2 px-1">
                        <button onClick={() => setFilterDate(new Date(filterDate.setFullYear(filterDate.getFullYear()-1)))} className="text-slate-400 hover:text-black dark:hover:text-white">&lt;</button>
                        <span className="font-bold text-slate-800 dark:text-white">{filterDate.getFullYear()}</span>
                        <button onClick={() => setFilterDate(new Date(filterDate.setFullYear(filterDate.getFullYear()+1)))} className="text-slate-400 hover:text-black dark:hover:text-white">&gt;</button>
                     </div>
                     <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 12 }, (_, i) => i).map(m => (
                            <button
                                key={m}
                                onClick={() => {
                                    const d = new Date(filterDate);
                                    d.setMonth(m);
                                    setFilterDate(d);
                                    setIsDatePickerOpen(false);
                                }}
                                className={`p-2 rounded text-xs ${m === filterDate.getMonth() ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300'}`}
                            >
                                {m+1}月
                            </button>
                        ))}
                     </div>
                </div>
            </div>
        );
    }

    return null;
  };

  // Sort the tasks selected in the calendar detail view
  const calendarSelectedTasks = useMemo(() => {
      if (!selectedDate) return [];
      const rawTasks = tasks.filter(t => t.date === selectedDate);
      return applySystemSort(rawTasks);
  }, [tasks, selectedDate, sortConfig]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="历史回顾与分析" className="max-w-5xl h-[85vh] flex flex-col">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        {/* View Switcher */}
        <div className="flex bg-slate-100/80 dark:bg-black/20 p-1 rounded-xl border border-slate-200 dark:border-white/10 self-start">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${viewMode === 'list' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm dark:shadow-lg dark:shadow-blue-900/20' : 'text-slate-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}
            `}
          >
            <List size={16} /> 列表视图
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${viewMode === 'calendar' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm dark:shadow-lg dark:shadow-blue-900/20' : 'text-slate-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}
            `}
          >
            <CalendarIcon size={16} /> 日历视图
          </button>
        </div>

        {/* Data Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="px-3 py-2 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 mr-2 hidden md:flex shadow-sm dark:shadow-none">
                <Database size={14} />
                <span>本地: {tasks.length} 任务 / {quickNotes.length} 闪念</span>
            </div>
            <button
                onClick={handleExport}
                className="px-3 py-2 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all flex items-center gap-2 shadow-sm dark:shadow-none"
                title="导出数据备份"
            >
                <Download size={16} /> 导出
            </button>
            <label className="px-3 py-2 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm dark:shadow-none">
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

      <div className="flex-1 flex flex-col min-h-0 relative">
        {viewMode === 'list' ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-4 p-1 shrink-0 z-50 relative">
                
                {/* Date Range Filter & Navigation */}
                <div className="flex flex-col items-start gap-3">
                    {/* Filter Type Tabs */}
                    <div className="flex bg-slate-100/80 dark:bg-black/20 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                        {(['day', 'week', 'month', 'year'] as DateRangeFilter[]).map(r => (
                            <button
                                key={r}
                                onClick={() => { setDateFilter(r); setFilterDate(new Date()); setIsDatePickerOpen(false); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                                    ${dateFilter === r ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-300 ring-1 ring-black/5 dark:ring-white/20 shadow-sm' : 'text-slate-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}
                                `}
                            >
                                {DATE_FILTER_LABELS[r]}
                            </button>
                        ))}
                    </div>

                    <div className="relative z-20">
                        <div className="flex items-center bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-1 shadow-sm dark:shadow-none">
                            <button onClick={handlePrevRange} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md text-slate-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            
                            <button 
                                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                className="px-3 text-sm font-mono text-blue-600 dark:text-blue-100 min-w-[120px] text-center select-none hover:bg-slate-100 dark:hover:bg-white/5 rounded transition-colors flex items-center justify-center gap-2"
                            >
                                <CalendarDays size={14} className="opacity-70" />
                                {getRangeLabel()}
                            </button>

                            <button onClick={handleNextRange} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md text-slate-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        
                        {renderDateSelectionPopup()}
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex bg-slate-100/80 dark:bg-black/20 p-1 rounded-xl border border-slate-200 dark:border-white/10 overflow-x-auto custom-scrollbar self-start">
                    {(['all', 'todo', 'done'] as StatusFilter[]).map(f => (
                        <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap
                            ${statusFilter === f ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}
                        `}
                        >
                        {f === 'all' && <BarChart3 size={16} />}
                        {f === 'todo' && <Circle size={16} />}
                        {f === 'done' && <CheckCircle2 size={16} />}
                        <span>{FILTER_LABELS[f]}</span>
                        <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === f ? 'bg-slate-100 dark:bg-white/20' : 'bg-slate-200/50 dark:bg-white/5'}`}>
                            {stats[f]}
                        </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 z-0 relative">
                {filteredListTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-gray-500">
                         <div className="p-4 rounded-full bg-slate-100 dark:bg-white/5 mb-3">
                            <List size={32} className="opacity-50 dark:opacity-20" />
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
               <div className="flex items-center justify-between mb-4 px-2 bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
                 <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-gray-300 transition-colors">←</button>
                 <h3 className="text-lg font-bold text-slate-700 dark:text-white">
                   {currentMonth.toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' })}
                 </h3>
                 <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-gray-300 transition-colors">→</button>
               </div>
               <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-medium text-slate-400 dark:text-gray-400 uppercase tracking-wider py-2">
                 <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-7 gap-2 pr-1 auto-rows-fr">
                        {renderCalendar()}
                    </div>
               </div>
            </div>

            {/* Selected Date Details */}
            <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-4 flex flex-col h-full overflow-hidden shadow-sm dark:shadow-none">
              <h3 className="text-md font-bold text-slate-700 dark:text-white mb-4 border-b border-slate-200 dark:border-white/10 pb-3 flex items-center justify-between">
                 <span>{selectedDate ? new Date(selectedDate).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }) : '任务详情'}</span>
                 {selectedDate && (
                   <span className="px-2 py-1 rounded-md bg-blue-50 dark:bg-white/10 text-xs text-blue-600 dark:text-blue-200 border border-blue-100 dark:border-transparent">
                     {tasks.filter(t => t.date === selectedDate).length} 个任务
                   </span>
                 )}
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                {selectedDate ? (
                   calendarSelectedTasks.length > 0 ? (
                     calendarSelectedTasks.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onUpdate={onUpdate} 
                            onDelete={onDelete}
                            noStrikethrough={true} 
                            variant="history"
                            onEdit={onEditTask}
                        />
                     ))
                   ) : (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-gray-500">
                        <p>当日无任务</p>
                     </div>
                   )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-gray-500 text-center p-6">
                    <CalendarIcon size={48} className="mb-4 opacity-20 dark:opacity-10" />
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
