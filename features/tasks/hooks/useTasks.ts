import { useState, useCallback, useEffect } from 'react';
import { Task, QuickNote, Quadrant } from '../../core/types';
import { dbService } from '../../core/services/db';
import { generateId, checkIsOverdue } from '../../core/utils/helpers';

export const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
    const [hasLoadedFullHistory, setHasLoadedFullHistory] = useState(false);

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
            const [tasksData, notesData] = await Promise.all([
                dbService.getInitialTasks(),
                dbService.getAllQuickNotes()
            ]);

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

        if (isEditing) {
            await withSaveStatus(dbService.updateTask(processedTask));
            setTasks(prev => prev.map(t => t.id === processedTask.id ? processedTask : t));
        } else {
            await withSaveStatus(dbService.addTask(processedTask));
            setTasks(prev => [processedTask, ...prev]);
        }
    }, [withSaveStatus]);

    const handleTaskDelete = useCallback(async (id: string) => {
        await withSaveStatus(dbService.deleteTask(id));
        setTasks(prev => prev.filter(t => t.id !== id));
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

        await withSaveStatus(dbService.updateTask(processedTask));
        setTasks(prev => prev.map(t => t.id === processedTask.id ? processedTask : t));
    }, [withSaveStatus]);

    const handleImportData = useCallback(async (importedTasks: Task[], importedNotes: QuickNote[]) => {
        setSaveStatus('saving');
        try {
            if (importedTasks && importedTasks.length > 0) {
                for (const task of importedTasks) {
                    if (typeof (task as any).completed === 'boolean') {
                        if ((task as any).completed) {
                            task.completed = task.completedAt
                                ? new Date(task.completedAt).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0];
                        } else {
                            task.completed = null;
                        }
                    }
                    await dbService.updateTask(task);
                }
            }

            if (importedNotes && importedNotes.length > 0) {
                for (const note of importedNotes) {
                    try {
                        await dbService.addQuickNote(note);
                    } catch (e) {
                    }
                }
            }

            const allTasks = await dbService.getAllTasks();
            const allNotes = await dbService.getAllQuickNotes();
            setTasks(allTasks);
            setQuickNotes(allNotes.sort((a, b) => b.createdAt - a.createdAt));
            setHasLoadedFullHistory(true);

            setTimeout(() => setSaveStatus('saved'), 800);
        } catch (e) {
            console.error("Import failed", e);
            setSaveStatus('saved');
        }
    }, []);

    const handleClearData = useCallback(async (type: 'tasks' | 'notes' | 'all') => {
        setSaveStatus('saving');
        try {
            if (type === 'tasks') {
                await dbService.clearTasks();
                setTasks([]);
            } else if (type === 'notes') {
                await dbService.clearQuickNotes();
                setQuickNotes([]);
            } else if (type === 'all') {
                await dbService.resetDatabase();
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
        };
        await withSaveStatus(dbService.addQuickNote(newNote));
        setQuickNotes(prev => [newNote, ...prev]);
    }, [withSaveStatus]);

    const handleDeleteQuickNote = useCallback(async (id: string) => {
        await withSaveStatus(dbService.deleteQuickNote(id));
        setQuickNotes(prev => prev.filter(n => n.id !== id));
    }, [withSaveStatus]);

    const handleUpdateQuickNote = useCallback(async (updatedNote: QuickNote) => {
        await withSaveStatus(dbService.updateQuickNote(updatedNote));
        setQuickNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
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
