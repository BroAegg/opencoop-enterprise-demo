import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PauseCircle } from 'lucide-react';
import { toast } from '@/Components/UI/Toast';
import PosHeldOrdersHeader from './HeldOrders/PosHeldOrdersHeader';
import PosHeldOrderItemCard from './HeldOrders/PosHeldOrderItemCard';
import PosHeldOrderBatchConfirmModal from './HeldOrders/PosHeldOrderBatchConfirmModal';

/**
 * PosHeldOrdersModal: High-throughput POS queue management for rush-hour peak cashiering.
 * Refactored & decomposed into modular domain components (< 200 lines) with sub-millisecond tactile responsiveness.
 */
export default function PosHeldOrdersModal({
    isOpen = false,
    onClose,
    heldOrders = [],
    lookupProduct,
    onDeleteHeld,
    onDeleteBatchHeld,
    onUpdatePaymentMethod,
    onBatchCheckout,
    onResumeOrder,
}) {
    const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'QRIS' | 'CASH'
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [shouldPrintSummary, setShouldPrintSummary] = useState(true);
    const [isExecutingBatch, setIsExecutingBatch] = useState(false);

    // 1. Tab Counts & Filtering
    const qrisCount = useMemo(() => {
        return heldOrders.filter(h => h.intendedPaymentMethod === 'QRIS').length;
    }, [heldOrders]);

    const cashCount = useMemo(() => {
        return heldOrders.filter(h => h.intendedPaymentMethod === 'CASH' || !h.intendedPaymentMethod).length;
    }, [heldOrders]);

    const filteredOrders = useMemo(() => {
        if (activeTab === 'QRIS') {
            return heldOrders.filter(h => h.intendedPaymentMethod === 'QRIS');
        }
        if (activeTab === 'CASH') {
            return heldOrders.filter(h => h.intendedPaymentMethod === 'CASH' || !h.intendedPaymentMethod);
        }
        return heldOrders;
    }, [heldOrders, activeTab]);

    // Reset focused index when tab or filter length changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredOrders.length, activeTab]);

    // Keyboard navigation (Arrow keys + Enter to resume)
    useEffect(() => {
        if (!isOpen || showConfirmModal) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, Math.max(0, filteredOrders.length - 1)));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                if (filteredOrders.length > 0 && filteredOrders[selectedIndex]) {
                    e.preventDefault();
                    onResumeOrder?.(filteredOrders[selectedIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, showConfirmModal, filteredOrders, selectedIndex, onResumeOrder]);

    // 2. Selection Management
    const currentFilteredIds = useMemo(() => filteredOrders.map(h => h.id), [filteredOrders]);
    const isAllFilteredSelected = currentFilteredIds.length > 0 && currentFilteredIds.every(id => selectedIds.includes(id));

    const toggleSelectAll = useCallback(() => {
        if (isAllFilteredSelected) {
            setSelectedIds(prev => prev.filter(id => !currentFilteredIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...currentFilteredIds])));
        }
    }, [isAllFilteredSelected, currentFilteredIds]);

    const toggleSelectOrder = useCallback((id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    // 3. Selected Summary Calculation
    const selectedOrders = useMemo(() => {
        return heldOrders.filter(h => selectedIds.includes(h.id));
    }, [heldOrders, selectedIds]);

    const selectedSummary = useMemo(() => {
        let grandTotal = 0;
        let cashTotal = 0;
        let qrisTotal = 0;
        let cashCountSelected = 0;
        let qrisCountSelected = 0;

        selectedOrders.forEach(held => {
            const cartItems = Array.isArray(held?.cart) ? held.cart : [];
            const orderTotal = cartItems.reduce((s, i) => {
                const modExtra = Number(i.selected_modifier?.price || 0);
                return s + ((Number(i.selling_price || 0) + modExtra) * Number(i.qty || 1));
            }, 0);

            grandTotal += orderTotal;
            const method = held.intendedPaymentMethod || 'CASH';
            if (method === 'QRIS') {
                qrisTotal += orderTotal;
                qrisCountSelected += 1;
            } else {
                cashTotal += orderTotal;
                cashCountSelected += 1;
            }
        });

        return {
            count: selectedOrders.length,
            grandTotal,
            cashTotal,
            qrisTotal,
            cashCount: cashCountSelected,
            qrisCount: qrisCountSelected,
        };
    }, [selectedOrders]);

    // 4. Batch Delete & Checkout
    const handleBatchDelete = () => {
        if (selectedIds.length === 0) return;
        if (window.confirm(`Yakin ingin menghapus ${selectedIds.length} transaksi yang dipilih dari antrean parkir?`)) {
            onDeleteBatchHeld?.(selectedIds);
            setSelectedIds([]);
            toast.info(`${selectedIds.length} transaksi parkir dihapus.`);
        }
    };

    const executeBatchApprove = async () => {
        if (selectedOrders.length === 0 || isExecutingBatch) return;

        setIsExecutingBatch(true);
        try {
            const res = await onBatchCheckout?.(selectedOrders, { shouldPrintSummary });
            if (res && res.success) {
                onDeleteBatchHeld?.(selectedIds);
                setSelectedIds([]);
                setShowConfirmModal(false);
                toast.success(res.message || `Berhasil mengonfirmasi ${selectedOrders.length} transaksi sekaligus.`);
            }
        } catch (err) {
            console.error('Batch approve error:', err);
        } finally {
            setIsExecutingBatch(false);
        }
    };

    if (!isOpen) return null;

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
                    className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[88vh]"
                >
                    {/* Header, Filter Tabs, and Floating Toolbar */}
                    <PosHeldOrdersHeader
                        heldCount={heldOrders.length}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        qrisCount={qrisCount}
                        cashCount={cashCount}
                        filteredCount={filteredOrders.length}
                        isAllFilteredSelected={isAllFilteredSelected}
                        toggleSelectAll={toggleSelectAll}
                        selectedCount={selectedSummary.count}
                        selectedGrandTotal={selectedSummary.grandTotal}
                        onBatchDelete={handleBatchDelete}
                        onOpenBatchConfirm={() => setShowConfirmModal(true)}
                        onClose={onClose}
                    />

                    {/* Order List */}
                    <div className="p-4 sm:p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 bg-slate-50/40">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center text-slate-400 italic py-16 flex flex-col items-center gap-2">
                                <PauseCircle className="w-12 h-12 opacity-20" />
                                <span className="text-sm font-semibold text-slate-600">
                                    {heldOrders.length === 0 
                                        ? 'Tidak ada transaksi yang sedang diparkir.' 
                                        : `Tidak ada transaksi dengan kategori ${activeTab === 'QRIS' ? 'QRIS' : 'Tunai'}.`}
                                </span>
                                <span className="text-xs text-slate-400">
                                    Tekan F4 pada keyboard atau tombol Parkir di keranjang untuk memarkir pesanan.
                                </span>
                            </div>
                        ) : (
                            filteredOrders.map((held, idx) => (
                                <PosHeldOrderItemCard
                                    key={held.id}
                                    held={held}
                                    isSelected={selectedIds.includes(held.id)}
                                    isFocused={idx === selectedIndex}
                                    onToggleSelect={toggleSelectOrder}
                                    onFocus={() => setSelectedIndex(idx)}
                                    onUpdatePaymentMethod={onUpdatePaymentMethod}
                                    onDelete={onDeleteHeld}
                                    onResume={onResumeOrder}
                                    lookupProduct={lookupProduct}
                                />
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Confirmation Dialog for Batch Approve */}
            <PosHeldOrderBatchConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                selectedSummary={selectedSummary}
                shouldPrintSummary={shouldPrintSummary}
                setShouldPrintSummary={setShouldPrintSummary}
                isExecutingBatch={isExecutingBatch}
                onConfirm={executeBatchApprove}
            />
        </AnimatePresence>
    );
}
