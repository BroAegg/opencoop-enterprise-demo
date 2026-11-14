import React from 'react';
import QuantityStepper from '@/Components/UI/QuantityStepper';

/**
 * PosVendorBeliPutusItemRow
 * 
 * Individual product receiving card for COD / Beli Putus vendors.
 * Features stock health badges (Kosong / Menipis / Aman), barcode indicator,
 * tactile stepper with batch chips (+10, +50), and real-time subtotal.
 */
export default function PosVendorBeliPutusItemRow({
    product,
    qty = '',
    onQtyChange,
    isJustScanned = false,
    formatRp,
}) {
    const stock = Number(product.stock || 0);
    const threshold = Number(product.threshold || 5);
    const isZero = stock <= 0;
    const isLow = stock <= threshold && !isZero;
    const costPrice = Number(product.cost_price || 0);
    const itemSubtotal = (Number(qty) || 0) * costPrice;

    return (
        <div
            className={`p-3 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isJustScanned
                    ? 'bg-slate-100 border-slate-900 ring-2 ring-slate-900/20 shadow-xs'
                    : Number(qty) > 0
                    ? 'bg-slate-50 border-slate-900 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
        >
            {/* Product Info */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {product.name}
                    </span>
                    {isZero && (
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200">
                            Kosong (0)
                        </span>
                    )}
                    {isLow && (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-300">
                            Sisa {stock} (Min: {threshold})
                        </span>
                    )}
                    {!isZero && !isLow && (
                        <span className="text-[10px] font-medium text-slate-500">
                            Stok: {stock} {product.unit || 'pcs'}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
                    {product.barcode && (
                        <>
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {product.barcode}
                            </span>
                            <span>·</span>
                        </>
                    )}
                    <span>HPP: <strong className="text-slate-700">{formatRp(costPrice)}</strong></span>
                    <span>·</span>
                    <span>Jual: {formatRp(product.selling_price)}</span>
                </div>
            </div>

            {/* Stepper & Subtotal */}
            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <div className="w-36">
                    <QuantityStepper
                        value={String(qty)}
                        onChange={onQtyChange}
                        size="sm"
                        placeholder="0"
                        batchIncrements={[10, 50]}
                        showZeroButton={Number(qty) > 0}
                    />
                </div>
                <div className="text-right w-24">
                    <span className="text-[10px] text-slate-400 block font-medium">Subtotal</span>
                    <span className={`font-mono text-xs font-bold ${itemSubtotal > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                        {formatRp(itemSubtotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}
