import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, Check, Coins, CornerDownLeft, Package, RotateCcw, ShieldCheck, Wallet, X } from 'lucide-react';

/**
 * PosVendorConfirmModal
 * 
 * Pre-action safety sheet for Vendor Consignment operations.
 * Prevents accidental fat-finger clicks & provides intentional cashier friction.
 * Keyboard-first: [Enter] to confirm, [Escape] to cancel.
 */
export default function PosVendorConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting = false,
    title = 'Konfirmasi Aksi Vendor',
    vendor,
    payoutAmount = 0,
    payoutMethod = 'CASH',
    availableCash = 0,
    returnedItems = [],
    incomingItems = [],
    formatRp,
}) {
    // Keyboard shortcuts: Enter to submit, Escape to cancel
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                if (!isSubmitting) onClose?.();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (!isSubmitting) onConfirm?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isSubmitting, onClose, onConfirm]);

    if (!isOpen) return null;

    const remainingCash = availableCash - (payoutMethod === 'CASH' ? payoutAmount : 0);
    const isCashInsufficient = payoutMethod === 'CASH' && payoutAmount > 0 && remainingCash < 0;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans select-none">
                {/* Backdrop Scrim */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                        if (!isSubmitting) onClose?.();
                    }}
                    className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs cursor-pointer"
                />

                {/* Dialog Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                    className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/90 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 leading-tight">
                                    {title}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {vendor?.name || 'Mitra Vendor'} · <span className="font-mono text-slate-400">{vendor?.code || `#${vendor?.id}`}</span>
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Breakdown Content */}
                    <div className="space-y-3 my-4">
                        {/* 1. Cash Payout Card */}
                        {payoutAmount > 0 && (
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                                    <span className="flex items-center gap-1.5">
                                        <Wallet className="w-3.5 h-3.5 text-slate-700" />
                                        {payoutMethod === 'CASH' ? 'Uang Kas Laci Keluar' : 'Transfer Bank (Kantor)'}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                                        {payoutMethod}
                                    </span>
                                </div>

                                <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                                    <span className="text-xs text-slate-500">Nominal Bagi Hasil:</span>
                                    <span className="text-lg font-black text-slate-900 font-tabular">
                                        {formatRp(payoutAmount)}
                                    </span>
                                </div>

                                {payoutMethod === 'CASH' && (
                                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60 text-slate-500">
                                        <span>Sisa Kas Laci Kasir:</span>
                                        <span className={`font-bold font-tabular ${isCashInsufficient ? 'text-red-600' : 'text-slate-800'}`}>
                                            {formatRp(remainingCash)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2. Physical Stock Movements */}
                        {(returnedItems.length > 0 || incomingItems.length > 0) && (
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                                {returnedItems.length > 0 && (
                                    <div className="flex items-center justify-between text-slate-700">
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                                            Retur Sisa Kemarin:
                                        </span>
                                        <span className="font-bold text-slate-900 font-tabular">
                                            {returnedItems.reduce((acc, it) => acc + (it.qty || 0), 0)} pcs (stok rak dinolkan)
                                        </span>
                                    </div>
                                )}

                                {incomingItems.length > 0 && (
                                    <div className="flex items-center justify-between text-slate-700">
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <Package className="w-3.5 h-3.5 text-emerald-600" />
                                            Titipan / Restok Baru:
                                        </span>
                                        <span className="font-bold text-emerald-700 font-tabular">
                                            +{incomingItems.reduce((acc, it) => acc + (it.qty || 0), 0)} pcs (masuk rak POS)
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Warning if cash insufficient */}
                        {isCashInsufficient && (
                            <div className="flex items-start gap-2 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                                <span>Kas laci kasir saat ini tidak mencukupi untuk pembayaran tunai. Pilih Transfer Bank atau kurangi nominal.</span>
                            </div>
                        )}

                        <p className="text-[11px] text-slate-400 text-center pt-1">
                            Pastikan fisik uang tunai & barang telah dihitung bersama mitra.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                        >
                            <span>Periksa Lagi</span>
                            <kbd className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-400">Esc</kbd>
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isSubmitting || isCashInsufficient}
                            className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Ya, Konfirmasi</span>
                                    <kbd className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Enter</kbd>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

