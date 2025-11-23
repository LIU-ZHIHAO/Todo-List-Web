import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Task, Quadrant } from '../types';

interface UIContextType {
    theme: 'dark' | 'light';
    toggleTheme: () => void;

    // Modals
    isTaskModalOpen: boolean;
    openTaskModal: (task?: Task | null, quadrant?: Quadrant | null, content?: string) => void;
    closeTaskModal: () => void;

    isHistoryOpen: boolean;
    setIsHistoryOpen: (isOpen: boolean) => void;

    isAuthorModalOpen: boolean;
    setIsAuthorModalOpen: (isOpen: boolean) => void;

    isSettingsOpen: boolean;
    setIsSettingsOpen: (isOpen: boolean) => void;

    isHelpOpen: boolean;
    setIsHelpOpen: (isOpen: boolean) => void;

    isQuickNoteModalOpen: boolean;
    setIsQuickNoteModalOpen: (isOpen: boolean) => void;

    // Task Modal State
    editingTask: Task | null;
    initialQuadrant: Quadrant | null;
    initialContent: string | undefined;

    // Conversion State
    convertingNoteId: string | null;
    setConvertingNoteId: (id: string | null) => void;

    closeAllModals: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Theme State
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
        }
        return 'dark';
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
        setTheme((prev) => prev === 'dark' ? 'light' : 'dark');
    };

    // Modal States
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [initialQuadrant, setInitialQuadrant] = useState<Quadrant | null>(null);
    const [initialContent, setInitialContent] = useState<string | undefined>(undefined);

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isQuickNoteModalOpen, setIsQuickNoteModalOpen] = useState(false);

    const [convertingNoteId, setConvertingNoteId] = useState<string | null>(null);

    const openTaskModal = useCallback((task: Task | null = null, quadrant: Quadrant | null = null, content?: string) => {
        setEditingTask(task);
        setInitialQuadrant(quadrant);
        setInitialContent(content);
        setIsTaskModalOpen(true);
    }, []);

    const closeTaskModal = useCallback(() => {
        setIsTaskModalOpen(false);
        setEditingTask(null);
        setInitialQuadrant(null);
        setInitialContent(undefined);
    }, []);

    const closeAllModals = useCallback(() => {
        setIsTaskModalOpen(false);
        setIsHistoryOpen(false);
        setIsAuthorModalOpen(false);
        setIsSettingsOpen(false);
        setIsHelpOpen(false);
        setIsQuickNoteModalOpen(false);
    }, []);

    return (
        <UIContext.Provider value={{
            theme,
            toggleTheme,
            isTaskModalOpen,
            openTaskModal,
            closeTaskModal,
            isHistoryOpen,
            setIsHistoryOpen,
            isAuthorModalOpen,
            setIsAuthorModalOpen,
            isSettingsOpen,
            setIsSettingsOpen,
            isHelpOpen,
            setIsHelpOpen,
            isQuickNoteModalOpen,
            setIsQuickNoteModalOpen,
            editingTask,
            initialQuadrant,
            initialContent,
            convertingNoteId,
            setConvertingNoteId,
            closeAllModals
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
