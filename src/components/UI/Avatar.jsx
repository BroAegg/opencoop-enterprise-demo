import React, { useState } from 'react';

/**
 * Avatar (Apple HIG Quiet Authority)
 * Global avatar component with photo support, graceful fallback to 2-letter uppercase initials,
 * and unified sizing/shaping across the cooperative application.
 */
export default function Avatar({
    name = '',
    src = null,
    photo = null,
    size = 'md',
    shape = 'rounded-xl',
    variant = 'light',
    dot = null,
    className = '',
}) {
    const [imgError, setImgError] = useState(false);

    // Resolve raw photo source (supports photo prop or src prop)
    const rawPhoto = photo || src;
    const photoUrl = typeof rawPhoto === 'string' && rawPhoto.trim()
        ? (rawPhoto.startsWith('http') || rawPhoto.startsWith('/') ? rawPhoto : `/storage/${rawPhoto}`)
        : null;

    // Generate clean 2-letter uppercase initials
    const initials = React.useMemo(() => {
        if (!name || typeof name !== 'string') return 'AG';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }, [name]);

    // Apple HIG sizing matrix
    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-[11px]',
        md: 'w-9 h-9 text-xs',
        lg: 'w-11 h-11 text-sm',
        xl: 'w-14 h-14 text-base',
        '2xl': 'w-20 h-20 text-2xl',
    }[size] || size;

    // Shape options (Apple squircle default)
    const shapeClasses = {
        'rounded-lg': 'rounded-lg',
        'rounded-xl': 'rounded-xl',
        'rounded-2xl': 'rounded-2xl',
        'rounded-full': 'rounded-full',
        circle: 'rounded-full',
        squircle: 'rounded-xl',
    }[shape] || shape;

    // Visual styles for initials container
    const variantClasses = {
        light: 'bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs',
        dark: 'bg-slate-900 text-white border border-slate-800 shadow-2xs',
        brand: 'bg-[#1F6376]/10 text-[#1F6376] border border-[#1F6376]/20 shadow-2xs',
        neutral: 'bg-slate-50 text-slate-600 border border-slate-200/60 shadow-2xs',
    }[variant] || variantClasses.light;

    const hasValidPhoto = Boolean(photoUrl && !imgError);

    return (
        <div className={`relative inline-flex shrink-0 ${sizeClasses} ${className}`}>
            {hasValidPhoto ? (
                <img
                    src={photoUrl}
                    alt={name || 'Avatar'}
                    onError={() => setImgError(true)}
                    className={`w-full h-full object-cover border border-slate-200/80 shadow-2xs ${shapeClasses}`}
                />
            ) : (
                <div
                    className={`w-full h-full flex items-center justify-center font-bold font-mono select-none tracking-tight ${shapeClasses} ${variantClasses}`}
                    title={name}
                >
                    {initials}
                </div>
            )}

            {/* Optional status micro-dot */}
            {dot && (
                <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                        dot === 'active' || dot === 'online' || dot === true
                            ? 'bg-emerald-500'
                            : dot === 'inactive'
                                ? 'bg-slate-300'
                                : 'bg-amber-500'
                    }`}
                />
            )}
        </div>
    );
}

