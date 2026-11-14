import React from 'react';
import { MenuItems } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LiquidGlassPopover
 *
 * VisionOS & macOS Sequoia-inspired morphing floating glass popover.
 * Directly integrates with Headless UI Menu to provide:
 * 1. Fluid spring-driven morphing anchored to the trigger position.
 * 2. Lens blur + scale expansion (blur(8px) -> blur(0px)).
 * 3. Exact Liquid Glass optical parameters (65% alpha, 190% saturation, double specular bevel).
 * 4. Full keyboard navigation and accessibility via Headless UI.
 */
export default function LiquidGlassPopover({
    open,
    children,
    widthClass = 'w-56',
    align = 'right',
    className = '',
}) {
    const origin = align === 'right' ? 'top right' : 'top left';
    const anchor = {
        to: align === 'right' ? 'bottom end' : 'bottom start',
        gap: 8,
        padding: 12,
    };

    return (
        <AnimatePresence>
            {open && (
                <MenuItems
                    static
                    anchor={anchor}
                    className="z-[120] focus:outline-none [--anchor-max-height:70vh]"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.88, y: -8, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.92, y: -6, filter: 'blur(6px)' }}
                        transition={{
                            type: 'spring',
                            stiffness: 480,
                            damping: 32,
                            mass: 0.75,
                        }}
                        style={{ transformOrigin: origin }}
                        className={`${widthClass} material-liquid-glass-popover rounded-2xl p-1.5 focus:outline-none overflow-hidden divide-y divide-slate-200/50 ${className}`}
                    >
                        {children}
                    </motion.div>
                </MenuItems>
            )}
        </AnimatePresence>
    );
}
