import React from 'react';

/**
 * ChartTooltip - Unified Apple HIG & SAK compliant tooltip for all Recharts visualizations.
 * 
 * Features:
 * - 100% Solid Opacity (bg-white shadow-xl): Zero collision with underlying canvas text/metrics.
 * - Tabular numbers with monospace alignment for precise financial scanning.
 * - Optional custom sort hierarchy (order array).
 * - Clean contextual header with optional badge/sublabel.
 */
export default function ChartTooltip({
    active,
    payload,
    label,
    order = null,
    subLabel = null,
    valuePrefix = 'Rp ',
    formatValue = null,
    title = null,
    titleFormatter = null,
    className = '',
}) {
    if (!active || !payload || !payload.length) return null;

    // Header label resolution
    const headerTitle = title 
        || (titleFormatter ? titleFormatter(label, payload) : null)
        || payload[0]?.payload?.full_month 
        || label 
        || '';

    // Sort payload by specified order if provided
    let items = [...payload];
    if (order && Array.isArray(order) && order.length > 0) {
        items.sort((a, b) => {
            const idxA = order.indexOf(a.dataKey);
            const idxB = order.indexOf(b.dataKey);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });
    }

    const renderFormattedValue = (val) => {
        if (formatValue) return formatValue(val);
        if (typeof val === 'number') {
            return `${valuePrefix}${Math.round(val).toLocaleString('id-ID')}`;
        }
        return val;
    };

    return (
        <div className={`bg-white rounded-xl border border-slate-200/90 shadow-xl p-3 min-w-[200px] text-[11px] pointer-events-none z-50 ${className}`}>
            {headerTitle && (
                <div className="text-[11px] font-semibold text-slate-900 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between gap-3">
                    <span className="truncate">{headerTitle}</span>
                    {subLabel && (
                        <span className="text-[10px] font-normal text-slate-400 shrink-0">
                            {subLabel}
                        </span>
                    )}
                </div>
            )}
            <div className="space-y-1.5">
                {items.map((entry) => {
                    const color = entry.color || entry.payload?.fill || entry.payload?.color || '#3b82f6';
                    const name = entry.name || entry.dataKey;
                    const val = entry.value;
                    const pct = entry.payload?.pct;

                    return (
                        <div key={entry.dataKey || name} className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                                <span 
                                    className="w-2 h-2 rounded-full shrink-0" 
                                    style={{ backgroundColor: color }} 
                                />
                                <span className="truncate">{name}</span>
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono tabular-nums font-semibold text-slate-900">
                                    {renderFormattedValue(val)}
                                </span>
                                {pct !== undefined && pct !== null && (
                                    <span className="font-mono tabular-nums text-slate-400 text-[10px]">
                                        {pct}%
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

