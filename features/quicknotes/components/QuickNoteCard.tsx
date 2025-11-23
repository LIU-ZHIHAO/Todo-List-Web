import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Copy, ArrowRightCircle, Trash2, Check, Plus, X } from 'lucide-react';
import { QuickNote } from '../../core/types';

interface QuickNoteCardProps {
    note: QuickNote;
    onUpdate: (note: QuickNote) => void;
    onDelete: (id: string) => void;
    onConvertToTask: (note: QuickNote) => void;
}

export const QuickNoteCard: React.FC<QuickNoteCardProps> = ({
    note,
    onUpdate,
    onDelete,
    onConvertToTask
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(note.content);
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTag, setNewTag] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setContent(note.content);
    }, [note.content]);

    useEffect(() => {
        if (isAddingTag && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAddingTag]);

    const handleSave = () => {
        if (content.trim() !== note.content) {
            onUpdate({ ...note, content: content });
        }
        setIsEditing(false);
    };

    const handleCopy = async () => {
        try {
            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(note.content);
                setShowCopyFeedback(true);
                setTimeout(() => setShowCopyFeedback(false), 2000);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = note.content;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    setShowCopyFeedback(true);
                    setTimeout(() => setShowCopyFeedback(false), 2000);
                } catch (err) {
                    console.error('Fallback copy failed:', err);
                    alert('复制失败，请手动复制');
                }
                document.body.removeChild(textArea);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
            // Try fallback method
            const textArea = document.createElement('textarea');
            textArea.value = note.content;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setShowCopyFeedback(true);
                setTimeout(() => setShowCopyFeedback(false), 2000);
            } catch (fallbackErr) {
                alert('复制失败，请手动复制');
            }
            document.body.removeChild(textArea);
        }
    };

    const handleAddTag = () => {
        if (newTag.trim()) {
            const currentTags = note.tags || [];
            if (!currentTags.includes(newTag.trim())) {
                onUpdate({ ...note, tags: [...currentTags, newTag.trim()] });
            }
            setNewTag('');
            setIsAddingTag(false);
        }
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = note.tags || [];
        onUpdate({ ...note, tags: currentTags.filter(t => t !== tagToRemove) });
    };

    return (
        <div className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl p-3 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-500/20 transition-all duration-200 flex flex-col gap-2">
            {/* Content Area */}
            <div className="flex-1 min-h-[60px]">
                {isEditing ? (
                    <textarea
                        autoFocus
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onBlur={handleSave}
                        className="w-full h-full min-h-[80px] bg-purple-50/50 dark:bg-purple-500/5 resize-none focus:outline-none text-sm leading-relaxed p-2 rounded border border-purple-200 dark:border-purple-500/30"
                    />
                ) : (
                    <p
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-slate-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed cursor-text hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        {note.content}
                    </p>
                )}
            </div>

            {/* Tags Area */}
            <div className="flex flex-wrap gap-1.5 items-center min-h-[24px] pt-2 border-t border-slate-100 dark:border-white/5">
                {note.tags?.map(tag => (
                    <span key={tag} className="group/tag inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-500/20">
                        #{tag}
                        <button
                            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                            className="opacity-0 group-hover/tag:opacity-100 hover:text-red-500 transition-opacity"
                        >
                            <X size={10} />
                        </button>
                    </span>
                ))}

                {isAddingTag ? (
                    <div className="flex items-center gap-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddTag();
                                if (e.key === 'Escape') setIsAddingTag(false);
                            }}
                            onBlur={() => {
                                if (newTag) handleAddTag();
                                setIsAddingTag(false);
                            }}
                            className="w-16 px-1 py-0.5 text-[10px] border border-purple-200 rounded focus:outline-none focus:border-purple-400 bg-white dark:bg-slate-900 dark:border-white/10 dark:text-white"
                            placeholder="新标签..."
                        />
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAddingTag(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-purple-500 border border-transparent hover:border-purple-200 transition-colors"
                        title="添加标签"
                    >
                        <Plus size={10} className="inline mr-1" /> 添加
                    </button>
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <Calendar size={10} />
                    {new Date(note.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleCopy}
                        className={`p-1.5 rounded-lg transition-colors ${showCopyFeedback ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-blue-500'}`}
                        title="复制内容"
                    >
                        {showCopyFeedback ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                        onClick={() => onConvertToTask(note)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="转为任务"
                    >
                        <ArrowRightCircle size={14} />
                    </button>
                    <button
                        onClick={() => onDelete(note.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-600 transition-colors"
                        title="删除"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
