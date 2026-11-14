import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from '@/Components/UI/Toast';
import {
    calculateReturMetrics,
    buildDisplayReconcileProducts,
    filterScopedProducts,
} from '../utils/posConsignmentCalculations';
import { executeConsignmentSettlement } from '../utils/posConsignmentSettlementExecutor';

/**
 * usePosVendorReturSore
 * 
 * Sub-hook for Ritual 2: Evening return reconciliation and partner cash payout.
 * Synchronizes physical counts with POS sales data, computes active batch liabilities,
 * handles past unpaid balance consolidation, and executes settlement.
 */
export default function usePosVendorReturSore({
    selectedVendor,
    selectedVendorId,
    vendorProducts = [],
    vendorBatches = [],
    activeBatch = null,
    availableCash = 0,
    isSubmitting = false,
    setIsSubmitting,
    fetchConsignmentData,
    onSuccess,
}) {
    const [physicalRemainingMap, setPhysicalRemainingMap] = useState({});
    const [includePastBalance, setIncludePastBalance] = useState(true);
    const [payoutMethod, setPayoutMethod] = useState('CASH'); // 'CASH' | 'BANK_TRANSFER' | 'SPLIT'
    const [splitCashAmount, setSplitCashAmount] = useState(0);
    const [bankReference, setBankReference] = useState('');
    const [isPaymentStep, setIsPaymentStep] = useState(false);
    const [discrepancyMode, setDiscrepancyMode] = useState('STORE_ABSORB'); // 'STORE_ABSORB' | 'POS_RECORDED'
    const [activeProductScope, setActiveProductScope] = useState('ALL'); // 'ALL' | 'PERISHABLE' | 'SHELF'
    const [returnShelfStock, setReturnShelfStock] = useState(false);

    const isAllShelf = useMemo(() => {
        if (selectedVendor?.is_shelf_only !== undefined) {
            return Boolean(selectedVendor.is_shelf_only);
        }
        return vendorProducts.length > 0 && vendorProducts.every(p => !p.is_perishable && !p.requires_daily_return);
    }, [selectedVendor, vendorProducts]);

    const isAllPerishable = useMemo(() => {
        if (selectedVendor?.has_perishable_products !== undefined) {
            return Boolean(selectedVendor.has_perishable_products);
        }
        return vendorProducts.length > 0 && vendorProducts.every(p => p.is_perishable || p.requires_daily_return);
    }, [selectedVendor, vendorProducts]);

    // Synchronize physical counts map whenever selected vendor or active batch changes
    useEffect(() => {
        setIsPaymentStep(false);
        setDiscrepancyMode('STORE_ABSORB');
        if (!selectedVendor) {
            setPhysicalRemainingMap({});
            setPayoutMethod('CASH');
            setSplitCashAmount(0);
            setBankReference('');
            setActiveProductScope('ALL');
            return;
        }

        const initialRemaining = {};
        if (activeBatch && activeBatch.items?.length > 0) {
            const targetDate = activeBatch.received_date;
            const sameDayBatches = (targetDate && vendorBatches?.length > 0)
                ? vendorBatches.filter(b => b.received_date === targetDate)
                : [activeBatch];

            sameDayBatches.forEach(b => {
                (b.items || []).forEach(it => {
                    initialRemaining[it.product_id] = (initialRemaining[it.product_id] ?? 0) + (it.stock_remaining ?? 0);
                });
            });
        } else {
            vendorProducts.forEach(p => {
                initialRemaining[p.id] = p.stock ?? 0;
            });
        }
        setPhysicalRemainingMap(initialRemaining);

        // Pre-select payout method according to vendor preference
        if (selectedVendor.payout_method === 'BANK_TRANSFER') {
            setPayoutMethod('BANK_TRANSFER');
        } else {
            setPayoutMethod('CASH');
        }
        setSplitCashAmount(0);
        setBankReference('');

        // Smart default: if vendor is shelf only, default to SHELF scope and do NOT return shelf stock
        const isShelfVendor = Boolean(selectedVendor.is_shelf_only) || (vendorProducts.length > 0 && vendorProducts.every(p => !p.is_perishable && !p.requires_daily_return));
        const hasPerishable = vendorProducts.some(p => p.is_perishable || p.requires_daily_return) || (selectedVendor.has_perishable_products ?? false);
        const hasShelf = vendorProducts.some(p => !p.is_perishable && !p.requires_daily_return) || isShelfVendor;

        if (isShelfVendor) {
            setActiveProductScope('SHELF');
            setReturnShelfStock(false);
        } else if (hasPerishable && hasShelf) {
            setActiveProductScope('PERISHABLE');
            setReturnShelfStock(true);
        } else if (hasPerishable) {
            setActiveProductScope('PERISHABLE');
            setReturnShelfStock(true);
        } else {
            setActiveProductScope('SHELF');
            setReturnShelfStock(false);
        }
    }, [selectedVendorId, activeBatch?.receiving_id, selectedVendor, activeBatch, vendorProducts]);

    const handleScopeChange = useCallback((scope) => {
        setActiveProductScope(scope);
        if (scope === 'SHELF') {
            setReturnShelfStock(false);
        } else if (scope === 'PERISHABLE') {
            setReturnShelfStock(true);
        }
    }, []);

    const handlePhysicalRemainingChange = useCallback((productId, value) => {
        const remaining = Math.max(0, parseInt(value, 10) || 0);
        setPhysicalRemainingMap(prev => ({
            ...prev,
            [productId]: remaining,
        }));
    }, []);

    const handleSetAllZero = useCallback(() => {
        setPhysicalRemainingMap(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => {
                next[k] = 0;
            });
            return next;
        });
    }, []);

    const handleRecountItem = useCallback((productId, expectedRemaining) => {
        handlePhysicalRemainingChange(productId, expectedRemaining);
    }, [handlePhysicalRemainingChange]);

    // Products to display in Retur Sore work area
    const displayReconcileProducts = useMemo(() => {
        return buildDisplayReconcileProducts(vendorProducts, activeBatch, vendorBatches);
    }, [vendorProducts, activeBatch, vendorBatches]);

    // Apply category scope filtering (Fresh Perishable vs Shelf Goods)
    const scopedReconcileProducts = useMemo(() => {
        return filterScopedProducts(displayReconcileProducts, activeProductScope);
    }, [displayReconcileProducts, activeProductScope]);

    // Check past unpaid balance
    const totalUnsettledBalance = Number(selectedVendor?.unsettled_balance || 0);
    const targetDate = activeBatch?.received_date;
    const sameDayBatches = useMemo(() => {
        return (targetDate && vendorBatches?.length > 0)
            ? vendorBatches.filter(b => b.received_date === targetDate)
            : (activeBatch ? [activeBatch] : []);
    }, [targetDate, vendorBatches, activeBatch]);

    const isBatchSettled = sameDayBatches.length > 0
        ? sameDayBatches.every(b => b.settlement_status === 'SETTLED')
        : Boolean(activeBatch?.settlement_status === 'SETTLED');

    const activeBatchEarned = isBatchSettled
        ? 0
        : (Array.isArray(sameDayBatches) ? sameDayBatches : []).reduce((acc, b) => acc + (b.settlement_status === 'SETTLED' ? 0 : Number(b.total_earned || 0)), 0);

    const rawPastBalance = totalUnsettledBalance - activeBatchEarned;
    const pastUnsettledBalance = Math.max(0, rawPastBalance);
    const hasPastUnsettled = pastUnsettledBalance > 0 && Boolean(activeBatch) && !isBatchSettled;

    // Retur calculations based on physical counts and discrepancy resolution
    const returCalculations = useMemo(() => {
        return calculateReturMetrics({
            displayReconcileProducts: scopedReconcileProducts,
            physicalRemainingMap,
            activeBatch,
            totalUnsettledBalance,
            hasPastUnsettled,
            includePastBalance,
            pastUnsettledBalance,
            discrepancyMode,
            returnShelfStock,
        });
    }, [
        scopedReconcileProducts,
        physicalRemainingMap,
        activeBatch,
        totalUnsettledBalance,
        hasPastUnsettled,
        includePastBalance,
        pastUnsettledBalance,
        discrepancyMode,
        returnShelfStock,
    ]);

    // Guardrail evaluation & Split calculation
    const isPayingViaTransfer = payoutMethod === 'BANK_TRANSFER';
    const isPayingViaSplit = payoutMethod === 'SPLIT';
    const isVendorDefaultBank = selectedVendor?.payout_method === 'BANK_TRANSFER';
    const isCashDrawer = (selectedVendor?.payout_method ?? 'DRAWER_CASH') === 'DRAWER_CASH';

    // Auto-calibrate split cash amount when SPLIT is selected
    useEffect(() => {
        if (payoutMethod === 'SPLIT') {
            setSplitCashAmount(prev => {
                if (prev > 0 && prev <= availableCash && prev <= returCalculations.totalPayable) {
                    return prev;
                }
                return Math.min(availableCash, returCalculations.totalPayable);
            });
        }
    }, [payoutMethod, availableCash, returCalculations.totalPayable]);

    const splitTransferAmount = Math.max(0, returCalculations.totalPayable - Number(splitCashAmount || 0));

    const isExceedingDrawer = payoutMethod === 'CASH'
        ? returCalculations.totalPayable > availableCash
        : (payoutMethod === 'SPLIT' ? Number(splitCashAmount || 0) > availableCash : false);

    const submitReturSore = async () => {
        if (!selectedVendorId || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const success = await executeConsignmentSettlement({
                selectedVendor,
                selectedVendorId,
                activeBatch,
                vendorBatches,
                hasPastUnsettled,
                includePastBalance,
                returCalculations,
                payoutMethod,
                splitCashAmount,
                splitTransferAmount,
                bankReference,
                returnShelfStock,
                scopedReconcileProducts,
                physicalRemainingMap,
                discrepancyMode,
                isPayingViaSplit,
                isPayingViaTransfer,
                availableCash,
                isExceedingDrawer,
                fetchConsignmentData,
            });

            if (success) {
                await fetchConsignmentData?.(true);
                setIsPaymentStep(false);
                onSuccess?.();
            }
        } catch (err) {
            console.error('Failed to submit consignment settlement:', err);
            const errors = err.response?.data?.errors;
            const firstValidationMsg = errors ? Object.values(errors).flat()[0] : null;
            const msg = firstValidationMsg || err.response?.data?.message || err.response?.data?.error || 'Gagal memproses pencairan konsinyasi.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        payoutMethod,
        setPayoutMethod,
        splitCashAmount,
        setSplitCashAmount,
        splitTransferAmount,
        bankReference,
        setBankReference,
        isPayingViaTransfer,
        isPayingViaSplit,
        isPaymentStep,
        setIsPaymentStep,
        physicalRemainingMap,
        setPhysicalRemainingMap,
        handlePhysicalRemainingChange,
        handleSetAllZero,
        handleRecountItem,
        displayReconcileProducts: scopedReconcileProducts,
        allReconcileProducts: displayReconcileProducts,
        activeProductScope,
        setActiveProductScope,
        handleScopeChange,
        hasMultipleCategories: vendorProducts.some(p => p.is_perishable || p.requires_daily_return) && vendorProducts.some(p => !p.is_perishable && !p.requires_daily_return),
        isAllShelf,
        isAllPerishable,
        returnShelfStock,
        setReturnShelfStock,
        includePastBalance,
        setIncludePastBalance,
        returCalculations,
        discrepancyMode,
        setDiscrepancyMode,
        isBankTransfer: isVendorDefaultBank,
        isCashDrawer,
        isExceedingDrawer,
        submitReturSore,
    };
}

