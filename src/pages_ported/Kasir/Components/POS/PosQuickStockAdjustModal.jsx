import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    SlidersHorizontal,
    Check,
    Loader2,
    Info,
} from 'lucide-react';
import axios from 'axios';
import { toast } from '@/Components/UI/Toast';
import QuickAdjustStockStepper from './QuickAdjust/QuickAdjustStockStepper';
import QuickAdjustReasonSelector from './QuickAdjust/QuickAdjustReasonSelector';

export default function PosQuickStockAdjustModal({
    isOpen = false,
    onClose,
    product = null,
    onSuccess,
}) {
    const systemStock = Number(product?.stock ?? 0);
    const [physicalStock, setPhysicalStock] = useState(systemStock);
    const [reasonCategory, setReasonCategory] = useState('BARANG_HILANG');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isOpen && product) {
            setPhysicalStock(Number(product.stock ?? 0));
            setReasonCategory('BARANG_HILANG');
            setNotes('');
            setErrorMsg('');
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const diff = Number(physicalStock) - systemStock;
    const unitPrice = Number(product.cost_price || product.selling_price || 0);
    const diffValue = Math.abs(diff) * unitPrice;

    const handleStep = (delta) => {
        setPhysicalStock((prev) => Math.max(0, Number(prev) + delta));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (diff === 0) {
            onClose();
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const payload = {
                product_id: product.id,
                physical_stock: Math.max(0, Number(physicalStock)),
                reason_category: diff > 0 ? 'SELISIH_FISIK' : reasonCategory,
                notes: notes.trim() || undefined,
            };

            const response = await axios.post('/kasir/api/products/quick-adjust', payload);

            if (response.data?.success) {
                toast.success(
                    response.data.message || `Stok ${product.name} berhasil disesuaikan.`
                );
                onSuccess?.(response.data);
                onClose();
            } else {
                setErrorMsg(response.data?.message || 'Gagal menyimpan koreksi stok.');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Terjadi kesalahan saat memproses penyesuaian stok.';
            setErrorMsg(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
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
                    initial={{ scale: 0.96, opacity: 0, y: 12 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 12 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                                <SlidersHorizontal className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base leading-tight">
                                    Koreksi Stok Cepat (POS)
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Penyesuaian fisik & pencatatan selisih akuntansi
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                            title="Tutup (Esc)"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
                        {/* Product Detail Card */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 text-sm truncate">
                                        {product.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                        <span className="font-mono">{product.sku}</span>
                                        {product.category && (
                                            <>
                                                <span>•</span>
                                                <span className="capitalize">{product.category}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-xs text-slate-500 font-medium block">
                                        Harga Jual
                                    </span>
                                    <span className="font-bold text-slate-900 text-xs font-tabular">
                                        Rp {Number(product.selling_price || 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stock Stepper */}
                        <QuickAdjustStockStepper
                            systemStock={systemStock}
                            physicalStock={physicalStock}
                            unit={product.unit || 'pcs'}
                            onChangePhysicalStock={setPhysicalStock}
                            onStep={handleStep}
                        />

                        {/* Difference Alert & Valuation */}
                        {diff !== 0 ? (
                            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                                diff < 0 
                                    ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
                                    : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <Info className="w-4 h-4 shrink-0" />
                                    <span>
                                        Selisih: <strong>{diff > 0 ? `+${diff}` : diff} {product.unit || 'pcs'}</strong>
                                        {diff < 0 ? ' (Fisik Kurang)' : ' (Fisik Lebih)'}
                                    </span>
                                </div>
                                {diffValue > 0 && (
                                    <span className="font-bold font-tabular">
                                        ± Rp {diffValue.toLocaleString('id-ID')}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2 justify-center">
                                <Check className="w-4 h-4 text-emerald-600" />
                                <span>Stok fisik sama dengan data sistem (Klop).</span>
                            </div>
                        )}

                        {/* Deficit Reason Selection (Accounting Routing) */}
                        {diff < 0 && (
                            <QuickAdjustReasonSelector
                                selectedReason={reasonCategory}
                                onSelectReason={setReasonCategory}
                            />
                        )}

                        {/* Notes input */}
                        <div>
                            <input
                                type="text"
                                placeholder="Catatan opsional (misal: bungkus sobek, jajan lembur)..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                        </div>

                        {errorMsg && (
                            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                                {errorMsg}
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={diff === 0 || isSubmitting}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer ${
                                    diff === 0 || isSubmitting
                                        ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                                        : 'bg-slate-900 hover:bg-slate-800 shadow-xs active:scale-98'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <span>Simpan Koreksi Stok</span>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

