import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ 
    isOpen, 
    show, 
    onClose, 
    title, 
    children, 
    maxWidth = '2xl',
    hideHeader = false,
}) {
    const isVisible = Boolean(isOpen ?? show);

    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden';
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    onClose?.();
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        '4xl': 'sm:max-w-4xl',
    }[maxWidth] || 'sm:max-w-2xl';

    return (
        <div className="relative z-[100]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
                onClick={onClose}
            />

            {/* Modal Panel Container */}
            <div className="fixed inset-0 z-10 overflow-y-auto pointer-events-none p-0 sm:p-4 md:p-6 flex min-h-full items-end sm:items-center justify-center">
                <div 
                    className={`relative transform overflow-hidden w-full ${maxWidthClass} text-left align-middle transition-all pointer-events-auto bg-white border-t sm:border border-slate-200/80 shadow-2xl rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[92dvh] sm:max-h-[88dvh] animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200`}
                >
                    {/* iOS Grabber for Mobile */}
                    <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#FAFAFB]">
                        <div className="w-10 h-1 bg-slate-300 rounded-full" />
                    </div>

                    {/* Header (rendered if title is provided and hideHeader is false) */}
                    {(!hideHeader && title) && (
                        <div className="shrink-0 flex items-center justify-between gap-3 px-5 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-[#FAFAFB]">
                            <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate pr-2" id="modal-title">
                                {title}
                            </h3>
                            <button
                                type="button"
                                className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer shrink-0"
                                onClick={onClose}
                            >
                                <span className="sr-only">Close</span>
                                <X className="w-4 h-4" strokeWidth={2} />
                            </button>
                        </div>
                    )}
                    
                    {/* Content */}
                    <div className="overflow-y-auto flex-1 min-h-0 flex flex-col custom-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

