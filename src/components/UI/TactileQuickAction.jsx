import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * TactileQuickAction
 * 
 * Apple iOS Contact & Wallet-inspired tactile action tile.
 * Features:
 * - Clean floating icon without visual box clutter (no awkward inner canvas)
 * - Physical tactile card surface with specular top highlight
 * - Active haptic scale-95 compression feedback
 * - Proportional vertical breathing room (py-2.5 to py-3, gap-1.5)
 * - Subtle hover micro-interaction (scale-110 icon animation)
 * - Polymorphic support for button, Inertia Link, or external anchor tag.
 */
export default function TactileQuickAction({
    icon: Icon,
    label,
    onClick,
    href,
    target,
    rel,
    variant = 'default', // 'default' | 'emerald' | 'amber' | 'danger' | 'primary'
    disabled = false,
    className = '',
    type = 'button',
    ...props
}) {
    const variantStyles = {
        default: 'text-slate-800 hover:text-slate-950 hover:bg-slate-50/90 border-slate-200/80 hover:border-slate-300',
        emerald: 'text-slate-800 hover:text-emerald-700 hover:bg-emerald-50/50 border-slate-200/80 hover:border-emerald-300/80',
        amber: 'text-slate-800 hover:text-amber-800 hover:bg-amber-50/50 border-slate-200/80 hover:border-amber-300/80',
        danger: 'text-slate-800 hover:text-rose-700 hover:bg-rose-50/60 border-slate-200/80 hover:border-rose-300/80',
        primary: 'text-white bg-slate-900 hover:bg-slate-800 border-slate-900 shadow-[0_2px_4px_rgba(15,23,42,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]',
    }[variant] || 'text-slate-800 hover:text-slate-950 hover:bg-slate-50/90 border-slate-200/80 hover:border-slate-300';

    const iconVariantStyles = {
        default: 'text-slate-600 group-hover:text-slate-900',
        emerald: 'text-emerald-600 group-hover:text-emerald-700',
        amber: 'text-amber-600 group-hover:text-amber-700',
        danger: 'text-rose-600 group-hover:text-rose-700',
        primary: 'text-white group-hover:text-white',
    }[variant] || 'text-slate-600 group-hover:text-slate-900';

    const commonClasses = `flex-1 min-w-[72px] sm:min-w-[80px] py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl bg-white border shadow-[0_1px_3px_rgba(0,0,0,0.03),inset_0_1px_0_white] active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 select-none group cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${variantStyles} ${className}`;

    const innerContent = (
        <>
            {Icon && (
                <Icon 
                    className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 ease-out group-hover:scale-110 ${iconVariantStyles}`} 
                    strokeWidth={1.85} 
                />
            )}
            <span className="text-[11px] sm:text-xs font-semibold tracking-tight text-center leading-none">
                {label}
            </span>
        </>
    );

    if (href && !disabled) {
        const isExternal = target === '_blank' || href.startsWith('http') || href.includes('.pdf') || href.includes('stickers-pdf');
        if (isExternal) {
            return (
                <a
                    href={href}
                    target={target}
                    rel={rel || (target === '_blank' ? 'noreferrer noopener' : undefined)}
                    className={commonClasses}
                    {...props}
                >
                    {innerContent}
                </a>
            );
        }

        return (
            <Link
                href={href}
                className={commonClasses}
                {...props}
            >
                {innerContent}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={commonClasses}
            {...props}
        >
            {innerContent}
        </button>
    );
}

