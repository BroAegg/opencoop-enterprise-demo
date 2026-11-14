import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Users, 
    WalletCards, 
    HandCoins,
    FileText,
    Receipt,
    Box,
    PackageCheck,
    Package,
    Truck,
    ShoppingCart,
    TrendingUp,
    ShoppingBag,
    Briefcase,
    Calendar,
    Settings,
    UserCog,
    Store,
    Gift,
    ListTree,
    Clock
} from 'lucide-react';
import Toast from '@/Components/UI/Toast';
import CommandPalette from '@/Components/UI/CommandPalette';
import AdminSidebar from './Admin/AdminSidebar';
import AdminHeader from './Admin/AdminHeader';
import MobileDrawer from './Admin/MobileDrawer';
import MobileNav from './Admin/MobileNav';

export default function AdminLayout({ user, header, backUrl, onBack, pageTitle, hideHeader = false, fullHeight = false, children }) {
    const { url, props } = usePage();
    const currentUser = user || props?.auth?.user || { name: "Admin Pengurus", role: "Pengurus" };
    const currentPath = url.split('?')[0];
    const pendingBadges = props?.pending_badges || {};
    
    // Determine Context
    const isSystemContext = currentPath.startsWith('/admin/settings') || currentPath.startsWith('/admin/users') || currentPath.startsWith('/admin/rat');
    const isRetailContext = currentPath.startsWith('/admin/retail') || currentPath.startsWith('/admin/inventory') || currentPath.startsWith('/admin/products') || currentPath.startsWith('/kasir');
    const isSupplierContext = currentPath.startsWith('/admin/suppliers') || currentPath.startsWith('/admin/purchasing') || currentPath.startsWith('/admin/settlements') || currentPath.startsWith('/admin/supplier-registrations') || currentPath.startsWith('/admin/suppliers-monthly-fees');
    const activeContext = isSupplierContext ? 'SUPPLIER' : (isRetailContext ? 'RETAIL' : (isSystemContext ? 'SYSTEM' : 'CORE'));
    
    // Command Palette & Mobile Drawer State
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Sidebar collapse state
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebar_collapsed') === 'true';
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', isCollapsed);
    }, [isCollapsed]);

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, active: currentPath === '/admin/dashboard' || currentPath === '/' || currentPath === '/admin', color: 'bg-blue-500 text-white' },
        { name: 'Simpanan', href: '/admin/simpanan', icon: WalletCards, active: currentPath.startsWith('/admin/simpanan'), color: 'bg-teal-500 text-white' },
        { 
            name: 'Pembiayaan', 
            href: '/admin/pembiayaan', 
            icon: HandCoins, 
            active: currentPath.startsWith('/admin/pembiayaan') || currentPath.startsWith('/admin/loans'), 
            color: 'bg-amber-500 text-white',
            badge: pendingBadges.loans > 0 ? pendingBadges.loans : null,
            badgeColor: 'bg-amber-500 text-white',
        },
        { name: 'Jurnal Umum', href: '/admin/jurnal', icon: FileText, active: currentPath.startsWith('/admin/jurnal'), color: 'bg-emerald-500 text-white' },
        { name: 'Bagan Akun (COA)', href: '/admin/coa', icon: ListTree, active: currentPath.startsWith('/admin/coa'), color: 'bg-indigo-500 text-white' },
        { 
            name: 'Anggota', 
            href: '/admin/members', 
            icon: Users, 
            active: currentPath.startsWith('/admin/members'), 
            color: 'bg-indigo-500 text-white',
            badge: pendingBadges.members > 0 ? pendingBadges.members : null,
            badgeColor: 'bg-amber-500 text-white',
        },
    ];

    const retailNav = [
        { name: 'Terminal POS Kasir', href: '/kasir/pos', icon: Store, active: currentPath.startsWith('/kasir/pos'), color: 'bg-teal-600 text-white' },
        { name: 'Riwayat Transaksi', href: '/kasir/riwayat', icon: Receipt, active: currentPath.startsWith('/kasir/riwayat'), color: 'bg-blue-600 text-white' },
        { name: 'Kinerja Shift Kasir', href: '/kasir/shift', icon: Clock, active: currentPath.startsWith('/kasir/shift'), color: 'bg-amber-500 text-white' },
        { name: 'Analitik & Kinerja', href: '/admin/retail', icon: TrendingUp, active: currentPath === '/admin/retail', color: 'bg-emerald-500 text-white' },
        { name: 'Rencana Belanja', href: '/admin/retail/procurement', icon: ShoppingBag, active: currentPath.startsWith('/admin/retail/procurement'), color: 'bg-blue-600 text-white' },
        { name: 'Manasuka Rewards', href: '/admin/retail/rewards', icon: Gift, active: currentPath.startsWith('/admin/retail/rewards'), color: 'bg-amber-500 text-white' },
        { name: 'Kinerja Shift', href: '/admin/retail/shifts', icon: Store, active: currentPath.startsWith('/admin/retail/shifts'), color: 'bg-amber-500 text-white' },
        { name: 'Master Produk & Barcode', href: '/admin/products', icon: Box, active: currentPath.startsWith('/admin/products') || currentPath.startsWith('/admin/inventory/products'), color: 'bg-orange-500 text-white' },
        { 
            name: 'Barang Masuk', 
            href: '/admin/inventory/receiving', 
            icon: PackageCheck, 
            active: currentPath.startsWith('/admin/inventory/receiving'), 
            color: 'bg-lime-500 text-white',
            badge: pendingBadges.receiving > 0 ? pendingBadges.receiving : null,
            badgeColor: 'bg-blue-600 text-white',
        },
        { name: 'Stock Opname', href: '/admin/inventory/stock-opname', icon: Package, active: currentPath.startsWith('/admin/inventory/stock-opname'), color: 'bg-cyan-500 text-white' },
    ];

    const supplierNav = [
        {
            name: 'Data Supplier & Mitra',
            href: '/admin/suppliers',
            icon: Truck,
            active: currentPath.startsWith('/admin/suppliers') || currentPath.startsWith('/admin/supplier-registrations'),
            color: 'bg-emerald-600 text-white',
            badge: pendingBadges.suppliers > 0 ? pendingBadges.suppliers : null,
            badgeColor: 'bg-amber-500 text-white',
        },
        { name: 'Surat Pesanan (PO)', href: '/admin/purchasing', icon: ShoppingCart, active: currentPath.startsWith('/admin/purchasing'), color: 'bg-blue-600 text-white' },
        { name: 'Bagi Hasil & Settlement', href: '/admin/settlements', icon: Receipt, active: currentPath.startsWith('/admin/settlements'), color: 'bg-purple-600 text-white' },
    ];

    const systemNav = [
        { name: 'RAT & SHU', href: '/admin/rat', icon: Calendar, active: currentPath.startsWith('/admin/rat'), color: 'bg-orange-500 text-white' },
        { name: 'Pengaturan Koperasi', href: '/admin/settings', icon: Settings, active: currentPath.startsWith('/admin/settings'), color: 'bg-slate-600 text-white' },
        { name: 'Manajemen Users', href: '/admin/users', icon: UserCog, active: currentPath.startsWith('/admin/users'), color: 'bg-slate-700 text-white' },
    ];

    const mobileNavigation = [
        { name: 'Beranda', href: '/admin/dashboard', icon: LayoutDashboard, active: currentPath === '/admin/dashboard' },
        { 
            name: 'Anggota', 
            href: '/admin/members', 
            icon: Users, 
            active: currentPath.startsWith('/admin/members'),
            badge: pendingBadges.members > 0 ? pendingBadges.members : null,
        },
        { name: 'Toko', href: '/admin/retail', icon: Store, active: isRetailContext },
        { 
            name: 'Supplier', 
            href: '/admin/suppliers', 
            icon: Truck, 
            active: isSupplierContext,
            badge: pendingBadges.suppliers > 0 ? pendingBadges.suppliers : null,
        },
        { name: 'Menu', action: () => setIsMobileMenuOpen(true), icon: Settings, active: isMobileMenuOpen },
    ];

    return (
        <div className="w-full h-screen overflow-hidden flex flex-col lg:flex-row text-slate-900 font-sans bg-[#F4F5F7]">
            <Toast />
            <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setIsCommandPaletteOpen} />
            
            <AdminSidebar 
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                activeContext={activeContext}
                currentPath={currentPath}
                navigation={navigation}
                retailNav={retailNav}
                supplierNav={supplierNav}
                systemNav={systemNav}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F4F5F7] min-w-0">
                <AdminHeader 
                    hideHeader={hideHeader}
                    backUrl={backUrl}
                    onBack={onBack}
                    pageTitle={pageTitle}
                    setIsCommandPaletteOpen={setIsCommandPaletteOpen}
                    user={currentUser}
                    pendingBadges={pendingBadges}
                />

                {/* Page Content */}
                <div className={`flex-1 ${fullHeight ? 'flex flex-col mb-[80px] lg:mb-0 min-h-0' : 'overflow-y-auto p-4 sm:p-6 pb-24'} custom-scrollbar relative`}>
                    {header && (
                        <div className="mb-6">
                            {header}
                        </div>
                    )}
                    {children}
                </div>
            </main>

            <MobileNav 
                backUrl={backUrl}
                onBack={onBack}
                mobileNavigation={mobileNavigation}
                currentPath={currentPath}
            />

            <MobileDrawer 
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                navigation={navigation}
                retailNav={retailNav}
                supplierNav={supplierNav}
                systemNav={systemNav}
            />
        </div>
    );
}

