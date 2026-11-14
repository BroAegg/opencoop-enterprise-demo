import React, { useState, useMemo, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import KasirLayout from '@/Layouts/KasirLayout';
import { toast } from '@/Components/UI/Toast';

import RiwayatHeader from './Components/Riwayat/RiwayatHeader';
import RiwayatMetrics from './Components/Riwayat/RiwayatMetrics';
import RiwayatTable from './Components/Riwayat/RiwayatTable';
import RiwayatAdjustmentMetrics from './Components/Riwayat/RiwayatAdjustmentMetrics';
import RiwayatAdjustmentTable from './Components/Riwayat/RiwayatAdjustmentTable';
import TransactionDetailModal from './Components/Riwayat/TransactionDetailModal';
import PosSupervisorAuthModal from './Components/POS/PosSupervisorAuthModal';
import PosVoidAdjustmentModal from './Components/Riwayat/PosVoidAdjustmentModal';
import useRiwayatVoidAndReceipt from './Components/Riwayat/useRiwayatVoidAndReceipt';

export default function Riwayat({ 
    transactions = [], 
    stockAdjustments = [],
    activeShift = null,
    currentScope = 'shift',
    initialSearch = '',
}) {
    const { coop, auth } = usePage().props;
    const isSupervisor = Boolean(auth?.user?.role === 'PENGURUS' || auth?.user?.role === 'STAF' || auth?.user?.role === 'ADMIN');
    const [activeTab, setActiveTab] = useState('SALES');
    const [isRevenueVisible, setIsRevenueVisible] = useState(isSupervisor);
    const [isRevenueAuthOpen, setIsRevenueAuthOpen] = useState(false);
    const [isSupervisorScopeAuthOpen, setIsSupervisorScopeAuthOpen] = useState(false);
    const [trxList, setTrxList] = useState(transactions);
    const [adjList, setAdjList] = useState(stockAdjustments);
    const [search, setSearch] = useState(initialSearch || '');
    const [isVoidAdjModalOpen, setIsVoidAdjModalOpen] = useState(false);
    const [voidAdjCandidate, setVoidAdjCandidate] = useState(null);

    useEffect(() => {
        setTrxList(transactions);
    }, [transactions]);

    useEffect(() => {
        setAdjList(stockAdjustments);
    }, [stockAdjustments]);

    const handlePromptVoidAdjustment = (adj) => {
        setVoidAdjCandidate(adj);
        setIsVoidAdjModalOpen(true);
    };

    const handleVoidAdjSuccess = (updatedAdj) => {
        if (!updatedAdj) return;
        setAdjList(prev => prev.map(a => a.id === updatedAdj.id ? updatedAdj : a));
    };

    const {
        selectedTrx,
        setSelectedTrx,
        isDetailOpen,
        setIsDetailOpen,
        isVoidAuthOpen,
        setIsVoidAuthOpen,
        voidCandidate,
        handlePrintReceipt,
        handlePromptVoid,
        handleAuthorizedVoid,
        handleSwitchPaymentMethod,
    } = useRiwayatVoidAndReceipt({ trxList, setTrxList, coop });

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return trxList;

        return trxList.filter(t => {
            const matchInvoice = t.invoice_number?.toLowerCase().includes(q);
            const matchMember = t.member?.name?.toLowerCase().includes(q);
            const matchPayment = t.payment_method?.toLowerCase().includes(q);
            const matchItem = t.items?.some(item => 
                item.product_name?.toLowerCase().includes(q)
            );

            return matchInvoice || matchMember || matchPayment || matchItem;
        });
    }, [trxList, search]);

    const searchStats = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return null;

        let totalQty = 0;
        let totalRevenue = 0;
        filtered.forEach(t => {
            (t.items || []).forEach(item => {
                if (item.product_name?.toLowerCase().includes(q)) {
                    totalQty += Number(item.qty || 0);
                    totalRevenue += Number(item.subtotal || 0);
                }
            });
        });

        return { totalQty, totalRevenue };
    }, [filtered, search]);

    const totalSales = trxList
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
    const voidCount = trxList.filter(t => t.status === 'VOID').length;

    const totalItemsSold = useMemo(() => {
        return trxList
            .filter(t => t.status === 'COMPLETED')
            .reduce((sum, t) => sum + (t.items || []).reduce((itemSum, item) => itemSum + Number(item.qty || 0), 0), 0);
    }, [trxList]);

    const handleToggleRevenue = () => {
        if (isSupervisor) {
            setIsRevenueVisible(prev => !prev);
        } else if (!isRevenueVisible) {
            setIsRevenueAuthOpen(true);
        } else {
            setIsRevenueVisible(false);
        }
    };

    const handleScopeChange = (newScope) => {
        router.get(
            '/kasir/riwayat',
            { scope: newScope, search: search.trim() },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleAuthorizedScope = () => {
        setIsSupervisorScopeAuthOpen(false);
        toast.success('Otorisasi supervisor berhasil. Membuka semua riwayat toko.');
        handleScopeChange('all');
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        const q = search.trim();
        if (q) {
            router.get(
                '/kasir/riwayat',
                { search: q, scope: isSupervisor ? 'all' : currentScope },
                { preserveState: true, preserveScroll: true }
            );
        }
    };

    return (
        <KasirLayout pageTitle="Riwayat Transaksi">
            <Head title="Riwayat Transaksi Shift" />

            <div className="max-w-6xl mx-auto space-y-5 pb-10">
                <RiwayatHeader
                    activeShift={activeShift}
                    currentScope={currentScope}
                    onScopeChange={handleScopeChange}
                    search={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={handleSearchSubmit}
                    isSupervisor={isSupervisor}
                    onRequestSupervisorScopeAuth={() => setIsSupervisorScopeAuthOpen(true)}
                />

                {/* Segmented Tab Switcher (Apple HIG) */}
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('SALES')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'SALES'
                                ? 'bg-slate-900 text-white shadow-2xs'
                                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                        }`}
                    >
                        <span>Penjualan Kasir</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-tabular ${
                            activeTab === 'SALES' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {trxList.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('ADJUSTMENTS')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'ADJUSTMENTS'
                                ? 'bg-slate-900 text-white shadow-2xs'
                                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                        }`}
                    >
                        <span>Koreksi Stok & Selisih</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-tabular font-bold ${
                            adjList.length > 0
                                ? (activeTab === 'ADJUSTMENTS' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700')
                                : (activeTab === 'ADJUSTMENTS' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')
                        }`}>
                            {adjList.length}
                        </span>
                    </button>
                </div>

                {activeTab === 'SALES' ? (
                    <>
                        <RiwayatMetrics
                            trxCount={trxList.length}
                            totalItemsSold={totalItemsSold}
                            totalSales={totalSales}
                            voidCount={voidCount}
                            isRevenueVisible={isRevenueVisible}
                            isSupervisor={isSupervisor}
                            onToggleRevenueVisibility={handleToggleRevenue}
                            currentScope={currentScope}
                            search={search}
                            searchStats={searchStats}
                            matchCount={filtered.length}
                            onGlobalSearch={handleSearchSubmit}
                            onClearSearch={() => setSearch('')}
                        />

                        <RiwayatTable
                            transactions={filtered}
                            onSelectTransaction={(t) => { setSelectedTrx(t); setIsDetailOpen(true); }}
                            onPrintReceipt={handlePrintReceipt}
                            onPromptVoid={handlePromptVoid}
                            searchTerm={search}
                            onSelectProduct={(name) => setSearch(name)}
                        />
                    </>
                ) : (
                    <>
                        <RiwayatAdjustmentMetrics
                            adjustments={adjList}
                            currentScope={currentScope}
                        />

                        <RiwayatAdjustmentTable
                            adjustments={adjList}
                            searchTerm={search}
                            onPromptVoid={handlePromptVoidAdjustment}
                        />
                    </>
                )}
            </div>

            <PosVoidAdjustmentModal
                isOpen={isVoidAdjModalOpen}
                onClose={() => {
                    setIsVoidAdjModalOpen(false);
                    setVoidAdjCandidate(null);
                }}
                adjustment={voidAdjCandidate}
                onSuccess={handleVoidAdjSuccess}
            />

            <TransactionDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                transaction={selectedTrx}
                onPrintReceipt={handlePrintReceipt}
                onOpenVoidModal={(trx) => handlePromptVoid(trx)}
                onSwitchPaymentMethod={handleSwitchPaymentMethod}
                activeShift={activeShift}
                highlightQuery={search}
            />

            <PosSupervisorAuthModal
                isOpen={isVoidAuthOpen}
                onClose={() => setIsVoidAuthOpen(false)}
                onAuthorized={handleAuthorizedVoid}
                actionTitle="Otorisasi VOID Transaksi"
                actionDescription={`Batalkan transaksi ${voidCandidate?.invoice_number} senilai Rp ${Number(voidCandidate?.total_amount || 0).toLocaleString('id-ID')}. Memerlukan persetujuan PIN Supervisor.`}
            />

            <PosSupervisorAuthModal
                isOpen={isRevenueAuthOpen}
                onClose={() => setIsRevenueAuthOpen(false)}
                onAuthorized={() => {
                    setIsRevenueVisible(true);
                    toast.success('Otorisasi supervisor berhasil. Sensor omzet dibuka.');
                }}
                actionTitle="Otorisasi Akses Omzet Toko"
                actionDescription="Data omzet harian merupakan informasi manajerial rahasia. Masukkan PIN Supervisor untuk membuka sensor omzet."
            />

            <PosSupervisorAuthModal
                isOpen={isSupervisorScopeAuthOpen}
                onClose={() => setIsSupervisorScopeAuthOpen(false)}
                onAuthorized={handleAuthorizedScope}
                actionTitle="Otorisasi Akses Riwayat Toko"
                actionDescription="Melihat rekap transaksi dan penyesuaian stok lintas shift/hari memerlukan persetujuan PIN Supervisor."
            />
        </KasirLayout>
    );
}

