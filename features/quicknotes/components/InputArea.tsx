
import React, { useState } from 'react';
import { Zap } from 'lucide-react';

interface InputAreaProps {
    onAddNote: (content: string) => void;
}

export const InputArea = React.memo(({ onAddNote }: InputAreaProps) => {
    const [quickNoteInput, setQuickNoteInput] = useState('');

    const handleQuickNoteSubmit = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!quickNoteInput.trim()) return;
            onAddNote(quickNoteInput.trim());
            setQuickNoteInput('');
        }
    };

    return (
        <div className="w-full relative group">
            {/* Icon */}
            <div className="absolute inset-y-0 left-4 pl-1 flex items-center pointer-events-none z-10">
                <Zap size={18} className="text-yellow-500 dark:text-yellow-400 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-300 transition-colors drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
            </div>
            <input 
                type="text" 
                value={quickNoteInput}
                onChange={(e) => setQuickNoteInput(e.target.value)}
                onKeyDown={handleQuickNoteSubmit}
                placeholder="捕捉闪念... (Enter)"
                className="w-full h-12 bg-white/80 border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm dark:shadow-lg backdrop-blur-md"
            />
        </div>
    );
});
