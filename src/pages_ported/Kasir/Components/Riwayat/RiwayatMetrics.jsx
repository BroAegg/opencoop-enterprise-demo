import React from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';

export default function RiwayatMetrics({
    trxCount = 0,
    totalItemsSold = 0,
    totalSales = 0,
    voidCount = 0,
    isRevenueVisible = false,
    isSupervisor = false,
    onToggleRevenueVisibility,
    currentScope = 'shift',
    search = '',
    searchStats = null,
    matchCount = 0,
    onGlobalSearch,
    onClearSearch,
}) {
    const q = search.trim();

    return (
        <div className="space-y-4">
            {/* KPI Cards: Clean 4-Column Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Transaksi */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-500">Total Transaksi</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 font-tabular">
                        {trxCount}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {currentScope === 'shift' ? 'Shift berjalan' : '100 transaksi terakhir'}
                    </span>
                </div>

                {/* Item Terjual */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-500">Item Terjual</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 font-tabular">
                        {totalItemsSold}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Volume produk discan</span>
                </div>

                {/* Dibatalkan (VOID) */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <span className="text-xs font-medium text-slate-500">Dibatalkan (VOID)</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 font-tabular">
                        {voidCount}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {voidCount > 0 ? 'Dikeluarkan dari omzet' : 'Nol pembatalan'}
                    </span>
                </div>

                {/* Omzet Berhasil (Privacy Masked by Default for Cashiers) */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Omzet Berhasil</span>
                        <button
                            type="button"
                            onClick={onToggleRevenueVisibility}
                            className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 -mr-0.5 rounded cursor-pointer"
                            title={isRevenueVisible ? 'Sembunyikan Omzet (Sensor)' : 'Buka Sensor Omzet (Otorisasi Supervisor)'}
                            aria-label="Toggle sensor omzet"
                        >
                            {isRevenueVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 font-tabular">
                        {isRevenueVisible ? (
                            `Rp ${totalSales.toLocaleString('id-ID')}`
                        ) : (
                            <span className="font-mono text-base sm:text-lg tracking-widest text-slate-400 select-none">Rp ••••••••</span>
                        )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {isRevenueVisible ? 'Transaksi valid' : isSupervisor ? 'Klik sensor untuk melihat' : 'Perlu PIN Supervisor'}
                    </span>
                </div>
            </div>

            {/* Search Match Feedback Banner */}
            {q && (
                <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400">Filter pencarian:</span>
                                <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                                    "{q}"
                                </span>
                                <span className="font-bold text-slate-200">
                                    ({matchCount} transaksi cocok)
                                </span>
                            </div>
                            {searchStats?.totalQty > 0 && (
                                <p className="text-[11px] text-slate-300 mt-0.5">
                                    Total <strong className="text-white font-tabular">{searchStats.totalQty} pcs</strong> terjual di transaksi ini
                                    {searchStats.totalRevenue > 0 && (
                                        <> • Subtotal <strong className="text-white font-tabular font-mono">{isRevenueVisible ? `Rp ${searchStats.totalRevenue.toLocaleString('id-ID')}` : 'Rp ••••••••'}</strong></>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                            type="button"
                            onClick={onGlobalSearch}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                            title="Cari di seluruh database transaksi"
                        >
                            Cari di Semua Riwayat
                        </button>
                        <button
                            type="button"
                            onClick={onClearSearch}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

