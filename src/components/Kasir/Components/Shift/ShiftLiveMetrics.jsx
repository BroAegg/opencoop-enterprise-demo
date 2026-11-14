import React from 'react';
import { Link } from '@inertiajs/react';
import { Wallet, ArrowDownRight, ArrowUpRight, ShoppingBag, Banknote, Users, Eye, EyeOff, LogOut, PlayCircle } from 'lucide-react';

export default function ShiftLiveMetrics({ 
    metrics = {}, 
    shift = {},
    isRevenueVisible = false,
    isSupervisor = false,
    onToggleRevenueVisibility,
    onOpenCloseModal,
    onOpenMovementModal,
}) {
    const openingCash = Number(metrics.opening_cash || shift.opening_cash || 0);
    const totalCashSales = Number(metrics.total_cash_sales || 0);
    const totalCashIn = Number(metrics.total_cash_in || 0);
    const totalCashOut = Number(metrics.total_cash_out || 0);
    const totalCashDrop = Number(metrics.total_cash_drop || 0);
    const estimatedCash = Number(metrics.estimated_cash || (openingCash + totalCashSales + totalCashIn - totalCashOut - totalCashDrop));
    const operators = metrics.operators || [];

    const openedTimeStr = shift.opened_at 
        ? `${new Date(shift.opened_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB • ${new Date(shift.opened_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
        : '-';

    return (
        <div className="space-y-4">
            {/* Unified Shift Hero Control Card (Apple HIG Focus & Prominent Close Action) */}
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-slate-800 shadow-sm">
                {/* Top Row: Shift Status & Quick Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold font-tabular text-white tracking-tight">
                            Shift #{shift.id || '-'}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                            Dibuka oleh <strong className="text-slate-200 font-medium">{shift.user?.name || 'Kasir'}</strong> • {openedTimeStr}
                        </p>
                    </div>

                    {/* Action Group: Primary action (Tutup Shift) prominently styled and instantly scannable */}
                    <div className="flex items-center gap-2 self-stretch sm:self-auto">
                        <button
                            type="button"
                            onClick={onOpenMovementModal}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                            title="Catat Mutasi / Kas Kecil (F6)"
                        >
                            <Wallet className="w-3.5 h-3.5 text-slate-400" />
                            <span>Kas Laci (F6)</span>
                        </button>

                        <Link
                            href="/kasir/pos"
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                            title="Kembali ke Layar Transaksi POS"
                        >
                            <PlayCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Ke POS</span>
                        </Link>

                        <button
                            type="button"
                            onClick={onOpenCloseModal}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-98 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                            title="Tutup Shift Kerja Kasir (F8)"
                        >
                            <LogOut className="w-4 h-4 text-white" />
                            <span>Tutup Shift (F8)</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Row: Drawer Cash & Blind Reconciliation Notice */}
                <div className="pt-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Kas Fisik di Laci
                            </span>
                            <button
                                type="button"
                                onClick={onToggleRevenueVisibility}
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium p-0.5 rounded"
                                title={isRevenueVisible ? 'Sembunyikan Saldo (Sensor)' : 'Buka Sensor Saldo Laci (Otorisasi Supervisor)'}
                                aria-label="Toggle sensor kas laci"
                            >
                                {isRevenueVisible ? (
                                    <>
                                        <EyeOff className="w-3.5 h-3.5" />
                                        <span>Sensor</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Lihat</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black font-tabular tracking-tight text-white">
                            {isRevenueVisible ? (
                                `Rp ${estimatedCash.toLocaleString('id-ID')}`
                            ) : (
                                <span className="font-mono text-xl sm:text-2xl tracking-widest text-slate-400 select-none">Rp ••••••••</span>
                            )}
                        </div>
                    </div>

                    <p className="text-slate-400 text-xs font-medium max-w-md sm:text-right">
                        {isRevenueVisible
                            ? 'Akumulasi saldo fisik laci: modal awal ditambah penjualan tunai dan mutasi kas kecil'
                            : 'Blind reconciliation aktif: hitung fisik uang di laci secara mandiri saat penutupan shift'}
                    </p>
                </div>
            </div>

            {/* Metrics Breakdown Grid (Clean Naked Inline Glyphs) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Modal Awal */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-medium">Modal Awal</span>
                        <Banknote className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                    </div>
                    <div className="mt-2 text-base sm:text-lg font-bold text-slate-900 font-tabular">
                        Rp {openingCash.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">Fisik awal shift</span>
                </div>

                {/* Penjualan Tunai */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-medium">Penjualan Tunai</span>
                        <ShoppingBag className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                    </div>
                    <div className="mt-2 text-base sm:text-lg font-bold text-slate-900 font-tabular">
                        {isRevenueVisible ? (
                            `+Rp ${totalCashSales.toLocaleString('id-ID')}`
                        ) : (
                            <span className="font-mono text-sm sm:text-base tracking-wider text-slate-400 select-none">Rp ••••••••</span>
                        )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">
                        {isRevenueVisible ? 'Kas masuk dari POS' : 'Sensor aktif'}
                    </span>
                </div>

                {/* Kas Injeksi (In) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-medium">Kas Injeksi (In)</span>
                        <ArrowUpRight className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                    </div>
                    <div className="mt-2 text-base sm:text-lg font-bold text-slate-900 font-tabular">
                        +Rp {totalCashIn.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">Tambah modal / receh</span>
                </div>

                {/* Kas Keluar (Out) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-medium">Kas Keluar (Out)</span>
                        <ArrowDownRight className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                    </div>
                    <div className="mt-2 text-base sm:text-lg font-bold text-slate-900 font-tabular">
                        {totalCashOut > 0 ? `-Rp ${totalCashOut.toLocaleString('id-ID')}` : 'Rp 0'}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">Pengeluaran kas kecil</span>
                </div>
            </div>

            {/* Operator Contributions (Shared Drawer) */}
            {operators.length > 0 && (
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Kontribusi Penjualan Operator (Laci Bersama)
                            </h3>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                            {operators.length} Operator Melayani
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {operators.map((op) => (
                            <div key={op.user_id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                                <div>
                                    <span className="font-semibold text-slate-900 text-xs sm:text-sm block">{op.cashier_name}</span>
                                    <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                                        {op.total_transactions} transaksi
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-slate-900 text-xs sm:text-sm font-mono block">
                                        {isRevenueVisible ? `Rp ${Number(op.total_sales_volume).toLocaleString('id-ID')}` : '••••••••'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        Tunai: {isRevenueVisible ? `Rp ${Number(op.cash_volume).toLocaleString('id-ID')}` : '••••••••'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
