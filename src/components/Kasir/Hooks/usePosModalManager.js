import { useState, useCallback } from 'react';

/**
 * usePosModalManager: Finite State Machine for POS Modals.
 * Replaces 8 separate boolean state flags with a single discriminated state.
 * 
 * Modals supported:
 * - 'PAYMENT'        : Cash / QRIS / Split / Kasbon payment sheet
 * - 'MEMBER'         : Member identification modal
 * - 'HELD_ORDERS'    : Parked / held transactions queue
 * - 'CASH_MOVEMENT'  : Petty cash (Kas Kecil) In / Out modal
 * - 'CONSIGNMENT'   : Quick consignment (Titipan Harian) modal
 * - 'HARDWARE'       : Thermal printer & peripheral settings
 * - 'INTERNAL_USE'   : Store consumption / operational expense at HPP
 * - 'SUCCESS'        : Completed transaction reassurance & receipt
 */
export function usePosModalManager() {
    const [activeModal, setActiveModal] = useState({ type: null, props: {} });

    const openModal = useCallback((type, props = {}) => {
        setActiveModal({ type, props });
    }, []);

    const closeModal = useCallback(() => {
        setActiveModal({ type: null, props: {} });
    }, []);

    const isModalOpen = useCallback((type) => {
        return activeModal.type === type;
    }, [activeModal.type]);

    const isAnyModalOpen = Boolean(activeModal.type);

    return {
        activeModal,
        openModal,
        closeModal,
        isModalOpen,
        isAnyModalOpen,
    };
}
