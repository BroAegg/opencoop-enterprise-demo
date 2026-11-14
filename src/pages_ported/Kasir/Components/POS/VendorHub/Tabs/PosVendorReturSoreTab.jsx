import React from 'react';
import {
    HandCoins,
    ArrowRight,
} from 'lucide-react';
import EmptyState from '@/Components/UI/EmptyState';
import PosVendorPaymentSheet from './PosVendorPaymentSheet';
import PosVendorWeekStrip from './PosVendorWeekStrip';
import PosVendorReturItemCard from './PosVendorReturItemCard';
import PosVendorScopeSelector from './PosVendorScopeSelector';

/**
 * PosVendorReturSoreTab
 * 
 * Ritual 2: Partner payout & reconciliation.
 * Step 1: Spacious physical count or shelf payout workspace.
 * Step 2: Apple Pay-style payment sheet (cash drawer vs bank transfer).
 */
export default function PosVendorReturSoreTab({
    selectedVendor,
    activeBatch,
    vendorBatches = [],
    setSelectedBatchId,
    payoutMethod = 'CASH',
    setPayoutMethod,
    splitCashAmount = 0,
    setSplitCashAmount,
    splitTransferAmount = 0,
    isPayingViaSplit = false,
    bankReference = '',
    setBankReference,
    isPayingViaTransfer = false,
    isPaymentStep = false,
    setIsPaymentStep,
    isLoading = false,
    isSubmitting = false,
    returCalculations = { items: [], totalSold: 0, totalReturned: 0, totalPayable: 0 },
    handleSetAllZero,
    handlePhysicalRemainingChange,
    handleRecountItem,
    discrepancyMode = 'STORE_ABSORB',
    setDiscrepancyMode,
    includePastBalance = true,
    setIncludePastBalance,
    activeProductScope = 'ALL',
    setActiveProductScope,
    handleScopeChange,
    hasMultipleCategories = false,
    isAllShelf = false,
    isAllPerishable = false,
    returnShelfStock = false,
    setReturnShelfStock,
    availableCash = 0,
    isExceedingDrawer = false,
    submitReturSore,
    formatRp,
}) {
    // -------------------------------------------------------------
    // STEP 2: Dedicated Apple Pay-Style Payment Sheet
    // -------------------------------------------------------------
    if (isPaymentStep) {
        return (
            <PosVendorPaymentSheet
                selectedVendor={selectedVendor}
                activeBatch={activeBatch}
                payoutMethod={payoutMethod}
                setPayoutMethod={setPayoutMethod}
                splitCashAmount={splitCashAmount}
                setSplitCashAmount={setSplitCashAmount}
                splitTransferAmount={splitTransferAmount}
                isPayingViaSplit={isPayingViaSplit}
                bankReference={bankReference}
                setBankReference={setBankReference}
                isPayingViaTransfer={isPayingViaTransfer}
                returCalculations={returCalculations}
                discrepancyMode={discrepancyMode}
                setDiscrepancyMode={setDiscrepancyMode}
                includePastBalance={includePastBalance}
                availableCash={availableCash}
                isExceedingDrawer={isExceedingDrawer}
                isSubmitting={isSubmitting}
                returnShelfStock={returnShelfStock}
                submitReturSore={submitReturSore}
                onBack={() => setIsPaymentStep(false)}
                formatRp={formatRp}
            />
        );
    }

    // -------------------------------------------------------------
    // STEP 1: Spacious Reconciliation & Payout Workspace
    // -------------------------------------------------------------
    const isShelfPayout = !returnShelfStock;
    const isBatchSettled = Boolean(activeBatch?.settlement_status === 'SETTLED');

    return (
        <div className="flex-1 flex flex-col justify-between min-h-0">
            {/* Scrollable Work Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mb-2 space-y-3">
                {/* Apple HIG Monday-Friday Calendar Strip (only for fresh daily batches) */}
                {!isAllShelf && vendorBatches.length > 0 && (
                    <PosVendorWeekStrip
                        activeBatch={activeBatch}
                        vendorBatches={vendorBatches}
                        onSelectBatch={setSelectedBatchId}
                    />
                )}

                {/* Category Scope Selector (Perishable Fresh vs Shelf Goods) */}
                {hasMultipleCategories && (
                    <PosVendorScopeSelector
                        activeProductScope={activeProductScope}
                        onSelectScope={handleScopeChange || setActiveProductScope}
                    />
                )}

                {/* Compact Batch Info & Quick Action Bar */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200/90 rounded-2xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate">
                            {isShelfPayout
                                ? 'Pencairan Bagi Hasil (Stok Toko Aman)'
                                : activeBatch
                                ? activeBatch.is_active_today
                                    ? 'Titipan Hari Ini'
                                    : `Titipan ${activeBatch.received_date_formatted || activeBatch.received_date}`
                                : 'Rekonsiliasi Retur & Payout'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                            isBatchSettled
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                            {isShelfPayout ? 'Konsinyasi Berkala' : (isBatchSettled ? 'Sudah Lunas' : 'Siap Rekap')}
                        </span>
                    </div>

                    {returnShelfStock && !isBatchSettled && (
                        <button
                            type="button"
                            onClick={handleSetAllZero}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer shrink-0"
                            title="Setel sisa semua produk ke 0 (nampan kosong / laku semua)"
                        >
                            Semua Laku (0)
                        </button>
                    )}
                </div>

                {/* Settled Batch Reassurance Info */}
                {isBatchSettled && (
                    <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-slate-700 font-medium truncate">
                                Batch ini sudah lunas dicairkan{activeBatch?.settled_at ? ` (${activeBatch.settled_at})` : ''}
                            </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">
                            Lunas Rp 0
                        </span>
                    </div>
                )}

                {isLoading && returCalculations.items.length === 0 ? (
                    <div className="py-20 text-center text-xs text-slate-400">
                        Memuat data konsinyasi...
                    </div>
                ) : returCalculations.items.length === 0 ? (
                    <EmptyState
                        icon={HandCoins}
                        title="Tidak ada menu"
                        description="Tidak ada menu yang perlu dicairkan pada saat ini."
                        className="py-16"
                    />
                ) : (
                    <>
                        {/* Ergonomic Product Items Grid */}
                        <div className="space-y-2">
                            {returCalculations.items.map((it) => (
                                <PosVendorReturItemCard
                                    key={it.id}
                                    it={it}
                                    formatRp={formatRp}
                                    handlePhysicalRemainingChange={handlePhysicalRemainingChange}
                                    handleRecountItem={handleRecountItem}
                                    returnShelfStock={returnShelfStock}
                                    isBatchSettled={isBatchSettled}
                                />
                            ))}
                        </div>

                        {/* Shelf Stock Retention vs Return (Apple HIG Adaptive Reassurance) */}
                        {isAllShelf ? (
                            returnShelfStock ? (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                                    <span className="text-amber-900 font-semibold truncate">
                                        Mode Penarikan: Sisa fisik akan ditarik & stok toko di-nol-kan
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setReturnShelfStock?.(false)}
                                        className="text-[11px] text-amber-800 font-bold underline shrink-0 cursor-pointer"
                                    >
                                        Batal Tarik
                                    </button>
                                </div>
                            ) : (
                                <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                        <span className="text-slate-700 font-medium truncate">
                                            Stok toko tetap aman &bull; Hanya mencairkan bagi hasil barang laku
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setReturnShelfStock?.(true)}
                                        className="text-[11px] text-slate-400 hover:text-slate-700 underline shrink-0 cursor-pointer"
                                        title="Klik jika mitra menarik pulang seluruh barang dari toko"
                                    >
                                        Tarik sisa fisik?
                                    </button>
                                </div>
                            )
                        ) : (
                            <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none min-w-0">
                                    <input
                                        type="checkbox"
                                        checked={returnShelfStock}
                                        onChange={(e) => setReturnShelfStock?.(e.target.checked)}
                                        className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900 cursor-pointer shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <span className="text-xs font-semibold text-slate-800 block truncate">
                                            Tarik & retur sisa fisik ke mitra
                                        </span>
                                        <span className="text-[11px] text-slate-500 font-normal block">
                                            {returnShelfStock
                                                ? 'Sisa barang fisik ditarik pulang oleh mitra dan stok di toko akan di-nol-kan.'
                                                : 'Barang tidak ditarik. Sisa stok tetap tersimpan di toko untuk dijual kembali.'}
                                        </span>
                                    </div>
                                </label>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                                    {returnShelfStock ? 'Retur Fisik' : 'Stok Toko Aman'}
                                </span>
                            </div>
                        )}

                        {/* Past Unsettled Balance (Single Clean Line) */}
                        {returCalculations.hasPastUnsettled && (
                            <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none min-w-0">
                                    <input
                                        type="checkbox"
                                        checked={includePastBalance}
                                        onChange={(e) => setIncludePastBalance(e.target.checked)}
                                        className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900 cursor-pointer shrink-0"
                                    />
                                    <span className="text-xs font-semibold text-slate-800 truncate">
                                        {activeBatch?.is_active_today
                                            ? 'Sertakan saldo titipan kemarin/sebelumnya yang belum dicairkan'
                                            : 'Sertakan sisa saldo titipan tanggal lain yang belum dicairkan'}
                                    </span>
                                </label>
                                <span className="font-mono font-bold text-xs text-slate-900 shrink-0">
                                    +{formatRp(returCalculations.pastUnsettledBalance)}
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Apple HIG Sleek Bottom Dock */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Total Hak Bersih Mitra
                    </span>
                    <div className="flex items-baseline gap-2">
                        <strong className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-tight">
                            {formatRp(returCalculations.totalPayable)}
                        </strong>
                        {returCalculations.hasPastUnsettled && includePastBalance ? (
                            <span className="text-xs text-slate-500 hidden sm:inline">
                                ({returCalculations.totalSold} pcs laku · {formatRp(returCalculations.currentBatchPayable)} + saldo lain {formatRp(returCalculations.pastUnsettledBalance)})
                            </span>
                        ) : (
                            <span className="text-xs text-slate-500 hidden sm:inline">
                                ({returCalculations.totalSold} pcs laku {returnShelfStock && returCalculations.totalReturned > 0 ? `· ${returCalculations.totalReturned} pcs retur` : '· stok tetap di toko'})
                            </span>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsPaymentStep(true)}
                    disabled={returCalculations.items.length === 0 || returCalculations.totalPayable <= 0}
                    className={`py-3 px-5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                        returCalculations.items.length > 0 && returCalculations.totalPayable > 0
                            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    <span>{isBatchSettled && returCalculations.totalPayable <= 0 ? 'Batch Sudah Lunas' : 'Lanjut Pembayaran'}</span>
                    {returCalculations.totalPayable > 0 && <ArrowRight className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}

