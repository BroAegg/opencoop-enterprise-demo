import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function QuickAdjustStockStepper({
    systemStock,
    physicalStock,
    unit = 'pcs',
    onChangePhysicalStock,
    onStep,
}) {
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200 text-center">
                    <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider mb-1">
                        Stok Database
                    </span>
                    <span className="text-2xl font-black text-slate-700 font-tabular">
                        {systemStock} <span className="text-xs font-medium text-slate-400">{unit}</span>
                    </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-900 text-center shadow-xs">
                    <span className="text-[11px] font-bold text-slate-900 block uppercase tracking-wider mb-1">
                        Fisik di Rak
                    </span>
                    <div className="flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => onStep(-1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                            title="Kurangi 1"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                            type="number"
                            min="0"
                            value={physicalStock}
                            onChange={(e) => onChangePhysicalStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="w-16 text-center text-xl font-black text-slate-900 font-tabular p-0 border-none focus:ring-0"
                        />
                        <button
                            type="button"
                            onClick={() => onStep(1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                            title="Tambah 1"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs gap-1.5 select-none">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onStep(-5)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
                    >
                        -5
                    </button>
                    <button
                        type="button"
                        onClick={() => onStep(5)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
                    >
                        +5
                    </button>
                </div>
                <button
                    type="button"
                    onClick={() => onChangePhysicalStock(0)}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
                >
                    Setel 0 (Habis)
                </button>
            </div>
        </div>
    );
}
