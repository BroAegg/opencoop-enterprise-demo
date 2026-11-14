import React from 'react';
import { motion } from 'framer-motion';
import usePosVendorHub from '../VendorHub/usePosVendorHub';
import PosVendorDirectoryPanel from './PosVendorDirectoryPanel';
import PosVendorWorksheetPanel from './PosVendorWorksheetPanel';

/**
 * PosVendorWorkstation
 * 
 * The Non-Modal Mitra Vendor & Consignment Dual-Workspace.
 * Replaces the cramped F9 popup modal with a full, quiet split-screen workspace
 * that matches PosMainWorkstation's exact spatial dimensions and muscle memory.
 */
export default function PosVendorWorkstation({ onBackToSales }) {
    const hub = usePosVendorHub({
        isOpen: true,
        onClose: onBackToSales,
        onSuccess: () => {
            hub.fetchConsignmentData?.(true);
        },
    });

    const formatRp = (num) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num || 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="flex flex-col md:flex-row gap-4 h-[calc(100vh-7.5rem)] font-sans"
        >
            {/* Left: Vendor Master Directory */}
            <PosVendorDirectoryPanel
                suppliers={hub.suppliers}
                selectedVendorId={hub.selectedVendorId}
                onSelectVendor={hub.setSelectedVendorId}
                formatRp={formatRp}
                isLoading={hub.isLoading}
                onBackToSales={onBackToSales}
            />

            {/* Right: Vendor Worksheet & Payout Panel */}
            <PosVendorWorksheetPanel
                hub={hub}
                formatRp={formatRp}
                onDeselectVendor={() => hub.setSelectedVendorId(null)}
            />
        </motion.div>
    );
}
