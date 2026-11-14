import React, { useMemo } from 'react';
import { Store, RefreshCw, Coins } from 'lucide-react';
import SearchInput from '@/Components/UI/SearchInput';
import SegmentedControl from '@/Components/UI/SegmentedControl';
import EmptyState from '@/Components/UI/EmptyState';

/**
 * PosVendorDirectorySidebar
 * 
 * Clean, high-contrast master panel for Vendor Directory (F9).
 * Reuses Manasuka global UI design system components:
 * - SearchInput (standardized search ergonomics)
 * - SegmentedControl (Apple HIG platter tabs)
 * - EmptyState (Apple HIG ContentUnavailableView)
 */
export default function PosVendorDirectorySidebar({
    vendorSearch = '',
    setVendorSearch,
    vendorFilter = 'ALL',
    setVendorFilter,
    vendors = [],
    filteredVendors = [],
    selectedVendorId = null,
    onSelectVendor,
    refreshSuppliers,
    refreshShift,
    isLoading = false,
    isSubmitting = false,
    availableCash = 0,
    formatRp,
    isMobileDetailOpen = false,
}) {
    // Filter counts (Apple Mail HIG: All vs Unsettled)
    const counts = useMemo(() => {
        let unsettled = 0;
        vendors.forEach((v) => {
            if (Number(v.unsettled_balance || 0) > 0) unsettled++;
        });
        return { unsettled };
    }, [vendors]);

    // Keyboard navigation (Spotlight speed: ArrowUp / ArrowDown / Enter)
    const handleSearchKeyDown = (e) => {
        if (!filteredVendors || filteredVendors.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const currentIndex = filteredVendors.findIndex((v) => v.id === selectedVendorId);
            const nextIndex = currentIndex < filteredVendors.length - 1 ? currentIndex + 1 : 0;
            onSelectVendor?.(filteredVendors[nextIndex].id);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const currentIndex = filteredVendors.findIndex((v) => v.id === selectedVendorId);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredVendors.length - 1;
            onSelectVendor?.(filteredVendors[prevIndex].id);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredVendors.length > 0) {
                const currentIndex = filteredVendors.findIndex((v) => v.id === selectedVendorId);
                const targetVendor = currentIndex >= 0 ? filteredVendors[currentIndex] : filteredVendors[0];
                onSelectVendor?.(targetVendor.id);
            }
        }
    };

    return (
        <div
            className={`w-full md:w-80 lg:w-92 bg-slate-50/90 p-4 sm:p-5 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden min-h-0 shrink-0 ${
                isMobileDetailOpen ? 'hidden md:flex' : 'flex'
            }`}
        >
            {/* 1. Header Strip */}
            <div className="flex justify-between items-center mb-3.5 shrink-0">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Vendor & Titipan
                        </h2>
                        <kbd className="text-[10px] font-mono text-slate-500 font-bold bg-slate-200/80 px-1.5 py-0.5 rounded-md">
                            F9
                        </kbd>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Kelola titipan konsinyasi & supplier toko
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        refreshSuppliers?.();
                        refreshShift?.();
                    }}
                    disabled={isLoading || isSubmitting}
                    className="w-9 h-9 bg-white rounded-xl shadow-2xs hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors border border-slate-200 cursor-pointer flex items-center justify-center shrink-0"
                    title="Muat ulang data"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* 2. Global SearchInput Component */}
            <SearchInput
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                onClear={() => setVendorSearch('')}
                onKeyDown={handleSearchKeyDown}
                placeholder="Cari vendor, menu, PIC, COD/beli putus..."
                size="sm"
                className="w-full mb-2.5 shrink-0"
            />

            {/* 3. Global SegmentedControl Component (Apple Mail HIG: All vs Unsettled) */}
            <SegmentedControl
                value={vendorFilter}
                onChange={setVendorFilter}
                size="sm"
                className="mb-3 shrink-0"
                options={[
                    { id: 'ALL', label: 'Semua', count: vendors.length },
                    { id: 'UNSETTLED', label: 'Belum Lunas', count: counts.unsettled },
                ]}
            />

            {/* 4. Scrollable Vendor Cards List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-0.5 min-h-0">
                {filteredVendors.length === 0 ? (
                    <EmptyState
                        icon={Store}
                        title="Tidak ada supplier"
                        description="Coba kata kunci pencarian lain atau ubah filter kategori"
                        className="py-12"
                    />
                ) : (
                    filteredVendors.map((vendor) => {
                        const isSelected = vendor.id === selectedVendorId;
                        const isBankTransfer = vendor.payout_method === 'BANK_TRANSFER';
                        const isMember = vendor.is_member || vendor.segment === 'ANGGOTA';

                        let subtitle = 'Titipan Konsinyasi';
                        if (vendor._matchedReason) {
                            subtitle = vendor._matchedReason;
                        } else if (vendor.payment_term === 'TOP' || vendor.is_top || vendor.partnership_type === 'TOP') {
                            subtitle = 'Tempo (TOP)';
                        } else if (vendor.partnership_type === 'BELI_PUTUS') {
                            subtitle = 'Beli Putus (COD)';
                        } else if (vendor.is_shelf_only ?? !vendor.requires_evening_reconciliation) {
                            subtitle = 'Konsinyasi · Berkala';
                        } else {
                            subtitle = 'Konsinyasi · Harian';
                        }
                        if (isMember && !vendor._matchedReason) {
                            subtitle += ' · Anggota';
                        }

                        return (
                            <button
                                key={vendor.id}
                                type="button"
                                onClick={() => onSelectVendor(vendor.id)}
                                className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                    isSelected
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                        : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-xs font-bold truncate ${
                                            isSelected ? 'text-white' : 'text-slate-900'
                                        }`}>
                                            {vendor.name}
                                        </span>
                                    </div>
                                    <p className={`text-[11px] truncate mt-0.5 ${
                                        isSelected ? 'text-slate-300' : 'text-slate-500'
                                    }`}>
                                        {subtitle}
                                    </p>
                                </div>

                                <div className="text-right shrink-0 flex flex-col items-end">
                                    {Number(vendor.unsettled_balance || 0) > 0 ? (
                                        <>
                                            <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg border tabular-nums transition-colors ${
                                                isSelected
                                                    ? 'bg-white text-slate-900 border-white shadow-2xs'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200/90'
                                            }`}>
                                                {formatRp ? formatRp(vendor.unsettled_balance) : `Rp ${Number(vendor.unsettled_balance).toLocaleString('id-ID')}`}
                                            </span>
                                            <span className={`text-[10px] font-mono mt-0.5 ${
                                                isSelected ? 'text-slate-300' : 'text-slate-400'
                                            }`}>
                                                {vendor.shelf_stock_count ?? 0} pcs stok toko
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className={`font-mono text-[11px] font-bold ${
                                                isSelected ? 'text-slate-200' : 'text-slate-700'
                                            }`}>
                                                {vendor.shelf_stock_count ?? 0} pcs
                                            </span>
                                            <span className={`text-[9.5px] font-mono ${
                                                isSelected ? 'text-slate-400' : 'text-slate-400'
                                            }`}>
                                                {vendor.code || `#${vendor.id}`}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* 5. Bottom Drawer Cash Indicator Strip */}
            <div className="pt-3 mt-auto border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <span className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kas Laci:</span>
                </span>
                <strong className="font-mono text-slate-800 font-bold">
                    {formatRp ? formatRp(availableCash) : `Rp ${Number(availableCash || 0).toLocaleString('id-ID')}`}
                </strong>
            </div>
        </div>
    );
}

