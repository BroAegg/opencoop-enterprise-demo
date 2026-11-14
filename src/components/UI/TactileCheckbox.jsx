import React from 'react';
import { Check, Minus } from 'lucide-react';

/**
 * TactileCheckbox
 * 
 * Apple HIG tactile checkbox with physical recessed well,
 * specular jewel active state, smooth checkmark animation, and accessible label.
 */
export default function TactileCheckbox({
    checked = false,
    indeterminate = false,
    onChange,
    label,
    description,
    color = 'teal', // 'teal' | 'emerald' | 'amber' | 'indigo'
    size = 'md',    // 'sm' | 'md'
    disabled = false,
    name,
    id,
    className = '',
}) {
    const handleToggle = () => {
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
            box: 'w-4 h-4 rounded-md',
            icon: 'w-2.5 h-2.5',
            label: 'text-xs',
            sub: 'text-[10px]',
        },
        md: {
            box: 'w-5 h-5 rounded-lg',
            icon: 'w-3.5 h-3.5',
            label: 'text-sm',
            sub: 'text-xs',
        },
    };

    const activeSize = sizeStyles[size] || sizeStyles.md;

    const colorMap = {
        teal: 'bg-[#1F6376] text-white border-teal-600/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(31,99,118,0.3)]',
        emerald: 'bg-emerald-600 text-white border-emerald-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(5,150,105,0.3)]',
        amber: 'bg-amber-500 text-white border-amber-600/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(245,158,11,0.3)]',
        indigo: 'bg-indigo-600 text-white border-indigo-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(79,70,229,0.3)]',
    };

    const activeBg = colorMap[color] || colorMap.teal;
    const inactiveBg = 'bg-slate-100/90 text-transparent border border-slate-200/90 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06),inset_0_-1px_0_white] hover:border-slate-300';

    const isActive = checked || indeterminate;

    return (
        <label
            htmlFor={id}
            className={`inline-flex items-start gap-2.5 select-none ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${className}`}
        >
            {/* Hidden native input */}
            <input
                type="checkbox"
                id={id}
                name={name}
                checked={checked}
                onChange={handleToggle}
                disabled={disabled}
                className="sr-only"
            />

            {/* Apple Tactile Checkbox Box */}
            <div
                role="checkbox"
                aria-checked={indeterminate ? 'mixed' : checked}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={handleKeyDown}
                onClick={handleToggle}
                className={`
                    relative flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150 ease-out
                    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-600 focus:outline-none
                    ${activeSize.box}
                    ${isActive ? activeBg : inactiveBg}
                `}
            >
                {indeterminate ? (
                    <Minus className={`${activeSize.icon} stroke-[3] animate-in zoom-in-75 duration-150`} />
                ) : checked ? (
                    <Check className={`${activeSize.icon} stroke-[3] animate-in zoom-in-75 duration-150`} />
                ) : null}
            </div>

            {(label || description) && (
                <div className="flex flex-col min-w-0">
                    {label && (
                        <span className={`font-semibold text-slate-800 tracking-tight leading-snug ${activeSize.label}`}>
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className={`text-slate-400 font-normal leading-normal mt-0.5 ${activeSize.sub}`}>
                            {description}
                        </span>
                    )}
                </div>
            )}
        </label>
    );
}

