import React from 'react';
import { LayoutGrid, Library, Sun, Moon, HelpCircle, Info, Settings, WifiOff, Clock } from 'lucide-react';
import { useUI } from '../../core/context/UIContext';
import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus';

export const Header = () => {
    const {
        theme, toggleTheme,
        setIsQuickNoteModalOpen,
        setIsHistoryOpen,
        setIsHelpOpen,
        setIsAuthorModalOpen,
        setIsSettingsOpen
    } = useUI();

    const isOnline = useOnlineStatus();

    return (
        <header className="flex-shrink-0 flex flex-col md:flex-row items-center justify-center px-4 md:px-8 relative z-20 min-h-[3rem] md:h-10 mb-2 md:mb-1 pt-2 md:pt-4 gap-2 md:gap-0">
            <div className="flex items-center gap-2 group cursor-default">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-md dark:shadow-[0_0_20px_rgba(59,130,246,0.4)] ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-300">
                    <LayoutGrid size={14} className="text-white md:w-[18px] md:h-[18px]" />
                </div>
                <h1 className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-blue-700 to-slate-600 dark:from-white dark:via-blue-100 dark:to-gray-300 tracking-tight drop-shadow-sm dark:drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                    四象限清单
                </h1>
            </div>

            {/* Right Header Controls */}
            <div className="relative md:absolute md:right-8 md:top-1/2 md:translate-y-1 flex items-center gap-2 md:gap-3">

                <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-white/5 transition-colors"
                    title="历史记录"
                >
                    <Clock size={16} />
                </button>

                <button
                    onClick={() => setIsQuickNoteModalOpen(true)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-white/5 transition-colors"
                    title="闪念胶囊库"
                >
                    <Library size={16} />
                </button>

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

                <div className="flex items-center gap-1.5">
                    {/* Status indicator removed as per user request */}
                </div>
            </div>
        </header>
    );
};
