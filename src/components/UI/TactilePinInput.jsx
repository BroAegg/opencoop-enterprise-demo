import React, { useRef, useEffect } from 'react';

/**
 * TactilePinInput
 * 6-digit tactile security PIN / OTP input with auto-advance, backspace navigation,
 * and paste detection for supervisor authorization, void, and transaction approvals.
 */
export default function TactilePinInput({
    length = 6,
    value = '',
    onChange,
    onComplete,
    mask = true,
    disabled = false,
    error = false,
    className = '',
}) {
    const inputRefs = useRef([]);

    // Split string into array of characters
    const digits = Array.from({ length }, (_, i) => value[i] || '');

    useEffect(() => {
        if (value.length === length && onComplete) {
            onComplete(value);
        }
    }, [value, length, onComplete]);

    const handleInputChange = (e, index) => {
        const val = e.target.value.replace(/\D/g, '');
        if (!val) return;

        const char = val.slice(-1);
        const newPinArr = [...digits];
        newPinArr[index] = char;
        const newPin = newPinArr.join('').slice(0, length);
        onChange?.(newPin);

        // Move to next input box
        if (index < length - 1 && char) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                // If current box is empty, clear previous box and focus it
                const newPinArr = [...digits];
                newPinArr[index - 1] = '';
                onChange?.(newPinArr.join(''));
                inputRefs.current[index - 1]?.focus();
            } else {
                const newPinArr = [...digits];
                newPinArr[index] = '';
                onChange?.(newPinArr.join(''));
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (pasted) {
            onChange?.(pasted);
            const focusIndex = Math.min(pasted.length, length - 1);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    return (
        <div
            className={`w-full flex items-center justify-center gap-1 sm:gap-2 ${error ? 'animate-shake' : ''} ${className}`}
            onPaste={handlePaste}
        >
            {digits.map((digit, idx) => {
                const isFilled = Boolean(digit);
                return (
                    <div
                        key={idx}
                        className="flex-1 min-w-0 max-w-[40px] sm:max-w-[48px] aspect-[4/5] sm:aspect-square relative flex items-center justify-center"
                    >
                        <input
                            ref={(el) => (inputRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={mask && isFilled ? '•' : digit}
                            disabled={disabled}
                            onChange={(e) => handleInputChange(e, idx)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            className={`
                                w-full h-full text-center text-sm sm:text-lg font-mono font-bold rounded-xl sm:rounded-2xl transition-all outline-none select-none
                                ${error
                                    ? 'bg-rose-50 border-2 border-rose-400 text-rose-700 shadow-inner'
                                    : isFilled
                                        ? 'bg-white border-2 border-[#1F6376] text-slate-900 shadow-[0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0_white]'
                                        : 'bg-slate-100/90 border border-slate-200/80 shadow-inner text-slate-400 hover:bg-slate-100 focus:bg-white focus:border-2 focus:border-[#1F6376] focus:shadow-none'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        />
                    </div>
                );
            })}
        </div>
    );
}

