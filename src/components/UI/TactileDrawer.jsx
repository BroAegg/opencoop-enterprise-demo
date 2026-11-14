import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * TactileDrawer
 * Slide-over sheet / offcanvas drawer with tactile headers, backdrop blur, and smooth spring physics.
 */
export default function TactileDrawer({
    isOpen,
    onClose,
    position = 'right', // 'right' | 'left' | 'bottom'
    title,
    description,
    children,
    footer,
    width = 'md', // 'sm' | 'md' | 'lg' | 'xl'
    className = '',
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') onClose?.();
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
        document.body.style.overflow = 'unset';
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const widthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
    }[width] || 'max-w-md';

    const slideAnimations = {
        right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
        left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
        bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
    }[position] || slideAnimations.right;

    const positionClasses = {
        right: 'inset-y-0 right-0',
        left: 'inset-y-0 left-0',
        bottom: 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl',
    }[position] || 'inset-y-0 right-0';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex select-none">
                {/* Backdrop Blur */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                    onClick={onClose}
                />

                {/* Drawer Content Panel */}
                <motion.div
                    {...slideAnimations}
                    transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                    className={`fixed ${positionClasses} w-full ${position !== 'bottom' ? widthClasses : ''} bg-white border-l border-slate-200/90 shadow-[0_0_50px_rgba(0,0,0,0.18)] flex flex-col z-10 ${className}`}
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <div>
                            {title && (
                                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                                    {title}
                                </h3>
                            )}
                            {description && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {description}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
                            {footer}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

