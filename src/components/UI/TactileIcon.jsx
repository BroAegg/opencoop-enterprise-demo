import React from 'react';

/**
 * TactileIcon
 * 
 * Apple HIG-inspired tactile icon container featuring thin precision stroke (SF Symbols style),
 * specular top highlights, subtle physical depth, and squircle corners.
 */
const sizeMap = {
    '2xs': {
        container: 'w-5 h-5 rounded-md',
        icon: 'w-3 h-3',
        defaultStroke: 1.75,
    },
    'xs': {
        container: 'w-6 h-6 rounded-lg',
        icon: 'w-3.5 h-3.5',
        defaultStroke: 1.75,
    },
    'sm': {
        container: 'w-7 h-7 rounded-xl',
        icon: 'w-4 h-4',
        defaultStroke: 1.75,
    },
    'md': {
        container: 'w-9 h-9 rounded-2xl',
        icon: 'w-4.5 h-4.5',
        defaultStroke: 1.75,
    },
    'lg': {
        container: 'w-11 h-11 rounded-2xl',
        icon: 'w-5 h-5',
        defaultStroke: 1.75,
    },
    'xl': {
        container: 'w-14 h-14 rounded-3xl',
        icon: 'w-6 h-6',
        defaultStroke: 1.75,
    },
};

const variantMap = {
    // White elevated micro-plate with specular reflection (Apple HIG hardware dial style)
    plate: 'bg-white border border-slate-200/80 shadow-[inset_0_1px_0_white,0_1px_2px_rgba(0,0,0,0.03)]',
    
    // Neutral slate container (macOS Settings / Apple Wallet style)
    neutral: 'bg-slate-100 border border-slate-200/80 shadow-[inset_0_1px_0_white] text-slate-700',
    
    // Recessed milled groove
    sunken: 'bg-slate-100/80 border border-slate-200/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]',
    
    // Soft tinted container
    soft: 'bg-slate-50 border border-slate-200/60 shadow-2xs',
    
    // Bare icon without surrounding box, enforcing thin stroke and standard sizing
    ghost: '',
};

export default function TactileIcon({
    icon: Icon,
    variant = 'plate',
    size = 'xs',
    color = 'text-slate-600',
    strokeWidth,
    rounded,
    className = '',
    ...props
}) {
    if (!Icon) return null;

    const sizeConfig = sizeMap[size] || sizeMap.xs;
    const finalStroke = strokeWidth ?? sizeConfig.defaultStroke;

    if (variant === 'ghost') {
        return (
            <Icon
                className={`${sizeConfig.icon} ${color} shrink-0 ${className}`}
                strokeWidth={finalStroke}
                aria-hidden="true"
                {...props}
            />
        );
    }

    const containerStyle = variantMap[variant] || variantMap.plate;
    const roundedClass = rounded ? rounded : sizeConfig.container;

    return (
        <div
            className={`inline-flex items-center justify-center shrink-0 ${roundedClass} ${containerStyle} ${color} ${className}`}
            {...props}
        >
            <Icon
                className={`${sizeConfig.icon} shrink-0`}
                strokeWidth={finalStroke}
                aria-hidden="true"
            />
        </div>
    );
}

