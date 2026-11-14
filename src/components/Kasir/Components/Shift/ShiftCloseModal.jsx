import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, AlertCircle, Loader2 } from 'lucide-react';

const DENOMINATIONS = [
    { value: 100000, label: 'Rp 100.000' },
    { value: 50000, label: 'Rp 50.000' },
    { value: 20000, label: 'Rp 20.000' },
    { value: 10000, label: 'Rp 10.000' },
    { value: 5000, label: 'Rp 5.000' },
    { value: 2000, label: 'Rp 2.000' },
    { value: 1000, label: 'Rp 1.000' },
];

export default function ShiftCloseModal({
    isOpen = false,
    onClose,
    onSubmit,
    isSubmitting = false,
    errorMessage = '',
}) {
    const [useManualInput, setUseManualInput] = useState(false);
    const [manualCash, setManualCash] = useState('');
    const [counts, setCounts] = useState({
        100000: '', 50000: '', 20000: '', 10000: '', 5000: '', 2000: '', 1000: '', coins: '',
    });

    const handleCountChange = (valKey, raw) => {
        setCounts(prev => ({ ...prev, [valKey]: raw.replace(/\D/g, '') }));
    };

    const denominationTotal = useMemo(() => {
        let total = 0;
        DENOMINATIONS.forEach(d => {
            total += parseInt(counts[d.value] || '0', 10) * d.value;
        });
        return total + parseInt(counts.coins || '0', 10);
    }, [counts]);

    const finalCashAmount = useMemo(() => {
        if (useManualInput) {
            return parseInt(manualCash.replace(/\D/g, '') || '0', 10);
        }
        return denominationTotal;
    }, [useManualInput, manualCash, denominationTotal]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (finalCashAmount < 0) return;

        const denominationPayload = useManualInput ? null : {
            100000: parseInt(counts[100000] || '0', 10),
            50000: parseInt(counts[50000] || '0', 10),
            20000: parseInt(counts[20000] || '0', 10),
            10000: parseInt(counts[10000] || '0', 10),
            5000: parseInt(counts[5000] || '0', 10),
            2000: parseInt(counts[2000] || '0', 10),
            1000: parseInt(counts[1000] || '0', 10),
            coins: parseInt(counts.coins || '0', 10),
        };

        onSubmit({
            actual_closing_cash: finalCashAmount,
            cash_denominations: denominationPayload,
        });
    };

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
                    className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[92vh]"
                >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                        <div>
                            <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-slate-500" />
                                Tutup Shift
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Masukkan perhitungan fisik kas akhir
                            </p>
                        </div>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isSubmitting}
                            className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                        {/* Segmented Control */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setUseManualInput(false)}
                                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    !useManualInput ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                Lembaran Uang
                            </button>
                            <button
                                type="button"
                                onClick={() => setUseManualInput(true)}
                                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    useManualInput ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                Total Nominal
                            </button>
                        </div>

                        {errorMessage && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {!useManualInput ? (
                            <div className="space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {DENOMINATIONS.map(d => {
                                        const qty = parseInt(counts[d.value] || '0', 10);
                                        const subtotal = qty * d.value;
                                        return (
                                            <div key={d.value} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 gap-2">
                                                <span className="text-xs font-medium text-slate-700 px-2 py-0.5 rounded-md bg-white border border-slate-200 shrink-0 font-tabular">
                                                    {d.label}
                                                </span>
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="0"
                                                        value={counts[d.value]}
                                                        onChange={(e) => handleCountChange(d.value, e.target.value)}
                                                        className="w-14 text-center py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold font-tabular focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                                                    />
                                                    <span className="text-[11px] text-slate-400 shrink-0">lbr</span>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-900 font-tabular shrink-0 min-w-[65px] text-right">
                                                    {subtotal > 0 ? `Rp ${subtotal.toLocaleString('id-ID')}` : '-'}
                                                </span>
                                            </div>
                                        );
                                    })}

                                    {/* Koin / Logam */}
                                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 gap-2 sm:col-span-2">
                                        <span className="text-xs font-medium text-slate-700 px-2 py-0.5 rounded-md bg-white border border-slate-200 shrink-0">
                                            Koin / Logam
                                        </span>
                                        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                                            <span className="text-xs font-medium text-slate-400">Rp</span>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="0"
                                                value={counts.coins ? Number(counts.coins).toLocaleString('id-ID') : ''}
                                                onChange={(e) => handleCountChange('coins', e.target.value)}
                                                className="w-full text-right py-1 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold font-tabular focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Total Fisik Uang Tunai di Laci
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">Rp</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={manualCash ? Number(manualCash.replace(/\D/g, '')).toLocaleString('id-ID') : ''}
                                        onChange={(e) => setManualCash(e.target.value.replace(/\D/g, ''))}
                                        placeholder="0"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-tabular text-lg text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        {/* Summary Box */}
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between shrink-0">
                            <span className="text-xs font-medium text-slate-600">Total Fisik Dihitung</span>
                            <div className="text-lg sm:text-xl font-bold text-slate-900 font-tabular">
                                Rp {finalCashAmount.toLocaleString('id-ID')}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5 pt-1 shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 font-semibold text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={finalCashAmount <= 0 || isSubmitting}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 font-semibold text-xs sm:text-sm text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                ) : (
                                    <span>Tutup Shift</span>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
