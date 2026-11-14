import React from 'react';

/**
 * TactileSwitch
 * 
 * Apple HIG physical tactile toggle switch with sunken track well,
 * specular highlight, sliding 3D enamel thumb bead, and optional label/description.
 */
export default function TactileSwitch({
    checked = false,
    onChange,
    label,
    description,
    color = 'teal', // 'teal' | 'emerald' | 'amber' | 'indigo'
    size = 'md',    // 'sm' | 'md' | 'lg'
    disabled = false,
    name,
    id,
    className = '',
}) {
    const handleToggle = (e) => {
        if (disabled) return;
        if (onChange) {
            onChange(!checked);
        }
    };

    const handleKeyDown = (e) => {
        if (disabled) return;
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (onChange) {
                onChange(!checked);
            }
        }
    };

    const sizeStyles = {
        sm: {
            track: 'w-8 h-4.5 p-0.5',
            thumb: 'w-3.5 h-3.5',
            translate: 'translate-x-3.5',
            label: 'text-xs',
            sub: 'text-[10px]',
        },
        md: {
            track: 'w-11 h-6 p-0.5',
            thumb: 'w-5 h-5',
            translate: 'translate-x-5',
            label: 'text-sm',
            sub: 'text-xs',
        },
        lg: {
            track: 'w-13 h-7.5 p-1',
            thumb: 'w-5.5 h-5.5',
            translate: 'translate-x-5.5',
            label: 'text-base',
            sub: 'text-xs',
        },
    };

    const activeSize = sizeStyles[size] || sizeStyles.md;

    const colorMap = {
        teal: 'bg-[#1F6376] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(31,99,118,0.3)]',
        emerald: 'bg-emerald-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(5,150,105,0.3)]',
        amber: 'bg-amber-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(245,158,11,0.3)]',
        indigo: 'bg-indigo-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(79,70,229,0.3)]',
    };

    const activeBg = colorMap[color] || colorMap.teal;
    const inactiveBg = 'bg-slate-200/90 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.1),inset_0_-1px_0_white] border border-slate-300/60';

    return (
        <label
            htmlFor={id}
            className={`inline-flex items-center justify-between gap-3 select-none ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${className}`}
        >
            {(label || description) && (
                <div className="flex flex-col min-w-0 pr-1">
                    {label && (
                        <span className={`font-semibold text-slate-800 tracking-tight leading-tight ${activeSize.label}`}>
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className={`text-slate-400 font-normal leading-tight mt-0.5 ${activeSize.sub}`}>
                            {description}
                        </span>
                    )}
                </div>
            )}

            {/* Hidden native input for form compatibility and accessibility */}
            <input
                type="checkbox"
                id={id}
                name={name}
                checked={checked}
                onChange={handleToggle}
                disabled={disabled}
                className="sr-only"
            />

            {/* Apple HIG Physical Recessed Pill Track */}
            <div
                role="switch"
                aria-checked={checked}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={handleKeyDown}
                onClick={handleToggle}
                className={`
                    relative rounded-full transition-all duration-200 ease-out shrink-0 flex items-center
                    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-600 focus:outline-none
                    ${activeSize.track}
                    ${checked ? activeBg : inactiveBg}
                `}
            >
                {/* 3D Sliding Jewel Thumb Bead */}
                <div
                    className={`
                        rounded-full bg-white transition-transform duration-200 ease-out
                        shadow-[0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_0_white] border border-slate-100/60
                        ${activeSize.thumb}
                        ${checked ? activeSize.translate : 'translate-x-0'}
                    `}
                />
            </div>
        </label>
    );
}

