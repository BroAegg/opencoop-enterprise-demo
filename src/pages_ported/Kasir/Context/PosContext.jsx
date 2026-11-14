import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast } from '@/Components/UI/Toast';
import { playScanSound, useBarcodeScanner } from '@/Utils/barcodeScanner';

import { usePosCart } from '../Hooks/usePosCart';
import { usePosCatalog } from '../Hooks/usePosCatalog';
import { usePosModalManager } from '../Hooks/usePosModalManager';
import { usePosCheckout } from '../Hooks/usePosCheckout';
import { usePosPeripherals } from '../Hooks/usePosPeripherals';
import { usePosMemberSearch } from '../Hooks/usePosMemberSearch';
import { usePosHotkeys } from '../Hooks/usePosHotkeys';

export const PosContext = createContext(null);

export function PosProvider({ children }) {
    const { coop, auth, loyalty_rewards: loyaltyRewards = [], loyalty_config: loyaltyConfig = null } = usePage().props;

    // 0. Primary Workspace State ('SALES' vs 'VENDOR')
    const [activeWorkspace, setActiveWorkspace] = useState('SALES');

    // 1. Modals State Machine
    const modalManager = usePosModalManager();
    const { openModal, closeModal, isAnyModalOpen } = modalManager;

    // 2. Peripherals & Device Status
    const peripherals = usePosPeripherals({
        coop,
        onOpenHardwareModal: () => openModal('HARDWARE'),
    });

    // 3. Cart Management
    const cartState = usePosCart();
    const {
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
        resumeOrder: rawResumeOrder,
        deleteHeldOrder,
        deleteBatchHeldOrders,
        updateHeldPaymentMethod,
        totalAmount,
        quickCashOptions,
    } = cartState;

    // 4. Catalog Management
    const catalogState = usePosCatalog();
    const {
        catalogList,
        lookupProduct,
        searchLocal,
        cacheProduct,
        deductLocalStock,
        deductBatchLocalStock,
        syncCatalog,
    } = catalogState;

    // Resume order with fresh real-time stock lookup
    const resumeOrder = useCallback((held) => {
        return rawResumeOrder(held, lookupProduct);
    }, [rawResumeOrder, lookupProduct]);

    // 5. Checkout Orchestration
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [cashReceived, setCashReceived] = useState(0);

    const checkoutState = usePosCheckout({
        cart,
        selectedMember,
        totalAmount,
        cashierName: auth?.user?.name || 'Kasir',
        coop,
        deductLocalStock,
        deductBatchLocalStock,
        clearCart,
        syncCatalog,
        onCheckoutSuccess: (trx) => {
            openModal('SUCCESS', { transaction: trx });
        },
    });

    const {
        isProcessing,
        completedTransaction,
        setCompletedTransaction,
        handleCheckout: executeCheckout,
        handleBatchCheckout,
        handleSwitchPaymentMethod,
    } = checkoutState;

    // 6. Member Search Management
    const memberSearch = usePosMemberSearch();

    // 7. Product Barcode & Search Input State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const searchInputRef = useRef(null);

    // Instant local RAM search when typing query
    useEffect(() => {
        const q = searchQuery.trim();
        if (q.length >= 2 && !q.includes('*')) {
            const localMatches = searchLocal(q, 16);
            if (localMatches.length > 0) setSearchResults(localMatches);
        } else if (q.length === 0) {
            setSearchResults([]);
        }
    }, [searchQuery, searchLocal]);

    // Sub-millisecond barcode processor
    const processBarcodeScan = useCallback((rawCode) => {
        const input = (rawCode || '').trim();
        if (!input) return;

        // Auto-dismiss post-transaction reassurance modal on scanning next item (Zero-Click Turnover)
        if (completedTransaction) {
            setCompletedTransaction(null);
            closeModal();
        }

        const setLast = input.match(/^\*(\d+)$/);
        if (setLast) {
            setLastItemQty(parseInt(setLast[1], 10));
            setSearchQuery('');
            return;
        }

        const multOnly = input.match(/^(\d+)\*$/);
        if (multOnly) {
            const m = parseInt(multOnly[1], 10);
            if (m > 0) {
                setPendingMultiplier(m);
                playScanSound('info');
                toast.info(`Multiplier ×${m} aktif.`);
            }
            setSearchQuery('');
            return;
        }

        let scanQty = pendingMultiplier;
        let code = input;
        const pfx = input.match(/^(\d+)\*(.+)$/);
        const sfx = input.match(/^(.+)\*(\d+)$/);
        if (pfx) {
            scanQty = parseInt(pfx[1], 10);
            code = pfx[2].trim();
        } else if (sfx) {
            scanQty = parseInt(sfx[2], 10);
            code = sfx[1].trim();
        }

        const isTouch = typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));

        // 1. RAM Lookup (0 Milliseconds)
        const localMatch = lookupProduct(code);
        if (localMatch) {
            addToCartWithQty(localMatch, scanQty);
            playScanSound(scanQty > 1 ? 'multiplier' : 'success');
            toast.success(`${localMatch.name} (+${scanQty} pcs)`);
            setSearchQuery('');
            setSearchResults([]);
            if (!isTouch) {
                setTimeout(() => searchInputRef.current?.focus(), 50);
            } else {
                searchInputRef.current?.blur();
            }
            return;
        }

        // 2. Network Fallback
        axios.get(`/kasir/api/search?q=${encodeURIComponent(code)}`)
            .then(res => {
                const items = res.data || [];
                const exact = items.find(p => p.sku?.toLowerCase() === code.toLowerCase() || p.barcode?.toLowerCase() === code.toLowerCase());
                if (exact || items.length === 1) {
                    const sel = exact || items[0];
                    cacheProduct(sel);
                    addToCartWithQty(sel, scanQty);
                    playScanSound(scanQty > 1 ? 'multiplier' : 'success');
                    toast.success(`${sel.name} (+${scanQty} pcs)`);
                    setSearchQuery('');
                    setSearchResults([]);
                    if (isTouch) {
                        searchInputRef.current?.blur();
                    }
                } else if (items.length > 1) {
                    setSearchResults(items);
                    playScanSound('info');
                    toast.info(`Ditemukan ${items.length} produk. Silakan pilih.`);
                } else {
                    playScanSound('error');
                    toast.error(`Barcode "${code}" tidak ditemukan!`);
                    setSearchQuery('');
                }
            })
            .catch(() => {
                playScanSound('error');
                toast.error(`Gagal mencari produk "${code}".`);
            })
            .finally(() => {
                if (!isTouch) {
                    setTimeout(() => searchInputRef.current?.focus(), 50);
                }
            });
    }, [pendingMultiplier, lookupProduct, addToCartWithQty, cacheProduct, setLastItemQty, setPendingMultiplier, completedTransaction, setCompletedTransaction, closeModal]);

    // Global USB/HID barcode hardware hook
    useBarcodeScanner({
        onScan: processBarcodeScan,
        inputRef: searchInputRef,
        enabled: !isAnyModalOpen,
        isModalOpen: isAnyModalOpen,
    });

    // Helper checkout trigger with current tender state
    const checkout = useCallback((customPayload = null) => {
        return executeCheckout({
            paymentMethod,
            cashReceived,
            customPayload,
        });
    }, [executeCheckout, paymentMethod, cashReceived]);

    // Keyboard-First Hotkeys Engine
    const isPaymentOpen = modalManager.isModalOpen('PAYMENT');
    usePosHotkeys({
        cart,
        isAnyModalOpen: isAnyModalOpen || Boolean(completedTransaction),
        showPayment: isPaymentOpen,
        paymentMethod,
        cashReceived,
        setCashReceived,
        totalAmount,
        onOpenPayment: (m = 'CASH') => {
            setPaymentMethod(m);
            setCashReceived(m === 'CASH' ? totalAmount : 0);
            openModal('PAYMENT');
        },
        onOpenQrisPayment: () => {
            setPaymentMethod('QRIS');
            setCashReceived(0);
            openModal('PAYMENT');
        },
        onOpenSplitPayment: () => {
            setPaymentMethod('SPLIT');
            openModal('PAYMENT');
        },
        onCloseModals: () => {
            closeModal();
            setCompletedTransaction(null);
        },
        onOpenMemberModal: () => openModal('MEMBER'),
        onHoldOrder: () => holdOrder(isPaymentOpen ? paymentMethod : null),
        onOpenHeldModal: () => openModal('HELD_ORDERS'),
        onOpenCashMovement: () => openModal('CASH_MOVEMENT'),
        onOpenConsignmentModal: () => {
            setActiveWorkspace(prev => prev === 'VENDOR' ? 'SALES' : 'VENDOR');
        },
        onOpenHardwareSettings: () => openModal('HARDWARE'),
        onOpenInternalUse: () => openModal('INTERNAL_USE'),
        onRemoveLastItem: removeLastItem,
        onClearCart: clearCart,
        onCheckout: () => checkout(),
        canCheckout: (paymentMethod === 'QRIS' || paymentMethod === 'SPLIT' || paymentMethod === 'KASBON' || cashReceived >= totalAmount) && !isProcessing,
        searchInputRef,
        searchQuery,
        activeWorkspace,
        setActiveWorkspace,
    });

    const value = {
        coop,
        auth,
        loyaltyRewards,
        loyaltyConfig,

        // Primary Workspace State
        activeWorkspace,
        setActiveWorkspace,

        // Modal State Machine
        ...modalManager,

        // Peripherals & Network
        ...peripherals,

        // Cart & Held
        cart,
        selectedMember,
        setSelectedMember,
        pendingMultiplier,
        setPendingMultiplier,
        heldOrders,
        addToCartWithQty,
        loadCart,
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
        totalAmount,
        quickCashOptions,

        // Catalog & Search
        catalogList,
        lookupProduct,
        searchLocal,
        cacheProduct,
        deductLocalStock,
        deductBatchLocalStock,
        syncCatalog,
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        searchInputRef,
        processBarcodeScan,

        // Member Search
        memberSearch,

        // Tender & Checkout
        paymentMethod,
        setPaymentMethod,
        cashReceived,
        setCashReceived,
        isProcessing,
        completedTransaction,
        setCompletedTransaction,
        checkout,
        handleBatchCheckout,
        handleSwitchPaymentMethod,
    };

    return (
        <PosContext.Provider value={value}>
            {children}
        </PosContext.Provider>
    );
}

export function usePos() {
    const context = useContext(PosContext);
    if (!context) {
        throw new Error('usePos must be used within a PosProvider');
    }
    return context;
}

export function useOptionalPos() {
    return useContext(PosContext);
}

