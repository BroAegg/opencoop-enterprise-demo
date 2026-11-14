import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Plus, Loader2, Sparkles, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from '@/Components/UI/Toast';

/**
 * PosVendorQuickAddProductModal
 * 
 * Direct on-the-fly product registration modal for POS Kasir Vendor Workstation.
 * Designed for Bakery / Sari Roti & Consignment partners so cashiers can register
 * incoming new variants without leaving the POS desk.
 * Auto-derives 80/20 cost price for fixed-margin suppliers.
 */
export default function PosVendorQuickAddProductModal({
    isOpen,
    onClose,
    vendor,
    onSuccess,
    formatRp,
}) {
    const isFixedMargin = Boolean(
        vendor?.has_fixed_margin || Number(vendor?.consignment_margin_rate) > 0
    );
    const marginRate = Number(vendor?.consignment_margin_rate || 0);

    const [name, setName] = useState('');
    const [category, setCategory] = useState('Roti & Kue Basah');
    const [sellingPrice, setSellingPrice] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [initialQty, setInitialQty] = useState('0');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;
        setName('');
        const isBakery = (vendor?.name || '').toLowerCase().includes('roti') || isFixedMargin;
        setCategory(isBakery ? 'Roti & Kue Basah' : 'Jajanan Basah');
        setSellingPrice('');
        setCostPrice('');
        setInitialQty('0');
        setErrors({});

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !isSubmitting) {
                e.preventDefault();
                onClose?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, vendor, isFixedMargin, isSubmitting, onClose]);

    const numericSelling = Number(sellingPrice) || 0;
    const computedCost = useMemo(() => {
        if (isFixedMargin) {
            return Math.round(numericSelling * (1 - (marginRate / 100)));
        }
        return Number(costPrice) || 0;
    }, [isFixedMargin, numericSelling, marginRate, costPrice]);

    const profitShareAmount = Math.max(0, numericSelling - computedCost);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!name.trim()) {
            setErrors((prev) => ({ ...prev, name: 'Nama produk titipan wajib diisi' }));
            return;
        }

        if (numericSelling < 100) {
            setErrors((prev) => ({ ...prev, selling_price: 'Harga jual minimal Rp 100' }));
            return;
        }

        if (!isFixedMargin && computedCost < 0) {
            setErrors((prev) => ({ ...prev, cost_price: 'Harga HPP/beli tidak valid' }));
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                supplier_id: vendor.id,
                name: name.trim(),
                selling_price: numericSelling,
                category: category || 'Roti & Kue Basah',
                initial_qty: Math.max(0, parseInt(initialQty, 10) || 0),
            };

            if (!isFixedMargin) {
                payload.cost_price = computedCost;
            }

            const res = await axios.post('/kasir/api/consignment/product', payload);
            toast.success(res.data?.message || `Produk '${name}' berhasil didaftarkan!`);
            onSuccess?.(res.data?.product, payload.initial_qty);
            onClose?.();
        } catch (err) {
            console.error('Failed to quick-add consignment product:', err);
            const errData = err.response?.data;
            if (errData?.errors) {
                setErrors(errData.errors);
            } else {
                toast.error(errData?.message || 'Gagal mendaftarkan produk titipan baru.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !vendor) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans select-none">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                        if (!isSubmitting) onClose?.();
                    }}
                    className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs cursor-pointer"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 12 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-slate-900 truncate">
                                    Tambah Produk Titipan
                                </h3>
                                <p className="text-[11px] text-slate-500 font-medium truncate">
                                    Mitra: <strong className="text-slate-700">{vendor.name}</strong>
                                    {isFixedMargin && (
                                        <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                                            Margin {marginRate}%
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
                        {/* 1. Nama Produk */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                Nama Produk / Varian Roti <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                autoFocus
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Contoh: Sari Roti Sandwich Cokelat"
                                className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all outline-none ${
                                    errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                                }`}
                            />
                            {errors.name && (
                                <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* 2. Harga Jual Kasir */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                Harga Jual Kasir ke Pelanggan (@) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                                    Rp
                                </span>
                                <input
                                    type="number"
                                    min="100"
                                    step="100"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                    placeholder="Contoh: 6000"
                                    className={`w-full h-10 pl-9 pr-3 bg-slate-50 border rounded-xl text-xs font-bold font-mono focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all outline-none ${
                                        errors.selling_price ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                                    }`}
                                />
                            </div>
                            {errors.selling_price && (
                                <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.selling_price}</p>
                            )}
                        </div>

                        {/* 3. Automatic 80/20 Margin Calculation Card */}
                        {isFixedMargin ? (
                            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-indigo-800 font-bold flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                        Aturan Margin Tetap {marginRate}%
                                    </span>
                                    <span className="text-[11px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-200/60 shadow-2xs">
                                        Otomatis
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-indigo-100 font-mono">
                                    <div className="bg-white p-2 rounded-xl border border-indigo-100">
                                        <p className="text-[10px] text-slate-400 font-sans font-medium">HPP Setor ({100 - marginRate}%)</p>
                                        <p className="font-bold text-slate-900 mt-0.5">{formatRp(computedCost)}</p>
                                    </div>
                                    <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200/70">
                                        <p className="text-[10px] text-emerald-700 font-sans font-bold">Laba Toko ({marginRate}%)</p>
                                        <p className="font-bold text-emerald-800 mt-0.5">+{formatRp(profitShareAmount)}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                    Harga Modal / Titip Pabrik (@) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                                        Rp
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="100"
                                        value={costPrice}
                                        onChange={(e) => setCostPrice(e.target.value)}
                                        placeholder="Contoh: 4800"
                                        className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 4. Jumlah Drop Masuk Awal (Pcs) */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                    Jumlah Drop Masuk Hari Ini (Pcs)
                                </label>
                                <span className="text-[10px] text-slate-400">Opsional</span>
                            </div>
                            <input
                                type="number"
                                min="0"
                                value={initialQty}
                                onChange={(e) => setInitialQty(e.target.value)}
                                placeholder="0"
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                                Jika diisi &gt; 0, stok roti langsung bertambah dan otomatis masuk lembar drop kasir.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting || !name.trim() || numericSelling <= 0}
                                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Simpan & Masukkan ke Drop</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

