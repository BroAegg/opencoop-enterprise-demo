import React from 'react';
import {
    ArrowDownToLine,
    RotateCcw,
    Plus,
    Loader2,
} from 'lucide-react';
import SearchInput from '@/Components/UI/SearchInput';

/**
 * CodCatalogSelector
 * 
 * Catalog product selector for COD incoming and return items.
 * Includes mode switch (+ Terima Baru vs ↺ Retur / Tukar),
 * search input with barcode handling, and product chips.
 */
export default function CodCatalogSelector({
    selectedSupplier,
    catalogMode = 'INCOMING',
    setCatalogMode,
    totalItemsPcs = 0,
    totalReturnPcs = 0,
    productFilter = '',
    setProductFilter,
    visibleProducts = [],
    codItems = [],
    returnItems = [],
    onAddCodItem,
    onAddReturnItem,
    onOpenQuickAddWithPrefill,
    isLoadingSupplierProducts = false,
}) {
    if (!selectedSupplier) return null;

    return (
        <div className="space-y-2 pt-0.5">
            {/* Mode Segmented Switch: Terima Masuk (+) vs Retur / Tukar (-) */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                        type="button"
                        onClick={() => setCatalogMode('INCOMING')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            catalogMode === 'INCOMING'
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <ArrowDownToLine className="w-3 h-3 text-emerald-600" />
                        <span>+ Terima Baru ({totalItemsPcs})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setCatalogMode('RETURN')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            catalogMode === 'RETURN'
                                ? 'bg-amber-100 text-amber-950 font-bold shadow-2xs border border-amber-300/80'
                                : 'text-slate-600 hover:text-amber-900'
                        }`}
                    >
                        <RotateCcw className="w-3 h-3 text-amber-600" />
                        <span>↺ Retur / Tukar ({totalReturnPcs})</span>
                    </button>
                </div>

                {isLoadingSupplierProducts && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Memuat...
                    </span>
                )}
            </div>

            {/* Product & Barcode Search Bar */}
            <SearchInput
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                onClear={() => setProductFilter('')}
                placeholder={catalogMode === 'INCOMING' ? 'Scan barcode atau cari produk masuk...' : 'Pilih produk yang diretur / ditarik sales...'}
                size="sm"
                className="w-full"
            />

            {/* Product Chips */}
            {visibleProducts.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {visibleProducts.map((p) => {
                        const isAddedIncoming = codItems.some((it) => it.product_id === p.id);
                        const isAddedReturn = returnItems.some((it) => it.product_id === p.id);
                        const isCurrentActive = catalogMode === 'INCOMING' ? isAddedIncoming : isAddedReturn;

                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                    if (catalogMode === 'INCOMING') {
                                        onAddCodItem(p);
                                    } else {
                                        onAddReturnItem?.(p);
                                    }
                                }}
                                className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs ${
                                    catalogMode === 'INCOMING'
                                        ? isCurrentActive
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                                        : isCurrentActive
                                            ? 'bg-amber-800 text-white border-amber-800'
                                            : 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200 text-amber-900'
                                }`}
                            >
                                {catalogMode === 'INCOMING' ? (
                                    <Plus className={`w-3 h-3 ${isCurrentActive ? 'text-slate-300' : 'text-slate-400'}`} />
                                ) : (
                                    <RotateCcw className={`w-3 h-3 ${isCurrentActive ? 'text-amber-200' : 'text-amber-600'}`} />
                                )}
                                <span>{p.name}</span>
                                <span className={`font-mono text-[10px] font-normal ${isCurrentActive ? 'text-slate-300' : 'text-slate-400'}`}>
                                    (@Rp {Number(p.cost_price || 0).toLocaleString('id-ID')})
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : productFilter.trim() ? (
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center space-y-1.5">
                    <p className="text-xs text-slate-600">
                        Produk "{productFilter}" belum terdaftar di supplier ini.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            const cleanQuery = productFilter.trim();
                            const isBarcode = /^\d{6,14}$/.test(cleanQuery);
                            onOpenQuickAddWithPrefill?.({
                                barcode: isBarcode ? cleanQuery : '',
                                name: !isBarcode ? cleanQuery : '',
                            });
                            setProductFilter('');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                    >
                        <Plus className="w-3 h-3" />
                        <span>Daftarkan "{productFilter}"</span>
                    </button>
                </div>
            ) : !isLoadingSupplierProducts && (
                <p className="text-[11px] text-slate-400 italic">
                    Belum ada produk tertaut. Klik "+ Produk Baru" untuk menambahkan.
                </p>
            )}
        </div>
    );
}
