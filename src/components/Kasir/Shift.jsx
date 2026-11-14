import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import KasirLayout from '@/Layouts/KasirLayout';
import { Loader2, QrCode } from 'lucide-react';
import axios from 'axios';
import { toast } from '@/Components/UI/Toast';
import { playScanSound } from '@/Utils/barcodeScanner';

import ShiftOpenWorkstation from './Components/Shift/ShiftOpenWorkstation';
import ShiftLiveMetrics from './Components/Shift/ShiftLiveMetrics';
import ShiftMovementsHistory from './Components/Shift/ShiftMovementsHistory';
import ShiftCloseModal from './Components/Shift/ShiftCloseModal';
import PosCashMovementModal from './Components/POS/PosCashMovementModal';
import PosSupervisorAuthModal from './Components/POS/PosSupervisorAuthModal';

export default function Shift() {
    const { auth, coop } = usePage().props;
    const isSupervisor = Boolean(auth?.user?.role === 'PENGURUS' || auth?.user?.role === 'STAF' || auth?.user?.role === 'ADMIN');
    const [isRevenueVisible, setIsRevenueVisible] = useState(isSupervisor);
    const [isSupervisorAuthOpen, setIsSupervisorAuthOpen] = useState(false);
    const [shift, setShift] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Open Shift Error
    const [openError, setOpenError] = useState('');
    
    // Modals
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [closeError, setCloseError] = useState('');

    useEffect(() => {
        fetchCurrentShift();
    }, []);

    // Ergonomic Shortcuts: F6 for Kas Laci, F8 for Tutup Shift
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F6') {
                e.preventDefault();
                setIsMovementModalOpen(true);
            } else if (e.key === 'F8') {
                e.preventDefault();
                setIsCloseModalOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const fetchCurrentShift = async () => {
        try {
            const response = await axios.get('/kasir/api/shift/current');
            setShift(response.data.shift);
            setMetrics(response.data.metrics);
        } catch (error) {
            console.error('Failed to fetch shift status', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenShift = async (numericCashValue) => {
        const cashValue = typeof numericCashValue === 'number' ? numericCashValue : parseInt(String(numericCashValue).replace(/\D/g, ''), 10);
        if (isNaN(cashValue) || cashValue < 0) {
            setOpenError('Masukkan modal awal yang valid (minimal Rp 0).');
            return;
        }

        setIsSubmitting(true);
        setOpenError('');
        try {
            await axios.post('/kasir/api/shift/open', { opening_cash: cashValue });
            playScanSound('multiplier');
            toast.success('Shift kasir berhasil dibuka! Mengalihkan ke POS...');
            setTimeout(() => {
                router.visit('/kasir/pos');
            }, 600);
        } catch (error) {
            setOpenError(error.response?.data?.message || 'Gagal membuka shift');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseShift = async (closePayload) => {
        setIsSubmitting(true);
        setCloseError('');
        try {
            const res = await axios.post('/kasir/api/shift/close', closePayload);
            playScanSound('checkout');
            toast.success(res.data?.message || 'Shift berhasil ditutup. Mengalihkan keluar...');
            setIsCloseModalOpen(false);
            
            // Log out user cleanly
            setTimeout(() => {
                router.post('/logout');
            }, 800);
        } catch (error) {
            playScanSound('error');
            setCloseError(error.response?.data?.message || 'Gagal menutup shift.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleRevenue = () => {
        if (isSupervisor) {
            setIsRevenueVisible(prev => !prev);
        } else if (!isRevenueVisible) {
            setIsSupervisorAuthOpen(true);
        } else {
            setIsRevenueVisible(false);
        }
    };

    if (isLoading) {
        return (
            <KasirLayout>
                <div className="flex h-[70vh] items-center justify-center">
                    <Loader2 className="w-10 h-10 text-slate-600 animate-spin" />
                </div>
            </KasirLayout>
        );
    }

    return (
        <KasirLayout>
            <Head title="Manajemen Shift & Kas Laci" />
            
            <div className="flex justify-end max-w-6xl mx-auto mb-3">
                <a
                    href="/staf/absensi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold hover:bg-emerald-100 transition shadow-2xs"
                >
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Buka Kartu Presensi (QR Dinamis)</span>
                </a>
            </div>

            {!shift ? (
                /* KONDISI 1: BELUM BUKA SHIFT (WORKSTATION MODAL AWAL ANTI-SLOP) */
                <ShiftOpenWorkstation
                    user={auth?.user}
                    coop={coop}
                    onSubmit={handleOpenShift}
                    isSubmitting={isSubmitting}
                    errorMessage={openError}
                />
            ) : (
                /* KONDISI 2: SHIFT AKTIF (DASHBOARD & MONEY MANAGEMENT) */
                <div className="space-y-6 max-w-6xl mx-auto pb-10">
                    {/* Shared Drawer Handoff & Voluntary Logout Banner */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 text-xs">
                            <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                                <span>Laci Toko Dibuka oleh {shift.user?.name || 'Kasir'}</span>
                                {shift.cashier_sessions?.filter((cs) => !cs.logged_out_at).length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                                        {shift.cashier_sessions.filter((cs) => !cs.logged_out_at).map((cs) => cs.user?.name).filter(Boolean).join(', ')} sedang aktif
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-500 text-[11px]">
                                Pulang lebih awal (shift 15:00 / 16:00)? Cukup klik <strong>Logout Pulang</strong> tanpa menutup laci. <strong>Tutup Shift</strong> otomatis me-logout semua kasir lain yang belum logout.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                        >
                            Logout Pulang (Tanpa Tutup Laci)
                        </button>
                    </div>

                    {/* Live Metrics & Unified Control Hero Card */}
                    <ShiftLiveMetrics 
                        metrics={metrics || {}} 
                        shift={shift} 
                        isRevenueVisible={isRevenueVisible}
                        isSupervisor={isSupervisor}
                        onToggleRevenueVisibility={handleToggleRevenue}
                        onOpenCloseModal={() => setIsCloseModalOpen(true)}
                        onOpenMovementModal={() => setIsMovementModalOpen(true)}
                    />

                    {/* Cash Movements History */}
                    <ShiftMovementsHistory 
                        movements={shift.cash_movements || []} 
                        onOpenCashMovement={() => setIsMovementModalOpen(true)}
                    />
                </div>
            )}

            {/* Modals */}
            <ShiftCloseModal
                isOpen={isCloseModalOpen}
                onClose={() => setIsCloseModalOpen(false)}
                onSubmit={handleCloseShift}
                isSubmitting={isSubmitting}
                errorMessage={closeError}
            />

            <PosCashMovementModal
                isOpen={isMovementModalOpen}
                onClose={() => setIsMovementModalOpen(false)}
                onSuccess={fetchCurrentShift}
            />

            <PosSupervisorAuthModal
                isOpen={isSupervisorAuthOpen}
                onClose={() => setIsSupervisorAuthOpen(false)}
                onAuthorized={() => {
                    setIsRevenueVisible(true);
                    toast.success('Otorisasi supervisor berhasil. Sensor saldo laci dibuka.');
                }}
                actionTitle="Otorisasi Saldo Kas Laci"
                actionDescription="Untuk menjaga integritas Blind Reconciliation, saldo ekspektasi laci kasir dilindungi PIN Supervisor."
            />
        </KasirLayout>
    );
}
