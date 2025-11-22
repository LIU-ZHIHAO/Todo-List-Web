import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, History as HistoryIcon, CheckCircle2, LayoutGrid, Info, Settings, Sun, Moon, HelpCircle } from 'lucide-react';
import { Task, Quadrant, SortConfig, StreamConfig, QuickNote, Tag } from './types';
import { TAG_COLORS, TAG_BORDER_COLORS, QUADRANT_INFO } from './constants/theme';
import { DEMO_QUOTES } from './constants/data';
import { generateId, checkIsOverdue } from './utils/helpers';
import { AddTaskModal } from './components/AddTaskModal';
import { TaskCard } from './components/TaskCard';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { AuthorModal } from './components/AuthorModal';
import { InputArea } from './components/InputArea';
import { SideStream } from './components/SideStream';
import { QuadrantSection } from './components/QuadrantSection';
import { ScrollingItem } from './components/ScrollingItem';
import { useTasks } from './hooks/useTasks';
import { useDragDrop } from './hooks/useDragDrop';

const APP_VERSION = '1.2.0';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    }
    return 'dark';
  });

  const {
    tasks,
    quickNotes,
    loading,
    saveStatus,
    fetchInitialData,
    loadFullHistory,
    handleSaveTask,
    handleTaskDelete,
    handleTaskUpdate,
    handleImportData,
    handleClearData,
    handleAddQuickNote,
    handleDeleteQuickNote
  } = useTasks();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialQuadrant, setInitialQuadrant] = useState<Quadrant | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Sorting Config State
  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    const saved = localStorage.getItem('sortConfig');
    return saved ? JSON.parse(saved) : { mode: 'custom', direction: 'asc' };
  });

  // Stream Config State
  const [streamConfig, setStreamConfig] = useState<StreamConfig>(() => {
    const saved = localStorage.getItem('streamConfig');
    try {
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && typeof parsed.speed === 'string') {
        return { mode: parsed.mode, speed: 50 };
      }
      return parsed || { mode: 'scroll', speed: 50 };
    } catch (e) {
      return { mode: 'scroll', speed: 50 };
    }
  });

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
    setTheme((prev: 'dark' | 'light') => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Persist Configs
  useEffect(() => {
    localStorage.setItem('sortConfig', JSON.stringify(sortConfig));
  }, [sortConfig]);

  useEffect(() => {
    localStorage.setItem('streamConfig', JSON.stringify(streamConfig));
  }, [streamConfig]);

  const handleOpenHistory = () => {
    loadFullHistory();
    setIsHistoryOpen(true);
  };

  const openEditModal = useCallback((task: Task) => {
    setEditingTask(task);
    setInitialQuadrant(null);
    setIsTaskModalOpen(true);
  }, []);

  const openAddModal = (quadrant?: Quadrant) => {
    setEditingTask(null);
    setInitialQuadrant(quadrant || null);
    setIsTaskModalOpen(true);
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
        if (a.progress !== b.progress) {
          return direction === 'asc' ? a.progress - b.progress : b.progress - a.progress;
        }
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
  const {
    draggedTaskId,
    dragOverQuadrant,
    handleDragStart,
    handleDragEnter,
    handleDrop
  } = useDragDrop(tasks, handleTaskUpdate, quadrants);

  // Ambient Stream Logic
  const streamItems = useMemo(() => {
    const completed = tasks.filter(t => t.completed).map(t => ({ id: t.id, content: t.title, type: 'task' as const }));
    const notes = quickNotes.map(n => ({ id: n.id, content: n.content, type: 'note' as const }));
    const combined = [...completed, ...notes].sort(() => Math.random() - 0.5);

    if (combined.length === 0) return [];
    return combined.slice(0, 20);
  }, [tasks, quickNotes]);

  const leftStream = useMemo(() => streamItems.filter((_, i) => i % 2 === 0), [streamItems]);
  const rightStream = useMemo(() => streamItems.filter((_, i) => i % 2 !== 0), [streamItems]);

  const scrollingNotes = useMemo(() => {
    const contentSource = quickNotes.length > 0
      ? quickNotes.map(n => ({ id: n.id, content: n.content }))
      : DEMO_QUOTES.map((q, i) => ({ id: `demo-${i}`, content: q }));

    let items = [...contentSource];
    while (items.length < 10) items = [...items, ...contentSource];
    return items.slice(0, 15);
  }, [quickNotes]);

  const centerScrollDuration = useMemo(() => {
    const speed = typeof streamConfig.speed === 'number' ? streamConfig.speed : 50;
    const visualSpeed = speed * 0.5;
    const singleSetHeight = scrollingNotes.length * 48;
    return `${singleSetHeight / Math.max(1, visualSpeed)}s`;
  }, [scrollingNotes, streamConfig.speed]);

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans text-slate-800 dark:text-slate-100 selection:bg-blue-500/30 flex flex-col">

      {/* Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
        <div className="absolute inset-0 bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-[#131c35] dark:to-slate-900 opacity-100 dark:opacity-80"></div>

        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-200/30 dark:bg-purple-600/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-[80px] dark:blur-[100px] opacity-40 dark:opacity-60 animate-blob transition-colors duration-500"></div>
        <div className="absolute top-1/4 right-[-10%] w-[35rem] h-[35rem] bg-indigo-200/30 dark:bg-indigo-600/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-[80px] dark:blur-[100px] opacity-30 dark:opacity-50 animate-blob animation-delay-2000 transition-colors duration-500"></div>
        <div className="absolute -bottom-32 left-20 w-[45rem] h-[45rem] bg-emerald-100/30 dark:bg-blue-600/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-[80px] dark:blur-[100px] opacity-40 dark:opacity-60 animate-blob animation-delay-4000 transition-colors duration-500"></div>

        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIvPjwvc3ZnPg==')] pointer-events-none"></div>
      </div>

      <div className="flex flex-1 h-full overflow-hidden">

        {/* Left Ambient Stream */}
        <aside className={`hidden xl:block w-[12.5%] h-full overflow-hidden relative border-r border-slate-200 dark:border-white/5 bg-white/40 dark:bg-slate-900/20 flex-shrink-0 transition-colors duration-500 ${streamConfig.mode === 'hidden' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-slate-50 dark:from-[#0f172a] to-transparent z-10 pointer-events-none transition-colors"></div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 dark:from-[#0f172a] to-transparent z-10 pointer-events-none transition-colors"></div>
          <SideStream items={leftStream} isRight={false} config={streamConfig} onDeleteNote={handleDeleteQuickNote} />
        </aside>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col h-full relative z-10 transition-colors duration-500 ${streamConfig.mode === 'hidden' ? 'max-w-[100%] w-full' : 'w-[75%] max-w-[75%]'}`}>

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

                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-white/5 transition-colors"
                  title={theme === 'dark' ? "切换亮色模式" : "切换深色模式"}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>

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

              {/* Left Button - New Task */}
              <button
                onClick={() => openAddModal()}
                className="flex flex-col items-center justify-center gap-2 group relative transition-transform hover:scale-110 active:scale-95"
              >
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-800/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap shadow-lg backdrop-blur-sm z-50">
                  新建代办
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800/90 dark:bg-white/90 rotate-45 clip-path-triangle"></div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-[-4px] rounded-full border-2 border-transparent border-t-cyan-400/50 border-r-cyan-400/50 opacity-0 group-hover:opacity-100 animate-[spin_2s_linear_infinite]"></div>
                  <div className="absolute inset-[-2px] rounded-full border-2 border-transparent border-b-cyan-300/60 border-l-cyan-300/60 opacity-40 group-hover:opacity-100 animate-[spin_3s_linear_infinite_reverse]"></div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center text-white group-hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all duration-300 z-10">
                    <Plus size={24} className="drop-shadow-md" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </button>

              {/* Center Column: Input & Stream */}
              <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto gap-3 z-20 self-center">
                {/* Optimized Input Component */}
                <InputArea onAddNote={handleAddQuickNote} />

                {/* Stream - Center always scrolls */}
                <div className="w-full h-52 relative overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] flex items-center hover-pause">
                  <div className="w-full animate-scroll-vertical flex flex-col items-center will-change-transform" style={{ animationDuration: centerScrollDuration }}>
                    {[...scrollingNotes, ...scrollingNotes].map((item, i) => (
                      <ScrollingItem
                        key={i}
                        text={item.content}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Button - History */}
              <button
                onClick={handleOpenHistory}
                className="flex flex-col items-center justify-center gap-2 group relative transition-transform hover:scale-110 active:scale-95"
              >
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-800/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap shadow-lg backdrop-blur-sm z-50">
                  历史回顾
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800/90 dark:bg-white/90 rotate-45 clip-path-triangle"></div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-[-4px] rounded-full border-2 border-transparent border-t-violet-400/50 border-r-violet-400/50 opacity-0 group-hover:opacity-100 animate-[spin_2s_linear_infinite]"></div>
                  <div className="absolute inset-[-2px] rounded-full border-2 border-transparent border-b-violet-300/60 border-l-violet-300/60 opacity-40 group-hover:opacity-100 animate-[spin_3s_linear_infinite_reverse]"></div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-[0_0_15px_rgba(139,92,246,0.4)] flex items-center justify-center text-white group-hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] transition-all duration-300 z-10">
                    <HistoryIcon size={24} className="drop-shadow-md" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-violet-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Section: Quadrants */}
          <div className="h-[66%] p-6 pt-0 overflow-hidden">
            <div className="h-full rounded-3xl border border-slate-200 dark:border-white/5 bg-white/20 dark:bg-black/20 p-1 shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-500">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400 gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                  <span>数据加载中...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  <QuadrantSection
                    quadrant={Quadrant.Q2}
                    tasks={quadrants[Quadrant.Q2]}
                    dragOverQuadrant={dragOverQuadrant}
                    onAddClick={openAddModal}
                    onDragEnter={handleDragEnter}
                    onDrop={handleDrop}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                    onTaskEdit={openEditModal}
                    onDragStart={handleDragStart}
                  />
                  <QuadrantSection
                    quadrant={Quadrant.Q1}
                    tasks={quadrants[Quadrant.Q1]}
                    dragOverQuadrant={dragOverQuadrant}
                    onAddClick={openAddModal}
                    onDragEnter={handleDragEnter}
                    onDrop={handleDrop}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                    onTaskEdit={openEditModal}
                    onDragStart={handleDragStart}
                  />
                  <QuadrantSection
                    quadrant={Quadrant.Q3}
                    tasks={quadrants[Quadrant.Q3]}
                    dragOverQuadrant={dragOverQuadrant}
                    onAddClick={openAddModal}
                    onDragEnter={handleDragEnter}
                    onDrop={handleDrop}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                    onTaskEdit={openEditModal}
                    onDragStart={handleDragStart}
                  />
                  <QuadrantSection
                    quadrant={Quadrant.Q4}
                    tasks={quadrants[Quadrant.Q4]}
                    dragOverQuadrant={dragOverQuadrant}
                    onAddClick={openAddModal}
                    onDragEnter={handleDragEnter}
                    onDrop={handleDrop}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                    onTaskEdit={openEditModal}
                    onDragStart={handleDragStart}
                  />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Ambient Stream */}
        <aside className={`hidden xl:block w-[12.5%] h-full overflow-hidden relative border-l border-slate-200 dark:border-white/5 bg-white/40 dark:bg-slate-900/20 flex-shrink-0 transition-colors duration-500 ${streamConfig.mode === 'hidden' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-slate-50 dark:from-[#0f172a] to-transparent z-10 pointer-events-none transition-colors"></div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 dark:from-[#0f172a] to-transparent z-10 pointer-events-none transition-colors"></div>
          <SideStream items={rightStream} isRight={true} config={streamConfig} onDeleteNote={handleDeleteQuickNote} />
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
        streamConfig={streamConfig}
        onUpdateStream={(newConfig) => setStreamConfig(newConfig)}
        onClearData={handleClearData}
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
