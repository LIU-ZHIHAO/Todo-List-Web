import React, { useEffect, useMemo, useState } from 'react';
import { Quadrant, QuickNote, Task } from '../../core/types';
import { DEMO_QUOTES } from '../../core/constants/data';
import { AddTaskModal } from '../../tasks/components/AddTaskModal';
import { HistoryModal } from '../../history/components/HistoryModal';
import { SettingsModal } from '../../settings/components/SettingsModal';
import { HelpModal } from '../../settings/components/HelpModal';
import { AuthorModal } from '../../settings/components/AuthorModal';
import { QuickNoteModal } from '../../quicknotes/components/QuickNoteModal';
import { InputArea } from '../../quicknotes/components/InputArea';
import { QuadrantSection } from '../../tasks/components/QuadrantSection';
import { ScrollingItem } from '../../quicknotes/components/ScrollingItem';
import { useDragDrop } from '../../tasks/hooks/useDragDrop';
import { useKeyboardShortcuts } from '../../shared/hooks/useKeyboardShortcuts';
import { useSettings } from '../../core/context/SettingsContext';
import { useUI } from '../../core/context/UIContext';
import { useTaskContext } from '../../core/context/TaskContext';
import { Header } from './Header';

const APP_VERSION = '1.2.0';

export const AppLayout = () => {
    const {
        isTaskModalOpen, openTaskModal, closeTaskModal,
        isHistoryOpen, setIsHistoryOpen,
        isAuthorModalOpen, setIsAuthorModalOpen,
        isSettingsOpen, setIsSettingsOpen,
        isHelpOpen, setIsHelpOpen,
        isQuickNoteModalOpen, setIsQuickNoteModalOpen,
        editingTask, initialQuadrant, initialContent,
        convertingNoteId, setConvertingNoteId,
        closeAllModals
    } = useUI();

    const { sortConfig, setSortConfig, streamConfig, setStreamConfig } = useSettings();

    const {
        tasks,
        quickNotes,
        loading,
        fetchInitialData,
        loadFullHistory,
        handleSaveTask,
        handleTaskDelete,
        handleTaskUpdate,
        handleImportData,
        handleClearData,
        handleAddQuickNote,
        handleDeleteQuickNote,
        handleUpdateQuickNote
    } = useTaskContext();

    const [activeMobileQuadrant, setActiveMobileQuadrant] = useState<Quadrant>(Quadrant.Q2);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Keyboard Shortcuts
    useKeyboardShortcuts([
        {
            key: 'i',
            alt: true,
            action: () => {
                const input = document.getElementById('quick-note-input');
                if (input) input.focus();
            }
        },
        {
            key: 'n',
            alt: true,
            action: () => openTaskModal(null, Quadrant.Q2)
        },
        {
            key: 'k',
            alt: true,
            action: () => setIsQuickNoteModalOpen(true)
        },
        {
            key: '/',
            alt: true,
            action: () => setIsHelpOpen(true)
        },
        {
            key: 'Escape',
            action: closeAllModals
        }
    ]);

    const handleOpenHistory = () => {
        loadFullHistory();
        setIsHistoryOpen(true);
    };

    const handleConvertQuickNoteToTask = (note: QuickNote) => {
        setConvertingNoteId(note.id);
        openTaskModal(null, Quadrant.Q2, note.content);
        setIsQuickNoteModalOpen(false);
    };

    const onSaveTaskWrapper = async (task: Task, isEdit: boolean) => {
        await handleSaveTask(task, isEdit);
        if (convertingNoteId) {
            await handleDeleteQuickNote(convertingNoteId);
            setConvertingNoteId(null);
        }
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
        dragOverQuadrant,
        handleDragStart,
        handleDragEnter,
        handleDrop
    } = useDragDrop(tasks, handleTaskUpdate, quadrants);

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

            <div className="flex flex-1 h-full overflow-hidden justify-center">

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full relative z-10 transition-colors duration-500 w-full max-w-[1920px] px-4">

                    {/* Top Section */}
                    <div className="flex flex-col w-full relative pb-4 shrink-0">

                        <Header />

                        {/* Center Column: Input & Stream */}
                        <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto gap-3 z-20 self-center mt-4">
                            {/* Optimized Input Component */}
                            <InputArea onAddNote={handleAddQuickNote} />

                            {/* Stream - Center always scrolls */}
                            <div className="w-full h-32 relative overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] flex items-center hover-pause">
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
                    </div>

                    {/* Bottom Section: Quadrants */}
                    <div className="flex-1 p-6 pt-0 overflow-hidden min-h-0">
                        <div className="h-full rounded-3xl border border-slate-200 dark:border-white/5 bg-white/20 dark:bg-black/20 p-1 shadow-xl dark:shadow-2xl backdrop-blur-md transition-colors duration-500 flex flex-col">
                            {loading ? (
                                <div className="flex items-center justify-center h-full text-gray-400 gap-2">
                                    <div className="w-5 h-5 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                                    <span>数据加载中...</span>
                                </div>
                            ) : (
                                <>
                                    {/* Mobile Tabs */}
                                    <div className="md:hidden flex items-center justify-between bg-white/50 dark:bg-black/20 p-1 rounded-xl mb-4 backdrop-blur-sm shrink-0">
                                        {Object.values(Quadrant).map(q => (
                                            <button
                                                key={q}
                                                onClick={() => setActiveMobileQuadrant(q)}
                                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeMobileQuadrant === q ? 'bg-white dark:bg-white/10 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full md:p-4 overflow-hidden relative">
                                        <div className={`h-full overflow-hidden ${activeMobileQuadrant === Quadrant.Q2 ? 'block' : 'hidden md:block'}`}>
                                            <QuadrantSection
                                                quadrant={Quadrant.Q2}
                                                tasks={quadrants[Quadrant.Q2]}
                                                dragOverQuadrant={dragOverQuadrant}
                                                onAddClick={(q) => openTaskModal(null, q)}
                                                onDragEnter={handleDragEnter}
                                                onDrop={handleDrop}
                                                onTaskUpdate={handleTaskUpdate}
                                                onTaskDelete={handleTaskDelete}
                                                onTaskEdit={(task) => openTaskModal(task)}
                                                onDragStart={handleDragStart}
                                            />
                                        </div>
                                        <div className={`h-full overflow-hidden ${activeMobileQuadrant === Quadrant.Q1 ? 'block' : 'hidden md:block'}`}>
                                            <QuadrantSection
                                                quadrant={Quadrant.Q1}
                                                tasks={quadrants[Quadrant.Q1]}
                                                dragOverQuadrant={dragOverQuadrant}
                                                onAddClick={(q) => openTaskModal(null, q)}
                                                onDragEnter={handleDragEnter}
                                                onDrop={handleDrop}
                                                onTaskUpdate={handleTaskUpdate}
                                                onTaskDelete={handleTaskDelete}
                                                onTaskEdit={(task) => openTaskModal(task)}
                                                onDragStart={handleDragStart}
                                            />
                                        </div>
                                        <div className={`h-full overflow-hidden ${activeMobileQuadrant === Quadrant.Q3 ? 'block' : 'hidden md:block'}`}>
                                            <QuadrantSection
                                                quadrant={Quadrant.Q3}
                                                tasks={quadrants[Quadrant.Q3]}
                                                dragOverQuadrant={dragOverQuadrant}
                                                onAddClick={(q) => openTaskModal(null, q)}
                                                onDragEnter={handleDragEnter}
                                                onDrop={handleDrop}
                                                onTaskUpdate={handleTaskUpdate}
                                                onTaskDelete={handleTaskDelete}
                                                onTaskEdit={(task) => openTaskModal(task)}
                                                onDragStart={handleDragStart}
                                            />
                                        </div>
                                        <div className={`h-full overflow-hidden ${activeMobileQuadrant === Quadrant.Q4 ? 'block' : 'hidden md:block'}`}>
                                            <QuadrantSection
                                                quadrant={Quadrant.Q4}
                                                tasks={quadrants[Quadrant.Q4]}
                                                dragOverQuadrant={dragOverQuadrant}
                                                onAddClick={(q) => openTaskModal(null, q)}
                                                onDragEnter={handleDragEnter}
                                                onDrop={handleDrop}
                                                onTaskUpdate={handleTaskUpdate}
                                                onTaskDelete={handleTaskDelete}
                                                onTaskEdit={(task) => openTaskModal(task)}
                                                onDragStart={handleDragStart}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>

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
                onEditTask={(task) => openTaskModal(task)}
                sortConfig={sortConfig}
            />

            <QuickNoteModal
                isOpen={isQuickNoteModalOpen}
                onClose={() => setIsQuickNoteModalOpen(false)}
                notes={quickNotes}
                onDelete={handleDeleteQuickNote}
                onUpdate={handleUpdateQuickNote}
                onConvertToTask={handleConvertQuickNoteToTask}
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
                onUpdate={setSortConfig}
                streamConfig={streamConfig}
                onUpdateStream={setStreamConfig}
                onClearData={handleClearData}
                tasks={tasks}
                quickNotes={quickNotes}
                onImport={handleImportData}
            />

            <HelpModal
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
            />

            <AddTaskModal
                isOpen={isTaskModalOpen}
                onClose={closeTaskModal}
                onSave={onSaveTaskWrapper}
                initialTask={editingTask}
                initialQuadrant={initialQuadrant}
                initialContent={initialContent}
                zIndex="z-[60]"
            />
        </div>
    );
};
