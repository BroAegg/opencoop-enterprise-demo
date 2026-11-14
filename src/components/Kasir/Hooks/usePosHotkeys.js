import { useEffect } from 'react';

/**
 * usePosHotkeys: Apple HIG Keyboard-First Navigation Engine for POS Terminal.
 * 
 * Provides instantaneous, zero-mouse control for desktop cashier operations:
 * - Idle / Workstation:
 *   - F1 / Space  : Open Cash Payment Tender (Space active when barcode input is idle)
 *   - F2          : Open QRIS Dynamic Tender
 *   - F3          : Open / Focus Member Identification
 *   - F4          : Park / Hold Current Order
 *   - F5          : Open Held Orders (Resume Order)
 *   - F6          : Open Petty Cash (Arus Kas Laci) In / Out
 *   - F7          : Open Split Payment Modal
 *   - F8          : Open Hardware & Thermal Printer Settings
 *   - F9          : Open Vendor & Consignment Hub
 *   - F10         : Open Store Operational Consumption (Pemakaian Toko at HPP)
 *   - Delete      : Remove last cart item (Shift+Delete: Kosongkan Keranjang)
 *   - Esc         : Dismiss any open modal & refocus barcode scanner
 * 
 * - In Payment Modal (showPayment === true):
 *   - F1          : Switch to Tunai (Cash)
 *   - F2          : Switch to QRIS
 *   - F3 / F7     : Switch to Split Payment
 *   - F4          : Switch to Kasbon Pegawai
 *   - 0-9 / Bsp   : Physical Numpad input directly fills Cash Tender
 *   - Enter       : Finalize checkout (when tender threshold is met)
 */
