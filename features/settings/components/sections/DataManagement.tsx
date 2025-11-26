import React, { useState, useRef } from 'react';
import { Download, Upload, Database, Cloud, CloudOff, FileJson, FileText, FileType } from 'lucide-react';
import { Task, QuickNote } from '../../../core/types';
import { exportAllData } from '../../../core/utils/export';
import { migrateAllData, syncFromSupabase, checkSupabaseConnection, getSupabaseStats } from '../../../core/utils/migration';

interface DataManagementProps {
    tasks: Task[];
    quickNotes: QuickNote[];
    onImport: (tasks: Task[], notes: QuickNote[]) => void;
    onClearData: (type: 'tasks' | 'notes' | 'all') => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ tasks, quickNotes, onImport, onClearData }) => {
    const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'markdown'>('json');
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationStatus, setMigrationStatus] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        exportAllData(tasks, quickNotes, exportFormat);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                // Simple JSON detection for now. 
                // TODO: Add CSV/Markdown parsing logic here or in a utility
                if (file.name.endsWith('.json')) {
                    const data = JSON.parse(content);
                    const tasksToImport = data.tasks || [];
                    const notesToImport = data.quickNotes || [];
                    if (window.confirm(`确认导入 ${tasksToImport.length} 个任务和 ${notesToImport.length} 条闪念吗？`)) {
                        onImport(tasksToImport, notesToImport);
                        alert('导入成功！');
                    }
                } else {
                    alert('目前仅支持 JSON 格式导入，CSV/Markdown 导入功能开发中...');
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

    const [supabaseStats, setSupabaseStats] = useState<{ tasks: number, notes: number } | null>(null);

    React.useEffect(() => {
        const fetchStats = async () => {
            if (navigator.onLine) {
                try {
                    const stats = await getSupabaseStats();
                    if (stats) {
                        setSupabaseStats({ tasks: stats.tasksCount, notes: stats.notesCount });
                    }
                } catch (e) {
                    console.error("Failed to fetch Supabase stats", e);
                }
            }
        };
        fetchStats();
    }, []);

    const handleUploadToSupabase = async () => {
        setIsMigrating(true);
        setMigrationStatus('正在上传数据到 Supabase...');
        try {
            const result = await migrateAllData();
            if (result.success) {
                setMigrationStatus(`✅ 成功上传 ${result.tasksCount} 个任务和 ${result.notesCount} 条闪念`);
                setSupabaseStats({ tasks: result.tasksCount, notes: result.notesCount });
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
                    window.location.reload();
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
        <div className="space-y-6">
            {/* Export Section */}
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Download size={16} /> 数据导出
                </h3>

                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setExportFormat('json')}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-2
                            ${exportFormat === 'json'
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                    >
                        <FileJson size={14} /> JSON
                    </button>
                    <button
                        onClick={() => setExportFormat('csv')}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-2
                            ${exportFormat === 'csv'
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                    >
                        <FileText size={14} /> CSV
                    </button>
                    <button
                        onClick={() => setExportFormat('markdown')}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-2
                            ${exportFormat === 'markdown'
                                ? 'bg-purple-500 text-white border-purple-500'
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                    >
                        <FileType size={14} /> Markdown
                    </button>
                </div>

                <button
                    onClick={handleExport}
                    className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    <Download size={16} /> 导出数据 ({exportFormat.toUpperCase()})
                </button>
            </div>

            {/* Import Section */}
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Upload size={16} /> 数据导入
                </h3>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json,.csv,.md"
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-lg text-slate-500 dark:text-slate-400 text-sm font-medium hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                    <Upload size={16} /> 选择文件导入 (JSON/CSV/MD)
                </button>
            </div>

            {/* Supabase Sync */}
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Database size={16} /> 云端同步 (Supabase)
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                    <div className="p-3 bg-white dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                        <div className="text-slate-500 dark:text-slate-400 mb-1">本地数据</div>
                        <div className="font-mono font-bold text-slate-700 dark:text-slate-200">
                            任务: {tasks.length} | 闪念: {quickNotes.length}
                        </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                        <div className="text-slate-500 dark:text-slate-400 mb-1">云端数据</div>
                        <div className="font-mono font-bold text-slate-700 dark:text-slate-200">
                            {supabaseStats ? (
                                <>任务: {supabaseStats.tasks} | 闪念: {supabaseStats.notes}</>
                            ) : (
                                <span className="text-slate-400">检查中...</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleUploadToSupabase}
                        disabled={isMigrating}
                        className="py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-bold hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Cloud size={16} /> 上传备份
                    </button>
                    <button
                        onClick={handleDownloadFromSupabase}
                        disabled={isMigrating}
                        className="py-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg text-sm font-bold hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <CloudOff size={16} /> 恢复数据
                    </button>
                </div>

                {migrationStatus && (
                    <div className="mt-3 text-xs text-center font-mono text-slate-500 dark:text-slate-400 animate-pulse">
                        {migrationStatus}
                    </div>
                )}
            </div>
        </div>
    );
};
