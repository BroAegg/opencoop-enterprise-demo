import React from 'react';

/**
 * EmptyState
 * Apple HIG / ContentUnavailableView standard.
 * - Naked, delicate stroke icon (no circular bubble wrapper).
 * - Serene typography with semantic hierarchy.
 * - Flat uncontained structure to eliminate boxception / nested card borders.
 */
export default function EmptyState({ 
    icon: Icon, 
    title, 
    description, 
    action,
    className = ""
}) {
    return (
        <div className={`flex flex-col items-center justify-center py-10 px-4 text-center ${className}`}>
            {Icon && (
                <Icon className="w-8 h-8 text-slate-300 stroke-[1.25] mb-2.5" />
            )}
            
            {title && (
                <h3 className="text-sm font-semibold text-slate-700 mb-1 tracking-tight">
                    {title}
                </h3>
            )}
            
            {description && (
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {description}
                </p>
            )}
            
            {action && (
                <div className="mt-4">{action}</div>
            )}
        </div>
    );
}

