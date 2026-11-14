import React from 'react';
import { Check, Hash, Sparkles } from 'lucide-react';

/**
 * PosVendorPeriodicBatchSelector
 * 
 * Apple HIG-inspired Scoped Timeline Batch Selector for Konsinyasi Berkala.
 * Implements Deference, Depth, and Glanceability:
 * 1. ZERO pastel candy badges: High-contrast typography & calm monochrome structure.
 * 2. Smart Quick Presets: 1-tap "Semua Nota Lama" vs "Semua Termasuk Hari Ini".
 * 3. Inset Grouped Timeline: Multi-select checklist with tabular numerals.
 */
export default function PosVendorPeriodicBatchSelector({
    unpaidBatches = [],
    unsettledBalance = 0,
    payoutMode = 'BATCHES', // 'BATCHES' | 'CUSTOM'
    selectedBatchIds = [],
    onToggleBatch,
    onSelectAllPast,
    onSelectAll,
    onSelectCustom,
    formatRp,
}) {
    const safeBatches = Array.isArray(unpaidBatches) ? unpaidBatches : [];
    if (safeBatches.length === 0) {
        return null;
    }

    const olderBatches = safeBatches.filter((b) => !b.is_today);
    const hasTodayAndOlder = olderBatches.length > 0 && safeBatches.some((b) => b.is_today);

    const pastAmountSum = olderBatches.reduce(
        (acc, b) => acc + Number(b.unpaid_amount ?? b.total_earned ?? 0),
        0
    );

    const isAllPastSelected =
        payoutMode === 'BATCHES' &&
        olderBatches.length > 0 &&
        olderBatches.every((b) => selectedBatchIds.includes(b.receiving_id)) &&
        !safeBatches.some((b) => b.is_today && selectedBatchIds.includes(b.receiving_id));

    const isAllSelected =
        payoutMode === 'BATCHES' &&
        safeBatches.length > 0 &&
        safeBatches.every((b) => selectedBatchIds.includes(b.receiving_id));

    // Single batch scenario: simple segmented toggle
    if (safeBatches.length === 1) {
        const singleBatch = safeBatches[0];
        const singleAmount = Number(singleBatch.unpaid_amount ?? singleBatch.total_earned ?? unsettledBalance);

        return (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl font-sans">
                <button
                    type="button"
                    onClick={() => {
                        onSelectAll();
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        payoutMode === 'BATCHES'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    Cairkan Nota Ini ({formatRp(singleAmount)})
                </button>
                <button
                    type="button"
                    onClick={onSelectCustom}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        payoutMode === 'CUSTOM'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    Nominal Tertentu
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2.5 font-sans">
            {/* 1. Quick Presets (Apple Segmented Bar) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl text-xs">
                {hasTodayAndOlder && (
                    <button
                        type="button"
                        onClick={onSelectAllPast}
                        className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                            isAllPastSelected
                                ? 'bg-white text-slate-950 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Hanya cairkan nota-nota kiriman sebelum hari ini"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                        <span>Semua Nota Lama ({formatRp(pastAmountSum)})</span>
                    </button>
                )}

                <button
                    type="button"
                    onClick={onSelectAll}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
                        isAllSelected
                            ? 'bg-white text-slate-950 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Cairkan seluruh nota kiriman sekaligus"
                >
                    Semua ({formatRp(unsettledBalance)})
                </button>

                <button
                    type="button"
                    onClick={onSelectCustom}
                    className={`py-1.5 px-2.5 rounded-lg font-semibold transition-all text-center cursor-pointer flex items-center gap-1 ${
                        payoutMode === 'CUSTOM'
                            ? 'bg-white text-slate-950 font-bold shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Masukkan nominal pencairan sebagian secara manual"
                >
                    <Hash className="w-3 h-3 text-slate-400" />
                    <span>Manual</span>
                </button>
            </div>

            {/* 2. Inset Grouped Timeline Checklist */}
            <div className="space-y-1">
                <div className="flex items-center justify-between px-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Daftar Nota Kiriman (Pilih untuk Dicairkan)</span>
                    <span className="font-mono">
                        {selectedBatchIds.length} dari {unpaidBatches.length} Dipilih
                    </span>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-slate-50/40 divide-y divide-slate-100 overflow-hidden shadow-2xs">
                    {unpaidBatches.map((batch) => {
                        const isChecked = payoutMode === 'BATCHES' && selectedBatchIds.includes(batch.receiving_id);
                        const amount = Number(batch.unpaid_amount ?? batch.total_earned ?? 0);
                        const dateLabel = batch.received_date_formatted || batch.received_date || 'Tanggal Tidak Tercatat';

                        let relativeLabel = '';
                        if (batch.is_today) {
                            relativeLabel = 'Drop Hari Ini';
                        } else if (batch.is_yesterday) {
                            relativeLabel = 'Drop Kemarin';
                        }

                        return (
                            <button
                                key={batch.receiving_id}
                                type="button"
                                onClick={() => onToggleBatch(batch.receiving_id)}
                                className={`w-full p-3 flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                                    isChecked
                                        ? 'bg-white ring-1 ring-slate-900/10'
                                        : 'bg-transparent opacity-65 hover:opacity-100 hover:bg-slate-50/80'
                                }`}
                            >
                                {/* Left: Tactile Checkbox + Drop Timing */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <div
                                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                                            isChecked
                                                ? 'bg-slate-900 border-slate-900 text-white'
                                                : 'border-slate-300 bg-white'
                                        }`}
                                    >
                                        {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-slate-900">
                                                {dateLabel}
                                            </span>
                                            {relativeLabel && (
                                                <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                                                    batch.is_today
                                                        ? 'bg-slate-200/80 text-slate-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {relativeLabel}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                                            Total {batch.total_received ?? 0} pcs disetor · Sisa {batch.total_remaining ?? 0} pcs di rak
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Money and Pcs Sold */}
                                <div className="text-right shrink-0">
                                    <div className="text-sm font-mono font-bold text-slate-900">
                                        {formatRp(amount)}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                        {batch.total_sold ?? 0} pcs laku
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
