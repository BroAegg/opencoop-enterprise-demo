import React from 'react';
import QuantityStepper from '@/Components/UI/QuantityStepper';

/**
 * PosVendorReturItemCard
 * 
 * Individual product reconciliation card for Retur Sore ritual.
 * Displays drop quantity, modal cost, category badge (Fresh vs Rak),
 * live physical tray stepper, and discrepancy detection.
 */
export default function PosVendorReturItemCard({
    it,
    formatRp,
    handlePhysicalRemainingChange,
    handleRecountItem,
    returnShelfStock = true,
    isBatchSettled = false,
}) {
    const isAllSold = it.remaining === 0 && (it.qty_received > 0 || it.system_stock > 0);
    const dropQty = it.qty_received > 0 ? it.qty_received : it.system_stock;

    return (
        <div
            className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isBatchSettled
                    ? 'bg-slate-50/60 border-slate-200'
                    : isAllSold
                    ? 'bg-slate-50 border-slate-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
        >
            {/* Product Details */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                        {it.name}
                    </h4>
                    {it.is_perishable ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            Harian
                        </span>
                    ) : (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-slate-50 text-slate-500 border border-slate-200/60 shrink-0">
                            Berkala
                        </span>
                    )}
                    {isBatchSettled ? (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                            Lunas
                        </span>
                    ) : (isAllSold && returnShelfStock && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-900 text-white border border-slate-900 shrink-0">
                            Habis
                        </span>
                    ))}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                    {it.is_perishable && it.has_batch ? (
                        <span>Drop: <strong className="text-slate-800 font-semibold">{dropQty}</strong> pcs</span>
                    ) : (
                        <span>Stok Toko: <strong className="text-slate-800 font-semibold">{it.system_stock || dropQty}</strong> pcs</span>
                    )}
                    <span className="text-slate-300">·</span>
                    <span>Modal: {formatRp(it.costPrice)}</span>
                    {it.qty_sold_pos > 0 && (
                        <>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-700 font-medium">
                                Terjual di POS: <strong className="font-mono text-slate-900">{it.qty_sold_pos}</strong> pcs
                            </span>
                        </>
                    )}
                    {!isBatchSettled && returnShelfStock && it.diff !== 0 && (
                        <>
                            <span className="text-slate-300">·</span>
                            <span className="font-mono font-medium text-slate-700">
                                {it.diff < 0 ? `Selisih: ${it.diff} pcs` : `Surplus: +${it.diff} pcs`}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Physical Remaining Stepper (if returning) vs Calm Shelf Status (if payout only) */}
            <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {isBatchSettled ? (
                    <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">Status Batch</span>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-mono">
                            Lunas ({dropQty} pcs)
                        </span>
                    </div>
                ) : returnShelfStock ? (
                    <div className="flex flex-col items-center gap-1">
                        <QuantityStepper
                            size="sm"
                            min={0}
                            value={it.remaining}
                            onChange={(val) => handlePhysicalRemainingChange(it.id, val)}
                            showZeroButton={true}
                        />
                        {it.diff !== 0 && handleRecountItem && (
                            <button
                                type="button"
                                onClick={() => handleRecountItem(it.id, it.expectedRemaining)}
                                className="text-[10px] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                title="Samakan ke perkiraan sistem"
                            >
                                Cek Ulang
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">Status Stok</span>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                            {it.system_stock} pcs tersimpan
                        </span>
                    </div>
                )}

                <div className="text-right min-w-[95px]">
                    <span className="text-[10px] text-slate-400 block">
                        {isBatchSettled ? 'Terjual' : 'Laku'}: <strong className="text-slate-700">{it.sold} pcs</strong>
                    </span>
                    <span className={`font-mono font-bold text-xs block ${
                        isBatchSettled ? 'text-emerald-800' : (it.subtotal > 0 ? 'text-slate-900' : 'text-slate-400')
                    }`}>
                        {isBatchSettled ? 'Sudah Lunas' : formatRp(it.subtotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}

