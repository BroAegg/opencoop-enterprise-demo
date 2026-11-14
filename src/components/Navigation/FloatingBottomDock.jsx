import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

/**
 * FloatingBottomDock
 *
 * Universal floating mobile dock inspired by Apple VisionOS Liquid Glass & HIG Thumb Zone.
 * Supports Inertia Links, Action buttons (Drawers/Modals), dynamic badges, and smart autohide.
 */
export default function FloatingBottomDock({ 
    items = [], 
    currentPath = '', 
    layoutId = 'floatingDockActiveIndicator',
    className = '',
    maxWidthClass,
    activeColorClass = 'bg-[#1F6376] shadow-[0_4px_14px_rgba(31,99,118,0.45),inset_0_1px_1px_0_rgba(255,255,255,0.35)] border border-[#184F5E]'
}) {
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);
    const accumulatedDelta = useRef(0);
    const touchStartY = useRef(null);

    // Reset visibility saat navigasi halaman
    useEffect(() => {
        setIsVisible(true);
        lastScrollY.current = 0;
        accumulatedDelta.current = 0;
    }, [currentPath]);

    useEffect(() => {
        // 1. Capture-phase scroll listener (menangkap scroll di window, body, maupun div overflow)
        const onScroll = (e) => {
            const target = e.target;
            if (target !== document && target !== window && target?.scrollHeight && target.scrollHeight <= target.clientHeight) {
                return;
            }

            const currentScrollY = target === document || target === window
                ? (window.scrollY || document.documentElement.scrollTop || 0)
                : (target?.scrollTop || 0);

            // Selalu tampilkan jika berada di dekat paling atas
            if (currentScrollY <= 30) {
                setIsVisible(true);
                accumulatedDelta.current = 0;
                lastScrollY.current = currentScrollY;
                return;
            }

            const diff = currentScrollY - lastScrollY.current;

            if (diff > 0) {
                // Scroll ke bawah
                if (accumulatedDelta.current < 0) accumulatedDelta.current = 0;
                accumulatedDelta.current += diff;
                if (accumulatedDelta.current > 20) {
                    setIsVisible(false);
                }
            } else if (diff < 0) {
                // Scroll ke atas
                if (accumulatedDelta.current > 0) accumulatedDelta.current = 0;
                accumulatedDelta.current += diff;
                if (accumulatedDelta.current < -15) {
                    setIsVisible(true);
                }
            }

            lastScrollY.current = currentScrollY;
        };

        // 2. Touch gesture listener (langsung mendeteksi gesture geser jempol di mobile)
        const onTouchStart = (e) => {
            if (e.touches && e.touches[0]) {
                touchStartY.current = e.touches[0].clientY;
            }
        };

        const onTouchMove = (e) => {
            if (touchStartY.current === null || !e.touches || !e.touches[0]) return;
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - touchStartY.current;

            // Jempol geser ke atas (layar scroll ke bawah) -> SEMBUNYIKAN
            if (deltaY < -24) {
                setIsVisible(false);
                touchStartY.current = currentY;
            } 
            // Jempol geser ke bawah (layar scroll ke atas) -> TAMPILKAN
            else if (deltaY > 20) {
                setIsVisible(true);
                touchStartY.current = currentY;
            }
        };

        const onTouchEnd = () => {
            touchStartY.current = null;
        };

        // 3. Wheel listener (responsif terhadap mousewheel / trackpad saat devtools responsive testing)
        const onWheel = (e) => {
            if (e.deltaY > 15) {
                setIsVisible(false);
            } else if (e.deltaY < -15) {
                setIsVisible(true);
            }
        };

        window.addEventListener('scroll', onScroll, { capture: true, passive: true });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
        window.addEventListener('wheel', onWheel, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll, { capture: true });
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('wheel', onWheel);
        };
    }, []);

    if (!items || items.length === 0) return null;

    const computedMaxWidth = maxWidthClass || (items.length <= 4 ? 'max-w-[270px]' : 'max-w-[320px]');

    return (
        <motion.nav 
            aria-label="Navigasi Bawah Mobile"
            initial={false}
            animate={{
                y: isVisible ? 0 : 100,
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.92,
            }}
            transition={{
                duration: 0.25,
                ease: [0.32, 0.72, 0, 1],
            }}
            className={`lg:hidden fixed bottom-[calc(0.85rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-50 pointer-events-none flex justify-center px-4 ${className}`}
        >
            <div className={`pointer-events-auto w-full ${computedMaxWidth} bg-white/65 backdrop-blur-2xl backdrop-saturate-[190%] backdrop-contrast-[105%] border-t border-t-white/90 border-x border-x-white/60 border-b border-b-white/30 shadow-[0_20px_40px_-10px_rgba(15,23,42,0.16),0_6px_16px_-4px_rgba(15,23,42,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.95),inset_0_-1px_1px_0_rgba(15,23,42,0.04),inset_0_0_16px_0_rgba(255,255,255,0.4)] rounded-full p-1.5 flex items-center justify-between relative transition-all`}>
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = Boolean(item.active);

                    const itemContent = (
                        <div className="relative w-11 h-11 flex items-center justify-center">
                            {isActive && (
                                <motion.div
                                    layoutId={layoutId}
                                    className={`absolute inset-0 rounded-full ${activeColorClass}`}
                                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                                />
                            )}

                            <div className="relative z-10 flex items-center justify-center">
                                {item.avatar ? (
                                    <div className={`w-6 h-6 rounded-full overflow-hidden border ${isActive ? 'border-white' : 'border-slate-300'}`}>
                                        <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : Icon && (
                                    <Icon className="w-[20px] h-[20px]" strokeWidth={isActive ? 2.25 : 1.75} />
                                )}
                            </div>

                            {/* Dot status khusus (misal AI) */}
                            {item.isSpecial && !isActive && (
                                <span className="absolute top-1.5 right-1.5 z-20 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                            )}

                            {/* Apple HIG Micro Counter Badge (diposisikan di sudut luar tombol agar tidak menutupi ikon) */}
                            {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
                                <span
                                    className={`absolute top-0.5 right-0.5 z-20 min-w-[15px] h-[15px] px-1 rounded-full text-[8.5px] font-mono font-bold leading-none flex items-center justify-center shadow-xs ring-[1.5px] tabular-nums pointer-events-none ${
                                        isActive ? 'ring-[#1F6376]' : 'ring-white'
                                    } ${item.badgeColor || 'bg-amber-500 text-white'}`}
                                >
                                    {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </div>
                    );

                    const commonClasses = `relative flex-1 h-11 flex items-center justify-center rounded-full transition-all duration-200 select-none ${
                        isActive 
                            ? 'text-white' 
                            : item.isSpecial 
                                ? 'text-primary hover:text-primary-dark' 
                                : 'text-slate-400 hover:text-slate-700'
                    }`;

                    if (item.action) {
                        return (
                            <button
                                key={item.name}
                                type="button"
                                onClick={item.action}
                                title={item.name}
                                aria-label={item.name}
                                className={commonClasses}
                            >
                                {itemContent}
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={item.name}
                            aria-label={item.name}
                            className={commonClasses}
                        >
                            {itemContent}
                        </Link>
                    );
                })}
            </div>
        </motion.nav>
    );
}
