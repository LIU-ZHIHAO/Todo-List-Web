
import React, { useMemo, useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Trash2 } from 'lucide-react';
import { StreamConfig } from '../types';

// Helper component for floating items
const AmbientStreamItem = React.memo(({ id, content, type, onDelete }: { id?: string, content: string; type: 'note' | 'task', onDelete?: (id: string) => void }) => {
    const [isDeleting, setIsDeleting] = useState(false);
  
    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!id || !onDelete) return;
      setIsDeleting(true);
      // Delay actual delete to show animation
      setTimeout(() => {
        onDelete(id);
      }, 500);
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
          <p className="text-xs font-medium leading-relaxed line-clamp-4 text-ellipsis overflow-hidden tracking-wide flex-1 transition-all duration-300 group-hover:pr-6">{content}</p>
        </div>
        
        {/* Delete Button for Notes */}
        {type === 'note' && onDelete && (
          <button 
            onClick={handleDelete}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
            title="删除闪念"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    );
  });

interface SideStreamProps {
    items: Array<{ id: string, content: string, type: 'note' | 'task' }>;
    isRight: boolean;
    config: StreamConfig;
    onDeleteNote: (id: string) => void;
}

export const SideStream = React.memo(({ items, isRight, config, onDeleteNote }: SideStreamProps) => {
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
              />
           ))}
        </div>
    );
});
