import { useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from '@/Components/UI/Toast';

/**
 * usePosVendorDropPagi
 * 
 * Sub-hook for Ritual 1: Morning intake form for consignment partner drops.
 * Manages incoming quantity map, cost calculations, and API submission.
 */
export default function usePosVendorDropPagi({
    selectedVendorId,
    vendorProducts = [],
    vendorBatches = [],
    isSubmitting = false,
    setIsSubmitting,
    fetchConsignmentData,
    onSuccess,
}) {
    const [incomingQtys, setIncomingQtys] = useState({});

    // Auto-reset incoming quantities when switching vendor to prevent cross-vendor payload leakage
    useEffect(() => {
        setIncomingQtys({});
    }, [selectedVendorId]);

    // Detect unsettled rollover batches from previous days (aggregates all drops from the latest unpaid day)
    const rolloverBatch = useMemo(() => {
        const safeBatches = Array.isArray(vendorBatches) ? vendorBatches : (vendorBatches && typeof vendorBatches === 'object' ? Object.values(vendorBatches) : []);
        if (safeBatches.length === 0) return null;
        const pastUnpaid = safeBatches.filter(b => b.settlement_status === 'UNPAID' && !b.is_active_today);
        if (pastUnpaid.length === 0) return null;

        const latestPastDate = pastUnpaid[0].received_date;
        const sameDateBatches = pastUnpaid.filter(b => b.received_date === latestPastDate);

        const totalEarned = sameDateBatches.reduce((acc, b) => acc + Number(b.total_earned || 0), 0);
        const totalRemaining = sameDateBatches.reduce((acc, b) => acc + Number(b.total_remaining || 0), 0);

        const combinedItems = [];
        sameDateBatches.forEach(b => {
            (b.items || []).forEach(it => {
                const existing = combinedItems.find(x => x.product_id === it.product_id);
                if (existing) {
                    existing.stock_remaining = (existing.stock_remaining || 0) + Number(it.stock_remaining || 0);
                } else {
                    combinedItems.push({ ...it, stock_remaining: Number(it.stock_remaining || 0) });
                }
            });
        });

        return {
            receiving_id: sameDateBatches[0].receiving_id,
            received_date: latestPastDate,
            received_date_formatted: sameDateBatches[0].received_date_formatted || latestPastDate,
            total_earned: totalEarned,
            total_remaining: totalRemaining,
            items: combinedItems,
            batch_count: sameDateBatches.length,
        };
    }, [vendorBatches]);

    const handleMergeRollover = useCallback(() => {
        if (!rolloverBatch?.items) return;
        let mergedPcs = 0;
        setIncomingQtys(prev => {
            const next = { ...prev };
            rolloverBatch.items.forEach(it => {
                const remaining = Number(it.stock_remaining ?? 0);
                if (remaining > 0) {
                    next[it.product_id] = (Number(next[it.product_id] || 0)) + remaining;
                    mergedPcs += remaining;
                }
            });
            return next;
        });
        toast.success(`Sisa titipan kemarin (${mergedPcs} pcs) berhasil digabungkan ke hitungan drop.`);
    }, [rolloverBatch]);

    const handleIncomingQtyChange = useCallback((productId, value) => {
        const qty = Math.max(0, parseInt(value, 10) || 0);
        setIncomingQtys(prev => ({
            ...prev,
            [productId]: qty,
        }));
    }, []);

    const resetIncomingQtys = useCallback(() => {
        setIncomingQtys({});
    }, []);

    const totalIncomingPcs = useMemo(() => {
        const allowedProductIds = new Set((vendorProducts || []).map(p => Number(p.id)));
        return Object.entries(incomingQtys).reduce((acc, [productId, qty]) => {
            if (allowedProductIds.has(Number(productId))) {
                return acc + (Number(qty) || 0);
            }
            return acc;
        }, 0);
    }, [incomingQtys, vendorProducts]);

    const safeProducts = useMemo(() => {
        if (Array.isArray(vendorProducts)) return vendorProducts;
        if (vendorProducts && typeof vendorProducts === 'object') return Object.values(vendorProducts);
        return [];
    }, [vendorProducts]);

    const totalIncomingCost = useMemo(() => {
        return safeProducts.reduce((acc, p) => {
            const qty = Number(incomingQtys[p.id] || 0);
            return acc + (qty * Number(p.cost_price || 0));
        }, 0);
    }, [incomingQtys, safeProducts]);

    const submitDropPagi = async () => {
        if (!selectedVendorId || isSubmitting) return;

        const allowedProductIds = new Set((vendorProducts || []).map(p => Number(p.id)));
        const items = Object.entries(incomingQtys)
            .filter(([productId, qty]) => allowedProductIds.has(Number(productId)) && Number(qty) > 0)
            .map(([productId, qty]) => ({
                product_id: parseInt(productId, 10),
                qty: parseInt(qty, 10),
            }));

        if (items.length === 0) {
            toast.error('Masukkan jumlah titipan minimal 1 pcs untuk salah satu produk.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axios.post('/kasir/api/consignment/receive', {
                supplier_id: selectedVendorId,
                items,
                notes: 'Drop pagi via POS F9',
            });

            toast.success(res.data?.message || 'Titipan berhasil diterima! Stok otomatis bertambah.');
            setIncomingQtys({});
            await fetchConsignmentData?.(true);
            onSuccess?.();
        } catch (err) {
            console.error('Failed to submit morning drop:', err);
            const errors = err.response?.data?.errors;
            const firstValidationMsg = errors ? Object.values(errors).flat()[0] : null;
            const msg = firstValidationMsg || err.response?.data?.message || err.response?.data?.error || 'Gagal menyimpan drop pagi.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        incomingQtys,
        setIncomingQtys,
        resetIncomingQtys,
        handleIncomingQtyChange,
        totalIncomingPcs,
        totalIncomingCost,
        rolloverBatch,
        handleMergeRollover,
        submitDropPagi,
    };
}
