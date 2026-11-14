import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Banknote, ScanBarcode, Split, CheckCircle2, Briefcase, Store, PauseCircle, Wallet } from 'lucide-react';
import { toast } from '@/Components/UI/Toast';
import PosSplitPaymentSection from './PosSplitPaymentSection';
import PosCashTenderSection from './PosCashTenderSection';
import PosBillSummaryCard from './PosBillSummaryCard';
import PosLoyaltyRedeemSection from './PosLoyaltyRedeemSection';
import PosQrisPaymentView from './PosQrisPaymentView';
import Avatar from '@/Components/UI/Avatar';

export default function PosPaymentModal({
    isOpen = false,
    onClose,
    paymentMethod = 'CASH',
    setPaymentMethod,
    cashReceived = 0,
    setCashReceived,
    totalAmount = 0,
    quickCashOptions = [],
    handleCheckout,
    selectedMember = null,
    isOnline = true,
    isProcessing = false,
    loyaltyRewards = [],
    loyaltyConfig = null,
    onOpenInternalUse = null,
    onHoldOrder = null,
    qrisPayload = null,
}) {
    // Split Payment States
    const [cashPortion, setCashPortion] = useState(0);
    const [splitCashReceived, setSplitCashReceived] = useState(0);
    const [nonCashMethod, setNonCashMethod] = useState('QRIS');
    const [enableRounding, setEnableRounding] = useState(true);
    const [selectedRewardId, setSelectedRewardId] = useState(null);
    const [customRedeemPoints, setCustomRedeemPoints] = useState(0);

    // Feature toggle: Kasbon payment is temporarily disabled/hidden per policy
    const ENABLE_KASBON = false;

    const isEmployee = Boolean(selectedMember?.is_employee);

    // Reset reward selection when modal closes or member changes
    useEffect(() => {
        if (!isOpen) {
            setSelectedRewardId(null);
            setCustomRedeemPoints(0);
        }
    }, [isOpen, selectedMember?.id]);

    const { pointsRedeemed, pointsDiscountAmount } = useMemo(() => {
        if (!selectedMember || selectedMember.is_member_koperasi || loyaltyConfig?.enabled === false) {
            return { pointsRedeemed: 0, pointsDiscountAmount: 0 };
        }
        if (selectedRewardId) {
            const reward = loyaltyRewards.find((r) => r.id === selectedRewardId);
            if (reward && Number(selectedMember.points || 0) >= Number(reward.points_cost || 0)) {
                return {
                    pointsRedeemed: Number(reward.points_cost || 0),
                    pointsDiscountAmount: Math.min(totalAmount, Number(reward.discount_amount || 0)),
                };
            }
        }
        if (customRedeemPoints > 0 && Number(selectedMember.points || 0) >= customRedeemPoints) {
            const pointValue = Number(loyaltyConfig?.point_value_rupiah || 1);
            return {
                pointsRedeemed: customRedeemPoints,
                pointsDiscountAmount: Math.min(totalAmount, customRedeemPoints * pointValue),
            };
        }
        return { pointsRedeemed: 0, pointsDiscountAmount: 0 };
    }, [selectedMember, loyaltyConfig, selectedRewardId, loyaltyRewards, customRedeemPoints, totalAmount]);

    const netSubtotal = Math.max(0, totalAmount - pointsDiscountAmount);

    // Auto-fallback from SALDO to QRIS if going offline
    React.useEffect(() => {
        if (!isOnline && nonCashMethod === 'SALDO') {
            setNonCashMethod('QRIS');
        }
    }, [isOnline, nonCashMethod]);

    // Auto-fallback from KASBON to CASH if Kasbon is disabled
    React.useEffect(() => {
        if (!ENABLE_KASBON && paymentMethod === 'KASBON') {
            setPaymentMethod('CASH');
        }
    }, [ENABLE_KASBON, paymentMethod, setPaymentMethod]);

    // Calculate Rounding (Round to nearest Rp 500 for physical Rupiah cash denominations, e.g., 3x333=999 -> 1000)
    const isCashInvolved = paymentMethod === 'CASH' || paymentMethod === 'SPLIT';
    const roundingDiff = useMemo(() => {
        if (!enableRounding || !isCashInvolved) return 0;
        const remainder = netSubtotal % 500;
        if (remainder === 0) return 0;
        const rounded = Math.round(netSubtotal / 500) * 500;
        return rounded - netSubtotal;
    }, [enableRounding, isCashInvolved, netSubtotal]);

    const finalPayableTotal = Math.max(0, netSubtotal + roundingDiff);
    const changeAmount = (Number(cashReceived) || 0) - finalPayableTotal;

    const isCanSubmit = useMemo(() => {
        if (paymentMethod === 'CASH') {
            return (Number(cashReceived) || 0) >= finalPayableTotal;
        }
        if (paymentMethod === 'QRIS') {
            return true;
        }
        if (paymentMethod === 'SALDO') {
            if (!selectedMember || !isOnline) return false;
            const balance = Number(selectedMember.saldo_sukarela ?? 0);
            return balance >= finalPayableTotal;
        }
        if (ENABLE_KASBON && paymentMethod === 'KASBON') {
            return Boolean(selectedMember);
        }
        if (paymentMethod === 'SPLIT') {
            const numCashPortion = Number(cashPortion) || 0;
            const numSplitReceived = Number(splitCashReceived) || 0;
            if (numCashPortion > 0 && numSplitReceived < numCashPortion) {
                return false;
            }
            if (nonCashMethod === 'SALDO' && (!selectedMember || !isOnline)) {
                return false;
            }
            return true;
        }
        return true;
    }, [paymentMethod, cashReceived, finalPayableTotal, cashPortion, splitCashReceived, nonCashMethod, selectedMember, isOnline]);

    const onTriggerCheckout = useCallback(() => {
        if (!isCanSubmit) return;

        const loyaltyPayload = {
            loyalty_reward_id: selectedRewardId || null,
            points_to_redeem: !selectedRewardId && customRedeemPoints > 0 ? customRedeemPoints : null,
        };

        if (paymentMethod === 'SPLIT') {
            const numCashPortion = Number(cashPortion) || 0;
            const remaining = finalPayableTotal - numCashPortion;
            const payments = [];

            if (numCashPortion > 0) {
                payments.push({
                    payment_method: 'CASH',
                    amount: numCashPortion,
                    cash_received: Number(splitCashReceived) || numCashPortion,
                });
            }

            if (remaining > 0) {
                payments.push({
                    payment_method: nonCashMethod,
                    amount: remaining,
                });
            }

            handleCheckout({
                payment_method: 'SPLIT',
                payments,
                rounding_amount: roundingDiff,
                ...loyaltyPayload,
            });
        } else if (paymentMethod === 'CASH') {
            handleCheckout({
                payment_method: 'CASH',
                cash_received: Number(cashReceived),
                rounding_amount: roundingDiff,
                ...loyaltyPayload,
            });
        } else if (paymentMethod === 'SALDO') {
            handleCheckout({
                payment_method: 'SALDO',
                rounding_amount: 0,
                ...loyaltyPayload,
            });
        } else if (ENABLE_KASBON && paymentMethod === 'KASBON') {
            handleCheckout({
                payment_method: 'KASBON',
                rounding_amount: 0,
                ...loyaltyPayload,
            });
        } else {
            handleCheckout({
                payment_method: 'QRIS',
                rounding_amount: 0,
                ...loyaltyPayload,
            });
        }
    }, [isCanSubmit, paymentMethod, cashPortion, finalPayableTotal, splitCashReceived, nonCashMethod, handleCheckout, roundingDiff, cashReceived, ENABLE_KASBON, selectedRewardId, customRedeemPoints]);

    // Modal-Level Capturing Keyboard Listener (Highest Priority, Zero Leakage to Workstation)
    useEffect(() => {
        if (!isOpen) return;

        const handleModalKeyDown = (e) => {
            // Function Keys F1-F4
            if (e.key === 'F1') {
                e.preventDefault();
                e.stopPropagation();
                setPaymentMethod('CASH');
                return;
            }
            if (e.key === 'F2') {
                e.preventDefault();
                e.stopPropagation();
                setPaymentMethod('QRIS');
                return;
            }
            if (e.key === 'F3') {
                e.preventDefault();
                e.stopPropagation();
                setPaymentMethod('SPLIT');
                if (cashPortion === 0) {
                    setCashPortion(Math.floor(finalPayableTotal / 2));
                    setSplitCashReceived(Math.floor(finalPayableTotal / 2));
                }
                return;
            }
            if (e.key === 'F4') {
                if (selectedMember) {
                    e.preventDefault();
                    e.stopPropagation();
                    setPaymentMethod('SALDO');
                }
                return;
            }

            // ESCAPE: Dismiss modal cleanly
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onClose?.();
                return;
            }

            // ENTER: Submit Checkout or show immediate actionable error
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();

                if (isProcessing) return;

                if (isCanSubmit) {
                    onTriggerCheckout();
                } else if (paymentMethod === 'CASH') {
                    const shortAmount = finalPayableTotal - (Number(cashReceived) || 0);
                    toast.error(`Uang tunai kurang Rp ${shortAmount.toLocaleString('id-ID')} dari total tagihan!`);
                } else if (paymentMethod === 'SALDO') {
                    toast.error('Saldo anggota tidak mencukupi untuk pembayaran ini.');
                }
                return;
            }

            // PHYSICAL NUMPAD for Cash Tender (direct isolated input without leaking to background search)
            if (paymentMethod === 'CASH' && setCashReceived) {
                if (e.key >= '0' && e.key <= '9') {
                    e.preventDefault();
                    e.stopPropagation();
                    const digit = e.key;
                    const current = Number(cashReceived) || 0;
                    if (current === finalPayableTotal || current === 0) {
                        setCashReceived(Number(digit));
                    } else {
                        const combined = `${current}${digit}`;
                        setCashReceived(Number(combined));
                    }
                    return;
                }

                if (e.key === 'Backspace') {
                    e.preventDefault();
                    e.stopPropagation();
                    const str = String(Number(cashReceived) || 0);
                    const next = str.length > 1 ? Number(str.slice(0, -1)) : 0;
                    setCashReceived(next);
                    return;
                }

                if (e.key === 'c' || e.key === 'C') {
                    e.preventDefault();
                    e.stopPropagation();
                    setCashReceived(0);
                    return;
                }
            }
        };

        window.addEventListener('keydown', handleModalKeyDown, true);
        return () => window.removeEventListener('keydown', handleModalKeyDown, true);
    }, [isOpen, isCanSubmit, isProcessing, onTriggerCheckout, onClose, paymentMethod, cashReceived, finalPayableTotal, setPaymentMethod, selectedMember, cashPortion, setCashReceived]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 15 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.95, opacity: 0, y: 15 }}
                    className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col lg:flex-row max-h-[92vh] sm:max-h-[88vh] lg:h-[620px] border border-slate-200"
                >
                    {/* Modal Left: Method & Bill Summary */}
                    <div className="w-full lg:w-5/12 bg-slate-50/90 p-5 sm:p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pembayaran</h2>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Pilih metode pembayaran POS</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {onHoldOrder && (
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            onHoldOrder(paymentMethod);
                                            onClose();
                                        }} 
                                        className="px-2.5 py-1.5 bg-white rounded-xl shadow-2xs hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                        title="Parkir pesanan dengan metode ini"
                                    >
                                        <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Parkir</span>
                                    </button>
                                )}
                                <button 
                                    type="button" 
                                    onClick={onClose} 
                                    className="w-10 h-10 bg-white rounded-xl shadow-2xs hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 cursor-pointer shrink-0 flex items-center justify-center"
                                    title="Tutup (Esc)"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Payment Method Selector Grid */}
                        <div className={`grid ${ENABLE_KASBON && selectedMember && (isEmployee || selectedMember.is_member_koperasi) ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'} gap-2 mb-4`}>
                            <button 
                                type="button"
                                onClick={() => setPaymentMethod('CASH')} 
                                className={`p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                    paymentMethod === 'CASH' 
                                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xs' 
                                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                }`}
                            >
                                <Banknote className="w-5 h-5" strokeWidth={1.75} />
                                <span className="font-bold text-xs block">Tunai</span>
                                <kbd className={`text-[9px] font-mono ${paymentMethod === 'CASH' ? 'text-slate-300' : 'text-slate-400'}`}>F1</kbd>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setPaymentMethod('QRIS')} 
                                className={`p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                    paymentMethod === 'QRIS' 
                                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xs' 
                                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                }`}
                            >
                                <ScanBarcode className="w-5 h-5" strokeWidth={1.75} />
                                <span className="font-bold text-xs block">QRIS</span>
                                <kbd className={`text-[9px] font-mono ${paymentMethod === 'QRIS' ? 'text-slate-300' : 'text-slate-400'}`}>F2</kbd>
                            </button>

                            <button 
                                type="button"
                                onClick={() => {
                                    setPaymentMethod('SPLIT');
                                    if (cashPortion === 0) {
                                        setCashPortion(Math.floor(finalPayableTotal / 2));
                                        setSplitCashReceived(Math.floor(finalPayableTotal / 2));
                                    }
                                }} 
                                className={`p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                    paymentMethod === 'SPLIT' 
                                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xs' 
                                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                }`}
                            >
                                <Split className="w-5 h-5" strokeWidth={1.75} />
                                <span className="font-bold text-xs block">Split</span>
                                <kbd className={`text-[9px] font-mono ${paymentMethod === 'SPLIT' ? 'text-slate-300' : 'text-slate-400'}`}>F3</kbd>
                            </button>

                            <button 
                                type="button"
                                onClick={() => {
                                    if (selectedMember) {
                                        setPaymentMethod('SALDO');
                                    }
                                }} 
                                disabled={!selectedMember}
                                className={`p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                                    paymentMethod === 'SALDO' 
                                        ? 'border-slate-900 bg-slate-900 text-white shadow-2xs cursor-pointer' 
                                        : !selectedMember 
                                            ? 'border-slate-200 bg-slate-50/70 text-slate-400 cursor-not-allowed opacity-60' 
                                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer'
                                }`}
                                title={!selectedMember ? 'Pilih member di kasir untuk menggunakan saldo simpanan' : 'Saldo Simpanan Sukarela'}
                            >
                                <Wallet className="w-5 h-5" strokeWidth={1.75} />
                                <span className="font-bold text-xs block">Saldo</span>
                                <kbd className={`text-[9px] font-mono ${paymentMethod === 'SALDO' ? 'text-slate-300' : 'text-slate-400'}`}>F4</kbd>
                            </button>

                            {ENABLE_KASBON && (isEmployee || selectedMember?.is_member_koperasi) && (
                                <button 
                                    type="button"
                                    onClick={() => setPaymentMethod('KASBON')} 
                                    className={`p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                        paymentMethod === 'KASBON' 
                                            ? 'border-slate-900 bg-slate-900 text-white shadow-2xs' 
                                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                    }`}
                                    title="Kasbon Belanja / Potong Gaji"
                                >
                                    <Briefcase className="w-5 h-5" strokeWidth={1.75} />
                                    <span className="font-bold text-xs block">Kasbon</span>
                                    <kbd className={`text-[9px] font-mono ${paymentMethod === 'KASBON' ? 'text-slate-300' : 'text-slate-400'}`}>F5</kbd>
                                </button>
                            )}
                        </div>

                        {/* Manasuka Rewards Point Redemption Selector */}
                        <PosLoyaltyRedeemSection
                            selectedMember={selectedMember}
                            loyaltyRewards={loyaltyRewards}
                            loyaltyConfig={loyaltyConfig}
                            totalAmount={totalAmount}
                            selectedRewardId={selectedRewardId}
                            setSelectedRewardId={setSelectedRewardId}
                            customRedeemPoints={customRedeemPoints}
                            setCustomRedeemPoints={setCustomRedeemPoints}
                        />

                        {/* Bill Breakdown Card with .font-tabular */}
                        <PosBillSummaryCard
                            totalAmount={totalAmount}
                            pointsDiscountAmount={pointsDiscountAmount}
                            pointsRedeemed={pointsRedeemed}
                            roundingDiff={roundingDiff}
                            finalPayableTotal={finalPayableTotal}
                            paymentMethod={paymentMethod}
                            cashReceived={cashReceived}
                            changeAmount={changeAmount}
                            isCashInvolved={isCashInvolved}
                        />

                        {onOpenInternalUse && (
                            <div className="pt-3 mt-auto text-center border-t border-slate-200/60">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        onOpenInternalUse();
                                    }}
                                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Store className="w-3.5 h-3.5" />
                                    <span>Bukan belanja pribadi? Alihkan ke Pemakaian Toko (HPP)</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Modal Right: Dynamic Content (Numpad / QRIS / Split View / Kasbon) */}
                    <div className="w-full lg:w-7/12 p-5 sm:p-6 bg-white flex flex-col justify-between overflow-y-auto custom-scrollbar">
                        {paymentMethod === 'CASH' ? (
                            <PosCashTenderSection
                                cashReceived={cashReceived}
                                setCashReceived={setCashReceived}
                                quickCashOptions={quickCashOptions}
                                onSwitchToQris={() => setPaymentMethod('QRIS')}
                            />
                        ) : paymentMethod === 'SPLIT' ? (
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <PosSplitPaymentSection
                                    totalAmount={finalPayableTotal}
                                    cashPortion={cashPortion}
                                    setCashPortion={setCashPortion}
                                    cashReceived={splitCashReceived}
                                    setCashReceived={setSplitCashReceived}
                                    nonCashMethod={nonCashMethod}
                                    setNonCashMethod={setNonCashMethod}
                                    selectedMember={selectedMember}
                                    isOnline={isOnline}
                                />
                            </div>
                        ) : paymentMethod === 'SALDO' ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-4">
                                <div className="w-full max-w-sm space-y-4">
                                    {/* Apple Wallet Style Digital Card */}
                                    <div className="p-5 rounded-2xl bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white shadow-xl border border-slate-800 space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-slate-200">
                                                    <Wallet className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
                                                    Saldo Sukarela
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-mono text-slate-400">
                                                ID: {selectedMember?.id_number || selectedMember?.member_number || '-'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                name={selectedMember?.name}
                                                photo={selectedMember?.photo}
                                                size="md"
                                                shape="rounded-xl"
                                                variant="dark"
                                                className="border-white/20 text-white bg-white/10 shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                                                    Nama Anggota
                                                </span>
                                                <span className="text-base font-bold text-white tracking-tight truncate block">
                                                    {selectedMember?.name || 'Anggota Koperasi'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-1">
                                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                                                Saldo Tersedia
                                            </span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-black font-mono tracking-tight text-white font-tabular">
                                                    Rp {Number(selectedMember?.saldo_sukarela || 0).toLocaleString('id-ID')}
                                                </span>
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-emerald-400/50 shadow-xs" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial Deduction Ledger (Hairline Style) */}
                                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs font-mono font-tabular">
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Tagihan Belanja:</span>
                                            <span className="font-bold text-slate-900">
                                                Rp {finalPayableTotal.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-600 border-t border-slate-200/60 pt-2">
                                            <span>Sisa Saldo Setelah Debit:</span>
                                            <span className={`font-bold ${Number(selectedMember?.saldo_sukarela || 0) < finalPayableTotal ? 'text-rose-600' : 'text-slate-900'}`}>
                                                Rp {Math.max(0, Number(selectedMember?.saldo_sukarela || 0) - finalPayableTotal).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actionable Discrepancy Alert */}
                                    {Number(selectedMember?.saldo_sukarela || 0) < finalPayableTotal ? (
                                        <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 text-xs space-y-2">
                                            <p className="text-slate-600 font-medium text-[11px]">
                                                Saldo tidak cukup untuk bayar penuh (kurang <strong className="text-slate-900 font-mono font-tabular">Rp {(finalPayableTotal - Number(selectedMember?.saldo_sukarela || 0)).toLocaleString('id-ID')}</strong>).
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPaymentMethod('SPLIT');
                                                    setNonCashMethod('SALDO');
                                                    const avail = Math.min(Number(selectedMember?.saldo_sukarela || 0), finalPayableTotal);
                                                    const cashNeed = finalPayableTotal - avail;
                                                    setCashPortion(cashNeed);
                                                    setSplitCashReceived(cashNeed);
                                                }}
                                                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <Split className="w-3.5 h-3.5" />
                                                <span>Gunakan Split Payment (Saldo + Tunai)</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-slate-400 font-medium text-center">
                                            Otomatis didebit dari simpanan sukarela dan tercatat pada buku mutasi anggota.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (ENABLE_KASBON && paymentMethod === 'KASBON') ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-4">
                                <div className="w-full max-w-sm p-5 bg-slate-50 rounded-3xl border border-slate-200/80 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">Kasbon / Potong Gaji</h4>
                                            <p className="text-xs text-slate-500 font-medium">{selectedMember?.name || 'Karyawan'}</p>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-white rounded-2xl border border-slate-200/60 space-y-1.5 text-xs">
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>ID Karyawan:</span>
                                            <span className="font-mono font-bold text-slate-900">{selectedMember?.id_number || selectedMember?.member_number || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span>Tagihan Jajan:</span>
                                            <span className="font-mono font-bold text-slate-900">Rp {finalPayableTotal.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-slate-500 font-medium">
                                        Tagihan ini akan dibukukan ke Piutang Karyawan dan dipotongkan pada rekap penggajian (payroll) bulanan.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <PosQrisPaymentView 
                                amount={paymentMethod === 'SPLIT' ? Math.max(0, finalPayableTotal - cashPortion) : finalPayableTotal}
                                qrisPayload={qrisPayload}
                            />
                        )}

                        {/* Checkout Trigger Button (Distinct Sensory & Visual Anchoring) */}
                        <button 
                            type="button" 
                            onClick={onTriggerCheckout} 
                            disabled={!isCanSubmit || isProcessing}
                            className={`w-full mt-4 text-white py-4 rounded-2xl text-base font-black transition-all shadow-xs active:scale-[0.99] tracking-wide flex items-center justify-center gap-2 cursor-pointer ${
                                !isCanSubmit || isProcessing
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                    : paymentMethod === 'QRIS'
                                        ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20'
                                        : 'bg-slate-900 hover:bg-slate-800'
                            }`}
                        >
                            {paymentMethod === 'QRIS' ? (
                                <ScanBarcode className={`w-5 h-5 text-sky-200 ${isProcessing ? 'animate-spin' : ''}`} />
                            ) : paymentMethod === 'CASH' ? (
                                <Banknote className={`w-5 h-5 text-emerald-300 ${isProcessing ? 'animate-spin' : ''}`} />
                            ) : paymentMethod === 'SALDO' ? (
                                <Wallet className={`w-5 h-5 text-slate-300 ${isProcessing ? 'animate-spin' : ''}`} />
                            ) : (
                                <CheckCircle2 className={`w-5 h-5 text-slate-300 ${isProcessing ? 'animate-spin' : ''}`} />
                            )}
                            <span>
                                {isProcessing 
                                    ? 'MEMPROSES...' 
                                    : paymentMethod === 'QRIS'
                                        ? 'KONFIRMASI QRIS MASUK'
                                        : paymentMethod === 'CASH'
                                            ? 'TERIMA TUNAI'
                                            : paymentMethod === 'SALDO'
                                                ? 'POTONG SALDO ANGGOTA'
                                                : paymentMethod === 'SPLIT'
                                                    ? 'SELESAIKAN SPLIT PAYMENT'
                                                    : (ENABLE_KASBON && paymentMethod === 'KASBON')
                                                        ? 'KONFIRMASI KASBON'
                                                        : 'SELESAIKAN PEMBAYARAN'}
                            </span>
                            {!isProcessing && (
                                <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-mono font-bold bg-white/20 text-white rounded border border-white/20">Enter</kbd>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

