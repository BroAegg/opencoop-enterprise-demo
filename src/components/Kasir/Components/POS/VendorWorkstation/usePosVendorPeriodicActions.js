import { useState, useMemo, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from '@/Components/UI/Toast';

/**
 * usePosVendorPeriodicActions
 * 
 * Domain hook isolating business logic and API orchestration for Konsinyasi Berkala.
 * Implements Apple HIG Multi-Select Batch Scoping and Zero-Scroll Ergonomics.
 */
export function usePosVendorPeriodicActions({
    selectedVendor,
    vendorProducts = [],
    vendorBatches = [],
    availableCash = 0,
    formatRp,
    onSuccess,
    fetchConsignmentData,
    refreshShift,
}) {
    const [activeAction, setActiveAction] = useState('SELECT'); // 'SELECT' | 'RESTOCK' | 'PAYOUT'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [restockQtys, setRestockQtys] = useState({});
    const [payoutMode, setPayoutMode] = useState('BATCHES'); // 'BATCHES' | 'CUSTOM'
    const [selectedBatchIds, setSelectedBatchIds] = useState([]);
    const [customAmount, setCustomAmount] = useState('');
    const [payoutMethod, setPayoutMethod] = useState('CASH');
    const [bankReference, setBankReference] = useState('');
    const [returnShelfStock, setReturnShelfStock] = useState(false);
    const [confirmModalData, setConfirmModalData] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successModalData, setSuccessModalData] = useState(null);

    const unsettledBalance = Number(selectedVendor?.unsettled_balance || 0);

    const safeProducts = useMemo(() => {
        if (Array.isArray(vendorProducts)) return vendorProducts;
        if (vendorProducts && typeof vendorProducts === 'object') return Object.values(vendorProducts);
        return [];
    }, [vendorProducts]);

    const unpaidBatches = useMemo(() => {
        const batches = Array.isArray(vendorBatches)
            ? vendorBatches
            : (vendorBatches && typeof vendorBatches === 'object' ? Object.values(vendorBatches) : []);
        return batches.filter(
            (b) => b.settlement_status === 'UNPAID' || b.settlement_status === 'PARTIAL' || b.badge_status === 'PENDING_PAYOUT' || b.badge_status === 'PARTIAL'
        );
    }, [vendorBatches]);

    // 1. Reset user state only when switching to a different vendor
    useEffect(() => {
        setActiveAction('SELECT');
        setRestockQtys({});
        setBankReference('');
        setReturnShelfStock(false);
        setCustomAmount('');
        setPayoutMethod('CASH');
        setPayoutMode('BATCHES');
    }, [selectedVendor?.id]);

    // 2. Smart default batch selection when unpaid batches arrive or change
    useEffect(() => {
        if (unpaidBatches.length > 1) {
            // Apple HIG Smart Default:
            // If today's drop exists and there are older pending drops,
            // default to selecting ALL older pending drops (excluding today)!
            const olderBatches = unpaidBatches.filter((b) => !b.is_today);
            if (olderBatches.length > 0) {
                setSelectedBatchIds(olderBatches.map((b) => b.receiving_id));
            } else {
                setSelectedBatchIds([unpaidBatches[0].receiving_id]);
            }
        } else if (unpaidBatches.length === 1) {
            setSelectedBatchIds([unpaidBatches[0].receiving_id]);
        } else {
            setSelectedBatchIds([]);
        }
    }, [selectedVendor?.id, unpaidBatches.length]);

    const selectedBatches = useMemo(() => {
        const safeUnpaid = Array.isArray(unpaidBatches) ? unpaidBatches : [];
        if (payoutMode === 'CUSTOM') return safeUnpaid;
        return safeUnpaid.filter((b) => selectedBatchIds.includes(b.receiving_id));
    }, [unpaidBatches, selectedBatchIds, payoutMode]);

    const effectivePayoutAmount = useMemo(() => {
        if (payoutMode === 'CUSTOM') {
            return Math.max(0, Number(customAmount || 0));
        }
        const safeSelected = Array.isArray(selectedBatches) ? selectedBatches : [];
        return safeSelected.reduce(
            (acc, b) => acc + Number(b.unpaid_amount ?? b.total_earned ?? 0),
            0
        );
    }, [payoutMode, customAmount, selectedBatches]);

    const handleToggleBatch = useCallback((batchId) => {
        setPayoutMode('BATCHES');
        setSelectedBatchIds((prev) => {
            if (prev.includes(batchId)) {
                return prev.filter((id) => id !== batchId);
            }
            return [...prev, batchId];
        });
    }, []);

    const handleSelectAllPast = useCallback(() => {
        setPayoutMode('BATCHES');
        const older = unpaidBatches.filter((b) => !b.is_today);
        setSelectedBatchIds(older.map((b) => b.receiving_id));
    }, [unpaidBatches]);

    const handleSelectAll = useCallback(() => {
        setPayoutMode('BATCHES');
        setSelectedBatchIds(unpaidBatches.map((b) => b.receiving_id));
    }, [unpaidBatches]);

    const handleSelectCustom = useCallback(() => {
        setPayoutMode('CUSTOM');
    }, []);

    const handleCustomAmountChange = useCallback((val) => {
        setCustomAmount(val);
        setPayoutMode('CUSTOM');
    }, []);

    const handleRestockQtyChange = useCallback((productId, value) => {
        const val = Math.max(0, parseInt(value, 10) || 0);
        setRestockQtys((prev) => ({ ...prev, [productId]: val }));
    }, []);

    const handleQuickAddSuccess = useCallback(async () => {
        await fetchConsignmentData?.(true);
        await refreshShift?.();
    }, [fetchConsignmentData, refreshShift]);

    const totalRestockPcs = useMemo(() => {
        return Object.values(restockQtys).reduce((acc, q) => acc + (Number(q) || 0), 0);
    }, [restockQtys]);

    const totalRestockCost = useMemo(() => {
        return safeProducts.reduce((acc, p) => acc + ((Number(restockQtys[p.id]) || 0) * Number(p.cost_price || 0)), 0);
    }, [restockQtys, safeProducts]);

    const incomingList = useMemo(() => {
        return Object.entries(restockQtys)
            .filter(([, qty]) => Number(qty) > 0)
            .map(([productId, qty]) => ({
                name: safeProducts.find((p) => p.id === Number(productId))?.name || 'Produk',
                qty: Number(qty),
            }));
    }, [restockQtys, safeProducts]);

    const remainingDrawerCash = availableCash - (payoutMethod === 'CASH' ? effectivePayoutAmount : 0);

    const executeRestockAction = async (receiptFile = null) => {
        setIsSubmitting(true);
        try {
            const items = Object.entries(restockQtys)
                .filter(([, qty]) => Number(qty) > 0)
                .map(([pId, qty]) => ({ product_id: parseInt(pId, 10), qty: parseInt(qty, 10) }));

            const payload = receiptFile ? new FormData() : {
                supplier_id: selectedVendor.id,
                items,
                notes: `Restok rak berkala via POS (${selectedVendor.name})`,
            };
            if (receiptFile) {
                payload.append('supplier_id', selectedVendor.id);
                payload.append('items', JSON.stringify(items));
                payload.append('notes', `Restok rak berkala via POS (${selectedVendor.name})`);
                payload.append('receipt_image', receiptFile);
            }

            const receiveRes = await axios.post('/kasir/api/consignment/receive', payload, receiptFile ? {
                headers: { 'Content-Type': 'multipart/form-data' },
            } : {});

            setSuccessModalData({
                title: 'Restok Rak Berhasil Ditambahkan',
                amount: 0,
                supplierName: selectedVendor.name,
                referenceNumber: receiveRes?.data?.receiving?.receiving_number,
                paymentMethod: 'CASH',
                returnedItems: [],
                incomingItems: incomingList,
                rawPayload: { supplier: selectedVendor, receiving: receiveRes?.data?.receiving, receipt_url: receiveRes?.data?.receipt_url },
            });

            setConfirmModalData(null);
            setShowSuccessModal(true);
            setRestockQtys({});

            await fetchConsignmentData?.(true);
            onSuccess?.();
        } catch (err) {
            console.error('Failed to restock shelf goods:', err);
            toast.error(err.response?.data?.message || 'Gagal menyimpan restok barang.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resolveReturnedList = () => {
        if (!returnShelfStock) return [];
        const items = selectedBatches.flatMap((b) => b.items || []);
        return items
            .filter((it) => Number(it.stock_remaining || 0) > 0)
            .map((it) => ({ name: it.product_name, qty_returned: Number(it.stock_remaining) }));
    };

    const executePayoutAction = async () => {
        setIsSubmitting(true);
        try {
            const expectedReturnedList = resolveReturnedList();

            const settleRes = await axios.post('/kasir/api/consignment/settle', {
                supplier_id: selectedVendor.id,
                receiving_ids: payoutMode === 'BATCHES' ? selectedBatchIds : [],
                receiving_id: payoutMode === 'BATCHES' && selectedBatchIds.length === 1 ? selectedBatchIds[0] : null,
                amount: effectivePayoutAmount,
                payment_method: payoutMethod,
                reference_number: payoutMethod === 'BANK_TRANSFER' ? (bankReference.trim() || null) : null,
                return_shelf_stock: returnShelfStock,
                notes: `Pencairan berkala ${payoutMethod === 'CASH' ? 'Kas Laci' : 'Transfer Bank'} (${selectedVendor.name})${returnShelfStock ? ' + Retur Sisa Rak' : ''}`,
            });

            setSuccessModalData({
                title: returnShelfStock ? 'Bagi Hasil & Retur Sisa Rak Berhasil' : 'Bagi Hasil Berhasil Dicairkan',
                amount: effectivePayoutAmount,
                supplierName: selectedVendor.name,
                referenceNumber: settleRes?.data?.settlement?.settlement_number,
                paymentMethod: payoutMethod,
                returnedItems: settleRes?.data?.returned_items || expectedReturnedList,
                incomingItems: [],
                rawPayload: {
                    settlement: settleRes?.data?.settlement,
                    supplier: selectedVendor,
                    amount: effectivePayoutAmount,
                    payment_method: payoutMethod,
                },
            });

            setConfirmModalData(null);
            setShowSuccessModal(true);

            await fetchConsignmentData?.(true);
            await refreshShift?.();
            onSuccess?.();
        } catch (err) {
            console.error('Failed to settle periodic payout:', err);
            toast.error(err.response?.data?.message || 'Gagal mencairkan bagi hasil.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenConfirm = () => {
        if (isSubmitting) return;

        if (activeAction === 'RESTOCK') {
            if (totalRestockPcs <= 0) {
                toast.error('Masukkan jumlah restok barang terlebih dahulu.');
                return;
            }

            setConfirmModalData({
                title: 'Konfirmasi Restok Barang Rak',
                payoutAmount: 0,
                payoutMethod: 'CASH',
                returnedItems: [],
                incomingItems: incomingList,
                onConfirm: executeRestockAction,
            });
            return;
        }

        if (payoutMode === 'CUSTOM') {
            if (effectivePayoutAmount < 500) {
                toast.error('Masukkan nominal pencairan minimal Rp 500.');
                return;
            }
            if (effectivePayoutAmount > unsettledBalance) {
                toast.error(`Nominal pencairan melebihi total tagihan (${formatRp(unsettledBalance)}).`);
                return;
            }
        }
        if (effectivePayoutAmount <= 0) {
            toast.error('Pilih minimal satu nota kiriman yang akan dicairkan.');
            return;
        }

        if (payoutMethod === 'CASH' && remainingDrawerCash < 0) {
            toast.error(`Kas laci kasir tidak mencukupi (Tersedia: ${formatRp(availableCash)}). Pilih Transfer Bank.`);
            return;
        }

        let title = 'Konfirmasi Pencairan Bagi Hasil';
        if (returnShelfStock) {
            title = 'Konfirmasi Pencairan & Retur Sisa Rak';
        } else if (payoutMode === 'CUSTOM') {
            title = 'Konfirmasi Pencairan Sebagian';
        } else if (selectedBatches.length === 1) {
            const b = selectedBatches[0];
            title = `Konfirmasi Pencairan Drop ${b.is_today ? 'Hari Ini' : (b.is_yesterday ? 'Kemarin' : b.received_date_formatted || 'Terpilih')}`;
        } else if (selectedBatches.length === unpaidBatches.length) {
            title = 'Konfirmasi Pencairan Semua Nota';
        } else {
            title = `Konfirmasi Pencairan ${selectedBatches.length} Nota Lama Terpilih`;
        }

        setConfirmModalData({
            title,
            payoutAmount: effectivePayoutAmount,
            payoutMethod,
            returnedItems: resolveReturnedList(),
            incomingItems: [],
            onConfirm: executePayoutAction,
        });
    };

    return {
        activeAction, setActiveAction, isSubmitting, restockQtys,
        payoutMode, selectedBatchIds, selectedBatches, customAmount, handleCustomAmountChange,
        payoutMethod, setPayoutMethod, bankReference, setBankReference,
        returnShelfStock, setReturnShelfStock,
        confirmModalData, setConfirmModalData, showSuccessModal, setShowSuccessModal, successModalData,
        unsettledBalance, unpaidBatches, effectivePayoutAmount,
        totalRestockPcs, totalRestockCost, remainingDrawerCash,
        handleToggleBatch, handleSelectAllPast, handleSelectAll, handleSelectCustom,
        handleRestockQtyChange, handleQuickAddSuccess, handleOpenConfirm, executeRestockAction,
    };
}
