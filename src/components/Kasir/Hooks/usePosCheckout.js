import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from '@/Components/UI/Toast';
import { playScanSound } from '@/Utils/barcodeScanner';
import { thermalPrinter } from '@/Utils/thermalPrinterDriver';
import { enqueueOfflineTransaction } from '@/Utils/posOfflineQueue';

/**
 * usePosCheckout: Headless Checkout Orchestrator.
 * 
 * Encapsulates:
 * - Idempotency client UUID generation
 * - Cash tender validation
 * - Online checkout execution with timeout protection
 * - Transparent offline IndexedDB queue fallback
 * - Post-checkout stock synchronization & receipt auto-printing
 * - In-shift payment method switcher (CASH <-> QRIS)
 */
export function usePosCheckout({
    cart = [],
    selectedMember = null,
    totalAmount = 0,
    cashierName = 'Kasir',
    coop = null,
    deductLocalStock,
    deductBatchLocalStock,
    clearCart,
    syncCatalog,
    onCheckoutSuccess,
} = {}) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [completedTransaction, setCompletedTransaction] = useState(null);
    const isSubmittingRef = useRef(false);

    const formatItem = (i) => ({
        product_id: i.id,
        product_name: i.name,
        qty: i.qty,
        unit_price: Number(i.price ?? i.selling_price ?? 0),
        subtotal: Number(i.price ?? i.selling_price ?? 0) * Number(i.qty || 1),
        selected_modifier: i.selected_modifier || null,
    });

    const executeOffline = useCallback(async (payloadToSave) => {
        try {
            const trx = await enqueueOfflineTransaction(payloadToSave, deductLocalStock);
            playScanSound('checkout');
            clearCart?.();

            const pStat = thermalPrinter.getStatus();
            if (pStat.isConnected && pStat.autoPrintDirect && trx) {
                try {
                    await thermalPrinter.printTransaction(trx, coop);
                    toast.success('Transaksi selesai & dicetak (Tersimpan Lokal)');
                } catch {
                    toast.success('Transaksi tersimpan di perangkat.');
                }
            } else {
                toast.success('Transaksi tersimpan di perangkat.');
            }

            setCompletedTransaction(trx);
            onCheckoutSuccess?.(trx);
            return trx;
        } catch (offlineErr) {
            console.error('Offline checkout failed:', offlineErr);
            playScanSound('error');
            toast.error('Gagal menyimpan transaksi: ' + (offlineErr?.message || 'Kesalahan penyimpanan'));
            return null;
        } finally {
            isSubmittingRef.current = false;
            setIsProcessing(false);
        }
    }, [deductLocalStock, clearCart, coop, onCheckoutSuccess]);

    const handleCheckout = useCallback(async ({
        paymentMethod = 'CASH',
        cashReceived = 0,
        customPayload = null,
    } = {}) => {
        if (isSubmittingRef.current || isProcessing) return;
        isSubmittingRef.current = true;
        setIsProcessing(true);

        const clientUuid = window.crypto?.randomUUID 
            ? window.crypto.randomUUID() 
            : (`pos-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

        let payload;
        if (customPayload && typeof customPayload === 'object' && !customPayload.nativeEvent) {
            payload = {
                client_uuid: clientUuid,
                ...customPayload,
                items: cart.map(formatItem),
                member_id: selectedMember?.id || null,
                total_amount: totalAmount,
                cashier_name: cashierName,
            };
        } else {
            if (paymentMethod === 'CASH' && cashReceived < totalAmount) {
                toast.error('Uang tunai kurang!');
                isSubmittingRef.current = false;
                setIsProcessing(false);
                return;
            }
            payload = {
                client_uuid: clientUuid,
                items: cart.map(formatItem),
                payment_method: paymentMethod,
                cash_received: paymentMethod === 'CASH' ? cashReceived : null,
                member_id: selectedMember?.id || null,
                total_amount: totalAmount,
                cashier_name: cashierName,
            };
        }

        // 1. Offline immediate fallback if browser navigator is offline
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return await executeOffline(payload);
        }

        // 2. Online request with fallback to offline outbox on server/network failure
        try {
            const res = await axios.post('/kasir/api/checkout', payload, { timeout: 8000 });
            playScanSound('checkout');
            if (deductBatchLocalStock) {
                deductBatchLocalStock(payload.items || []);
            } else {
                (payload.items || []).forEach(i => deductLocalStock?.(i.product_id, i.qty));
            }
            clearCart?.();

            const trx = res.data.transaction || {
                id: res.data.transaction_id,
                invoice_number: res.data.invoice_number || `TRX-${res.data.transaction_id}`,
                total_amount: payload.total_amount,
                cash_received: payload.cash_received,
                change_amount: Math.max(0, (Number(payload.cash_received) || 0) - Number(payload.total_amount || 0)),
                payment_method: payload.payment_method,
                items: payload.items,
                created_at: new Date().toISOString(),
            };

            const pStat = thermalPrinter.getStatus();
            if (pStat.isConnected && pStat.autoPrintDirect && trx) {
                thermalPrinter.printTransaction(trx, coop)
                    .then(() => toast.success('Transaksi sukses & struk dicetak langsung!'))
                    .catch((err) => toast.error(`Gagal cetak otomatis: ${err.message || 'Periksa printer'}`));
            } else if (!pStat.isConnected && pStat.autoPrintDirect) {
                toast.warning('Printer belum terhubung untuk cetak struk otomatis.');
            }

            setCompletedTransaction(trx);
            onCheckoutSuccess?.(trx);
            return trx;
        } catch (err) {
            const isNetworkOrServerError = !err.response || err.code === 'ECONNABORTED' || (err.response.status >= 500 && err.response.status !== 503);

            if (isNetworkOrServerError && payload.payment_method !== 'SALDO') {
                toast.info('Koneksi terputus. Transaksi dialihkan dan tersimpan di perangkat.');
                return await executeOffline(payload);
            } else {
                playScanSound('error');
                const errorMsg = err.response?.data?.message || 'Terjadi kesalahan saat checkout';
                if (err.response?.status === 409) {
                    toast.warning(errorMsg);
                    syncCatalog?.();
                } else {
                    toast.error(errorMsg);
                }
                return null;
            }
        } finally {
            isSubmittingRef.current = false;
            setIsProcessing(false);
        }
    }, [cart, selectedMember, totalAmount, cashierName, deductLocalStock, deductBatchLocalStock, clearCart, coop, executeOffline, onCheckoutSuccess, syncCatalog, isProcessing]);

    const handleSwitchPaymentMethod = useCallback(async (trx, newMethod) => {
        if (!trx?.id) return;
        try {
            const res = await axios.post(`/kasir/api/transaction/${trx.id}/switch-payment-method`, {
                new_payment_method: newMethod,
            });
            playScanSound('multiplier');
            toast.success(res.data.message || `Metode pembayaran berhasil diubah ke ${newMethod}.`);
            if (res.data.transaction) {
                setCompletedTransaction(res.data.transaction);
            }
        } catch (err) {
            playScanSound('error');
            toast.error(err.response?.data?.message || 'Gagal mengubah metode pembayaran.');
        }
    }, []);

    const handleBatchCheckout = useCallback(async (selectedHeldOrders = [], options = {}) => {
        if (!Array.isArray(selectedHeldOrders) || selectedHeldOrders.length === 0) return null;
        if (isSubmittingRef.current || isProcessing) return null;

        isSubmittingRef.current = true;
        setIsProcessing(true);

        const ordersPayload = selectedHeldOrders.map((h, idx) => {
            const rawMethod = (h.intendedPaymentMethod || 'CASH').toUpperCase();
            const validMethod = ['CASH', 'QRIS', 'SPLIT', 'SALDO', 'KASBON'].includes(rawMethod) ? rawMethod : 'CASH';
            const orderTotal = (h.cart || []).reduce((sum, item) => {
                const modExtra = Number(item.selected_modifier?.price || 0);
                return sum + ((Number(item.price ?? item.selling_price ?? 0) + modExtra) * Number(item.qty || 1));
            }, 0);

            return {
                client_uuid: `pos-held-${h.id}-${idx}`,
                items: (h.cart || []).map(formatItem),
                payment_method: validMethod,
                cash_received: validMethod === 'CASH' ? orderTotal : null,
                rounding_amount: 0,
                member_id: h.member?.id || null,
                notes: h.note || `ACC Parkir Antrean ${h.timestamp || ''}`,
            };
        });

        try {
            const res = await axios.post('/kasir/api/checkout-batch', { orders: ordersPayload }, { timeout: 25000 });
            playScanSound('checkout');

            // Deduct local RAM stock for all items in a single batched state update
            const allItems = selectedHeldOrders.flatMap(ord => ord.cart || []);
            if (deductBatchLocalStock) {
                deductBatchLocalStock(allItems);
            } else {
                selectedHeldOrders.forEach(ord => {
                    (ord.cart || []).forEach(it => {
                        deductLocalStock?.(it.id, it.qty);
                    });
                });
            }

            // Print batch settlement summary slip if requested and printer is online
            const shouldPrint = options.shouldPrintSummary !== false;
            const pStat = thermalPrinter.getStatus();
            if (shouldPrint && pStat.isConnected) {
                try {
                    await thermalPrinter.printBatchSummary({
                        processed_count: res.data.processed_count || selectedHeldOrders.length,
                        total_amount: res.data.total_amount || 0,
                        total_cash: res.data.total_cash || 0,
                        total_qris: res.data.total_qris || 0,
                        cashier_name: cashierName,
                        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    }, coop);
                    toast.success('Rekap batch berhasil dicetak ke printer.');
                } catch (printErr) {
                    console.warn('Gagal mencetak rekap batch:', printErr);
                }
            }

            // Kick drawer if there was any cash order in the batch
            if (pStat.isConnected && (res.data.total_cash > 0)) {
                try {
                    await thermalPrinter.kickCashDrawer();
                } catch (_) {}
            }

            syncCatalog?.(true);
            return res.data;
        } catch (err) {
            playScanSound('error');
            const errorMsg = err.response?.data?.message || err.message || 'Gagal memproses ACC Massal antrean parkir.';
            toast.error(errorMsg);
            return null;
        } finally {
            isSubmittingRef.current = false;
            setIsProcessing(false);
        }
    }, [deductLocalStock, deductBatchLocalStock, cashierName, coop, syncCatalog, isProcessing]);

    return {
        isProcessing,
        completedTransaction,
        setCompletedTransaction,
        handleCheckout,
        handleBatchCheckout,
        handleSwitchPaymentMethod,
    };
}
