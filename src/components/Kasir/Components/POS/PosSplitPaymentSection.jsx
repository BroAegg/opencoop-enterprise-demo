import React from 'react';
import { Banknote, ScanBarcode, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import FormCurrencyInput from '@/Components/UI/FormCurrencyInput';

export default function PosSplitPaymentSection({
    totalAmount = 0,
    cashPortion = 0,
    setCashPortion,
    cashReceived = 0,
    setCashReceived,
    nonCashMethod = 'QRIS',
    setNonCashMethod,
    selectedMember = null,
    isOnline = true,
}) {
    const numericCashPortion = Number(cashPortion) || 0;
    const remainingDue = Math.max(0, totalAmount - numericCashPortion);
    const cashChange = Math.max(0, (Number(cashReceived) || 0) - numericCashPortion);

    const handleCashPortionChange = (raw) => {
        const val = parseInt((raw || '').toString().replace(/\D/g, ''), 10) || 0;
        // Cannot exceed totalAmount
        const capped = Math.min(val, totalAmount);
        setCashPortion(capped);
        // Automatically default cashReceived if it was less than portion
        if (cashReceived < capped) {
            setCashReceived(capped);
        }
    };

    const handleCashReceivedChange = (raw) => {
        const val = parseInt((raw || '').toString().replace(/\D/g, ''), 10) || 0;
        setCashReceived(val);
    };

    return (
        <div className="space-y-4">
            {/* Tender 1: Cash Portion */}
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center font-mono">
                            1
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
                            <Banknote className="w-4 h-4 text-slate-500" />
                            Porsi Tunai (Cash)
                        </span>
                    </div>
                    <span className="text-xs font-black text-slate-900 font-tabular">
                        Rp {numericCashPortion.toLocaleString('id-ID')}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <FormCurrencyInput
                            label="Nominal Tunai"
                            labelClassName="block text-[10px] font-bold text-slate-500 uppercase mb-1"
                            value={numericCashPortion}
                            onChange={(e) => handleCashPortionChange(e.target.value)}
                            placeholder="0"
                            inputClassName="bg-white border-slate-200 rounded-xl text-xs sm:text-sm font-bold font-tabular text-slate-900 py-2 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                        />
                    </div>

                    <div>
                        <FormCurrencyInput
                            label="Fisik Diterima"
                            labelClassName="block text-[10px] font-bold text-slate-500 uppercase mb-1"
                            value={cashReceived}
                            onChange={(e) => handleCashReceivedChange(e.target.value)}
                            placeholder="0"
                            inputClassName="bg-white border-slate-200 rounded-xl text-xs sm:text-sm font-bold font-tabular text-slate-900 py-2 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                        />
                    </div>
                </div>

                {/* Cash Change Indicator */}
                {numericCashPortion > 0 && (
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/60 font-medium">
                        <span className="text-slate-500">Kembalian Tunai:</span>
                        <span className={`font-bold font-tabular ${Number(cashReceived) < numericCashPortion ? 'text-rose-600' : 'text-slate-900'}`}>
                            Rp {cashChange.toLocaleString('id-ID')}
                        </span>
                    </div>
                )}
            </div>

            {/* Tender 2: Non-Cash Remainder */}
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center font-mono">
                            2
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-slate-800">
                            Sisa Non-Tunai
                        </span>
                    </div>
                    <span className="text-xs font-black text-slate-900 font-tabular">
                        Rp {remainingDue.toLocaleString('id-ID')}
                    </span>
                </div>

                {/* Toggle Non-Cash Method */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setNonCashMethod('QRIS')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            nonCashMethod === 'QRIS'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                        <ScanBarcode className="w-4 h-4" />
                        <span>QRIS Dinamis</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setNonCashMethod('SALDO')}
                        disabled={!selectedMember || !isOnline}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            nonCashMethod === 'SALDO'
                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs cursor-pointer'
                                : !isOnline || !selectedMember
                                ? 'bg-slate-50/70 text-slate-400 border-slate-200/80 cursor-not-allowed'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer'
                        }`}
                        title={!isOnline ? 'Perlu koneksi server untuk transaksi Saldo' : (!selectedMember ? 'Pilih member (F3) untuk menggunakan saldo' : '')}
                    >
                        <Wallet className="w-3.5 h-3.5 opacity-80" />
                        <span>Saldo Anggota</span>
                        {selectedMember?.saldo_sukarela !== undefined ? (
                            <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md font-tabular border ${
                                nonCashMethod === 'SALDO'
                                    ? 'bg-white/20 text-white border-white/20'
                                    : 'bg-slate-100 text-slate-800 border-slate-200/80'
                            }`}>
                                Rp {Number(selectedMember.saldo_sukarela).toLocaleString('id-ID')}
                            </span>
                        ) : !isOnline ? (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-slate-200/70 text-slate-500">
                                Perlu Server
                            </span>
                        ) : !selectedMember ? (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-slate-200/70 text-slate-500">
                                Butuh F3
                            </span>
                        ) : null}
                    </button>
                </div>

                {!isOnline ? (
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Pembayaran saldo memerlukan koneksi server pusat.</span>
                    </p>
                ) : nonCashMethod === 'SALDO' && !selectedMember ? (
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Anggota belum teridentifikasi (Tekan F3).</span>
                    </p>
                ) : null}
            </div>

            {/* Split Allocation Summary Bar */}
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-slate-600" />
                    <span>Total Teralokasi:</span>
                </div>
                <span className="font-black text-slate-900 font-tabular">
                    Rp {(numericCashPortion + remainingDue).toLocaleString('id-ID')} / Rp {totalAmount.toLocaleString('id-ID')}
                </span>
            </div>
        </div>
    );
}
