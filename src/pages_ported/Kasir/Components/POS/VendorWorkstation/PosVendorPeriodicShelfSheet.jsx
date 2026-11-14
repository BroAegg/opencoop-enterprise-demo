import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Layers, Coins, Camera } from 'lucide-react';
import PosVendorPeriodicPayoutSection from './PosVendorPeriodicPayoutSection';
import PosVendorPeriodicRestockSection from './PosVendorPeriodicRestockSection';
import PosVendorConfirmModal from './PosVendorConfirmModal';
import PosVendorSuccessModal from './PosVendorSuccessModal';
import PosVendorQuickAddProductModal from './PosVendorQuickAddProductModal';
import PosVendorReceiptCaptureModal from './PosVendorReceiptCaptureModal';
import { usePosVendorPeriodicActions } from './usePosVendorPeriodicActions';

/**
 * PosVendorPeriodicShelfSheet
 * 
 * Specialized workstation for Konsinyasi Berkala (Shelf / Snack Kemasan).
 * Ergonomic Gateway Flow:
 * - GATEWAY ("SELECT"): Cashier instantly perceives whether supplier has pending payout or wants to restock.
 * - ACTION ("RESTOCK"): 100% isolated product catalog intake with steppers.
 * - ACTION ("PAYOUT"):  100% isolated delivery note & cash drawer settlement.
 */
