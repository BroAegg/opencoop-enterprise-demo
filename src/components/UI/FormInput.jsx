import React, { forwardRef, useState } from 'react';
import { Info, Eye, EyeOff } from 'lucide-react';
import TactileTooltip from './TactileTooltip';

export const formatRupiah = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    if (typeof val === 'number') return Number.isFinite(val) ? new Intl.NumberFormat('id-ID').format(Math.round(val)) : '';
    let str = String(val).trim();
    if (!str) return '';
    if (/^-?\d+\.\d{1,2}$/.test(str)) {
        const num = parseFloat(str);
        if (!isNaN(num)) return new Intl.NumberFormat('id-ID').format(Math.round(num));
    }
    const cleaned = str.replace(/\.00$/, '').replace(/\D/g, '');
    return cleaned ? new Intl.NumberFormat('id-ID').format(Number(cleaned)) : '';
};

export const parseRupiah = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    if (typeof val === 'number') return Number.isFinite(val) ? Math.round(val) : '';
    let str = String(val).trim();
    if (!str) return '';
    if (/^-?\d+\.\d{1,2}$/.test(str)) {
        const num = parseFloat(str);
        return !isNaN(num) ? Math.round(num) : '';
    }
    const cleaned = str.replace(/\.00$/, '').replace(/\D/g, '');
    return cleaned ? Number(cleaned) : '';
};

