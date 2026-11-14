import React, { useEffect } from 'react';
import { Package, RotateCcw, ArrowRight, History, Plus } from 'lucide-react';
import EmptyState from '@/Components/UI/EmptyState';
import QuantityStepper from '@/Components/UI/QuantityStepper';

/**
 * PosVendorDropPagiTab
 * 
 * Ritual 1: Morning intake form for consignment partner drops.
 * Ergonomic, minimal cognitive load for cashiers at morning rush hour (06:00 - 08:00 AM).
 * Per-item subtotal cross-check against supplier delivery notes, and instant Enter submission.
 */
export default function PosVendorDropPagiTab({
    vendorProducts = [],
    vendorBatches = [],
    incomingQtys = {},
    setIncomingQtys,
    resetIncomingQtys,
    handleIncomingQtyChange,
    totalIncomingPcs = 0,
    totalIncomingCost = 0,
    rolloverBatch = null,
    handleMergeRollover,
    onSwitchToRetur,
    submitDropPagi,
    isLoading = false,
    isSubmitting = false,
    formatRp,
    isAllShelf = false,
}) {

    // Keyboard shortcut: Press Enter to submit if valid drop exists (requires Ctrl+Enter if inside input)
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
            if (e.key === 'Enter' && !isSubmitting && totalIncomingPcs > 0) {
                if (!isTyping || e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    submitDropPagi?.();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSubmitting, totalIncomingPcs, submitDropPagi]);

    return (
        <div className="flex-1 flex flex-col justify-between min-h-0">
            {/* Scrollable Work Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mb-2 space-y-2.5">
                {/* Overnight Rollover Alert Banner */}
                {rolloverBatch && (
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-100 border border-slate-300/80 space-y-2.5 shrink-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <History className="w-4 h-4 text-slate-700 shrink-0" />
                                <span className="text-xs font-bold text-slate-900 truncate">
                                    Titipan Kemarin Belum Direkap ({rolloverBatch.received_date_formatted || rolloverBatch.received_date})
                                </span>
                            </div>

                            {/* Glanceable metrics (pure clean neutral chips) */}
                            <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono font-bold">
                                {Number(rolloverBatch.total_earned || 0) > 0 && (
                                    <span className="text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                                        Hak Mitra: {formatRp(rolloverBatch.total_earned)}
                                    </span>
                                )}
                                {Number(rolloverBatch.total_remaining || 0) > 0 && (
                                    <span className="text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                                        Sisa: {rolloverBatch.total_remaining} pcs
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons (Strictly Lucide Icons, No Emojis, Contextual) */}
                        <div className="flex items-center gap-2 pt-0.5">
                            <button
                                type="button"
                                onClick={() => onSwitchToRetur?.(rolloverBatch.receiving_id)}
                                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.99]"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                                <span>Rekap & Bayar ({formatRp(rolloverBatch.total_earned)})</span>
                            </button>

                            {Number(rolloverBatch.total_remaining || 0) > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMergeRollover}
                                    className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.99]"
                                >
                                    <Plus className="w-3.5 h-3.5 text-slate-700" />
                                    <span>Gabung Sisa ({rolloverBatch.total_remaining} pcs)</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}


                {isLoading && vendorProducts.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400">
                        Memuat daftar menu...
                    </div>
                ) : vendorProducts.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title="Belum ada menu"
                        description="Belum ada menu yang terdaftar untuk supplier ini."
                        className="py-12"
                    />
                ) : (
                    <div className="space-y-2">
                        {vendorProducts.map((p) => {
                            const incoming = Number(incomingQtys[p.id] || 0);
                            const isFilled = incoming > 0;
                            const costPrice = Number(p.cost_price || 0);
                            const sellingPrice = Number(p.price || p.selling_price || 0);
                            const subtotal = incoming * costPrice;

                            return (
                                <div
                                    key={p.id}
                                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                        isFilled
                                            ? 'bg-slate-50 border-slate-900 shadow-2xs'
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {/* Product Details */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-xs text-slate-900 truncate">
                                                {p.name}
                                            </h4>
                                            {isFilled && (
                                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-900 text-white border border-slate-900 shrink-0">
                                                    +{incoming} pcs
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                                            <span>Modal: <strong className="text-slate-800 font-semibold">{formatRp(costPrice)}</strong></span>
                                            <span className="text-slate-300">·</span>
                                            <span>Jual: {formatRp(sellingPrice)}</span>
                                            <span className="text-slate-300">·</span>
                                            <span>Sisa Toko: <strong className={Number(p.stock) > 0 ? 'text-slate-800 font-semibold' : 'text-slate-400'}>{p.stock ?? 0} pcs</strong></span>
                                        </div>
                                    </div>

                                    {/* Tactile Stepper & Item Subtotal */}
                                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                        <QuantityStepper
                                            size="sm"
                                            min={0}
                                            value={incoming === 0 ? '' : incoming}
                                            placeholder="0"
                                            onChange={(val) => handleIncomingQtyChange(p.id, val)}
                                            batchIncrements={[5, 10]}
                                            showZeroButton={isFilled}
                                        />

                                        <div className="text-right min-w-[85px]">
                                            <span className="text-[10px] text-slate-400 block">
                                                Subtotal
                                            </span>
                                            <span className={`font-mono font-bold text-xs block ${
                                                subtotal > 0 ? 'text-slate-900' : 'text-slate-300'
                                            }`}>
                                                {formatRp(subtotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Apple HIG Sleek Bottom Dock */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {isAllShelf ? 'Total Restock Masuk' : 'Total Drop Masuk'}
                    </span>
                    <div className="flex items-baseline gap-2">
                        <strong className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
                            +{totalIncomingPcs} pcs
                        </strong>
                        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                            · Nilai Modal: {formatRp(totalIncomingCost)}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={submitDropPagi}
                    disabled={isSubmitting || totalIncomingPcs <= 0}
                    className={`py-3 px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                        totalIncomingPcs > 0 && !isSubmitting
                            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    <span>{isSubmitting ? 'Menyimpan...' : (isAllShelf ? 'Simpan Restock (Enter)' : 'Simpan Drop (Enter)')}</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
