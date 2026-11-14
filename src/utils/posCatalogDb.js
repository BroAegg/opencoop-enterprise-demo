/**
 * posCatalogDb.js: Browser-Native IndexedDB Engine for Manasuka POS Catalog.
 * 
 * Provides offline-capable, lightning-fast client-side product caching
 * without external npm dependencies.
 */

const DB_NAME = 'manasuka_pos_db';
const DB_VERSION = 2;
const STORE_PRODUCTS = 'products';
const STORE_META = 'metadata';
const STORE_OUTBOX = 'outbox_transactions';
const STORE_OFFLINE_META = 'offline_metadata';

function openDb() {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
            reject(new Error('IndexedDB tidak didukung pada browser ini'));
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
                const productStore = db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
                productStore.createIndex('sku', 'sku', { unique: false });
                productStore.createIndex('name', 'name', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORE_META)) {
                db.createObjectStore(STORE_META, { keyPath: 'key' });
            }

            if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
                const outboxStore = db.createObjectStore(STORE_OUTBOX, { keyPath: 'client_uuid' });
                outboxStore.createIndex('status', 'status', { unique: false });
                outboxStore.createIndex('created_at', 'created_at', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORE_OFFLINE_META)) {
                db.createObjectStore(STORE_OFFLINE_META, { keyPath: 'key' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Bulk save products and metadata into IndexedDB.
 */
export async function saveCatalogToDb(products = [], metadata = {}) {
    try {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_PRODUCTS, STORE_META], 'readwrite');
            const productStore = tx.objectStore(STORE_PRODUCTS);
            const metaStore = tx.objectStore(STORE_META);

            // Clear old catalog to prevent orphan deleted products
            productStore.clear();

            for (const product of products) {
                productStore.put(product);
            }

            metaStore.put({
                key: 'catalog_meta',
                version: metadata.version || '',
                count: products.length,
                synced_at: metadata.synced_at || new Date().toISOString(),
            });

            tx.oncomplete = () => resolve(true);
            tx.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.warn('Gagal menyimpan katalog ke IndexedDB:', err);
        return false;
    }
}

/**
 * Get all cached products from IndexedDB.
 */
export async function getAllProductsFromDb() {
    try {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_PRODUCTS, 'readonly');
            const store = tx.objectStore(STORE_PRODUCTS);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.warn('Gagal memuat produk dari IndexedDB:', err);
        return [];
    }
}

/**
 * Get catalog metadata (version hash, count, synced_at).
 */
export async function getCatalogMetadataFromDb() {
    try {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_META, 'readonly');
            const store = tx.objectStore(STORE_META);
            const request = store.get('catalog_meta');

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        return null;
    }
}

/**
 * Upsert a single product to IndexedDB cache (e.g. after network fallback scan).
 */
export async function upsertProductToDb(product) {
    if (!product || !product.id) return;
    try {
        const db = await openDb();
        const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
        tx.objectStore(STORE_PRODUCTS).put(product);
    } catch (err) {
        console.warn('Gagal mengupdate single product ke IndexedDB:', err);
    }
}

/**
 * Save an offline transaction into the outbox queue.
 */
export async function saveOfflineTransaction(trx) {
    if (!trx || !trx.client_uuid) return false;
    try {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_OUTBOX, 'readwrite');
            const store = tx.objectStore(STORE_OUTBOX);
            store.put({
                ...trx,
                status: 'PENDING',
                queued_at: new Date().toISOString(),
            });
            tx.oncomplete = () => resolve(true);
            tx.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.warn('Gagal menyimpan transaksi offline ke outbox:', err);
        return false;
    }
}

/**
 * Get all pending offline transactions waiting to sync.
 */
export async function getPendingOfflineTransactions() {
    try {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_OUTBOX, 'readonly');
            const store = tx.objectStore(STORE_OUTBOX);
            const request = store.getAll();

            request.onsuccess = () => {
                const all = request.result || [];
                const pending = all
                    .filter((t) => t.status === 'PENDING')
                    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                resolve(pending);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.warn('Gagal mengambil antrean transaksi offline:', err);
        return [];
    }
}

/**
 * Count pending offline transactions.
 */
export async function getOfflineQueueCount() {
    const list = await getPendingOfflineTransactions();
    return list.length;
}

/**
 * Mark an offline transaction as SYNCED (or remove it).
 */
export async function markOfflineTransactionSynced(clientUuid, serverResult = {}) {
    if (!clientUuid) return;
    try {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_OUTBOX, 'readwrite');
            const store = tx.objectStore(STORE_OUTBOX);
            const getReq = store.get(clientUuid);

            getReq.onsuccess = () => {
                const item = getReq.result;
                if (item) {
                    item.status = 'SYNCED';
                    item.synced_at = new Date().toISOString();
                    item.server_transaction_id = serverResult.transaction_id;
                    item.server_invoice_number = serverResult.invoice_number;
                    store.put(item);
                }
            };

            tx.oncomplete = () => resolve(true);
            tx.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.warn('Gagal mengupdate status transaksi offline:', err);
    }
}

/**
 * Delete a specific offline transaction from IndexedDB outbox.
 */
export async function deleteOfflineTransaction(clientUuid) {
    if (!clientUuid) return false;
    try {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_OUTBOX, 'readwrite');
            const store = tx.objectStore(STORE_OUTBOX);
            store.delete(clientUuid);
            tx.oncomplete = () => resolve(true);
            tx.onerror = (e) => reject(e.target.error);
        });
    } catch (err) {
        console.warn('Gagal menghapus transaksi offline dari IndexedDB:', err);
        return false;
    }
}

/**
 * Decrement product stock in local IndexedDB so subsequent scans show updated stock.
 */
export async function decrementProductStockInDb(productId, qtyToDeduct) {
    if (!productId || qtyToDeduct <= 0) return;
    try {
        const db = await openDb();
        const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
        const store = tx.objectStore(STORE_PRODUCTS);
        const req = store.get(productId);

        req.onsuccess = () => {
            const product = req.result;
            if (product) {
                product.stock = Math.max(0, (product.stock || 0) - qtyToDeduct);
                store.put(product);
            }
        };
    } catch (err) {
        console.warn('Gagal mengurangi stok lokal di IndexedDB:', err);
    }
}


