import React from 'react';
import { formatTime } from '@/Utils/format';
import { AlertTriangle, Coffee, RotateCcw, Check, Sparkles, Ban } from 'lucide-react';

export default function RiwayatAdjustmentTable({
    adjustments = [],
    searchTerm = '',
    onPromptVoid = null,
}) {
    const q = searchTerm.trim().toLowerCase();

    const filtered = adjustments.filter(adj => {
        if (!q) return true;
        const matchProduct = adj.product?.name?.toLowerCase().includes(q) || adj.product?.sku?.toLowerCase().includes(q);
        const matchSession = adj.session?.session_number?.toLowerCase().includes(q);
        const matchReason = adj.reason_category?.toLowerCase().includes(q);
        const matchNotes = adj.notes?.toLowerCase().includes(q);
        const matchVoid = adj.void_reason?.toLowerCase().includes(q);
        return matchProduct || matchSession || matchReason || matchNotes || matchVoid;
    });

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="p-3.5 sm:p-4">Waktu</th>
                            <th className="p-3.5 sm:p-4">No. Sesi / Ref</th>
                            <th className="p-3.5 sm:p-4 min-w-[200px]">Produk</th>
                            <th className="p-3.5 sm:p-4">Perubahan Stok</th>
                            <th className="p-3.5 sm:p-4">Alokasi Akuntansi</th>
                            <th className="p-3.5 sm:p-4 text-right">Nilai Selisih</th>
                            <th className="p-3.5 sm:p-4">Kasir / Staf</th>
                            <th className="p-3.5 sm:p-4">Catatan</th>
                            <th className="p-3.5 sm:p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="p-8 text-center text-slate-400">
                                    Tidak ada data koreksi stok atau selisih persediaan pada periode ini.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((adj) => {
                                const diff = Number(adj.difference || 0);
                                const isDeficit = diff < 0;
                                const isSurplus = diff > 0;
                                const reason = (adj.reason_category || '').toLowerCase();
                                const isBebanToko = reason.includes('beban toko') || reason.includes('dimakan staf');
                                const isRusak = reason.includes('rusak') || reason.includes('basi') || reason.includes('hilang');
                                const isVoid = Boolean(adj.status === 'VOID');

                                return (
                                    <tr 
                                        key={adj.id} 
                                        className={`transition-colors ${
                                            isVoid 
                                                ? 'bg-rose-50/20 hover:bg-rose-50/40 opacity-80' 
                                                : 'hover:bg-slate-50/70'
                                        }`}
                                    >
                                        <td className="p-3.5 sm:p-4 text-slate-500 font-tabular whitespace-nowrap">
                                            {formatTime(adj.created_at, true)}
                                        </td>
                                        <td className="p-3.5 sm:p-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                                            {adj.session?.session_number || `SO-#${adj.session_id}`}
                                        </td>
                                        <td className="p-3.5 sm:p-4">
                                            <div className="flex flex-col">
                                                <span className={`font-bold leading-tight ${isVoid ? 'text-slate-500' : 'text-slate-900'}`}>
                                                    {adj.product?.name || 'Produk Dihapus'}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-mono">
                                                    <span>{adj.product?.sku || '-'}</span>
                                                    {adj.product?.category && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="capitalize">{adj.product.category}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3.5 sm:p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {isVoid ? (
                                                    <span className="px-2 py-0.5 rounded-md font-black font-tabular text-[11px] bg-slate-100 text-slate-400 border border-slate-200 line-through">
                                                        {diff > 0 ? `+${diff}` : diff} {adj.product?.unit || 'pcs'}
                                                    </span>
                                                ) : (
                                                    <span className={`px-2 py-0.5 rounded-md font-black font-tabular text-[11px] ${
                                                        isDeficit 
                                                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                                            : isSurplus
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                                                    }`}>
                                                        {diff > 0 ? `+${diff}` : diff} {adj.product?.unit || 'pcs'}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-400 font-tabular">
                                                    (Rak: {adj.physical_stock} / Sys: {adj.system_stock})
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3.5 sm:p-4 whitespace-nowrap">
                                            {isBebanToko ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <Coffee className="w-3 h-3" />
                                                    Beban Toko (5.1.13)
                                                </span>
                                            ) : isRusak ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Selisih Rusak/Basi (5.1.12)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                    <RotateCcw className="w-3 h-3" />
                                                    Selisih Fisik (5.1.12)
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3.5 sm:p-4 text-right font-bold font-tabular text-xs whitespace-nowrap">
                                            <span className={isVoid ? 'text-slate-400 line-through' : 'text-slate-900'}>
                                                Rp {Number(adj.adjustment_value || 0).toLocaleString('id-ID')}
                                            </span>
                                        </td>
                                        <td className="p-3.5 sm:p-4 whitespace-nowrap text-slate-600">
                                            {adj.user?.name || 'Kasir'}
                                        </td>
                                        <td className="p-3.5 sm:p-4 text-slate-500 text-[11px] max-w-xs">
                                            <div className="truncate">
                                                {adj.notes || <span className="italic text-slate-400">-</span>}
                                            </div>
                                            {isVoid && (
                                                <div className="mt-0.5 text-[10px] text-rose-700 font-semibold flex items-center gap-1">
                                                    <Ban className="w-2.5 h-2.5 shrink-0" />
                                                    <span>VOID: {adj.void_reason || 'Dibatalkan'}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3.5 sm:p-4 text-center whitespace-nowrap">
                                            {isVoid ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 uppercase font-mono">
                                                    BATAL
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => onPromptVoid && onPromptVoid(adj)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 transition-all cursor-pointer active:scale-95 shadow-2xs"
                                                    title="Batalkan koreksi fisik produk ini (VOID)"
                                                >
                                                    <Ban className="w-3 h-3" />
                                                    <span>Void</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

