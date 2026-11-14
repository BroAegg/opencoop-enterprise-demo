import React from 'react';
import PosVendorHubModal from './VendorHub/PosVendorHubModal';

/**
 * PosQuickConsignmentModal
 * 
 * Re-exports PosVendorHubModal to preserve backward compatibility across
 * hotkey triggers, modal hosts, and navigation references.
 */
export default function PosQuickConsignmentModal(props) {
    return <PosVendorHubModal {...props} />;
}
