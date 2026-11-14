import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wifi, 
    WifiOff, 
    RefreshCw, 
    CheckCircle2, 
    Clock, 
    ShoppingCart, 
    Trash2, 
    ChevronDown, 
    ChevronUp 
} from 'lucide-react';
import { 
    subscribeQueue, 
    syncOfflineQueue,
    removeOfflineTransaction
} from '@/Utils/posOfflineQueue';
import { getPendingOfflineTransactions, getOfflineQueueCount } from '@/Utils/posCatalogDb';
import { useOptionalPos } from '@/Pages/Kasir/Context/PosContext';
import { toast } from '@/Components/UI/Toast';

export default function PosNetworkStatusPill() {
    const pos = useOptionalPos();
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [queueCount, setQueueCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [expandedUuid, setExpandedUuid] = useState(null);
    const [pendingList, setPendingList] = useState([]);
    const popoverRef = useRef(null);

    // Update queue count and listen to queue events
    const refreshQueue = async () => {
        const count = await getOfflineQueueCount();
        setQueueCount(count);
        if (isOpen) {
            const list = await getPendingOfflineTransactions();
            setPendingList(list);
        }
    };

    useEffect(() => {
        refreshQueue();

        const unsubscribe = subscribeQueue(({ queueCount: count, isSyncing: syncing }) => {
            setQueueCount(count);
            setIsSyncing(syncing);
        });

        const handleOnline = () => {
            setIsOnline(true);
            // Automatic sync on reconnection
            triggerSync();
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Periodic connectivity health check (every 25 seconds)
        const healthInterval = setInterval(async () => {
            try {
                const response = await fetch('/kasir/api/catalog/version', { 
                    method: 'HEAD',
                    cache: 'no-store' 
                });
                if (response.ok) {
                    if (!isOnline) {
                        setIsOnline(true);
                        triggerSync();
                    }
                } else if (!window.navigator.onLine) {
                    setIsOnline(false);
                }
            } catch (e) {
                setIsOnline(false);
            }
        }, 25000);

        return () => {
            unsubscribe();
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(healthInterval);
        };
    }, [isOpen, isOnline]);

    // Close popover when clicked outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleOpenPopover = async () => {
        const list = await getPendingOfflineTransactions();
        setPendingList(list);
        setIsOpen(!isOpen);
    };

    const triggerSync = async () => {
        setIsSyncing(true);
        const res = await syncOfflineQueue();
        setIsSyncing(false);
        await refreshQueue();

        if (res.error) {
            const serverMsg = res.error?.response?.data?.message || res.error?.message || 'Gagal menyinkronkan antrean offline ke server.';
            toast.error(serverMsg);
        } else if (res.synced_count > 0 && res.failed_count === 0) {
            toast.success(`${res.synced_count} transaksi offline berhasil disinkronkan ke server!`);
            setIsOnline(true);
        } else if (res.synced_count > 0 && res.failed_count > 0) {
            const firstFail = res.results?.find((r) => r.status === 'FAILED');
            const failReason = firstFail?.error ? ` (${firstFail.error})` : '';
            toast.warning(`${res.synced_count} tersinkron, ${res.failed_count} transaksi gagal${failReason}.`);
            setIsOnline(true);
        } else if (res.failed_count > 0) {
            const firstFail = res.results?.find((r) => r.status === 'FAILED');
            const errorMsg = firstFail?.error || 'Periksa server logs';
            toast.error(`Gagal sinkron: ${errorMsg}`);
            setIsOnline(true);
        } else if (res.remaining_count === 0) {
            toast.info('Semua transaksi offline telah tersinkron.');
            setIsOnline(true);
        }
    };

    const handleLoadToCart = async (trx) => {
        if (!pos?.loadCart) {
            toast.warning('Buka layar kasir utama untuk menarik transaksi ini.');
            return;
        }
        if (pos.cart && pos.cart.length > 0) {
            const confirmReplace = window.confirm(
                `Keranjang kasir saat ini berisi ${pos.cart.length} item. Ganti keranjang dengan ${trx.items?.length || 0} item dari ${trx.invoice_number}?`
            );
            if (!confirmReplace) return;
        }
        pos.loadCart(trx.items, trx.member_id ? { id: trx.member_id } : null);
        await removeOfflineTransaction(trx.client_uuid);
        await refreshQueue();
        setIsOpen(false);
        toast.success(`Transaksi ${trx.invoice_number} berhasil ditarik ke keranjang! Silakan tekan 'Bayar Sekarang' (F12).`);
    };

    const handleDeleteOffline = async (trx) => {
        const confirmDel = window.confirm(`Hapus transaksi offline ${trx.invoice_number} (${trx.items?.length || 0} item) dari antrean lokal?`);
        if (!confirmDel) return;
        await removeOfflineTransaction(trx.client_uuid);
        await refreshQueue();
        toast.info(`Transaksi ${trx.invoice_number} dihapus dari antrean.`);
    };

    const totalOfflineAmount = (Array.isArray(pendingList) ? pendingList : []).reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

    return (
        <div className="relative" ref={popoverRef}>
            {/* Apple Dynamic Status Capsule (Calm / No news is good news) */}
            <motion.button
                type="button"
                onClick={handleOpenPopover}
                whileTap={{ scale: 0.98 }}
                className={`inline-flex items-center justify-center gap-1.5 text-xs font-medium tracking-tight transition-all duration-200 border shadow-2xs backdrop-blur-md cursor-pointer select-none ${
                    !isOnline || queueCount > 0
                        ? 'px-3 py-1.5 rounded-full bg-amber-50/90 border-amber-200/90 text-amber-900'
                        : isSyncing
                        ? 'px-3 py-1.5 rounded-full bg-white border-slate-200/80 text-slate-700'
                        : 'w-8 h-8 rounded-full bg-white/80 hover:bg-white border-slate-200/80 text-slate-400 hover:text-slate-600'
                }`}
                title={isOnline ? (queueCount > 0 ? `${queueCount} transaksi siap kirim` : 'Koneksi Normal · Klik untuk status antrean') : 'Mode Offline'}
            >
                {isSyncing ? (
                    <>
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500 animate-spin" />
                        <span className="text-slate-700 font-medium">Menyinkronkan...</span>
                    </>
                ) : !isOnline ? (
                    <>
                        <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-amber-900 font-medium">
                            {queueCount > 0 ? `${queueCount} Tertunda` : 'Offline'}
                        </span>
                    </>
                ) : queueCount > 0 ? (
                    <>
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-amber-900 font-medium">{queueCount} Siap Kirim</span>
                    </>
                ) : (
                    // Normal state: Monochromatic, calm, unobtrusive (Apple HIG "No news is good news")
                    <Wifi className="w-3.5 h-3.5 text-slate-400" />
                )}
            </motion.button>

            {/* Apple HIG Popover Sheet (macOS Control Center Style) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-92 bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-2xl rounded-2xl p-4 z-50 text-slate-800 font-sans"
                    >
                        {/* Header: Title & Ambient Status */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100/90 mb-3">
                            <div className="flex items-center gap-2.5">
                                {!isOnline ? (
                                    <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                                ) : (
                                    <Wifi className="w-4 h-4 text-slate-500 shrink-0" />
                                )}
                                <div>
                                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">
                                        {isOnline ? 'Status Sinkronisasi Kasir' : 'Bekerja Mandiri (Lokal)'}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                        {isOnline 
                                            ? 'Koneksi server aktif dan sinkronisasi berjalan normal.' 
                                            : 'Transaksi & cetak struk tetap aktif dan tersimpan aman di perangkat.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Summary Metrics: Squircle Tiles */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100/80">
                                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
                                    Tersimpan Lokal
                                </span>
                                <span className="text-base font-semibold font-mono text-slate-900">
                                    {queueCount} <span className="text-xs font-normal text-slate-400">struk</span>
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100/80">
                                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
                                    Total Penjualan
                                </span>
                                <span className="text-base font-semibold font-mono text-slate-900">
                                    Rp {totalOfflineAmount.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        {/* Queue Items List */}
                        {pendingList.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-3 scrollbar-thin">
                                {pendingList.map((trx) => {
                                    const isExpanded = expandedUuid === trx.client_uuid;
                                    return (
                                        <div 
                                            key={trx.client_uuid} 
                                            className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition-all text-xs"
                                        >
                                            <div 
                                                onClick={() => setExpandedUuid(isExpanded ? null : trx.client_uuid)}
                                                className="flex items-center justify-between cursor-pointer select-none"
                                            >
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <div className="font-semibold font-mono text-slate-800 flex items-center gap-1.5 flex-wrap">
                                                        <span>{trx.invoice_number}</span>
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-sans font-medium">
                                                            {trx.payment_method}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                                        {new Date(trx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {trx.items?.length || 0} item (klik rincian)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="font-semibold font-mono text-slate-900 text-xs">
                                                        Rp {Number(trx.total_amount).toLocaleString('id-ID')}
                                                    </span>
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                                    ) : (
                                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expandable Item Breakdown & Direct Pull-To-Cart Action */}
                                            {isExpanded && (
                                                <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                                                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                                        Rincian Barang ({trx.items?.length || 0} item):
                                                    </div>
                                                    <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-[11px] scrollbar-thin">
                                                        {(trx.items || []).map((it, idx) => (
                                                            <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100/80 last:border-0">
                                                                <div className="truncate pr-2">
                                                                    <div className="font-medium text-slate-800 truncate">
                                                                        {it.product_name || it.name || 'Produk'}
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-400">
                                                                        {it.qty} × Rp {Number(it.unit_price || it.price || 0).toLocaleString('id-ID')}
                                                                        {it.selected_modifier?.name && ` (+${it.selected_modifier.name})`}
                                                                    </div>
                                                                </div>
                                                                <span className="font-mono font-medium text-slate-800 shrink-0">
                                                                    Rp {Number(it.subtotal || (it.qty * (it.unit_price || it.price || 0))).toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex items-center gap-1.5 pt-2.5 mt-2 border-t border-slate-200/60">
                                                        {pos?.loadCart && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleLoadToCart(trx)}
                                                                className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                                                                title="Tarik item ke kasir untuk ditinjau dan dibayar sekarang"
                                                            >
                                                                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                                                                <span>Tarik ke Kasir (Bayar Sekarang)</span>
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteOffline(trx)}
                                                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                                                            title="Hapus transaksi offline ini dari antrean"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-5 text-center text-slate-400 text-xs">
                                <CheckCircle2 className="w-7 h-7 text-slate-400 mx-auto mb-1.5" strokeWidth={1.5} />
                                <p className="font-medium text-slate-700">Semua Data Terkini</p>
                                <p className="text-[11px] text-slate-400">Seluruh transaksi kasir telah tersinkron ke server.</p>
                            </div>
                        )}

                        {/* Actions: Apple Solid Slate-900 */}
                        {queueCount > 0 && (
                            <button
                                type="button"
                                disabled={isSyncing}
                                onClick={triggerSync}
                                className="w-full py-2.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer bg-slate-900 hover:bg-slate-800 text-white shadow-2xs active:scale-[0.99] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                                <span>
                                    {isSyncing 
                                        ? 'Menyinkronkan Data...' 
                                        : 'Sinkronkan Sekarang'}
                                </span>
                            </button>
                        )}

                        {/* Secondary In-App Catalog & Stock Refresh */}
                        {isOnline && queueCount === 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent('pos-request-catalog-sync', { detail: { force: true } }));
                                    setIsOpen(false);
                                }}
                                className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                                title="Sinkronkan katalog dan stok terkini dari server"
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                                <span>Perbarui Stok & Katalog Toko</span>
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
