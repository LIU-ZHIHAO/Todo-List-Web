import { useState, useCallback, useEffect } from 'react';
import { Task, QuickNote, Quadrant } from '../../core/types';
import { dbService } from '../../core/services/db';
import { supabaseService } from '../../core/services/supabaseService';
import { generateId, checkIsOverdue } from '../../core/utils/helpers';
import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus';

export const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
    const [hasLoadedFullHistory, setHasLoadedFullHistory] = useState(false);
    const isOnline = useOnlineStatus();

    const withSaveStatus = useCallback(async (operation: Promise<void>) => {
        setSaveStatus('saving');
        try {
            await operation;
            setTimeout(() => setSaveStatus('saved'), 800);
        } catch (e) {
            console.error(e);
            setSaveStatus('saved');
        }
    }, []);

    const fetchInitialData = useCallback(async () => {
        try {
            setLoading(true);

            // Always try to load from Supabase if online to ensure latest data
            let tasksData: Task[] = [];
            let notesData: QuickNote[] = [];
            let loadedFromSupabase = false;

            if (navigator.onLine) {
                try {
                    const [supaTasks, supaNotes] = await Promise.all([
                        supabaseService.getAllTasks(),
                        supabaseService.getAllQuickNotes()
                    ]);

                    if (supaTasks && supaNotes) {
                        tasksData = supaTasks;
                        notesData = supaNotes;
                        loadedFromSupabase = true;

                        // Sync to local DB immediately
                        await dbService.clearTasks();
                        await dbService.clearQuickNotes();
                        // Use Promise.all for faster parallel insertion
                        await Promise.all([
                            ...supaTasks.map(t => dbService.updateTask(t)),
                            ...supaNotes.map(n => dbService.addQuickNote(n))
                        ]);
                    }
                } catch (e) {
                    console.error("Supabase load failed, falling back to local", e);
                }
            }

            // If offline or Supabase failed, load from local DB
            if (!loadedFromSupabase) {
                [tasksData, notesData] = await Promise.all([
                    dbService.getInitialTasks(),
                    dbService.getAllQuickNotes()
                ]);
            }

            const today = new Date().toISOString().split('T')[0];

            const processedTasks = tasksData.map(t => {
                let modified = false;
                const newTask = { ...t } as any;

                if (typeof t.order !== 'number') {
                    newTask.order = t.createdAt;
                    modified = true;
                }

                if (typeof newTask.completed === 'boolean') {
                    if (newTask.completed) {
                        if (newTask.completedAt) {
                            newTask.completed = new Date(newTask.completedAt).toISOString().split('T')[0];
                        } else {
                            newTask.completed = new Date().toISOString().split('T')[0];
                        }
                    } else {
                        newTask.completed = null;
                    }
                    modified = true;
                }

                if (!newTask.completed && newTask.date < today) {
                    if (newTask.quadrant === Quadrant.Q2) {
                        newTask.quadrant = Quadrant.Q1;
                        newTask.isOverdue = true;
                        modified = true;
                    } else if (newTask.quadrant === Quadrant.Q3) {
                        newTask.quadrant = Quadrant.Q4;
                        newTask.isOverdue = true;
                        modified = true;
                    } else if (!newTask.isOverdue) {
                        newTask.isOverdue = true;
                        modified = true;
                    }
                } else {
                    if (newTask.isOverdue) {
                        newTask.isOverdue = false;
                        modified = true;
                    }
                }

                if (modified) {
                    dbService.updateTask(newTask);
                    if (loadedFromSupabase) supabaseService.updateTask(newTask).catch(console.error);
                }
                return newTask as Task;
            });

            setTasks(processedTasks);
            setQuickNotes(notesData.sort((a, b) => b.createdAt - a.createdAt));
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadFullHistory = useCallback(async () => {
        if (hasLoadedFullHistory) return;
        setSaveStatus('saving');
        try {
            const allTasks = await dbService.getAllTasks();
            setTasks(allTasks);
            setHasLoadedFullHistory(true);
        } catch (e) {
            console.error("Failed to load history", e);
        } finally {
            setTimeout(() => setSaveStatus('saved'), 500);
        }
    }, [hasLoadedFullHistory]);

    const handleSaveTask = useCallback(async (task: Task, isEditing: boolean) => {
        const processedTask = { ...task };

        if (!isEditing) {
            if (processedTask.completed) {
                processedTask.completedAt = Date.now();
            }
        }

        if (!processedTask.completed && checkIsOverdue(processedTask.date)) {
            processedTask.isOverdue = true;
        } else {
            processedTask.isOverdue = false;
        }

        const operation = async () => {
            if (isEditing) {
                // Optimistic update
                setTasks(prev => prev.map(t => t.id === processedTask.id ? processedTask : t));
                await dbService.updateTask(processedTask);
                if (navigator.onLine) await supabaseService.updateTask(processedTask);
            } else {
                // Optimistic update
                setTasks(prev => [processedTask, ...prev]);
                await dbService.addTask(processedTask);
                if (navigator.onLine) await supabaseService.addTask(processedTask);
            }
        };
        // Don't await the operation for UI responsiveness, but track it for save status
        withSaveStatus(operation());
    }, [withSaveStatus]);

    const handleTaskDelete = useCallback(async (id: string) => {
        const operation = async () => {
            await dbService.deleteTask(id);
            if (navigator.onLine) await supabaseService.deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        };
        await withSaveStatus(operation());
    }, [withSaveStatus]);

    const handleTaskUpdate = useCallback(async (updatedTask: Task) => {
        const processedTask = { ...updatedTask };

        if (!processedTask.completed && checkIsOverdue(processedTask.date)) {
            processedTask.isOverdue = true;
        } else {
            processedTask.isOverdue = false;
        }

        if (processedTask.completed) {
            if (!processedTask.completedAt) {
                processedTask.completedAt = Date.now();
            }
        } else {
            processedTask.completedAt = undefined;
        }

        const operation = async () => {
            await dbService.updateTask(processedTask);
            if (navigator.onLine) await supabaseService.updateTask(processedTask);
            setTasks(prev => prev.map(t => t.id === processedTask.id ? processedTask : t));
        };
        await withSaveStatus(operation());
    }, [withSaveStatus]);

    const handleImportData = useCallback(async (importedTasks: Task[], importedNotes: QuickNote[]) => {
        setSaveStatus('saving');
        try {
            let taskSuccess = 0;
            let taskError = 0;
            let noteSuccess = 0;
            let noteError = 0;

            if (importedTasks && importedTasks.length > 0) {
                for (const task of importedTasks) {
                    try {
                        // Validate and fix incomplete data
                        const validTask = {
                            ...task,
                            id: task.id || generateId(),
                            title: task.title || '未命名任务',
                            quadrant: task.quadrant || Quadrant.Q2,
                            date: task.date || new Date().toISOString().split('T')[0],
                            tag: task.tag || '其他',
                            progress: typeof task.progress === 'number' ? task.progress : 0,
                            createdAt: task.createdAt || Date.now(),
                            order: typeof task.order === 'number' ? task.order : (task.createdAt || Date.now())
                        };

                        // Handle completed field
                        if (typeof (task as any).completed === 'boolean') {
                            if ((task as any).completed) {
                                validTask.completed = task.completedAt
                                    ? new Date(task.completedAt).toISOString().split('T')[0]
                                    : new Date().toISOString().split('T')[0];
                            } else {
                                validTask.completed = null;
                            }
                        }

                        await dbService.addTask(validTask);
                        if (navigator.onLine) {
                            await supabaseService.addTask(validTask).catch(e => {
                                console.error('Failed to sync task to Supabase:', e);
                            });
                        }
                        taskSuccess++;
                    } catch (e) {
                        console.error('Failed to import task:', task, e);
                        taskError++;
                    }
                }
            }

            if (importedNotes && importedNotes.length > 0) {
                for (const note of importedNotes) {
                    try {
                        // Validate and fix incomplete data
                        const validNote = {
                            ...note,
                            id: note.id || generateId(),
                            content: note.content || '',
                            createdAt: note.createdAt || Date.now(),
                            tags: Array.isArray(note.tags) ? note.tags : []
                        };

                        // Skip empty notes
                        if (!validNote.content.trim()) {
                            continue;
                        }

                        await dbService.addQuickNote(validNote);
                        if (navigator.onLine) {
                            await supabaseService.addQuickNote(validNote).catch(e => {
                                console.error('Failed to sync note to Supabase:', e);
                            });
                        }
                        noteSuccess++;
                    } catch (e) {
                        console.error('Failed to import note:', note, e);
                        noteError++;
                    }
                }
            }

            const allTasks = await dbService.getAllTasks();
            const allNotes = await dbService.getAllQuickNotes();
            setTasks(allTasks);
            setQuickNotes(allNotes.sort((a, b) => b.createdAt - a.createdAt));
            setHasLoadedFullHistory(true);

            setTimeout(() => setSaveStatus('saved'), 800);

            // Show detailed feedback
            const totalSuccess = taskSuccess + noteSuccess;
            const totalError = taskError + noteError;
            if (totalError > 0) {
                alert(`导入完成！\n成功: ${totalSuccess} 条 (${taskSuccess} 待办, ${noteSuccess} 闪念)\n失败: ${totalError} 条`);
            } else {
                alert(`导入成功！\n共导入 ${totalSuccess} 条数据 (${taskSuccess} 待办, ${noteSuccess} 闪念)`);
            }
        } catch (e) {
            console.error("Import failed", e);
            setSaveStatus('saved');
            alert('导入失败，请检查文件格式');
        }
    }, []);

    const handleClearData = useCallback(async (type: 'tasks' | 'notes' | 'all') => {
        setSaveStatus('saving');
        try {
            if (type === 'tasks') {
                await dbService.clearTasks();
                if (navigator.onLine) {
                    const allRemote = await supabaseService.getAllTasks();
                    await Promise.all(allRemote.map(t => supabaseService.deleteTask(t.id)));
                }
                setTasks([]);
            } else if (type === 'notes') {
                await dbService.clearQuickNotes();
                if (navigator.onLine) {
                    const allRemote = await supabaseService.getAllQuickNotes();
                    await Promise.all(allRemote.map(n => supabaseService.deleteQuickNote(n.id)));
                }
                setQuickNotes([]);
            } else if (type === 'all') {
                await dbService.resetDatabase();
                if (navigator.onLine) {
                    const [allTasks, allNotes] = await Promise.all([
                        supabaseService.getAllTasks(),
                        supabaseService.getAllQuickNotes()
                    ]);
                    await Promise.all([
                        ...allTasks.map(t => supabaseService.deleteTask(t.id)),
                        ...allNotes.map(n => supabaseService.deleteQuickNote(n.id))
                    ]);
                }
                setTasks([]);
                setQuickNotes([]);
            }
            setTimeout(() => setSaveStatus('saved'), 800);
        } catch (e) {
            console.error(e);
            setSaveStatus('saved');
            alert('操作失败，请重试');
        }
    }, []);

    const handleAddQuickNote = useCallback(async (content: string) => {
        const newNote: QuickNote = {
            id: generateId(),
            content: content,
            createdAt: Date.now(),
            tags: [] // No auto-tagging
        };
        const operation = async () => {
            // Optimistic update
            setQuickNotes(prev => [newNote, ...prev]);
            await dbService.addQuickNote(newNote);
            if (navigator.onLine) await supabaseService.addQuickNote(newNote);
        };
        withSaveStatus(operation());
    }, [withSaveStatus]);

    const handleDeleteQuickNote = useCallback(async (id: string) => {
        const operation = async () => {
            await dbService.deleteQuickNote(id);
            if (navigator.onLine) await supabaseService.deleteQuickNote(id);
            setQuickNotes(prev => prev.filter(n => n.id !== id));
        };
        await withSaveStatus(operation());
    }, [withSaveStatus]);

    const handleUpdateQuickNote = useCallback(async (updatedNote: QuickNote) => {
        const operation = async () => {
            await dbService.updateQuickNote(updatedNote);
            if (navigator.onLine) await supabaseService.updateQuickNote(updatedNote);
            setQuickNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
        };
        await withSaveStatus(operation());
    }, [withSaveStatus]);

    return {
        tasks,
        setTasks,
        quickNotes,
        setQuickNotes,
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
        handleDeleteQuickNote,
        handleUpdateQuickNote
    };
};
