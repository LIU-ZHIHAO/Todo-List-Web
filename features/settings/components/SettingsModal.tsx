import React, { useState } from 'react';
import { Modal } from '../../shared/components/ui/Modal';
import { SortConfig, StreamConfig, Task, QuickNote } from '../../core/types';
import { Settings, Database, Keyboard, Trash2, AlertTriangle, User, LogOut, HelpCircle, LayoutGrid, MousePointerClick, Zap, History } from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { GeneralSettings } from './sections/GeneralSettings';
import { DataManagement } from './sections/DataManagement';
import { ShortcutSettings } from './sections/ShortcutSettings';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: SortConfig;
    onUpdate: (config: SortConfig) => void;
    streamConfig: StreamConfig;
    onUpdateStream: (config: StreamConfig) => void;
    onClearData: (type: 'tasks' | 'notes' | 'all') => void;
    tasks: Task[];
    quickNotes: QuickNote[];
    onImport: (tasks: Task[], notes: QuickNote[]) => void;
}

type Tab = 'general' | 'data' | 'shortcuts' | 'account' | 'help';

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen, onClose, config, onUpdate, streamConfig, onUpdateStream,
    onClearData, tasks, quickNotes, onImport
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [confirmDanger, setConfirmDanger] = useState<{ type: 'tasks' | 'notes' | 'all', step: number } | null>(null);
    const { user, signOut } = useAuth();

    const triggerDanger = (type: 'tasks' | 'notes' | 'all') => {
        setConfirmDanger({ type, step: 1 });
    };

    const confirmDangerAction = () => {
        if (confirmDanger) {
            onClearData(confirmDanger.type);
            setConfirmDanger(null);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="系统设置" className="max-w-2xl">
            <div className="flex flex-col h-[60vh]">
                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2 mb-4">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2
                            ${activeTab === 'general'
                                ? 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                    >
                        <Settings size={16} /> 通用
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2
                            ${activeTab === 'data'
                                ? 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                    >
                        <Database size={16} /> 数据
                    </button>
                    <button
                        onClick={() => setActiveTab('shortcuts')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2
                            ${activeTab === 'shortcuts'
                                ? 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                    >
                        <Keyboard size={16} /> 快捷键
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2
                            ${activeTab === 'account'
                                ? 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                    >
                        <User size={16} /> 账户
                    </button>
                    <button
                        onClick={() => setActiveTab('help')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2
                            ${activeTab === 'help'
                                ? 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                    >
                        <HelpCircle size={16} /> 说明
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {activeTab === 'general' && (
                        <GeneralSettings
                            config={config}
                            onUpdate={onUpdate}
                            streamConfig={streamConfig}
                            onUpdateStream={onUpdateStream}
                        />
                    )}

                    {activeTab === 'data' && (
                        <div className="space-y-8">
                            <DataManagement
                                tasks={tasks}
                                quickNotes={quickNotes}
                                onImport={onImport}
                                onClearData={onClearData}
                            />

                            {/* Data Clearing Zone */}
                            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20">
                                <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                                    <Trash2 size={16} /> 数据清除
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-lg border border-red-100 dark:border-red-900/10">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">清空所有已完成事项</span>
                                            <span className="text-[10px] text-slate-400">将同步删除云端数据</span>
                                        </div>
                                        <button
                                            onClick={() => triggerDanger('tasks')}
                                            className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                        >
                                            清空
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-lg border border-red-100 dark:border-red-900/10">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">清空所有闪念笔记</span>
                                            <span className="text-[10px] text-slate-400">将同步删除云端数据</span>
                                        </div>
                                        <button
                                            onClick={() => triggerDanger('notes')}
                                            className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                        >
                                            清空
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-lg border border-red-100 dark:border-red-900/10">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">重置所有数据 (慎用)</span>
                                            <span className="text-[10px] text-slate-400">清空本地和云端所有内容</span>
                                        </div>
                                        <button
                                            onClick={() => triggerDanger('all')}
                                            className="px-3 py-1.5 bg-red-500 text-white rounded-md text-xs font-bold hover:bg-red-600 transition-colors shadow-sm"
                                        >
                                            全部重置
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'shortcuts' && (
                        <ShortcutSettings />
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-6 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                                    <User size={40} />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{user?.email || '未登录'}</h3>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">当前登录账户</p>
                                </div>
                                {user && (
                                    <button
                                        onClick={() => { signOut(); onClose(); }}
                                        className="mt-4 px-6 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center gap-2"
                                    >
                                        <LogOut size={18} /> 退出登录
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'help' && (
                        <div className="space-y-8 py-2">
                            {/* 1. Core Concept */}
                            <section className="space-y-3">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <LayoutGrid className="text-blue-500" size={20} />
                                    核心理念：四象限法则
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                                        <div className="font-bold text-red-600 dark:text-red-400 mb-1">Q1 重要且紧急</div>
                                        <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                                            <span className="font-semibold">马上做</span>。如危机、截止日期的任务。
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                                        <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Q2 重要不紧急</div>
                                        <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                                            <span className="font-semibold">计划做</span>。如学习、锻炼、长期规划。这是高效能人士关注的重点。
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20">
                                        <div className="font-bold text-yellow-600 dark:text-yellow-400 mb-1">Q3 不重要不紧急</div>
                                        <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                                            <span className="font-semibold">减少做</span>。如无目的的刷剧、发呆。
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                                        <div className="font-bold text-blue-600 dark:text-blue-400 mb-1">Q4 紧急不重要</div>
                                        <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                                            <span className="font-semibold">授权做</span>。如突如其来的干扰、某些会议。
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

                            {/* 2. Features */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <MousePointerClick className="text-purple-500" size={20} />
                                    操作指南
                                </h3>
                                <ul className="space-y-3 text-sm text-slate-600 dark:text-gray-300">
                                    <li className="flex gap-3">
                                        <div className="min-w-[24px] h-6 flex items-center justify-center bg-slate-100 dark:bg-white/10 rounded-full text-xs font-bold">1</div>
                                        <div>
                                            <span className="font-bold text-slate-800 dark:text-white">新建任务：</span>
                                            点击任意象限的空白处，或点击左上角的“新建任务”按钮。
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="min-w-[24px] h-6 flex items-center justify-center bg-slate-100 dark:bg-white/10 rounded-full text-xs font-bold">2</div>
                                        <div>
                                            <span className="font-bold text-slate-800 dark:text-white">进度管理：</span>
                                            任务卡片上的进度条支持点击。点击不同格数可直接调整进度（20% - 100%）。点击圆圈图标可直接完成。
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="min-w-[24px] h-6 flex items-center justify-center bg-slate-100 dark:bg-white/10 rounded-full text-xs font-bold">3</div>
                                        <div>
                                            <span className="font-bold text-slate-800 dark:text-white">拖拽排序：</span>
                                            长按任务卡片可进行拖拽，支持在不同象限间移动，或在同一象限内调整顺序（需在设置中开启“自由拖动优先”）。
                                        </div>
                                    </li>
                                </ul>
                            </section>

                            <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

                            {/* 3. Special Features */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <section className="space-y-2">
                                    <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <Zap className="text-yellow-500" size={18} />
                                        闪念胶囊
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                                        页面中央的输入框用于捕捉稍纵即逝的灵感。输入内容并回车，它将作为“闪念”存储，并在两侧的氛围流中循环展示，随时提醒。
                                    </p>
                                </section>

                                <section className="space-y-2">
                                    <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <History className="text-indigo-500" size={18} />
                                        历史与复盘
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                                        点击“历史记录”查看过往。支持列表视图和日历视图。日历视图下，每天的完成情况会通过红/绿点直观展示，点击日期可查看当日详情。
                                    </p>
                                </section>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Confirmation Modal Overlay */}
            {confirmDanger && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl max-w-xs w-full mx-4 border border-red-100 dark:border-red-900/30 transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">确认清空?</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    此操作无法撤销，请确认您已备份重要数据。
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setConfirmDanger(null)}
                                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={confirmDangerAction}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all"
                                >
                                    确认清空
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
