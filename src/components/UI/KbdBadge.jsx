import React from 'react';

/**
 * KbdBadge
 * Apple keyboard keycap badge for hotkey indicators in POS & ERP modules.
 */
export default function KbdBadge({
    children,
    size = 'sm', // 'xs' | 'sm' | 'md'
    className = '',
}) {
    const sizeClasses = {
        xs: 'h-4 px-1 text-[9px] min-w-4',
        sm: 'h-5 px-1.5 text-[10px] min-w-5',
        md: 'h-6 px-2 text-xs min-w-6',
    }[size] || 'h-5 px-1.5 text-[10px] min-w-5';

    // Normalize shortcut symbols if text matches
    const renderContent = () => {
        if (typeof children !== 'string') return children;
        const normalized = children.toLowerCase();
        if (normalized === 'cmd' || normalized === 'command') return '⌘';
        if (normalized === 'shift') return '⇧';
        if (normalized === 'ctrl' || normalized === 'control') return '⌃';
        if (normalized === 'alt' || normalized === 'option') return '⌥';
        if (normalized === 'enter' || normalized === 'return') return '↵';
        if (normalized === 'esc') return '⎋';
        return children;
    };

    return (
        <kbd
            className={`inline-flex items-center justify-center font-mono font-bold text-slate-600 bg-white border border-slate-200/90 border-b-2 rounded-md shadow-[0_1px_1px_rgba(0,0,0,0.06),inset_0_1px_0_white] select-none ${sizeClasses} ${className}`}
        >
            {renderContent()}
        </kbd>
    );
}

