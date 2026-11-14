import React from 'react';
import { Trash2 } from 'lucide-react';
import QuantityStepper from '@/Components/UI/QuantityStepper';

/**
 * CodIncomingItemsList
 * 
 * Itemized list of products being received in COD (stock increments).
 * Uses QuantityStepper for speed and precision.
 */
export default function CodIncomingItemsList({
    codItems = [],
    onUpdateCodItemCost,
    onUpdateCodItemQty,
    onRemoveCodItem,
}) {
    if (codItems.length === 0) return null;

    return (
        <div className="space-y-1.5 pt-1 border-t border-slate-200/70">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Daftar Barang Masuk (Stok Bertambah):
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {codItems.map((item, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-xl border border-slate-200/90 p-2 flex items-center justify-between gap-2 shadow-2xs"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                                {item.name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] text-slate-400">Modal @:</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={item.unit_cost}
                                    onChange={(e) => onUpdateCodItemCost(idx, e.target.value)}
                                    className="font-mono text-[11px] text-slate-700 bg-slate-50 px-1 py-0.5 rounded border border-slate-200 w-18 outline-none focus:border-slate-800"
                                />
                            </div>
                        </div>

                        {/* Stepper Quantity (via Global UI) */}
                        <QuantityStepper
                            value={item.qty}
                            min={1}
                            onChange={(val) => onUpdateCodItemQty(idx, Math.max(1, parseInt(val, 10) || 1))}
                            onStep={(delta) => onUpdateCodItemQty(idx, Math.max(1, item.qty + delta))}
                            size="sm"
                        />

                        {/* Line Subtotal */}
                        <div className="text-right shrink-0 min-w-[70px]">
                            <span className="font-mono font-bold text-xs text-slate-900">
                                Rp {Number(item.subtotal || 0).toLocaleString('id-ID')}
                            </span>
                        </div>

                        {/* Remove item button */}
                        <button
                            type="button"
                            onClick={() => onRemoveCodItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors shrink-0"
                            title="Hapus barang"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
