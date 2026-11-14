import { useState, useMemo, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast } from '@/Components/UI/Toast';
import { playScanSound } from '@/Utils/barcodeScanner';

/**
 * usePosVendorBeliPutusActions
 * 
 * Domain hook isolating Beli Putus (Direct Store Delivery / COD) business logic,
 * drawer sufficiency, and atomic settlement.
 */
export function usePosVendorBeliPutusActions({
    selectedVendor,
    vendorProducts = [],
    availableCash = 0,
    formatRp,
    onSuccess,
    fetchConsignmentData,
    refreshShift,
}) {
    const { auth } = usePage().props;
    const isSupervisor = Boolean(auth?.user?.role === 'PENGURUS' || auth?.user?.role === 'STAF');

    const [incomingQtys, setIncomingQtys] = useState({});
    const [invoiceNumber, setInvoiceNumber] = useState(() => {
        const d = new Date();
        const code = selectedVendor?.code || 'COD';
        return `${code}-${d.getDate()}/${d.getMonth() + 1}`;
    });
    const [payoutMethod, setPayoutMethod] = useState(
        selectedVendor?.payout_method === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'CASH'
    );
    const [bankReference, setBankReference] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showQuickAddModal, setShowQuickAddModal] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [pendingSupervisorPin, setPendingSupervisorPin] = useState(null);
    const [successModalData, setSuccessModalData] = useState(null);

    // Reset state when vendor changes
    useEffect(() => {
        setIncomingQtys({});
        setSubmitError('');
        setBankReference('');
        setPayoutMethod(selectedVendor?.payout_method === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'CASH');
        const d = new Date();
        const code = selectedVendor?.code || 'COD';
        setInvoiceNumber(`${code}-${d.getDate()}/${d.getMonth() + 1}`);
    }, [selectedVendor?.id, selectedVendor?.code, selectedVendor?.payout_method]);

    const handleQtyChange = useCallback((productId, val) => {
        const num = val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0);
        setIncomingQtys((prev) => ({
            ...prev,
            [productId]: num,
        }));
    }, []);

    // Calculations
    const { totalPcs, totalCost, activeItems } = useMemo(() => {
        let pcs = 0;
        let cost = 0;
        const items = [];

        vendorProducts.forEach((p) => {
            const qty = Number(incomingQtys[p.id] || 0);
            if (qty > 0) {
                const unitCost = Number(p.cost_price || 0);
                pcs += qty;
                cost += qty * unitCost;
                items.push({
                    product_id: p.id,
                    name: p.name,
                    qty,
                    unit_cost: unitCost,
                    subtotal: qty * unitCost,
                });
            }
        });

        return { totalPcs: pcs, totalCost: cost, activeItems: items };
    }, [vendorProducts, incomingQtys]);

    const remainingDrawerCash = availableCash - (payoutMethod === 'CASH' ? totalCost : 0);
    const isCashInsufficient = payoutMethod === 'CASH' && totalCost > 0 && remainingDrawerCash < 0;

    // Atomic COD Submission
    const executeCodPayout = useCallback(async (supervisorPin = null) => {
        if (totalPcs <= 0 || isSubmitting) return;

        if (isCashInsufficient) {
            setSubmitError(`Saldo kas laci tidak cukup (${formatRp(availableCash)}). Gunakan opsi Transfer Bank.`);
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const payload = {
                type: 'CASH_OUT',
                category: 'SUPPLIER_COD',
                amount: totalCost,
                supplier_id: selectedVendor.id,
                invoice_number: invoiceNumber.trim() || `COD-${Date.now()}`,
                description: `Restock COD ${selectedVendor.company_name || selectedVendor.name}`,
                payment_method: payoutMethod,
                bank_reference: bankReference.trim() || null,
                items: activeItems.map((it) => ({
                    product_id: it.product_id,
                    qty: it.qty,
                    unit_cost: it.unit_cost,
                })),
            };

            const pinToUse = supervisorPin || pendingSupervisorPin;
            if (pinToUse) {
                payload.supervisor_pin = pinToUse;
            }

            const res = await axios.post('/kasir/api/shift/movement', payload);

            if (res.data?.success) {
                playScanSound('checkout');
                toast.success(`Restock ${totalPcs} pcs & bayar COD ${formatRp(totalCost)} berhasil.`);

                setSuccessModalData({
                    title: 'Pembayaran COD Berhasil',
                    amount: totalCost,
                    supplierName: selectedVendor.company_name || selectedVendor.name,
                    referenceNumber: res.data?.movement?.invoice_number || invoiceNumber,
                    paymentMethod: payoutMethod,
                    returnedItems: [],
                    incomingItems: activeItems.map((it) => ({ name: it.name, qty: it.qty })),
                    isCod: true,
                    rawPayload: {
                        movement: res.data?.movement,
                        receiving: res.data?.receiving,
                        items: activeItems,
                        amount: totalCost,
                        supplier_name: selectedVendor.company_name || selectedVendor.name,
                        invoice_number: invoiceNumber,
                        payment_method: payoutMethod,
                        bank_reference: bankReference,
                        isCod: true,
                    },
                });

                setShowConfirmModal(false);
                setShowSuccessModal(true);
                setIncomingQtys({});
                setPendingSupervisorPin(null);

                await fetchConsignmentData?.(true);
                await refreshShift?.();
                onSuccess?.();
            } else {
                throw new Error(res.data?.message || 'Gagal memproses pembayaran COD.');
            }
        } catch (err) {
            console.error('Error submitting COD restock:', err);
            const errors = err.response?.data?.errors;
            const firstValidationMsg = errors ? Object.values(errors).flat()[0] : null;
            const msg = firstValidationMsg || err.response?.data?.message || err.message || 'Gagal memproses transaksi.';
            setSubmitError(msg);
            toast.error(msg);

            if (err.response?.status === 422 && msg.toLowerCase().includes('pin supervisor')) {
                setShowConfirmModal(false);
                setIsAuthModalOpen(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [
        totalPcs,
        isSubmitting,
        isCashInsufficient,
        availableCash,
        formatRp,
        totalCost,
        selectedVendor,
        invoiceNumber,
        payoutMethod,
        bankReference,
        activeItems,
        pendingSupervisorPin,
        fetchConsignmentData,
        refreshShift,
        onSuccess,
    ]);

    const handleOpenConfirm = useCallback(() => {
        if (totalPcs <= 0 || isSubmitting || isCashInsufficient) return;

        if (!isSupervisor && !pendingSupervisorPin) {
            setIsAuthModalOpen(true);
            return;
        }

        setShowConfirmModal(true);
    }, [totalPcs, isSubmitting, isCashInsufficient, isSupervisor, pendingSupervisorPin]);

    const handleAuthorized = useCallback(({ pin }) => {
        setIsAuthModalOpen(false);
        setPendingSupervisorPin(pin);
        setShowConfirmModal(true);
    }, []);

    // Tactile Enter Key
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = document.activeElement?.tagName?.toLowerCase();
            const isTyping = tag === 'input' || tag === 'textarea';

            if (e.key === 'Enter' && !isTyping && totalPcs > 0 && !isSubmitting && !isCashInsufficient && !showConfirmModal && !showSuccessModal && !showQuickAddModal && !isAuthModalOpen) {
                e.preventDefault();
                handleOpenConfirm();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [totalPcs, isSubmitting, isCashInsufficient, showConfirmModal, showSuccessModal, showQuickAddModal, isAuthModalOpen, handleOpenConfirm]);

    return {
        isSupervisor,
        incomingQtys,
        invoiceNumber,
        setInvoiceNumber,
        payoutMethod,
        setPayoutMethod,
        bankReference,
        setBankReference,
        isSubmitting,
        submitError,
        vendorProducts,
        totalPcs,
        totalCost,
        activeItems,
        remainingDrawerCash,
        isCashInsufficient,
        showConfirmModal,
        setShowConfirmModal,
        showSuccessModal,
        setShowSuccessModal,
        showQuickAddModal,
        setShowQuickAddModal,
        isAuthModalOpen,
        setIsAuthModalOpen,
        successModalData,
        handleQtyChange,
        handleOpenConfirm,
        handleAuthorized,
        executeCodPayout,
    };
}

