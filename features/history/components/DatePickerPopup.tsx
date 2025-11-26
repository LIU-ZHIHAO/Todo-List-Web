import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type DatePickerMode = 'day' | 'week' | 'month' | 'year';

interface DatePickerPopupProps {
    isOpen: boolean;
    onClose: () => void;
    value: Date;
    onChange: (date: Date) => void;
    mode: DatePickerMode;
}

export const DatePickerPopup: React.FC<DatePickerPopupProps> = ({
    isOpen,
    onClose,
    value,
    onChange,
    mode
}) => {
    const [viewDate, setViewDate] = useState(new Date(value));
    const [selectionMode, setSelectionMode] = useState<'day' | 'month' | 'year'>('day');

    useEffect(() => {
        if (isOpen) {
            setViewDate(new Date(value));
            // Determine initial selection mode based on prop mode
            if (mode === 'year') setSelectionMode('year');
            else if (mode === 'month') setSelectionMode('month');
            else setSelectionMode('day');
        }
    }, [isOpen, value, mode]);

    if (!isOpen) return null;

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newDate = new Date(viewDate);
        if (selectionMode === 'day') newDate.setMonth(newDate.getMonth() - 1);
        if (selectionMode === 'month') newDate.setFullYear(newDate.getFullYear() - 1);
        if (selectionMode === 'year') newDate.setFullYear(newDate.getFullYear() - 12);
        setViewDate(newDate);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newDate = new Date(viewDate);
        if (selectionMode === 'day') newDate.setMonth(newDate.getMonth() + 1);
        if (selectionMode === 'month') newDate.setFullYear(newDate.getFullYear() + 1);
        if (selectionMode === 'year') newDate.setFullYear(newDate.getFullYear() + 12);
        setViewDate(newDate);
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(viewDate);
        newDate.setDate(day);
        onChange(newDate);
        onClose();
    };

    const handleMonthClick = (monthIndex: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(monthIndex);
        if (mode === 'month') {
            onChange(newDate);
            onClose();
        } else {
            setViewDate(newDate);
            setSelectionMode('day');
        }
    };

    const handleYearClick = (year: number) => {
        const newDate = new Date(viewDate);
        newDate.setFullYear(year);
        if (mode === 'year') {
            onChange(newDate);
            onClose();
        } else {
            setViewDate(newDate);
            setSelectionMode('month');
        }
    };

    // Render Helpers
    const renderHeader = () => {
        let label = '';
        if (selectionMode === 'day') label = `${viewDate.getFullYear()}年 ${viewDate.getMonth() + 1}月`;
        if (selectionMode === 'month') label = `${viewDate.getFullYear()}年`;
        if (selectionMode === 'year') {
            const start = Math.floor(viewDate.getFullYear() / 12) * 12;
            label = `${start} - ${start + 11}`;
        }

        return (
            <div className="flex items-center justify-between mb-2 p-1">
                <button onClick={handlePrev} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded text-slate-500">
                    <ChevronLeft size={16} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (selectionMode === 'day') setSelectionMode('month');
                        else if (selectionMode === 'month') setSelectionMode('year');
                    }}
                    className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    {label}
                </button>
                <button onClick={handleNext} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded text-slate-500">
                    <ChevronRight size={16} />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const days = [];

        // Week headers
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

        // Padding
        for (let i = 0; i < firstDay; i++) days.push(<div key={`pad-${i}`} />);

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const currentDate = new Date(year, month, d);
            const isSelected = currentDate.toDateString() === value.toDateString();
            const isToday = new Date().toDateString() === currentDate.toDateString();

            // For week mode highlight
            let isWeekSelected = false;
            if (mode === 'week') {
                const target = new Date(value);
                const currentDayOfWeek = target.getDay() || 7; // 1-7
                const startOfWeek = new Date(target);
                startOfWeek.setDate(target.getDate() - currentDayOfWeek + 1);
                startOfWeek.setHours(0, 0, 0, 0);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);

                const cTime = currentDate.getTime();
                isWeekSelected = cTime >= startOfWeek.getTime() && cTime <= endOfWeek.getTime();
            }

            days.push(
                <button
                    key={d}
                    onClick={(e) => { e.stopPropagation(); handleDayClick(d); }}
                    className={`
                        w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-all
                        ${isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : isWeekSelected
                                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                : isToday
                                    ? 'text-blue-600 font-bold bg-blue-50 dark:bg-blue-500/10'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                        }
                    `}
                >
                    {d}
                </button>
            );
        }

        return (
            <>
                <div className="grid grid-cols-7 mb-1 text-center">
                    {weekDays.map(d => (
                        <span key={d} className="text-[10px] text-slate-400 font-medium">{d}</span>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1 justify-items-center">
                    {days}
                </div>
            </>
        );
    };

    const renderMonths = () => {
        const months = [];
        for (let i = 0; i < 12; i++) {
            const isSelected = value.getMonth() === i && value.getFullYear() === viewDate.getFullYear();
            months.push(
                <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); handleMonthClick(i); }}
                    className={`
                        p-2 rounded-lg text-xs font-medium transition-all
                        ${isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                        }
                    `}
                >
                    {i + 1}月
                </button>
            );
        }
        return <div className="grid grid-cols-3 gap-2">{months}</div>;
    };

    const renderYears = () => {
        const startYear = Math.floor(viewDate.getFullYear() / 12) * 12;
        const years = [];
        for (let i = 0; i < 12; i++) {
            const year = startYear + i;
            const isSelected = value.getFullYear() === year;
            years.push(
                <button
                    key={year}
                    onClick={(e) => { e.stopPropagation(); handleYearClick(year); }}
                    className={`
                        p-2 rounded-lg text-xs font-medium transition-all
                        ${isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                        }
                    `}
                >
                    {year}
                </button>
            );
        }
        return <div className="grid grid-cols-3 gap-2">{years}</div>;
    };

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 p-3 w-64 animate-in fade-in zoom-in-95 duration-200">
                {renderHeader()}
                {selectionMode === 'day' && renderDays()}
                {selectionMode === 'month' && renderMonths()}
                {selectionMode === 'year' && renderYears()}
            </div>
        </>
    );
};
