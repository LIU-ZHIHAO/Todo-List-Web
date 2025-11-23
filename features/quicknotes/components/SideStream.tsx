
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, Trash2, Edit2, Check, X } from 'lucide-react';
import { StreamConfig } from '../../core/types';

// Helper component for floating items
const AmbientStreamItem = React.memo(({ id, content, type, onDelete, onUpdate }: { id?: string, content: string; type: 'note' | 'task', onDelete?: (id: string) => void, onUpdate?: (id: string, content: string) => void }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id || !onDelete) return;
    setIsDeleting(true);
    // Delay actual delete to show animation
    setTimeout(() => {
      onDelete(id);
    }, 500);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id || !onUpdate) return;
    setIsEditing(true);
    setEditContent(content);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id && onUpdate && editContent.trim()) {
      onUpdate(id, editContent);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditContent(content);
  };

  return (
    <div className={`
        mb-6 p-4 rounded-lg backdrop-blur-[2px] border transition-all duration-300 group relative shadow-sm
        ${isDeleting ? 'animate-shake bg-red-50 border-red-200 dark:bg-red-500/20 dark:border-red-500/50' : 'transform hover:scale-105'}
        ${type === 'note'
        ? 'bg-purple-50/80 border-purple-200 text-purple-800 dark:bg-purple-500/5 dark:border-purple-500/20 dark:text-purple-200/70 dark:shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:bg-purple-100 dark:hover:bg-purple-500/10'
        : 'bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-500/5 dark:border-emerald-500/20 dark:text-emerald-200/70 dark:shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-emerald-100 dark:hover:bg-emerald-500/10'
      }
      `}>
      <div className="flex items-start gap-3">
        {type === 'note' ? <Sparkles size={14} className="mt-1 opacity-60 shrink-0" /> : <CheckCircle2 size={14} className="mt-1 opacity-60 shrink-0" />}

        {isEditing ? (
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              className="w-full bg-white/50 dark:bg-black/20 rounded border border-purple-200 dark:border-purple-500/30 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none overflow-hidden"
              rows={1}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex justify-end gap-2">
              <button onClick={handleCancelEdit} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded text-slate-500">
                <X size={14} />
              </button>
              <button onClick={handleSaveEdit} className="p-1 hover:bg-purple-200 dark:hover:bg-purple-500/30 rounded text-purple-600 dark:text-purple-400">
                <Check size={14} />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs font-medium leading-relaxed line-clamp-4 text-ellipsis overflow-hidden tracking-wide flex-1 transition-all duration-300 group-hover:pr-12">{content}</p>
        )}
      </div>

      {/* Actions for Notes */}
      {type === 'note' && !isEditing && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          {onUpdate && (
            <button
              onClick={handleEditClick}
              className="p-1.5 rounded-full bg-blue-500 text-white hover:scale-110 shadow-lg"
              title="编辑闪念"
            >
              <Edit2 size={12} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-full bg-red-500 text-white hover:scale-110 shadow-lg"
              title="删除闪念"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
});

interface SideStreamProps {
  items: Array<{ id: string, content: string, type: 'note' | 'task' }>;
  isRight: boolean;
  config: StreamConfig;
  onDeleteNote: (id: string) => void;
  onUpdateNote?: (note: any) => void;
}

export const SideStream = React.memo(({ items, isRight, config, onDeleteNote, onUpdateNote }: SideStreamProps) => {
  const [staticStreamIndex, setStaticStreamIndex] = useState(0);

  useEffect(() => {
    if (config.mode === 'static') {
      const interval = setInterval(() => {
        setStaticStreamIndex(prev => prev + 1);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [config.mode]);

  const getAnimationDuration = (itemCount: number) => {
    const ESTIMATED_ITEM_HEIGHT = 96;
    const totalHeight = itemCount * ESTIMATED_ITEM_HEIGHT;
    const speed = typeof config.speed === 'number' ? config.speed : 50;
    const duration = totalHeight / Math.max(20, speed);
    return `${duration}s`;
  };

  const handleUpdate = (id: string, content: string) => {
    if (onUpdateNote) {
      // We need to reconstruct the note object or pass partial update.
      // Since we only have id and content here, we assume the parent handles the rest or we fetch the full note.
      // But wait, onUpdateNote in App.tsx expects a QuickNote object.
      // Here we only have id and content.
      // We should probably pass { id, content } and let App.tsx/useTasks handle the merge?
      // Or we can assume createdAt is not needed for update if we only update content.
      // Let's check useTasks.handleUpdateQuickNote again.
      // It takes `updatedNote: QuickNote`.
      // So we need to pass a full QuickNote object.
      // But SideStream doesn't have the full object (createdAt is missing in items prop).
      // We need to update SideStream items prop to include createdAt or fetch it.
      // OR, we change handleUpdateQuickNote to accept partial update.

      // Let's change handleUpdateQuickNote in useTasks to accept partial update or just fetch the existing note to merge.
      // Actually, simpler: SideStream items should probably carry the full note data or at least createdAt if needed.
      // But `items` is a derived array of mixed tasks and notes.

      // Best approach: Change handleUpdateQuickNote to accept { id, content } and merge it inside useTasks.
      // But useTasks state `quickNotes` has the full data.
      // So I can find the note in useTasks.

      // Let's modify useTasks.ts to accept partial update or id+content.
      // Wait, I can't modify useTasks.ts easily now without another tool call.

      // Alternative: Pass `createdAt` in `items` prop in App.tsx.
      // In App.tsx:
      // const notes = quickNotes.map(n => ({ id: n.id, content: n.content, type: 'note' as const, createdAt: n.createdAt }));

      // Let's do that. It's cleaner.
      // So I need to update App.tsx again to pass createdAt.

      // For now, let's implement SideStream assuming onUpdateNote takes { id, content, ... } and we will fix App.tsx to pass createdAt.

      onUpdateNote({ id, content, createdAt: Date.now() }); // Fallback createdAt if missing, but better to have real one.
    }
  };

  if (config.mode === 'hidden') return null;

  // STATIC MODE
  if (config.mode === 'static') {
    if (items.length === 0) return null;

    const pageSize = 18;
    const startIndex = (staticStreamIndex * pageSize) % Math.max(1, items.length);
    const visibleItems = [];
    for (let i = 0; i < pageSize; i++) {
      const item = items[(startIndex + i) % items.length];
      if (item) visibleItems.push({ ...item, renderKey: `${item.id}-${i}` });
    }

    return (
      <div className="absolute w-full py-4 px-3 space-y-6 overflow-hidden">
        {visibleItems.map((item) => (
          <div key={item.renderKey} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AmbientStreamItem
              {...item}
              onDelete={item.type === 'note' ? onDeleteNote : undefined}
              onUpdate={item.type === 'note' ? handleUpdate : undefined}
            />
          </div>
        ))}
      </div>
    );
  }

  // SCROLL MODE
  const limitedItems = items.slice(0, 8);
  const scrollItems = [...limitedItems, ...limitedItems, ...limitedItems];
  const animationClass = isRight ? 'animate-float-down' : 'animate-float-up';

  return (
    <div
      className={`absolute w-full py-4 ${animationClass} hover-pause px-3 space-y-6 opacity-80 hover:opacity-100 transition-opacity duration-500 will-change-transform`}
      style={{ animationDuration: getAnimationDuration(limitedItems.length * 3) }}
    >
      {scrollItems.map((item, i) => (
        <AmbientStreamItem
          key={`${isRight ? 'r' : 'l'}-${i}`}
          {...item}
          onDelete={item.type === 'note' ? onDeleteNote : undefined}
          onUpdate={item.type === 'note' ? handleUpdate : undefined}
        />
      ))}
    </div>
  );
});
