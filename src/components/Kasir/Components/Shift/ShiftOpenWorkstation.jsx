import React, { useState, useMemo } from 'react';
import { Banknote, Calculator, Check, ArrowRight, ShieldCheck, Clock, Coins, RotateCcw } from 'lucide-react';
import { playScanSound } from '@/Utils/barcodeScanner';

const PRESETS = [
    { value: 0, label: 'Rp 0 (Laci Kosong)' },
    { value: 100000, label: 'Rp 100.000' },
    { value: 200000, label: 'Rp 200.000' },
    { value: 300000, label: 'Rp 300.000' },
    { value: 500000, label: 'Rp 500.000' },
];

const DENOMINATIONS = [
    { value: 100000, label: '100.000' },
    { value: 50000, label: '50.000' },
    { value: 20000, label: '20.000' },
    { value: 10000, label: '10.000' },
    { value: 5000, label: '5.000' },
    { value: 2000, label: '2.000' },
    { value: 1000, label: '1.000' },
];

export default function ShiftOpenWorkstation({ user, coop, onSubmit, isSubmitting = false, errorMessage = '' }) {
    const [openingCash, setOpeningCash] = useState('0');
    const [showCounter, setShowCounter] = useState(false);
    const [counts, setCounts] = useState({ 100000: '', 50000: '', 20000: '', 10000: '', 5000: '', 2000: '', 1000: '', coins: '' });

    const numericValue = useMemo(() => {
        const cleaned = openingCash.replace(/\D/g, '');
        return cleaned === '' ? 0 : parseInt(cleaned, 10);
    }, [openingCash]);

    const handleCountChange = (valKey, raw) => {
        const cleaned = raw.replace(/\D/g, '');
        const updated = { ...counts, [valKey]: cleaned };
        setCounts(updated);

        let total = 0;
        DENOMINATIONS.forEach(d => {
            total += (parseInt(updated[d.value] || '0', 10)) * d.value;
        });
        total += parseInt(updated.coins || '0', 10);
        setOpeningCash(new Intl.NumberFormat('id-ID').format(total));
    };

    const handleSelectPreset = (val) => {
        playScanSound('multiplier');
        setOpeningCash(new Intl.NumberFormat('id-ID').format(val));
        setShowCounter(false);
    };

    const handleResetCounter = () => {
        setCounts({ 100000: '', 50000: '', 20000: '', 10000: '', 5000: '', 2000: '', 1000: '', coins: '' });
        setOpeningCash('0');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(numericValue);
    };

    return (
        <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Workstation Header Strip */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Banknote className="w-6 h-6 text-slate-400 shrink-0" strokeWidth={1.75} />
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                                    Buka Shift Kasir
                                </h1>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Operator: <strong className="text-slate-800">{user?.name || 'Kasir'}</strong> · {coop?.name || 'Koperasi Konsumen Syariah Berkah Solusi Madani'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 self-start sm:self-auto shrink-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6">
                    {errorMessage && (
                        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                            {errorMessage}
                        </div>
                    )}

                    {/* Main Float Currency Input */}
                    <div>
                        <div className="flex justify-between items-baseline mb-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Fisik Modal Laci Awal (Starting Float)
                            </label>
                            <span className="text-[11px] text-slate-400">
                                Wajib diisi sebelum scan barcode
                            </span>
                        </div>

                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg select-none">
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={openingCash}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, '');
                                    setOpeningCash(raw === '' ? '0' : new Intl.NumberFormat('id-ID').format(parseInt(raw, 10)));
                                }}
                                className="w-full pl-13 pr-4 py-3.5 bg-slate-50/60 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-black text-2xl sm:text-3xl text-slate-900 font-tabular outline-none"
                                required
                                autoFocus
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Quick Presets */}
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Pilihan Modal Cepat:
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {PRESETS.map((p) => {
                                const isSelected = numericValue === p.value;
                                return (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() => handleSelectPreset(p.value)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                            isSelected
                                                ? 'bg-slate-900 text-white shadow-2xs ring-2 ring-slate-900/10'
                                                : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 border border-slate-200/60 active:scale-95'
                                        }`}
                                    >
                                        {isSelected && <Check className="w-3.5 h-3.5" />}
                                        <span className="font-tabular">{p.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Denomination Counter Toggle */}
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/40">
                        <button
                            type="button"
                            onClick={() => setShowCounter(!showCounter)}
                            className="w-full p-3.5 px-4 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/50 transition-colors cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-slate-500" />
                                Rincian Pecahan Uang Fisik
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                                {showCounter ? 'Tutup' : 'Buka'}
                            </span>
                        </button>

                        {showCounter && (
                            <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {DENOMINATIONS.map((d) => (
                                         <div key={d.value} className="flex items-center gap-2 text-xs">
                                             <span className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold font-tabular text-center text-slate-700 shrink-0">
                                                 Rp {d.label}
                                             </span>
                                             <span className="text-slate-400 font-bold">×</span>
                                             <input
                                                 type="text"
                                                 inputMode="numeric"
                                                 placeholder="0 lbr"
                                                 value={counts[d.value]}
                                                 onChange={(e) => handleCountChange(d.value, e.target.value)}
                                                 className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold font-tabular text-slate-900 focus:bg-white focus:border-slate-800 outline-none"
                                             />
                                         </div>
                                     ))}
                                     <div className="flex items-center gap-2 text-xs col-span-full pt-1 border-t border-slate-100">
                                         <span className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold font-tabular text-center text-slate-700 shrink-0 flex items-center justify-center gap-1">
                                             <Coins className="w-3 h-3 text-slate-500" /> Koin
                                         </span>
                                         <span className="text-slate-400 font-bold">Total</span>
                                         <input
                                             type="text"
                                             inputMode="numeric"
                                             placeholder="Total nominal koin (Rp)"
                                             value={counts.coins ? new Intl.NumberFormat('id-ID').format(parseInt(counts.coins, 10)) : ''}
                                             onChange={(e) => handleCountChange('coins', e.target.value)}
                                             className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold font-tabular text-slate-900 focus:bg-white focus:border-slate-800 outline-none"
                                         />
                                     </div>
                                 </div>
                                 <div className="flex justify-end pt-1">
                                     <button
                                         type="button"
                                         onClick={handleResetCounter}
                                         className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer font-medium"
                                     >
                                         <RotateCcw className="w-3 h-3" /> Reset Rincian
                                     </button>
                                 </div>
                             </div>
                         )}
                     </div>

                     {/* Submit Button */}
                     <button
                         type="submit"
                         disabled={isSubmitting}
                         className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold py-3.5 px-6 rounded-2xl transition-all shadow-xs active:scale-[0.99] cursor-pointer"
                     >
                         <span>Buka Terminal POS ({numericValue === 0 ? 'Rp 0' : `Rp ${new Intl.NumberFormat('id-ID').format(numericValue)}`})</span>
                         <ArrowRight className="w-4 h-4" />
                     </button>
                </form>
            </div>
        </div>
    );
}
