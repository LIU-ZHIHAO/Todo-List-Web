import React, { useState, useRef } from 'react';
import { LayoutGrid, Library, Sun, Moon, Settings, Clock, User, Users, LogOut } from 'lucide-react';
import { useUI } from '../../core/context/UIContext';
import { useAuth } from '../../core/context/AuthContext';
import { AuthModal } from '../../core/components/AuthModal';
import { UserManagementModal } from '../../admin/components/UserManagementModal';
import { useOnlineStatus } from '../../shared/hooks/useOnlineStatus';
import { useClickOutside } from '../../shared/hooks/useClickOutside';

export const Header = () => {
    const {
        theme, toggleTheme,
        setIsQuickNoteModalOpen,
        setIsHistoryOpen,
        setIsSettingsOpen
    } = useUI();

    const { user, isSuperAdmin, signOut, loading } = useAuth();
    const isOnline = useOnlineStatus();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useClickOutside(profileMenuRef, () => setIsProfileMenuOpen(false));



    return (
        <>
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
                    {/* Profile Menu */}
                    {!loading && user && (
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-white/5 transition-colors"
                                title="个人账号"
                            >
                                <User size={16} />
                            </button>

                            {isProfileMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    {/* User Info Header */}
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                                <User size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                                    {user.email}
                                                </p>
                                                {isSuperAdmin && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mt-1">
                                                        管理员
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-1">
                                        {isSuperAdmin && (
                                            <button
                                                onClick={() => {
                                                    setIsUserManagementOpen(true);
                                                    setIsProfileMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                                            >
                                                <Users size={16} />
                                                用户管理
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                signOut();
                                                setIsProfileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <LogOut size={16} />
                                            退出登录
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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



                    <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-white/5 transition-colors" title="系统设置">
                        <Settings size={16} />
                    </button>

                    {/* Auth Button */}


                    <div className="flex items-center gap-1.5">
                        {/* Status indicator removed as per user request */}
                    </div>
                </div>
            </header>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            {/* User Management Modal */}
            <UserManagementModal
                isOpen={isUserManagementOpen}
                onClose={() => setIsUserManagementOpen(false)}
            />
        </>
    );
};
