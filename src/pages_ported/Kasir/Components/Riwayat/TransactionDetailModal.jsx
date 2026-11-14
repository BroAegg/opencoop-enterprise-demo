import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, Printer, AlertTriangle, ShieldCheck, Banknote, ScanBarcode, Wallet, Split, ArrowLeftRight } from 'lucide-react';

export default function TransactionDetailModal({
    isOpen = false,
    onClose,
    transaction = null,
    onPrintReceipt,
    onOpenVoidModal,
    onSwitchPaymentMethod = null,
    activeShift = null,
    highlightQuery = '',
}) {
    const [isConfirmingSwitch, setIsConfirmingSwitch] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);

    if (!isOpen || !transaction) return null;

    const isVoid = transaction.status === 'VOID';
    const items = transaction.items || [];
    const payments = transaction.payments || [];
    const isShiftOpen = transaction.shift_log?.status === 'OPEN' || (activeShift && activeShift.id === transaction.shift_log_id);
    const canSwitch = !isVoid && ['CASH', 'QRIS'].includes(transaction.payment_method) && isShiftOpen;
    const q = highlightQuery?.trim()?.toLowerCase() || '';

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 15 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.95, opacity: 0, y: 15 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-base">Detail Transaksi</h3>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                    isVoid ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-800 border-slate-200'
                                }`}>
                                    {transaction.status}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-mono font-medium mt-0.5">{transaction.invoice_number}</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="w-9 h-9 rounded-xl hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer flex items-center justify-center"
                            title="Tutup (Esc)"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-5 overflow-y-auto custom-scrollbar space-y-4">
                        {/* Void Alert Banner */}
                        {isVoid && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                                    <span>Transaksi Dibatalkan (VOID)</span>
                                </div>
                                <p className="text-[11px]">
                                    Alasan: <span className="font-semibold">{transaction.void_reason || 'Tanpa alasan'}</span>
                                </p>
                                <p className="text-[10px] text-rose-600 font-medium">
                                    Disetujui oleh: {transaction.supervisor?.name || 'Supervisor'} • {new Date(transaction.voided_at).toLocaleString('id-ID')}
                                </p>
                            </div>
                        )}

                        {/* Customer & Cashier Info */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                            <div>
                                <span className="text-slate-400 block text-[10px] font-semibold">Kasir:</span>
                                <span className="font-bold text-slate-800">{transaction.cashier?.name || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px] font-semibold">Pembeli / Member:</span>
                                <span className="font-bold text-slate-800">{transaction.member?.name || 'Pelanggan Umum'}</span>
                            </div>
                        </div>

                        {/* Items List */}
                        <div>
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Item Belanja</h4>
                            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                                {items.map((item, idx) => {
                                    const isMatch = q && item.product_name?.toLowerCase().includes(q);
                                    return (
                                        <div 
                                            key={idx} 
                                            className={`p-3 flex items-center justify-between text-xs transition-colors ${
                                                isMatch ? 'bg-amber-50/80 border-l-4 border-amber-500' : ''
                                            }`}
                                        >
                                            <div className="min-w-0 pr-2">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`block truncate ${isMatch ? 'font-black text-amber-950' : 'font-bold text-slate-800'}`}>
                                                        {item.product_name}
                                                    </span>
                                                    {isMatch && (
                                                        <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded shrink-0">
                                                            Cocok
                                                        </span>
                                                    )}
                                                </div>
                                                {item.selected_modifiers && Array.isArray(item.selected_modifiers) && item.selected_modifiers.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                                        {item.selected_modifiers.map((m, mIdx) => (
                                                            <span key={mIdx} className="inline-flex items-center text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                                {m.name} {Number(m.price) > 0 && `(+Rp ${Number(m.price).toLocaleString('id-ID')})`}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <span className="text-slate-400 text-[11px] font-tabular">
                                                    {item.qty} × Rp {Number(item.unit_price).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <span className={`font-tabular shrink-0 ${isMatch ? 'font-black text-amber-950' : 'font-bold text-slate-800'}`}>
                                                Rp {Number(item.subtotal).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Payments Breakdown */}
                        <div>
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rincian Pembayaran</h4>
                            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                                {payments.length > 0 ? (
                                    payments.map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                                {p.payment_method === 'CASH' && <Banknote className="w-4 h-4 text-slate-400" strokeWidth={1.75} />}
                                                {p.payment_method === 'QRIS' && <ScanBarcode className="w-4 h-4 text-slate-400" strokeWidth={1.75} />}
                                                {p.payment_method === 'SALDO' && <Wallet className="w-4 h-4 text-slate-400" strokeWidth={1.75} />}
                                                <span>{p.payment_method}</span>
                                            </div>
                                            <span className="font-bold font-tabular text-slate-900">
                                                Rp {Number(p.amount).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-700">{transaction.payment_method}</span>
                                        <span className="font-bold font-tabular text-slate-900">
                                            Rp {Number(transaction.total_amount).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}

                                {Number(transaction.rounding_amount || 0) !== 0 && (
                                    <div className="flex items-center justify-between text-amber-700 pt-1 border-t border-slate-200">
                                        <span>Pembulatan:</span>
                                        <span className="font-bold font-tabular">
                                            {Number(transaction.rounding_amount).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                                    <span>Total Akhir:</span>
                                    <span className="font-tabular">
                                        Rp {Number(transaction.total_amount).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Switch Payment Method Confirmation Prompt */}
                    {isConfirmingSwitch && (
                        <div className="mx-5 mb-2 p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 space-y-2.5">
                            <div className="flex items-center gap-2 font-bold text-sky-950">
                                <ArrowLeftRight className="w-4 h-4 text-sky-600" />
                                <span>Tukar Metode Pembayaran</span>
                            </div>
                            <p className="text-[11px] text-sky-800 leading-relaxed">
                                Ubah transaksi <strong>{transaction.invoice_number}</strong> dari{' '}
                                <span className="font-bold underline">{transaction.payment_method === 'CASH' ? 'Tunai (CASH)' : 'QRIS'}</span>{' '}
                                menjadi{' '}
                                <span className="font-bold text-sky-950">{transaction.payment_method === 'CASH' ? 'QRIS' : 'Tunai (CASH)'}</span>?
                                Kas laci fisik dan mutasi akan disesuaikan otomatis tanpa mengubah inventaris.
                            </p>
                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    disabled={isSwitching}
                                    onClick={() => setIsConfirmingSwitch(false)}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    disabled={isSwitching}
                                    onClick={async () => {
                                        setIsSwitching(true);
                                        const target = transaction.payment_method === 'CASH' ? 'QRIS' : 'CASH';
                                        await onSwitchPaymentMethod?.(transaction, target);
                                        setIsSwitching(false);
                                        setIsConfirmingSwitch(false);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                                >
                                    {isSwitching ? 'Memproses...' : `Ya, Tukar ke ${transaction.payment_method === 'CASH' ? 'QRIS' : 'Tunai'}`}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-2.5 bg-slate-50/50 shrink-0 flex-wrap">
                        <div className="flex items-center gap-2">
                            {!isVoid && onOpenVoidModal && (
                                <button
                                    type="button"
                                    onClick={() => { onClose(); onOpenVoidModal(transaction); }}
                                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-700 text-xs font-bold transition-colors cursor-pointer active:scale-98"
                                >
                                    VOID
                                </button>
                            )}

                            {canSwitch && onSwitchPaymentMethod && !isConfirmingSwitch && (
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmingSwitch(true)}
                                    className="px-3.5 py-2.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-98 shadow-2xs"
                                    title="Koreksi metode pembayaran transaksi shift aktif"
                                >
                                    <ArrowLeftRight className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Tukar ke {transaction.payment_method === 'CASH' ? 'QRIS' : 'Tunai'}</span>
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => onPrintReceipt(transaction.id)}
                            className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak Struk</span>
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

