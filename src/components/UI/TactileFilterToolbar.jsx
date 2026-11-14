import React from 'react';
import { Search, X, Download, SlidersHorizontal, Calendar } from 'lucide-react';

/**
 * TactileFilterToolbar
 * Standard ERP Filter & Search Bar for Koperasi Manasuka.
 * Features:
 * - Search input with shortcut badge & clear button
 * - Segmented status filter or quick filter pills
 * - Action triggers (Export, Advanced Filter)
 * - Zero pastel AI slop
 */
export default function TactileFilterToolbar({
    search = '',
    onSearchChange = null,
    searchPlaceholder = 'Cari transaksi, anggota, no. referensi...',
    filterOptions = [], // [{ id: 'all', label: 'Semua' }, ...]
    activeFilter = 'all',
    onFilterChange = null,
    datePresets = [], // [{ id: 'all', label: 'Semua Waktu' }, ...]
    activeDatePreset = 'all',
    onDatePresetChange = null,
    onExport = null,
    exportLabel = 'Ekspor XLS',
    onToggleAdvanced = null,
    secondaryControls = null,
    className = "",
    children = null,
}) {
    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search Bar Input */}
                <div className="relative flex-1 min-w-[260px]">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4 stroke-[2]" />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-16 py-2.5 text-xs font-medium rounded-2xl bg-white border border-slate-200/80 text-slate-800 placeholder:text-slate-400 shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_white] focus:outline-none focus:ring-2 focus:ring-[#1F6376]/20 focus:border-[#1F6376] transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
                        {search && (
                            <button
                                type="button"
                                onClick={() => onSearchChange && onSearchChange('')}
                                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title="Hapus Pencarian"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 border border-slate-200/70 rounded-md">
                            ⌘K
                        </span>
                    </div>
                </div>

                {/* Filter Controls & Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {secondaryControls}

                    {/* Date Presets Dropdown */}
                    {datePresets.length > 0 && (
                        <div className="relative">
                            <select
                                value={activeDatePreset}
                                onChange={(e) => onDatePresetChange && onDatePresetChange(e.target.value)}
                                className="h-10 pl-8 pr-8 text-xs font-bold rounded-2xl bg-white border border-slate-200/80 text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_white] hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#1F6376] appearance-none cursor-pointer transition-all"
                            >
                                {datePresets.map((preset) => (
                                    <option key={preset.id} value={preset.id}>
                                        {preset.label}
                                    </option>
                                ))}
                            </select>
                            <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
                        </div>
                    )}

                    {/* Advanced Filter Button */}
                    {onToggleAdvanced && (
                        <button
                            type="button"
                            onClick={onToggleAdvanced}
                            className="h-10 px-3.5 flex items-center gap-2 rounded-2xl bg-white border border-slate-200/80 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_white] active:scale-95 transition-all"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Filter</span>
                        </button>
                    )}

                    {/* Export Action Button */}
                    {onExport && (
                        <button
                            type="button"
                            onClick={onExport}
                            className="h-10 px-4 flex items-center gap-2 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.1)] active:scale-95 transition-all"
                        >
                            <Download className="w-3.5 h-3.5 text-slate-300" />
                            <span>{exportLabel}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Filter Status Pills */}
            {filterOptions.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
                        Status:
                    </span>
                    {filterOptions.map((opt) => {
                        const isActive = activeFilter === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => onFilterChange && onFilterChange(opt.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                                    isActive
                                        ? 'bg-[#1F6376] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(31,99,118,0.25)]'
                                        : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02),inset_0_1px_0_white]'
                                }`}
                            >
                                <span>{opt.label}</span>
                                {opt.count !== undefined && (
                                    <span className={`ml-1.5 text-[10.5px] font-mono px-1.5 py-0.2 rounded-md ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {opt.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {children}
        </div>
    );
}

