import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({ 
    value, 
    defaultValue,
    onChange, 
    onClear,
    placeholder = "Cari...", 
    className = "",
    size = "md",
    disabled = false,
    ...props
}) {
    const isSm = size === 'sm';
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue || '');

    useEffect(() => {
        if (!isControlled && defaultValue !== undefined) {
            setInternalValue(defaultValue);
        }
    }, [defaultValue, isControlled]);

    const displayValue = isControlled ? (value ?? '') : internalValue;

    const handleChange = (e) => {
        if (!isControlled) {
            setInternalValue(e.target.value);
        }
        if (onChange) {
            onChange(e);
        }
    };

    const handleClear = () => {
        if (!isControlled) {
            setInternalValue('');
        }
        if (onClear) {
            onClear();
        } else if (onChange) {
            onChange({ target: { value: '' } });
        }
    };

    return (
        <div className={`relative flex items-center ${className}`}>
            <Search 
                className={`${isSm ? 'w-3.5 h-3.5 left-3' : 'w-4 h-4 left-3.5'} absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors`} 
                strokeWidth={1.75} 
            />
            <input 
                type="text" 
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder} 
                disabled={disabled}
                className={`w-full bg-white border border-slate-200/80 rounded-xl transition-all outline-none text-slate-800 placeholder-slate-400 shadow-sm
                    focus:border-primary/60 focus:ring-2 focus:ring-primary/10 hover:border-slate-300
                    disabled:bg-slate-50 disabled:text-slate-400
                    ${isSm 
                        ? 'pl-8 pr-7 py-1.5 text-[12px]' 
                        : 'pl-10 pr-8 py-2 text-[13px]'
                    }`}
                {...props}
            />
            {displayValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors
                        ${isSm ? 'right-2' : 'right-2.5'}`}
                    title="Hapus pencarian"
                >
                    <X className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} strokeWidth={2} />
                </button>
            )}
        </div>
    );
}

