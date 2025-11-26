import React from 'react';

export const ScrollingItem = React.memo(({ text }: { text: string }) => {
    return (
        <div className="w-full flex justify-center px-4 pb-4 group relative">
            <div className="relative max-w-[90%] md:max-w-[70%] flex items-center justify-center">
                <span className={`
                    whitespace-normal break-words text-center leading-relaxed px-6 py-3 rounded-2xl text-sm font-medium tracking-wide
                    bg-white/40 backdrop-blur-md border border-white/20 shadow-sm text-slate-600
                    transition-all duration-300 hover:scale-105 hover:bg-white/60 hover:shadow-md hover:text-slate-800
                    cursor-default select-none
                    dark:text-white/90 dark:bg-white/[0.05] dark:border-white/10 dark:hover:bg-white/15 dark:backdrop-blur-sm
                `}>
                    {text}
                </span>
            </div>
        </div>
    );
});
