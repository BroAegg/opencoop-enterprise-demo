import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/Components/UI/Toast';
import { playScanSound } from '@/Utils/barcodeScanner';
import { 
    MAX_HELD_ORDERS, 
    loadHeldOrdersFromStorage, 
    saveHeldOrdersToStorage, 
    buildHeldOrderSnapshot 
} from '../Utils/posCartStorage';

export function usePosCart() {
    const [cart, setCart] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [pendingMultiplier, setPendingMultiplier] = useState(1);

    // Held Orders State backed by localStorage with fault tolerance & auto-pruning
    const [heldOrders, setHeldOrders] = useState(() => loadHeldOrdersFromStorage());

    useEffect(() => {
        saveHeldOrdersToStorage(heldOrders);
    }, [heldOrders]);

    // Cart Operations with Modifier Support & Stock Protection
    const addToCartWithQty = useCallback((product, qty = 1, chosenModifier = null) => {
        // 1. Guard against 0 or negative stock
        if (product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0) {
            playScanSound('error');
            toast.error(`Stok "${product.name}" kosong (0). Terima titipan barang terlebih dahulu sebelum menjual!`);
            return;
        }

        setCart(prev => {
            const modifiers = product.modifiers || [];
            const defaultMod = chosenModifier || modifiers.find(m => m.is_default) || (modifiers.length > 0 ? modifiers[0] : null);
            const cartKey = `${product.id}_${defaultMod?.id || 'base'}`;

            const existingIndex = prev.findIndex(item => item.cart_key === cartKey);
            if (existingIndex > -1) {
                const currentQty = prev[existingIndex].qty;
                const newTotalQty = currentQty + qty;

                // Check stock threshold
                if (product.stock !== undefined && product.stock !== null && newTotalQty > Number(product.stock)) {
                    playScanSound('error');
                    toast.error(`Stok "${product.name}" tidak mencukupi (Tersisa: ${product.stock}, di keranjang: ${currentQty}).`);
                    return prev;
                }

                return prev.map((item, idx) => 
                    idx === existingIndex ? { ...item, qty: newTotalQty } : item
                );
            }

            // Check if initial qty exceeds stock
            if (product.stock !== undefined && product.stock !== null && qty > Number(product.stock)) {
                playScanSound('error');
                toast.error(`Stok "${product.name}" hanya tersisa ${product.stock}.`);
                return prev;
            }

            return [...prev, {
                ...product,
                qty,
                cart_key: cartKey,
                modifiers,
                selected_modifier: defaultMod,
            }];
        });
        setPendingMultiplier(1);
    }, []);

    // Change modifier on an existing cart line
    const updateItemModifier = useCallback((cartKey, newModifier) => {
        setCart(prev => {
            const item = prev.find(i => i.cart_key === cartKey);
            if (!item) return prev;

            const targetKey = `${item.id}_${newModifier?.id || 'base'}`;
            const existingTarget = prev.find(i => i.cart_key === targetKey && i.cart_key !== cartKey);

            if (existingTarget) {
                // Merge with existing row having the same modifier
                return prev
                    .filter(i => i.cart_key !== cartKey)
                    .map(i => i.cart_key === targetKey ? { ...i, qty: i.qty + item.qty } : i);
            }

            return prev.map(i => i.cart_key === cartKey ? {
                ...i,
                cart_key: targetKey,
                selected_modifier: newModifier,
            } : i);
        });
        playScanSound('multiplier');
    }, []);

    const updateQty = useCallback((cartKeyOrId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.cart_key === cartKeyOrId || item.id === cartKeyOrId) {
                const newQty = item.qty + delta;
                if (delta > 0 && item.stock !== undefined && item.stock !== null && newQty > Number(item.stock)) {
                    playScanSound('error');
                    toast.error(`Stok "${item.name}" hanya tersisa ${item.stock}.`);
                    return item;
                }
                return newQty > 0 ? { ...item, qty: newQty } : item;
            }
            return item;
        }));
    }, []);

    const setLastItemQty = useCallback((newQty) => {
        if (newQty <= 0) return;
        setCart(prev => {
            if (prev.length === 0) return prev;
            const lastIdx = prev.length - 1;
            const lastItem = prev[lastIdx];
            if (lastItem.stock !== undefined && lastItem.stock !== null && newQty > Number(lastItem.stock)) {
                playScanSound('error');
                toast.error(`Stok "${lastItem.name}" hanya tersisa ${lastItem.stock}.`);
                return prev;
            }
            return prev.map((item, idx) => idx === lastIdx ? { ...item, qty: newQty } : item);
        });
        playScanSound('multiplier');
        toast.success(`Kuantitas item terakhir diubah menjadi ${newQty}.`);
    }, []);

    const removeItem = useCallback((cartKeyOrId) => {
        setCart(prev => prev.filter(item => item.cart_key !== cartKeyOrId && item.id !== cartKeyOrId));
    }, []);

    const removeLastItem = useCallback(() => {
        setCart(prev => {
            if (prev.length === 0) return prev;
            const removed = prev[prev.length - 1];
            toast.info(`Item "${removed.name}" dihapus.`);
            return prev.slice(0, -1);
        });
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        setSelectedMember(null);
        setPendingMultiplier(1);
    }, []);

    // Hold & Resume Orders with Intent Metadata
    const holdOrder = useCallback((intendedPaymentMethod = null, note = null) => {
        if (cart.length === 0) return null;

        if (heldOrders.length >= MAX_HELD_ORDERS) {
            playScanSound('error');
            toast.error(`Kapasitas antrean parkir penuh (${MAX_HELD_ORDERS} antrean). Selesaikan atau hapus transaksi parkir lama.`);
            return null;
        }

        const newHold = buildHeldOrderSnapshot(cart, selectedMember, intendedPaymentMethod, note);
        setHeldOrders(prev => [...prev.slice(0, MAX_HELD_ORDERS - 1), newHold]);
        setCart([]);
        setSelectedMember(null);
        toast.info(newHold.intendedPaymentMethod ? `Transaksi diparkir (${newHold.intendedPaymentMethod}).` : 'Transaksi diparkir sementara.');
        return newHold;
    }, [cart, selectedMember, heldOrders.length]);

    const resumeOrder = useCallback((held, getFreshProductFn = null) => {
        if (cart.length > 0) holdOrder();

        const outOfStockNames = [];
        const enrichedCart = (held.cart || []).map(item => {
            const fresh = getFreshProductFn ? (getFreshProductFn(item.barcode) || getFreshProductFn(item.id)) : null;
            const currentStock = fresh?.stock !== undefined && fresh?.stock !== null ? Number(fresh.stock) : item.stock;
            if (currentStock !== null && currentStock <= 0) {
                outOfStockNames.push(item.name);
            }
            return {
                ...item,
                stock: currentStock,
                selling_price: fresh?.selling_price !== undefined ? Number(fresh.selling_price) : item.selling_price,
            };
        });

        setCart(enrichedCart);
        setSelectedMember(held.member);
        setHeldOrders(prev => prev.filter(h => h.id !== held.id));

        if (outOfStockNames.length > 0) {
            playScanSound('error');
            toast.warning(`Perhatian: Stok "${outOfStockNames.join(', ')}" sudah habis di toko!`);
        } else {
            toast.success('Transaksi kembali dipanggil.');
        }
        return held;
    }, [cart, holdOrder]);

    const deleteHeldOrder = useCallback((id) => {
        setHeldOrders(prev => prev.filter(h => h.id !== id));
    }, []);

    const deleteBatchHeldOrders = useCallback((ids = []) => {
        if (!Array.isArray(ids) || ids.length === 0) return;
        setHeldOrders(prev => prev.filter(h => !ids.includes(h.id)));
    }, []);

    const updateHeldPaymentMethod = useCallback((id, newMethod) => {
        setHeldOrders(prev => prev.map(h => {
            if (h.id === id) {
                return { ...h, intendedPaymentMethod: newMethod };
            }
            return h;
        }));
    }, []);

    // Price calculation including modifier extras
    const getItemEffectivePrice = (item) => {
        const modPrice = Number(item.selected_modifier?.price || 0);
        return Number(item.selling_price || 0) + modPrice;
    };

    const totalAmount = cart.reduce((sum, item) => {
        return sum + (getItemEffectivePrice(item) * item.qty);
    }, 0);

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    const loadCart = useCallback((items = [], member = null) => {
        const loadedItems = items.map((it) => ({
            id: it.product_id || it.id,
            name: it.product_name || it.name || 'Produk',
            price: Number(it.unit_price ?? it.price ?? 0),
            selling_price: Number(it.unit_price ?? it.price ?? 0),
            qty: Number(it.qty || 1),
            cart_key: `${it.product_id || it.id}_${it.selected_modifier?.id || 'base'}`,
            modifiers: it.modifiers || [],
            selected_modifier: it.selected_modifier || null,
            stock: 9999,
        }));
        setCart(loadedItems);
        if (member) {
            setSelectedMember(member);
        }
    }, []);

    const quickCashOptions = [
        totalAmount,
        Math.ceil(totalAmount / 10000) * 10000,
        50000,
        100000,
    ].filter((v, i, a) => a.indexOf(v) === i && v >= totalAmount);

    return {
        cart,
        setCart,
        loadCart,
        selectedMember,
        setSelectedMember,
        pendingMultiplier,
        setPendingMultiplier,
        heldOrders,
        addToCartWithQty,
        updateItemModifier,
        updateQty,
        setLastItemQty,
        removeItem,
        removeLastItem,
        clearCart,
        holdOrder,
        resumeOrder,
        deleteHeldOrder,
        deleteBatchHeldOrders,
        updateHeldPaymentMethod,
        getItemEffectivePrice,
        totalAmount,
        totalItems,
        quickCashOptions,
    };
}

