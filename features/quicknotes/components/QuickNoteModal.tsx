import React, { useState, useMemo } from 'react';
import { Search, Tag } from 'lucide-react';
import { QuickNote } from '../../core/types';
import { Modal } from '../../shared/components/ui/Modal';
import { QuickNoteCard } from './QuickNoteCard';

interface QuickNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    notes: QuickNote[];
    onDelete: (id: string) => void;
    onUpdate: (note: QuickNote) => void;
    onConvertToTask: (note: QuickNote) => void;
}

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({
    isOpen,
    onClose,
    notes,
    onDelete,
    onUpdate,
    onConvertToTask
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Extract all unique tags
    const allTags = useMemo(() => {
        const predefinedTags = ['学业知识', '自我成长', '一闪一念', '兴趣爱好', '内容创作', 'AI领域', '生活日常', '工作搞钱'];
        const tags = new Set<string>(predefinedTags);
        notes.forEach(note => {
            note.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags);
    }, [notes]);

    // Filter notes
    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const matchesSearch = note.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTag = selectedTag ? note.tags?.includes(selectedTag) : true;
            return matchesSearch && matchesTag;
        }).sort((a, b) => b.createdAt - a.createdAt);
    }, [notes, searchQuery, selectedTag]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="闪念库" className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden">
            <div className="flex h-full">
                {/* Sidebar - Tags */}
                <div className="w-32 md:w-48 bg-slate-50 dark:bg-black/20 border-r border-slate-200 dark:border-white/10 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-200 dark:border-white/10">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">标签分类</h3>
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group
                                ${!selectedTag
                                    ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                        >
                            <span className="flex items-center gap-2">
                                <Tag size={14} /> 全部闪念
                            </span>
                            <span className="text-xs opacity-60">{notes.length}</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {allTags.map(tag => {
                            const count = notes.filter(n => n.tags?.includes(tag)).length;
                            return (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group
                                        ${tag === selectedTag
                                            ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-medium'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                                        {tag}
                                    </span>
                                    <span className="text-xs opacity-50 group-hover:opacity-100 transition-opacity">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
                    {/* Search Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="搜索闪念内容..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all"
                            />
                        </div>
                        <div className="text-xs text-slate-400">
                            共 {filteredNotes.length} 条
                        </div>
                    </div>

                    {/* Notes Grid */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-50/50 dark:bg-black/10">
                        {filteredNotes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {filteredNotes.map(note => (
                                    <QuickNoteCard
                                        key={note.id}
                                        note={note}
                                        onUpdate={onUpdate}
                                        onDelete={onDelete}
                                        onConvertToTask={onConvertToTask}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-500">
                                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                                    <Search size={40} className="opacity-30" />
                                </div>
                                <p className="text-sm font-medium">没有找到相关闪念</p>
                                <p className="text-xs opacity-60 mt-1">尝试切换标签或搜索其他关键词</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
