import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import { printSupplierPayoutReceiptInPage, printSupplierCodReceiptInPage } from '@/Utils/inPageReceiptPrinter';

/**
 * PosVendorSuccessModal
 * 
 * Post-Action Reassurance Sheet for Vendor Consignment operations.
 * Modeled on PosTransactionSuccessModal (Apple HIG calm authority).
 * Provides thermal slip printing & instant closure for cashier turnover.
 */
export default function PosVendorSuccessModal({
    isOpen,
    onClose,
    successData,
    formatRp,
}) {
    const [hasPrinted, setHasPrinted] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setHasPrinted(false);

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClose?.();
            } else if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                handlePrint();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, successData]);

    if (!isOpen || !successData) return null;

    const {
        title = 'Transaksi Berhasil',
        amount = 0,
        supplierName = '',
        referenceNumber = '',
        paymentMethod = 'CASH',
        returnedItems = [],
        incomingItems = [],
        rawPayload = {},
        isCod = false,
    } = successData;

    const handlePrint = () => {
        setHasPrinted(true);
        if (isCod || rawPayload?.isCod || rawPayload?.category === 'SUPPLIER_COD') {
            printSupplierCodReceiptInPage(rawPayload || successData);
        } else if (rawPayload && (rawPayload.settlement || rawPayload.amount)) {
            printSupplierPayoutReceiptInPage(rawPayload);
        } else {
            // Fallback print object
            printSupplierPayoutReceiptInPage({
                settlement: {
                    settlement_number: referenceNumber || 'STL-0000',
                    created_at: new Date().toISOString(),
                },
                supplier: { name: supplierName },
                amount: amount,
                payment_method: paymentMethod,
                returned_items: returnedItems.map((r) => ({
                    name: r.name,
                    qty_returned: r.qty,
                })),
            });
        }
    };

    const isPayout = Number(amount) > 0;
    const totalIncoming = incomingItems.reduce((acc, it) => acc + (it.qty || 0), 0);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans select-none">
                {/* Backdrop Scrim */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/35 backdrop-blur-xs cursor-pointer"
                />

                {/* Floating Sheet Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                    className="relative w-full max-w-sm bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 overflow-hidden text-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Quiet Status Glyph */}
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100 shadow-2xs">
                        <Check className="w-6 h-6 stroke-[2.5]" />
                    </div>

                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        {title}
                    </h4>

                    {/* Hero Typographic Focus */}
                    {isPayout ? (
                        <div className="mb-4">
                            <p className="text-3xl font-black text-slate-900 tracking-tight font-tabular">
                                {formatRp(amount)}
                            </p>
                            <p className="text-xs font-semibold text-slate-500 mt-1">
                                {paymentMethod === 'BANK_TRANSFER' ? 'Transfer Bank Berhasil Dicatat' : 'Uang Tunai Telah Diserahkan'}
                            </p>
                        </div>
                    ) : totalIncoming > 0 ? (
                        <div className="mb-4">
                            <p className="text-3xl font-black text-slate-900 tracking-tight font-tabular">
                                +{totalIncoming} pcs
                            </p>
                            <p className="text-xs font-semibold text-slate-500 mt-1">
                                Stok Titipan Baru Masuk Rak POS
                            </p>
                        </div>
                    ) : (
                        <p className="text-lg font-bold text-slate-900 mb-4">
                            Sisa Rak Telah Diretur
                        </p>
                    )}

                    {/* Receipt Details Card */}
                    <div className="w-full bg-slate-50/90 rounded-2xl border border-slate-200/70 p-3.5 text-left text-xs font-tabular space-y-2 mb-5">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                            <span className="text-slate-500 font-sans">No. Bukti:</span>
                            <span className="font-mono font-bold text-slate-900 text-xs">
                                {referenceNumber || 'RCV / STL'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-sans">Mitra:</span>
                            <span className="font-bold text-slate-800 truncate max-w-[170px]">
                                {supplierName}
                            </span>
                        </div>

                        {returnedItems.length > 0 && (
                            <div className="flex justify-between items-center text-[11px] text-amber-700">
                                <span className="font-sans">Retur Sisa Rak:</span>
                                <span className="font-bold">
                                    {returnedItems.reduce((acc, it) => acc + (it.qty || 0), 0)} pcs
                                </span>
                            </div>
                        )}

                        {incomingItems.length > 0 && (
                            <div className="flex justify-between items-center text-[11px] text-emerald-700">
                                <span className="font-sans">Titipan Masuk:</span>
                                <span className="font-bold">
                                    +{incomingItems.reduce((acc, it) => acc + (it.qty || 0), 0)} pcs
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 w-full">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                                hasPrinted
                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                        >
                            <Printer className="w-4 h-4" />
                            <span>{hasPrinted ? 'Cetak Ulang' : 'Cetak Bukti'}</span>
                            <kbd className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${hasPrinted ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-300'}`}>P</kbd>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                            <span>Selesai</span>
                            <kbd className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-400">Enter</kbd>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
