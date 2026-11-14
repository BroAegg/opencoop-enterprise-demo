import React from 'react';
import { Banknote, Building2, Zap, AlertTriangle } from 'lucide-react';
import PosVendorBankTransferCard from './PosVendorBankTransferCard';

/**
 * PosVendorSplitPaymentCard
 * 
 * Apple HIG-compliant split settlement control panel.
 * Allows cashiers to seamlessly allocate available drawer cash
 * and settle the remainder via bank transfer with real-time feedback.
 */
export default function PosVendorSplitPaymentCard({
    totalPayable = 0,
    availableCash = 0,
    splitCashAmount = 0,
    setSplitCashAmount,
    splitTransferAmount = 0,
    selectedVendor,
    bankReference = '',
    setBankReference,
    formatRp,
}) {
    const isExceeding = Number(splitCashAmount || 0) > availableCash;
    const maxUsableCash = Math.min(availableCash, totalPayable);

    const handleCashChange = (e) => {
        const val = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
        setSplitCashAmount?.(Math.min(val, totalPayable));
    };

    return (
        <div className="space-y-3">
            {/* Split Amount Allocation Panel */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-slate-700" />
                        <span>Porsi Tunai Kas Laci</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                        Fisik Laci: <strong className="text-slate-700">{formatRp(availableCash)}</strong>
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                            Rp
                        </span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={splitCashAmount === 0 ? '' : Number(splitCashAmount).toLocaleString('id-ID')}
                            onChange={handleCashChange}
                            placeholder="0"
                            className={`w-full text-sm font-mono font-bold pl-9 pr-3 py-2 bg-white border rounded-xl focus:outline-hidden transition-colors ${
                                isExceeding
                                    ? 'border-rose-300 text-rose-700 focus:ring-2 focus:ring-rose-500'
                                    : 'border-slate-200/90 text-slate-900 focus:ring-2 focus:ring-slate-900'
                            }`}
                        />
                    </div>

                    {isExceeding && (
                        <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Melebihi kas fisik laci (maks {formatRp(availableCash)})</span>
                        </div>
                    )}

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {maxUsableCash > 0 && (
                            <button
                                type="button"
                                onClick={() => setSplitCashAmount?.(maxUsableCash)}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                                <Zap className="w-3 h-3 text-slate-700" />
                                <span>Maks Laci ({formatRp(maxUsableCash)})</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setSplitCashAmount?.(Math.round(totalPayable / 2))}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
                        >
                            50% ({formatRp(Math.round(totalPayable / 2))})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSplitCashAmount?.(0)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
                        >
                            Rp 0 (100% Transfer)
                        </button>
                    </div>
                </div>

                {/* Remainder to Bank Transfer Notice */}
                <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>Sisa via Transfer Bank</span>
                    </span>
                    <strong className="font-mono font-extrabold text-blue-800 text-sm">
                        {formatRp(splitTransferAmount)}
                    </strong>
                </div>
            </div>

            {/* Destination Bank Account Card */}
            {splitTransferAmount > 0 && (
                <PosVendorBankTransferCard
                    selectedVendor={selectedVendor}
                    bankReference={bankReference}
                    setBankReference={setBankReference}
                />
            )}
        </div>
    );
}
