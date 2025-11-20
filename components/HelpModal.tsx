
import React from 'react';
import { Modal } from './ui/Modal';
import { LayoutGrid, Zap, MousePointerClick, History } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="使用说明手册" className="max-w-2xl">
      <div className="space-y-8 py-2">
        
        {/* 1. Core Concept */}
        <section className="space-y-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <LayoutGrid className="text-blue-500" size={20} />
                核心理念：四象限法则
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                    <div className="font-bold text-red-600 dark:text-red-400 mb-1">Q1 重要且紧急</div>
                    <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                        <span className="font-semibold">马上做</span>。如危机、截止日期的任务。
                    </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Q2 重要不紧急</div>
                    <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                        <span className="font-semibold">计划做</span>。如学习、锻炼、长期规划。这是高效能人士关注的重点。
                    </p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20">
                    <div className="font-bold text-yellow-600 dark:text-yellow-400 mb-1">Q3 不重要不紧急</div>
                    <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                        <span className="font-semibold">减少做</span>。如无目的的刷剧、发呆。
                    </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                    <div className="font-bold text-blue-600 dark:text-blue-400 mb-1">Q4 紧急不重要</div>
                    <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                        <span className="font-semibold">授权做</span>。如突如其来的干扰、某些会议。
                    </p>
                </div>
            </div>
        </section>

        <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

        {/* 2. Features */}
        <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <MousePointerClick className="text-purple-500" size={20} />
                操作指南
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-gray-300">
                <li className="flex gap-3">
                    <div className="min-w-[24px] h-6 flex items-center justify-center bg-slate-100 dark:bg-white/10 rounded-full text-xs font-bold">1</div>
                    <div>
                        <span className="font-bold text-slate-800 dark:text-white">新建任务：</span>
                        点击任意象限的空白处，或点击左上角的“新建任务”按钮。
                    </div>
                </li>
                <li className="flex gap-3">
                    <div className="min-w-[24px] h-6 flex items-center justify-center bg-slate-100 dark:bg-white/10 rounded-full text-xs font-bold">2</div>
                    <div>
                        <span className="font-bold text-slate-800 dark:text-white">进度管理：</span>
                        任务卡片上的进度条支持点击。点击不同格数可直接调整进度（20% - 100%）。点击圆圈图标可直接完成。
                    </div>
                </li>
                <li className="flex gap-3">
                    <div className="min-w-[24px] h-6 flex items-center justify-center bg-slate-100 dark:bg-white/10 rounded-full text-xs font-bold">3</div>
                    <div>
                        <span className="font-bold text-slate-800 dark:text-white">拖拽排序：</span>
                        长按任务卡片可进行拖拽，支持在不同象限间移动，或在同一象限内调整顺序（需在设置中开启“自由拖动优先”）。
                    </div>
                </li>
            </ul>
        </section>

        <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

        {/* 3. Special Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Zap className="text-yellow-500" size={18} />
                    闪念胶囊
                </h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                    页面中央的输入框用于捕捉稍纵即逝的灵感。输入内容并回车，它将作为“闪念”存储，并在两侧的氛围流中循环展示，随时提醒。
                </p>
            </section>
            
            <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <History className="text-indigo-500" size={18} />
                    历史与复盘
                </h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                    点击“历史记录”查看过往。支持列表视图和日历视图。日历视图下，每天的完成情况会通过红/绿点直观展示，点击日期可查看当日详情。
                </p>
            </section>
        </div>

      </div>
    </Modal>
  );
};
