import React from 'react';
import Card from './Card';

export default function FormCard({ 
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
                <div className="px-2 mb-2.5">
                    {title && <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">{title}</h3>}
                    {description && <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>}
                </div>
            )}
            
            <Card className="flex flex-col overflow-hidden shadow-sm" innerPadding="p-0">
                {/* Content */}
                <div className="p-6">
                    {children}
                </div>

                {/* Footer / Actions */}
                {footer && (
                    <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
                        {footer}
                    </div>
                )}
            </Card>
        </div>
    );
}

