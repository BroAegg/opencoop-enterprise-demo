import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Wallet,
    ArrowDownRight,
    ArrowUpRight,
    ShieldCheck,
    ShoppingBag,
    Utensils,
    FileText,
} from 'lucide-react';
import SegmentedControl from '@/Components/UI/SegmentedControl';
import usePosCashMovement from './CashMovement/usePosCashMovement';
import OperationalCashTab from './CashMovement/OperationalCashTab';

export default function PosCashMovementModal({
    isOpen = false,
    onClose,
    onSuccess,
    onOpenConsignment,
    initialIntent = null,
}) {
    const {
        type,
        cashOutIntent,
        selectDirection,
        selectCashOutIntent,
        amount,
        setAmount,
        numericAmount,
        setCategory,
        description,
        setDescription,
        isSubmittingOps,
        opsError,
        availableCash,
        handleOpsSubmit,
    } = usePosCashMovement({ isOpen, onSuccess, onClose, initialIntent });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
                <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 15 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/80 flex flex-col max-h-[92vh]"
                >
                    {/* Header (Apple HIG Calm Styling) */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                                <Wallet className="w-5 h-5 text-white" strokeWidth={2} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="font-bold text-slate-900 text-base leading-tight">
                                        Arus Kas Laci
                                    </h2>
                                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                        F6
                                    </span>
                                </div>
                                <span className="text-xs text-slate-500 font-medium font-tabular">
                                    Saldo Laci: <strong className="text-slate-900 font-mono font-bold">Rp {Number(availableCash || 0).toLocaleString('id-ID')}</strong>
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Direction Switcher (Global SegmentedControl) */}
                    <div className="p-3 bg-slate-100/70 border-b border-slate-200/60 shrink-0">
                        <SegmentedControl
                            value={type}
                            onChange={selectDirection}
                            size="md"
                            options={[
                                { id: 'CASH_OUT', label: 'Kas Keluar', icon: ArrowDownRight },
                                { id: 'CASH_IN', label: 'Kas Masuk', icon: ArrowUpRight },
                                { id: 'CASH_DROP', label: 'Setor Brankas', icon: ShieldCheck },
                            ]}
                        />
                    </div>

                    {/* Scrollable Body Content */}
                    <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
                        {/* Progressive Disclosure: Compact Intent Selector when CASH_OUT */}
                        {type === 'CASH_OUT' && (
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Tujuan Pengeluaran
                                </label>
                                <SegmentedControl
                                    value={cashOutIntent}
                                    onChange={selectCashOutIntent}
                                    size="sm"
                                    options={[
                                        { id: 'TOKO', label: 'Kebutuhan Toko', icon: ShoppingBag },
                                        { id: 'GAJI_MAKAN', label: 'Gaji & Makan', icon: Utensils },
                                        { id: 'LAINNYA', label: 'Pengeluaran Lain', icon: FileText },
                                    ]}
                                />
                                <p className="text-[11px] text-slate-500 pl-0.5">
                                    {cashOutIntent === 'TOKO' && 'Kresek, galon air, kebersihan, & operasional rutin toko'}
                                    {cashOutIntent === 'GAJI_MAKAN' && 'Uang makan kasir harian & konsumsi staf bertugas'}
                                    {cashOutIntent === 'LAINNYA' && 'Pulsa/kuota internet, akomodasi, atau pengeluaran insidental'}
                                </p>
                            </div>
                        )}

                        {/* Operational Form */}
                        <div className={type === 'CASH_OUT' ? 'pt-2 border-t border-slate-100' : ''}>
                            <OperationalCashTab
                                type={type}
                                cashOutIntent={cashOutIntent}
                                amount={amount}
                                onAmountChange={setAmount}
                                numericAmount={numericAmount}
                                availableCash={availableCash}
                                onCategoryChange={setCategory}
                                description={description}
                                onDescriptionChange={setDescription}
                                opsError={opsError}
                                isSubmittingOps={isSubmittingOps}
                                onSubmit={handleOpsSubmit}
                                onOpenConsignment={onOpenConsignment}
                                onCloseModal={onClose}
                            />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

