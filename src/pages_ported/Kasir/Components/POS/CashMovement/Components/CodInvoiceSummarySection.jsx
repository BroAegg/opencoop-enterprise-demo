import React from 'react';
import {
    Sparkles,
    AlertCircle,
    FileText,
} from 'lucide-react';
import FormCurrencyInput from '@/Components/UI/FormCurrencyInput';
import FormInput from '@/Components/UI/FormInput';

/**
 * CodInvoiceSummarySection
 * 
 * Equation calculation banner, cash drawer payment input,
 * invoice number, and notes for the COD settlement.
 */
export default function CodInvoiceSummarySection({
    codItems = [],
    returnItems = [],
    isPureSwapCondition = false,
    totalIncomingCost = 0,
    totalReturnCost = 0,
    netPayable = 0,
    amount = '',
    onAmountChange,
    availableCash = 0,
    isOverDrawerLimit = false,
    invoiceNumber = '',
    onInvoiceNumberChange,
    description = '',
    onDescriptionChange,
}) {
    return (
        <div className="space-y-4">
            {/* Net Invoice Equation Banner */}
            {(codItems.length > 0 || returnItems.length > 0) && (
                <div className="p-3 rounded-2xl bg-slate-900 text-white space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">Kalkulasi Tagihan Faktur Sales:</span>
                        {isPureSwapCondition && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Tukar Guling Seimbang (Net Rp 0)
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center font-tabular">
                        <div className="p-1.5 rounded-xl bg-slate-800/60">
                            <span className="text-[10px] text-slate-400 block">Barang Masuk (+)</span>
                            <span className="font-mono font-bold text-xs sm:text-sm text-emerald-400">
                                Rp {totalIncomingCost.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-slate-800/60">
                            <span className="text-[10px] text-slate-400 block">Potongan Retur (-)</span>
                            <span className="font-mono font-bold text-xs sm:text-sm text-rose-400">
                                -Rp {totalReturnCost.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="p-1.5 rounded-xl bg-slate-800/90 border border-slate-700">
                            <span className="text-[10px] text-slate-300 font-semibold block">Tagihan Bersih (Net)</span>
                            <span className="font-mono font-bold text-xs sm:text-sm text-white">
                                Rp {netPayable.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Total Bayar Faktur (Standard FormCurrencyInput) */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Total Bayar Faktur (Kas Laci) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-slate-500 font-tabular">
                        Kas Laci: <strong className="text-slate-800">Rp {Number(availableCash || 0).toLocaleString('id-ID')}</strong>
                    </span>
                </div>

                <FormCurrencyInput
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder="0"
                    inputClassName={`bg-slate-50 border rounded-2xl pr-4 py-3 font-bold font-tabular text-lg text-slate-900 focus:bg-white focus:ring-2 focus:border-slate-800 transition-all outline-none ${
                        isOverDrawerLimit
                            ? 'border-rose-300 ring-2 ring-rose-500/10 bg-rose-50/30'
                            : 'border-slate-200 focus:ring-slate-900/10'
                    }`}
                />

                {isPureSwapCondition && (
                    <p className="text-[11px] text-emerald-700 font-medium mt-1">
                        ✓ Tukar guling 1-to-1 seimbang: tidak ada uang kas laci yang dikeluarkan (Rp 0).
                    </p>
                )}

                {isOverDrawerLimit && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Nominal melebihi saldo kas laci (tersedia Rp {Number(availableCash || 0).toLocaleString('id-ID')}).</span>
                    </div>
                )}
            </div>

            {/* Nomor Faktur & Catatan Rincian (Using standard FormInput) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput
                    label="No. Faktur / Surat Jalan"
                    labelClassName="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    icon={FileText}
                    value={invoiceNumber}
                    onChange={(e) => onInvoiceNumberChange(e.target.value)}
                    placeholder="Contoh: FAK-29/9"
                    inputClassName="font-mono bg-slate-50 border-slate-200 rounded-2xl py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all outline-none"
                    required
                />

                <FormInput
                    label="Catatan Tambahan (Opsional)"
                    labelClassName="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Contoh: Pembayaran tunai lunas"
                    inputClassName="bg-slate-50 border-slate-200 rounded-2xl py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all outline-none"
                />
            </div>
        </div>
    );
}

