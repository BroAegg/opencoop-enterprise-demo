import React from 'react';

/**
 * StatusBadge
 *
 * Apple HIG & Monochromatic Pro Standard.
 * - Supports variants:
 *   1. 'subtle' (default): Soft semantic tinted surface with subtle hairline border.
 *   2. 'tactile': Apple tactile elevated white pill with specular highlight and ambient shadow.
 *   3. 'solid': 3D jewel enamel pill with specular bevel highlight.
 *   4. 'naked': Clean indicator with dot & text without container capsule.
 * - Optional status dot with pulse animation.
 */
export default function StatusBadge({ 
    status, 
    variant = 'subtle', // 'subtle' | 'tactile' | 'solid' | 'naked'
    className = "", 
    icon: Icon = null,
    dot = false,
    pulse = false,
    children
}) {
    const rawNormalized = (typeof status === 'string' ? status : (typeof children === 'string' ? children : '')).toUpperCase();
    
    // Friendly localized label dictionary for raw enum keys
    const statusLabels = {
        PENDING_REVIEW: 'Menunggu Kurasi',
        PRODUCT_APPROVED: 'Sampel Diminta',
        SAMPLE_RECEIVED: 'Sampel Diterima',
        SAMPLE_REJECTED: 'Perlu Revisi',
        SAMPLE_REVISION: 'Perlu Revisi',
        NEED_REVISION: 'Perlu Revisi',
        VERIFIED: 'Disetujui',
        REJECTED: 'Ditolak',
    };

    const displayStatus = children || statusLabels[rawNormalized] || status;
    const normalized = rawNormalized;

    // Map status to semantic colors
    const getSemanticColors = () => {
        switch (normalized) {
            case 'AKTIF':
            case 'ACTIVE':
                return {
                    subtle: 'text-slate-700 bg-slate-100 border border-slate-200/80',
                    solid: 'bg-slate-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1.5px_3px_rgba(0,0,0,0.2)]',
                    dot: 'bg-emerald-500',
                };
            case 'APPROVED':
            case 'VERIFIED':
            case 'LUNAS':
            case 'COMPLETED':
            case 'OPEN':
            case 'CAIR':
            case 'DISBURSED':
            case 'RECEIVED':
            case 'VALIDATED':
            case 'SUCCESS':
            case 'OPTIMAL':
            case 'SANGAT SEHAT':
            case 'PUBLISHED':
            case 'TERBIT':
            case 'AMAN':
                return {
                    subtle: 'text-emerald-700 bg-emerald-50 border border-emerald-200/70',
                    solid: 'bg-emerald-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1.5px_3px_rgba(5,150,105,0.3)]',
                    dot: 'bg-emerald-500',
                };
            case 'PENDING':
            case 'UNPAID':
            case 'BELUM_BAYAR':
            case 'BELUM DIBAYAR':
            case 'PENDING_REVIEW':
            case 'PRODUCT_APPROVED':
            case 'SAMPLE_RECEIVED':
            case 'PROSES':
            case 'REVIEW':
            case 'MENUNGGU':
            case 'ORDERED':
            case 'PARTIAL':
            case 'DRAFT':
            case 'WARNING':
                return {
                    subtle: 'text-amber-800 bg-amber-50 border border-amber-200/70',
                    solid: 'bg-amber-400 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1.5px_3px_rgba(217,119,6,0.25)] border border-amber-500/20',
                    dot: 'bg-amber-500',
                };
            case 'SAMPLE_REJECTED':
            case 'SAMPLE_REVISION':
            case 'NEED_REVISION':
            case 'REVISI':
                return {
                    subtle: 'text-amber-800 bg-amber-50 border border-amber-200/70',
                    solid: 'bg-amber-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1.5px_3px_rgba(217,119,6,0.3)]',
                    dot: 'bg-amber-500',
                };
            case 'NONAKTIF':
            case 'REJECTED':
            case 'OVERDUE':
            case 'KELUAR':
            case 'LOCKED':
            case 'DITOLAK':
            case 'DISPUTE':
            case 'CANCELLED':
            case 'DANGER':
            case 'CRITICAL':
            case 'ERROR':
                return {
                    subtle: 'text-rose-700 bg-rose-50 border border-rose-200/70',
                    solid: 'bg-rose-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1.5px_3px_rgba(225,29,72,0.3)]',
                    dot: 'bg-rose-500',
                };
            case 'SHIPPED':
            case 'KIRIM':
            case 'HARIAN':
            case 'MINGGUAN':
            case 'BULANAN':
            case 'TEAL':
            case 'INFO':
                return {
                    subtle: 'text-teal-800 bg-teal-50 border border-teal-200/70',
                    solid: 'bg-[#1F6376] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1.5px_3px_rgba(31,99,118,0.3)]',
                    dot: 'bg-teal-500',
                };
            case 'MENINGGAL':
            case 'CLOSED':
            case 'WAIVED':
            case 'DIBEBASKAN':
                return {
                    subtle: 'text-slate-600 bg-slate-100 border border-slate-200/60',
                    solid: 'bg-slate-800 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1.5px_3px_rgba(0,0,0,0.2)]',
                    dot: 'bg-slate-400',
                };
            default:
                return {
                    subtle: 'text-sky-800 bg-sky-50 border border-sky-200/70',
                    solid: 'bg-sky-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1.5px_3px_rgba(2,132,199,0.3)]',
                    dot: 'bg-sky-500',
                };
        }
    };

    const colors = getSemanticColors();
    const shouldShowDot = dot === true || pulse || (variant === 'naked' && dot !== false);

    if (variant === 'naked') {
        return (
            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 select-none ${className}`}>
                {shouldShowDot && (
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot} ${pulse ? 'animate-pulse' : ''}`} />
                )}
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0 text-slate-500" strokeWidth={2} />}
                <span>{displayStatus}</span>
            </div>
        );
    }

    const wrapClass = variant === 'tactile'
        ? 'bg-white text-slate-700 border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_white]'
        : variant === 'solid'
            ? colors.solid
            : colors.subtle;

    return (
        <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full select-none whitespace-nowrap transition-colors ${wrapClass} ${className}`}>
            {shouldShowDot && (
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot} ${pulse ? 'animate-pulse' : ''}`} />
            )}
            {Icon && <Icon className="w-3 h-3 shrink-0" strokeWidth={2} />}
            <span>{displayStatus}</span>
        </span>
    );
}

