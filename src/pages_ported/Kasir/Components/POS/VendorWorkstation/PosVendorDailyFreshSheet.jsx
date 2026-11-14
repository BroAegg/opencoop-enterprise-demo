import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import PosVendorDailyFreshGateway from './PosVendorDailyFreshGateway';
import PosVendorDailyFreshReconSection from './PosVendorDailyFreshReconSection';
import PosVendorDailyFreshDropSection from './PosVendorDailyFreshDropSection';
import PosVendorDailyFreshSummaryCard from './PosVendorDailyFreshSummaryCard';
import PosVendorConfirmModal from './PosVendorConfirmModal';
import PosVendorSuccessModal from './PosVendorSuccessModal';
import PosVendorQuickAddProductModal from './PosVendorQuickAddProductModal';
import PosVendorReceiptCaptureModal from './PosVendorReceiptCaptureModal';
import PosVendorWeekStrip from '@/Pages/Kasir/Components/POS/VendorHub/Tabs/PosVendorWeekStrip';
import { usePosVendorDailyFreshActions } from './usePosVendorDailyFreshActions';

/**
 * PosVendorDailyFreshSheet
 * 
 * Specialized ritual for Fresh & Bakery Consignment (e.g. Sari Roti, kue basah).
 * Features a 3-Intent Selection Gateway (Apple HIG Scandinavian Clarity):
 * 1. FULL: Paket Pagi Lengkap (Reconciliation + Return + Payout + Morning Drop in 1 action)
 * 2. DROP_ONLY: Hanya Drop Baru (Re-drop afternoon or cash drawer shortage)
 * 3. SETTLE_ONLY: Pelunasan & Retur Saja (Afternoon clearing / settlement without restock)
 */