export function usePosHotkeys({
    cart = [],
    isAnyModalOpen = false,
    showPayment = false,
    paymentMethod = 'CASH',
    cashReceived = 0,
    setCashReceived,
    totalAmount = 0,
    onOpenPayment,
    onOpenQrisPayment,
    onOpenSplitPayment,
    onCloseModals,
    onOpenMemberModal,
    onHoldOrder,
    onOpenHeldModal,
    onOpenCashMovement,
    onOpenConsignmentModal,
    onOpenHardwareSettings,
    onOpenInternalUse,
    onRemoveLastItem,
    onClearCart,
    onCheckout,
    canCheckout = false,
    searchInputRef,
    searchQuery = '',
    activeWorkspace = 'SALES',
    setActiveWorkspace,
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeEl = document.activeElement;
            const activeTag = activeEl?.tagName?.toLowerCase();
            const isTyping = activeTag === 'input' || activeTag === 'textarea';
            const isSearchInput = activeEl === searchInputRef?.current;
            const isSearchInputIdle = isSearchInput && !searchQuery?.trim();

            // Intercept Function Keys to prevent default browser behavior
            if (['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'].includes(e.key)) {
                e.preventDefault();
            }

            // 0. VENDOR WORKSPACE ACTIVE: Handle F1, Escape, or F9 toggle
            if (activeWorkspace === 'VENDOR') {
                if (e.key === 'Escape' || e.key === 'F1' || e.key === 'F9') {
                    e.preventDefault();
                    setActiveWorkspace?.('SALES');
                    setTimeout(() => searchInputRef?.current?.focus(), 50);
                    return;
                }
                return;
            }

            // 1. ESCAPE: Dismiss active modal & refocus scanner (desktop only)
            if (e.key === 'Escape') {
                e.preventDefault();
                if (isAnyModalOpen) {
                    onCloseModals?.();
                }
                const isTouch = typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
                if (!isTouch) {
                    setTimeout(() => searchInputRef?.current?.focus(), 50);
                }
                return;
            }

            // =================================================================
            // 2. IN-MODAL: Payment Modal Active Shortcuts
            // =================================================================
            if (showPayment) {
                // F1: Switch to Tunai
                if (e.key === 'F1') {
                    onOpenPayment?.('CASH');
                    return;
                }
                // F2: Switch to QRIS
                if (e.key === 'F2') {
                    onOpenQrisPayment?.();
                    return;
                }
                // F3 or F7: Switch to Split
                if (e.key === 'F3' || e.key === 'F7') {
                    onOpenSplitPayment?.();
                    return;
                }
                // F4: Switch to Saldo
                if (e.key === 'F4') {
                    onOpenPayment?.('SALDO');
                    return;
                }
                // F5: Switch to Kasbon (Temporarily disabled per policy)
                // if (e.key === 'F5') {
                //     onOpenPayment?.('KASBON');
                //     return;
                // }

                // ENTER: Submit Checkout if eligible
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (canCheckout) {
                        onCheckout?.();
                    }
                    return;
                }

                // PHYSICAL NUMPAD for Cash Tender (when Tunai is selected)
                if (paymentMethod === 'CASH' && setCashReceived && !isTyping) {
                    // Digits 0-9
                    if (e.key >= '0' && e.key <= '9') {
                        e.preventDefault();
                        const digit = e.key;
                        const current = Number(cashReceived) || 0;
                        // If current equals exact totalAmount (fresh default), replace with typed digit
                        if (current === totalAmount || current === 0) {
                            setCashReceived(Number(digit));
                        } else {
                            const combined = `${current}${digit}`;
                            setCashReceived(Number(combined));
                        }
                        return;
                    }

                    // Backspace
                    if (e.key === 'Backspace') {
                        e.preventDefault();
                        const str = String(Number(cashReceived) || 0);
                        const next = str.length > 1 ? Number(str.slice(0, -1)) : 0;
                        setCashReceived(next);
                        return;
                    }

                    // Reset with 'c' or 'C'
                    if (e.key === 'c' || e.key === 'C') {
                        e.preventDefault();
                        setCashReceived(0);
                        return;
                    }
                }

                // Block other workstation hotkeys while payment modal is active
                return;
            }

            // =================================================================
            // 3. IN-MODAL: If any other modal is open, prevent workstation hijacking
            // =================================================================
            if (isAnyModalOpen) {
                return;
            }

            // =================================================================
            // 4. WORKSTATION / IDLE: Global POS Hotkeys
            // =================================================================

            // F1: Payment (Cash tender)
            if (e.key === 'F1') {
                if (cart.length > 0) {
                    onOpenPayment?.('CASH');
                }
                return;
            }

            // SPACE: Payment (Cash tender)
            if (e.code === 'Space' && (!isTyping || isSearchInputIdle)) {
                if (cart.length > 0) {
                    e.preventDefault();
                    onOpenPayment?.('CASH');
                }
                return;
            }

            // F2: QRIS Payment
            if (e.key === 'F2') {
                if (cart.length > 0) {
                    onOpenQrisPayment?.();
                }
                return;
            }

            // F3: Member Identification
            if (e.key === 'F3') {
                onOpenMemberModal?.();
                return;
            }

            // F4: Park / Hold Current Order
            if (e.key === 'F4') {
                if (cart.length > 0) {
                    onHoldOrder?.();
                }
                return;
            }

            // F5: Held Orders List (Resume)
            if (e.key === 'F5') {
                onOpenHeldModal?.();
                return;
            }

            // F6: Petty Cash / Kas Laci
            if (e.key === 'F6') {
                onOpenCashMovement?.();
                return;
            }

            // F7: Split Payment
            if (e.key === 'F7') {
                if (cart.length > 0) {
                    onOpenSplitPayment?.();
                }
                return;
            }

            // F8: Hardware & Printer Settings
            if (e.key === 'F8') {
                onOpenHardwareSettings?.();
                return;
            }

            // F9: Vendor & Consignment Hub
            if (e.key === 'F9') {
                onOpenConsignmentModal?.();
                return;
            }

            // F10: Pemakaian Toko at HPP
            if (e.key === 'F10') {
                if (cart.length > 0) {
                    onOpenInternalUse?.();
                }
                return;
            }

            // DELETE: Remove item or Shift+Delete to clear cart
            if (e.key === 'Delete' && (!isTyping || isSearchInputIdle) && cart.length > 0) {
                e.preventDefault();
                if (e.shiftKey) {
                    onClearCart?.();
                } else {
                    onRemoveLastItem?.();
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        cart,
        isAnyModalOpen,
        showPayment,
        paymentMethod,
        cashReceived,
        setCashReceived,
        totalAmount,
        onOpenPayment,
        onOpenQrisPayment,
        onOpenSplitPayment,
        onCloseModals,
        onOpenMemberModal,
        onHoldOrder,
        onOpenHeldModal,
        onOpenCashMovement,
        onOpenConsignmentModal,
        onOpenHardwareSettings,
        onOpenInternalUse,
        onRemoveLastItem,
        onClearCart,
        onCheckout,
        canCheckout,
        searchInputRef,
        searchQuery,
    ]);
}
