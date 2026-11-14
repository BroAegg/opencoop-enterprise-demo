import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';

/**
 * Shared floating-anchor positioning hook for React Portals.
 * Keeps dropdowns and popovers anchored to their triggers while escaping
 * parent `overflow-hidden` containers and clamping within viewport bounds.
 */
export default function useFloatingPopover({
    isOpen,
    onClose,
    align = 'left',
    matchWidth = false,
    estimatedHeight = 280,
    estimatedWidth = 320,
    gap = 6,
    padding = 12,
}) {
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const measuredOpenRef = useRef(false);
    const [style, setStyle] = useState(null);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current || typeof window === 'undefined') return;

        const rect = triggerRef.current.getBoundingClientRect();
        const popEl = popoverRef.current;
        const popWidth = matchWidth ? rect.width : (popEl?.offsetWidth || estimatedWidth);
        const popHeight = popEl?.offsetHeight || estimatedHeight;

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const spaceBelow = vh - rect.bottom - padding;
        const spaceAbove = rect.top - padding;
        const openUpward = spaceBelow < popHeight && spaceAbove > spaceBelow;

        const rawLeft = matchWidth
            ? rect.left
            : align === 'right'
                ? rect.right - popWidth
                : rect.left;

        const maxLeft = Math.max(padding, vw - popWidth - padding);
        const left = Math.max(padding, Math.min(maxLeft, rawLeft));

        setStyle({
            position: 'fixed',
            left: `${Math.round(left)}px`,
            zIndex: 120,
            ...(matchWidth ? { width: `${Math.round(rect.width)}px` } : {}),
            ...(openUpward
                ? {
                      bottom: `${Math.round(vh - rect.top + gap)}px`,
                      maxHeight: `${Math.max(160, Math.round(spaceAbove - gap))}px`,
                  }
                : {
                      top: `${Math.round(rect.bottom + gap)}px`,
                      maxHeight: `${Math.max(160, Math.round(spaceBelow - gap))}px`,
                  }),
        });
    }, [align, matchWidth, estimatedHeight, estimatedWidth, gap, padding]);

    useLayoutEffect(() => {
        if (!isOpen) {
            measuredOpenRef.current = false;
            setStyle(null);
            return;
        }
        updatePosition();
    }, [isOpen, updatePosition]);

    useLayoutEffect(() => {
        if (isOpen && style && !measuredOpenRef.current && popoverRef.current) {
            measuredOpenRef.current = true;
            updatePosition();
        }
    }, [isOpen, style, updatePosition]);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutside = (e) => {
            if (triggerRef.current?.contains(e.target) || popoverRef.current?.contains(e.target)) {
                return;
            }
            onClose?.();
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose?.();
            }
        };

        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('keydown', handleEscape);
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('keydown', handleEscape);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen, onClose, updatePosition]);

    return { triggerRef, popoverRef, style, updatePosition };
}

