

import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../../shared/components/ui/Modal';
import { SortConfig, SortMode, SortDirection, StreamConfig, StreamMode, StreamSpeed, Task, QuickNote } from '../../core/types';
import { GripVertical, Calendar, Percent, ArrowUpNarrowWide, ArrowDownNarrowWide, PauseCircle, PlayCircle, EyeOff, AlertTriangle, Trash2, RefreshCw, Gauge, Download, Upload, Database, Cloud, CloudOff, CheckCircle } from 'lucide-react';
import { migrateAllData, syncFromSupabase, checkSupabaseConnection, getSupabaseStats } from '../../core/utils/migration';

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

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onUpdate, streamConfig, onUpdateStream, onClearData, tasks, quickNotes, onImport }) => {
    const [confirmDanger, setConfirmDanger] = useState<{ type: 'tasks' | 'notes' | 'all', step: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Supabase 同步状态
    const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationStatus, setMigrationStatus] = useState<string>('');
    const [supabaseStats, setSupabaseStats] = useState<{ tasksCount: number; notesCount: number } | null>(null);

    // 检查 Supabase 连接状态
    useEffect(() => {
        if (isOpen) {
            checkSupabaseConnection().then(setIsSupabaseConnected);
            getSupabaseStats().then(stats => {
                if (!stats.error) {
                    setSupabaseStats(stats);
                }
            });
        }
    }, [isOpen]);

    const handleModeChange = (mode: SortMode) => {
        onUpdate({ ...config, mode });
    };

    const handleDirectionChange = (direction: SortDirection) => {
        onUpdate({ ...config, direction });
    };

    const handleStreamModeChange = (mode: StreamMode) => {
        onUpdateStream({ ...streamConfig, mode });
    };

    const handleStreamSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const speed = parseInt(e.target.value, 10);
        onUpdateStream({ ...streamConfig, speed });
    };

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

    const getSortLabels = () => {
        if (config.mode === 'created') return { asc: '最早', desc: '最晚' };
        if (config.mode === 'progress') return { asc: '最低', desc: '最高' };
        return { asc: '正序', desc: '倒序' };
    };

    const sortLabels = getSortLabels();

    const handleExport = () => {
        const exportData = {
            version: 2,
            exportDate: new Date().toISOString(),
            tasks,
            quickNotes
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eisenhower-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                const tasksToImport = data.tasks || [];
                const notesToImport = data.quickNotes || [];

                if (window.confirm(`确认导入 ${tasksToImport.length} 个任务和 ${notesToImport.length} 条闪念吗？`)) {
                    onImport(tasksToImport, notesToImport);
                    alert('导入成功！');
                    onClose();
                }
            } catch (error) {
                alert('导入失败：文件格式错误');
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // 上传到 Supabase
    const handleUploadToSupabase = async () => {
        setIsMigrating(true);
        setMigrationStatus('正在上传数据到 Supabase...');

        try {
            const result = await migrateAllData();

            if (result.success) {
                setMigrationStatus(`✅ 成功上传 ${result.tasksCount} 个任务和 ${result.notesCount} 条闪念`);
                // 刷新统计
                const stats = await getSupabaseStats();
                if (!stats.error) {
                    setSupabaseStats(stats);
                }
                setTimeout(() => setMigrationStatus(''), 3000);
            } else {
                setMigrationStatus(`❌ 上传失败: ${result.errors.join(', ')}`);
            }
        } catch (e) {
            setMigrationStatus(`❌ 上传异常: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setIsMigrating(false);
        }
    };

    // 从 Supabase 下载
    const handleDownloadFromSupabase = async () => {
        if (!window.confirm('这将用 Supabase 中的数据替换本地所有数据,确认继续吗?')) {
            return;
        }

        setIsMigrating(true);
        setMigrationStatus('正在从 Supabase 下载数据...');

        try {
            const result = await syncFromSupabase();

            if (result.success) {
                setMigrationStatus(`✅ 成功下载 ${result.tasksCount} 个任务和 ${result.notesCount} 条闪念`);
                setTimeout(() => {
                    setMigrationStatus('');
                    window.location.reload(); // 刷新页面以加载新数据
                }, 2000);
            } else {
                setMigrationStatus(`❌ 下载失败: ${result.errors.join(', ')}`);
            }
        } catch (e) {
            setMigrationStatus(`❌ 下载异常: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="系统设置" className="max-w-lg">
            <div className="space-y-8 py-2 relative">

                {/* Sorting Settings - Compact */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                        事项排序规则
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'custom', icon: GripVertical, label: '自由拖动' },
                            { id: 'created', icon: Calendar, label: '创建时间' },
                            { id: 'progress', icon: Percent, label: '完成进度' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleModeChange(item.id as SortMode)}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                                ${config.mode === item.id
                                        ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-300 shadow-sm'
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10'
                                    }
                            `}
                            >
                                <item.icon size={20} />
                                <span className="text-xs font-bold">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {config.mode !== 'custom' && (
                        <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
                            <button
                                onClick={() => handleDirectionChange('asc')}
                                className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium transition-all
                                ${config.direction === 'asc'
                                        ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-300'
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400'
                                    }
                             `}
                            >
                                <ArrowUpNarrowWide size={14} /> {sortLabels.asc}
                            </button>
                            <button
                                onClick={() => handleDirectionChange('desc')}
                                className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium transition-all
                                ${config.direction === 'desc'
                                        ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-300'
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400'
                                    }
                             `}
                            >
                                <ArrowDownNarrowWide size={14} /> {sortLabels.desc}
                            </button>
                        </div>
                    )}
                </div>

                {/* Stream Settings */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                        闪念显示模式
                    </h3>
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'scroll', icon: PlayCircle, label: '滚动展示' },
                                { id: 'static', icon: PauseCircle, label: '静止展示' },
                                { id: 'hidden', icon: EyeOff, label: '隐藏两侧' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleStreamModeChange(item.id as StreamMode)}
                                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                                    ${streamConfig.mode === item.id
                                            ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-300 shadow-sm'
                                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10'
                                        }
                                `}
                                >
                                    <item.icon size={20} />
                                    <span className="text-xs font-bold">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        {streamConfig.mode === 'static' && (
                            <div className="text-xs text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-white/5 p-2 rounded-lg text-center animate-in fade-in">
                                每10秒自动轮播更换展示内容，铺满侧边栏
                            </div>
                        )}

                        {streamConfig.mode === 'scroll' && (
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl animate-in fade-in border border-slate-100 dark:border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-gray-400">
                                        <Gauge size={14} /> 滚动速度
                                    </div>
                                    <span className="text-xs font-mono text-purple-600 dark:text-purple-400">{streamConfig.speed} px/s</span>
                                </div>
                                <input
                                    type="range"
                                    min="20"
                                    max="180"
                                    step="5"
                                    value={typeof streamConfig.speed === 'number' ? streamConfig.speed : 50}
                                    onChange={handleStreamSpeedChange}
                                    className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                                <div className="flex justify-between mt-1 text-[10px] text-slate-400 uppercase font-bold">
                                    <span>Slow</span>
                                    <span>Fast</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Data Management */}
                <div>
                    <h3 className="text-xs font-bold text-emerald-400 dark:text-emerald-500/80 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                        数据管理
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {/* 导出数据 */}
                        <button
                            onClick={handleExport}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group bg-white dark:bg-white/5"
                        >
                            <Download size={24} className="text-blue-600 dark:text-blue-400" />
                            <div className="text-center">
                                <div className="text-sm font-bold text-slate-700 dark:text-gray-200">导出数据</div>
                                <div className="text-xs text-slate-500 dark:text-gray-400">备份所有任务和闪念</div>
                            </div>
                        </button>

                        {/* 导入数据 */}
                        <label className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all cursor-pointer group bg-white dark:bg-white/5">
                            <Upload size={24} className="text-emerald-600 dark:text-emerald-400" />
                            <div className="text-center">
                                <div className="text-sm font-bold text-slate-700 dark:text-gray-200">导入数据</div>
                                <div className="text-xs text-slate-500 dark:text-gray-400">从备份文件恢复</div>
                            </div>
                            <input type="file" accept=".json" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                        </label>
                    </div>

                    {/* Supabase 云端同步 */}
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-sky-400 dark:text-sky-500/80 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-sky-500"></div>
                                云端同步
                            </h4>
                            <div className="flex items-center gap-2">
                                {isSupabaseConnected ? (
                                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                        <Cloud size={14} />
                                        <span>已连接</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <CloudOff size={14} />
                                        <span>未连接</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {supabaseStats && (
                            <div className="mb-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                                <div className="text-xs text-slate-600 dark:text-gray-400 space-y-1">
                                    <div className="flex justify-between">
                                        <span>云端任务:</span>
                                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{supabaseStats.tasksCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>云端闪念:</span>
                                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{supabaseStats.notesCount}</span>
                                    </div>
                                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-white/10">
                                        <span>本地任务:</span>
                                        <span className="font-mono font-bold text-slate-700 dark:text-gray-200">{tasks.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>本地闪念:</span>
                                        <span className="font-mono font-bold text-slate-700 dark:text-gray-200">{quickNotes.length}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            {/* 上传到云端 */}
                            <button
                                onClick={handleUploadToSupabase}
                                disabled={!isSupabaseConnected || isMigrating}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 dark:border-white/10 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all group bg-white dark:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Cloud size={24} className="text-sky-600 dark:text-sky-400" />
                                <div className="text-center">
                                    <div className="text-sm font-bold text-slate-700 dark:text-gray-200">上传到云端</div>
                                    <div className="text-xs text-slate-500 dark:text-gray-400">同步到 Supabase</div>
                                </div>
                            </button>

                            {/* 从云端下载 */}
                            <button
                                onClick={handleDownloadFromSupabase}
                                disabled={!isSupabaseConnected || isMigrating}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group bg-white dark:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download size={24} className="text-indigo-600 dark:text-indigo-400" />
                                <div className="text-center">
                                    <div className="text-sm font-bold text-slate-700 dark:text-gray-200">从云端下载</div>
                                    <div className="text-xs text-slate-500 dark:text-gray-400">替换本地数据</div>
                                </div>
                            </button>
                        </div>

                        {/* 同步状态提示 */}
                        {migrationStatus && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-lg animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-start gap-2">
                                    {isMigrating ? (
                                        <RefreshCw size={16} className="text-blue-600 dark:text-blue-400 animate-spin mt-0.5" />
                                    ) : (
                                        <CheckCircle size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                                    )}
                                    <p className="text-xs text-blue-700 dark:text-blue-300 flex-1">{migrationStatus}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Data Cleanup */}
                <div>
                    <h3 className="text-xs font-bold text-red-400 dark:text-red-500/80 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500"></div>
                        数据清理
                    </h3>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => triggerDanger('tasks')}
                            className="flex items-center justify-between p-3 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Trash2 size={18} />
                                <span className="text-sm font-bold">清除所有代办任务</span>
                            </div>
                            <span className="text-xs opacity-60 group-hover:opacity-100">不可恢复</span>
                        </button>

                        <button
                            onClick={() => triggerDanger('notes')}
                            className="flex items-center justify-between p-3 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Trash2 size={18} />
                                <span className="text-sm font-bold">清除所有闪念笔记</span>
                            </div>
                            <span className="text-xs opacity-60 group-hover:opacity-100">不可恢复</span>
                        </button>

                        <button
                            onClick={() => triggerDanger('all')}
                            className="flex items-center justify-between p-3 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-100/50 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 transition-colors group mt-1"
                        >
                            <div className="flex items-center gap-3">
                                <RefreshCw size={18} />
                                <span className="text-sm font-bold">完全格式化 (清空数据)</span>
                            </div>
                            <span className="text-xs font-bold bg-red-200 dark:bg-red-500/30 px-2 py-0.5 rounded">慎用</span>
                        </button>
                    </div>
                </div>

                {/* Confirmation Overlay */}
                {confirmDanger && (
                    <div className="absolute inset-0 bg-white/95 dark:bg-[#1a1f35]/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center rounded-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            确认删除{confirmDanger.type === 'all' ? '所有数据' : (confirmDanger.type === 'tasks' ? '所有任务' : '所有闪念')}？
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-gray-400 mb-8 max-w-[80%]">
                            此操作将永久删除本地存储的数据，<br />删除后将<span className="font-bold text-red-500">无法恢复</span>。
                        </p>
                        <div className="flex gap-3 w-full max-w-xs">
                            <button
                                onClick={() => setConfirmDanger(null)}
                                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={confirmDangerAction}
                                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/30 animate-pulse hover:animate-none transition-all"
                            >
                                确认删除
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </Modal>
    );
};
