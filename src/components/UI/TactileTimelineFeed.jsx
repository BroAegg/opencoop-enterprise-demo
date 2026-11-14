import React from 'react';
import StatusBadge from '@/Components/UI/StatusBadge';

/**
 * TactileTimelineFeed
 * 
 * Apple HIG vertical chronological timeline feed container.
 * Renders real-time transaction streams, audit trails, and cashier shift events
 * with vertical grooved connection lines and 3D status nodes.
 */
export default function TactileTimelineFeed({
    title,
    subtitle,
    live = false,
    headerAction,
    children,
    emptyMessage = 'Belum ada aktivitas tercatat pada periode ini.',
    className = '',
}) {
    const validChildren = React.Children.toArray(children).filter(Boolean);

    return (
        <div className={`w-full ${className}`}>
            {/* Header: Title, Live Indicator & Action */}
            {(title || live || headerAction) && (
                <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        {title && (
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                                {title}
                            </h4>
                        )}
                        {live && (
                            <StatusBadge status="SUCCESS" pulse={true}>
                                Live Feed
                            </StatusBadge>
                        )}
                        {subtitle && (
                            <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                                • {subtitle}
                            </span>
                        )}
                    </div>

                    {headerAction && (
                        <div className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors">
                            {headerAction}
                        </div>
                    )}
                </div>
            )}

            {/* Timeline Items List */}
            {validChildren.length > 0 ? (
                <div className="relative pl-1">
                    {validChildren.map((child, idx) => {
                        if (!React.isValidElement(child)) return child;
                        const isLast = idx === validChildren.length - 1;
                        return React.cloneElement(child, {
                            isLast,
                        });
                    })}
                </div>
            ) : (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-400 font-medium">
                    {emptyMessage}
                </div>
            )}
        </div>
    );
}

