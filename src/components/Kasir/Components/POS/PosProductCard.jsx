import React from 'react';

/**
 * PosProductCard
 * 
 * Clean, tactile, and quiet product tile for the POS Workstation.
 * Supports Apple HIG keyboard navigation highlight ring and Enter badge.
 */
export default function PosProductCard({
    product,
    onSelect,
    onOpenQuickStockAdjust,
    isActive = false,
}) {
    const isOutOfStock = product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0;

    return (
        <button 
            type="button"
            data-active={isActive ? 'true' : undefined}
            onClick={() => onSelect(product)}
            className={`p-3 sm:p-3.5 rounded-xl shadow-2xs text-left active:scale-[0.98] transition-all border flex flex-col h-full cursor-pointer group relative ${
                isActive
                    ? 'ring-2 ring-slate-900 border-slate-900 shadow-md bg-white scale-[1.01] z-10'
                    : isOutOfStock 
                        ? 'bg-slate-50/50 border-slate-200/80 hover:border-slate-300 opacity-60' 
                        : 'bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 border-slate-200/80 hover:shadow-xs'
            }`}
        >
            <div className="flex items-start justify-between gap-1.5">
                <span className={`font-bold line-clamp-2 leading-tight text-xs sm:text-sm transition-colors ${
                    isOutOfStock ? 'text-slate-500' : 'text-slate-900 group-hover:text-slate-900'
                }`}>
                    {product.name}
                </span>
                {isOutOfStock && (
                    <span className="shrink-0 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/90 px-1.5 py-0.5 rounded leading-none">
                        Habis
                    </span>
                )}
            </div>
            
            {product.category && (
                <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200/80 capitalize">
                        {product.category}
                    </span>
                </div>
            )}

            <div className="flex items-baseline justify-between mt-auto pt-2.5">
                <span className={`font-bold font-tabular text-sm sm:text-base tracking-tight ${
                    isOutOfStock ? 'text-slate-400' : 'text-slate-900 font-black'
                }`}>
                    Rp {Number(product.selling_price).toLocaleString('id-ID')}
                </span>
                {isActive && (
                    <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded shadow-2xs leading-none">
                        ↵ Enter
                    </span>
                )}
            </div>
            
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] mt-1 font-tabular">
                <span className="truncate font-mono text-slate-400">{product.sku}</span>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenQuickStockAdjust?.(product);
                    }}
                    className={`font-semibold px-1.5 py-0.5 rounded transition-colors hover:bg-slate-200/80 cursor-pointer ${
                        Number(product.stock) <= 5
                            ? 'text-amber-700 bg-amber-50/90 font-bold hover:bg-amber-100'
                            : 'text-slate-500 bg-slate-100/80 hover:text-slate-800'
                    }`}
                    title="Koreksi stok fisik / opname cepat"
                >
                    Stok: {product.stock}
                </button>
            </div>
        </button>
    );
}
