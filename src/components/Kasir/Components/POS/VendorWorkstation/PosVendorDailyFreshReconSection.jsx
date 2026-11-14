import React from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import QuantityStepper from '@/Components/UI/QuantityStepper';

export default function PosVendorDailyFreshReconSection({
    unpaidBatch,
    reconItems = [],
    totalHakMitra = 0,
    totalReturPcs = 0,
    isFixedMargin = false,
    marginRate = 20,
    totalOmzet = 0,
    totalMarginKoperasi = 0,
    onRemainingChange,
    onDiscrepancyReasonChange,
    formatRp,
}) {
    if (!unpaidBatch || reconItems.length === 0 || unpaidBatch.settlement_status === 'SETTLED') {
        const isSettled = unpaidBatch?.settlement_status === 'SETTLED';
        return (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                        {isSettled
                            ? `Titipan pada ${unpaidBatch?.received_date_formatted || 'hari ini'} sudah lunas dicairkan.`
                            : 'Seluruh titipan hari/periode sebelumnya sudah lunas diselesaikan.'}
                    </span>
                </div>
                {unpaidBatch?.settlement_number && (
                    <span className="font-mono font-bold text-[11px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                        REF #{unpaidBatch.settlement_number}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <RotateCcw className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            1. Hitung Sisa & Retur Drop Sebelumnya ({unpaidBatch.received_date_formatted || 'Batch Terakhir'})
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            Input fisik sisa di rak untuk menghitung penjualan dan retur
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isFixedMargin && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                            Margin Toko {marginRate}%: {formatRp(totalMarginKoperasi)}
                        </span>
                    )}
                    <span className="text-xs font-mono font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-md shadow-2xs">
                        Hak Setor Mitra: {formatRp(totalHakMitra)}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
                {reconItems.map((it) => (
                    <div key={it.productId} className="p-3 sm:p-3.5 bg-white hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                    {it.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 font-mono mt-0.5">
                                    <span>Drop: <strong className="text-slate-800">{it.received}</strong> pcs</span>
                                    <span>·</span>
                                    <span>Terjual: <strong className="text-slate-900 font-bold">{it.sold}</strong> pcs</span>
                                    <span>·</span>
                                    <span>Harga Jual: {formatRp(it.sellingPrice)}</span>
                                    {isFixedMargin && (
                                        <>
                                            <span>·</span>
                                            <span className="text-emerald-700 font-medium">Laba: {formatRp(it.margin)}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-400 block font-medium">Sisa di Rak / Retur</span>
                                    <QuantityStepper
                                        value={it.remaining}
                                        onChange={(val) => onRemainingChange(it.productId, val)}
                                        min={0}
                                        max={it.received}
                                        size="sm"
                                    />
                                </div>
                                <div className="text-right min-w-[76px]">
                                    <span className="text-[10px] text-slate-400 block font-medium">Hak Mitra</span>
                                    <span className="text-xs font-bold text-slate-900 font-tabular">
                                        {formatRp(it.earned)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Micro-Pill for Unscanned Physical Discrepancy (1-Tap Fast Selection) */}
                        {it.unscannedDiff > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                    <span>Selisih <strong className="text-slate-900">{it.unscannedDiff} pcs</strong> belum ter-scan:</span>
                                </span>
                                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                                    <button
                                        type="button"
                                        onClick={() => onDiscrepancyReasonChange?.(it.productId, 'LUPA_SCAN')}
                                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                            it.discrepancyReason === 'LUPA_SCAN'
                                                ? 'bg-slate-900 text-white shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                        title="Uang tunai ada di laci kasir (penjualan kasir uang pas tanpa scan)"
                                    >
                                        Lupa Scan (Uang di Kasir)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDiscrepancyReasonChange?.(it.productId, 'BEBAN_TOKO')}
                                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                            it.discrepancyReason === 'BEBAN_TOKO'
                                                ? 'bg-slate-900 text-white shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                        title="Dimakan staf / operasional toko (masuk Beban Konsumsi HPP)"
                                    >
                                        Dimakan Staf
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDiscrepancyReasonChange?.(it.productId, 'BARANG_HILANG')}
                                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                            it.discrepancyReason === 'BARANG_HILANG' || it.discrepancyReason === 'SELISIH_RUSAK'
                                                ? 'bg-slate-900 text-white shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                        title="Barang hilang, dicuri, atau rusak di toko (Beban Koperasi & Hak Mitra)"
                                    >
                                        Barang Hilang
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Micro-Pill for Physical Surplus (Shelf > Database) */}
                        {it.surplusDiff > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                    <span>Fisik rak lebih banyak <strong className="text-blue-700">+{it.surplusDiff} pcs</strong> dari sistem:</span>
                                </span>
                                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                                    <button
                                        type="button"
                                        onClick={() => onDiscrepancyReasonChange?.(it.productId, 'OVER_SCAN')}
                                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                            it.discrepancyReason === 'OVER_SCAN'
                                                ? 'bg-slate-900 text-white shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                        title="Kasir kelebihan scan di transaksi pelanggan sebelumnya (uang ada di kasir)"
                                    >
                                        Kelebihan Scan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDiscrepancyReasonChange?.(it.productId, 'DROP_LEBIH')}
                                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                            it.discrepancyReason === 'DROP_LEBIH'
                                                ? 'bg-slate-900 text-white shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                        title="Mitra drop fisik lebih banyak dari nota drop pagi"
                                    >
                                        Mitra Kirim Lebih
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDiscrepancyReasonChange?.(it.productId, 'VARIAN_TUKAR')}
                                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                            it.discrepancyReason === 'VARIAN_TUKAR'
                                                ? 'bg-slate-900 text-white shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                        title="Pelanggan beli varian lain tapi kasir keliru klik produk ini"
                                    >
                                        Salah Varian
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="text-slate-600 font-medium">
                        Sisa fisik <strong className="font-bold text-slate-900">{totalReturPcs} pcs</strong> ditarik retur oleh mitra (Stok rak di-reset ke 0).
                    </span>
                    {isFixedMargin && (
                        <span className="text-[11px] text-slate-600 font-mono">
                            Omzet Retail: <strong className="text-slate-900">{formatRp(totalOmzet)}</strong>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
