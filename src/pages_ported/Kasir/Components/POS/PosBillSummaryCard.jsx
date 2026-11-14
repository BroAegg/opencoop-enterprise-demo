import React from 'react';

export default function PosBillSummaryCard({
    totalAmount = 0,
    pointsDiscountAmount = 0,
    pointsRedeemed = 0,
    roundingDiff = 0,
    finalPayableTotal = 0,
    paymentMethod = 'CASH',
    cashReceived = 0,
    changeAmount = 0,
    isCashInvolved = true,
}) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-2xs border border-slate-200/90 mt-auto space-y-2.5">
            <div className="flex justify-between items-baseline text-slate-600">
                <span className="text-xs font-medium">Subtotal Belanja</span>
                <span className="text-sm font-bold font-tabular text-slate-700">
                    Rp {totalAmount.toLocaleString('id-ID')}
                </span>
            </div>

            {pointsDiscountAmount > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/70">
                    <span className="font-medium">Potongan Poin ({pointsRedeemed} pt):</span>
                    <span className="font-bold font-tabular">
                        -Rp {pointsDiscountAmount.toLocaleString('id-ID')}
                    </span>
                </div>
            )}

            {/* Rounding info */}
            {isCashInvolved && roundingDiff !== 0 && (
                <div className="flex justify-between items-center text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/60">
                    <span className="font-medium">Pembulatan Tunai:</span>
                    <span className="font-bold font-tabular">
                        {roundingDiff > 0 ? `+Rp ${roundingDiff.toLocaleString('id-ID')}` : `-Rp ${Math.abs(roundingDiff).toLocaleString('id-ID')}`}
                    </span>
                </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800">Total Tagihan</span>
                <span className="text-xl font-black font-tabular text-slate-900">
                    Rp {finalPayableTotal.toLocaleString('id-ID')}
                </span>
            </div>

            {paymentMethod === 'CASH' && (
                <>
                    <div className="flex justify-between items-baseline text-slate-800 pt-1">
                        <span className="text-xs font-semibold">Tunai Diterima</span>
                        <span className="text-base font-bold font-tabular">
                            Rp {(Number(cashReceived) || 0).toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className="flex justify-between items-baseline border-t border-dashed border-slate-200 pt-2">
                        <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Kembalian</span>
                        <span className={`text-xl font-black font-tabular ${changeAmount < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                            Rp {changeAmount.toLocaleString('id-ID')}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}

