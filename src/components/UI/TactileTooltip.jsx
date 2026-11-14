import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * TactileTooltip
 * 
 * Apple HIG floating tooltip with specular depth, calibrated delay,
 * physical micro-arrow, optional shortcut hint, and dark/light tactile variants.
 * 
 * Powered by React Portal and automatic viewport boundary collision detection
 * to guarantee tooltips never get sliced by parent overflow-hidden or viewport edges.
 */
export default function TactileTooltip({
    content,
    placement = 'top', // 'top' | 'bottom' | 'left' | 'right'
    variant = 'dark',   // 'dark' | 'light'
    delay = 120,
    shortcut = null,
    disabled = false,
    className = '',
    children,
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState(null);
    const [actualPlacement, setActualPlacement] = useState(placement);
    const [arrowOffset, setArrowOffset] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        setIsMounted(true);
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current || typeof window === 'undefined') return;
        const triggerRect = triggerRef.current.getBoundingClientRect();
        
        const tooltipEl = tooltipRef.current;
        const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth : 220;
        const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 32;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 12;
        const gap = 8;

        let resolvedPlacement = placement;
        let top = 0;
        let left = 0;

        // Auto flip top / bottom if vertical space is constrained
        if (placement === 'top') {
            if (triggerRect.top - tooltipHeight - gap < padding && triggerRect.bottom + tooltipHeight + gap <= viewportHeight - padding) {
                resolvedPlacement = 'bottom';
            }
        } else if (placement === 'bottom') {
            if (triggerRect.bottom + tooltipHeight + gap > viewportHeight - padding && triggerRect.top - tooltipHeight - gap >= padding) {
                resolvedPlacement = 'top';
            }
        }

        if (resolvedPlacement === 'top') {
            top = triggerRect.top - tooltipHeight - gap;
            left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2);
        } else if (resolvedPlacement === 'bottom') {
            top = triggerRect.bottom + gap;
            left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2);
        } else if (resolvedPlacement === 'left') {
            top = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2);
            left = triggerRect.left - tooltipWidth - gap;
        } else if (resolvedPlacement === 'right') {
            top = triggerRect.top + (triggerRect.height / 2) - (tooltipHeight / 2);
            left = triggerRect.right + gap;
        }

        // Clamp horizontal position so tooltip never bleeds past viewport left or right
        const minLeft = padding;
        const maxLeft = Math.max(padding, viewportWidth - tooltipWidth - padding);
        const clampedLeft = Math.max(minLeft, Math.min(maxLeft, left));

        // Arrow follows trigger center precisely
        const triggerCenterX = triggerRect.left + (triggerRect.width / 2);
        let arrowX = triggerCenterX - clampedLeft;
        arrowX = Math.max(14, Math.min(tooltipWidth - 14, arrowX));

        setActualPlacement(resolvedPlacement);
        setArrowOffset(arrowX);
        setCoords({ top, left: clampedLeft });
    }, [placement]);

    const showTooltip = () => {
        if (disabled || !content) return;
        timeoutRef.current = setTimeout(() => {
            updatePosition();
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(false);
    };

    useLayoutEffect(() => {
        if (isVisible) {
            updatePosition();
        }
    }, [isVisible, updatePosition]);

    useEffect(() => {
        if (!isVisible) return;
        const handleDismiss = () => {
            hideTooltip();
        };
        window.addEventListener('scroll', handleDismiss, true);
        window.addEventListener('resize', handleDismiss);
        return () => {
            window.removeEventListener('scroll', handleDismiss, true);
            window.removeEventListener('resize', handleDismiss);
        };
    }, [isVisible]);

    if (!content || disabled) {
        return children;
    }

    const variantStyles = {
        dark: 'bg-slate-900/95 text-slate-100 border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.15)]',
        light: 'bg-white/95 text-slate-800 border border-slate-200/90 shadow-[0_8px_20px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0_white]',
    };

    const arrowPlacementStyles = {
        top: {
            arrow: 'top-full border-t-[5px] border-x-[5px] border-b-0 border-x-transparent border-b-transparent',
            color: variant === 'dark' ? 'border-t-slate-900/95' : 'border-t-white',
        },
        bottom: {
            arrow: 'bottom-full border-b-[5px] border-x-[5px] border-t-0 border-x-transparent border-t-transparent',
            color: variant === 'dark' ? 'border-b-slate-900/95' : 'border-b-white',
        },
        left: {
            arrow: 'left-full top-1/2 -translate-y-1/2 border-l-[5px] border-y-[5px] border-r-0 border-y-transparent border-r-transparent',
            color: variant === 'dark' ? 'border-l-slate-900/95' : 'border-l-white',
        },
        right: {
            arrow: 'right-full top-1/2 -translate-y-1/2 border-r-[5px] border-y-[5px] border-l-0 border-y-transparent border-l-transparent',
            color: variant === 'dark' ? 'border-r-slate-900/95' : 'border-r-white',
        },
    };

    return (
        <span 
            ref={triggerRef}
            className="inline-flex items-center"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}

            {isMounted && isVisible && coords && createPortal(
                <span
                    ref={tooltipRef}
                    role="tooltip"
                    style={{
                        position: 'fixed',
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                    }}
                    className={`
                        z-[9999] pointer-events-none flex items-center gap-1.5 px-2.5 py-1 
                        rounded-lg text-[11px] font-medium tracking-tight whitespace-normal max-w-[280px] sm:max-w-xs leading-snug backdrop-blur-md
                        transition-opacity duration-150 ease-out select-none
                        ${variantStyles[variant] || variantStyles.dark}
                        ${className}
                    `}
                >
                    {/* Content Label */}
                    <span>{content}</span>

                    {/* Optional Keyboard Shortcut Pill */}
                    {shortcut && (
                        <kbd className={`
                            px-1.5 py-0.2 rounded text-[9.5px] font-mono font-semibold shrink-0
                            ${variant === 'dark' 
                                ? 'bg-white/15 text-slate-300 border border-white/10' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200/80'}
                        `}>
                            {shortcut}
                        </kbd>
                    )}

                    {/* Physical Arrow Notch */}
                    <span
                        style={{
                            left: arrowOffset != null ? `${arrowOffset}px` : '50%',
                            transform: 'translateX(-50%)',
                        }}
                        className={`
                            absolute w-0 h-0 pointer-events-none
                            ${arrowPlacementStyles[actualPlacement]?.arrow || ''}
                            ${arrowPlacementStyles[actualPlacement]?.color || ''}
                        `}
                    />
                </span>,
                document.body
            )}
        </span>
    );
}

