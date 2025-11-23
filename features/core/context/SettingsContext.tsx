import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SortConfig, StreamConfig } from '../types';

interface SettingsContextType {
    sortConfig: SortConfig;
    setSortConfig: (config: SortConfig) => void;
    streamConfig: StreamConfig;
    setStreamConfig: (config: StreamConfig) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Sorting Config State
    const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
        if (typeof window === 'undefined') return { mode: 'custom', direction: 'asc' };
        const saved = localStorage.getItem('sortConfig');
        return saved ? JSON.parse(saved) : { mode: 'custom', direction: 'asc' };
    });

    // Stream Config State
    const [streamConfig, setStreamConfig] = useState<StreamConfig>(() => {
        if (typeof window === 'undefined') return { mode: 'scroll', speed: 50 };
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

    // Persist Configs
    useEffect(() => {
        localStorage.setItem('sortConfig', JSON.stringify(sortConfig));
    }, [sortConfig]);

    useEffect(() => {
        localStorage.setItem('streamConfig', JSON.stringify(streamConfig));
    }, [streamConfig]);

    return (
        <SettingsContext.Provider value={{ sortConfig, setSortConfig, streamConfig, setStreamConfig }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
