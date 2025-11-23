import React, { createContext, useContext, ReactNode } from 'react';
import { useTasks } from '../../tasks/hooks/useTasks';
import { Task, QuickNote, SortConfig } from '../types';

// Define the return type of useTasks to ensure type safety
type UseTasksReturnType = ReturnType<typeof useTasks>;

const TaskContext = createContext<UseTasksReturnType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const taskData = useTasks();

    return (
        <TaskContext.Provider value={taskData}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTaskContext = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
};
