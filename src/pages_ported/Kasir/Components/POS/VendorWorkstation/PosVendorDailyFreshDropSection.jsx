import React from 'react';
import { Package, Plus } from 'lucide-react';
import QuantityStepper from '@/Components/UI/QuantityStepper';

export default function PosVendorDailyFreshDropSection({
    vendorProducts = [],
    incomingQtys = {},
    onIncomingQtyChange,
    totalIncomingPcs = 0,
    totalIncomingCost = 0,
    isFixedMargin = false,
    marginRate = 20,
    formatRp,
    onOpenQuickAdd,
    vendorName = '',
}) {
    const isFixed = Boolean(isFixedMargin);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            2. Terima Titipan Baru (Drop Hari Ini)
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            Masukkan jumlah titipan baru yang disetor mitra hari ini
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onOpenQuickAdd && (
                        <button
                            type="button"
                            onClick={onOpenQuickAdd}
                            className="px-2.5 py-1 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                            title="Tambah varian roti atau produk titipan baru langsung di meja kasir"
                        >
                            <Plus className="w-3.5 h-3.5 text-slate-700" />
                            <span>Produk Baru</span>
                        </button>
                    )}

                    {totalIncomingPcs > 0 && (
                        <span className="text-xs font-mono font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-md shadow-2xs">
                            +{totalIncomingPcs} pcs · Estimasi Setor {formatRp(totalIncomingCost)}
                        </span>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
                {vendorProducts.length === 0 ? (
                    <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2">
                        <p className="text-xs text-slate-500 font-medium">
                            Belum ada katalog produk untuk {vendorName || 'mitra ini'}.
                        </p>
                        {onOpenQuickAdd && (
                            <button
                                type="button"
                                onClick={onOpenQuickAdd}
                                className="mt-1 px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5 text-slate-700" />
                                <span>Input Produk Titipan Sekarang</span>
                            </button>
                        )}
                    </div>
                ) : (
                    vendorProducts.map((prod) => {
                        const currentQty = incomingQtys[prod.id] || 0;
                        const subtotal = currentQty * Number(prod.cost_price || 0);
                        const plannedQty = Number(prod.planned_po_qty || 0);
                        const hasPlan = plannedQty > 0;
                        const variance = currentQty - plannedQty;
                        const variancePct = hasPlan ? Math.abs(variance) / plannedQty : 0;
                        const isExceedingTolerance = hasPlan && currentQty > 0 && variancePct > 0.20;
                        const isExactMatch = hasPlan && currentQty === plannedQty;

                        return (
                            <div key={prod.id} className="p-3 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/50 transition-colors">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                            {prod.name}
                                        </h4>
                                        {hasPlan && (
                                            <span
                                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 font-mono"
                                                title={`Rencana PO terjadwal hari ini: ${plannedQty} pcs`}
                                            >
                                                PO: {plannedQty} pcs
                                            </span>
                                        )}
                                        {isExactMatch && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                ✓ Sesuai PO
                                            </span>
                                        )}
                                        {isExceedingTolerance && (
                                            <span
                                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60"
                                                title="Selisih >20% dari rencana PO. WA penerimaan akan menyertakan catatan ramah."
                                            >
                                                ⚠️ Selisih &gt;20% ({variance > 0 ? `+${variance}` : variance} pcs)
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                        Jual Kasir: <strong className="text-slate-800">{formatRp(prod.selling_price)}</strong> · HPP Setor: {formatRp(prod.cost_price)}
                                        {isFixed && (
                                            <span className="text-indigo-600 font-semibold ml-1.5">
                                                (HPP {100 - marginRate}% · Toko {marginRate}%)
                                            </span>
                                        )}
                                        {' '}· Sisa di rak: {prod.stock ?? 0} pcs
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {currentQty > 0 && (
                                        <span className="text-xs font-bold text-slate-900 font-tabular hidden sm:inline">
                                            {formatRp(subtotal)}
                                        </span>
                                    )}
                                    <QuantityStepper
                                        value={currentQty}
                                        onChange={(val) => onIncomingQtyChange(prod.id, val)}
                                        min={0}
                                        max={9999}
                                        size="md"
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

