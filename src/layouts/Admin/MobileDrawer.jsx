import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Search,
    Home, 
    LogOut,
    ChevronRight,
    Box
} from 'lucide-react';

/**
 * MobileDrawer
 *
 * iOS Native Bottom Sheet Modal (Apple HIG standard).
 * Replaces the full-screen takeover with a graceful 88vh bottom sheet,
 * leaving the active background visible under a Gaussian blur and soft dimming backdrop.
 */
export default function MobileDrawer({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    navigation = [],
    retailNav = [],
    supplierNav = [],
    systemNav = []
}) {
    const [searchQuery, setSearchQuery] = useState('');

    // Reset search when sheet closes
    useEffect(() => {
        if (!isMobileMenuOpen) {
            setSearchQuery('');
        }
    }, [isMobileMenuOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMobileMenuOpen, setIsMobileMenuOpen]);

    const sections = [
        {
            title: 'Simpan Pinjam',
            items: navigation
        },
        {
            title: 'Operasional Toko',
            items: retailNav
        },
        {
            title: 'Supply Chain & Vendor',
            items: supplierNav
        },
        {
            title: 'Sistem & Pengaturan',
            items: systemNav
        }
    ];

    const filterItems = (items) => {
        if (!searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase();
        return items.filter(item => item.name.toLowerCase().includes(q));
    };

    return (
        <AnimatePresence>
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[100] flex flex-col justify-end">
                    
                    {/* 1. Backdrop Layer (Gaussian Blur + Soft Dimming) */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm cursor-pointer"
                    />

                    {/* 2. iOS Native Sheet Container (88vh height with rounded top corners) */}
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ 
                            type: 'spring', 
                            damping: 32, 
                            stiffness: 340,
                            mass: 0.8
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-h-[88vh] h-[88vh] bg-[#F8FAFC] rounded-t-[28px] border-t border-slate-200/80 shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* iOS Pull Grabber Bar */}
                        <div 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full pt-3 pb-1.5 flex justify-center shrink-0 cursor-pointer select-none group"
                        >
                            <div className="w-10 h-1.25 bg-slate-300 group-hover:bg-slate-400 rounded-full transition-colors" />
                        </div>

                        {/* Top Bar Header */}
                        <div className="flex justify-between items-center px-5 py-2.5 bg-white border-b border-slate-200/70 shrink-0">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 tracking-tight">Navigasi Modul</h2>
                                <p className="text-[11px] text-slate-400 font-medium">Manasuka Admin Platform</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                                aria-label="Tutup menu"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Quick Search */}
                        <div className="px-5 pt-3 pb-2.5 bg-white border-b border-slate-100 shrink-0">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Cari modul (contoh: simpanan, produk, kasir)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-100/90 border-0 rounded-xl pl-9.5 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                                    >
                                        Bersihkan
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Modules Scrollable List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-24">
                            {sections.map((sec) => {
                                const filtered = filterItems(sec.items);
                                if (filtered.length === 0) return null;

                                return (
                                    <div key={sec.title}>
                                        <div className="px-2 mb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            {sec.title}
                                        </div>
                                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100/90 overflow-hidden">
                                            {filtered.map((item) => {
                                                const Icon = item.icon || Box;
                                                const isActive = item.active;

                                                return (
                                                    <Link 
                                                        key={item.name} 
                                                        href={item.href} 
                                                        onClick={() => setIsMobileMenuOpen(false)} 
                                                        className={`flex items-center justify-between py-2.5 px-3.5 transition-colors ${
                                                            isActive ? 'bg-primary/8 font-semibold text-slate-900' : 'hover:bg-slate-50 text-slate-800 active:bg-slate-100'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 shadow-2xs ${item.color || 'bg-slate-700 text-white'}`}>
                                                                <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                                                            </div>
                                                            <span className="text-[13px] font-medium text-slate-900 truncate">
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {item.badge && (
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs ${item.badgeColor || 'bg-amber-500 text-white'}`}>
                                                                    {item.badge}
                                                                </span>
                                                            )}
                                                            {isActive && (
                                                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                                    Aktif
                                                                </span>
                                                            )}
                                                            <ChevronRight className="w-4 h-4 text-slate-300" />
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Sesi Pengguna */}
                            <div>
                                <div className="px-2 mb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Sesi Akun
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100/90 overflow-hidden">
                                    <Link 
                                        href="/dashboard" 
                                        onClick={() => setIsMobileMenuOpen(false)} 
                                        className="flex items-center justify-between py-2.5 px-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-[9px] bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                                <Home className="w-4 h-4" strokeWidth={2} />
                                            </div>
                                            <span className="text-[13px] font-medium text-slate-900">Portal Pribadi</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                    </Link>

                                    <Link 
                                        method="post" 
                                        href="/logout" 
                                        as="button" 
                                        className="w-full flex items-center justify-between py-2.5 px-3.5 hover:bg-rose-50/60 active:bg-rose-100/60 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-[9px] bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                                <LogOut className="w-4 h-4" strokeWidth={2} />
                                            </div>
                                            <span className="text-[13px] font-medium text-rose-600">Keluar Sistem</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-rose-300" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

