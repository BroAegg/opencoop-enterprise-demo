import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    PanelLeft,
    PanelLeftClose,
    ChevronDown,
    ChevronRight,
    FileText,
    Home,
    LogOut,
    Box
} from 'lucide-react';

/**
 * AdminSidebar
 *
 * Apple macOS Sequoia Native Style (Option 1).
 * Lean full-height layout: 232px width (64px collapsed),
 * compact density (py-1.5 px-2.5, 16px icons),
 * soft Apple accent selection pill, tree guide-lines for submenus,
 * and understated footer actions.
 */
export default function AdminSidebar({ 
    isCollapsed, 
    setIsCollapsed, 
    currentPath, 
    isLaporanOpen, 
    setIsLaporanOpen,
    navigation = [],
    laporanMenu = [],
    accountingNav = [],
    retailNav = [],
    supplierNav = [],
    systemNav = []
}) {
    const sidebarWidth = isCollapsed ? 'lg:w-[64px]' : 'lg:w-[232px]';
    const pxClass = isCollapsed ? 'px-2' : 'px-3';

    const renderNavItem = (item) => {
        const Icon = item.icon || Box;
        const isActive = item.active;
        const hasBadge = Boolean(item.badge && item.badge > 0);

        return (
            <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? (hasBadge ? `${item.name} (${item.badge})` : item.name) : undefined}
                className={`
                    group flex items-center ${isCollapsed ? 'w-9 h-9 mx-auto justify-center' : 'gap-2 px-2.5 py-1.5'} text-[12.5px] rounded-lg transition-all relative
                    ${isActive 
                        ? 'bg-primary/10 text-primary font-semibold shadow-2xs' 
                        : 'text-slate-600 font-normal hover:bg-slate-100/70 hover:text-slate-900'}
                `}
            >
                <div className="relative shrink-0 flex items-center justify-center">
                    <Icon 
                        className={`w-4 h-4 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} 
                        strokeWidth={1.65} 
                    />
                </div>
                {isCollapsed && hasBadge && (
                    <span
                        className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full text-[8px] font-mono font-bold leading-none bg-amber-500 text-white flex items-center justify-center ring-[1.5px] ring-[#FBFBFC] shadow-2xs tabular-nums pointer-events-none"
                        aria-hidden="true"
                    >
                        {item.badge > 99 ? '99+' : item.badge}
                    </span>
                )}
                {!isCollapsed && (
                    <>
                        <span className="whitespace-nowrap truncate min-w-0 flex-1">{item.name}</span>
                        {hasBadge && (
                            <span 
                                className={`shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center shadow-2xs ${item.badgeColor || 'bg-amber-500 text-white'}`}
                                aria-label={`${item.badge} tertunda`}
                            >
                                {item.badge}
                            </span>
                        )}
                    </>
                )}
            </Link>
        );
    };

    return (
        <aside className={`hidden lg:flex flex-col h-screen max-h-screen sticky top-0 shrink-0 z-40 bg-[#FBFBFC] border-r border-slate-200/70 pt-4 pb-3 transition-all duration-300 ease-in-out ${sidebarWidth} overflow-hidden`}>
            
            {/* Header / Brand & Collapse Toggle */}
            <div className={`shrink-0 mb-3 flex items-center ${isCollapsed ? 'flex-col gap-2 justify-center' : 'justify-between'} ${pxClass}`}>
                <Link 
                    href="/admin/dashboard" 
                    className={`flex items-center gap-2 overflow-hidden transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
                    title="Manasuka Admin"
                >
                    <img src="/logo.png" alt="Manasuka" className="w-6 h-6 object-contain shrink-0" />
                    {!isCollapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-[13.5px] font-bold text-slate-900 tracking-tight leading-tight truncate">
                                Manasuka
                            </span>
                            <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider">
                                Admin Panel
                            </span>
                        </div>
                    )}
                </Link>
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                    title={isCollapsed ? "Buka Sidebar" : "Perkecil Sidebar"}
                >
                    {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
            </div>

            {/* Scrollable Navigation - Apple HIG Compact Density */}
            <div className={`flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col gap-3.5 ${pxClass}`}>
                
                {/* 1. SIMPAN PINJAM */}
                <div>
                    {!isCollapsed && (
                        <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                            Simpan Pinjam
                        </div>
                    )}
                    <nav className="flex flex-col gap-0.5">
                        {navigation.map((item) => renderNavItem(item))}
                    </nav>
                </div>

                {isCollapsed && <div className="border-t border-slate-200/60 my-0.5 mx-1" />}

                {/* 2. OPERASIONAL TOKO */}
                <div>
                    {!isCollapsed && (
                        <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                            Operasional Toko
                        </div>
                    )}
                    <nav className="flex flex-col gap-0.5">
                        {retailNav.map((item) => renderNavItem(item))}
                    </nav>
                </div>

                {isCollapsed && <div className="border-t border-slate-200/60 my-0.5 mx-1" />}

                {/* 3. SUPPLY CHAIN & VENDOR */}
                <div>
                    {!isCollapsed && (
                        <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                            Supply Chain
                        </div>
                    )}
                    <nav className="flex flex-col gap-0.5">
                        {supplierNav.map((item) => renderNavItem(item))}
                    </nav>
                </div>

                {isCollapsed && <div className="border-t border-slate-200/60 my-0.5 mx-1" />}

                {/* 4. SISTEM & PENGATURAN */}
                <div>
                    {!isCollapsed && (
                        <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                            Sistem
                        </div>
                    )}
                    <nav className="flex flex-col gap-0.5">
                        {systemNav.map((item) => renderNavItem(item))}
                    </nav>
                </div>

            </div>

            {/* Footer / Account & Logout - Understated Apple style */}
            <div className={`mt-auto shrink-0 ${pxClass} py-2.5 border-t border-slate-200/60 flex flex-col gap-0.5 bg-slate-50/40`}>
                <Link 
                    href="/dashboard"
                    title={isCollapsed ? 'Portal Pribadi' : undefined}
                    className={`w-full group flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-1.5'} rounded-lg text-[12px] font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70 transition-all`}
                >
                    <Home className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-emerald-600 transition-colors" strokeWidth={1.65} />
                    {!isCollapsed && <span className="whitespace-nowrap">Portal Pribadi</span>}
                </Link>

                <Link 
                    method="post" 
                    href="/logout" 
                    as="button" 
                    title={isCollapsed ? 'Keluar' : undefined}
                    className={`w-full group flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-1.5'} rounded-lg text-[12px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/70 transition-all`}
                >
                    <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-rose-600 transition-colors" strokeWidth={1.65} />
                    {!isCollapsed && <span className="whitespace-nowrap">Keluar Sistem</span>}
                </Link>
            </div>
        </aside>
    );
}

