import React from 'react';
import FloatingBottomDock from '@/Components/Navigation/FloatingBottomDock';

export default function MobileNav({ backUrl, onBack, mobileNavigation, currentPath = '' }) {
    if (backUrl || onBack) return null;

    return (
        <FloatingBottomDock 
            items={mobileNavigation} 
            currentPath={currentPath} 
            layoutId="adminFloatingDockActive"
        />
    );
}
