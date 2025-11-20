
import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { SortConfig, SortMode, SortDirection, StreamConfig, StreamMode, StreamSpeed } from '../types';
import { GripVertical, Calendar, Percent, ArrowUpNarrowWide, ArrowDownNarrowWide, PauseCircle, PlayCircle, EyeOff, AlertTriangle, Trash2, RefreshCw, Rabbit, Turtle, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SortConfig;
  onUpdate: (config: SortConfig) => void;
  streamConfig: StreamConfig;
  onUpdateStream: (config: StreamConfig) => void;
  onClearData: (type: 'tasks' | 'notes' | 'all') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onUpdate, streamConfig, onUpdateStream, onClearData }) => {
  const [confirmDanger, setConfirmDanger] = useState<{ type: 'tasks' | 'notes' | 'all', step: number } | null>(null);

  const handleModeChange = (mode: SortMode) => {
    onUpdate({ ...config, mode });
  };

  const handleDirectionChange = (direction: SortDirection) => {
    onUpdate({ ...config, direction });
  };

  const handleStreamModeChange = (mode: StreamMode) => {
    onUpdateStream({ ...streamConfig, mode });
  };

  const handleStreamSpeedChange = (speed: StreamSpeed) => {
    onUpdateStream({ ...streamConfig, speed });
  };

  const triggerDanger = (type: 'tasks' | 'notes' | 'all') => {
      setConfirmDanger({ type, step: 1 });
  };

  const confirmDangerAction = () => {
      if (confirmDanger) {
          onClearData(confirmDanger.type);
          setConfirmDanger(null);
          onClose();
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="系统设置" className="max-w-lg">
       <div className="space-y-8 py-2 relative">
           
           {/* Sorting Settings - Compact */}
           <div>
               <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                   事项排序规则
               </h3>
               <div className="grid grid-cols-3 gap-2">
                   {[
                       { id: 'custom', icon: GripVertical, label: '自由拖动' },
                       { id: 'created', icon: Calendar, label: '创建时间' },
                       { id: 'progress', icon: Percent, label: '完成进度' },
                   ].map((item) => (
                       <button
                            key={item.id}
                            onClick={() => handleModeChange(item.id as SortMode)}
                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                                ${config.mode === item.id
                                    ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-300 shadow-sm' 
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10'
                                }
                            `}
                       >
                           <item.icon size={20} />
                           <span className="text-xs font-bold">{item.label}</span>
                       </button>
                   ))}
               </div>
               
               {config.mode !== 'custom' && (
                   <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-1">
                        <button 
                             onClick={() => handleDirectionChange('asc')}
                             className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium transition-all
                                ${config.direction === 'asc' 
                                    ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-300' 
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400'
                                }
                             `}
                        >
                            <ArrowUpNarrowWide size={14} /> 正序
                        </button>
                        <button 
                             onClick={() => handleDirectionChange('desc')}
                             className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium transition-all
                                ${config.direction === 'desc' 
                                    ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-300' 
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400'
                                }
                             `}
                        >
                            <ArrowDownNarrowWide size={14} /> 倒序
                        </button>
                   </div>
               )}
           </div>

           {/* Stream Settings */}
           <div>
               <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                   闪念显示模式
               </h3>
               <div className="space-y-3">
                   <div className="grid grid-cols-3 gap-2">
                       {[
                           { id: 'scroll', icon: PlayCircle, label: '滚动展示' },
                           { id: 'static', icon: PauseCircle, label: '静止展示' },
                           { id: 'hidden', icon: EyeOff, label: '隐藏两侧' },
                       ].map((item) => (
                           <button
                                key={item.id}
                                onClick={() => handleStreamModeChange(item.id as StreamMode)}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                                    ${streamConfig.mode === item.id
                                        ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-300 shadow-sm' 
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/10'
                                    }
                                `}
                           >
                               <item.icon size={20} />
                               <span className="text-xs font-bold">{item.label}</span>
                           </button>
                       ))}
                   </div>

                   {streamConfig.mode === 'static' && (
                        <div className="text-xs text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-white/5 p-2 rounded-lg text-center animate-in fade-in">
                            每10秒自动轮播更换展示内容
                        </div>
                   )}

                   {streamConfig.mode === 'scroll' && (
                       <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-1 rounded-lg animate-in fade-in">
                           {[
                               { id: 'slow', icon: Turtle, label: '慢' },
                               { id: 'medium', icon: Rabbit, label: '中' },
                               { id: 'fast', icon: Zap, label: '快' },
                           ].map((speed) => (
                               <button
                                   key={speed.id}
                                   onClick={() => handleStreamSpeedChange(speed.id as StreamSpeed)}
                                   className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all
                                       ${streamConfig.speed === speed.id
                                           ? 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-sm'
                                           : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
                                       }
                                   `}
                               >
                                   <speed.icon size={12} />
                                   {speed.label}
                               </button>
                           ))}
                       </div>
                   )}
               </div>
           </div>

           {/* Danger Zone */}
           <div>
               <h3 className="text-xs font-bold text-red-400 dark:text-red-500/80 mb-3 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-red-500"></div>
                   危险区域
               </h3>
               <div className="flex flex-col gap-2">
                   <button 
                        onClick={() => triggerDanger('tasks')}
                        className="flex items-center justify-between p-3 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors group"
                   >
                       <div className="flex items-center gap-3">
                           <Trash2 size={18} />
                           <span className="text-sm font-bold">清除所有代办任务</span>
                       </div>
                       <span className="text-xs opacity-60 group-hover:opacity-100">不可恢复</span>
                   </button>
                   
                   <button 
                        onClick={() => triggerDanger('notes')}
                        className="flex items-center justify-between p-3 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors group"
                   >
                       <div className="flex items-center gap-3">
                           <Trash2 size={18} />
                           <span className="text-sm font-bold">清除所有闪念笔记</span>
                       </div>
                       <span className="text-xs opacity-60 group-hover:opacity-100">不可恢复</span>
                   </button>

                   <button 
                        onClick={() => triggerDanger('all')}
                        className="flex items-center justify-between p-3 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-100/50 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-700 dark:text-red-300 transition-colors group mt-1"
                   >
                       <div className="flex items-center gap-3">
                           <RefreshCw size={18} />
                           <span className="text-sm font-bold">完全格式化 (清空数据)</span>
                       </div>
                       <span className="text-xs font-bold bg-red-200 dark:bg-red-500/30 px-2 py-0.5 rounded">慎用</span>
                   </button>
               </div>
           </div>

            {/* Confirmation Overlay */}
            {confirmDanger && (
                <div className="absolute inset-0 bg-white/95 dark:bg-[#1a1f35]/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center rounded-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        确认删除{confirmDanger.type === 'all' ? '所有数据' : (confirmDanger.type === 'tasks' ? '所有任务' : '所有闪念')}？
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mb-8 max-w-[80%]">
                        此操作将永久删除本地存储的数据，<br/>删除后将<span className="font-bold text-red-500">无法恢复</span>。
                    </p>
                    <div className="flex gap-3 w-full max-w-xs">
                        <button 
                            onClick={() => setConfirmDanger(null)}
                            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                            取消
                        </button>
                        <button 
                            onClick={confirmDangerAction}
                            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/30 animate-pulse hover:animate-none transition-all"
                        >
                            确认删除
                        </button>
                    </div>
                </div>
            )}

       </div>
    </Modal>
  );
};
