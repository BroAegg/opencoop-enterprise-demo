import React, { useState } from 'react';
import { Wallet, ArrowDownRight, CheckCircle2, AlertCircle, Edit2, Check } from 'lucide-react';

/**
 * PosVendorBeliPutusDrawerLedger
 * 
 * Apple HIG-style quiet financial ledger component for COD restock.
 * Displays before/after cash drawer impact with crystal clarity:
 * Saldo Laci Saat Ini - Total Tagihan = Sisa Kas Laci Setelahnya.
 */
export default function PosVendorBeliPutusDrawerLedger({
    availableCash = 0,
    totalAmount = 0,
    totalPcs = 0,
    invoiceNumber = '',
    onInvoiceChange,
    formatRp,
}) {
    const [isEditingInvoice, setIsEditingInvoice] = useState(false);
    const [tempInvoice, setTempInvoice] = useState(invoiceNumber);

    const remainingCash = availableCash - totalAmount;
    const isDeficit = remainingCash < 0;

    const handleSaveInvoice = () => {
        onInvoiceChange?.(tempInvoice.trim() || invoiceNumber);
        setIsEditingInvoice(false);
    };

    return (
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-3 sm:p-4 space-y-2.5">
            {/* 3-Point Drawer Flow Equation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* 1. Saldo Awal */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                        Saldo Laci Kasir
                    </span>
                    <span className="font-mono font-bold text-slate-700 text-sm mt-0.5 block">
                        {formatRp(availableCash)}
                    </span>
                </div>

                {/* 2. Total Keluar COD */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/70">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                            Keluar COD ({totalPcs} pcs)
                        </span>
                        <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <span className={`font-mono font-bold text-sm mt-0.5 block ${totalAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {totalAmount > 0 ? `-${formatRp(totalAmount)}` : formatRp(0)}
                    </span>
                </div>

                {/* 3. Estimasi Sisa Laci */}
                <div className={`p-2.5 rounded-xl border ${
                    isDeficit
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
                            Sisa Laci Kasir
                        </span>
                        {isDeficit ? (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                        )}
                    </div>
                    <span className={`font-mono font-black text-sm mt-0.5 block ${isDeficit ? 'text-rose-700' : 'text-slate-900'}`}>
                        {formatRp(Math.max(0, remainingCash))}
                    </span>
                </div>
            </div>

            {/* Unobtrusive Invoice / Nota Metadata Strip */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-medium text-slate-400">Ref. Faktur:</span>
                    {isEditingInvoice ? (
                        <div className="flex items-center gap-1">
                            <input
                                type="text"
                                value={tempInvoice}
                                onChange={(e) => setTempInvoice(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveInvoice();
                                    if (e.key === 'Escape') setIsEditingInvoice(false);
                                }}
                                autoFocus
                                className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-[11px] font-mono text-slate-900 w-36 focus:outline-hidden focus:border-slate-900"
                            />
                            <button
                                type="button"
                                onClick={handleSaveInvoice}
                                className="p-1 text-slate-700 hover:bg-slate-100 rounded"
                            >
                                <Check className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setTempInvoice(invoiceNumber);
                                setIsEditingInvoice(true);
                            }}
                            className="font-mono font-semibold text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                            title="Klik untuk ubah nomor nota"
                        >
                            <span>{invoiceNumber || 'Otomatis'}</span>
                            <Edit2 className="w-2.5 h-2.5 text-slate-400 opacity-60" />
                        </button>
                    )}
                </div>

                <span className="text-[10px] text-slate-400">
                    Otomatis sinkron ke laporan shift kasir
                </span>
            </div>
        </div>
    );
}

