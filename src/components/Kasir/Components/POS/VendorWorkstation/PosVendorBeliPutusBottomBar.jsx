import React from 'react';
import {
    Wallet, Building2, AlertCircle, ShieldCheck, CheckCircle2,
} from 'lucide-react';

/**
 * PosVendorBeliPutusBottomBar
 * 
 * Apple HIG docked action bar for Beli Putus COD:
 * - Payment method switcher (Cash Drawer vs Store Bank Transfer)
 * - Bank destination info (when Bank Transfer is active)
 * - Cash shortfall auto-suggestion & 1-click Enter action button
 */
export default function PosVendorBeliPutusBottomBar({
    payoutMethod,
    onPayoutMethodChange,
    selectedVendor,
    availableCash = 0,
    totalPcs = 0,
    totalCost = 0,
    isCashInsufficient = false,
    bankReference = '',
    onBankReferenceChange,
    isSubmitting = false,
    isSupervisor = false,
    onOpenConfirm,
    formatRp,
}) {
    return (
        <div className="pt-2.5 border-t border-slate-200 space-y-2.5 shrink-0 font-sans">
            {/* Payment Method Switcher */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-slate-600" />
                    Metode Pembayaran COD:
                </span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => onPayoutMethodChange('CASH')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            payoutMethod === 'CASH'
                                ? 'bg-slate-900 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Kas Laci Tunai
                    </button>
                    <button
                        type="button"
                        onClick={() => onPayoutMethodChange('BANK_TRANSFER')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            payoutMethod === 'BANK_TRANSFER'
                                ? 'bg-slate-900 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Transfer Bank Toko
                    </button>
                </div>
            </div>

            {/* Bank Info (when Transfer Bank Toko is selected) */}
            {payoutMethod === 'BANK_TRANSFER' && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-600 shrink-0" />
                        <div>
                            <p className="font-mono font-bold text-slate-900">
                                {selectedVendor?.bank_name || 'Bank'} · {selectedVendor?.bank_account_number || 'No. Rek Belum Terdaftar'}
                            </p>
                            {selectedVendor?.bank_account_holder && (
                                <p className="text-[11px] text-slate-500">a.n. {selectedVendor.bank_account_holder}</p>
                            )}
                        </div>
                    </div>
                    <input
                        type="text"
                        value={bankReference}
                        onChange={(e) => onBankReferenceChange(e.target.value)}
                        placeholder="No. Referensi / Bukti Transfer (Opsional)"
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono outline-none focus:border-slate-900 w-52"
                    />
                </div>
            )}

            {/* Insufficient Cash Drawer Warning & Auto-Switch Shortcut */}
            {isCashInsufficient && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-800">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Kas laci kurang ({formatRp(availableCash)}). Disarankan bayar via Transfer Bank.</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => onPayoutMethodChange('BANK_TRANSFER')}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shrink-0 cursor-pointer"
                    >
                        Beralih ke Transfer
                    </button>
                </div>
            )}

            {/* Main Action Button */}
            <button
                type="button"
                disabled={totalPcs <= 0 || isSubmitting || isCashInsufficient}
                onClick={onOpenConfirm}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {totalPcs > 0 && !isCashInsufficient && !isSupervisor ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>
                    {isSubmitting
                        ? 'Memproses Kas Keluar COD...'
                        : isCashInsufficient
                        ? `Saldo Laci Kurang (Tersisa ${formatRp(availableCash)})`
                        : totalPcs > 0
                        ? `Bayar COD & Terima ${totalPcs} Pcs (${formatRp(totalCost)})`
                        : 'Masukkan Jumlah Barang Masuk Terlebih Dahulu'}
                </span>
                {totalPcs > 0 && !isCashInsufficient && (
                    <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-mono font-bold bg-white/20 text-white rounded border border-white/20">
                        Enter ↵
                    </kbd>
                )}
            </button>
        </div>
    );
}
