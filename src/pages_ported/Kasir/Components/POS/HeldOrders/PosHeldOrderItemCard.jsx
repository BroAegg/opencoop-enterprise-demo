import React, { memo, useMemo } from 'react';
import { 
    CheckSquare, Square, ScanBarcode, Banknote, 
    ArrowRightLeft, Trash2, PlayCircle, AlertCircle 
} from 'lucide-react';
import { toast } from '@/Components/UI/Toast';

/**
 * PosHeldOrderItemCard: Memoized tactile order card in POS Parkir queue.
 * Features Apple HIG styling, keyboard focus indicators, and real-time stock conflict warning.
 */
function PosHeldOrderItemCard({
    held,
    isSelected = false,
    isFocused = false,
    onToggleSelect,
    onFocus,
    onUpdatePaymentMethod,
    onDelete,
    onResume,
    lookupProduct,
}) {
    const cartItems = Array.isArray(held?.cart) ? held.cart : [];
    const currentMethod = held?.intendedPaymentMethod || 'CASH';

    // 1. Memoized total price & qty calculation
    const total = useMemo(() => {
        return cartItems.reduce((s, i) => {
            const modExtra = Number(i.selected_modifier?.price || 0);
            return s + ((Number(i.selling_price || 0) + modExtra) * Number(i.qty || 1));
        }, 0);
    }, [cartItems]);

    const totalQty = useMemo(() => {
        return cartItems.reduce((s, i) => s + Number(i.qty || 1), 0);
    }, [cartItems]);

    // 2. Real-time stock conflict check against live shop catalog
    const stockStatus = useMemo(() => {
        if (!lookupProduct || cartItems.length === 0) return null;
        const outOfStockNames = [];
        const lowStockNames = [];
        for (const it of cartItems) {
            const prod = lookupProduct(it.barcode || it.id);
            if (prod && prod.stock !== undefined && prod.stock !== null) {
                const s = Number(prod.stock);
                if (s <= 0) {
                    outOfStockNames.push(it.name || prod.name || 'Produk');
                } else if (s < Number(it.qty || 1)) {
                    lowStockNames.push(it.name || prod.name || 'Produk');
                }
            }
        }
        return { 
            outOfStockCount: outOfStockNames.length, 
            lowStockCount: lowStockNames.length,
            outOfStockNames,
            lowStockNames,
        };
    }, [cartItems, lookupProduct]);

    return (
        <div 
            onClick={onFocus}
            className={`bg-white border rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-2xs transition-all ${
                isFocused
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                    : isSelected 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/20' 
                        : 'border-slate-200/90 hover:border-slate-300'
            }`}
        >
            {/* Card Header */}
            <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Checkbox */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSelect?.(held.id);
                        }}
                        className="cursor-pointer text-slate-400 hover:text-emerald-600 transition-colors"
                        title={isSelected ? 'Batalkan pilihan' : 'Pilih pesanan'}
                    >
                        {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                        )}
                    </button>

                    <span className="font-mono text-xs font-bold font-tabular text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {held.timestamp}
                    </span>

                    {/* Quick Toggle Payment Method (Tunai <-> QRIS) */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            const next = currentMethod === 'QRIS' ? 'CASH' : 'QRIS';
                            onUpdatePaymentMethod?.(held.id, next);
                            toast.success(`Metode antrean diubah ke ${next === 'QRIS' ? 'QRIS' : 'Tunai Pas'}.`);
                        }}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer ${
                            currentMethod === 'QRIS'
                                ? 'text-sky-700 bg-sky-50 border-sky-200 hover:bg-sky-100'
                                : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        }`}
                        title="Klik untuk menukar metode pembayaran (Tunai <-> QRIS)"
                    >
                        {currentMethod === 'QRIS' ? (
                            <>
                                <ScanBarcode className="w-3.5 h-3.5 text-sky-600" />
                                <span>QRIS</span>
                            </>
                        ) : (
                            <>
                                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Tunai Pas</span>
                            </>
                        )}
                        <ArrowRightLeft className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                    </button>

                    {held.member && (
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-tabular">
                            {held.member.name}
                        </span>
                    )}

                    <span className="text-xs text-slate-400 font-tabular font-medium">
                        {totalQty} barang
                    </span>

                    {/* Real-time Stock Status Badge (Interactive trigger for Global Apple Dynamic Island Toast) */}
                    {stockStatus?.outOfStockCount > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                toast.warning(`Stok "${stockStatus.outOfStockNames.join(', ')}" kosong di toko!`);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md cursor-pointer transition-all active:scale-95"
                            title="Klik untuk notifikasi Dynamic Island detail produk kosong"
                        >
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>{stockStatus.outOfStockCount} Stok Habis di Toko</span>
                        </button>
                    )}
                    {stockStatus?.outOfStockCount === 0 && stockStatus?.lowStockCount > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                toast.warning(`Stok "${stockStatus.lowStockNames.join(', ')}" menipis.`);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md cursor-pointer transition-all active:scale-95"
                            title="Klik untuk notifikasi Dynamic Island detail produk menipis"
                        >
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Stok Menipis</span>
                        </button>
                    )}
                </div>

                <span className="font-black font-tabular text-base text-slate-900 shrink-0">
                    Rp {total.toLocaleString('id-ID')}
                </span>
            </div>

            {/* Cart Items Pill List with subtle out-of-stock highlights */}
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {cartItems.map((i, idx) => {
                    const prod = lookupProduct?.(i.barcode || i.id);
                    const isItemOutOfStock = prod && prod.stock !== undefined && prod.stock !== null && Number(prod.stock) <= 0;
                    return (
                        <span 
                            key={i.id || i.cart_key || idx} 
                            className={`text-[11px] font-medium border px-2 py-1 rounded-lg whitespace-nowrap transition-colors ${
                                isItemOutOfStock
                                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                                    : 'bg-slate-50 border-slate-200/80 text-slate-700'
                            }`}
                        >
                            <strong className={`font-tabular ${isItemOutOfStock ? 'text-rose-950 font-bold' : 'text-slate-900'}`}>{i.qty || 1}×</strong> {i.name || 'Produk'}
                            {isItemOutOfStock && <span className="ml-1 text-[9px] font-bold text-rose-600 uppercase">(Habis)</span>}
                        </span>
                    );
                })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] text-slate-400 italic">
                    {held.note ? `Catatan: ${held.note}` : 'Tekan Lanjutkan untuk membuka kasir'}
                </span>

                <div className="flex items-center gap-2">
                    <button 
                        type="button" 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(held.id);
                        }} 
                        className="px-2.5 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                    </button>
                    <button 
                        type="button" 
                        onClick={(e) => {
                            e.stopPropagation();
                            onResume?.(held);
                        }} 
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer ${
                            isFocused
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/40'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                    >
                        <PlayCircle className="w-4 h-4" />
                        <span>{isFocused ? 'Lanjutkan (Enter)' : 'Lanjutkan'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(PosHeldOrderItemCard);

