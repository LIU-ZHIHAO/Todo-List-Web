
import React, { useEffect, useState, useMemo } from 'react';
import { Plus, History as HistoryIcon, CheckCircle2, Sparkles, Zap, LayoutGrid, Info, Trash2, Settings, Sun, Moon, HelpCircle } from 'lucide-react';
import { Task, Quadrant, QuickNote, QUADRANT_INFO, SortConfig } from './types';
import { dbService } from './services/db';
import { TaskCard } from './components/TaskCard';
import { AddTaskModal } from './components/AddTaskModal';
import { HistoryModal } from './components/HistoryModal';
import { AuthorModal } from './components/AuthorModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';

const APP_VERSION = '1.1.0';

// Helper component for floating items with delete logic
const AmbientStreamItem = ({ id, content, type, onDelete }: { id?: string, content: string; type: 'note' | 'task', onDelete?: (id: string) => void }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id || !onDelete) return;
    setIsDeleting(true);
    // Delay actual delete to show animation
    setTimeout(() => {
      onDelete(id);
    }, 500);
  };

  return (
    <div className={`
      mb-6 p-4 rounded-lg backdrop-blur-sm border transition-all duration-300 group relative shadow-sm
      ${isDeleting ? 'animate-shake bg-red-50 border-red-200 dark:bg-red-500/20 dark:border-red-500/50' : 'transform hover:scale-105'}
      ${type === 'note' 
        ? 'bg-purple-50/80 border-purple-200 text-purple-800 dark:bg-purple-500/5 dark:border-purple-500/20 dark:text-purple-200/70 dark:shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:bg-purple-100 dark:hover:bg-purple-500/10' 
        : 'bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-500/5 dark:border-emerald-500/20 dark:text-emerald-200/70 dark:shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-emerald-100 dark:hover:bg-emerald-500/10'
      }
    `}>
      <div className="flex items-start gap-3">
        {type === 'note' ? <Sparkles size={14} className="mt-1 opacity-60 shrink-0" /> : <CheckCircle2 size={14} className="mt-1 opacity-60 shrink-0" />}
        <p className="text-xs font-medium leading-relaxed line-clamp-4 text-ellipsis overflow-hidden tracking-wide flex-1 transition-all duration-300 group-hover:pr-6">{content}</p>
      </div>
      
      {/* Delete Button for Notes */}
      {type === 'note' && onDelete && (
        <button 
          onClick={handleDelete}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
          title="删除闪念"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

// Scrolling Item Component for Center Stream - Pure Display
const ScrollingItem = ({ text }: { text: string }) => {
    return (
        <div className="w-full flex justify-center px-4 group relative">
            <div className="relative max-w-full flex items-center">
                <span className={`
                    text-sm font-medium py-1.5 tracking-wide px-5 rounded-full border whitespace-nowrap overflow-hidden text-ellipsis shadow-sm transition-all duration-300
                    bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md
                    dark:text-white/90 dark:bg-white/[0.05] dark:border-white/10 dark:hover:bg-white/15 dark:backdrop-blur-sm
                `}>
                    {text}
                </span>
            </div>
        </div>
    );
}

const DEMO_QUOTES = [
    "生活不是等待暴风雨过去，而是学会在雨中跳舞。",
    "种一棵树最好的时间是十年前，其次是现在。",
    "你必须非常努力，才能看起来毫不费力。",
    "未经审视的人生是不值得过的。",
    "星光不问赶路人，时光不负有心人。",
    "保持饥饿，保持愚蠢。",
    "只有偏执狂才能生存。",
    "在这个世界上，没有所谓的失败，只有暂时的停止成功。",
    "你的时间有限，所以不要为别人而活。",
    "简单是终极的复杂。",
    "唯有爱与美食不可辜负。",
    "既然选择了远方，便只顾风雨兼程。",
    "每一个不曾起舞的日子，都是对生命的辜负。",
    "凡是过往，皆为序章。",
    "满地都是六便士，他却抬头看见了月亮。",
    "我们终此一生，就是要摆脱他人的期待，找到真正的自己。",
    "拥有就是失去的开始。",
    "不要温和地走进那个良夜。",
    "人的一切痛苦，本质上都是对自己无能的愤怒。",
    "所谓自由，不是随心所欲，而是自我主宰。"
];

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try { return crypto.randomUUID(); } catch (e) {}
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
};

// New Energy Core Button
const TechButton = ({ onClick, icon: Icon, label, colorClass, ringClass, glowClass }: any) => (
  <button 
    onClick={onClick} 
    className="group pointer-events-auto relative w-14 h-14 flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 flex-shrink-0"
  >
     {/* Text Label (Top) */}
     <div className={`absolute -top-9 left-1/2 -translate-x-1/2 text-sm font-normal tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap ${glowClass} text-slate-700 dark:text-white drop-shadow-md pointer-events-none bg-white/80 dark:bg-transparent px-2 py-0.5 rounded-full backdrop-blur-sm`}>
        {label}
     </div>
     
     {/* Connecting Line */}
     <div className={`absolute -top-2 left-1/2 w-px h-2 ${colorClass} opacity-0 group-hover:opacity-40 transition-opacity duration-300`} />

     {/* Outer Rotating Ring */}
     <div className={`absolute inset-0 rounded-full border border-dashed ${ringClass} opacity-30 group-hover:opacity-60 animate-[spin_10s_linear_infinite]`} />
     
     {/* Inner Counter-Rotating Ring */}
     <div className={`absolute inset-[-2px] rounded-full border-l-2 border-r-2 border-t-transparent border-b-transparent ${ringClass} opacity-40 group-hover:opacity-80 animate-[spin_3s_linear_infinite_reverse]`} />
     
     {/* Core Background */}
     <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${colorClass} opacity-90 group-hover:opacity-100 shadow-lg shadow-current group-hover:shadow-xl transition-all duration-500`}></div>
     
     {/* Icon */}
     <Icon size={20} className="relative z-10 text-white drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
  </button>
);

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
      if (typeof window !== 'undefined') {
          return localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
      }
      return 'dark';
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialQuadrant, setInitialQuadrant] = useState<Quadrant | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [quickNoteInput, setQuickNoteInput] = useState('');
  
  // Sorting Config State
  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    const saved = localStorage.getItem('sortConfig');
    return saved ? JSON.parse(saved) : { mode: 'custom', direction: 'asc' };
  });

  // Drag State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<Quadrant | null>(null);

  // Apply Theme Class
  useEffect(() => {
      const root = window.document.documentElement;
      if (theme === 'dark') {
          root.classList.add('dark');
      } else {
          root.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const fetchAllData = async () => {
    try {
      const [tasksData, notesData] = await Promise.all([
        dbService.getAllTasks(),
        dbService.getAllQuickNotes()
      ]);
      
      const tasksWithOrder = tasksData.map(t => {
          if (typeof t.order !== 'number') {
              const migrated = { ...t, order: t.createdAt };
              dbService.updateTask(migrated); 
              return migrated;
          }
          return t;
      });

      setTasks(tasksWithOrder);
      setQuickNotes(notesData.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Persist Sort Config
  useEffect(() => {
    localStorage.setItem('sortConfig', JSON.stringify(sortConfig));
  }, [sortConfig]);

  const withSaveStatus = async (operation: Promise<void>) => {
    setSaveStatus('saving');
    try {
      await operation;
      setTimeout(() => setSaveStatus('saved'), 800);
    } catch (e) {
      console.error(e);
      setSaveStatus('saved');
    }
  };

  // Task CRUD
  const handleSaveTask = async (task: Task) => {
    if (editingTask) {
        await withSaveStatus(dbService.updateTask(task));
        setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    } else {
        await withSaveStatus(dbService.addTask(task));
        setTasks(prev => [task, ...prev]);
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setInitialQuadrant(null);
  };

  const handleTaskDelete = async (id: string) => {
    await withSaveStatus(dbService.deleteTask(id));
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    await withSaveStatus(dbService.updateTask(updatedTask));
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleImportData = async (importedTasks: Task[], importedNotes: QuickNote[]) => {
    setSaveStatus('saving');
    try {
      // Import Tasks
      if (importedTasks && importedTasks.length > 0) {
          for (const task of importedTasks) {
            await dbService.updateTask(task);
          }
      }
      
      // Import Notes
      if (importedNotes && importedNotes.length > 0) {
          for (const note of importedNotes) {
            try {
                await dbService.addQuickNote(note);
            } catch (e) {
                // Ignore duplicate key errors
            }
          }
      }

      await fetchAllData();
      setTimeout(() => setSaveStatus('saved'), 800);
    } catch (e) {
      console.error("Import failed", e);
      setSaveStatus('saved');
    }
  };

  const openEditModal = (task: Task) => {
      setEditingTask(task);
      setInitialQuadrant(null);
      setIsTaskModalOpen(true);
  };

  const openAddModal = (quadrant?: Quadrant) => {
      setEditingTask(null);
      setInitialQuadrant(quadrant || null);
      setIsTaskModalOpen(true);
  };

  // Quick Notes
  const handleQuickNoteSubmit = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!quickNoteInput.trim()) return;
      const newNote: QuickNote = {
        id: generateId(),
        content: quickNoteInput.trim(),
        createdAt: Date.now(),
      };
      await withSaveStatus(dbService.addQuickNote(newNote));
      setQuickNotes(prev => [newNote, ...prev]);
      setQuickNoteInput('');
    }
  };

  const handleDeleteQuickNote = async (id: string) => {
    await withSaveStatus(dbService.deleteQuickNote(id));
    setQuickNotes(prev => prev.filter(n => n.id !== id));
  };

  // --- Sort Logic ---
  const getSortedTasks = (list: Task[]) => {
      const { mode, direction } = sortConfig;
      
      return [...list].sort((a, b) => {
          if (mode === 'custom') {
              return a.order - b.order;
          }

          if (mode === 'created') {
              return direction === 'asc' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
          }

          if (mode === 'progress') {
              // Primary: Progress
              if (a.progress !== b.progress) {
                  return direction === 'asc' ? a.progress - b.progress : b.progress - a.progress;
              }
              // Secondary: Order
              return a.order - b.order;
          }

          return a.order - b.order;
      });
  };

  const quadrants = useMemo(() => {
    const q1 = getSortedTasks(tasks.filter(t => t.quadrant === Quadrant.Q1 && !t.completed));
    const q2 = getSortedTasks(tasks.filter(t => t.quadrant === Quadrant.Q2 && !t.completed));
    const q3 = getSortedTasks(tasks.filter(t => t.quadrant === Quadrant.Q3 && !t.completed));
    const q4 = getSortedTasks(tasks.filter(t => t.quadrant === Quadrant.Q4 && !t.completed));
    return { [Quadrant.Q1]: q1, [Quadrant.Q2]: q2, [Quadrant.Q3]: q3, [Quadrant.Q4]: q4 };
  }, [tasks, sortConfig]);

  // --- Drag & Drop Logic ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
      setDraggedTaskId(id);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, q: Quadrant) => {
      e.preventDefault();
      setDragOverQuadrant(q);
  };

  const handleDrop = async (e: React.DragEvent, targetQuadrant: Quadrant, targetTaskId?: string, position?: 'top' | 'bottom') => {
      e.preventDefault();
      setDragOverQuadrant(null);
      if (!draggedTaskId) return;
      
      const originalTask = tasks.find(t => t.id === draggedTaskId);
      if (!originalTask) return;

      const targetList = quadrants[targetQuadrant]; 
      let newOrder = originalTask.order;

      if (targetTaskId && targetTaskId !== draggedTaskId && position) {
          const targetIndex = targetList.findIndex(t => t.id === targetTaskId);
          const targetTask = targetList[targetIndex];
          
          if (targetIndex !== -1) {
              if (position === 'top') {
                  const prevTask = targetIndex > 0 ? targetList[targetIndex - 1] : null;
                  if (prevTask) {
                       newOrder = (prevTask.order + targetTask.order) / 2;
                  } else {
                       newOrder = targetTask.order - 10000;
                  }
              } else {
                  const nextTask = targetIndex < targetList.length - 1 ? targetList[targetIndex + 1] : null;
                  if (nextTask) {
                      newOrder = (targetTask.order + nextTask.order) / 2;
                  } else {
                      newOrder = targetTask.order + 10000;
                  }
              }
          }
      } else if (!targetTaskId) {
          const allInQuad = tasks.filter(t => t.quadrant === targetQuadrant);
          const maxOrder = allInQuad.length > 0 ? Math.max(...allInQuad.map(t => t.order)) : 0;
          newOrder = maxOrder + 10000;
      }

      const updatedTask = { 
          ...originalTask, 
          quadrant: targetQuadrant,
          order: newOrder
      };

      setTasks(prev => prev.map(t => t.id === draggedTaskId ? updatedTask : t));
      setDraggedTaskId(null);
      await dbService.updateTask(updatedTask);
  };

  // Ambient Stream
  const streamItems = useMemo(() => {
    const completed = tasks.filter(t => t.completed).map(t => ({ id: t.id, content: t.title, type: 'task' as const }));
    const notes = quickNotes.map(n => ({ id: n.id, content: n.content, type: 'note' as const }));
    return [...completed, ...notes].sort(() => Math.random() - 0.5);
  }, [tasks, quickNotes]);
  
  const leftStream = useMemo(() => streamItems.filter((_, i) => i % 2 === 0), [streamItems]);
  const rightStream = useMemo(() => streamItems.filter((_, i) => i % 2 !== 0), [streamItems]);
  
  const scrollingNotes = useMemo(() => {
    const contentSource = quickNotes.length > 0 
        ? quickNotes.map(n => ({ id: n.id, content: n.content })) 
        : DEMO_QUOTES.map((q, i) => ({ id: `demo-${i}`, content: q }));
    
    let items = [...contentSource];
    while (items.length < 20) items = [...items, ...contentSource]; 
    return items.slice(0, 60);
  }, [quickNotes]);

  const renderQuadrant = (q: Quadrant) => {
    const info = QUADRANT_INFO[q];
    const qTasks = quadrants[q];
    const isOver = dragOverQuadrant === q;

    return (
      <div 
        onClick={() => openAddModal(q)}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => handleDragEnter(e, q)}
        onDrop={(e) => handleDrop(e, q)}
        className={`flex flex-col h-full rounded-2xl border backdrop-blur-sm p-4 transition-all duration-300 group relative overflow-hidden cursor-pointer
          ${isOver 
             ? `border-${info.color.split('-')[1]}-400 shadow-lg scale-[1.01] ${info.bgColor.replace('/80', '/90')} dark:bg-${info.color.split('-')[1]}-900/30` 
             : `${info.bgColor} ${info.borderColor} hover:shadow-md hover:scale-[1.005]`
          }
        `}
      >
        {/* Active Drop Glow */}
        {isOver && <div className={`absolute inset-0 bg-${info.color.split('-')[1]}-500/10 pointer-events-none z-0 animate-pulse`} />}

        <div className="flex items-center justify-between mb-2 relative z-10 flex-shrink-0 pointer-events-none">
          <div>
            <h2 className="text-2xl font-bold tracking-tight relative">
               <span className={`absolute -inset-1 blur-md ${info.color} opacity-10 dark:opacity-20`}></span>
               {/* Title Color: Uses specific quadrant color text for clean visibility */}
               <span className={`relative ${info.color}`}>{info.label}</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 font-medium tracking-wide">{info.description}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-white/60 dark:bg-white/10 ${info.color} border border-white/30 dark:border-white/5 shadow-sm`}>
            {qTasks.length}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1 relative z-10 pb-2">
          {qTasks.length === 0 && !isOver ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-500/40 border-2 border-dashed border-slate-300/50 dark:border-gray-500/10 rounded-xl p-4 select-none transition-colors">
              <Plus size={24} className="mb-2 opacity-50" />
              <span className="text-xs font-medium">点击空白处新建任务</span>
            </div>
          ) : (
            <>
                {qTasks.map(task => (
                <div key={task.id} onClick={(e) => e.stopPropagation()} className="cursor-auto transform transition-transform duration-200 hover:scale-[1.01]">
                    <TaskCard 
                        task={task} 
                        onUpdate={handleTaskUpdate} 
                        onDelete={handleTaskDelete} 
                        onEdit={openEditModal}
                        draggable={true}
                        onDragStart={handleDragStart}
                        onDrop={(e, targetId, pos) => handleDrop(e, q, targetId, pos)}
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
        
        {/* Gradient Overlay: Subtle in Light Mode */}
        <div className={`absolute inset-0 pointer-events-none bg-gradient-to-br from-white/0 to-white/0 dark:${info.gradient} opacity-100 transition-opacity duration-700`}></div>
      </div>
    );
  };

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans text-slate-800 dark:text-slate-100 selection:bg-blue-500/30 flex flex-col">
      
      {/* Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
        {/* Light Mode: Solid soft background / Dark Mode: Deep gradient */}
        <div className="absolute inset-0 bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-[#131c35] dark:to-slate-900 opacity-100 dark:opacity-80"></div>
        
        {/* Blobs - Very subtle in Light Mode (Pastels) */}
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-200/30 dark:bg-purple-600/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-[80px] dark:blur-[100px] opacity-40 dark:opacity-60 animate-blob transition-colors duration-500"></div>
        <div className="absolute top-1/4 right-[-10%] w-[35rem] h-[35rem] bg-indigo-200/30 dark:bg-indigo-600/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-[80px] dark:blur-[100px] opacity-30 dark:opacity-50 animate-blob animation-delay-2000 transition-colors duration-500"></div>
        <div className="absolute -bottom-32 left-20 w-[45rem] h-[45rem] bg-emerald-100/30 dark:bg-blue-600/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-[80px] dark:blur-[100px] opacity-40 dark:opacity-60 animate-blob animation-delay-4000 transition-colors duration-500"></div>
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIvPjwvc3ZnPg==')] pointer-events-none"></div>
      </div>

      <div className="flex flex-1 h-full overflow-hidden">
        
        {/* Left Ambient Stream */}
        <aside className="hidden xl:block w-[12.5%] h-full overflow-hidden relative border-r border-slate-200 dark:border-white/5 bg-white/40 dark:bg-slate-900/20 flex-shrink-0 transition-colors duration-500">
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-slate-50 dark:from-[#0f172a] to-transparent z-10 pointer-events-none transition-colors"></div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 dark:from-[#0f172a] to-transparent z-10 pointer-events-none transition-colors"></div>
          <div className="absolute w-full py-10 animate-float-up hover-pause px-3 space-y-6 opacity-80 hover:opacity-100 transition-opacity duration-500">
             {[...leftStream, ...leftStream, ...leftStream].map((item, i) => (
                <AmbientStreamItem 
                    key={`l-${i}`} 
                    {...item} 
                    onDelete={item.type === 'note' ? handleDeleteQuickNote : undefined} 
                />
             ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-[75%] max-w-[75%] flex flex-col h-full relative z-10 transition-colors duration-500">
           
           {/* Top Section */}
           <div className="h-[34%] flex flex-col w-full relative pb-4">
               
               {/* 1. Header */}
               <header className="flex-shrink-0 flex items-center justify-center px-8 relative z-20 h-10 mb-1 pt-4">
                  <div className="flex items-center gap-2 group cursor-default">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-md dark:shadow-[0_0_20px_rgba(59,130,246,0.4)] ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-300">
                          <LayoutGrid size={18} className="text-white" />
                      </div>
                      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-blue-700 to-slate-600 dark:from-white dark:via-blue-100 dark:to-gray-300 tracking-tight drop-shadow-sm dark:drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                        四象限清单
                      </h1>
                  </div>

                  {/* Right Header Controls */}
                  <div className="absolute right-8 top-1/2 translate-y-1 flex items-center gap-3">
                    
                    {/* Theme Switcher */}
                    <button 
                        onClick={toggleTheme} 
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-white/5 transition-colors" 
                        title={theme === 'dark' ? "切换亮色模式" : "切换深色模式"}
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    {/* Help Button */}
                    <button 
                        onClick={() => setIsHelpOpen(true)} 
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-white/5 transition-colors" 
                        title="使用说明"
                    >
                        <HelpCircle size={16} />
                    </button>

                    <button onClick={() => setIsAuthorModalOpen(true)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-white/5 transition-colors" title="志豪的设计作品">
                        <Info size={16} />
                    </button>
                    
                    <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-white/5 transition-colors" title="系统设置">
                        <Settings size={16} />
                    </button>
                    
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/80 border border-slate-200 dark:bg-black/20 dark:border-white/5 backdrop-blur-sm shadow-sm">
                        {saveStatus === 'saving' ? (
                           <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
                        ) : (
                           <CheckCircle2 size={12} className="text-emerald-500 dark:text-emerald-400 shadow-sm dark:shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                        )}
                        <span className="text-[10px] text-slate-500 dark:text-gray-400 font-medium tracking-wide">
                          {saveStatus === 'saving' ? '同步中...' : '已同步'}
                        </span>
                    </div>
                  </div>
               </header>

               {/* 2. Bottom Control Row */}
               <div className="flex-1 flex items-end justify-between px-8 lg:px-16 gap-4 overflow-hidden pb-4">
                    
                    {/* Left Button */}
                    <div className="mb-1">
                        <TechButton 
                            onClick={() => openAddModal()} 
                            icon={Plus} 
                            label="新建任务"
                            colorClass="from-cyan-500 to-blue-600"
                            ringClass="border-cyan-400"
                            glowClass="text-cyan-700 dark:text-cyan-200"
                        />
                    </div>
                    
                    {/* Center Column: Input & Stream */}
                    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto gap-3 z-20 self-center">
                        
                         {/* Input */}
                        <div className="w-full relative group">
                            <div className="absolute inset-y-0 left-4 pl-1 flex items-center pointer-events-none">
                                <Zap size={18} className="text-yellow-500 dark:text-yellow-400 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-300 transition-colors drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                            </div>
                            <input 
                                type="text" 
                                value={quickNoteInput}
                                onChange={(e) => setQuickNoteInput(e.target.value)}
                                onKeyDown={handleQuickNoteSubmit}
                                placeholder="捕捉闪念... (Enter)"
                                className="w-full h-12 bg-white/80 border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm dark:shadow-lg backdrop-blur-md"
                            />
                        </div>

                        {/* Stream - No delete here */}
                        <div className="w-full h-[12.5rem] relative overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] flex items-center hover-pause">
                             <div className="w-full animate-scroll-vertical flex flex-col items-center space-y-3" style={{ animationDuration: '80s' }}>
                                {[...scrollingNotes, ...scrollingNotes].map((item, i) => (
                                    <ScrollingItem 
                                        key={i} 
                                        text={item.content} 
                                    />
                                ))}
                             </div>
                        </div>
                    </div>

                    {/* Right Button */}
                    <div className="mb-1">
                        <TechButton 
                            onClick={() => setIsHistoryOpen(true)} 
                            icon={HistoryIcon} 
                            label="历史记录"
                            colorClass="from-violet-500 to-fuchsia-600"
                            ringClass="border-violet-400"
                            glowClass="text-violet-700 dark:text-violet-200"
                        />
                    </div>
               </div>
           </div>

           {/* Bottom Section: Quadrants */}
           <div className="h-[66%] p-6 pt-0 overflow-hidden">
               {/* Quadrant Container Background: Transparent/Subtle to let quadrant colors shine */}
               <div className="h-full rounded-3xl border border-slate-200 dark:border-white/5 bg-white/20 dark:bg-black/20 p-1 shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-500">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-400 gap-2">
                         <div className="w-5 h-5 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                         <span>数据加载中...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 h-full">
                      {renderQuadrant(Quadrant.Q2)}
                      {renderQuadrant(Quadrant.Q1)}
                      {renderQuadrant(Quadrant.Q3)}
                      {renderQuadrant(Quadrant.Q4)}
                    </div>
                  )}
               </div>
           </div>
        </main>

        {/* Right Ambient Stream */}
        <aside className="hidden xl:block w-[12.5%] h-full overflow-hidden relative border-l border-slate-200 dark:border-white/5 bg-white/40 dark:bg-slate-900/20 flex-shrink-0 transition-colors duration-500">
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-slate-50 dark:from-[#0f172a] to-transparent z-10 pointer-events-none transition-colors"></div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 dark:from-[#0f172a] to-transparent z-10 pointer-events-none transition-colors"></div>
          <div className="absolute w-full py-10 animate-float-down hover-pause px-3 space-y-6 opacity-80 hover:opacity-100 transition-opacity duration-500">
             {[...rightStream, ...rightStream, ...rightStream].map((item, i) => (
                <AmbientStreamItem 
                    key={`r-${i}`} 
                    {...item} 
                    onDelete={item.type === 'note' ? handleDeleteQuickNote : undefined} 
                />
             ))}
          </div>
        </aside>

      </div>

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        tasks={tasks}
        quickNotes={quickNotes}
        onDelete={handleTaskDelete}
        onUpdate={handleTaskUpdate}
        onImport={handleImportData}
        onEditTask={openEditModal}
        sortConfig={sortConfig}
      />

      <AuthorModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        version={APP_VERSION}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={sortConfig}
        onUpdate={(newConfig) => setSortConfig(newConfig)}
      />
      
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <AddTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSave={handleSaveTask}
        initialTask={editingTask}
        initialQuadrant={initialQuadrant}
        zIndex="z-[60]"
      />

    </div>
  );
}
