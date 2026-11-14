import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Banknote, Building2, CheckCircle2, AlertTriangle, Split, Zap } from 'lucide-react';
import SegmentedControl from '@/Components/UI/SegmentedControl';
import PosVendorBankTransferCard from './PosVendorBankTransferCard';
import PosVendorSplitPaymentCard from './PosVendorSplitPaymentCard';

/**
 * PosVendorPaymentSheet
 * 
 * Step 2 of Evening Retur Ritual: Apple Pay-style payment sheet.
 * Isolates payment method decisions and bank details from the physical count workspace.
 * Supports Cash Drawer, Bank Transfer, and Drawer-Aware Split Settlement.
 */
export default function PosVendorPaymentSheet({
    selectedVendor,
    activeBatch,
    payoutMethod = 'CASH',
    setPayoutMethod,
    splitCashAmount = 0,
    setSplitCashAmount,
    splitTransferAmount = 0,
    isPayingViaSplit = false,
    bankReference = '',
    setBankReference,
    isPayingViaTransfer = false,
    returCalculations = { items: [], totalSold: 0, totalReturned: 0, totalPayable: 0 },
    discrepancyMode = 'STORE_ABSORB',
    setDiscrepancyMode,
    includePastBalance = true,
    availableCash = 0,
    isExceedingDrawer = false,
    isSubmitting = false,
    returnShelfStock = true,
    submitReturSore,
    onBack,
    formatRp,
}) {
    // Handle Enter to submit, Escape to go back, 1/2/3 for quick payment method
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
            if (e.key === 'Escape' && !isSubmitting) {
                e.preventDefault();
                e.stopPropagation();
                onBack?.();
            } else if (!isTyping && e.key === '1') {
                e.preventDefault();
                setPayoutMethod('CASH');
            } else if (!isTyping && e.key === '2') {
                e.preventDefault();
                setPayoutMethod('BANK_TRANSFER');
            } else if (!isTyping && e.key === '3') {
                e.preventDefault();
                setPayoutMethod('SPLIT');
            } else if (e.key === 'Enter' && !isSubmitting) {
                if (payoutMethod === 'CASH' && isExceedingDrawer) return;
                if (payoutMethod === 'SPLIT' && Number(splitCashAmount || 0) > availableCash) return;
                if (returCalculations.totalPayable > 0) {
                    e.preventDefault();
                    submitReturSore?.();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSubmitting, payoutMethod, setPayoutMethod, isExceedingDrawer, splitCashAmount, availableCash, returCalculations.totalPayable, onBack, submitReturSore]);

    const isSplitInvalid = isPayingViaSplit && Number(splitCashAmount || 0) > availableCash;
    const isExecutionDisabled = isSubmitting ||
        returCalculations.totalPayable <= 0 ||
        (payoutMethod === 'CASH' && isExceedingDrawer) ||
        isSplitInvalid;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex-1 flex flex-col justify-between min-h-0"
        >
            {/* Top Navigation Bar: Back to Physical Counting */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 shrink-0">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{returnShelfStock ? 'Kembali ke Hitungan Nampan' : 'Kembali ke Rincian Stok'}</span>
                </button>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {returnShelfStock ? 'Langkah 2: Pembayaran' : 'Langkah 2: Pencairan'}
                </span>
            </div>

            {/* Scrollable Center: Hero Amount & Payment Method Selection */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4 min-h-0">
                {/* Hero Total Payable Card */}
                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/90 rounded-2xl text-center space-y-1">
                    <span className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                        Total Hak Bersih Mitra
                    </span>
                    <strong className="text-3xl sm:text-4xl font-black font-mono text-slate-950 tracking-tight block">
                        {formatRp(returCalculations.totalPayable)}
                    </strong>
                    <p className="text-xs text-slate-600 font-medium">
                        {returCalculations.totalSold} pcs terjual {returnShelfStock ? (returCalculations.totalReturned > 0 ? `· ${returCalculations.totalReturned} pcs retur fisik` : '') : '· sisa stok tetap di toko'}
                        {returCalculations.hasPastUnsettled && includePastBalance && (
                            <span className="text-slate-800 font-semibold"> (Termasuk saldo belum cair +{formatRp(returCalculations.pastUnsettledBalance)})</span>
                        )}
                    </p>
                </div>

                {/* Discrepancy Resolution (Quiet Apple HIG Style - Only if there is a discrepancy) */}
                {returCalculations.hasDiscrepancy && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">
                                Rekonsiliasi Selisih Fisik
                            </span>
                            <span className="font-mono text-slate-500 text-[11px]">
                                {returCalculations.totalShortagePcs > 0 && `Kurang ${returCalculations.totalShortagePcs} pcs (${formatRp(returCalculations.totalShortageValue)})`}
                                {returCalculations.totalSurplusPcs > 0 && `Lebih +${returCalculations.totalSurplusPcs} pcs`}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setDiscrepancyMode?.('STORE_ABSORB')}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                    discrepancyMode === 'STORE_ABSORB'
                                        ? 'bg-white border-slate-900 shadow-2xs'
                                        : 'bg-transparent border-slate-200 hover:bg-slate-100/60'
                                }`}
                            >
                                <strong className="text-xs font-bold text-slate-900 block">
                                    Tanggung Toko
                                </strong>
                                <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                                    Mitra dibayar utuh (beban susut)
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDiscrepancyMode?.('POS_RECORDED')}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                    discrepancyMode === 'POS_RECORDED'
                                        ? 'bg-white border-slate-900 shadow-2xs'
                                        : 'bg-transparent border-slate-200 hover:bg-slate-100/60'
                                }`}
                            >
                                <strong className="text-xs font-bold text-slate-900 block">
                                    Sesuai Scan POS
                                </strong>
                                <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                                    Bayar hanya transaksi kasir
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Apple Segmented Control */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                        Pilih Metode Pembayaran
                    </label>
                    <SegmentedControl
                        value={payoutMethod}
                        onChange={setPayoutMethod}
                        size="sm"
                        options={[
                            { id: 'CASH', label: 'Tunai Kas Laci [1]', icon: Banknote },
                            { id: 'BANK_TRANSFER', label: 'Transfer Bank [2]', icon: Building2 },
                            { id: 'SPLIT', label: 'Kombinasi Split [3]', icon: Split },
                        ]}
                    />
                </div>

                {/* Method Details */}
                {isPayingViaSplit ? (
                    <PosVendorSplitPaymentCard
                        totalPayable={returCalculations.totalPayable}
                        availableCash={availableCash}
                        splitCashAmount={splitCashAmount}
                        setSplitCashAmount={setSplitCashAmount}
                        splitTransferAmount={splitTransferAmount}
                        selectedVendor={selectedVendor}
                        bankReference={bankReference}
                        setBankReference={setBankReference}
                        formatRp={formatRp}
                    />
                ) : isPayingViaTransfer ? (
                    <PosVendorBankTransferCard
                        selectedVendor={selectedVendor}
                        bankReference={bankReference}
                        setBankReference={setBankReference}
                    />
                ) : (
                    <div className="space-y-2">
                        {isExceedingDrawer ? (
                            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-rose-950">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                        <span className="font-bold">Uang Fisik Kas Laci Kurang</span>
                                    </div>
                                    <span className="font-mono font-bold text-rose-900">
                                        Tersedia: {formatRp(availableCash)} (Kurang {formatRp(returCalculations.totalPayable - availableCash)})
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                                    {availableCash > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPayoutMethod('SPLIT');
                                                setSplitCashAmount?.(availableCash);
                                            }}
                                            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.99]"
                                        >
                                            <Zap className="w-3.5 h-3.5 text-white" />
                                            <span>Bayar Rp {formatRp(availableCash)} + Transfer Sisanya</span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setPayoutMethod('BANK_TRANSFER')}
                                        className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer text-center active:scale-[0.99]"
                                    >
                                        Alihkan Transfer Bank
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-900">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
                                    <span className="font-semibold">Kas Laci Mencukupi</span>
                                </div>
                                <span className="font-mono font-bold text-slate-900">
                                    Tersedia: {formatRp(availableCash)}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Primary Execution Button */}
            <div className="pt-3 border-t border-slate-200 space-y-2 shrink-0">
                <button
                    type="button"
                    onClick={submitReturSore}
                    disabled={isExecutionDisabled}
                    className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        !isExecutionDisabled
                            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {isSubmitting
                        ? 'Memproses Transaksi...'
                        : isPayingViaSplit
                        ? `Konfirmasi Bayar Kombinasi (${formatRp(returCalculations.totalPayable)})`
                        : isPayingViaTransfer
                        ? `Konfirmasi Bayar Transfer (${formatRp(returCalculations.totalPayable)})`
                        : returnShelfStock
                        ? `Bayar Kas Laci & Selesai (${formatRp(returCalculations.totalPayable)})`
                        : `Cairkan Kas Laci & Simpan Stok (${formatRp(returCalculations.totalPayable)})`}
                </button>
            </div>
        </motion.div>
    );
}

