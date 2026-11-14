import React from 'react';
import { SlidersHorizontal, AlertTriangle, Coffee, Scale } from 'lucide-react';

export default function RiwayatAdjustmentMetrics({
    adjustments = [],
    currentScope = 'shift',
}) {
    const activeAdjustments = adjustments.filter(a => a.status !== 'VOID');
    const voidCount = adjustments.filter(a => a.status === 'VOID').length;

    const totalCount = activeAdjustments.length;
    const totalDiffQty = activeAdjustments.reduce((sum, a) => sum + Number(a.difference || 0), 0);
    
    // Alokasi Akun 5.1.12 (Beban Selisih / Rusak / Basi)
    const totalBebanRusak = activeAdjustments
        .filter(a => {
            const reason = (a.reason_category || '').toLowerCase();
            return !reason.includes('beban toko') && !reason.includes('dimakan staf') && Number(a.difference || 0) < 0;
        })
        .reduce((sum, a) => sum + Number(a.adjustment_value || 0), 0);

    // Alokasi Akun 5.1.13 (Beban Konsumsi / Toko)
    const totalBebanToko = activeAdjustments
        .filter(a => {
            const reason = (a.reason_category || '').toLowerCase();
            return (reason.includes('beban toko') || reason.includes('dimakan staf')) && Number(a.difference || 0) < 0;
        })
        .reduce((sum, a) => sum + Number(a.adjustment_value || 0), 0);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Total Event Koreksi */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Frekuensi Koreksi</span>
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 font-tabular">
                        {totalCount}
                    </span>
                    {voidCount > 0 && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            {voidCount} VOID
                        </span>
                    )}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {currentScope === 'shift' ? 'Shift berjalan' : 'Semua sesi'}
                </span>
            </div>

            {/* Total Fisik Selisih */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Selisih Fisik</span>
                    <Scale className="w-4 h-4 text-slate-400" />
                </div>
                <div className={`text-xl sm:text-2xl font-black mt-1.5 font-tabular ${
                    totalDiffQty < 0 ? 'text-rose-600' : totalDiffQty > 0 ? 'text-emerald-600' : 'text-slate-900'
                }`}>
                    {totalDiffQty > 0 ? `+${totalDiffQty}` : totalDiffQty} <span className="text-xs font-medium text-slate-400">pcs</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Netto selisih rak vs sistem</span>
            </div>

            {/* Beban Selisih Stok (5.1.12) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Beban Selisih Stok (5.1.12)</span>
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1.5 font-tabular">
                    Rp {totalBebanRusak.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Rusak, basi, atau hilang</span>
            </div>

            {/* Beban Konsumsi Toko (5.1.13) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Beban Toko / Staf (5.1.13)</span>
                    <Coffee className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1.5 font-tabular">
                    Rp {totalBebanToko.toLocaleString('id-ID')}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Konsumsi internal operasional</span>
            </div>
        </div>
    );
}

