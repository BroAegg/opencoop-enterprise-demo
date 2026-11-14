import React from 'react';

/**
 * TactileMobileRowCard
 * Apple HIG-inspired Inset Card representation for tabular rows on mobile viewports.
 * Transforms multi-column tabular data into a structured 3-tier hierarchy:
 * 1. Header: Primary identity (title, subtitle) + Hero Metric (amount/status)
 * 2. Inset Matrix: Multi-column key-value micro-grid
 * 3. Footer: Secondary badges or actions
 */
export default function TactileMobileRowCard({
    columns = [],
    row = {},
    rowIndex = 0,
    onRowClick = null,
    renderMobileCard = null,
}) {
    // If consumer provides a bespoke mobile card renderer, delegate directly
    if (typeof renderMobileCard === 'function') {
        return renderMobileCard(row, rowIndex);
    }

    // Auto-detect columns by role or heuristic
    const primaryCol = columns.find(c => c.primary) || columns[0];
    const heroCol = columns.find(c => c.hero) || 
        columns.find(c => c.align === 'right' && c.mono && c.key !== primaryCol?.key) ||
        columns.find(c => /amount|total|nominal|saldo|price/i.test(c.key) && c.key !== primaryCol?.key);
    const actionCol = columns.find(c => c.key === 'actions' || /aksi/i.test(c.label));

    // Secondary columns for the 2-column or 3-column inset matrix
    const secondaryCols = columns.filter(c => 
        c.key !== primaryCol?.key && 
        c.key !== heroCol?.key && 
        c.key !== actionCol?.key &&
        !c.hiddenOnMobile
    );

    const renderCellValue = (col) => {
        if (!col) return null;
        return col.render ? col.render(row[col.key], row, rowIndex) : row[col.key];
    };

    return (
        <div
            onClick={() => onRowClick && onRowClick(row)}
            className={`bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs transition-all select-none ${
                onRowClick ? 'cursor-pointer hover:border-slate-300 active:scale-[0.99] active:bg-slate-50/70' : ''
            }`}
        >
            {/* 1. Card Header: Primary Identity + Hero Value */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug truncate">
                        {renderCellValue(primaryCol)}
                    </div>
                </div>

                {heroCol && (
                    <div className="text-right shrink-0">
                        <div className="text-xs sm:text-sm font-bold font-mono text-[#1F6376]">
                            {renderCellValue(heroCol)}
                        </div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">
                            {heroCol.label}
                        </span>
                    </div>
                )}
            </div>

            {/* 2. Inset Matrix: Key-Value Micro Grid */}
            {secondaryCols.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    {secondaryCols.map((col, idx) => (
                        <div key={col.key || idx} className="min-w-0">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block truncate">
                                {col.label}
                            </span>
                            <div className={`mt-0.5 font-semibold text-slate-700 truncate ${col.mono ? 'font-mono' : ''}`}>
                                {renderCellValue(col)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. Footer / Actions */}
            {actionCol && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end">
                    {renderCellValue(actionCol)}
                </div>
            )}
        </div>
    );
}

