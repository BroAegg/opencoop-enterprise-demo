import { useState, useEffect, useCallback } from 'react';

/**
 * usePosProductGridNavigation
 * 
 * Apple HIG Keyboard Navigation Hook for POS Product Grid.
 * Handles Arrow Keys (↑↓←→) 2D traversal, dynamic column detection,
 * automatic viewport scrolling, and seamless scanner refocus.
 */
export function usePosProductGridNavigation({
    isTouchDevice = false,
    displayedProducts = [],
    searchInputRef,
    onSelectProduct,
    gridContainerRef,
    isAnyModalOpen = false,
}) {
    const [activeIndex, setActiveIndex] = useState(null);

    // Reset active keyboard highlight whenever any modal opens
    useEffect(() => {
        if (isAnyModalOpen) {
            setActiveIndex(null);
        }
    }, [isAnyModalOpen]);

    // Dynamic column detection based on actual card layout
    const getColumnsCount = useCallback(() => {
        if (!gridContainerRef.current) return 3;
        const grid = gridContainerRef.current.querySelector('[data-product-grid]');
        if (!grid || !grid.children || grid.children.length === 0) return 3;

        const firstTop = grid.children[0].offsetTop;
        let cols = 0;
        for (let i = 0; i < grid.children.length; i++) {
            if (grid.children[i].offsetTop === firstTop) {
                cols++;
            } else {
                break;
            }
        }
        return Math.max(1, cols || 3);
    }, [gridContainerRef]);

    // Smooth auto-scroll to keep active card in viewport
    useEffect(() => {
        if (activeIndex === null || !gridContainerRef.current) return;
        const grid = gridContainerRef.current.querySelector('[data-product-grid]');
        if (!grid) return;
        const activeCard = grid.children[activeIndex];
        if (activeCard && typeof activeCard.scrollIntoView === 'function') {
            activeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [activeIndex, gridContainerRef]);

    // Ensure activeIndex is bounded if product list shrinks
    useEffect(() => {
        if (activeIndex !== null && activeIndex >= displayedProducts.length) {
            setActiveIndex(displayedProducts.length > 0 ? displayedProducts.length - 1 : null);
        }
    }, [displayedProducts.length, activeIndex]);

    // Global Keyboard Navigation Handler
    useEffect(() => {
        if (isTouchDevice || isAnyModalOpen) return;

        const handleKeyDown = (e) => {
            // Completely disable grid navigation while any modal is open or event was prevented
            if (isAnyModalOpen || e.defaultPrevented) return;

            // Let F-keys pass through for POS global shortcuts
            if (e.key.startsWith('F') && e.key.length <= 3) return;

            // If focus is in search input and Down Arrow is pressed: jump into grid
            if (document.activeElement === searchInputRef?.current) {
                if (e.key === 'ArrowDown' && displayedProducts.length > 0) {
                    e.preventDefault();
                    setActiveIndex(0);
                    searchInputRef.current.blur();
                }
                return;
            }

            // If a product card is currently highlighted
            if (activeIndex !== null) {
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setActiveIndex((prev) => (prev !== null ? Math.min(displayedProducts.length - 1, prev + 1) : 0));
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setActiveIndex((prev) => (prev !== null ? Math.max(0, prev - 1) : 0));
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const cols = getColumnsCount();
                    setActiveIndex((prev) => (prev !== null ? Math.min(displayedProducts.length - 1, prev + cols) : 0));
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const cols = getColumnsCount();
                    if (activeIndex - cols < 0) {
                        // Jump back to search input when navigating above top row
                        setActiveIndex(null);
                        searchInputRef?.current?.focus();
                    } else {
                        setActiveIndex((prev) => (prev !== null ? Math.max(0, prev - cols) : 0));
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const prod = displayedProducts[activeIndex];
                    if (prod) {
                        onSelectProduct(prod);
                    }
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setActiveIndex(null);
                    searchInputRef?.current?.focus();
                } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    // Printable key pressed or barcode scan burst -> refocus search input
                    setActiveIndex(null);
                    searchInputRef?.current?.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTouchDevice, isAnyModalOpen, activeIndex, displayedProducts, getColumnsCount, onSelectProduct, searchInputRef]);

    return {
        activeIndex,
        setActiveIndex,
    };
}

