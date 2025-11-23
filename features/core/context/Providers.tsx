import React, { ReactNode } from 'react';
import { SettingsProvider } from './SettingsContext';
import { UIProvider } from './UIContext';
import { TaskProvider } from './TaskContext';

export const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <SettingsProvider>
            <UIProvider>
                <TaskProvider>
                    {children}
                </TaskProvider>
            </UIProvider>
        </SettingsProvider>
    );
};
