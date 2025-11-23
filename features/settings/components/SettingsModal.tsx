import React, { useState } from 'react';
import { Modal } from '../../shared/components/ui/Modal';
import { SortConfig, StreamConfig, Task, QuickNote } from '../../core/types';
import { Settings, Database, Keyboard, Trash2, AlertTriangle } from 'lucide-react';
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

type Tab = 'general' | 'data' | 'shortcuts';

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen, onClose, config, onUpdate, streamConfig, onUpdateStream,
    onClearData, tasks, quickNotes, onImport
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [confirmDanger, setConfirmDanger] = useState<{ type: 'tasks' | 'notes' | 'all', step: number } | null>(null);

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
