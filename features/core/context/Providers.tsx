import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { SettingsProvider } from './SettingsContext';
import { UIProvider } from './UIContext';
import { TaskProvider } from './TaskContext';

export const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <AuthProvider>
            <SettingsProvider>
                <UIProvider>
                    <TaskProvider>
                        {children}
                    </TaskProvider>
                </UIProvider>
            </SettingsProvider>
        </AuthProvider>
    );
};
