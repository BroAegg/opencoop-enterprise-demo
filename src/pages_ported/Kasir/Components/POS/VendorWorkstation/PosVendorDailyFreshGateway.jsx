import React from 'react';
import { ArrowRight, Package, Coins } from 'lucide-react';

/**
 * PosVendorDailyFreshGateway
 * 
 * 2-Intent Selection Gateway for Fresh & Bakery Consignment:
 * 1. SETTLE_ONLY: Pelunasan & Tarik Retur
 * 2. DROP_ONLY: Input Drop Baru Saja
 */
export default function PosVendorDailyFreshGateway({
    selectedVendor,
    vendorProducts = [],
    hasPayable = false,
    totalHakMitra = 0,
    unpaidCount = 0,
    formatRp,
    onSelectAction,
}) {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col justify-center max-w-xl mx-auto w-full py-4 space-y-4">
            <div className="text-center space-y-1 mb-1">
                <h3 className="text-base font-bold text-slate-950">
                    Pilih Keperluan Titipan Harian
                </h3>
                <p className="text-xs text-slate-500">
                    Tentukan transaksi untuk <strong>{selectedVendor?.name}</strong> hari ini:
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {/* Option 1: Terima Titipan Baru */}
                <button
                    type="button"
                    onClick={() => onSelectAction('DROP_ONLY')}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-900 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 text-left shadow-2xs group"
                >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors">
                        <Package className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0 flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                            Terima Titipan Baru
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded bg-slate-100 text-slate-700">
                            {vendorProducts.length} Produk di Katalog
                        </span>
                    </div>

                    <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 group-hover:translate-x-0.5 group-hover:text-slate-700 transition-all" />
                </button>

                {/* Option 2: Pencairan Penjualan & Retur */}
                <button
                    type="button"
                    onClick={() => onSelectAction('SETTLE_ONLY')}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-900 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 text-left shadow-2xs group"
                >
                    <div className="relative w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors">
                        <Coins className="w-6 h-6" />
                        {hasPayable && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600 ring-2 ring-white" />
                            </span>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                            Pencairan Penjualan & Retur
                        </span>
                        {hasPayable ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-rose-600 text-white font-mono shadow-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                ADA TAGIHAN: {formatRp(totalHakMitra)} {unpaidCount > 1 ? `(${unpaidCount} Hari)` : ''}
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-500 font-mono">
                                SEMUA LUNAS
                            </span>
                        )}
                    </div>

                    <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 group-hover:translate-x-0.5 group-hover:text-slate-700 transition-all" />
                </button>
            </div>
        </div>
    );
}

