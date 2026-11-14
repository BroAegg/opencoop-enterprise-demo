import React from 'react';
import { usePos } from '../../Context/PosContext';

import PosPaymentModal from './PosPaymentModal';
import PosMemberModal from './PosMemberModal';
import PosHeldOrdersModal from './PosHeldOrdersModal';
import PosCashMovementModal from './PosCashMovementModal';
import PosHardwareSettingsModal from './PosHardwareSettingsModal';
import PosInternalUseModal from './PosInternalUseModal';
import PosTransactionSuccessModal from './PosTransactionSuccessModal';
import PosQuickStockAdjustModal from './PosQuickStockAdjustModal';

/**
 * PosModalHost: Centralized, Mutually Exclusive Modal Container.
 * 
 * Subscribes to PosContext's state machine. Only mounts/activates the currently
 * active modal without polluting main workstation layout or causing DOM bloat.
 */
export default function PosModalHost() {
    const {
        auth,
        activeModal,
        openModal,
        closeModal,
        isModalOpen,
        setActiveWorkspace,

        // Cart & Member
        cart,
        selectedMember,
        setSelectedMember,
        heldOrders,
        holdOrder,
        resumeOrder,
        deleteHeldOrder,
        deleteBatchHeldOrders,
        updateHeldPaymentMethod,
        totalAmount,
        quickCashOptions,

        // Tender & Checkout
        paymentMethod,
        setPaymentMethod,
        cashReceived,
        setCashReceived,
        isProcessing,
        checkout,
        handleBatchCheckout,
        handleSwitchPaymentMethod,
        completedTransaction,
        setCompletedTransaction,

        // Peripherals & Network
        isOnline,
        printReceipt,
        syncCatalog,
        lookupProduct,

        // Member Search
        memberSearch,
        loyaltyRewards,
        loyaltyConfig,
    } = usePos();

    const currentSuccessTrx = activeModal.props?.transaction || completedTransaction;

    return (
        <>
            {/* 1. Payment Modal (Cash, QRIS, Split, Kasbon) */}
            <PosPaymentModal 
                isOpen={isModalOpen('PAYMENT')} 
                onClose={closeModal} 
                paymentMethod={paymentMethod} 
                setPaymentMethod={setPaymentMethod} 
                cashReceived={cashReceived} 
                setCashReceived={setCashReceived} 
                totalAmount={totalAmount} 
                quickCashOptions={quickCashOptions} 
                handleCheckout={checkout} 
                selectedMember={selectedMember} 
                isOnline={isOnline} 
                isProcessing={isProcessing} 
                loyaltyRewards={loyaltyRewards}
                loyaltyConfig={loyaltyConfig}
                onOpenInternalUse={() => openModal('INTERNAL_USE')}
                onHoldOrder={(method) => {
                    holdOrder(typeof method === 'string' ? method : null);
                    closeModal();
                }}
            />

            {/* 2. Member Identification Modal */}
            <PosMemberModal 
                isOpen={isModalOpen('MEMBER')} 
                onClose={closeModal} 
                memberQuery={memberSearch.memberQuery} 
                setMemberQuery={memberSearch.setMemberQuery} 
                memberResults={memberSearch.memberResults} 
                isSearchingMember={memberSearch.isSearchingMember} 
                onSelectMember={(m) => {
                    setSelectedMember(m);
                    closeModal();
                    memberSearch.clearMemberSearch();
                }} 
                currentUser={auth?.user}
            />

            {/* 3. Held / Parked Orders Queue Modal */}
            <PosHeldOrdersModal 
                isOpen={isModalOpen('HELD_ORDERS')} 
                onClose={closeModal} 
                heldOrders={heldOrders} 
                lookupProduct={lookupProduct}
                onDeleteHeld={deleteHeldOrder} 
                onDeleteBatchHeld={deleteBatchHeldOrders}
                onUpdatePaymentMethod={updateHeldPaymentMethod}
                onBatchCheckout={handleBatchCheckout}
                onResumeOrder={(h) => { 
                    resumeOrder(h); 
                    closeModal(); 
                    const resumeMethod = h.intendedPaymentMethod || null;
                    if (resumeMethod && typeof resumeMethod === 'string') {
                        setPaymentMethod(resumeMethod);
                        const tot = (h.cart || []).reduce((s, i) => s + (Number(i.selling_price || 0) * Number(i.qty || 1)), 0);
                        if (resumeMethod === 'CASH') {
                            setCashReceived(tot);
                        }
                        openModal('PAYMENT');
                    }
                }} 
            />

            {/* 4. Petty Cash In / Out Movement Modal */}
            <PosCashMovementModal 
                isOpen={isModalOpen('CASH_MOVEMENT')} 
                onClose={closeModal} 
                initialIntent={activeModal.props?.initialIntent}
                onSuccess={() => {
                    syncCatalog?.(true);
                }}
                onOpenConsignment={() => setActiveWorkspace?.('VENDOR')}
            />

            {/* 5. Hardware & Thermal Printer Settings Modal */}
            <PosHardwareSettingsModal 
                isOpen={isModalOpen('HARDWARE')} 
                onClose={closeModal} 
            />

            {/* 7. Store Operational Expense (at HPP) Modal */}
            <PosInternalUseModal
                isOpen={isModalOpen('INTERNAL_USE')}
                onClose={closeModal}
                cart={cart}
                cashierName={auth?.user?.name || 'Kasir'}
                isSubmitting={isProcessing}
                onSubmit={(payload) => {
                    closeModal();
                    checkout(payload);
                }}
            />

            {/* 7. Quick Stock Adjustment (On-the-fly Opname from POS) */}
            <PosQuickStockAdjustModal
                isOpen={isModalOpen('QUICK_STOCK_ADJUST')}
                onClose={closeModal}
                product={activeModal.props?.product}
                onSuccess={() => {
                    syncCatalog?.(true);
                }}
            />

            {/* 8. Post-Checkout Reassurance & Receipt Modal */}
            {(isModalOpen('SUCCESS') || Boolean(currentSuccessTrx)) && currentSuccessTrx && (
                <PosTransactionSuccessModal
                    transaction={currentSuccessTrx}
                    onClose={() => {
                        setCompletedTransaction(null);
                        closeModal();
                    }}
                    onPrint={() => printReceipt(currentSuccessTrx)}
                    onSwitchPaymentMethod={handleSwitchPaymentMethod}
                />
            )}
        </>
    );
}
