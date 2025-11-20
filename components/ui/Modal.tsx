
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
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className={`relative w-full bg-[#1a1f35]/90 border border-white/10 rounded-2xl shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in duration-200 ${className} max-h-[90vh] overflow-y-auto custom-scrollbar`}>
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#1a1f35]/95 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
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
