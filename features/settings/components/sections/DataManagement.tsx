import React, { useState, useRef } from 'react';
import { Download, Upload, FileJson, FileText, FileType } from 'lucide-react';
import { Task, QuickNote } from '../../../core/types';
import { exportAllData } from '../../../core/utils/export';

interface DataManagementProps {
    tasks: Task[];
    quickNotes: QuickNote[];
    onImport: (tasks: Task[], notes: QuickNote[]) => void;
    onClearData: (type: 'tasks' | 'notes' | 'all') => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ tasks, quickNotes, onImport, onClearData }) => {
    const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'markdown'>('json');
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
        </div>
    );
};
