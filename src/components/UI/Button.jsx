import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * Button / TactileButton
 * 
 * Apple HIG-grade tactile horizontal action button for Manasuka.
 * Features:
 * - Physical tactile surfaces with specular top highlights
 * - Active haptic scale-98 compression feedback
 * - Comprehensive semantic variants (primary deep teal, secondary white, dark slate, danger, ghost)
 * - Automatic loading spinner state with layout preservation
 * - Integrated leading & trailing icon support
 * - Automatic anchor tag fallback for external links, target="_blank", or file downloads
 * - Responsive mobile-fluid prop (`responsive`: full-width on mobile < sm, auto width >= sm)
 */
export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    href,
    target,
    download,
    external = false,
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    processing = false,
    loadingText,
    disabled = false,
    fullWidth = false,
    responsive = false,
    rounded,
    className = '',
    type = 'button',
    ...props
}) {
    const isLoading = loading || processing;
    const isDisabled = disabled || isLoading;

    const baseClasses =
        'inline-flex items-center justify-center font-sans tracking-tight whitespace-nowrap transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6376]/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

    const variants = {
        // 1. Signature Brand Deep Teal (Default Primary CTA)
        primary:
            'bg-[#1F6376] hover:bg-[#164e5d] text-white border border-[#184f5e] shadow-[0_1px_2.5px_rgba(31,99,118,0.3),inset_0_1px_0_rgba(255,255,255,0.22)] active:scale-[0.98] active:brightness-95',
        teal:
            'bg-[#1F6376] hover:bg-[#164e5d] text-white border border-[#184f5e] shadow-[0_1px_2.5px_rgba(31,99,118,0.3),inset_0_1px_0_rgba(255,255,255,0.22)] active:scale-[0.98] active:brightness-95',
        brand:
            'bg-[#1F6376] hover:bg-[#164e5d] text-white border border-[#184f5e] shadow-[0_1px_2.5px_rgba(31,99,118,0.3),inset_0_1px_0_rgba(255,255,255,0.22)] active:scale-[0.98] active:brightness-95',
        accent:
            'bg-[#1F6376] hover:bg-[#164e5d] text-white border border-[#184f5e] shadow-[0_1px_2.5px_rgba(31,99,118,0.3),inset_0_1px_0_rgba(255,255,255,0.22)] active:scale-[0.98] active:brightness-95',

        // 2. Secondary Tactile White (Cancel / Neutral Action)
        secondary:
            'bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border border-slate-200/90 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_white] active:scale-[0.98]',
        white:
            'bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border border-slate-200/90 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_white] active:scale-[0.98]',

        // 3. Dark Slate (Administrative / High-Contrast Monochrome CTA)
        dark:
            'bg-slate-900 hover:bg-slate-800 text-white border border-slate-900/90 shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.18)] active:scale-[0.98]',
        slate:
            'bg-slate-900 hover:bg-slate-800 text-white border border-slate-900/90 shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.18)] active:scale-[0.98]',
        black:
            'bg-slate-900 hover:bg-slate-800 text-white border border-slate-900/90 shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.18)] active:scale-[0.98]',

        // 4. Destructive Danger (Void / Reject / Delete)
        danger:
            'bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 shadow-[0_1px_2px_rgba(225,29,72,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] active:scale-[0.98]',
        'danger-secondary':
            'bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200/90 hover:border-rose-300 shadow-[0_1px_2px_rgba(0,0,0,0.02),inset_0_1px_0_white] active:scale-[0.98]',
        'danger-ghost':
            'bg-transparent hover:bg-rose-50 text-rose-600 hover:text-rose-700 active:scale-[0.98]',

        // 5. Subtle Outline & Ghost
        outline:
            'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300 shadow-2xs active:scale-[0.98]',
        ghost:
            'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 active:scale-[0.98]',
    };

    const sizes = {
        xs: {
            container: 'min-h-[1.75rem] px-2.5 text-[11px] font-semibold gap-1.5',
            rounded: 'rounded-lg',
            icon: 'w-3 h-3',
            spinner: 'w-3 h-3',
        },
        sm: {
            container: 'min-h-[2.125rem] sm:min-h-[2.25rem] px-3 sm:px-3.5 text-xs font-semibold gap-1.5',
            rounded: 'rounded-xl',
            icon: 'w-3.5 h-3.5',
            spinner: 'w-3.5 h-3.5',
        },
        md: {
            container: 'min-h-[2.5rem] sm:min-h-[2.625rem] px-4 sm:px-4.5 text-[12.5px] sm:text-[13px] font-bold gap-2',
            rounded: 'rounded-xl',
            icon: 'w-4 h-4',
            spinner: 'w-4 h-4',
        },
        lg: {
            container: 'min-h-[2.75rem] sm:min-h-[3rem] px-5 sm:px-6 text-xs sm:text-sm font-bold gap-2.5',
            rounded: 'rounded-2xl',
            icon: 'w-4.5 h-4.5',
            spinner: 'w-4.5 h-4.5',
        },
    };

    const sizeConfig = sizes[size] || sizes.md;
    const roundedClass = rounded || sizeConfig.rounded;
    const variantClass = variants[variant] || variants.primary;

    const widthClass = responsive ? 'w-full sm:w-auto' : (fullWidth ? 'w-full' : '');

    const classes = `${baseClasses} ${variantClass} ${sizeConfig.container} ${roundedClass} ${widthClass} ${className}`.trim();

    const renderSpinner = () => (
        <svg
            className={`animate-spin text-current shrink-0 ${sizeConfig.spinner}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );

    const renderIcon = () => {
        if (!Icon) return null;
        if (React.isValidElement(Icon)) {
            return Icon;
        }
        return <Icon className={`${sizeConfig.icon} shrink-0`} strokeWidth={1.85} />;
    };

    const renderChildren = () => {
        if (children === null || children === undefined) return null;
        if (typeof children === 'string' || typeof children === 'number') {
            return <span className="truncate">{children}</span>;
        }
        return (
            <span className="inline-flex items-center justify-center gap-1.5 shrink-0 max-w-full">
                {children}
            </span>
        );
    };

    const content = (
        <>
            {isLoading ? (
                <>
                    {renderSpinner()}
                    <span className="truncate">{loadingText || (typeof children === 'string' ? children : 'Memuat...')}</span>
                </>
            ) : (
                <>
                    {iconPosition === 'left' && renderIcon()}
                    {renderChildren()}
                    {iconPosition === 'right' && renderIcon()}
                </>
            )}
        </>
    );

    // Auto-detect anchor tags: external links, target="_blank", downloads, or file extensions (like PDF)
    const isAnchor = Boolean(
        href && (
            external || 
            target === '_blank' || 
            download || 
            (typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://') || href.includes('.pdf') || href.startsWith('blob:') || href.startsWith('mailto:') || href.startsWith('tel:')))
        )
    );

    if (href && !isDisabled) {
        if (isAnchor) {
            return (
                <a
                    href={href}
                    target={target}
                    rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                    download={download}
                    className={classes}
                    {...props}
                >
                    {content}
                </a>
            );
        }

        return (
            <Link href={href} className={classes} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type={type}
            disabled={isDisabled}
            className={classes}
            {...props}
        >
            {content}
        </button>
    );
}

