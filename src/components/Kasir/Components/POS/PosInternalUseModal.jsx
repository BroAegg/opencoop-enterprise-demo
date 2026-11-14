import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, Coffee, Sparkles, Package, Check, Loader2 } from 'lucide-react';

const CATEGORIES = [
    {
        id: 'KONSUMSI',
        label: 'Konsumsi & Dapur',
        description: 'Air galon, kopi, teh, snack piket',
        icon: Coffee,
    },
    {
        id: 'KEBERSIHAN',
        label: 'Kebersihan & ATK',
        description: 'Plastik kresek, deterjen, kertas struk',
        icon: Sparkles,
    },
    {
        id: 'OPERASIONAL',
        label: 'Operasional Lainnya',
        description: 'Baterai timbangan, perlengkapan toko',
        icon: Package,
    },
];

export default function PosInternalUseModal({
    isOpen = false,
    onClose,
    cart = [],
    onSubmit,
    isSubmitting = false,
    cashierName = 'Kasir',
}) {
    const [selectedCategory, setSelectedCategory] = useState('KONSUMSI');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    // Calculate total cost price (HPP) vs selling price
    const totalCostAmount = cart.reduce((sum, item) => {
        const costPrice = Number(item.cost_price ?? item.price ?? 0);
        return sum + (costPrice * item.qty);
    }, 0);

    const totalSellingAmount = cart.reduce((sum, item) => {
        const modPrice = Number(item.selected_modifier?.price || 0);
        return sum + ((Number(item.selling_price || item.price || 0) + modPrice) * item.qty);
    }, 0);

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const unchargedMargin = Math.max(0, totalSellingAmount - totalCostAmount);

    const handleConfirm = () => {
        const catObj = CATEGORIES.find(c => c.id === selectedCategory);
        const fullNotes = `[${catObj?.label || 'Beban Toko'}] ${notes.trim() || 'Pemakaian operasional toko'}`;

        onSubmit({
            payment_method: 'BEBAN_TOKO',
            notes: fullNotes,
            total_amount: totalSellingAmount,
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
                >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                <Store className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base leading-tight">Pemakaian Operasional Toko</h3>
                                <p className="text-xs text-slate-500 font-medium">Pengeluaran barang dagangan senilai Harga Jual Toko (Komersial)</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer flex items-center justify-center"
                            title="Batal (Esc)"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4">
                        {/* Selling Price Valuation Banner */}
                        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1">
                            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                                <span>Total Nilai Pemakaian (Harga Jual):</span>
                                <span className="font-mono">{totalItems} barang</span>
                            </div>
                            <div className="text-2xl sm:text-3xl font-black font-tabular tracking-tight">
                                Rp {totalSellingAmount.toLocaleString('id-ID')}
                            </div>
                            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                                Nilai HPP Modal: Rp {totalCostAmount.toLocaleString('id-ID')} · Tercatat penuh ke omzet toko &amp; ditanggung sebagai Beban Toko.
                            </p>
                        </div>

                        {/* Category Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Keperluan Pemakaian
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const isSelected = selectedCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900/10'
                                                    : 'border-slate-200/80 bg-white hover:bg-slate-50/70 text-slate-600'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} />
                                                {isSelected && <Check className="w-3.5 h-3.5 text-slate-900" />}
                                            </div>
                                            <div>
                                                <span className={`text-xs font-bold block ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                                    {cat.label}
                                                </span>
                                                <span className="text-[10px] text-slate-400 line-clamp-1">
                                                    {cat.description}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Notes input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Catatan / Keterangan (Opsional)
                            </label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Contoh: Air galon kasir shift pagi, kopi piket..."
                                className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                            />
                        </div>

                        {/* Items Preview */}
                        <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 max-h-32 overflow-y-auto custom-scrollbar space-y-1.5">
                            {cart.map((item) => {
                                const itemPrice = Number(item.selling_price || item.price || 0) + Number(item.selected_modifier?.price || 0);
                                return (
                                    <div key={item.cart_key || item.id} className="flex justify-between items-center text-xs">
                                        <span className="text-slate-700 font-medium truncate max-w-[240px]">
                                            {item.name} × {item.qty}
                                        </span>
                                        <span className="font-mono text-slate-700 font-bold font-tabular">
                                            Rp {(itemPrice * item.qty).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary & Responsibility note */}
                        <p className="text-[11px] text-slate-400 font-medium">
                            Dicatat oleh: <span className="font-bold text-slate-700">{cashierName}</span> · Laci kas fisik tidak terpengaruh. Stok rak dan batch FIFO akan berkurang otomatis.
                        </p>

                        {/* Action Buttons */}
                        <div className="pt-2 flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                                Batal (Esc)
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isSubmitting || cart.length === 0}
                                className="flex-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Membukukan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Konfirmasi Pengeluaran Toko</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
