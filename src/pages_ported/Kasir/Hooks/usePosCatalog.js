import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { 
    saveCatalogToDb, 
    getAllProductsFromDb, 
    getCatalogMetadataFromDb, 
    upsertProductToDb 
} from '@/Utils/posCatalogDb';
import { toast } from '@/Components/UI/Toast';

/**
 * usePosCatalog: In-Memory RAM + IndexedDB Engine for Sub-millisecond (0ms) Barcode Lookups.
 */
export function usePosCatalog() {
    const [catalogList, setCatalogList] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [lastSynced, setLastSynced] = useState(null);
    const [catalogVersion, setCatalogVersion] = useState('');
    const [skuCount, setSkuCount] = useState(0);

    // O(1) in-memory HashMap for instantaneous barcode scan resolution
    const skuMapRef = useRef(new Map());
    const isSyncingRef = useRef(false);

    // Build the in-memory lookup map from products array
    const populateMemoryIndex = useCallback((products = []) => {
        const map = new Map();
        for (const item of products) {
            if (item.id) {
                map.set(String(item.id), item);
            }
            if (item.sku) {
                map.set(item.sku.toLowerCase(), item);
            }
            if (item.barcode && item.barcode.toLowerCase() !== item.sku?.toLowerCase()) {
                map.set(item.barcode.toLowerCase(), item);
            }
        }
        skuMapRef.current = map;
        setCatalogList(products);
        setSkuCount(products.length);
    }, []);

    // Full or incremental synchronization from backend API
    const syncCatalog = useCallback(async (force = false) => {
        if (isSyncingRef.current) return { updated: false, count: skuMapRef.current.size };
        isSyncingRef.current = true;
        setIsSyncing(true);
        try {
            if (!force) {
                // Check lightweight version hash first
                const verRes = await axios.get('/kasir/api/catalog/version');
                const serverVersion = verRes.data?.version;
                const localMeta = await getCatalogMetadataFromDb();

                if (localMeta && localMeta.version === serverVersion && skuMapRef.current.size > 0) {
                    return { updated: false, count: skuMapRef.current.size };
                }
            }

            // Fetch full active catalog
            const res = await axios.get('/kasir/api/catalog');
            const { products = [], version = '', count = 0, synced_at } = res.data || {};

            // Save to IndexedDB
            await saveCatalogToDb(products, { version, synced_at });

            // Update in-memory index
            populateMemoryIndex(products);
            setCatalogVersion(version);
            setLastSynced(synced_at || new Date().toISOString());

            return { updated: true, count };
        } catch (err) {
            console.warn('Gagal sinkronisasi katalog kasir dari server:', err);
            return { updated: false, count: skuMapRef.current.size, error: err };
        } finally {
            isSyncingRef.current = false;
            setIsSyncing(false);
        }
    }, [populateMemoryIndex]);

    // Fast O(1) synchronous lookup in RAM
    const lookupProduct = useCallback((rawCode) => {
        if (!rawCode) return null;
        const code = String(rawCode).trim().toLowerCase();
        return skuMapRef.current.get(code) || null;
    }, []);

    // Fast in-memory fuzzy search for name and SKU
    const searchLocal = useCallback((query, limit = 20) => {
        if (!query || typeof query !== 'string') return [];
        const q = query.trim().toLowerCase();
        if (!q) return [];

        const results = [];
        for (const item of catalogList) {
            const matchSku = item.sku?.toLowerCase().includes(q);
            const matchName = item.name?.toLowerCase().includes(q);
            if (matchSku || matchName) {
                results.push(item);
                if (results.length >= limit) break;
            }
        }
        return results;
    }, [catalogList]);

    // Cache a single product (used when fallback network search succeeds)
    const cacheProduct = useCallback((product) => {
        if (!product || !product.id) return;
        skuMapRef.current.set(String(product.id), product);
        if (product.sku) {
            skuMapRef.current.set(product.sku.toLowerCase(), product);
        }
        if (product.barcode) {
            skuMapRef.current.set(product.barcode.toLowerCase(), product);
        }
        upsertProductToDb(product);
        setCatalogList(prev => {
            const idx = prev.findIndex(p => p.id === product.id);
            if (idx > -1) {
                const next = [...prev];
                next[idx] = product;
                return next;
            }
            return [...prev, product];
        });
        setSkuCount(skuMapRef.current.size);
    }, []);

    // On mount: Load cached products from IndexedDB immediately, then sync in background
    useEffect(() => {
        let isMounted = true;

        async function initCatalog() {
            const [localProducts, localMeta] = await Promise.all([
                getAllProductsFromDb(),
                getCatalogMetadataFromDb(),
            ]);

            if (isMounted && localProducts && localProducts.length > 0) {
                populateMemoryIndex(localProducts);
                if (localMeta) {
                    setCatalogVersion(localMeta.version || '');
                    setLastSynced(localMeta.synced_at || null);
                }
                setIsReady(true);
            }

            // Silently verify server version in background
            await syncCatalog(false);
            if (isMounted) setIsReady(true);
        }

        initCatalog();

        return () => {
            isMounted = false;
        };
    }, [populateMemoryIndex, syncCatalog]);

    // Idle Heartbeat & Window Focus Silent Sync (Multi-Cashier Concurrency Guardian)
    useEffect(() => {
        let isCancelled = false;

        const checkBackgroundSync = async () => {
            if (isCancelled || isSyncingRef.current) return;
            if (typeof navigator !== 'undefined' && !navigator.onLine) return;
            try {
                await syncCatalog(false);
            } catch (_) {}
        };

        // 1. Silent interval check every 25 seconds during idle
        const heartbeatInterval = setInterval(checkBackgroundSync, 25000);

        // 2. Immediate check when window regains focus or tab becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkBackgroundSync();
            }
        };

        const handleFocus = () => {
            checkBackgroundSync();
        };

        // 3. Listener for manual in-app sync requests
        const handleManualSyncRequest = (e) => {
            const force = Boolean(e?.detail?.force);
            syncCatalog(force).then((res) => {
                if (res?.error) {
                    toast.error('Gagal memperbarui katalog dari server.');
                } else if (res?.updated) {
                    toast.success(`Katalog & stok diperbarui (${res.count} barang).`);
                } else {
                    toast.info('Katalog toko sudah yang terbaru.');
                }
            });
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('pos-request-catalog-sync', handleManualSyncRequest);

        return () => {
            isCancelled = true;
            clearInterval(heartbeatInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('pos-request-catalog-sync', handleManualSyncRequest);
        };
    }, [syncCatalog]);

    // Deduct stock in-memory for multiple items in a single batched state update (prevents freezing on batch checkout)
    const deductBatchLocalStock = useCallback((items = []) => {
        if (!Array.isArray(items) || items.length === 0) return;
        const qtyMap = new Map();
        for (const it of items) {
            const id = it.product_id || it.id;
            const qty = Number(it.qty || 0);
            if (id && qty > 0) {
                qtyMap.set(Number(id), (qtyMap.get(Number(id)) || 0) + qty);
            }
        }
        if (qtyMap.size === 0) return;

        setCatalogList(prev => prev.map(p => {
            const qtyToDeduct = qtyMap.get(Number(p.id));
            if (qtyToDeduct) {
                const updatedStock = Math.max(0, (p.stock || 0) - qtyToDeduct);
                const updated = { ...p, stock: updatedStock };
                if (p.id) skuMapRef.current.set(String(p.id), updated);
                if (p.sku) skuMapRef.current.set(p.sku.toLowerCase(), updated);
                if (p.barcode) skuMapRef.current.set(p.barcode.toLowerCase(), updated);
                return updated;
            }
            return p;
        }));
    }, []);

    // Deduct stock in-memory for single item
    const deductLocalStock = useCallback((productId, qty) => {
        if (!productId || qty <= 0) return;
        deductBatchLocalStock([{ id: productId, qty }]);
    }, [deductBatchLocalStock]);

    return {
        catalogList,
        lookupProduct,
        searchLocal,
        syncCatalog,
        cacheProduct,
        deductLocalStock,
        deductBatchLocalStock,
        isSyncing,
        isReady,
        lastSynced,
        catalogVersion,
        skuCount,
    };
}

