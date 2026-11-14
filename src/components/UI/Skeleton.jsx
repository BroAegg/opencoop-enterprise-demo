import React from 'react';

/**
 * Global Skeleton Component (Apple HIG Tactile Shimmer)
 * 
 * Provides atomic skeleton primitives and domain presets for smooth, zero-CLS
 * loading states across Kasir POS, Admin Retail, and Supplier portals.
 */
export default function Skeleton({
    className = '',
    variant = 'rect', // 'text' | 'circle' | 'rect' | 'card'
    ...props
}) {
    let variantClasses = 'rounded-md';
    if (variant === 'circle') variantClasses = 'rounded-full';
    if (variant === 'text') variantClasses = 'rounded h-3.5 my-1';
    if (variant === 'card') variantClasses = 'rounded-2xl border border-slate-200/80 bg-white shadow-2xs';

    return (
        <div
            className={`animate-pulse bg-slate-200/70 ${variantClasses} ${className}`}
            {...props}
        />
    );
}

/**
 * Pre-built Preset: KPI Grid (4 Stat Pillars)
 */
Skeleton.KpiGrid = function SkeletonKpiGrid({ count = 4, className = '', cols = null }) {
    const gridCols = cols || (count === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4');
    return (
        <div className={`grid ${gridCols} gap-3 sm:gap-4 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3 animate-pulse"
                >
                    <div className="flex items-center justify-between">
                        <div className="h-3 bg-slate-200/80 rounded w-20" />
                        <div className="w-7 h-7 rounded-xl bg-slate-100" />
                    </div>
                    <div className="space-y-1.5 pt-1">
                        <div className="h-7 sm:h-8 bg-slate-200/90 rounded-lg w-32" />
                        <div className="h-3 bg-slate-200/50 rounded w-24" />
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="h-4 bg-slate-100 rounded-md w-14" />
                        <div className="h-3 bg-slate-100 rounded w-16" />
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Pre-built Preset: Revenue & Profit Chart Card
 */
Skeleton.ChartCard = function SkeletonChartCard({ className = '' }) {
    return (
        <div className={`p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4 animate-pulse ${className}`}>
            {/* Header Level 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="h-4 bg-slate-200/90 rounded w-36" />
                    <div className="h-4 bg-slate-100 rounded-md w-16" />
                </div>
                <div className="h-6 bg-slate-100 rounded-lg w-48" />
            </div>

            {/* Header Level 2: Hero Stat */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pt-1 pb-2">
                <div className="space-y-1.5">
                    <div className="h-8 bg-slate-200/90 rounded-lg w-44" />
                    <div className="h-3 bg-slate-200/50 rounded w-32" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-6 bg-slate-100 rounded-xl w-24" />
                    <div className="h-6 bg-slate-100 rounded-xl w-24" />
                </div>
            </div>

            {/* Chart Area Waves / Wave Placeholder */}
            <div className="h-64 sm:h-72 w-full pt-2 flex items-end justify-between gap-2 px-2">
                {[40, 65, 30, 80, 55, 90, 45, 75, 60, 95, 50, 70].map((h, idx) => (
                    <div
                        key={idx}
                        style={{ height: `${h}%` }}
                        className="flex-1 bg-slate-100/90 rounded-t-sm"
                    />
                ))}
            </div>
        </div>
    );
};

/**
 * Pre-built Preset: Table / Operational Rows
 */
Skeleton.Table = function SkeletonTable({ rows = 6, className = '' }) {
    return (
        <div className={`p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 animate-pulse ${className}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="h-4 bg-slate-200/80 rounded w-40" />
                <div className="h-6 bg-slate-100 rounded-lg w-28" />
            </div>

            <div className="space-y-2 pt-1">
                {Array.from({ length: rows }).map((_, i) => (
                    <div
                        key={i}
                        className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-200/80 shrink-0" />
                            <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="h-3.5 bg-slate-200/80 rounded w-36" />
                                <div className="h-2.5 bg-slate-200/50 rounded w-20" />
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-6">
                            <div className="h-3.5 bg-slate-200/70 rounded w-16" />
                            <div className="h-3.5 bg-slate-200/70 rounded w-20" />
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="h-4 bg-slate-200/80 rounded w-20" />
                            <div className="h-2.5 bg-slate-200/40 rounded w-12" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Pre-built Preset: List items (matching POS Vendor Directory F9)
 */
Skeleton.List = function SkeletonList({ count = 6, className = '' }) {
    return (
        <div className={`flex flex-col gap-1.5 p-0.5 animate-pulse ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3"
                >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-slate-200/80 shrink-0" />
                        <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="h-3.5 bg-slate-200/80 rounded w-28" />
                            <div className="h-2.5 bg-slate-200/50 rounded w-16" />
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="h-4 bg-slate-200/70 rounded-md w-16" />
                        <div className="h-2.5 bg-slate-200/40 rounded w-10" />
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Pre-built Preset: Generic Card
 */
Skeleton.Card = function SkeletonCard({ className = '', height = 'h-64' }) {
    return (
        <div className={`p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3 animate-pulse ${height} ${className}`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="h-4 bg-slate-200/80 rounded w-32" />
                <div className="w-5 h-5 rounded-full bg-slate-100" />
            </div>
            <div className="space-y-2 pt-2">
                <div className="h-8 bg-slate-200/70 rounded-lg w-28" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
        </div>
    );
};

