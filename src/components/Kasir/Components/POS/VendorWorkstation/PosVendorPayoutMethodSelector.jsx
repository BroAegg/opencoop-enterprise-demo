import React from 'react';
import { Wallet, Building2, AlertCircle } from 'lucide-react';

/**
 * PosVendorPayoutMethodSelector
 * 
 * Handles payment method toggle (Drawer Cash vs Bank Transfer),
 * vendor bank destination display, transfer reference input,
 * and drawer cash sufficiency validation.
 */
export default function PosVendorPayoutMethodSelector({
    selectedVendor,
    payoutMethod = 'CASH',
    onPayoutMethodChange,
    bankReference = '',
    onBankReferenceChange,
    availableCash = 0,
    effectivePayoutAmount = 0,
    formatRp,
}) {
    const remainingDrawerCash = availableCash - (payoutMethod === 'CASH' ? effectivePayoutAmount : 0);
    const isCashInsufficient = payoutMethod === 'CASH' && effectivePayoutAmount > 0 && remainingDrawerCash < 0;

    return (
        <div className="pt-3.5 border-t border-slate-100 space-y-3 font-sans">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-slate-600" />
                    Metode Pengeluaran Kasir:
                </span>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {['CASH', 'BANK_TRANSFER'].map((method) => (
                        <button
                            key={method}
                            type="button"
                            onClick={() => onPayoutMethodChange(method)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                payoutMethod === method
                                    ? 'bg-slate-900 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {method === 'CASH' ? 'Kas Laci Tunai' : 'Transfer Bank'}
                        </button>
                    ))}
                </div>
            </div>

            {payoutMethod === 'BANK_TRANSFER' && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Rekening Tujuan Mitra:</span>
                    </div>
                    <div className="pl-5">
                        <p className="font-mono font-bold text-slate-900 text-sm">
                            {selectedVendor?.bank_name || 'Bank Belum Terdaftar'} · {selectedVendor?.bank_account_number || '-'}
                        </p>
                        {selectedVendor?.bank_account_holder && (
                            <p className="text-slate-600 text-xs mt-0.5">
                                a.n. <strong>{selectedVendor.bank_account_holder}</strong>
                            </p>
                        )}
                    </div>
                    <input
                        type="text"
                        value={bankReference}
                        onChange={(e) => onBankReferenceChange(e.target.value)}
                        placeholder="No. Referensi Transfer / Bukti Mutasi (Opsional)"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-slate-900 font-mono"
                    />
                </div>
            )}

            {payoutMethod === 'CASH' && (
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 px-1">
                    <span>Kas Laci Tersedia: <strong className="text-slate-900 font-mono font-bold">{formatRp(availableCash)}</strong></span>
                    <span>Sisa Setelah Bayar: <strong className={`font-mono font-bold ${isCashInsufficient ? 'text-red-600' : 'text-slate-900'}`}>{formatRp(remainingDrawerCash)}</strong></span>
                </div>
            )}

            {isCashInsufficient && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-600 text-white text-xs font-semibold shadow-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Uang fisik di laci kasir ({formatRp(availableCash)}) tidak mencukupi untuk pembayaran tunai {formatRp(effectivePayoutAmount)}. Silakan gunakan Transfer Bank.</span>
                </div>
            )}
        </div>
    );
}
