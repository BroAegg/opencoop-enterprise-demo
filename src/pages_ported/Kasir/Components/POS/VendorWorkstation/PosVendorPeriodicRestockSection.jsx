import React from 'react';
import { Layers, Plus } from 'lucide-react';
import QuantityStepper from '@/Components/UI/QuantityStepper';

/**
 * PosVendorPeriodicRestockSection
 * 
 * Clean, high-throughput intake section for Periodic Shelf Consignment.
 * Allows cashiers to input incoming snack/cookies drops with steppers,
 * quick product creation modal, and instant subtotal visibility.
 */
export default function PosVendorPeriodicRestockSection({
    vendorProducts = [],
    restockQtys = {},
    onRestockQtyChange,
    totalRestockPcs = 0,
    totalRestockCost = 0,
    formatRp,
    vendorName = '',
    onOpenQuickAdd,
}) {
    return (
        <div className="space-y-3 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            Tambah Stok Barang
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            Masukkan jumlah barang yang disetor mitra hari ini
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onOpenQuickAdd && (
                        <button
                            type="button"
                            onClick={onOpenQuickAdd}
                            className="px-2.5 py-1 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                            title="Tambah varian rasa / produk titipan baru langsung di meja kasir"
                        >
                            <Plus className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Produk Baru</span>
                        </button>
                    )}

                    {totalRestockPcs > 0 && (
                        <span className="text-xs font-mono font-black text-white bg-slate-900 px-3 py-1 rounded-lg shadow-2xs">
                            +{totalRestockPcs} pcs · {formatRp(totalRestockCost)}
                        </span>
                    )}
                </div>
            </div>

            {/* Product List */}
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
                                className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5 text-slate-700" />
                                <span>Tambah Varian Pertama</span>
                            </button>
                        )}
                    </div>
                ) : (
                    vendorProducts.map((prod) => {
                        const currentQty = restockQtys[prod.id] || 0;
                        const subtotal = currentQty * Number(prod.cost_price || 0);

                        return (
                            <div
                                key={prod.id}
                                className="p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/50 transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                            {prod.name}
                                        </h4>
                                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded">
                                            Stok: {prod.stock ?? 0} pcs
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                        Harga Titip / Modal: <strong className="text-slate-800">{formatRp(prod.cost_price)}</strong>
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {currentQty > 0 && (
                                        <span className="text-xs font-mono font-bold text-slate-900 font-tabular hidden sm:inline">
                                            {formatRp(subtotal)}
                                        </span>
                                    )}
                                    <QuantityStepper
                                        value={currentQty}
                                        onChange={(val) => onRestockQtyChange(prod.id, val)}
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