const FormInput = forwardRef(({ 
    label, 
    tooltip,
    error, 
    type = 'text', 
    id,
    size = 'md',
    className = '',
    inputClassName = '',
    labelClassName = '',
    prefixClassName = '',
    helpText,
    icon: Icon,
    prefix,
    suffix,
    isCurrency = false,
    isNumeric = false,
    allowDecimal = false,
    allowNegative = false,
    value,
    onChange,
    placeholder,
    ...props 
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const isTextarea = type === 'textarea';
    const isDigitOnly = isCurrency || isNumeric;
    const resolvedPrefix = isCurrency ? (prefix ?? 'Rp') : prefix;
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : (isDigitOnly ? 'text' : type);
    const resolvedPlaceholder = placeholder ?? (isCurrency ? '0' : placeholder);
    const resolvedPattern = props.pattern !== undefined
        ? props.pattern
        : (isCurrency ? undefined : (isNumeric ? (allowDecimal ? undefined : '[0-9]*') : undefined));
    const isControlled = value !== undefined;
    const displayValue = isControlled 
        ? (isCurrency 
            ? formatRupiah(value) 
            : (isNumeric ? (value !== null && value !== undefined ? String(value) : '') : value)) 
        : undefined;

    const handleKeyDown = (e) => {
        if (props.onKeyDown) props.onKeyDown(e);
        if (e.defaultPrevented) return;

        if (isDigitOnly) {
            // Allow control keys (Ctrl/Cmd combos, Backspace, Delete, Tab, Arrows, Enter, etc.)
            if (
                e.ctrlKey || 
                e.metaKey || 
                e.altKey || 
                [
                    'Backspace', 
                    'Delete', 
                    'Tab', 
                    'Escape', 
                    'Enter', 
                    'ArrowLeft', 
                    'ArrowRight', 
                    'ArrowUp', 
                    'ArrowDown', 
                    'Home', 
                    'End'
                ].includes(e.key)
            ) {
                return;
            }

            // Optional decimal separator (. or ,)
            if (allowDecimal && (e.key === '.' || e.key === ',') && !String(e.target.value).includes('.') && !String(e.target.value).includes(',')) {
                return;
            }

            // Optional negative sign (-) at the start
            if (allowNegative && e.key === '-' && !String(e.target.value).includes('-') && e.target.selectionStart === 0) {
                return;
            }

            // Reject anything that is not a digit 0-9
            if (!/^\d$/.test(e.key)) {
                e.preventDefault();
            }
        }
    };

    const handlePaste = (e) => {
        if (props.onPaste) props.onPaste(e);
        if (e.defaultPrevented) return;

        if (isDigitOnly) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData)?.getData('text') || '';
            const cleanDigits = allowDecimal 
                ? pastedText.replace(/[^0-9.,]/g, '') 
                : pastedText.replace(/\D/g, '');
            
            const syntheticEvent = {
                ...e,
                target: {
                    ...e.target,
                    name: e.target.name,
                    value: cleanDigits,
                },
            };
            handleChange(syntheticEvent);
        }
    };

    const handleChange = (e) => {
        if (!onChange) return;
        if (isCurrency) {
            const raw = e.target.value.replace(/\D/g, '');
            // Transparent proxy preserving synthetic event methods while providing raw unformatted numeric string in e.target.value
            const targetProxy = new Proxy(e.target, {
                get(target, prop) {
                    if (prop === 'value') return raw;
                    const val = target[prop];
                    return typeof val === 'function' ? val.bind(target) : val;
                }
            });
            const eventProxy = new Proxy(e, {
                get(target, prop) {
                    if (prop === 'target') return targetProxy;
                    const val = target[prop];
                    return typeof val === 'function' ? val.bind(target) : val;
                }
            });
            onChange(eventProxy);
        } else if (isNumeric) {
            const clean = allowDecimal
                ? e.target.value.replace(/[^0-9.,]/g, '')
                : e.target.value.replace(/\D/g, '');
            const targetProxy = new Proxy(e.target, {
                get(target, prop) {
                    if (prop === 'value') return clean;
                    const val = target[prop];
                    return typeof val === 'function' ? val.bind(target) : val;
                }
            });
            const eventProxy = new Proxy(e, {
                get(target, prop) {
                    if (prop === 'target') return targetProxy;
                    const val = target[prop];
                    return typeof val === 'function' ? val.bind(target) : val;
                }
            });
            onChange(eventProxy);
        } else {
            onChange(e);
        }
    };

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <div className="flex items-center gap-1.5">
                    <label htmlFor={id} className={labelClassName || 'text-[13px] font-medium text-slate-700'}>
                        {label}
                    </label>
                    {tooltip && (
                        <TactileTooltip content={tooltip} placement="top">
                            <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help" />
                        </TactileTooltip>
                    )}
                </div>
            )}
            
            <div className="relative">
                {resolvedPrefix && (
                    <span className={`absolute ${size === 'sm' ? 'left-2.5 text-xs' : 'left-3.5 text-[13px]'} ${isTextarea ? (size === 'sm' ? 'top-1.5' : 'top-2.5') : 'top-1/2 -translate-y-1/2'} font-medium text-slate-500 z-10 pointer-events-none ${prefixClassName}`}>
                        {resolvedPrefix}
                    </span>
                )}
                {Icon && !resolvedPrefix && (
                    <Icon className={`w-4 h-4 absolute ${size === 'sm' ? 'left-2.5' : 'left-3.5'} ${isTextarea ? (size === 'sm' ? 'top-2' : 'top-3') : 'top-1/2 -translate-y-1/2'} text-slate-400 z-10 pointer-events-none`} strokeWidth={1.5} />
                )}
                
                {isTextarea ? (
                    <textarea
                        id={id}
                        ref={ref}
                        rows={props.rows || 3}
                        {...(isControlled ? { value: displayValue ?? '' } : {})}
                        onChange={handleChange}
                        placeholder={resolvedPlaceholder}
                        className={`
                            w-full ${size === 'sm' ? 'rounded-lg py-1.5 text-xs' : 'rounded-xl py-2.5 text-xs sm:text-sm'} font-normal transition-colors resize-none text-slate-900
                            ${resolvedPrefix ? (size === 'sm' ? 'pl-8' : 'pl-10') : Icon ? (size === 'sm' ? 'pl-8' : 'pl-10') : (size === 'sm' ? 'pl-2.5' : 'pl-3.5')}
                            ${suffix ? (size === 'sm' ? 'pr-9' : 'pr-11') : (size === 'sm' ? 'pr-2.5' : 'pr-3.5')}
                            ${error 
                                ? 'bg-white border border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 placeholder-slate-400' 
                                : `${inputClassName?.includes('bg-') ? '' : 'bg-slate-50/90 hover:bg-slate-100/60 shadow-inner'} ${inputClassName?.includes('border-') ? '' : 'border border-slate-200/80'} focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 focus:shadow-none placeholder-slate-400`}
                            disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                            ${inputClassName}
                        `}
                        {...props}
                    />
                ) : (
                    <input
                        id={id}
                        type={resolvedType}
                        inputMode={isDigitOnly ? 'numeric' : props.inputMode}
                        pattern={resolvedPattern}
                        ref={ref}
                        {...(isControlled ? { value: displayValue ?? '' } : {})}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder={resolvedPlaceholder}
                        className={`
                            w-full ${size === 'sm' ? 'rounded-lg py-1.5 text-xs' : 'rounded-xl py-2.5 text-xs sm:text-sm'} font-normal transition-colors text-slate-900
                            ${resolvedPrefix ? (size === 'sm' ? 'pl-8' : 'pl-10') : Icon ? (size === 'sm' ? 'pl-8' : 'pl-10') : (size === 'sm' ? 'pl-2.5' : 'pl-3.5')}
                            ${(suffix || isPassword) ? (size === 'sm' ? 'pr-9' : 'pr-11') : (size === 'sm' ? 'pr-2.5' : 'pr-3.5')}
                            ${isDigitOnly ? 'font-mono' : ''}
                            ${error 
                                ? 'bg-white border border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 placeholder-slate-400' 
                                : `${inputClassName?.includes('bg-') ? '' : 'bg-slate-50/90 hover:bg-slate-100/60 shadow-inner'} ${inputClassName?.includes('border-') ? '' : 'border border-slate-200/80'} focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 focus:shadow-none placeholder-slate-400`}
                            disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                            ${inputClassName}
                        `}
                        {...props}
                    />
                )}

                {suffix && (
                    <span className={`absolute ${size === 'sm' ? 'right-2.5 text-xs' : 'right-4 text-[13px]'} ${isTextarea ? (size === 'sm' ? 'top-1.5' : 'top-2.5') : 'top-1/2 -translate-y-1/2'} font-medium text-slate-500 z-10`}>
                        {suffix}
                    </span>
                )}

                {!suffix && isPassword && (
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(p => !p)}
                        className={`absolute ${size === 'sm' ? 'right-2' : 'right-3'} top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 focus:outline-none transition-colors z-10`}
                        title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {helpText && !error && (
                <p className="text-[11px] text-slate-500 mt-0.5">{helpText}</p>
            )}
            
            {error && (
                <p className="text-[11px] text-rose-500 font-medium mt-0.5">{error}</p>
            )}
        </div>
    );
});

export default FormInput;

