import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, ScanBarcode, Banknote, AlertTriangle, Printer, Loader2 } from 'lucide-react';

/**
 * PosHeldOrderBatchConfirmModal: Reassurance & confirmation sheet for Batch Parkir Settlement.
 * Features Apple HIG calm alert card, breakdown summary, cash discrepancy warning, and thermal printer toggle.
 */
export default function PosHeldOrderBatchConfirmModal({
    isOpen = false,
    onClose,
    selectedSummary = { count: 0, grandTotal: 0, cashTotal: 0, qrisTotal: 0, cashCount: 0, qrisCount: 0 },
    shouldPrintSummary = true,
    setShouldPrintSummary,
    isExecutingBatch = false,
    onConfirm,
}) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-60 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 p-6 flex flex-col gap-5"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <CheckCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-slate-900 text-lg leading-tight">
                                Konfirmasi ACC Massal
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Selesaikan {selectedSummary.count} transaksi parkir sekaligus
                            </p>
                        </div>
                    </div>

                    {/* Breakdown Box */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col gap-2.5 text-xs">
                        <div className="flex justify-between items-center text-slate-600">
                            <span className="flex items-center gap-1.5">
                                <ScanBarcode className="w-4 h-4 text-sky-600" />
                                <span>Porsi QRIS ({selectedSummary.qrisCount} order):</span>
                            </span>
                            <span className="font-bold text-slate-900 font-tabular">
                                Rp {selectedSummary.qrisTotal.toLocaleString('id-ID')}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-slate-600">
                            <span className="flex items-center gap-1.5">
                                <Banknote className="w-4 h-4 text-emerald-600" />
                                <span>Porsi Tunai ({selectedSummary.cashCount} order):</span>
                            </span>
                            <span className="font-bold text-slate-900 font-tabular">
                                Rp {selectedSummary.cashTotal.toLocaleString('id-ID')}
                            </span>
                        </div>

                        <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-bold text-sm">
                            <span className="text-slate-900">Total Nominal:</span>
                            <span className="text-emerald-700 font-extrabold font-tabular text-base">
                                Rp {selectedSummary.grandTotal.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    {/* Financial Warning for Cash */}
                    {selectedSummary.cashCount > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-amber-900 text-xs">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                <strong>Perhatian Kasir:</strong> Pastikan fisik uang tunai sebesar <strong>Rp {selectedSummary.cashTotal.toLocaleString('id-ID')}</strong> sudah Anda terima di laci kasir agar tidak terjadi selisih saat tutup shift.
                            </p>
                        </div>
                    )}

                    {/* Print Summary Toggle */}
                    <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 cursor-pointer transition-colors select-none">
                        <input
                            type="checkbox"
                            checked={shouldPrintSummary}
                            onChange={(e) => setShouldPrintSummary?.(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <Printer className="w-4 h-4 text-slate-500" />
                            <span>Cetak 1 lembar rekap batch ke printer thermal</span>
                        </div>
                    </label>

                    {/* Action Buttons */}
                    <div className="flex gap-2.5 pt-1">
                        <button
                            type="button"
                            disabled={isExecutingBatch}
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            disabled={isExecutingBatch}
                            onClick={onConfirm}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 active:scale-95"
                        >
                            {isExecutingBatch ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCheck className="w-4 h-4" />
                                    <span>Konfirmasi & Selesaikan</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

