import React, { useState } from 'react';
import { ArrowLeft, Store, History, FileText } from 'lucide-react';
import PosVendorDailyFreshSheet from './PosVendorDailyFreshSheet';
import PosVendorPeriodicShelfSheet from './PosVendorPeriodicShelfSheet';
import PosVendorBeliPutusSheet from './PosVendorBeliPutusSheet';
import PosVendorInfoRiwayatTab from '../VendorHub/Tabs/PosVendorInfoRiwayatTab';
import EmptyState from '@/Components/UI/EmptyState';

/**
 * PosVendorWorksheetPanel
 * 
 * Right column of Dual-Workspace POS (Vendor Mode).
 * Automatically adapts to the partner's exact retail domain:
 * 1. Konsinyasi Harian (Fresh / Basah) -> PosVendorDailyFreshSheet
 * 2. Konsinyasi Berkala (Shelf / Kemasan) -> PosVendorPeriodicShelfSheet
 * 3. Beli Putus (COD) -> PosVendorBeliPutusSheet
 * 4. Riwayat Transaksi -> PosVendorInfoRiwayatTab
 */
export default function PosVendorWorksheetPanel({
    hub,
    formatRp,
    onDeselectVendor,
}) {
    const {
        selectedVendor,
        vendorProducts,
        vendorBatches,
        availableCash,
        refreshShift,
        fetchConsignmentData,
        isLoadingBatches = false,
    } = hub;

    const [subTab, setSubTab] = useState('WORKSHEET'); // 'WORKSHEET' | 'HISTORY'

    const isBeliPutus = selectedVendor?.partnership_type === 'BELI_PUTUS';
    const isDailyFresh = !isBeliPutus && (selectedVendor?.requires_evening_reconciliation ?? true);
    const isPeriodicShelf = !isBeliPutus && !(selectedVendor?.requires_evening_reconciliation ?? true);

    const isFixedMargin = Boolean(selectedVendor?.has_fixed_margin || Number(selectedVendor?.consignment_margin_rate) > 0);
    const fixedRate = Number(selectedVendor?.consignment_margin_rate || 0);

    const getPartnershipBadge = () => {
        if (isBeliPutus) return { label: 'BELI PUTUS (COD)', bg: 'bg-amber-600 text-white' };
        if (isFixedMargin) return { label: `KONSINYASI (MARGIN ${fixedRate}%)`, bg: 'bg-indigo-600 text-white' };
        if (isDailyFresh) return { label: 'KONSINYASI HARIAN', bg: 'bg-emerald-600 text-white' };
        return { label: 'KONSINYASI BERKALA', bg: 'bg-blue-600 text-white' };
    };

    const badge = selectedVendor ? getPartnershipBadge() : null;

    return (
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 overflow-hidden font-sans min-w-0">
            {/* Top Bar: Vendor Info + Mode Switcher + Close Vendor */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100 gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    {selectedVendor && onDeselectVendor && (
                        <button
                            type="button"
                            onClick={onDeselectVendor}
                            className="p-2 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
                            title="Tutup lembar kerja mitra ini (kembali ke kosong)"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Tutup</span>
                        </button>
                    )}

                    {selectedVendor ? (
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                    {selectedVendor.name}
                                </h3>
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-md ${badge?.bg}`}>
                                    {badge?.label}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                                {selectedVendor.code || `#${selectedVendor.id}`} · {selectedVendor.phone || 'Tanpa No. HP'}
                            </p>
                        </div>
                    ) : (
                        <h3 className="text-sm font-bold text-slate-700">Pilih Mitra Vendor</h3>
                    )}
                </div>

                {/* Sub-navigation: Lembar Kerja vs Riwayat */}
                {selectedVendor && (
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                        <button
                            type="button"
                            onClick={() => setSubTab('WORKSHEET')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                subTab === 'WORKSHEET'
                                    ? 'bg-white text-slate-900 shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Lembar Kerja</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSubTab('HISTORY')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                subTab === 'HISTORY'
                                    ? 'bg-white text-slate-900 shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <History className="w-3.5 h-3.5" />
                            <span>Riwayat</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Main Worksheet Body */}
            {selectedVendor ? (
                <div className="flex-1 flex flex-col justify-between min-h-0">
                    {isLoadingBatches ? (
                        <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full py-4 px-2 space-y-4 animate-pulse">
                            <div className="text-center space-y-2 mb-2">
                                <div className="h-4 bg-slate-200 rounded w-48 mx-auto" />
                                <div className="h-3 bg-slate-100 rounded w-64 mx-auto" />
                            </div>
                            <div className="space-y-3">
                                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/70 h-20" />
                                <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/70 h-20" />
                            </div>
                        </div>
                    ) : subTab === 'HISTORY' ? (
                        <PosVendorInfoRiwayatTab
                            {...hub}
                            onClose={onDeselectVendor}
                            onNavigateToWorksheet={(batchId) => {
                                if (batchId && typeof hub?.setSelectedBatchId === 'function') {
                                    hub.setSelectedBatchId(batchId);
                                }
                                setSubTab('WORKSHEET');
                            }}
                            setActiveTab={() => setSubTab('WORKSHEET')}
                            formatRp={formatRp}
                        />
                    ) : isBeliPutus ? (
                        <PosVendorBeliPutusSheet
                            selectedVendor={selectedVendor}
                            vendorProducts={vendorProducts}
                            availableCash={availableCash}
                            formatRp={formatRp}
                            onSuccess={() => fetchConsignmentData(true)}
                            fetchConsignmentData={fetchConsignmentData}
                            refreshShift={refreshShift}
                        />
                    ) : isDailyFresh ? (
                        <PosVendorDailyFreshSheet
                            selectedVendor={selectedVendor}
                            vendorProducts={vendorProducts}
                            vendorBatches={vendorBatches}
                            availableCash={availableCash}
                            formatRp={formatRp}
                            onSuccess={() => fetchConsignmentData(true)}
                            fetchConsignmentData={fetchConsignmentData}
                            refreshShift={refreshShift}
                        />
                    ) : (
                        <PosVendorPeriodicShelfSheet
                            selectedVendor={selectedVendor}
                            vendorProducts={vendorProducts}
                            vendorBatches={vendorBatches}
                            availableCash={availableCash}
                            formatRp={formatRp}
                            onSuccess={() => fetchConsignmentData(true)}
                            fetchConsignmentData={fetchConsignmentData}
                            refreshShift={refreshShift}
                        />
                    )}
                </div>
            ) : (
                <EmptyState
                    icon={Store}
                    title="Pilih Mitra Vendor"
                    description="Pilih salah satu mitra di daftar kiri untuk mulai penerimaan titipan atau pelunasan tagihan."
                    className="flex-1 justify-center py-20"
                />
            )}
        </div>
    );
}

