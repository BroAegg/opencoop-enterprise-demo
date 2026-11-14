import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Barcode as BarcodeIcon } from 'lucide-react';
import PosTopActionBar from './PosTopActionBar';
import PosProductCard from './PosProductCard';
import PosKeyboardRibbon from './PosKeyboardRibbon';
import { usePosProductGridNavigation } from '../../Hooks/usePosProductGridNavigation';

/**
 * PosProductSearchGrid
 * 
 * Ergonomic POS Product Grid supporting seamless Mouseless / Touchpadless navigation.
 * Cashiers can use Arrow Keys (↑↓←→) to navigate the grid and Enter to add items to cart,
 * with automatic viewport scrolling and zero interference with barcode scanning.
 */
export default function PosProductSearchGrid({
    searchQuery = '',
    setSearchQuery,
    searchInputRef,
    onSearchKeyDown,
    searchResults = [],
    addToCart,
    heldOrdersCount = 0,
    onOpenHeldModal,
    onOpenCashMovement,
    onOpenConsignmentModal,
    pendingMultiplier = 1,
    onClearMultiplier,
    onOpenHardwareSettings,
    isPrinterConnected = false,
    catalogList = [],
    onOpenQuickStockAdjust,
    isAnyModalOpen = false,
}) {
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [isManualTyping, setIsManualTyping] = useState(false);
    const gridContainerRef = useRef(null);

    useEffect(() => {
        setIsTouchDevice(typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)));
    }, []);

    // 1. Unpackaged counter goods displayed when idle
    const unpackagedProducts = useMemo(() => {
        if (!catalogList || catalogList.length === 0) return [];

        return catalogList
            .filter((item) => item.packaging_type === 'UNPACKAGED')
            .sort((a, b) => {
                const stockA = Number(a.stock || 0);
                const stockB = Number(b.stock || 0);
                const inStockA = stockA > 0 ? 1 : 0;
                const inStockB = stockB > 0 ? 1 : 0;
                if (inStockA !== inStockB) {
                    return inStockB - inStockA;
                }
                return (a.name || '').localeCompare(b.name || '');
            });
    }, [catalogList]);

    const isSearching = searchQuery.trim().length > 0;
    const displayedProducts = isSearching ? searchResults : unpackagedProducts;

    const handleSelectProduct = useCallback((prod) => {
        addToCart(prod);
        if (isTouchDevice) {
            setIsManualTyping(false);
            if (searchInputRef?.current) {
                searchInputRef.current.blur();
            }
        }
    }, [addToCart, isTouchDevice, searchInputRef]);

    // 2. Mouseless Keyboard Navigation Hook (Arrow Keys + Enter + Dynamic Cols)
    const { activeIndex, setActiveIndex } = usePosProductGridNavigation({
        isTouchDevice,
        displayedProducts,
        searchInputRef,
        onSelectProduct: handleSelectProduct,
        gridContainerRef,
        isAnyModalOpen,
    });

    // Reset active keyboard highlight when search query changes
    useEffect(() => {
        setActiveIndex(null);
    }, [searchQuery, setActiveIndex]);

    const handleSearchInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (isTouchDevice) {
                setIsManualTyping(false);
                searchInputRef?.current?.blur();
            }
        }
        onSearchKeyDown?.(e);
    };

    const handleToggleManualTyping = (active) => {
        setIsManualTyping(active);
        if (active) {
            setTimeout(() => {
                searchInputRef?.current?.focus();
            }, 50);
        } else {
            searchInputRef?.current?.blur();
        }
    };

    return (
        <div className="flex-1 flex flex-col gap-2.5 sm:gap-3 overflow-hidden font-sans">
            {/* Top Action Bar */}
            <PosTopActionBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchInputRef={searchInputRef}
                onKeyDown={handleSearchInputKeyDown}
                isTouchDevice={isTouchDevice}
                isManualTyping={isManualTyping}
                onToggleManualTyping={handleToggleManualTyping}
                pendingMultiplier={pendingMultiplier}
                onClearMultiplier={onClearMultiplier}
                onOpenConsignmentModal={onOpenConsignmentModal}
                onOpenCashMovement={onOpenCashMovement}
                onOpenHeldModal={onOpenHeldModal}
                heldOrdersCount={heldOrdersCount}
            />

            {/* Main Product Canvas */}
            <div 
                ref={gridContainerRef}
                className="flex-1 bg-white rounded-2xl shadow-2xs border border-slate-200 p-2.5 sm:p-3.5 overflow-y-auto custom-scrollbar flex flex-col"
            >
                {displayedProducts.length > 0 ? (
                    <div 
                        data-product-grid="true"
                        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3"
                    >
                        {displayedProducts.map((prod, idx) => (
                            <PosProductCard
                                key={prod.id}
                                product={prod}
                                isActive={activeIndex === idx}
                                onSelect={() => {
                                    setActiveIndex(null);
                                    handleSelectProduct(prod);
                                }}
                                onOpenQuickStockAdjust={onOpenQuickStockAdjust}
                            />
                        ))}
                    </div>
                ) : isSearching ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto select-none">
                        <BarcodeIcon className="w-12 h-12 text-slate-300 mb-3" strokeWidth={1.5} />
                        <h3 className="text-sm font-bold text-slate-700">
                            Tidak ada produk "{searchQuery}"
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            Coba gunakan kata kunci lain atau periksa kembali SKU / nama produk.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto select-none">
                        <BarcodeIcon className="w-12 h-12 text-slate-300 mb-3" strokeWidth={1.5} />
                        <h3 className="text-sm font-bold text-slate-700">Arahkan Barcode Scanner</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            {isTouchDevice 
                                ? "Scan barcode fisik langsung, atau ketuk kolom pencarian untuk cari manual."
                                : "Siap menerima barcode fisik atau pencarian SKU / nama produk."}
                        </p>
                    </div>
                )}
            </div>

            {/* Apple HIG Keyboard Shortcuts Ribbon */}
            <PosKeyboardRibbon isTouchDevice={isTouchDevice} />
        </div>
    );
}

