import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Printer } from 'lucide-react';

/**
 * PosTransactionSuccessModal: Apple HIG Reassurance Sheet.
 * 
 * Design Principles:
 * 1. "No News is Good News" - Calm authority, expected baseline, zero shouting or confetti.
 * 2. Hero Typographic Focus - The Change (Kembalian) is the single hero figure the cashier needs.
 * 3. Anti-Boxception - Grouping via clean hairlines & generous whitespace, no boxes inside boxes.
 * 4. Single-Accent Discipline - 95% neutral slate monochrome, zero fruit-salad colors or faux AI sparkles.
 * 5. Zero-Click Turnover - Seamlessly dismisses upon scanning the next customer's product.
 */
export default function PosTransactionSuccessModal({
    transaction,
    onClose,
    onPrint,
    autoDismissSeconds = 4,
    onSwitchPaymentMethod = null,
}) {
    const [hasPrinted, setHasPrinted] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const hasCalledClose = useRef(false);

    const totalAmount = Number(transaction?.total_amount || 0);
    const cashReceived = transaction?.cash_received ? Number(transaction.cash_received) : null;
    const changeAmount = Number(transaction?.change_amount || (cashReceived ? Math.max(0, cashReceived - totalAmount) : 0));
    const invoiceNumber = transaction?.invoice_number || 'INV-0000';
    const paymentMethod = transaction?.payment_method || 'CASH';

    // Auto-dismiss timer
    useEffect(() => {
        if (!transaction) return;

        const timer = setTimeout(() => {
            if (!hasCalledClose.current) {
                hasCalledClose.current = true;
                onClose?.();
            }
        }, autoDismissSeconds * 1000);

        return () => clearTimeout(timer);
    }, [transaction, onClose, autoDismissSeconds]);

    // Keyboard shortcuts: Space, Enter, or Escape to dismiss; P to print
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (!hasCalledClose.current) {
                    hasCalledClose.current = true;
                    onClose?.();
                }
            } else if (e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                handlePrintClick();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onPrint]);

    const handlePrintClick = () => {
        setHasPrinted(true);
        onPrint?.();
    };

    if (!transaction) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Lightweight Apple Scrim - Cockpit remains visible */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                        if (!hasCalledClose.current) {
                            hasCalledClose.current = true;
                            onClose?.();
                        }
                    }}
                    className="absolute inset-0 bg-slate-950/25 backdrop-blur-xs cursor-pointer"
                />

                {/* Floating Sheet Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                    className="relative w-full max-w-sm bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/70 overflow-hidden text-center select-none"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Quiet Status Glyph */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-2">
                        <Check className="w-5 h-5" strokeWidth={2.5} />
                    </div>

                    {/* Hero Figure: The Change Amount */}
                    <div className="my-5">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            {changeAmount > 0 ? 'Kembalian' : 'Pembayaran Selesai'}
                        </p>
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-tabular mt-1">
                            {changeAmount > 0 
                                ? `Rp ${changeAmount.toLocaleString('id-ID')}`
                                : `Rp ${totalAmount.toLocaleString('id-ID')}`
                            }
                        </h1>
                    </div>

                    {/* Hairline Metadata Strip - No Boxception */}
                    <div className="border-y border-slate-100 py-3.5 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-500">
                            <span>Total Tagihan</span>
                            <span className="font-semibold text-slate-900 font-tabular">
                                Rp {totalAmount.toLocaleString('id-ID')}
                            </span>
                        </div>

                        {cashReceived && changeAmount > 0 && (
                            <div className="flex justify-between text-slate-500">
                                <span>Tunai Diterima</span>
                                <span className="font-medium text-slate-700 font-tabular">
                                    Rp {cashReceived.toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between text-slate-400 text-[11px] font-mono pt-1">
                            <span>{invoiceNumber}</span>
                            <span className="uppercase">{paymentMethod}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2.5 mt-5">
                        <button
                            type="button"
                            onClick={handlePrintClick}
                            className="py-3 px-3.5 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all cursor-pointer active:scale-[0.98]"
                        >
                            <Printer className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
                            <span>{hasPrinted ? 'Cetak Ulang' : 'Cetak Struk'}</span>
                            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-white rounded border border-slate-200 text-slate-500 shadow-2xs">P</kbd>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (!hasCalledClose.current) {
                                    hasCalledClose.current = true;
                                    onClose?.();
                                }
                            }}
                            className="py-3 px-3.5 rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer active:scale-[0.98] shadow-2xs"
                        >
                            <span>Selesai</span>
                            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-slate-800 rounded text-slate-300">Space</kbd>
                        </button>
                    </div>

                    {/* In-Shift Quick Payment Method Switcher */}
                    {onSwitchPaymentMethod && ['CASH', 'QRIS'].includes(paymentMethod) && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs">
                            <span className="text-slate-400">Salah metode bayar?</span>
                            <button
                                type="button"
                                disabled={isSwitching}
                                onClick={async () => {
                                    hasCalledClose.current = true; // prevent auto-dismiss while switching
                                    setIsSwitching(true);
                                    const targetMethod = paymentMethod === 'CASH' ? 'QRIS' : 'CASH';
                                    await onSwitchPaymentMethod(transaction, targetMethod);
                                    setIsSwitching(false);
                                }}
                                className="font-bold text-sky-700 hover:text-sky-800 hover:underline cursor-pointer disabled:opacity-50"
                            >
                                {isSwitching ? 'Mengubah...' : `Tukar ke ${paymentMethod === 'CASH' ? 'QRIS' : 'Tunai'}`}
                            </button>
                        </div>
                    )}

                    {/* Quiet Turnover Hint */}
                    <p className="mt-3 text-[11px] text-slate-400 font-medium">
                        Scan barang berikutnya untuk langsung mulai
                    </p>

                    {/* Subtle Hairline Auto-Dismiss Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden">
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: autoDismissSeconds, ease: 'linear' }}
                            className="h-full bg-slate-300"
                        />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
