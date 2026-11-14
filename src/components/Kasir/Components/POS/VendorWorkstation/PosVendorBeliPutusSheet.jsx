import React, { useState } from 'react';
import { Plus, Truck } from 'lucide-react';
import QuantityStepper from '@/Components/UI/QuantityStepper';
import PosVendorConfirmModal from './PosVendorConfirmModal';
import PosVendorSuccessModal from './PosVendorSuccessModal';
import PosVendorQuickAddProductModal from './PosVendorQuickAddProductModal';
import PosSupervisorAuthModal from '@/Pages/Kasir/Components/POS/PosSupervisorAuthModal';
import PosVendorBeliPutusBottomBar from './PosVendorBeliPutusBottomBar';
import { usePosVendorBeliPutusActions } from './usePosVendorBeliPutusActions';

/**
 * PosVendorBeliPutusSheet
 * 
 * Apple HIG-grade workstation for Beli Putus (Direct Store Delivery / COD).
 * Features atomic receiving + immediate payout, streamlined catalog intake,
 * drawer safety checks (Cash Drawer vs Store Bank Transfer), and tactile single-Enter action.
 */
export default function PosVendorBeliPutusSheet(props) {
    const {
        selectedVendor,
        availableCash = 0,
        formatRp,
        fetchConsignmentData,
    } = props;

    const {
        isSupervisor,
        incomingQtys,
        invoiceNumber,
        setInvoiceNumber,
        payoutMethod,
        setPayoutMethod,
        bankReference,
        setBankReference,
        isSubmitting,
        submitError,
        vendorProducts,
        totalPcs,
        totalCost,
        activeItems,
        isCashInsufficient,
        showConfirmModal,
        setShowConfirmModal,
        showSuccessModal,
        setShowSuccessModal,
        showQuickAddModal,
        setShowQuickAddModal,
        isAuthModalOpen,
        setIsAuthModalOpen,
        successModalData,
        handleQtyChange,
        handleOpenConfirm,
        handleAuthorized,
        executeCodPayout,
    } = usePosVendorBeliPutusActions(props);

    const [isEditingInvoice, setIsEditingInvoice] = useState(false);

    return (
        <div className="flex-1 flex flex-col justify-between min-h-0 font-sans">
            {/* Header: Vendor Info, Editable Invoice Pill & Quick Add */}
            <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 shrink-0 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-slate-700" />
                        Penerimaan Barang & Bayar COD
                    </span>

                    {/* Editable Invoice Pill */}
                    {isEditingInvoice ? (
                        <input
                            type="text"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            onBlur={() => setIsEditingInvoice(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditingInvoice(false)}
                            autoFocus
                            placeholder="No. Faktur / Nota"
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-slate-900 w-32 outline-none focus:border-slate-900"
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditingInvoice(true)}
                            className="px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Klik untuk ubah nomor faktur/nota"
                        >
                            Nota: {invoiceNumber || 'COD'}
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowQuickAddModal(true)}
                        className="px-2.5 py-1 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        title="Tambah varian produk baru dari distributor langsung di kasir"
                    >
                        <Plus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Produk Baru</span>
                    </button>

                    {totalPcs > 0 && (
                        <span className="text-xs font-mono font-black text-white bg-slate-900 px-3 py-1 rounded-lg shadow-2xs">
                            {totalPcs} pcs · {formatRp(totalCost)}
                        </span>
                    )}
                </div>
            </div>

            {/* Scrollable Product Intake List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mb-2">
                <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
                    {vendorProducts.length === 0 ? (
                        <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2">
                            <p className="text-xs text-slate-500 font-medium">
                                Belum ada katalog barang untuk {selectedVendor?.name}.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowQuickAddModal(true)}
                                className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer mt-1"
                            >
                                <Plus className="w-3.5 h-3.5 text-slate-700" />
                                <span>Tambah Produk Pertama</span>
                            </button>
                        </div>
                    ) : (
                        vendorProducts.map((p) => {
                            const currentQty = incomingQtys[p.id] || 0;
                            const subtotal = currentQty * Number(p.cost_price || 0);

                            return (
                                <div
                                    key={p.id}
                                    className={`p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-colors ${
                                        currentQty > 0
                                            ? 'bg-slate-50/60'
                                            : 'bg-white hover:bg-slate-50/50'
                                    }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                                {p.name}
                                            </h4>
                                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded">
                                                Stok Rak: {p.stock ?? 0} {p.unit || 'pcs'}
                                            </span>
                                            {p.barcode && (
                                                 <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                                                    {p.barcode}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                            HPP Beli: <strong className="text-slate-800">{formatRp(p.cost_price)}</strong> · Jual: {formatRp(p.selling_price)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {currentQty > 0 && (
                                            <span className="text-xs font-mono font-bold text-slate-900 font-tabular hidden sm:inline">
                                                {formatRp(subtotal)}
                                            </span>
                                        )}
                                        <QuantityStepper
                                            value={currentQty}
                                            onChange={(val) => handleQtyChange(p.id, val)}
                                            min={0}
                                            max={9999}
                                            size="md"
                                            batchIncrements={[10, 50]}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Error Message */}
            {submitError && (
                <div className="p-3 mb-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 shrink-0">
                    {submitError}
                </div>
            )}

            {/* Docked Bottom Bar: Payment Selector & 1-Click Execution */}
            <PosVendorBeliPutusBottomBar
                payoutMethod={payoutMethod}
                onPayoutMethodChange={setPayoutMethod}
                selectedVendor={selectedVendor}
                availableCash={availableCash}
                totalPcs={totalPcs}
                totalCost={totalCost}
                isCashInsufficient={isCashInsufficient}
                bankReference={bankReference}
                onBankReferenceChange={setBankReference}
                isSubmitting={isSubmitting}
                isSupervisor={isSupervisor}
                onOpenConfirm={handleOpenConfirm}
                formatRp={formatRp}
            />

            {/* Modals */}
            <PosVendorConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => executeCodPayout()}
                isSubmitting={isSubmitting}
                title="Konfirmasi Pembelian COD"
                vendor={selectedVendor}
                payoutAmount={totalCost}
                payoutMethod={payoutMethod}
                availableCash={availableCash}
                incomingItems={activeItems}
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
                onSuccess={() => fetchConsignmentData?.(true)}
                formatRp={formatRp}
            />

            <PosSupervisorAuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onAuthorized={handleAuthorized}
                actionTitle="Otorisasi Supervisor COD"
                actionDescription={`Otorisasi pengeluaran kas COD sebesar ${formatRp(totalCost)} untuk ${selectedVendor?.name}.`}
            />
        </div>
    );
}
