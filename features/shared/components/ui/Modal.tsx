
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  zIndex?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = '', zIndex = 'z-50' }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 ${zIndex}`}>
      {/* Backdrop: Light mode is slightly darker gray, Dark mode remains black/60 */}
      <div 
        className="absolute inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      {/* Modal Content: Light mode is white with shadow, Dark mode is deep blue */}
      <div className={`relative w-full bg-white dark:bg-[#1a1f35]/90 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in duration-200 ${className} max-h-[90vh] overflow-y-auto custom-scrollbar`}>
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/10 bg-white/95 dark:bg-[#1a1f35]/95 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
