import React from 'react';
import { Modal } from './ui/Modal';
import { Sparkles, Github, Mail, Globe } from 'lucide-react';

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthorModal: React.FC<AuthorModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="关于作品" className="max-w-md">
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        
        {/* Avatar / Logo Area */}
        <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative w-full h-full bg-[#0f172a] rounded-full border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                <Sparkles size={40} className="text-blue-400" />
            </div>
        </div>

        <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">志豪的设计作品</h3>
            <p className="text-sm text-gray-400">探索极简与科技感的交互边界</p>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <div className="grid grid-cols-1 gap-3 w-full px-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-default group">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:text-blue-300">
                    <Globe size={18} />
                </div>
                <div className="text-left">
                    <div className="text-xs text-gray-500">Design Philosophy</div>
                    <div className="text-sm text-gray-200">Glassmorphism UI / UX</div>
                </div>
            </div>
             <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-default group">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:text-purple-300">
                    <Mail size={18} />
                </div>
                <div className="text-left">
                    <div className="text-xs text-gray-500">Contact</div>
                    <div className="text-sm text-gray-200">1211574210@qq.com</div>
                </div>
            </div>
        </div>

        <div className="text-xs text-gray-600 pt-4">
            © {new Date().getFullYear()} Eisenhower Matrix Todo. All rights reserved.
        </div>
      </div>
    </Modal>
  );
};