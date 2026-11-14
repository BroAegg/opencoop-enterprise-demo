import React from 'react';
import { Utensils, Package } from 'lucide-react';

/**
 * PosVendorScopeSelector
 * 
 * Apple HIG tactile segmented scope control for vendors with mixed categories.
 * Allows filtering between fresh perishable goods and shelf goods.
 */
export default function PosVendorScopeSelector({
    activeProductScope = 'ALL',
    onSelectScope,
}) {
    return (
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl shrink-0">
            <button
                type="button"
                onClick={() => onSelectScope('ALL')}
                className={`flex-1 py-1 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeProductScope === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                }`}
            >
                Semua
            </button>
            <button
                type="button"
                onClick={() => onSelectScope('PERISHABLE')}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeProductScope === 'PERISHABLE'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                }`}
            >
                <Utensils className="w-3.5 h-3.5" />
                <span>Harian (Basah)</span>
            </button>
            <button
                type="button"
                onClick={() => onSelectScope('SHELF')}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeProductScope === 'SHELF'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                }`}
            >
                <Package className="w-3.5 h-3.5" />
                <span>Berkala</span>
            </button>
        </div>
    );
}

