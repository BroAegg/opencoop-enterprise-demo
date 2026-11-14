import React from 'react';
import { Check, Printer } from 'lucide-react';

export default function SupplierPayoutSuccessView({
    payoutSuccessData,
    onPrintReceipt,
    onClose,
}) {
    if (!payoutSuccessData) return null;

    return (
        <div className="flex flex-col items-center text-center py-2 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                <Check className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Pembayaran Berhasil!</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
                Bagi hasil tunai telah dicatat ke laporan shift kasir.
            </p>

            {/* Receipt Summary Card */}
            <div className="w-full bg-slate-50 rounded-2xl border border-slate-200/80 p-4 mt-4 text-left font-tabular space-y-2.5">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-sans">No. Bukti:</span>
                    <span className="font-mono font-bold text-slate-900">
                        {payoutSuccessData.settlement?.settlement_number}
                    </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-sans">Penerima:</span>
                    <span className="font-bold text-slate-800">
                        {payoutSuccessData.supplier?.name}
                    </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-sans">Total Dicairkan:</span>
                    <span className="font-bold text-emerald-600 text-sm">
                        Rp {Number(payoutSuccessData.amount || 0).toLocaleString('id-ID')}
                    </span>
                </div>

                {payoutSuccessData.returned_items?.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 text-xs">
                        <span className="text-slate-500 font-sans block mb-1">Retur Fisik Sisa Rak:</span>
                        <div className="bg-white rounded-xl p-2 border border-slate-200 space-y-1">
                            {payoutSuccessData.returned_items.map((r, idx) => (
                                <div key={idx} className="flex justify-between text-[11px]">
                                    <span className="text-slate-700">{r.name}</span>
                                    <span className="font-bold text-slate-900">{r.qty_returned} pcs</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full mt-4">
                <button
                    type="button"
                    onClick={() => onPrintReceipt(payoutSuccessData)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                    <Printer className="w-4 h-4 text-slate-300" />
                    <span>Cetak Struk Bukti</span>
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                    <span>Tutup</span>
                </button>
            </div>
        </div>
    );
}
