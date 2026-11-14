import React from 'react';
import { Eye, Printer, Ban } from 'lucide-react';
import { formatTime } from '@/Utils/format';

function highlightMatch(text, query) {
    if (!query || !text) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return text;
    const idx = lowerText.indexOf(lowerQuery);
    if (idx === -1) return text;

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + lowerQuery.length);
    const after = text.slice(idx + lowerQuery.length);

    return (
        <>
            {before}
            <mark className="bg-amber-300 text-slate-950 font-bold px-0.5 rounded-xs">
                {match}
            </mark>
            {after}
        </>
    );
}

export default function RiwayatTable({
    transactions = [],
    onSelectTransaction,
    onPrintReceipt,
    onPromptVoid,
    searchTerm = '',
    onSelectProduct = null,
}) {
    const q = searchTerm.trim().toLowerCase();

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="p-3.5 sm:p-4">Waktu</th>
                            <th className="p-3.5 sm:p-4">No. Faktur</th>
                            <th className="p-3.5 sm:p-4">Member</th>
                            <th className="p-3.5 sm:p-4 min-w-[220px]">Produk Terjual</th>
                            <th className="p-3.5 sm:p-4">Metode</th>
                            <th className="p-3.5 sm:p-4 text-right">Total Tagihan</th>
                            <th className="p-3.5 sm:p-4 text-center">Status</th>
                            <th className="p-3.5 sm:p-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-slate-400">
                                    Tidak ada transaksi yang cocok.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((t) => {
                                const isVoid = t.status === 'VOID';
                                const items = t.items || [];
                                const matchingItems = q ? items.filter(i => i.product_name?.toLowerCase().includes(q)) : [];
                                const otherItems = q ? items.filter(i => !i.product_name?.toLowerCase().includes(q)) : items;

                                return (
                                    <tr 
                                        key={t.id} 
                                        onClick={() => onSelectTransaction(t)}
                                        className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${isVoid ? 'bg-rose-50/20' : ''}`}
                                    >
                                        <td className="p-3.5 sm:p-4 text-slate-500 font-tabular whitespace-nowrap">
                                            {formatTime(t.created_at, true)}
                                        </td>
                                        <td className="p-3.5 sm:p-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                                            {t.invoice_number}
                                        </td>
                                        <td className="p-3.5 sm:p-4 whitespace-nowrap">
                                            {t.member ? (
                                                <span className="font-semibold text-slate-900">{t.member.name}</span>
                                            ) : (
                                                <span className="text-slate-400">Umum</span>
                                            )}
                                        </td>
                                        <td className="p-3.5 sm:p-4">
                                            {items.length === 0 ? (
                                                <span className="text-slate-400 italic text-[11px]">-</span>
                                            ) : q && matchingItems.length > 0 ? (
                                                <div className="flex flex-col gap-1 max-w-[280px]">
                                                    <div className="flex flex-wrap gap-1">
                                                        {matchingItems.map((item, idx) => (
                                                            <span
                                                                key={idx}
                                                                onClick={(e) => {
                                                                    if (onSelectProduct) {
                                                                        e.stopPropagation();
                                                                        onSelectProduct(item.product_name);
                                                                    }
                                                                }}
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 text-white font-medium text-[11px] shadow-2xs hover:bg-slate-800 transition-colors"
                                                                title={`Klik untuk filter produk: ${item.product_name}`}
                                                            >
                                                                <span className="font-bold text-amber-300 font-tabular">{item.qty}×</span>
                                                                <span className="truncate max-w-[180px]">
                                                                    {highlightMatch(item.product_name, q)}
                                                                </span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {otherItems.length > 0 && (
                                                        <span 
                                                            className="text-[10px] text-slate-400 truncate"
                                                            title={otherItems.map(i => `${i.qty}× ${i.product_name}`).join(', ')}
                                                        >
                                                            +{otherItems.length} lainnya ({otherItems.slice(0, 2).map(i => `${i.qty}× ${i.product_name}`).join(', ')}{otherItems.length > 2 ? '...' : ''})
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-0.5 max-w-[280px]">
                                                    {items.slice(0, 2).map((item, idx) => (
                                                        <div 
                                                            key={idx}
                                                            onClick={(e) => {
                                                                if (onSelectProduct) {
                                                                    e.stopPropagation();
                                                                    onSelectProduct(item.product_name);
                                                                }
                                                            }}
                                                            className="flex items-center gap-1.5 text-slate-800 text-[11px] hover:text-slate-950 transition-colors cursor-pointer group"
                                                            title={`Klik untuk cari produk: ${item.product_name}`}
                                                        >
                                                            <span className="font-semibold text-slate-500 font-tabular shrink-0">{item.qty}×</span>
                                                            <span className="truncate group-hover:underline">
                                                                {item.product_name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {items.length > 2 && (
                                                        <span 
                                                            className="text-[10px] text-slate-400 font-medium truncate mt-0.5"
                                                            title={items.slice(2).map(i => `${i.qty}× ${i.product_name}`).join(', ')}
                                                        >
                                                            +{items.length - 2} item lainnya ({items.reduce((sum, i) => sum + Number(i.qty || 0), 0)} total pcs)
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3.5 sm:p-4 whitespace-nowrap">
                                            <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
                                                {t.payment_method}
                                            </span>
                                        </td>
                                        <td className={`p-3.5 sm:p-4 text-right font-bold font-tabular text-sm whitespace-nowrap ${isVoid ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                            Rp {Number(t.total_amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="p-3.5 sm:p-4 text-center whitespace-nowrap">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                                isVoid 
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200/80' 
                                                    : 'bg-slate-50 text-slate-700 border-slate-200/80'
                                            }`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="p-3.5 sm:p-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    onClick={() => onSelectTransaction(t)}
                                                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                                                    title="Lihat Detail Transaksi"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => onPrintReceipt(t)}
                                                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                                                    title="Cetak Ulang Struk (ESC/POS)"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>

                                                {!isVoid && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onPromptVoid(t)}
                                                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all cursor-pointer"
                                                        title="Batalkan Transaksi (VOID)"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
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

