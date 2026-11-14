import React from 'react';
import { Wallet, CheckCircle2, Building2, Banknote, ShieldCheck, Camera } from 'lucide-react';

export default function PosVendorDailyFreshSummaryCard({
    activeAction = 'FULL',
    totalHakMitra = 0,
    totalIncomingPcs = 0,
    totalIncomingCost = 0,
    availableCash = 0,
    remainingDrawerCash = 0,
    paymentMethod = 'CASH',
    onPaymentMethodChange,
    isSettlingCash = true,
    onToggleSettlingCash,
    isFixedMargin = false,
    marginRate = 20,
    totalOmzet = 0,
    totalMarginKoperasi = 0,
    isSubmitting = false,
    onExecute,
    onOpenReceiptCapture,
    formatRp,
    vendorName = '',
    isBatchSettled = false,
    settlementNumber = null,
}) {
    const isCashPayout = paymentMethod === 'CASH';
    const isSettling = activeAction !== 'DROP_ONLY' && isSettlingCash;
    const isDrawerShort = isSettling && isCashPayout && totalHakMitra > 0 && remainingDrawerCash < 0;
    const isFixed = Boolean(isFixedMargin);

    return (
        <div className="pt-3 border-t border-slate-200 shrink-0 space-y-3 font-sans">
            {/* 1. Transparan 20% / 80% Breakdown Card for Sari Roti & Fixed Margin Vendors */}
            {isFixed && totalHakMitra > 0 && isSettling && (
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200/60">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-slate-800" />
                            <span className="text-xs font-bold text-slate-900">
                                Skema Bagi Hasil {vendorName} (Margin Tetap {marginRate}%)
                            </span>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-slate-200 text-slate-800 uppercase tracking-wider">
                            PKS Resmi
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-center">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <span className="text-[10px] text-slate-500 block font-medium">Total Omzet Penjualan</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                                {formatRp(totalOmzet)}
                            </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <span className="text-[10px] text-slate-500 block font-medium">Laba Toko ({marginRate}%)</span>
                            <span className="text-xs sm:text-sm font-bold text-emerald-600 font-mono">
                                {formatRp(totalMarginKoperasi)}
                            </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <span className="text-[10px] text-slate-500 block font-medium">Hak Setor Mitra ({100 - marginRate}%)</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                                {formatRp(totalHakMitra)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Payment Method Selector & Drawer Status */}
            {isSettling && totalHakMitra > 0 && !isBatchSettled && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-600 font-medium">Metode Pelunasan:</span>
                        <div className="flex items-center p-0.5 bg-slate-200/70 rounded-xl">
                            <button
                                type="button"
                                onClick={() => onPaymentMethodChange?.('CASH')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isCashPayout
                                        ? 'bg-white text-slate-900 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Banknote className="w-3.5 h-3.5" />
                                <span>Kas Laci Kasir</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onPaymentMethodChange?.('BANK_TRANSFER')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    !isCashPayout
                                        ? 'bg-white text-slate-900 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Building2 className="w-3.5 h-3.5" />
                                <span>Transfer Bank / Kantor</span>
                            </button>
                        </div>
                    </div>

                    {isCashPayout ? (
                        <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-[11px]">
                            <div className="flex items-center gap-1 text-slate-500">
                                <Wallet className="w-3.5 h-3.5" />
                                <span>Kas Laci: <strong className="text-slate-800">{formatRp(availableCash)}</strong></span>
                            </div>
                            <span className={isDrawerShort ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                                Sisa: {formatRp(remainingDrawerCash)}
                            </span>
                        </div>
                    ) : (
                        <span className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md font-medium text-center sm:text-right">
                            Dicatat transfer bank · Kas laci tetap aman
                        </span>
                    )}
                </div>
            )}

            {/* 3. Execute Action Button */}
            <div className="flex items-center gap-2">
                {activeAction === 'DROP_ONLY' ? (
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        {/* Button 1: Simpan Drop Cepat (Tanpa Nota) */}
                        <button
                            type="button"
                            disabled={isSubmitting || totalIncomingPcs <= 0}
                            onClick={onExecute}
                            className="flex-1 py-3 px-3 sm:px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Simpan drop barang langsung tanpa foto nota"
                        >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="truncate">Simpan Drop Cepat</span>
                        </button>

                        {/* Button 2: Foto & Upload Nota */}
                        <button
                            type="button"
                            disabled={isSubmitting || totalIncomingPcs <= 0}
                            onClick={onOpenReceiptCapture}
                            className="flex-[1.3] py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Foto nota fisik pengiriman drop mitra"
                        >
                            <Camera className="w-4 h-4 text-teal-400" />
                            <span className="truncate">
                                {totalIncomingPcs > 0
                                    ? `Foto & Upload Nota (${totalIncomingPcs} pcs · ${formatRp(totalIncomingCost)})`
                                    : 'Foto & Upload Nota'}
                            </span>
                        </button>
                    </div>
                ) : isBatchSettled ? (
                    <button
                        type="button"
                        disabled
                        className="flex-1 py-3 px-4 rounded-xl bg-slate-100 text-slate-500 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200/80 shadow-2xs"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>
                            Titipan Sudah Lunas Dicairkan {settlementNumber ? `(#${settlementNumber})` : ''}
                        </span>
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={isSubmitting || isDrawerShort || totalHakMitra <= 0}
                        onClick={onExecute}
                        className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>
                            {totalHakMitra > 0
                                ? `Cairkan Hak Mitra ${formatRp(totalHakMitra)} (${isCashPayout ? 'Kas Laci' : 'Transfer Bank'}) & Tarik Retur`
                                : 'Tidak Ada Tagihan yang Perlu Dicairkan'}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
