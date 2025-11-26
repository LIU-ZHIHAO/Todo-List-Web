import React from 'react';
import { GripVertical, Calendar, Percent, ArrowUpNarrowWide, ArrowDownNarrowWide, Gauge } from 'lucide-react';
import { SortConfig, SortMode, SortDirection, StreamConfig } from '../../../core/types';

interface GeneralSettingsProps {
    config: SortConfig;
    onUpdate: (config: SortConfig) => void;
    streamConfig: StreamConfig;
    onUpdateStream: (config: StreamConfig) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ config, onUpdate, streamConfig, onUpdateStream }) => {

    const handleModeChange = (mode: SortMode) => {
        onUpdate({ ...config, mode });
    };

    const handleDirectionChange = (direction: SortDirection) => {
        onUpdate({ ...config, direction });
    };

    const handleStreamSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const speed = parseInt(e.target.value, 10);
        onUpdateStream({ ...streamConfig, speed });
    };

    const getSortLabels = () => {
        if (config.mode === 'created') return { asc: '最早', desc: '最晚' };
        if (config.mode === 'progress') return { asc: '最低', desc: '最高' };
        return { asc: '正序', desc: '倒序' };
    };

    const sortLabels = getSortLabels();

    return (
        <div className="space-y-6">
            {/* Sorting Settings */}
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
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
                            <ArrowUpNarrowWide size={14} /> {sortLabels.asc}
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
                            <ArrowDownNarrowWide size={14} /> {sortLabels.desc}
                        </button>
                    </div>
                )}
            </div>

            {/* Stream Settings */}
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    闪念流设置
                </h3>
                <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-gray-400">
                            <Gauge size={14} /> 滚动速度
                        </div>
                        <span className="text-xs font-mono text-purple-600 dark:text-purple-400">{streamConfig.speed} px/s</span>
                    </div>
                    <input
                        type="range"
                        min="20"
                        max="180"
                        step="5"
                        value={typeof streamConfig.speed === 'number' ? streamConfig.speed : 50}
                        onChange={handleStreamSpeedChange}
                        className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between mt-1 text-[10px] text-slate-400 uppercase font-bold">
                        <span>Slow</span>
                        <span>Fast</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
