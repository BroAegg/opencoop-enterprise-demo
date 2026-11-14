import React, { useMemo } from 'react';
import {
    Phone,
    History,
    Package,
    ChevronRight,
} from 'lucide-react';
import EmptyState from '@/Components/UI/EmptyState';

/**
 * PosVendorInfoRiwayatTab
 * 
 * Ritual 3: Supplier profile overview, 14-day receiving batch timeline,
 * settlement status verification, and registered product catalog.
 */
export default function PosVendorInfoRiwayatTab({
    selectedVendor,
    vendorBatches = [],
    vendorProducts = [],
    activeBatch = null,
    isBankTransfer = false,
    setSelectedBatchId,
    setActiveTab,
    onNavigateToWorksheet,
    onClose,
    formatRp,
}) {
    const safeFormatRp = typeof formatRp === 'function'
        ? formatRp
        : (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

    const handleBatchAction = (batchId) => {
        if (typeof setSelectedBatchId === 'function') {
            setSelectedBatchId(batchId);
        }
        if (typeof onNavigateToWorksheet === 'function') {
            onNavigateToWorksheet(batchId);
        } else if (typeof setActiveTab === 'function') {
            setActiveTab('RETUR_SORE');
        }
    };
    const groupedBatches = useMemo(() => {
        const groups = [];
        const dateMap = new Map();

        (vendorBatches || []).forEach((b) => {
            const dateKey = b.received_date || 'Lainnya';
            if (!dateMap.has(dateKey)) {
                const entry = {
                    dateKey,
                    dateFormatted: b.received_date_formatted || dateKey,
                    isToday: Boolean(b.is_active_today),
                    isSettled: true,
                    totalEarned: 0,
                    totalReceived: 0,
                    totalSold: 0,
                    totalRemaining: 0,
                    primaryReceivingId: b.receiving_id,
                    batches: [],
                };
                dateMap.set(dateKey, entry);
                groups.push(entry);
            }
            const grp = dateMap.get(dateKey);
            grp.batches.push(b);
            grp.totalEarned += Number(b.total_earned || 0);
            grp.totalReceived += Number(b.total_received || 0);
            grp.totalSold += Number(b.total_sold || 0);
            grp.totalRemaining += Number(b.total_remaining || 0);
            if (b.settlement_status !== 'SETTLED') {
                grp.isSettled = false;
            }
        });

        return groups;
    }, [vendorBatches]);

    if (!selectedVendor) return null;

    return (
        <div className="flex-1 flex flex-col justify-between min-h-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 mb-4 space-y-4">
                {/* Supplier Detail Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">WhatsApp:</span>
                        {selectedVendor.phone || selectedVendor.phone_wa ? (
                            <a
                                href={`https://wa.me/${(selectedVendor.phone_wa || selectedVendor.phone).replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-slate-900 hover:underline flex items-center gap-1"
                            >
                                <Phone className="w-3.5 h-3.5 text-slate-600" />
                                <span>{selectedVendor.phone_wa || selectedVendor.phone}</span>
                            </a>
                        ) : (
                            <span className="text-slate-400">-</span>
                        )}
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Bentuk Kemitraan:</span>
                        <span className="font-bold text-slate-900">
                            {selectedVendor.partnership_type === 'KONSINYASI'
                                ? (selectedVendor.is_shelf_only ? 'Konsinyasi Berkala (Rak)' : 'Konsinyasi Harian (Fresh)')
                                : (selectedVendor.payment_term === 'TOP' || selectedVendor.partnership_type === 'TOP' ? 'Beli Tempo (TOP)' : 'Beli Putus (COD)')}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Metode Pembayaran:</span>
                        <span className="font-bold text-slate-900">
                            {selectedVendor.partnership_type !== 'KONSINYASI'
                                ? 'Faktur Pembelian (AP) · Kantor'
                                : (isBankTransfer ? 'Transfer Bank' : 'Kas Laci Kasir')}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Rekening Bank:</span>
                        <span className="font-mono font-bold text-slate-900">
                            {selectedVendor.bank_name
                                ? `${selectedVendor.bank_name} ${selectedVendor.bank_account_number || ''}${selectedVendor.bank_account_holder ? ` (a.n. ${selectedVendor.bank_account_holder})` : ''}`
                                : 'Belum diatur'}
                        </span>
                    </div>

                    {selectedVendor.partnership_type === 'KONSINYASI' && (
                        <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                            <span className="text-slate-500 font-medium">Hak Mitra Belum Cair:</span>
                            <span className={`font-mono font-bold text-xs ${
                                Number(selectedVendor.unsettled_balance || 0) > 0 ? 'text-rose-700' : 'text-slate-700'
                            }`}>
                                {safeFormatRp(selectedVendor.unsettled_balance || 0)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Riwayat Pengiriman & Batch Timeline */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5 text-slate-600" />
                            <span>Riwayat Pengiriman & Batch ({vendorBatches.length})</span>
                        </h4>
                        <span className="text-[11px] text-slate-400">14 hari terakhir</span>
                    </div>

                    {groupedBatches.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                            Belum ada riwayat batch penerimaan untuk supplier ini.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {groupedBatches.map((grp) => {
                                const isSelected = activeBatch && grp.batches.some(b => b.receiving_id === activeBatch.receiving_id);
                                return (
                                    <div
                                        key={grp.dateKey}
                                        className={`p-3 rounded-2xl border transition-all ${
                                            isSelected
                                                ? 'border-slate-900 bg-slate-50/70 shadow-2xs'
                                                : 'border-slate-200/90 bg-white hover:bg-slate-50/40'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-slate-900">
                                                    {grp.dateFormatted}
                                                </span>
                                                {grp.batches.length > 1 && (
                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                                        {grp.batches.length} drop
                                                    </span>
                                                )}
                                                {grp.isToday && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
                                                        HARI INI
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-2xs ${
                                                grp.isSettled
                                                    ? 'bg-slate-700 text-white'
                                                    : 'bg-rose-600 text-white'
                                            }`}>
                                                {grp.isSettled ? 'LUNAS' : 'BELUM DICAIRKAN'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 text-center py-1.5 px-2 bg-slate-50/80 rounded-xl border border-slate-100 text-[11px] mb-2">
                                            <div>
                                                <span className="text-slate-400 block text-[10px]">Titip</span>
                                                <strong className="text-slate-800 font-mono">{grp.totalReceived} pcs</strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[10px]">Laku</span>
                                                <strong className="text-slate-900 font-mono">{grp.totalSold} pcs</strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[10px]">Sisa</span>
                                                <strong className="text-slate-700 font-mono">{grp.totalRemaining} pcs</strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[10px]">Hak Mitra</span>
                                                <strong className="text-slate-900 font-mono font-bold">{safeFormatRp(grp.totalEarned)}</strong>
                                            </div>
                                        </div>

                                        {/* Drop details list with product name */}
                                        <div className="space-y-1 pt-1.5 pb-0.5 border-t border-slate-100 text-[11px]">
                                            {grp.batches.map(b => {
                                                const prodName = b.items?.[0]?.product_name;
                                                return (
                                                    <div key={b.receiving_id} className="flex items-center justify-between text-slate-500 font-mono py-0.5 px-1">
                                                        <span className="truncate pr-2">
                                                            {b.receiving_number}
                                                            {prodName ? ` · ${prodName}` : ''}
                                                            {' '}({b.total_received} pcs)
                                                        </span>
                                                        <span className="font-semibold text-slate-700 shrink-0">{safeFormatRp(b.total_earned)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {!grp.isSettled && (
                                            <div className="mt-2 flex justify-end pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleBatchAction(grp.primaryReceivingId)}
                                                    className="text-[11px] font-bold text-slate-800 hover:text-slate-950 flex items-center gap-1 hover:underline cursor-pointer"
                                                >
                                                    <span>Rekonsiliasi / Bayar ({safeFormatRp(grp.totalEarned)})</span>
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Catalog Table */}
                <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-slate-600" />
                        <span>Daftar Menu Terdaftar ({vendorProducts.length})</span>
                    </h4>

                    {vendorProducts.length === 0 ? (
                        <EmptyState
                            icon={Package}
                            title="Belum ada menu"
                            description="Supplier ini belum memiliki menu terdaftar."
                            className="py-8"
                        />
                    ) : (
                        <div className="space-y-1.5">
                            {vendorProducts.map((p) => (
                                <div
                                    key={p.id}
                                    className="p-2.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between text-xs"
                                >
                                    <div>
                                        <strong className="text-slate-900 block">{p.name}</strong>
                                        <span className="text-[11px] text-slate-400 font-mono">
                                            Beli: {safeFormatRp(p.cost_price)} · Jual: {safeFormatRp(p.selling_price)}
                                        </span>
                                    </div>
                                    <span className="font-mono font-bold text-xs text-slate-700 px-2 py-0.5 rounded-md bg-slate-100">
                                        {p.stock ?? 0} pcs
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={() => {
                    if (typeof onClose === 'function') onClose();
                }}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
                Selesai (Esc)
            </button>
        </div>
    );
}

