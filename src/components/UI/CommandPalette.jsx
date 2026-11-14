import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { 
    Search, 
    LayoutDashboard, 
    Users, 
    WalletCards, 
    HandCoins, 
    FileText, 
    BookOpen, 
    Calendar, 
    Settings, 
    UserCog,
    Command,
    X,
    ChevronRight,
    Calculator,
    LogOut,
    CheckSquare,
    Store,
    Box,
    PackageCheck,
    Package,
    Receipt,
    Truck,
    ShoppingCart,
    TrendingUp,
    Gift
} from 'lucide-react';

const masterRoutes = [
    { name: 'Dashboard Utama', href: '/admin/dashboard', icon: LayoutDashboard, category: 'Main' },
    { name: 'Daftar Anggota', href: '/admin/members', icon: Users, category: 'Main' },
    { name: 'Persetujuan Anggota Baru', href: '/admin/members?status=PENDING', icon: CheckSquare, category: 'Main' },
    { name: 'Data Supplier & Mitra', href: '/admin/suppliers', icon: Truck, category: 'Pengadaan & Supplier' },
    { name: 'Purchase Order (PO)', href: '/admin/purchasing', icon: ShoppingCart, category: 'Pengadaan & Supplier' },
    { name: 'Settlement Konsinyasi', href: '/admin/settlements', icon: WalletCards, category: 'Pengadaan & Supplier' },
    { name: 'Analitik & Kinerja Toko', href: '/admin/retail', icon: TrendingUp, category: 'Toko & Gudang' },
    { name: 'Manasuka Rewards', href: '/admin/retail/rewards', icon: Gift, category: 'Toko & Gudang' },
    { name: 'Master Produk & Barcode', href: '/admin/products', icon: Box, category: 'Toko & Gudang' },
    { name: 'Data Simpanan', href: '/admin/simpanan', icon: WalletCards, category: 'Transaksi' },
    { name: 'Setoran Massal (Bulk)', href: '/admin/simpanan/bulk', icon: WalletCards, category: 'Transaksi' },
    { name: 'Data Pembiayaan', href: '/admin/pembiayaan', icon: HandCoins, category: 'Transaksi' },
    { name: 'Potongan Gaji (Payroll)', href: '/admin/payroll', icon: FileText, category: 'Transaksi' },
    { name: 'Kinerja Shift (Retail)', href: '/admin/retail/shifts', icon: Store, category: 'Toko & Gudang' },
    { name: 'Barang Masuk (Receiving)', href: '/admin/inventory/receiving', icon: PackageCheck, category: 'Toko & Gudang' },
    { name: 'Stock Opname', href: '/admin/inventory/stock-opname', icon: Package, category: 'Toko & Gudang' },
    { name: 'Pengeluaran (Kas Operasional)', href: '/admin/expenses', icon: Receipt, category: 'Transaksi' },
    { name: 'RAT & SHU', href: '/admin/rat', icon: Calendar, category: 'Sistem & Pengaturan' },
    { name: 'Pengaturan Koperasi', href: '/admin/settings', icon: Settings, category: 'Sistem & Pengaturan' },
    { name: 'Manajemen Pengguna (Admin)', href: '/admin/users', icon: UserCog, category: 'Sistem & Pengaturan' },
    { name: 'Keluar (Logout)', href: '/logout', icon: LogOut, category: 'Sistem & Pengaturan' },
];

export default function CommandPalette({ isOpen, setIsOpen }) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    // Filter routes based on query
    const filteredRoutes = query === '' 
        ? masterRoutes 
        : masterRoutes.filter((route) => 
            route.name.toLowerCase().includes(query.toLowerCase()) || 
            route.category.toLowerCase().includes(query.toLowerCase())
          );

    // Handle global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Cmd+K or Ctrl+K to toggle
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setIsOpen]);

    // Handle internal keyboard navigation
    useEffect(() => {
        const handleInternalKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredRoutes.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredRoutes.length) % filteredRoutes.length);
            } else if (e.key === 'Enter' && filteredRoutes.length > 0) {
                e.preventDefault();
                handleSelect(filteredRoutes[selectedIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleInternalKeyDown);
        return () => window.removeEventListener('keydown', handleInternalKeyDown);
    }, [isOpen, filteredRoutes, selectedIndex]);

    // Reset state when opened/closed
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    // Handle selection
    const handleSelect = (route) => {
        setIsOpen(false);
        if (route.href === '/logout') {
            router.post(route.href);
        } else {
            router.visit(route.href);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[20vh] px-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                {/* Search Input Area */}
                <div className="flex items-center px-4 border-b border-slate-100">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" strokeWidth={2} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full border-0 bg-transparent py-4 pl-4 pr-12 text-slate-900 placeholder-slate-400 focus:ring-0 sm:text-lg"
                        placeholder="Cari menu, laporan, atau pengaturan..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                    />
                    {query && (
                        <button 
                            onClick={() => {
                                setQuery('');
                                inputRef.current?.focus();
                            }}
                            className="absolute right-4 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Results Area */}
                <div className="max-h-[60vh] overflow-y-auto p-2 scroll-py-2 custom-scrollbar">
                    {filteredRoutes.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-900 mb-1">Tidak ada hasil ditemukan</p>
                            <p className="text-sm">Coba gunakan kata kunci lain.</p>
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {filteredRoutes.map((route, index) => {
                                const isSelected = index === selectedIndex;
                                return (
                                    <li key={route.href}>
                                        <button
                                            onClick={() => handleSelect(route)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                                                isSelected ? 'bg-primary text-white' : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                    isSelected ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    <route.icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                                        {route.name}
                                                    </span>
                                                    <span className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-slate-500'}`}>
                                                        {route.category}
                                                    </span>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <ChevronRight className="w-4 h-4 text-white/70" />
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                
                {/* Footer hints */}
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 shadow-sm">↑</kbd>
                        <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 shadow-sm">↓</kbd>
                        Navigasi
                    </span>
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 shadow-sm">Enter</kbd>
                        Pilih
                    </span>
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 shadow-sm">Esc</kbd>
                        Tutup
                    </span>
                </div>
            </div>
        </div>
    );
}

