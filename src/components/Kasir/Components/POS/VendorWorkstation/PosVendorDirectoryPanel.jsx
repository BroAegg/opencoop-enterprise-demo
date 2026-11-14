import React, { useState, useMemo } from 'react';
import { Search, Store, X, AlertCircle, ArrowLeft } from 'lucide-react';
import Skeleton from '@/Components/UI/Skeleton';

/**
 * PosVendorDirectoryPanel
 * 
 * Left column of Dual-Workspace POS (Vendor Mode).
 * Mirrors PosProductSearchGrid's visual hierarchy with quiet Scandinavian clarity.
 * Provides fast vendor lookup, clean domain filters (Harian vs Berkala vs COD),
 * and live debt status glance.
 */
export default function PosVendorDirectoryPanel({
    suppliers = [],
    selectedVendorId,
    onSelectVendor,
    formatRp,
    isLoading = false,
    onBackToSales,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'HARIAN' | 'BERKALA' | 'COD'

    const filteredSuppliers = useMemo(() => {
        let list = suppliers;

        // 1. Category Domain Filter
        if (activeFilter === 'PENDING') {
            list = list.filter((s) => Number(s.unsettled_balance || 0) > 0);
        } else if (activeFilter === 'HARIAN') {
            list = list.filter((s) => (s.requires_evening_reconciliation ?? true) && s.partnership_type === 'KONSINYASI');
        } else if (activeFilter === 'BERKALA') {
            list = list.filter((s) => !(s.requires_evening_reconciliation ?? true) && s.partnership_type === 'KONSINYASI');
        } else if (activeFilter === 'COD') {
            list = list.filter((s) => s.partnership_type === 'BELI_PUTUS' && s.payment_term !== 'TOP');
        }

        // 2. Query Search
        const q = searchQuery.trim().toLowerCase();
        if (!q) return list;

        return list.filter((s) => {
            const nameMatch = (s.name || '').toLowerCase().includes(q);
            const companyMatch = (s.company_name || '').toLowerCase().includes(q);
            const ownerMatch = (s.owner_name || '').toLowerCase().includes(q);
            const codeMatch = (s.code || '').toLowerCase().includes(q);
            const phoneMatch = (s.phone || '').toLowerCase().includes(q);
            const productMatch = (s.products || []).some((p) => (p.name || '').toLowerCase().includes(q));
            return nameMatch || companyMatch || ownerMatch || codeMatch || phoneMatch || productMatch;
        });
    }, [suppliers, activeFilter, searchQuery]);

    const pendingDebtCount = useMemo(() => {
        return suppliers.filter((s) => Number(s.unsettled_balance || 0) > 0).length;
    }, [suppliers]);

    const getPartnershipLabel = (sup) => {
        if (sup.payment_term === 'TOP' || sup.is_top || sup.partnership_type === 'TOP') return 'Tempo (TOP)';
        if (sup.partnership_type === 'BELI_PUTUS') return 'Beli Putus (COD)';
        if (sup.requires_evening_reconciliation ?? true) return 'Konsinyasi Harian (Fresh)';
        return 'Konsinyasi Berkala (Rak)';
    };

    return (
        <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col gap-2.5 sm:gap-3 shrink-0 overflow-hidden font-sans">
            {/* Top Search Bar & Kasir Exit Button */}
            <div className="flex items-center gap-2 shrink-0">
                {onBackToSales && (
                    <button
                        type="button"
                        onClick={onBackToSales}
                        className="h-12 sm:h-13 px-3 sm:px-3.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80 rounded-2xl flex items-center gap-1.5 sm:gap-2 font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
                        title="Kembali ke Penjualan Kasir (Tekan F1 atau Esc)"
                    >
                        <ArrowLeft className="w-4 h-4 text-slate-500" />
                        <span className="hidden sm:inline">Kasir</span>
                        <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] font-mono text-slate-500 bg-slate-100 rounded border border-slate-200">F1</kbd>
                    </button>
                )}

                <div className="flex-1 bg-white p-1.5 sm:p-2 rounded-2xl shadow-2xs border border-slate-200/80 flex items-center h-12 sm:h-13">
                    <div className="flex-1 h-full relative flex items-center">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari mitra vendor..."
                            className="w-full h-full bg-slate-50 border-none rounded-xl pl-10 pr-9 text-xs sm:text-sm font-medium shadow-inner focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all outline-none"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Track (Apple Inset Segmented Control) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto no-scrollbar shrink-0">
                {[
                    { key: 'ALL', label: 'Semua' },
                    { key: 'PENDING', label: 'Ada Tagihan', count: pendingDebtCount },
                    { key: 'HARIAN', label: 'Konsinyasi Harian' },
                    { key: 'BERKALA', label: 'Konsinyasi Berkala' },
                    { key: 'COD', label: 'Beli Putus' },
                ].map((f) => {
                    const isActive = activeFilter === f.key;
                    const hasCount = f.count !== undefined && f.count > 0;

                    return (
                        <button
                            key={f.key}
                            type="button"
                            onClick={() => setActiveFilter(f.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                                isActive
                                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                        >
                            <span>{f.label}</span>
                            {hasCount && (
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold transition-colors ${
                                        isActive
                                            ? 'bg-rose-600 text-white'
                                            : 'bg-rose-100/90 text-rose-700'
                                    }`}
                                >
                                    {f.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Vendor Cards List */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-2 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 min-h-0">
                {isLoading ? (
                    <Skeleton.List count={6} />
                ) : filteredSuppliers.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-xs">
                        Tidak ada mitra vendor yang cocok.
                    </div>
                ) : (
                    filteredSuppliers.map((sup) => {
                        const isSelected = selectedVendorId === sup.id;
                        const unpaidDebt = Number(sup.unsettled_balance || 0);

                        return (
                            <div
                                key={sup.id}
                                onClick={() => onSelectVendor(sup.id)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                    isSelected
                                        ? 'border-slate-900 bg-slate-50/90 ring-1 ring-slate-900/10 shadow-2xs'
                                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 truncate">
                                                {sup.name}
                                            </h4>
                                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                                {sup.code || `#${sup.id}`}
                                            </span>
                                            {Boolean(sup.has_fixed_margin || Number(sup.consignment_margin_rate) > 0) && (
                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 shrink-0">
                                                    Margin {Number(sup.consignment_margin_rate)}%
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                            {getPartnershipLabel(sup)}
                                            {sup.phone ? ` · ${sup.phone}` : ''}
                                        </p>
                                    </div>

                                    {/* Unsettled debt badge */}
                                    {unpaidDebt > 0 && (
                                        <span className="shrink-0 px-2.5 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-bold font-tabular shadow-2xs">
                                            {formatRp(unpaidDebt)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
