import { Product, OfflineTransaction } from './types';
import { INITIAL_PRODUCTS } from './dummyData';

const DB_NAME = 'opencoop_pos_db';
const DB_VERSION = 1;
const STORE_PRODUCTS = 'products';
const STORE_OUTBOX = 'outbox_transactions';
const STORE_META = 'metadata';

function getIndexedDb(): IDBFactory | null {
  if (typeof window === 'undefined') return null;
  return window.indexedDB || (window as any).mozIndexedDB || (window as any).webkitIndexedDB || (window as any).msIndexedDB;
}

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const idb = getIndexedDb();
    if (!idb) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = idb.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        const productStore = db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
        productStore.createIndex('sku', 'sku', { unique: false });
        productStore.createIndex('barcode', 'barcode', { unique: false });
        productStore.createIndex('name', 'name', { unique: false });
        productStore.createIndex('category', 'category', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
        const outboxStore = db.createObjectStore(STORE_OUTBOX, { keyPath: 'client_uuid' });
        outboxStore.createIndex('status', 'status', { unique: false });
        outboxStore.createIndex('created_at', 'created_at', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Initialize IndexedDB with seed products if first load
 */
export async function initDb(): Promise<Product[]> {
  try {
    const db = await openDb();
    const existingProducts = await getProductsFromDb();

    if (existingProducts.length === 0) {
      const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = tx.objectStore(STORE_PRODUCTS);
      for (const prod of INITIAL_PRODUCTS) {
        store.put(prod);
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      return INITIAL_PRODUCTS;
    }
    return existingProducts;
  } catch (err) {
    console.warn('Fallback to in-memory products:', err);
    return INITIAL_PRODUCTS;
  }
}

export async function getProductsFromDb(): Promise<Product[]> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PRODUCTS, 'readonly');
      const store = tx.objectStore(STORE_PRODUCTS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export async function decrementStockInDb(items: { product_id: string; quantity: number }[]): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
    const store = tx.objectStore(STORE_PRODUCTS);

    for (const item of items) {
      const getReq = store.get(item.product_id);
      getReq.onsuccess = () => {
        const product = getReq.result as Product;
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          store.put(product);
        }
      };
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to decrement stock in IndexedDB:', err);
  }
}

export async function enqueueOfflineTransaction(transaction: OfflineTransaction): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction([STORE_OUTBOX], 'readwrite');
    const store = tx.objectStore(STORE_OUTBOX);
    store.put(transaction);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    // Also decrement local stock immediately in offline mode
    await decrementStockInDb(
      transaction.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }))
    );
  } catch (err) {
    console.error('Failed to enqueue offline transaction:', err);
  }
}

export async function getPendingTransactions(): Promise<OfflineTransaction[]> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_OUTBOX, 'readonly');
      const store = tx.objectStore(STORE_OUTBOX);
      const request = store.getAll();

      request.onsuccess = () => {
        const all = (request.result || []) as OfflineTransaction[];
        resolve(all.filter((t) => t.status === 'PENDING_SYNC'));
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function markTransactionsSynced(clientUuids: string[]): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_OUTBOX, 'readwrite');
    const store = tx.objectStore(STORE_OUTBOX);

    for (const uuid of clientUuids) {
      const getReq = store.get(uuid);
      getReq.onsuccess = () => {
        const txRecord = getReq.result as OfflineTransaction;
        if (txRecord) {
          txRecord.status = 'SYNCED';
          store.put(txRecord);
        }
      };
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to mark transactions synced:', err);
  }
}

export async function getOutboxCount(): Promise<number> {
  try {
    const pending = await getPendingTransactions();
    return pending.length;
  } catch {
    return 0;
  }
}
