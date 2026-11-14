import React from 'react';
import { usePos } from '../../Context/PosContext';
import PosProductSearchGrid from './PosProductSearchGrid';
import PosCartPanel from './PosCartPanel';

/**
 * PosMainWorkstation: The Primary Split-Screen Cashier Terminal Workspace.
 * 
 * - Left/Top: Product Search, Barcode Scanner, Quick Actions (F5, F6, F8, F9), Multiplier.
 * - Right/Bottom: Real-Time Cart, Modifier Selector, Customer Card, Park (F4), Payment (F1).
 * 
 * Consumes state and handlers directly from PosContext, eliminating prop-drilling.
 */
export default function PosMainWorkstation() {
    const {
        // Search & Catalog
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
        searchInputRef,
        processBarcodeScan,
        addToCartWithQty,
        pendingMultiplier,
        setPendingMultiplier,
        catalogList,

        // Cart & Modifiers
        cart,
        selectedMember,
        setSelectedMember,
        updateQty,
        updateItemModifier,
        removeItem,
        clearCart,
        holdOrder,
        totalAmount,

        // Modals & Navigation
        openModal,
        heldOrders,
        setActiveWorkspace,
        isAnyModalOpen,

        // Tender
        setPaymentMethod,
        setCashReceived,

        // Peripherals
        isPrinterConnected,
    } = usePos();

    return (
        <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-7.5rem)] font-sans">
            <PosProductSearchGrid
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchInputRef={searchInputRef}
                onSearchKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                        e.preventDefault();
                        processBarcodeScan(searchQuery.trim());
                    }
                }}
                searchResults={searchResults}
                addToCart={(p) => {
                    addToCartWithQty(p, pendingMultiplier);
                    setSearchQuery('');
                    setSearchResults([]);
                }}
                heldOrdersCount={heldOrders.length}
                onOpenHeldModal={() => openModal('HELD_ORDERS')}
                onOpenCashMovement={(props) => openModal('CASH_MOVEMENT', props)}
                onOpenConsignmentModal={() => setActiveWorkspace('VENDOR')}
                onOpenHardwareSettings={() => openModal('HARDWARE')}
                isPrinterConnected={isPrinterConnected}
                pendingMultiplier={pendingMultiplier}
                onClearMultiplier={() => setPendingMultiplier(1)}
                catalogList={catalogList}
                onOpenQuickStockAdjust={(p) => openModal('QUICK_STOCK_ADJUST', { product: p })}
                isAnyModalOpen={isAnyModalOpen}
            />

            <PosCartPanel
                cart={cart}
                selectedMember={selectedMember}
                onOpenMemberModal={() => openModal('MEMBER')}
                onRemoveMember={() => setSelectedMember(null)}
                onUpdateQty={updateQty}
                onUpdateModifier={updateItemModifier}
                onRemoveItem={removeItem}
                onHoldOrder={() => holdOrder()}
                onClearCart={clearCart}
                onOpenPayment={() => {
                    setPaymentMethod('CASH');
                    setCashReceived(totalAmount);
                    openModal('PAYMENT');
                }}
                onOpenInternalUse={() => openModal('INTERNAL_USE')}
            />
        </div>
    );
}

