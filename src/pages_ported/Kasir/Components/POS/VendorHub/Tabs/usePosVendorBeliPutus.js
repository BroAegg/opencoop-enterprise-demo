import { useState, useMemo, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast } from '@/Components/UI/Toast';
import { useBarcodeScanner, playScanSound } from '@/Utils/barcodeScanner';

/**
 * usePosVendorBeliPutus
 * 
 * Domain hook orchestrating COD restock calculations, hardware barcode scanning,
 * drawer impact validations, and atomic submission.
 */
export default function usePosVendorBeliPutus({
    selectedVendor,
    availableCash = 0,
    formatRp,
    refreshSuppliers,
    refreshShift,
}) {
    const { auth } = usePage().props;
    const isSupervisor = Boolean(auth?.user?.role === 'PENGURUS' || auth?.user?.role === 'STAF');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const [incomingQtys, setIncomingQtys] = useState({});
    const [invoiceNumber, setInvoiceNumber] = useState(() => {
        const d = new Date();
        const code = selectedVendor?.code || 'COD';
        return `${code}-${d.getDate()}/${d.getMonth() + 1}`;
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [lastScannedId, setLastScannedId] = useState(null);

    const products = useMemo(() => {
        return selectedVendor?.products || [];
    }, [selectedVendor]);

    // Reset when vendor changes
    useEffect(() => {
        setIncomingQtys({});
        setSubmitError('');
        setLastScannedId(null);
        const d = new Date();
        const code = selectedVendor?.code || 'COD';
        setInvoiceNumber(`${code}-${d.getDate()}/${d.getMonth() + 1}`);
    }, [selectedVendor?.id, selectedVendor?.code]);

    const handleQtyChange = useCallback((productId, val) => {
        const num = val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0);
        setIncomingQtys((prev) => ({
            ...prev,
            [productId]: num,
        }));
    }, []);

    // 1. Hardware Barcode Scanner Listener
    const handleBarcodeScan = useCallback((barcode) => {
        const cleanCode = barcode.trim();
        const matched = products.find(
            (p) => (p.barcode && p.barcode.trim() === cleanCode) || (p.sku && p.sku.trim() === cleanCode)
        );

        if (matched) {
            playScanSound('multiplier');
            setLastScannedId(matched.id);
            setTimeout(() => setLastScannedId(null), 1200);

            setIncomingQtys((prev) => {
                const current = Number(prev[matched.id] || 0);
                return {
                    ...prev,
                    [matched.id]: current + 10,
                };
            });
        } else {
            playScanSound('error');
        }
    }, [products]);

    useBarcodeScanner({
        onScan: handleBarcodeScan,
        enabled: Boolean(selectedVendor?.id),
    });

    // 2. Calculate Totals
    const { totalPcs, totalAmount, activeItems } = useMemo(() => {
        let pcs = 0;
        let amount = 0;
        const items = [];

        products.forEach((p) => {
            const qty = Number(incomingQtys[p.id] || 0);
            if (qty > 0) {
                const cost = Number(p.cost_price || 0);
                pcs += qty;
                amount += qty * cost;
                items.push({
                    product_id: p.id,
                    name: p.name,
                    qty,
                    unit_cost: cost,
                    subtotal: qty * cost,
                });
            }
        });

        return { totalPcs: pcs, totalAmount: amount, activeItems: items };
    }, [products, incomingQtys]);

    const isExceedingDrawer = totalAmount > availableCash;

    // 3. Execution Action with Optional Supervisor PIN
    const executeCodPayout = useCallback(async (supervisorPin = null) => {
        if (totalPcs <= 0 || isSubmitting) return;

        if (isExceedingDrawer) {
            setSubmitError(`Saldo kas laci tidak mencukupi (tersisa ${formatRp(availableCash)}).`);
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const payload = {
                type: 'CASH_OUT',
                category: 'SUPPLIER_COD',
                amount: totalAmount,
                supplier_id: selectedVendor.id,
                invoice_number: invoiceNumber.trim() || `COD-${Date.now()}`,
                description: `Restock COD ${selectedVendor.company_name || selectedVendor.name}`,
                items: activeItems.map((it) => ({
                    product_id: it.product_id,
                    qty: it.qty,
                    unit_cost: it.unit_cost,
                })),
            };

            if (supervisorPin) {
                payload.supervisor_pin = supervisorPin;
            }

            const res = await axios.post('/kasir/api/shift/movement', payload);

            if (res.data?.success) {
                playScanSound('checkout');
                toast.success(`Restock ${totalPcs} pcs & bayar COD ${formatRp(totalAmount)} selesai`);
                setIncomingQtys({});
                refreshSuppliers?.();
                refreshShift?.();
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

            // If backend rejects due to missing PIN, seamlessly pop up the auth modal
            if (err.response?.status === 422 && msg.toLowerCase().includes('pin supervisor')) {
                setIsAuthModalOpen(true);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [totalPcs, isSubmitting, isExceedingDrawer, availableCash, formatRp, selectedVendor, invoiceNumber, activeItems, totalAmount, refreshSuppliers, refreshShift]);

    // Main trigger: direct execute if supervisor, or prompt modal if cashier
    const handleSubmit = useCallback(() => {
        if (totalPcs <= 0 || isSubmitting) return;

        if (isExceedingDrawer) {
            setSubmitError(`Saldo kas laci tidak mencukupi (tersisa ${formatRp(availableCash)}).`);
            return;
        }

        if (!isSupervisor) {
            setIsAuthModalOpen(true);
            return;
        }

        executeCodPayout();
    }, [totalPcs, isSubmitting, isExceedingDrawer, isSupervisor, executeCodPayout, formatRp, availableCash]);

    // Authorized callback from PosSupervisorAuthModal
    const handleAuthorized = useCallback(({ pin }) => {
        setIsAuthModalOpen(false);
        executeCodPayout(pin);
    }, [executeCodPayout]);

    // 4. Single Enter tactile shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = document.activeElement?.tagName?.toLowerCase();
            const isTyping = tag === 'input' || tag === 'textarea';

            if (e.key === 'Enter' && !isTyping && totalPcs > 0 && !isSubmitting && !isExceedingDrawer) {
                e.preventDefault();
                handleSubmit();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [totalPcs, isSubmitting, isExceedingDrawer, handleSubmit]);

    return {
        products,
        incomingQtys,
        invoiceNumber,
        setInvoiceNumber,
        isSubmitting,
        submitError,
        lastScannedId,
        handleQtyChange,
        totalPcs,
        totalAmount,
        isExceedingDrawer,
        isSupervisor,
        isAuthModalOpen,
        setIsAuthModalOpen,
        handleAuthorized,
        handleSubmit,
    };
}

