import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import PosVendorPayoutMethodSelector from './PosVendorPayoutMethodSelector';
import PosVendorPeriodicProductSummary from './PosVendorPeriodicProductSummary';
import PosVendorPeriodicCustomAmountInput from './PosVendorPeriodicCustomAmountInput';
import PosVendorPeriodicBatchSelector from './PosVendorPeriodicBatchSelector';

/**
 * PosVendorPeriodicPayoutSection
 * 
 * Apple HIG-inspired Cashier Payout Section for Konsinyasi Berkala (Titip Rak).
 * Implements Deference, Depth, and Glanceability:
 * 1. Immediate glanceable hero balance scoped to the active checklist.
 * 2. Inset Grouped Timeline checklist with multi-select and smart presets.
 * 3. Human-first sold products list scoped strictly to selected notes.
 * 4. Safe shelf stock return toggle isolated strictly to selected notes.
 */
export default function PosVendorPeriodicPayoutSection({
    selectedVendor,
    vendorBatches = [],
    availableCash = 0,
    formatRp,
    payoutMode = 'BATCHES', // 'BATCHES' | 'CUSTOM'
    selectedBatchIds = [],
    selectedBatches = [],
    onToggleBatch,
    onSelectAllPast,
    onSelectAll,
    onSelectCustom,
    customAmount = '',
    onCustomAmountChange,
    payoutMethod = 'CASH',
    onPayoutMethodChange,
    bankReference = '',
    onBankReferenceChange,
    returnShelfStock = false,
    onReturnShelfStockChange,
    effectivePayoutAmount = 0,
    onSwitchToRestock,
}) {
    const unsettledBalance = Number(selectedVendor?.unsettled_balance || 0);
    const safeBatches = Array.isArray(vendorBatches) ? vendorBatches : (vendorBatches && typeof vendorBatches === 'object' ? Object.values(vendorBatches) : []);
    const unpaidBatches = safeBatches.filter(
        (b) => b.settlement_status === 'UNPAID' || b.settlement_status === 'PARTIAL' || b.badge_status === 'PENDING_PAYOUT' || b.badge_status === 'PARTIAL'
    );

    const hasPayable = unpaidBatches.length > 0 || unsettledBalance > 0;
    const remainingDrawerCash = availableCash - (payoutMethod === 'CASH' ? effectivePayoutAmount : 0);
    const isCashSufficient = remainingDrawerCash >= 0;

    const safeSelectedBatches = Array.isArray(selectedBatches) ? selectedBatches : [];
    const remainingPcs = safeSelectedBatches.reduce(
        (acc, b) => acc + Number(b.total_remaining || 0),
        0
    );

    let scopeLabel = '';
    if (payoutMode === 'CUSTOM') {
        scopeLabel = 'Nominal Manual';
    } else if (selectedBatches.length === 1) {
        const b = selectedBatches[0];
        scopeLabel = b.is_today ? 'Drop Hari Ini' : (b.is_yesterday ? 'Drop Kemarin' : b.received_date_formatted || '1 Nota Terpilih');
    } else if (selectedBatches.length === unpaidBatches.length && unpaidBatches.length > 1) {
        scopeLabel = `Semua Nota (${selectedBatches.length} Kiriman)`;
    } else if (selectedBatches.length > 1) {
        scopeLabel = `${selectedBatches.length} Nota Terpilih`;
    }

    if (!hasPayable) {
        return (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-3 font-sans">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Semua Penjualan Sudah Lunas
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Belum ada penjualan baru yang tertunda untuk {selectedVendor?.name || 'mitra ini'}.
                    </p>
                </div>
                {onSwitchToRestock && (
                    <button
                        type="button"
                        onClick={onSwitchToRestock}
                        className="mt-2 px-4 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                        <span>Tambah Stok Barang Rak</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4 font-sans">
            {/* 1. Hero Balance & Drawer Status */}
            <div className="pb-3 border-b border-slate-100 flex items-baseline justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Hak Penjualan Siap Dicairkan
                        </span>
                        {scopeLabel && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-100 text-slate-800">
                                {scopeLabel}
                            </span>
                        )}
                    </div>
                    <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 tracking-tight mt-0.5">
                        {formatRp(effectivePayoutAmount)}
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isCashSufficient ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isCashSufficient ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        Kas Laci: {formatRp(availableCash)}
                    </span>
                </div>
            </div>

            {/* 2. Apple HIG Timeline Checklist & Presets */}
            <PosVendorPeriodicBatchSelector
                unpaidBatches={unpaidBatches}
                unsettledBalance={unsettledBalance}
                payoutMode={payoutMode}
                selectedBatchIds={selectedBatchIds}
                onToggleBatch={onToggleBatch}
                onSelectAllPast={onSelectAllPast}
                onSelectAll={onSelectAll}
                onSelectCustom={onSelectCustom}
                formatRp={formatRp}
            />

            {/* 3. Custom Partial Amount Input (If active) */}
            {payoutMode === 'CUSTOM' && (
                <PosVendorPeriodicCustomAmountInput
                    customAmount={customAmount}
                    onCustomAmountChange={onCustomAmountChange}
                    unsettledBalance={unsettledBalance}
                    availableCash={availableCash}
                    formatRp={formatRp}
                />
            )}

            {/* 4. Human-First Sold Products Breakdown (Scoped to Active Batches) */}
            <PosVendorPeriodicProductSummary
                unpaidBatches={selectedBatches}
                unsettledBalance={effectivePayoutAmount}
                formatRp={formatRp}
                scopeLabel={scopeLabel}
            />

            {/* 5. Physical Shelf Return Toggle */}
            {remainingPcs > 0 && effectivePayoutAmount > 0 && (
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-white text-xs cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={returnShelfStock}
                        onChange={(e) => onReturnShelfStockChange?.(e.target.checked)}
                        className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900 cursor-pointer"
                    />
                    <span className="text-slate-700">
                        Mitra sekalian menarik sisa <strong>{remainingPcs} pcs</strong> dari {selectedBatches.length === 1 ? 'nota ini' : `${selectedBatches.length} nota terpilih`} (Retur Barang)
                    </span>
                </label>
            )}

            {/* 6. Cash Drawer vs Bank Transfer */}
            {effectivePayoutAmount > 0 && (
                <PosVendorPayoutMethodSelector
                    selectedVendor={selectedVendor}
                    payoutMethod={payoutMethod}
                    onPayoutMethodChange={onPayoutMethodChange}
                    bankReference={bankReference}
                    onBankReferenceChange={onBankReferenceChange}
                    availableCash={availableCash}
                    effectivePayoutAmount={effectivePayoutAmount}
                    formatRp={formatRp}
                />
            )}
        </div>
    );
}
