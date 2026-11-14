import axios from 'axios';
import { 
    saveOfflineTransaction, 
    getPendingOfflineTransactions, 
    markOfflineTransactionSynced,
    deleteOfflineTransaction,
    decrementProductStockInDb,
    getOfflineQueueCount
} from './posCatalogDb';

// Simple event-based listener system for reactive UI (status pill, queue counter)
const listeners = new Set();

export function subscribeQueue(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

function notifyListeners(queueCount, isSyncing = false) {
    listeners.forEach((cb) => {
        try {
            cb({ queueCount, isSyncing });
        } catch (e) {
            console.error('Queue listener error:', e);
        }
    });
}

/**
 * Generate unique offline invoice number: OFF-YYYYMMDD-XXXX
 */
export function generateOfflineInvoiceNumber() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const dateStr = `${y}${m}${d}`;
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `OFF-${dateStr}-${rand}`;
}

/**
 * Generate client UUID v4
 */
export function generateClientUuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Enqueue an offline transaction, deduct local stock in IndexedDB, and return print-ready transaction.
 */
export async function enqueueOfflineTransaction(payload, catalogUpdateFn = null) {
    const client_uuid = payload?.client_uuid || generateClientUuid();
    const invoice_number = generateOfflineInvoiceNumber();
    const nowIso = new Date().toISOString();

    const offlineTransaction = {
        client_uuid,
        invoice_number,
        created_at: nowIso,
        items: payload.items || [],
        payment_method: payload.payment_method || 'CASH',
        cash_received: payload.cash_received ?? null,
        rounding_amount: payload.rounding_amount || 0,
        member_id: payload.member_id || null,
        payments: payload.payments || [],
        total_amount: payload.total_amount || 0,
        cashier_name: payload.cashier_name || 'Kasir (Offline)',
        status: 'PENDING',
    };

    // 1. Save to IndexedDB outbox
    await saveOfflineTransaction(offlineTransaction);

    // 2. Deduct local product stock in IndexedDB & RAM catalog
    for (const item of offlineTransaction.items) {
        if (item.product_id && item.qty) {
            decrementProductStockInDb(item.product_id, item.qty);
            if (catalogUpdateFn && typeof catalogUpdateFn === 'function') {
                catalogUpdateFn(item.product_id, item.qty);
            }
        }
    }

    // 3. Notify UI
    const count = await getOfflineQueueCount();
    notifyListeners(count, false);

    // 4. Return print-ready transaction object for direct thermal printing
    return {
        id: `offline-${client_uuid.substring(0, 8)}`,
        invoice_number,
        created_at: nowIso,
        total_amount: offlineTransaction.total_amount,
        rounding_amount: offlineTransaction.rounding_amount,
        payment_method: offlineTransaction.payment_method,
        cash_received: offlineTransaction.cash_received,
        change_amount: Math.max(0, (Number(offlineTransaction.cash_received) || 0) - (Number(offlineTransaction.total_amount) || 0)),
        status: 'COMPLETED (LURING)',
        is_offline: true,
        items: offlineTransaction.items.map((it) => ({
            id: it.product_id,
            product_id: it.product_id,
            product_name: it.product_name || it.name || 'Produk',
            qty: it.qty,
            unit_price: it.unit_price,
            subtotal: it.subtotal || (it.unit_price * it.qty),
            selected_modifier: it.selected_modifier || null,
            selected_modifiers: it.selected_modifiers || null,
        })),
        payments: offlineTransaction.payments,
        cashier: { name: offlineTransaction.cashier_name },
    };
}

let isSyncInProgress = false;

/**
 * Sync all pending offline transactions with the Laravel backend.
 */
export async function syncOfflineQueue() {
    if (isSyncInProgress) return { synced_count: 0, failed_count: 0, running: true };

    const pending = await getPendingOfflineTransactions();
    if (!pending || pending.length === 0) {
        notifyListeners(0, false);
        return { synced_count: 0, failed_count: 0, empty: true };
    }

    isSyncInProgress = true;
    notifyListeners(pending.length, true);

    try {
        const payload = {
            transactions: pending.map((t) => ({
                client_uuid: t.client_uuid,
                invoice_number: t.invoice_number,
                created_at: t.created_at,
                items: t.items,
                payment_method: t.payment_method,
                cash_received: t.cash_received,
                rounding_amount: t.rounding_amount,
                member_id: t.member_id,
                payments: t.payments,
            })),
        };

        const response = await axios.post('/kasir/api/sync-offline', payload);
        const { results = [], synced_count = 0, failed_count = 0 } = response.data || {};

        // Mark successfully synced transactions
        for (const res of results) {
            if (res.status === 'SYNCED' || res.status === 'ALREADY_SYNCED') {
                await markOfflineTransactionSynced(res.client_uuid, res);
            }
        }

        const remainingCount = await getOfflineQueueCount();
        notifyListeners(remainingCount, false);

        return {
            success: failed_count === 0,
            synced_count,
            failed_count,
            remaining_count: remainingCount,
            results,
        };
    } catch (err) {
        console.warn('Gagal sinkronisasi antrean offline:', err);
        const remainingCount = await getOfflineQueueCount();
        notifyListeners(remainingCount, false);
        return {
            success: false,
            error: err,
            synced_count: 0,
            failed_count: pending.length,
            remaining_count: remainingCount,
            results: [],
        };
    } finally {
        isSyncInProgress = false;
    }
}

/**
 * Remove an offline transaction from the device queue.
 */
export async function removeOfflineTransaction(clientUuid) {
    const ok = await deleteOfflineTransaction(clientUuid);
    const count = await getOfflineQueueCount();
    notifyListeners(count, false);
    return ok;
}
