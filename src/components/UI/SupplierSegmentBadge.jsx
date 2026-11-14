import React from 'react';
import { GraduationCap, UserCheck, Building2 } from 'lucide-react';

/**
 * SupplierSegmentBadge
 * 
 * Apple HIG-compliant tactile segment micro-glyph for Suppliers.
 * Replaces noisy text-heavy pills with high-glanceability icon-only tokens:
 * - ANGGOTA   : Emerald squircle with UserCheck glyph
 * - MAHASISWA : Indigo squircle with GraduationCap glyph
 * - EKSTERNAL : Quiet slate squircle with Building2 glyph
 * 
 * Hovering surfaces rich native tooltip information without visual clutter.
 */
export default function SupplierSegmentBadge({ 
    supplier, 
    segment: explicitSegment,
    variant = 'icon', // 'icon' (default Apple HIG micro-glyph) | 'pill' (icon + text)
    size = 'sm', // 'sm' (20px) | 'md' (24px)
    showMemberName = false,
    className = '' 
}) {
    const rawSegment = explicitSegment || supplier?.segment || supplier?.segment_label || '';
    const rawUpper = String(rawSegment).toUpperCase();
    
    let segment = 'EKSTERNAL';
    if (supplier?.is_member || rawUpper.includes('ANGGOTA')) {
        segment = 'ANGGOTA';
    } else if (rawUpper.includes('MAHASISWA')) {
        segment = 'MAHASISWA';
    }

    const memberName = supplier?.user?.name || (supplier?.owner_name && segment === 'ANGGOTA' ? supplier.owner_name : null);

    // Visual configurations per segment: Pure White Tactile Surface + Colored Outline & Icon
    const config = {
        MAHASISWA: {
            label: 'Mahasiswa',
            tooltip: 'Mitra Mahasiswa Kampus (Plafond Drop Harian)',
            container: 'bg-white text-indigo-600 border-indigo-400/85 hover:border-indigo-500',
            iconColor: 'text-indigo-600',
            Icon: GraduationCap,
        },
        ANGGOTA: {
            label: 'Anggota',
            tooltip: memberName ? `Anggota Koperasi: ${memberName}` : 'Anggota Koperasi Manasuka',
            container: 'bg-white text-emerald-700 border-emerald-400/85 hover:border-emerald-500',
            iconColor: 'text-emerald-600',
            Icon: UserCheck,
        },
        EKSTERNAL: {
            label: 'Eksternal',
            tooltip: 'Vendor / Distributor Eksternal',
            container: 'bg-white text-slate-600 border-slate-300 hover:border-slate-400',
            iconColor: 'text-slate-500',
            Icon: Building2,
        },
    }[segment] || {
        label: 'Eksternal',
        tooltip: 'Vendor / Distributor Eksternal',
        container: 'bg-white text-slate-600 border-slate-300 hover:border-slate-400',
        iconColor: 'text-slate-500',
        Icon: Building2,
    };

    const { label, tooltip, container, iconColor, Icon } = config;

    // ── Apple HIG Micro-Glyph (Icon-Only Token) ──────────────────────────
    if (variant === 'icon') {
        const boxSize = size === 'md' ? 'w-6 h-6 rounded-lg' : 'w-5 h-5 rounded-md';
        const iconSize = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';

        return (
            <span
                className={`inline-flex items-center justify-center border shadow-2xs shrink-0 select-none cursor-help transition-transform hover:scale-110 ${boxSize} ${container} ${className}`}
                title={tooltip}
                aria-label={tooltip}
            >
                <Icon className={`${iconSize} ${iconColor} shrink-0`} strokeWidth={2.2} />
            </span>
        );
    }

    // ── Pill Variant with Text (Fallback when explicit text is desired) ──
    const sizeClasses = size === 'md' ? 'text-xs px-2.5 py-1 gap-1.5' : 'text-[10px] px-2 py-0.5 gap-1.5';
    const iconSize = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';

    return (
        <span
            className={`inline-flex items-center rounded-full border shadow-2xs select-none font-bold ${sizeClasses} ${container} ${className}`}
            title={tooltip}
        >
            <Icon className={`${iconSize} ${iconColor} shrink-0`} strokeWidth={2.2} />
            <span>{label}</span>
            {showMemberName && memberName && (
                <span className="opacity-80 font-mono text-[9px] max-w-[90px] truncate">
                    ({memberName})
                </span>
            )}
        </span>
    );
}

