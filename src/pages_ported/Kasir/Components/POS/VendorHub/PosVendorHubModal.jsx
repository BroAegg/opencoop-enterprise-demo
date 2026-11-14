import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Store,
    ArrowLeft,
} from 'lucide-react';
import usePosVendorHub from './usePosVendorHub';
import PosVendorDirectorySidebar from './PosVendorDirectorySidebar';
import PosVendorRitualTabs from './PosVendorRitualTabs';
import PosVendorDropPagiTab from './Tabs/PosVendorDropPagiTab';
import PosVendorReturSoreTab from './Tabs/PosVendorReturSoreTab';
import PosVendorBeliPutusTab from './Tabs/PosVendorBeliPutusTab';
import PosVendorInfoRiwayatTab from './Tabs/PosVendorInfoRiwayatTab';
import EmptyState from '@/Components/UI/EmptyState';

/**
 * PosVendorHubModal
 * 
 * POS Kasir Vendor Hub (F9).
 * Master-detail split pane matching the quiet, high-contrast visual grammar
 * of PosPaymentModal. Modularized orchestrator shell.
 */
export default function PosVendorHubModal({
    isOpen = false,
    onClose,
    onSuccess,
}) {
    const hub = usePosVendorHub({
        isOpen,
        onClose,
        onSuccess,
    });

    const {
        activeTab,
        setActiveTab,
        selectedVendorId,
        setSelectedVendorId,
        selectedVendor,
        isSubmitting,
    } = hub;

    // Keyboard shortcuts: F1 (Drop Pagi), F2 (Retur & Bayar), F3 (Katalog)
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                setActiveTab('DROP_PAGI');
            } else if (e.key === 'F2') {
                e.preventDefault();
                setActiveTab('RETUR_SORE');
            } else if (e.key === 'F3') {
                e.preventDefault();
                setActiveTab('DIREKTORI');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, setActiveTab]);

    if (!isOpen) return null;

    const formatRp = (num) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num || 0);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 15 }}
                    className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] sm:max-h-[88vh] md:h-[640px] border border-slate-200"
                >
                    {/* LEFT PANE: VENDOR MASTER DIRECTORY */}
                    <PosVendorDirectorySidebar
                        {...hub}
                        vendors={hub.suppliers}
                        onSelectVendor={setSelectedVendorId}
                        formatRp={formatRp}
                        isMobileDetailOpen={Boolean(selectedVendorId)}
                    />

                    {/* RIGHT PANE: DETAIL WORK AREA & ACTIONS */}
                    <div
                        className={`flex-1 min-w-0 p-4 sm:p-6 bg-white flex-col justify-between overflow-y-auto custom-scrollbar ${
                            !selectedVendorId ? 'hidden md:flex' : 'flex'
                        }`}
                    >
                        {/* Mobile Back Button & Context Bar */}
                        <div className="md:hidden flex items-center justify-between pb-3 mb-2 border-b border-slate-100 shrink-0 gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedVendorId(null)}
                                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 transition-colors shrink-0"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Kembali</span>
                            </button>
                            {selectedVendor && (
                                <div className="min-w-0 text-center flex-1 px-1">
                                    <h4 className="text-xs font-bold text-slate-900 truncate">
                                        {selectedVendor.name}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-mono truncate">
                                        {selectedVendor.code || `#${selectedVendor.id}`}
                                    </p>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Top Bar on Desktop: Ritual Switcher & Close Button */}
                        <PosVendorRitualTabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            selectedVendor={selectedVendor}
                            onClose={onClose}
                            isSubmitting={isSubmitting}
                            isAllShelf={hub.isAllShelf}
                        />

                        {selectedVendor ? (
                            <div className="flex-1 flex flex-col justify-between min-h-0">
                                {/* TAB 1: DROP PAGI / RESTOCK COD */}
                                {activeTab === 'DROP_PAGI' && (
                                    selectedVendor.partnership_type === 'BELI_PUTUS' ? (
                                        <PosVendorBeliPutusTab
                                            {...hub}
                                            selectedVendor={selectedVendor}
                                            formatRp={formatRp}
                                        />
                                    ) : selectedVendor.partnership_type === 'TOP' ? (
                                        <EmptyState
                                            icon={Store}
                                            title="Khusus Mitra Konsinyasi & Beli Putus"
                                            description={`Supplier ${selectedVendor.name} bermitra secara Tempo (TOP). Penerimaan barang dilakukan melalui modul Pengadaan (PO) gudang, bukan kasir.`}
                                            className="flex-1 justify-center py-16"
                                        />
                                    ) : (
                                        <PosVendorDropPagiTab
                                            {...hub}
                                            onSwitchToRetur={(batchId) => {
                                                hub.setSelectedBatchId(batchId);
                                                hub.setActiveTab('RETUR_SORE');
                                            }}
                                            formatRp={formatRp}
                                        />
                                    )
                                )}

                                {/* TAB 2: RETUR & BAYAR */}
                                {activeTab === 'RETUR_SORE' && (
                                    selectedVendor.partnership_type === 'BELI_PUTUS' ? (
                                        <PosVendorBeliPutusTab
                                            {...hub}
                                            selectedVendor={selectedVendor}
                                            formatRp={formatRp}
                                        />
                                    ) : selectedVendor.partnership_type === 'TOP' ? (
                                        <EmptyState
                                            icon={Store}
                                            title="Khusus Mitra Konsinyasi"
                                            description={`Supplier ${selectedVendor.name} bermitra secara Tempo (TOP). Pembayaran faktur dikelola oleh modul Accounting / Kantor, bukan pencairan kas laci kasir.`}
                                            className="flex-1 justify-center py-16"
                                        />
                                    ) : (
                                        <PosVendorReturSoreTab
                                            {...hub}
                                            formatRp={formatRp}
                                        />
                                    )
                                )}

                                {/* TAB 3: INFO & RIWAYAT */}
                                {activeTab === 'DIREKTORI' && (
                                    <PosVendorInfoRiwayatTab
                                        {...hub}
                                        onClose={onClose}
                                        setActiveTab={setActiveTab}
                                        onNavigateToWorksheet={(batchId) => {
                                            if (batchId && typeof hub?.setSelectedBatchId === 'function') {
                                                hub.setSelectedBatchId(batchId);
                                            }
                                            setActiveTab('RETUR_SORE');
                                        }}
                                        formatRp={formatRp}
                                    />
                                )}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Store}
                                title="Pilih supplier dari daftar kiri"
                                description="Klik salah satu supplier untuk membuka alur Drop Pagi, Retur & Bayar, atau Info."
                                className="flex-1 justify-center py-16"
                            />
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

