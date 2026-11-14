import React from 'react';
import { Truck, Coins, AlertCircle, ScanBarcode, ShoppingBag, ShieldCheck } from 'lucide-react';
import EmptyState from '@/Components/UI/EmptyState';
import usePosVendorBeliPutus from './usePosVendorBeliPutus';
import PosVendorBeliPutusItemRow from './PosVendorBeliPutusItemRow';
import PosVendorBeliPutusDrawerLedger from './PosVendorBeliPutusDrawerLedger';
import PosSupervisorAuthModal from '@/Pages/Kasir/Components/POS/PosSupervisorAuthModal';

/**
 * PosVendorBeliPutusTab
 * 
 * Apple HIG-grade quiet, tactile workspace for COD (Direct Store Delivery).
 * Features hardware barcode scanner gun auto-increment, crystal-clear drawer
 * impact ledger, and tactile single-Enter execution.
 */
export default function PosVendorBeliPutusTab({
    selectedVendor,
    availableCash = 0,
    formatRp,
    refreshSuppliers,
    refreshShift,
}) {
    const {
        products,
        incomingQtys,
        invoiceNumber,
        setInvoiceNumber,
        isSubmitting,
        submitError,
        lastScannedId,
        handleQtyChange,
        totalPcs,
        totalAmount,
        isExceedingDrawer,
        isSupervisor,
        isAuthModalOpen,
        setIsAuthModalOpen,
        handleAuthorized,
        handleSubmit,
    } = usePosVendorBeliPutus({
        selectedVendor,
        availableCash,
        formatRp,
        refreshSuppliers,
        refreshShift,
    });

    if (!products || products.length === 0) {
        return (
            <EmptyState
                icon={ShoppingBag}
                title="Belum Ada Katalog Produk"
                description={`Supplier ${selectedVendor?.name} belum memiliki daftar produk yang terhubung.`}
                className="py-16"
            />
        );
    }

    return (
        <div className="flex-1 flex flex-col justify-between min-h-0 space-y-3">
            {/* Header: Vendor identity & Barcode readiness */}
            <div className="bg-slate-900 text-white p-3 sm:p-4 rounded-2xl flex items-center justify-between shadow-xs shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm sm:text-base truncate">
                                {selectedVendor.company_name || selectedVendor.name}
                            </h3>
                            <span className="text-[10px] bg-amber-600 text-white font-bold px-2.5 py-0.5 rounded-md shadow-2xs">
                                Beli Putus · Bayar Laci
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            PIC: {selectedVendor.owner_name || 'Driver'} · WA: {selectedVendor.phone_wa || selectedVendor.phone || '-'}
                        </p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs">
                    <ScanBarcode className="w-3.5 h-3.5 text-white" />
                    <span className="text-[11px]">Scanner Siap</span>
                </div>
            </div>

            {/* Product Receiving List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-0">
                {products.map((p) => (
                    <PosVendorBeliPutusItemRow
                        key={p.id}
                        product={p}
                        qty={incomingQtys[p.id] ?? ''}
                        onQtyChange={(val) => handleQtyChange(p.id, val)}
                        isJustScanned={lastScannedId === p.id}
                        formatRp={formatRp}
                    />
                ))}
            </div>

            {/* Error Banner */}
            {submitError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                </div>
            )}

            {/* Docked Action Area: Drawer Impact Ledger & 1-Click Execution */}
            <div className="space-y-2.5 shrink-0">
                <PosVendorBeliPutusDrawerLedger
                    availableCash={availableCash}
                    totalAmount={totalAmount}
                    totalPcs={totalPcs}
                    invoiceNumber={invoiceNumber}
                    onInvoiceChange={setInvoiceNumber}
                    formatRp={formatRp}
                />

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={totalPcs <= 0 || isSubmitting || isExceedingDrawer}
                    className={`w-full py-4 px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99] tracking-wide ${
                        totalPcs <= 0 || isSubmitting || isExceedingDrawer
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                >
                    {totalPcs > 0 && !isExceedingDrawer && !isSupervisor ? (
                        <ShieldCheck className="w-5 h-5 text-white" />
                    ) : (
                        <Coins className={`w-5 h-5 ${totalPcs > 0 && !isExceedingDrawer ? 'text-white' : 'text-slate-400'}`} />
                    )}
                    <span>
                        {isSubmitting
                            ? 'MEMPROSES KAS KELUAR...'
                            : isExceedingDrawer
                            ? `SALDO LACI KURANG (${formatRp(availableCash)})`
                            : totalPcs > 0
                            ? isSupervisor
                                ? `BAYAR TUNAI DARI KAS LACI (${formatRp(totalAmount)})`
                                : `OTORISASI PIN & BAYAR COD (${formatRp(totalAmount)})`
                            : 'SCAN ATAU PILIH QTY BARANG MASUK'}
                    </span>
                    {totalPcs > 0 && !isExceedingDrawer && !isSubmitting && (
                        <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-mono font-bold bg-white/20 text-white rounded border border-white/20">
                            Enter
                        </kbd>
                    )}
                </button>
            </div>

            {/* Supervisor PIN Authorization Modal (Portaled globally) */}
            <PosSupervisorAuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onAuthorized={handleAuthorized}
                actionTitle="Otorisasi Supervisor COD"
                actionDescription={`Pembayaran COD ${selectedVendor.company_name || selectedVendor.name} sebesar ${formatRp(totalAmount)} dari kas laci memerlukan persetujuan Supervisor.`}
            />
        </div>
    );
}
