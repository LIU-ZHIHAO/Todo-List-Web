import React from 'react';
import { Keyboard, Command } from 'lucide-react';

interface Shortcut {
    id: string;
    label: string;
    keys: string[];
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
    { id: 'new_task', label: '新建待办 (第二象限)', keys: ['Alt', 'N'] },
    { id: 'quick_note', label: '聚焦闪念输入框', keys: ['Alt', 'I'] },
    { id: 'open_library', label: '打开闪念胶囊库', keys: ['Alt', 'K'] },
    { id: 'open_help', label: '打开帮助', keys: ['Alt', '/'] },
    { id: 'close_modals', label: '关闭弹窗', keys: ['Esc'] },
];

export const ShortcutSettings = () => {
    return (
        <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Keyboard size={16} /> 快捷键配置
                </h3>

                <div className="space-y-2">
                    {DEFAULT_SHORTCUTS.map((shortcut) => (
                        <div key={shortcut.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{shortcut.label}</span>
                            <div className="flex items-center gap-1">
                                {shortcut.keys.map((key, index) => (
                                    <kbd key={index} className="px-2 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 text-[10px] text-slate-400 text-center">
                    * 目前快捷键暂不支持自定义，将在后续版本开放
                </div>
            </div>
        </div>
    );
};
