import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * CopyButton
 * Instant tactile clipboard copier with tactile bounce animation and localized feedback.
 */
export default function CopyButton({
    text,
    label = '',
    size = 'sm', // 'xs' | 'sm' | 'md'
    variant = 'tactile', // 'tactile' | 'subtle' | 'ghost'
    successText = 'Tersalin!',
    className = '',
    title = 'Salin ke clipboard',
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e) => {
        e.stopPropagation();
        if (!text) return;

        try {
            await navigator.clipboard.writeText(String(text));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers or non-secure contexts
            const textArea = document.createElement('textarea');
            textArea.value = String(text);
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const sizeClasses = {
        xs: 'h-6 px-2 text-[10px] gap-1 rounded-md',
        sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-lg',
        md: 'h-8 px-3 text-xs gap-1.5 rounded-xl',
    }[size] || 'h-7 px-2.5 text-xs gap-1.5 rounded-lg';

    const iconSizes = {
        xs: 'w-3 h-3',
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
    }[size] || 'w-3.5 h-3.5';

    const variantClasses = {
        tactile: copied
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs'
            : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200/80 shadow-2xs',
        subtle: copied
            ? 'bg-emerald-100/70 text-emerald-700 border-transparent'
            : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600 border-transparent',
        ghost: copied
            ? 'text-emerald-600 bg-emerald-50/50'
            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/60',
    }[variant] || 'bg-white border-slate-200/80 text-slate-600 shadow-2xs';

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center justify-center font-medium border transition-all active:scale-95 select-none ${sizeClasses} ${variantClasses} ${className}`}
            title={copied ? successText : title}
        >
            {copied ? (
                <>
                    <Check className={`${iconSizes} text-emerald-600 stroke-[2.5] animate-in zoom-in-50 duration-150`} />
                    <span className="font-semibold text-emerald-700">
                        {label ? successText : ''}
                    </span>
                </>
            ) : (
                <>
                    <Copy className={`${iconSizes} text-slate-400 group-hover:text-slate-600`} />
                    {label && <span>{label}</span>}
                </>
            )}
        </button>
    );
}

