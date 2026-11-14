import React from 'react';

export default function AppleFormGroup({ 
    title, 
    description, 
    children, 
    className = "",
    footer
}) {
    return (
        <div className={`flex flex-col mb-4 ${className}`}>
            {/* Header (Apple Grouped Style: outside the card) */}
            {(title || description) && (
                <div className="px-2 mb-2">
                    {title && <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>}
                    {description && <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>}
                </div>
            )}
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {/* Content */}
                <div className="flex flex-col">
                    {children}
                </div>

                {/* Footer / Actions */}
                {footer && (
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

