import React from 'react';
import { Store, Clock, Package } from 'lucide-react';
import { SUPPLY_TYPES, getProductSupplyType } from '@/Pages/Admin/Retail/utils/stockHealthUtils';

/**
 * SupplyTypeBadge
 * 
 * Apple HIG-compliant tactile supply micro-glyph for Retail Products.
 * Replaces noisy text-heavy pastel pills with high-glanceability tactile tokens:
 * - STORE_OWNED        : Emerald squircle with Store vector icon (Milik Toko Sendiri)
 * - DAILY_CONSIGNMENT  : Indigo squircle with Clock vector icon (Titipan Harian 24 Jam)
 * - SHELF_CONSIGNMENT  : Purple squircle with Package vector icon (Titipan Rak / Kering)
 * 
 * Hovering surfaces rich native tooltip information without visual clutter.
 */
export default function SupplyTypeBadge({
    product,
    supplyType: explicitSupplyType,
    variant = 'icon', // 'icon' (tactile micro-glyph) | 'pill' (icon + compact label)
    size = 'sm', // 'xs' | 'sm' | 'md'
    className = '',
}) {
    const supplyType = explicitSupplyType || getProductSupplyType(product);

    const config = {
        [SUPPLY_TYPES.STORE_OWNED]: {
            label: 'Toko',
            tooltip: 'Milik Toko Sendiri (Kulakan Beli Putus / Grosir)',
            container: 'bg-white text-emerald-700 border-emerald-400/85 hover:border-emerald-500',
            iconColor: 'text-emerald-600',
            Icon: Store,
        },
        [SUPPLY_TYPES.DAILY_CONSIGNMENT]: {
            label: 'Harian',
            tooltip: 'Konsinyasi Harian (Dropping Pagi, Rekonsiliasi Sore)',
            container: 'bg-white text-indigo-700 border-indigo-400/85 hover:border-indigo-500',
            iconColor: 'text-indigo-600',
            Icon: Clock,
        },
        [SUPPLY_TYPES.SHELF_CONSIGNMENT]: {
            label: 'Rak',
            tooltip: 'Konsinyasi Rak (Snack Kering Kemasan UMKM)',
            container: 'bg-white text-purple-700 border-purple-400/85 hover:border-purple-500',
            iconColor: 'text-purple-600',
            Icon: Package,
        },
    }[supplyType] || {
        label: 'Toko',
        tooltip: 'Milik Toko Sendiri',
        container: 'bg-white text-slate-700 border-slate-300 hover:border-slate-400',
        iconColor: 'text-slate-600',
        Icon: Store,
    };

    const { label, tooltip, container, iconColor, Icon } = config;

    // ── 1. Apple HIG Micro-Glyph (Icon-Only Tactile Squircle) ─────────────
    if (variant === 'icon') {
        const boxSizes = {
            xs: 'w-4.5 h-4.5 rounded',
            sm: 'w-6 h-6 rounded-lg',
            md: 'w-7 h-7 rounded-lg',
        };
        const iconSizes = {
            xs: 'w-2.5 h-2.5',
            sm: 'w-3.5 h-3.5',
            md: 'w-4 h-4',
        };

        const boxClass = boxSizes[size] || boxSizes.sm;
        const iconClass = iconSizes[size] || iconSizes.sm;

        return (
            <span
                className={`inline-flex items-center justify-center border shadow-2xs shrink-0 select-none cursor-help transition-transform hover:scale-110 ${boxClass} ${container} ${className}`}
                title={tooltip}
                aria-label={tooltip}
            >
                <Icon className={`${iconClass} ${iconColor} shrink-0`} strokeWidth={2.2} />
            </span>
        );
    }

    // ── 2. Compact Tactile Pill (Icon + 1 Kata Singkat) ───────────────────
    const pillSizes = {
        xs: 'text-[10px] px-1.5 py-0.5 gap-1',
        sm: 'text-[11px] px-2 py-0.5 gap-1.5',
        md: 'text-xs px-2.5 py-1 gap-1.5',
    };
    const pillIconSizes = {
        xs: 'w-2.5 h-2.5',
        sm: 'w-3 h-3',
        md: 'w-3.5 h-3.5',
    };

    const pillClass = pillSizes[size] || pillSizes.sm;
    const pillIconClass = pillIconSizes[size] || pillIconSizes.sm;

    return (
        <span
            className={`inline-flex items-center rounded-md border shadow-2xs select-none font-semibold leading-none ${pillClass} ${container} ${className}`}
            title={tooltip}
        >
            <Icon className={`${pillIconClass} ${iconColor} shrink-0`} strokeWidth={2.2} />
            <span>{label}</span>
        </span>
    );
}