export default function PosVendorPeriodicShelfSheet({
    selectedVendor,
    vendorProducts = [],
    vendorBatches = [],
    availableCash = 0,
    formatRp,
    onSuccess,
    fetchConsignmentData,
    refreshShift,
}) {
    const [showQuickAddModal, setShowQuickAddModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);

    const {
        activeAction,
        setActiveAction,
        isSubmitting,
        restockQtys,
        payoutMode,
        selectedBatchIds,
        selectedBatches,
        payoutMethod,
        setPayoutMethod,
        bankReference,
        setBankReference,
        returnShelfStock,
        setReturnShelfStock,
        confirmModalData,
        setConfirmModalData,
        showSuccessModal,
        setShowSuccessModal,
        successModalData,
        unsettledBalance,
        unpaidBatches,
        customAmount,
        handleCustomAmountChange,
        effectivePayoutAmount,
        totalRestockPcs,
        totalRestockCost,
        remainingDrawerCash,
        handleToggleBatch,
        handleSelectAllPast,
        handleSelectAll,
        handleSelectCustom,
        handleRestockQtyChange,
        handleQuickAddSuccess,
        handleOpenConfirm,
        executeRestockAction,
    } = usePosVendorPeriodicActions({
        selectedVendor,
        vendorProducts,
        vendorBatches,
        availableCash,
        formatRp,
        onSuccess,
        fetchConsignmentData,
        refreshShift,
    });

    const safeUnpaidBatches = Array.isArray(unpaidBatches) ? unpaidBatches : [];
    const hasPayable = safeUnpaidBatches.length > 0 || unsettledBalance > 0;
    const payableAmount = unsettledBalance > 0
        ? unsettledBalance
        : safeUnpaidBatches.reduce((acc, b) => acc + Number(b.total_earned || 0), 0);

    return (
        <div className="flex-1 flex flex-col justify-between min-h-0 font-sans">
            {/* GATEWAY STATE: Cashier selects intent with glanceable status */}
            {activeAction === 'SELECT' ? (
                <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full py-4 px-2 space-y-4">
                    <div className="text-center space-y-1 mb-2">
                        <h3 className="text-base font-bold text-slate-950">
                            Pilih Keperluan Mitra
                        </h3>
                        <p className="text-xs text-slate-500">
                            Tentukan transaksi untuk <strong>{selectedVendor.name}</strong> hari ini:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                        {/* Option 1: Tambah Stok Barang */}
                        <button
                            type="button"
                            onClick={() => setActiveAction('RESTOCK')}
                            className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-900 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 text-left shadow-2xs group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors">
                                <Layers className="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0 flex items-center gap-2.5 flex-wrap">
                                <span className="text-sm font-bold text-slate-900">
                                    Tambah Stok Barang
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-slate-100 text-slate-700">
                                    {vendorProducts.length} Produk di Katalog
                                </span>
                            </div>

                            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 group-hover:translate-x-0.5 group-hover:text-slate-700 transition-all" />
                        </button>

                        {/* Option 2: Pencairan Penjualan */}
                        <button
                            type="button"
                            onClick={() => setActiveAction('PAYOUT')}
                            className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-900 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 text-left shadow-2xs group"
                        >
                            <div className="relative w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors">
                                <Coins className="w-6 h-6" />
                                {hasPayable && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600 ring-2 ring-white" />
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 flex items-center gap-2.5 flex-wrap">
                                <span className="text-sm font-bold text-slate-900">
                                    Pencairan Penjualan
                                </span>
                                {hasPayable ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-rose-600 text-white font-mono shadow-xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                        ADA TAGIHAN: {formatRp(payableAmount)}
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-500 font-mono">
                                        SEMUA LUNAS
                                    </span>
                                )}
                            </div>

                            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 group-hover:translate-x-0.5 group-hover:text-slate-700 transition-all" />
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* IN-ACTION NAVIGATION: Return to options */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveAction('SELECT')}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                            title="Kembali ke pilihan keperluan mitra"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Pilihan Aksi</span>
                        </button>

                        <span className="text-xs font-bold text-slate-700">
                            {activeAction === 'PAYOUT' ? 'Pencairan Penjualan' : 'Tambah Stok Barang'}
                        </span>
                    </div>

                    {/* FOCUSED ACTION BODY */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mb-2">
                        {activeAction === 'RESTOCK' ? (
                            <PosVendorPeriodicRestockSection
                                vendorProducts={vendorProducts}
                                restockQtys={restockQtys}
                                onRestockQtyChange={handleRestockQtyChange}
                                totalRestockPcs={totalRestockPcs}
                                totalRestockCost={totalRestockCost}
                                formatRp={formatRp}
                                vendorName={selectedVendor.name}
                                onOpenQuickAdd={() => setShowQuickAddModal(true)}
                            />
                        ) : (
                            <PosVendorPeriodicPayoutSection
                                selectedVendor={selectedVendor}
                                vendorBatches={vendorBatches}
                                availableCash={availableCash}
                                formatRp={formatRp}
                                payoutMode={payoutMode}
                                selectedBatchIds={selectedBatchIds}
                                selectedBatches={selectedBatches}
                                onToggleBatch={handleToggleBatch}
                                onSelectAllPast={handleSelectAllPast}
                                onSelectAll={handleSelectAll}
                                onSelectCustom={handleSelectCustom}
                                customAmount={customAmount}
                                onCustomAmountChange={handleCustomAmountChange}
                                payoutMethod={payoutMethod}
                                onPayoutMethodChange={setPayoutMethod}
                                bankReference={bankReference}
                                onBankReferenceChange={setBankReference}
                                returnShelfStock={returnShelfStock}
                                onReturnShelfStockChange={setReturnShelfStock}
                                effectivePayoutAmount={effectivePayoutAmount}
                                onSwitchToRestock={() => setActiveAction('RESTOCK')}
                            />
                        )}
                    </div>

                    {/* FOCUSED ACTION BOTTOM BAR */}
                    <div className="pt-3 border-t border-slate-200 shrink-0">
                        {activeAction === 'RESTOCK' ? (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                {/* Button 1: Simpan Cepat (Tanpa Nota) */}
                                <button
                                    type="button"
                                    disabled={totalRestockPcs <= 0 || isSubmitting}
                                    onClick={handleOpenConfirm}
                                    className="flex-1 py-3 px-3 sm:px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Simpan penambahan stok langsung tanpa melampirkan foto nota"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span className="truncate">Simpan Cepat (Tanpa Nota)</span>
                                </button>

                                {/* Button 2: Foto & Upload Nota */}
                                <button
                                    type="button"
                                    disabled={totalRestockPcs <= 0 || isSubmitting}
                                    onClick={() => setShowReceiptModal(true)}
                                    className="flex-[1.3] py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Buka kamera / ambil foto nota fisik mitra dan simpan stok"
                                >
                                    <Camera className="w-4 h-4 text-teal-400 shrink-0" />
                                    <span className="truncate">
                                        {totalRestockPcs > 0
                                            ? `Foto & Upload Nota (${totalRestockPcs} pcs · ${formatRp(totalRestockCost)})`
                                            : 'Foto & Upload Nota'}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
                                </button>
                            </div>
                        ) : (
                            (() => {
                                const payoutScopeLabel = (() => {
                                    if (payoutMode === 'CUSTOM') return 'Sebagian';
                                    if (selectedBatches.length === 1) {
                                        const b = selectedBatches[0];
                                        return b.is_today ? 'Drop Hari Ini' : (b.is_yesterday ? 'Drop Kemarin' : 'Nota Terpilih');
                                    }
                                    if (selectedBatches.length === unpaidBatches.length && unpaidBatches.length > 1) {
                                        return 'Semua Nota';
                                    }
                                    return `${selectedBatches.length} Nota Terpilih`;
                                })();

                                return (
                                    <button
                                        type="button"
                                        disabled={effectivePayoutAmount <= 0 || isSubmitting || (payoutMethod === 'CASH' && remainingDrawerCash < 0)}
                                        onClick={handleOpenConfirm}
                                        className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <span>
                                            {effectivePayoutAmount > 0
                                                ? `Cairkan ${payoutScopeLabel} ${formatRp(effectivePayoutAmount)} (${payoutMethod === 'CASH' ? 'Kas Laci' : 'Transfer Bank'})`
                                                : 'Pilih Penjualan yang Ingin Dicairkan'}
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                                    </button>
                                );
                            })()
                        )}
                    </div>
                </>
            )}

            {/* Modals */}
            {confirmModalData && (
                <PosVendorConfirmModal
                    isOpen={Boolean(confirmModalData)}
                    onClose={() => setConfirmModalData(null)}
                    onConfirm={confirmModalData.onConfirm}
                    isSubmitting={isSubmitting}
                    title={confirmModalData.title}
                    vendor={selectedVendor}
                    payoutAmount={confirmModalData.payoutAmount || 0}
                    payoutMethod={confirmModalData.payoutMethod || 'CASH'}
                    availableCash={availableCash}
                    returnedItems={confirmModalData.returnedItems || []}
                    incomingItems={confirmModalData.incomingItems || []}
                    formatRp={formatRp}
                />
            )}

            <PosVendorSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} successData={successModalData} formatRp={formatRp} />
            <PosVendorQuickAddProductModal isOpen={showQuickAddModal} onClose={() => setShowQuickAddModal(false)} vendor={selectedVendor} onSuccess={handleQuickAddSuccess} formatRp={formatRp} />
            <PosVendorReceiptCaptureModal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} onConfirmWithReceipt={(file) => { setShowReceiptModal(false); executeRestockAction(file); }} vendor={selectedVendor} totalPcs={totalRestockPcs} totalCost={totalRestockCost} formatRp={formatRp} isSubmitting={isSubmitting} />
        </div>
    );
}