export default function PosVendorDailyFreshSheet(props) {
    const {
        selectedVendor,
        vendorProducts = [],
        vendorBatches = [],
        availableCash = 0,
        formatRp,
    } = props;

    const [showReceiptModal, setShowReceiptModal] = useState(false);

    const {
        activeAction,
        setActiveAction,
        isSubmitting,
        incomingQtys,
        isSettlingCash,
        setIsSettlingCash,
        payoutMethod,
        setPayoutMethod,
        showConfirmModal,
        setShowConfirmModal,
        showSuccessModal,
        setShowSuccessModal,
        showQuickAddModal,
        setShowQuickAddModal,
        successModalData,
        isFixedMargin,
        marginRate,
        unpaidBatch,
        activeBatch,
        isBatchSettled,
        isConsolidatedMode,
        unpaidBatches,
        totalUnpaidAmount,
        hasPayable,
        reconItems,
        totalHakMitra,
        totalReturPcs,
        totalOmzet,
        totalMarginKoperasi,
        totalIncomingPcs,
        totalIncomingCost,
        remainingDrawerCash,
        handleRemainingChange,
        handleDiscrepancyReasonChange,
        handleIncomingQtyChange,
        handleOpenConfirm,
        handleConfirmExecute,
        handleQuickAddSuccess,
        handleSelectBatch,
        handleToggleConsolidated,
    } = usePosVendorDailyFreshActions(props);

    return (
        <div className="flex-1 flex flex-col justify-between min-h-0 font-sans">
            {activeAction === 'SELECT' ? (
                <PosVendorDailyFreshGateway
                    selectedVendor={selectedVendor}
                    vendorProducts={vendorProducts}
                    hasPayable={hasPayable}
                    totalHakMitra={totalUnpaidAmount}
                    unpaidCount={unpaidBatches.length}
                    formatRp={formatRp}
                    onSelectAction={setActiveAction}
                />
            ) : (
                /* IN-ACTION ACTIVE WORKSPACE */
                <>
                    {/* Mode Navigation Bar */}
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
                            {activeAction === 'SETTLE_ONLY' ? 'Pencairan Penjualan & Retur' : 'Terima Titipan Baru'}
                        </span>
                    </div>

                    {/* Day Strip (Sen - Jum) for Daily Consignment Payout/Reconciliation */}
                    {activeAction === 'SETTLE_ONLY' && vendorBatches && vendorBatches.length > 0 && (
                        <div className="pb-2 mb-2 border-b border-slate-100 shrink-0">
                            <PosVendorWeekStrip
                                activeBatch={activeBatch}
                                vendorBatches={vendorBatches}
                                onSelectBatch={handleSelectBatch}
                                onToggleConsolidated={handleToggleConsolidated}
                                isConsolidated={isConsolidatedMode}
                                unpaidCount={unpaidBatches.length}
                            />
                        </div>
                    )}

                    {/* Scrollable Work Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mb-2 space-y-4">
                        {activeAction === 'SETTLE_ONLY' ? (
                            <PosVendorDailyFreshReconSection
                                unpaidBatch={unpaidBatch}
                                reconItems={reconItems}
                                totalHakMitra={totalHakMitra}
                                totalReturPcs={totalReturPcs}
                                isFixedMargin={isFixedMargin}
                                marginRate={marginRate}
                                totalOmzet={totalOmzet}
                                totalMarginKoperasi={totalMarginKoperasi}
                                onRemainingChange={handleRemainingChange}
                                onDiscrepancyReasonChange={handleDiscrepancyReasonChange}
                                formatRp={formatRp}
                            />
                        ) : (
                            <PosVendorDailyFreshDropSection
                                vendorProducts={vendorProducts}
                                incomingQtys={incomingQtys}
                                onIncomingQtyChange={handleIncomingQtyChange}
                                totalIncomingPcs={totalIncomingPcs}
                                totalIncomingCost={totalIncomingCost}
                                isFixedMargin={isFixedMargin}
                                marginRate={marginRate}
                                formatRp={formatRp}
                                onOpenQuickAdd={() => setShowQuickAddModal(true)}
                                vendorName={selectedVendor?.name || 'Mitra'}
                            />
                        )}
                    </div>

                    {/* Bottom Summary Bar & Actions */}
                    <PosVendorDailyFreshSummaryCard
                        activeAction={activeAction}
                        totalHakMitra={totalHakMitra}
                        totalIncomingPcs={totalIncomingPcs}
                        totalIncomingCost={totalIncomingCost}
                        availableCash={availableCash}
                        remainingDrawerCash={remainingDrawerCash}
                        paymentMethod={payoutMethod}
                        onPaymentMethodChange={setPayoutMethod}
                        isSettlingCash={isSettlingCash}
                        onToggleSettlingCash={setIsSettlingCash}
                        isFixedMargin={isFixedMargin}
                        marginRate={marginRate}
                        totalOmzet={totalOmzet}
                        totalMarginKoperasi={totalMarginKoperasi}
                        isSubmitting={isSubmitting}
                        onExecute={handleOpenConfirm}
                        onOpenReceiptCapture={() => setShowReceiptModal(true)}
                        formatRp={formatRp}
                        vendorName={selectedVendor?.name || 'Mitra'}
                        isBatchSettled={isBatchSettled}
                        settlementNumber={activeBatch?.settlement_number}
                    />
                </>
            )}

            {/* Modals */}
            <PosVendorConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmExecute}
                isSubmitting={isSubmitting}
                title={
                    activeAction === 'DROP_ONLY'
                        ? 'Konfirmasi Penerimaan Titipan Drop'
                        : 'Konfirmasi Pelunasan & Retur Fisik'
                }
                vendor={selectedVendor}
                payoutAmount={activeAction === 'SETTLE_ONLY' && isSettlingCash ? totalHakMitra : 0}
                payoutMethod={activeAction === 'SETTLE_ONLY' && isSettlingCash ? payoutMethod : 'CASH'}
                availableCash={availableCash}
                returnedItems={
                    activeAction === 'SETTLE_ONLY'
                        ? reconItems.filter((it) => it.remaining > 0).map((it) => ({ name: it.name, qty: it.remaining }))
                        : []
                }
                incomingItems={
                    activeAction === 'DROP_ONLY'
                        ? Object.entries(incomingQtys).filter(([, q]) => Number(q) > 0).map(([pId, q]) => ({
                            name: vendorProducts.find((p) => p.id === Number(pId))?.name || 'Produk',
                            qty: Number(q),
                        }))
                        : []
                }
                formatRp={formatRp}
            />

            <PosVendorSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                successData={successModalData}
                formatRp={formatRp}
            />

            <PosVendorQuickAddProductModal
                isOpen={showQuickAddModal}
                onClose={() => setShowQuickAddModal(false)}
                vendor={selectedVendor}
                onSuccess={handleQuickAddSuccess}
                formatRp={formatRp}
            />

            <PosVendorReceiptCaptureModal
                isOpen={showReceiptModal}
                onClose={() => setShowReceiptModal(false)}
                onConfirmWithReceipt={(file) => {
                    setShowReceiptModal(false);
                    handleConfirmExecute(file);
                }}
                vendor={selectedVendor}
                totalPcs={totalIncomingPcs}
                totalCost={totalIncomingCost}
                formatRp={formatRp}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}

