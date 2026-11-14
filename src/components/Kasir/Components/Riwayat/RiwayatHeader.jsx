import React from 'react';
import { ReceiptText, Search, X, Lock } from 'lucide-react';
import { formatTime } from '@/Utils/format';

export default function RiwayatHeader({
    activeShift = null,
    currentScope = 'shift',
    onScopeChange,
    search = '',
    onSearchChange,
    onSearchSubmit,
    isSupervisor = false,
    onRequestSupervisorScopeAuth,
}) {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <ReceiptText className="w-5 h-5 text-slate-500" strokeWidth={1.75} />
                    Riwayat Penjualan POS
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {activeShift && currentScope === 'shift'
                        ? `Shift #${activeShift.id} dibuka: ${formatTime(activeShift.opened_at)} (SOP Kasir Aktif)`
                        : 'Semua riwayat toko (Akses Manajerial)'}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                {/* Scope Switcher Tabs */}
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600 self-start sm:self-auto">
                    {activeShift && (
                        <button
                            type="button"
                            onClick={() => onScopeChange('shift')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                currentScope === 'shift'
                                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                    : 'hover:text-slate-900 text-slate-500'
                            }`}
                        >
                            Shift #{activeShift.id}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            if (currentScope === 'all') return;
                            if (isSupervisor) {
                                onScopeChange('all');
                            } else {
                                onRequestSupervisorScopeAuth?.();
                            }
                        }}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                            currentScope === 'all'
                                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                : 'hover:text-slate-900 text-slate-500'
                        }`}
                        title={!isSupervisor ? "Memerlukan otorisasi PIN Supervisor untuk melihat data lintas shift" : "Lihat semua riwayat toko"}
                    >
                        <span>Semua Riwayat</span>
                        {!isSupervisor && currentScope !== 'all' && (
                            <Lock className="w-3 h-3 text-slate-400" />
                        )}
                    </button>
                </div>

                {/* Search Input Form */}
                <form onSubmit={onSearchSubmit} className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari nama produk / faktur / member..."
                        className="w-full bg-white pl-10 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 outline-none shadow-2xs"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                            title="Bersihkan filter"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
