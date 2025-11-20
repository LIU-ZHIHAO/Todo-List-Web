
import React from 'react';
import { Modal } from './ui/Modal';
import { Sparkles, Mail, MessageCircle, Tag } from 'lucide-react';

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  version?: string;
}

export const AuthorModal: React.FC<AuthorModalProps> = ({ isOpen, onClose, version }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="关于作品" className="max-w-md">
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        
        {/* Avatar / Logo Area */}
        <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full blur-xl opacity-20 dark:opacity-50 animate-pulse"></div>
            <div className="relative w-full h-full bg-white dark:bg-[#0f172a] rounded-full border-2 border-slate-100 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-xl">
                <Sparkles size={40} className="text-blue-500 dark:text-blue-400" />
            </div>
        </div>

        <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">四象限代办清单</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">探索极简与个性化的交互边界</p>
            {version && (
                 <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mt-1">
                    <Tag size={12} className="text-slate-500" />
                    <span className="text-xs font-mono text-slate-500 dark:text-gray-400">v{version}</span>
                 </div>
            )}
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent"></div>

        <div className="grid grid-cols-1 gap-3 w-full px-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-default group">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 group-hover:text-green-500 dark:group-hover:text-green-300">
                    <MessageCircle size={18} />
                </div>
                <div className="text-left">
                    <div className="text-xs text-slate-500">联系微信</div>
                    <div className="text-sm text-slate-700 dark:text-gray-200">zhihao779（加好友请备注来意）</div>
                </div>
            </div>
             <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-default group">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:text-purple-500 dark:group-hover:text-purple-300">
                    <Mail size={18} />
                </div>
                <div className="text-left">
                    <div className="text-xs text-slate-500">邮箱👇</div>
                    <div className="text-sm text-slate-700 dark:text-gray-200">1211574210@qq.com</div>
                </div>
            </div>
        </div>

        <div className="text-xs text-slate-400 dark:text-gray-600 pt-4">
            © {new Date().getFullYear()} Todo List System for zhihao. All rights reserved.
        </div>
      </div>
    </Modal>
  );
};
