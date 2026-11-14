import React from 'react';

/**
 * TactileGroupedList
 * 
 * Apple HIG Inset Grouped List container with squircle geometry,
 * specular highlight, uppercase section header, and subtle helper footer.
 * Automatically injects `isLast` to child rows for border hairline management.
 */
export default function TactileGroupedList({
    title,
    headerAction,
    footer,
    variant = 'white', // 'white' | 'sunken'
    children,
    className = '',
}) {
    const validChildren = React.Children.toArray(children).filter(Boolean);

    const containerStyle = variant === 'sunken'
        ? 'bg-slate-50/90 border border-slate-200/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]'
        : 'bg-white border border-slate-200/80 shadow-[0_1.5px_4px_rgba(0,0,0,0.04),inset_0_1px_0_white]';

    return (
        <div className={`w-full ${className}`}>
            {/* Header: Uppercase Micro Section Title & Action */}
            {(title || headerAction) && (
                <div className="flex items-center justify-between px-3 sm:px-4 mb-2">
                    {title && (
                        <h4 className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {title}
                        </h4>
                    )}
                    {headerAction && (
                        <div className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors">
                            {headerAction}
                        </div>
                    )}
                </div>
            )}

            {/* Inset Squircle Container */}
            <div className={`rounded-3xl ${containerStyle} overflow-hidden divide-y divide-slate-100/90`}>
                {validChildren.map((child, idx) => {
                    if (!React.isValidElement(child)) return child;
                    const isLast = idx === validChildren.length - 1;
                    return React.cloneElement(child, {
                        isLast,
                    });
                })}
            </div>

            {/* iOS Settings-style Footer Helper Note */}
            {footer && (
                <p className="px-3 sm:px-4 mt-2 text-[11px] text-slate-400 font-normal leading-relaxed">
                    {footer}
                </p>
            )}
        </div>
    );
}

