import React from 'react';
import { RotateCcw, Plus, Trash2 } from 'lucide-react';
import QuantityStepper from '@/Components/UI/QuantityStepper';

/**
 * CodReturnItemsList
 * 
 * Itemized list of returned / damaged items deducted from the COD invoice.
 * Supports reason selection and quantity manipulation via QuantityStepper.
 */
export default function CodReturnItemsList({
    returnItems = [],
    totalReturnPcs = 0,
    totalReturnCost = 0,
    catalogMode = 'INCOMING',
    setCatalogMode,
    onUpdateReturnItemCost,
    onUpdateReturnItemReason,
    onUpdateReturnItemQty,
    onRemoveReturnItem,
}) {
    return (
        <div className="rounded-2xl bg-amber-50/40 border border-amber-200/70 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900">
                    <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" strokeWidth={1.75} />
                    <div>
                        <span className="text-xs font-bold block leading-none">Barang Retur / Tarik Sisa</span>
                        <span className="text-[10px] text-amber-700/80 font-normal">
                            Sisa rak, mlempem, expired, atau barang tukar yang diambil sales
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {totalReturnPcs > 0 && (
                        <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded-md border border-amber-200 font-tabular">
                            -{totalReturnPcs} pcs (-Rp {totalReturnCost.toLocaleString('id-ID')})
                        </span>
                    )}
                    {catalogMode !== 'RETURN' && (
                        <button
                            type="button"
                            onClick={() => setCatalogMode('RETURN')}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-white text-amber-900 hover:bg-amber-100/60 border border-amber-200 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                        >
                            <Plus className="w-3 h-3" />
                            <span>Pilih Retur</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Return Items List */}
            {returnItems.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {returnItems.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl border border-amber-200/80 p-2 flex items-center justify-between gap-2 shadow-2xs"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                    {item.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-slate-400">Modal @:</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.unit_cost}
                                            onChange={(e) => onUpdateReturnItemCost?.(idx, e.target.value)}
                                            className="font-mono text-[11px] text-slate-700 bg-slate-50 px-1 py-0.5 rounded border border-slate-200 w-18 outline-none focus:border-amber-600"
                                        />
                                    </div>
                                    <select
                                        value={item.reason || 'Mlempem / Expired'}
                                        onChange={(e) => onUpdateReturnItemReason?.(idx, e.target.value)}
                                        className="text-[10px] text-amber-800 bg-amber-50/70 border border-amber-200 rounded px-1.5 py-0.5 outline-none focus:border-amber-500 font-medium"
                                    >
                                        <option value="Mlempem / Expired">Mlempem / Expired</option>
                                        <option value="Kemasan Rusak / Bocor">Kemasan Rusak / Bocor</option>
                                        <option value="Tarik Sisa Rak">Tarik Sisa Rak</option>
                                        <option value="Tukar Varian Lain">Tukar Varian</option>
                                    </select>
                                </div>
                            </div>

                            {/* Stepper Quantity (via Global UI) */}
                            <QuantityStepper
                                value={item.qty}
                                min={1}
                                onChange={(val) => onUpdateReturnItemQty?.(idx, Math.max(1, parseInt(val, 10) || 1))}
                                onStep={(delta) => onUpdateReturnItemQty?.(idx, Math.max(1, item.qty + delta))}
                                size="sm"
                            />

                            {/* Line Subtotal */}
                            <div className="text-right shrink-0 min-w-[70px]">
                                <span className="font-mono font-bold text-xs text-rose-600">
                                    -Rp {Number(item.subtotal || 0).toLocaleString('id-ID')}
                                </span>
                            </div>

                            {/* Remove item button */}
                            <button
                                type="button"
                                onClick={() => onRemoveReturnItem?.(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors shrink-0"
                                title="Hapus barang retur"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-2.5 text-center text-[11px] text-amber-800/80 bg-amber-50/60 rounded-xl border border-dashed border-amber-200/90 leading-tight">
                    Tidak ada barang retur / tarik sisa dari sales. (Opsional, klik tab <strong>"↺ Retur / Tukar"</strong> di atas jika sales mengambil barang lama).
                </div>
            )}
        </div>
    );
}

