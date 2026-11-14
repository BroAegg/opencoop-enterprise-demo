import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from '@/Components/UI/Toast';
import {
    computeDailyFreshReconItems,
    submitDailyFreshTransactions,
    buildDailyFreshSuccessData,
    resolveDailyFreshActiveBatch,
} from './dailyFreshHelpers';

export function usePosVendorDailyFreshActions({
    selectedVendor,
    vendorProducts = [],
    vendorBatches = [],
    availableCash = 0,
    formatRp,
    onSuccess,
    fetchConsignmentData,
    refreshShift,
}) {
    const [activeAction, setActiveAction] = useState('SELECT'); // 'SELECT' | 'FULL' | 'DROP_ONLY' | 'SETTLE_ONLY'
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isConsolidatedMode, setIsConsolidatedMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [incomingQtys, setIncomingQtys] = useState({});
    const [physicalRemainingMap, setPhysicalRemainingMap] = useState({});
    const [discrepancyReasons, setDiscrepancyReasons] = useState({});
    const [isSettlingCash, setIsSettlingCash] = useState(true);
    // Default to CASH (Uang Laci Kasir) for autonomous cashier desk settlement
    const [payoutMethod, setPayoutMethod] = useState('CASH');
    const [bankReference, setBankReference] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showQuickAddModal, setShowQuickAddModal] = useState(false);
    const [successModalData, setSuccessModalData] = useState(null);

    const isFixedMargin = Boolean(selectedVendor?.has_fixed_margin || (Number(selectedVendor?.consignment_margin_rate) > 0));
    const marginRate = Number(selectedVendor?.consignment_margin_rate || 0);

    const unpaidBatches = useMemo(() => {
        if (!vendorBatches || vendorBatches.length === 0) return [];
        return vendorBatches.filter((b) => b.settlement_status === 'UNPAID');
    }, [vendorBatches]);

    const activeBatch = useMemo(() => {
        return resolveDailyFreshActiveBatch({
            vendorBatches,
            unpaidBatches,
            isConsolidatedMode,
            selectedBatchId,
            selectedDate,
        });
    }, [vendorBatches, unpaidBatches, isConsolidatedMode, selectedBatchId, selectedDate]);

    const unpaidBatch = activeBatch;

    useEffect(() => {
        setActiveAction('SELECT');
        setSelectedBatchId(null);
        setSelectedDate(null);
        setIsConsolidatedMode(false);
        setIncomingQtys({});
        setDiscrepancyReasons({});
        setIsSettlingCash(true);
        setPayoutMethod('CASH');
        setBankReference('');
    }, [selectedVendor?.id]);

    useEffect(() => {
        const initialMap = {};
        if (activeBatch && activeBatch.items?.length > 0) {
            activeBatch.items.forEach((it) => {
                initialMap[it.product_id] = it.stock_remaining ?? 0;
            });
        } else {
            vendorProducts.forEach((p) => {
                initialMap[p.id] = p.stock ?? 0;
            });
        }
        setPhysicalRemainingMap(initialMap);
    }, [activeBatch?.receiving_id, activeBatch?.received_date, vendorProducts]);

    // Pre-populate incoming quantities with planned PO quantity for daily drop
    useEffect(() => {
        if ((activeAction === 'DROP_ONLY' || activeAction === 'FULL') && vendorProducts.length > 0) {
            setIncomingQtys((prev) => {
                const hasExisting = Object.values(prev).some((v) => Number(v) > 0);
                if (hasExisting) return prev;

                const prefill = {};
                vendorProducts.forEach((p) => {
                    if (Number(p.planned_po_qty) > 0) {
                        prefill[p.id] = Number(p.planned_po_qty);
                    }
                });
                return prefill;
            });
        }
    }, [activeAction, vendorProducts]);

    const handleSelectBatch = useCallback((batchId, dateStr) => {
        setSelectedBatchId(batchId || null);
        setSelectedDate(dateStr || null);
        setIsConsolidatedMode(false);
    }, []);

    const handleToggleConsolidated = useCallback(() => {
        setIsConsolidatedMode((prev) => !prev);
    }, []);

    const handleRemainingChange = useCallback((productId, value) => {
        const val = Math.max(0, parseInt(value, 10) || 0);
        setPhysicalRemainingMap((prev) => ({ ...prev, [productId]: val }));
    }, []);

    const handleDiscrepancyReasonChange = useCallback((productId, reason) => {
        setDiscrepancyReasons((prev) => ({ ...prev, [productId]: reason }));
    }, []);

    const handleIncomingQtyChange = useCallback((productId, value) => {
        const val = Math.max(0, parseInt(value, 10) || 0);
        setIncomingQtys((prev) => ({ ...prev, [productId]: val }));
    }, []);

    const isBatchSettled = Boolean(!activeBatch || activeBatch.settlement_status === 'SETTLED');

    const totalUnpaidAmount = useMemo(() => {
        if (!unpaidBatches || unpaidBatches.length === 0) return 0;
        return unpaidBatches.reduce((acc, b) => acc + Number(b.unpaid_amount ?? b.total_earned ?? 0), 0);
    }, [unpaidBatches]);

    const hasPayable = Boolean(unpaidBatches.length > 0 && totalUnpaidAmount > 0);

    const reconItems = useMemo(() => {
        return computeDailyFreshReconItems(unpaidBatch, physicalRemainingMap, isFixedMargin, marginRate, discrepancyReasons);
    }, [unpaidBatch, physicalRemainingMap, isFixedMargin, marginRate, discrepancyReasons]);

    const { totalHakMitra, totalReturPcs, totalOmzet, totalMarginKoperasi } = useMemo(() => {
        if (isBatchSettled) {
            return {
                totalHakMitra: 0,
                totalReturPcs: 0,
                totalOmzet: 0,
                totalMarginKoperasi: 0,
            };
        }

        let hakMitra = unpaidBatch ? Number(selectedVendor?.unsettled_balance || 0) : 0;
        let returPcs = 0;
        let omzet = 0;
        let marginKoperasi = 0;

        if (reconItems.length > 0) {
            hakMitra = 0;
            reconItems.forEach((it) => {
                hakMitra += it.earned;
                returPcs += it.remaining;
                omzet += it.omzet;
                marginKoperasi += it.margin;
            });
        }

        return {
            totalHakMitra: hakMitra,
            totalReturPcs: returPcs,
            totalOmzet: omzet,
            totalMarginKoperasi: marginKoperasi,
        };
    }, [reconItems, selectedVendor, isBatchSettled, unpaidBatch]);

    const safeProducts = useMemo(() => {
        if (Array.isArray(vendorProducts)) return vendorProducts;
        if (vendorProducts && typeof vendorProducts === 'object') return Object.values(vendorProducts);
        return [];
    }, [vendorProducts]);

    const totalIncomingPcs = useMemo(() => {
        return Object.values(incomingQtys).reduce((acc, q) => acc + (Number(q) || 0), 0);
    }, [incomingQtys]);

    const totalIncomingCost = useMemo(() => {
        return safeProducts.reduce((acc, p) => {
            const qty = Number(incomingQtys[p.id] || 0);
            return acc + (qty * Number(p.cost_price || 0));
        }, 0);
    }, [incomingQtys, safeProducts]);

    const willSettle = activeAction === 'SETTLE_ONLY' && isSettlingCash;
    const isCashPayout = willSettle && payoutMethod === 'CASH';
    const remainingDrawerCash = availableCash - (isCashPayout ? totalHakMitra : 0);

    const handleOpenConfirm = () => {
        if (isSubmitting) return;

        if (activeAction === 'DROP_ONLY') {
            if (totalIncomingPcs <= 0) {
                toast.error('Masukkan jumlah titipan drop baru terlebih dahulu.');
                return;
            }
        } else if (activeAction === 'SETTLE_ONLY') {
            if (isBatchSettled) {
                toast.error('Batch titipan ini sudah lunas dicairkan.');
                return;
            }
            if (totalHakMitra <= 0 && totalReturPcs <= 0 && !unpaidBatch) {
                toast.error('Tidak ada tagihan atau titipan sebelumnya yang perlu diselesaikan.');
                return;
            }
            if (isCashPayout && totalHakMitra > 0 && remainingDrawerCash < 0) {
                toast.error(`Kas laci kasir tidak mencukupi (Tersedia: ${formatRp(availableCash)}). Pilih Transfer Bank.`);
                return;
            }
        }

        setShowConfirmModal(true);
    };

    const handleConfirmExecute = async (receiptFile = null) => {
        setIsSubmitting(true);
        try {
            const shouldSettle = activeAction === 'SETTLE_ONLY' && isSettlingCash && totalHakMitra > 0;
            const shouldReceive = activeAction === 'DROP_ONLY' && totalIncomingPcs > 0;

            const { settleRes, receiveRes } = await submitDailyFreshTransactions({
                selectedVendor,
                unpaidBatch,
                shouldSettle,
                shouldReceive,
                totalHakMitra,
                payoutMethod,
                bankReference,
                reconItems,
                incomingQtys,
                receiptFile,
            });

            const successData = buildDailyFreshSuccessData({
                settleRes,
                receiveRes,
                selectedVendor,
                shouldSettle,
                shouldReceive,
                totalHakMitra,
                payoutMethod,
                reconItems,
                incomingQtys,
                vendorProducts,
            });

            setSuccessModalData(successData);
            setShowConfirmModal(false);
            setShowSuccessModal(true);

            setIncomingQtys({});
            await fetchConsignmentData?.(true);
            await refreshShift?.();
            onSuccess?.();
        } catch (err) {
            console.error('Failed to execute daily fresh ritual:', err);
            const msg = err.response?.data?.message || 'Gagal memproses transaksi harian.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickAddSuccess = useCallback(async () => {
        await fetchConsignmentData?.(true);
        await refreshShift?.();
    }, [fetchConsignmentData, refreshShift]);

    return {
        activeAction,
        setActiveAction,
        isSubmitting,
        incomingQtys,
        setIncomingQtys,
        physicalRemainingMap,
        isSettlingCash,
        setIsSettlingCash,
        payoutMethod,
        setPayoutMethod,
        bankReference,
        setBankReference,
        showConfirmModal,
        setShowConfirmModal,
        showSuccessModal,
        setShowSuccessModal,
        showQuickAddModal,
        setShowQuickAddModal,
        successModalData,
        isFixedMargin,
        marginRate,
        unpaidBatch,
        activeBatch,
        isBatchSettled,
        selectedBatchId,
        selectedDate,
        isConsolidatedMode,
        unpaidBatches,
        totalUnpaidAmount,
        hasPayable,
        reconItems,
        totalHakMitra,
        totalReturPcs,
        totalOmzet,
        totalMarginKoperasi,
        totalIncomingPcs,
        totalIncomingCost,
        isCashPayout,
        remainingDrawerCash,
        handleRemainingChange,
        handleDiscrepancyReasonChange,
        handleIncomingQtyChange,
        handleOpenConfirm,
        handleConfirmExecute,
        handleQuickAddSuccess,
        handleSelectBatch,
        handleToggleConsolidated,
    };
}

