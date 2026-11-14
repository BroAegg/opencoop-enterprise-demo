import React from 'react';
import FormCurrencyInput from '@/Components/UI/FormCurrencyInput';

/**
 * PosVendorPeriodicCustomAmountInput
 * 
 * Clean, tactile partial payout input for Konsinyasi Berkala.
 * Replaces verbose accounting explanations with fast preset buttons and instant change preview.
 */
export default function PosVendorPeriodicCustomAmountInput({
    customAmount,
    onCustomAmountChange,
    unsettledBalance = 0,
    availableCash = 0,
    formatRp,
}) {
    const numericAmount = Math.max(0, Number(customAmount || 0));
    const remainingAfterPayout = Math.max(0, unsettledBalance - numericAmount);

    // Fast quick-presets
    const presets = [
        Math.round(unsettledBalance / 2),
        ...(availableCash > 0 && availableCash < unsettledBalance ? [availableCash] : []),
        100000,
        200000,
    ].filter((val, idx, arr) => val > 0 && val < unsettledBalance && arr.indexOf(val) === idx)
     .sort((a, b) => a - b);

    return (
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 font-sans">
            <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    Ketik Nominal yang Ingin Dicairkan:
                </label>
                <FormCurrencyInput
                    value={customAmount}
                    onChange={onCustomAmountChange}
                    placeholder="0"
                    max={unsettledBalance}
                    className="w-full text-base font-mono font-bold"
                />
            </div>

            {/* Quick Presets */}
            {presets.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Cepat:</span>
                    {presets.map((val) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => onCustomAmountChange(val)}
                            className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all cursor-pointer"
                        >
                            {formatRp(val)}
                        </button>
                    ))}
                </div>
            )}

            {/* Real-time remaining balance feedback */}
            {numericAmount > 0 && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Sisa belum cair tersimpan:</span>
                    <strong className="text-slate-800">{formatRp(remainingAfterPayout)}</strong>
                </div>
            )}
        </div>
    );
}
