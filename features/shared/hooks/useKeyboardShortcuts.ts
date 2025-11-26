import { useEffect } from 'react';

interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean; // Command key on Mac
    action: () => void;
    preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            shortcuts.forEach(config => {
                const keyMatch = e.key.toLowerCase() === config.key.toLowerCase();
                const ctrlMatch = config.ctrl ? (e.ctrlKey || e.metaKey) : true; // Treat Ctrl and Meta (Cmd) as equivalent for "ctrl" config usually
                // But if we want strict distinction:
                // const ctrlMatch = config.ctrl ? e.ctrlKey : !e.ctrlKey;
                // const metaMatch = config.meta ? e.metaKey : !e.metaKey;

                // Let's use a more flexible approach:
                // If config.ctrl is true, e.ctrlKey OR e.metaKey must be true.
                // If config.ctrl is undefined/false, we don't strictly enforce it NOT being pressed unless we want to avoid conflicts.
                // Usually for shortcuts like Ctrl+N, we check e.ctrlKey.

                const isCtrlPressed = e.ctrlKey || e.metaKey;
                const isShiftPressed = e.shiftKey;
                const isAltPressed = e.altKey;

                if (
                    keyMatch &&
                    (!!config.ctrl === isCtrlPressed) &&
                    (!!config.shift === isShiftPressed) &&
                    (!!config.alt === isAltPressed)
                ) {
                    if (config.preventDefault !== false) {
                        e.preventDefault();
                    }
                    config.action();
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};
