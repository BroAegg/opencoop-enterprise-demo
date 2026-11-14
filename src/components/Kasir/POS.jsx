import React from 'react';
import { Head } from '@inertiajs/react';
import { AnimatePresence } from 'framer-motion';
import KasirLayout from '@/Layouts/KasirLayout';
import { PosProvider, usePos } from './Context/PosContext';
import PosMainWorkstation from './Components/POS/PosMainWorkstation';
import PosVendorWorkstation from './Components/POS/VendorWorkstation/PosVendorWorkstation';
import PosModalHost from './Components/POS/PosModalHost';

/**
 * PosWorkstationHost
 * 
 * Non-Modal Dual-Workspace Router:
 * - 'SALES'  : Primary Customer Barcode & Cart Workstation.
 * - 'VENDOR' : Mitra Vendor Drop, Retur, & Settle Split-Screen Workstation.
 * Transitions smoothly with Apple HIG spring physics, preserving state.
 */
function PosWorkstationHost() {
    const { activeWorkspace, setActiveWorkspace } = usePos();

    return (
        <AnimatePresence mode="wait">
            {activeWorkspace === 'VENDOR' ? (
                <PosVendorWorkstation
                    key="vendor-workstation"
                    onBackToSales={() => setActiveWorkspace('SALES')}
                />
            ) : (
                <PosMainWorkstation key="sales-workstation" />
            )}
        </AnimatePresence>
    );
}

/**
 * POS: Top-Level Declarative Entry Point for Cashier Terminal.
 */
export default function POS() {
    return (
        <PosProvider>
            <KasirLayout>
                <Head title="Point of Sale" />
                <PosWorkstationHost />
                <PosModalHost />
            </KasirLayout>
        </PosProvider>
    );
}
