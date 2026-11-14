import React from 'react';
import { Check, Printer, ShieldCheck, FileText, Building2 } from 'lucide-react';

export default function SupplierCodSuccessView({
    payoutSuccessData,
    onPrintReceipt,
    onClose,
}) {
    if (!payoutSuccessData) return null;

    const movement = payoutSuccessData.movement || {};
    const amount = Number(payoutSuccessData.amount || movement.amount || 0);
    const supplierName = payoutSuccessData.supplier_name || movement.metadata?.supplier_name || movement.supplier?.name || '-';
    const invoiceNumber = payoutSuccessData.invoice_number || movement.metadata?.invoice_number || movement.invoice_number || '-';
    const authorizedByName = payoutSuccessData.supervisor?.name || movement.metadata?.authorized_by_name || movement.authorized_by?.name || 'Supervisor';
    const description = payoutSuccessData.description || movement.description || '-';
    const voucherRef = movement.id ? `CSH-OUT-#${movement.id}` : 'CSH-OUT-COD';

    const isSwap = amount === 0 || payoutSuccessData.is_pure_swap;

    return (
        <div className="flex flex-col items-center text-center py-2 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                <Check className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 leading-tight">
                {isSwap ? 'Tukar Guling Berhasil Dicatat!' : 'Kas Belanja Toko Berhasil Dikeluarkan!'}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
                {isSwap 
                    ? 'Stok masuk dan barang retur telah disinkronkan. Tidak ada pengeluaran uang laci kasir.'
                    : 'Laci kasir telah dibuka dan pembayaran telah tercatat ke laporan kas shift.'
                }
            </p>

            {/* Voucher Summary Card */}
            <div className="w-full bg-slate-50 rounded-2xl border border-slate-200/80 p-4 mt-4 text-left font-tabular space-y-2.5">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-sans">No. Bukti / Ref:</span>
                    <span className="font-mono font-bold text-slate-900">
                        {voucherRef}
                    </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-sans">Supplier:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{supplierName}</span>
                    </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-sans">No. Faktur:</span>
                    <span className="font-mono font-semibold text-slate-800">
                        {invoiceNumber}
                    </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-sans">Total Tunai:</span>
                    <span className={`font-bold text-base ${isSwap ? 'text-slate-800' : 'text-emerald-600'}`}>
                        {isSwap ? 'Rp 0 (Tukar Guling)' : `Rp ${amount.toLocaleString('id-ID')}`}
                    </span>
                </div>

                {(payoutSuccessData.items || movement.metadata?.items || []).length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Barang Masuk (Stok Bertambah)
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                                Stok Sinkron
                            </span>
                        </div>
                        <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-200/70">
                            {(payoutSuccessData.items || movement.metadata?.items || []).map((it, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs text-slate-700">
                                    <span className="truncate pr-2">• {it.name}</span>
                                    <span className="font-mono font-bold text-slate-900 shrink-0">
                                        +{it.qty} pcs
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(payoutSuccessData.return_items || movement.metadata?.return_items || []).length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                                Barang Retur (Stok Disesuaikan)
                            </span>
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                                Retur Sales
                            </span>
                        </div>
                        <div className="space-y-1 bg-amber-50/50 p-2 rounded-xl border border-amber-200/70">
                            {(payoutSuccessData.return_items || movement.metadata?.return_items || []).map((it, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs text-amber-900">
                                    <span className="truncate pr-2">• {it.name} {it.reason ? `(${it.reason})` : ''}</span>
                                    <span className="font-mono font-bold text-rose-600 shrink-0">
                                        -{it.qty} pcs
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-sans">Otorisasi:</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{authorizedByName}</span>
                    </span>
                </div>
            </div>

            {/* Print & Action Guidance Notice */}
            <p className="text-[11px] text-slate-500 mt-3 text-center leading-tight">
                Cetak bukti 2-ply untuk ditandatangani oleh sales driver dan kasir, lalu staples bersama faktur asli di laci kasir.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full mt-4">
                <button
                    type="button"
                    onClick={() => onPrintReceipt(payoutSuccessData)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                    <Printer className="w-4 h-4 text-slate-300" />
                    <span>Cetak Bukti Kas Laci</span>
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                    <span>Selesai</span>
                </button>
            </div>
        </div>
    );
}
