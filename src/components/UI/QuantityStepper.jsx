import React from 'react';
import { Plus, Minus } from 'lucide-react';

/**
 * QuantityStepper
 * 
 * Apple HIG-compliant tactile quantity / value stepper with touchscreen-friendly targets (>= 40px).
 * Supports quick batch increment chips (+5, +10) and zero reset button.
 */
export default function QuantityStepper({
    value = '',
    onChange,
    onStep,
    min = 0,
    max = Infinity,
    step = 1,
    placeholder = '0',
    batchIncrements = [],
    showZeroButton = false,
    size = 'md', // 'sm' | 'md'
    disabled = false,
    className = '',
    inputClassName = '',
}) {
    const isSm = size === 'sm';

    // Parse numeric value safely
    const numericValue = value !== '' && value !== undefined && value !== null && !isNaN(Number(value))
        ? Number(value)
        : null;

    const handleStep = (delta) => {
        if (disabled) return;
        if (onStep) {
            onStep(delta);
            return;
        }

        const base = numericValue !== null ? numericValue : min;
        const nextVal = Math.max(min, Math.min(max, base + delta));
        onChange?.(String(nextVal));
    };

    const handleInputChange = (e) => {
        if (disabled) return;
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (val === '') {
            onChange?.('');
            return;
        }
        const num = Number(val);
        if (max !== Infinity && num > max) {
            onChange?.(String(max));
            return;
        }
        onChange?.(val);
    };

    const handleSetZero = () => {
        if (disabled) return;
        onChange?.('0');
    };

    return (
        <div className={`flex items-center gap-1.5 shrink-0 ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
            {/* Quick Batch Increment Chips (e.g., +5, +10) */}
            {batchIncrements.length > 0 && (
                <div className="flex items-center gap-1">
                    {batchIncrements.map((inc) => (
                        <button
                            key={inc}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleStep(inc)}
                            className={`rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-mono transition-all cursor-pointer active:scale-95 ${
                                isSm ? 'px-2 py-1.5 text-[11px]' : 'px-2.5 py-2 text-xs'
                            }`}
                            title={`Tambah ${inc}`}
                        >
                            +{inc}
                        </button>
                    ))}
                </div>
            )}

            {/* Stepper Shell */}
            <div className={`flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/80 shrink-0`}>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleStep(-step)}
                    className={`shrink-0 rounded-lg bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-700 active:scale-95 transition-all cursor-pointer ${
                        isSm ? 'w-8 h-8' : 'w-10 h-10'
                    }`}
                    title={`Kurang (${step})`}
                >
                    <Minus className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} pointer-events-none`} />
                </button>

                <input
                    type="text"
                    inputMode="numeric"
                    disabled={disabled}
                    value={value !== null && value !== undefined ? String(value) : ''}
                    placeholder={placeholder}
                    onFocus={(e) => e.target.select()}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            handleStep(step);
                        } else if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            handleStep(-step);
                        }
                    }}
                    onChange={handleInputChange}
                    className={`text-center font-mono font-bold text-slate-900 bg-transparent outline-none placeholder-slate-300 tabular-nums shrink-0 ${
                        isSm ? 'w-10 text-xs py-1' : 'w-14 text-sm sm:text-base py-1.5'
                    } ${inputClassName}`}
                />

                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleStep(step)}
                    className={`shrink-0 rounded-lg bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-700 active:scale-95 transition-all cursor-pointer ${
                        isSm ? 'w-8 h-8' : 'w-10 h-10'
                    }`}
                    title={`Tambah (${step})`}
                >
                    <Plus className={`${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} pointer-events-none`} />
                </button>

                {/* Optional Zero Reset Button */}
                {showZeroButton && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={handleSetZero}
                        className={`shrink-0 ml-1 font-bold rounded-lg border transition-all cursor-pointer active:scale-95 ${
                            isSm ? 'h-8 px-2 text-[11px]' : 'h-10 px-3 text-xs'
                        } ${
                            value === '0' || numericValue === 0
                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                        title="Nolkan (sisa 0)"
                    >
                        0
                    </button>
                )}
            </div>
        </div>
    );
}

