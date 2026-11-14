import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import useFloatingPopover from './useFloatingPopover';

/**
 * TactileDateRangePicker
 * Apple HIG-inspired tactile range picker with 1-click presets and interactive calendar selection.
 * Portaled via React Portal so popovers never get clipped by parent overflow-hidden cards/modals.
 */
export default function TactileDateRangePicker({
    startDate = '',
    endDate = '',
    onChange,
    align = 'right', // 'right' | 'left'
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [activePreset, setActivePreset] = useState('bulan');
    const [tempStart, setTempStart] = useState(startDate);
    const [tempEnd, setTempEnd] = useState(endDate);

    useEffect(() => {
        setTempStart(startDate);
        setTempEnd(endDate);
    }, [startDate, endDate]);

    // Helper format YYYY-MM-DD
    const formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const handleClose = useCallback(() => setIsOpen(false), []);
    const { triggerRef, popoverRef, style } = useFloatingPopover({
        isOpen,
        onClose: handleClose,
        align,
        matchWidth: false,
        estimatedHeight: 340,
        estimatedWidth: 480,
        gap: 8,
    });

    const presets = useMemo(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();

        // Today
        const todayStr = formatDate(now);

        // 7 days ago
        const d7 = new Date(now);
        d7.setDate(now.getDate() - 6);

        // 30 days ago
        const d30 = new Date(now);
        d30.setDate(now.getDate() - 29);

        // This Month
        const startOfMonth = new Date(y, m, 1);
        const endOfMonth = new Date(y, m + 1, 0);

        // Last Month
        const startOfLastMonth = new Date(y, m - 1, 1);
        const endOfLastMonth = new Date(y, m, 0);

        // This Year
        const startOfYear = new Date(y, 0, 1);
        const endOfYear = new Date(y, 11, 31);

        return [
            { id: 'hari', label: 'Hari Ini', start: todayStr, end: todayStr },
            { id: '7hari', label: '7 Hari Terakhir', start: formatDate(d7), end: todayStr },
            { id: '30hari', label: '30 Hari Terakhir', start: formatDate(d30), end: todayStr },
            { id: 'bulan', label: 'Bulan Ini', start: formatDate(startOfMonth), end: formatDate(endOfMonth) },
            { id: 'bulan_lalu', label: 'Bulan Lalu', start: formatDate(startOfLastMonth), end: formatDate(endOfLastMonth) },
            { id: 'tahun', label: `Tahun ${y}`, start: formatDate(startOfYear), end: formatDate(endOfYear) },
        ];
    }, []);

    const handleApplyPreset = (preset) => {
        setActivePreset(preset.id);
        setTempStart(preset.start);
        setTempEnd(preset.end);
        onChange?.({ startDate: preset.start, endDate: preset.end, preset: preset.id });
        setIsOpen(false);
    };

    // Calendar generation for current viewDate
    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday-first

    const handleDayClick = (day) => {
        const clickedDate = formatDate(new Date(currentYear, currentMonth, day));
        if (!tempStart || (tempStart && tempEnd)) {
            setTempStart(clickedDate);
            setTempEnd('');
            setActivePreset('custom');
        } else if (tempStart && !tempEnd) {
            if (clickedDate < tempStart) {
                setTempEnd(tempStart);
                setTempStart(clickedDate);
            } else {
                setTempEnd(clickedDate);
            }
            setActivePreset('custom');
        }
    };

    const handleConfirmCustom = () => {
        const s = tempStart || tempEnd;
        const e = tempEnd || tempStart;
        onChange?.({ startDate: s, endDate: e, preset: 'custom' });
        setIsOpen(false);
    };

    // Label on trigger button
    const displayLabel = useMemo(() => {
        const match = presets.find((p) => p.start === (startDate || tempStart) && p.end === (endDate || tempEnd));
        if (match) return match.label;
        if (startDate && endDate) {
            return `${startDate} s/d ${endDate}`;
        }
        return 'Pilih Rentang Waktu';
    }, [presets, startDate, endDate, tempStart, tempEnd]);

    return (
        <div className={`relative inline-block ${className}`} ref={triggerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200/90 text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all select-none cursor-pointer"
            >
                <CalendarIcon className="w-3.5 h-3.5 text-[#1F6376]" />
                <span className="font-mono">{displayLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Popover Card (Portaled to escape parent overflow-hidden cards/modals) */}
            {isOpen && style && typeof document !== 'undefined' && createPortal(
                <div
                    ref={popoverRef}
                    style={style}
                    className="w-[min(calc(100vw-2rem),340px)] sm:w-[480px] overflow-y-auto bg-white rounded-3xl border border-slate-200/90 shadow-[0_16px_40px_rgba(0,0,0,0.14)] p-4 select-none animate-in fade-in zoom-in-95 duration-150 flex flex-col sm:flex-row gap-4"
                >
                    {/* Left Rail: Quick Presets */}
                    <div className="w-full sm:w-36 flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-3 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono px-2 mb-1">
                            Preset Waktu
                        </span>
                        {presets.map((p) => {
                            const isSelected = activePreset === p.id;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleApplyPreset(p)}
                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between ${
                                        isSelected
                                            ? 'bg-[#1F6376] text-white shadow-2xs'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <span>{p.label}</span>
                                    {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Pane: Mini Calendar */}
                    <div className="flex-1 min-w-0">
                        {/* Month Navigator */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <span className="text-xs font-bold text-slate-900 font-mono">
                                {monthNames[currentMonth]} {currentYear}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))}
                                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))}
                                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Weekday Labels */}
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
                            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                                <div key={day}>{day}</div>
                            ))}
                        </div>

                        {/* Day Cells */}
                        <div className="grid grid-cols-7 gap-1 text-xs">
                            {Array.from({ length: firstDayIndex }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const dayNum = i + 1;
                                const dateStr = formatDate(new Date(currentYear, currentMonth, dayNum));
                                const isStart = tempStart === dateStr;
                                const isEnd = tempEnd === dateStr;
                                const inRange = tempStart && tempEnd && dateStr > tempStart && dateStr < tempEnd;

                                return (
                                    <button
                                        key={dayNum}
                                        type="button"
                                        onClick={() => handleDayClick(dayNum)}
                                        className={`h-7 w-full rounded-lg font-mono text-[11px] font-medium transition-all ${
                                            isStart || isEnd
                                                ? 'bg-[#1F6376] text-white font-bold shadow-2xs'
                                                : inRange
                                                    ? 'bg-[#1F6376]/10 text-[#1F6376] rounded-none'
                                                    : 'hover:bg-slate-100 text-slate-700'
                                        }`}
                                    >
                                        {dayNum}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom Range Confirmation Footer */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-slate-400 truncate">
                                {tempStart ? (tempEnd ? `${tempStart} → ${tempEnd}` : `${tempStart} → ...`) : 'Pilih rentang'}
                            </span>
                            <button
                                type="button"
                                disabled={!tempStart}
                                onClick={handleConfirmCustom}
                                className="px-3 py-1 rounded-lg bg-[#1F6376] text-white text-xs font-bold shadow-2xs hover:bg-[#164a59] disabled:opacity-40"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

