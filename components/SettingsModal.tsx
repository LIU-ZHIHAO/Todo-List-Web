
import React from 'react';
import { Modal } from './ui/Modal';
import { SortConfig, SortMode, SortDirection } from '../types';
import { GripVertical, Calendar, Percent, ArrowUpNarrowWide, ArrowDownNarrowWide } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SortConfig;
  onUpdate: (config: SortConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onUpdate }) => {
  
  const handleModeChange = (mode: SortMode) => {
    onUpdate({ ...config, mode });
  };

  const handleDirectionChange = (direction: SortDirection) => {
    onUpdate({ ...config, direction });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="系统设置" className="max-w-md">
       <div className="space-y-6 py-2">
           
           {/* Sorting Settings */}
           <div>
               <h3 className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-3 uppercase tracking-wider">事项排序规则</h3>
               <div className="space-y-3">
                   
                   {/* Mode 1: Custom (Free Drag) */}
                   <button
                        onClick={() => handleModeChange('custom')}
                        className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all
                            ${config.mode === 'custom' 
                                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-700 dark:text-white shadow-md shadow-blue-500/10' 
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'
                            }
                        `}
                   >
                       <div className={`p-2 rounded-lg ${config.mode === 'custom' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-gray-700 text-slate-500 dark:text-gray-400'}`}>
                           <GripVertical size={20} />
                       </div>
                       <div className="flex-1">
                           <div className="font-bold text-sm">自由拖动优先</div>
                           <div className="text-xs opacity-60 mt-0.5">最高优先级，支持自定义拖拽排序</div>
                       </div>
                       {config.mode === 'custom' && <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                   </button>

                   {/* Mode 2: Created Time */}
                   <button
                        onClick={() => handleModeChange('created')}
                        className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all
                            ${config.mode === 'created' 
                                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-700 dark:text-white shadow-md shadow-blue-500/10' 
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'
                            }
                        `}
                   >
                       <div className={`p-2 rounded-lg ${config.mode === 'created' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-gray-700 text-slate-500 dark:text-gray-400'}`}>
                           <Calendar size={20} />
                       </div>
                       <div className="flex-1">
                           <div className="font-bold text-sm">创建时间优先</div>
                           <div className="text-xs opacity-60 mt-0.5">按创建时间自动排序</div>
                       </div>
                       {config.mode === 'created' && <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                   </button>

                   {/* Mode 3: Progress */}
                   <button
                        onClick={() => handleModeChange('progress')}
                        className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all
                            ${config.mode === 'progress' 
                                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-700 dark:text-white shadow-md shadow-blue-500/10' 
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'
                            }
                        `}
                   >
                       <div className={`p-2 rounded-lg ${config.mode === 'progress' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-gray-700 text-slate-500 dark:text-gray-400'}`}>
                           <Percent size={20} />
                       </div>
                       <div className="flex-1">
                           <div className="font-bold text-sm">完成程度优先</div>
                           <div className="text-xs opacity-60 mt-0.5">按进度百分比自动排序</div>
                       </div>
                       {config.mode === 'progress' && <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                   </button>
               </div>
           </div>

           {/* Direction Settings (Only if not custom) */}
           {config.mode !== 'custom' && (
               <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-gray-400 mb-3 uppercase tracking-wider">排序方向</h3>
                    <div className="flex gap-3">
                        <button 
                             onClick={() => handleDirectionChange('asc')}
                             className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all
                                ${config.direction === 'asc' 
                                    ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-300' 
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10'
                                }
                             `}
                        >
                            <ArrowUpNarrowWide size={18} />
                            <span className="text-sm font-bold">正序</span>
                        </button>
                        <button 
                             onClick={() => handleDirectionChange('desc')}
                             className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all
                                ${config.direction === 'desc' 
                                    ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-300' 
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10'
                                }
                             `}
                        >
                            <ArrowDownNarrowWide size={18} />
                            <span className="text-sm font-bold">倒序</span>
                        </button>
                    </div>
               </div>
           )}

       </div>
    </Modal>
  );
};
