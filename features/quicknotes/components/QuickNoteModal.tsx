import React, { useState, useMemo } from 'react';
import { Search, Tag, Trash2, ArrowRightCircle, Edit2, X, Calendar, Copy } from 'lucide-react';
import { QuickNote } from '../../core/types';
import { Modal } from '../../shared/components/ui/Modal';

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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    // Extract all unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
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

    const handleEditStart = (note: QuickNote) => {
        setEditingId(note.id);
        setEditContent(note.content);
    };

    const handleEditSave = (note: QuickNote) => {
        if (editContent.trim() !== note.content) {
            onUpdate({ ...note, content: editContent });
        }
        setEditingId(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="闪念胶囊库" className="max-w-4xl h-[80vh] flex flex-col">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="搜索闪念..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                    />
                </div>

                {allTags.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 max-w-md">
                        <button
                            onClick={() => setSelectedTag(null)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                                ${!selectedTag
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                        >
                            全部
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1
                                    ${tag === selectedTag
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                            >
                                <Tag size={12} />
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {filteredNotes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredNotes.map(note => (
                            <div
                                key={note.id}
                                className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/30 transition-all duration-200 flex flex-col gap-3"
                            >
                                {/* Content */}
                                <div className="flex-1">
                                    {editingId === note.id ? (
                                        <textarea
                                            autoFocus
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            onBlur={() => handleEditSave(note)}
                                            className="w-full h-full min-h-[80px] bg-transparent resize-none focus:outline-none text-sm"
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                                            {note.content}
                                        </p>
                                    )}
                                </div>

                                {/* Meta & Actions */}
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Calendar size={12} />
                                        {new Date(note.createdAt).toLocaleDateString()}
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditStart(note)}
                                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-purple-600 transition-colors"
                                            title="编辑"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => onConvertToTask(note)}
                                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-blue-600 transition-colors"
                                            title="转为任务"
                                        >
                                            <ArrowRightCircle size={14} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(note.id)}
                                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-red-600 transition-colors"
                                            title="删除"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-500">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                            <Search size={32} className="opacity-50" />
                        </div>
                        <p>没有找到相关闪念</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};
