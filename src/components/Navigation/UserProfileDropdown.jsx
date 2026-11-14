import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, MenuButton, MenuItem } from '@headlessui/react';
import LiquidGlassPopover from './LiquidGlassPopover';
import { 
    User, 
    ShieldCheck, 
    LogOut, 
    ChevronDown, 
    LayoutDashboard,
    Store,
    Award
} from 'lucide-react';

/**
 * UserProfileDropdown
 *
 * Apple macOS Sequoia native toolbar account menu.
 * Pure launcher & session switcher: zero box-in-a-box redundancy,
 * zero secondary badge clutter, under 1-second scannability.
 */
export default function UserProfileDropdown({ user: propUser }) {
    const page = usePage();
    const auth = page.props?.auth;
    const currentUrl = page.url || (typeof window !== 'undefined' ? window.location.pathname : '') || '';
    const user = propUser || auth?.user || { name: 'Pengguna', role: 'ANGGOTA' };

    // Normalized position
    const position = user?.position || (
        user?.role === 'PENGURUS' ? 'Pengurus' :
        user?.role === 'STAF' ? 'Admin' :
        user?.role === 'KASIR' ? 'Kasir' : 'Anggota'
    );

    const avatarUrl = (typeof user?.photo === 'string' && user.photo)
        ? (user.photo.startsWith('http') ? user.photo : `/storage/${user.photo}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1F6376&color=fff`;

    // Multi-portal conditions based on verified cooperative membership and executive/operational roles
    const isRegisteredMember = Boolean(user?.is_member_koperasi || user?.role === 'ANGGOTA');
    const isOperationalRole = user?.role === 'PENGURUS' || user?.role === 'PENGAWAS' || user?.role === 'STAF' || user?.role === 'KASIR';

    // Linked supplier profile
    const linkedSupplier = user?.linked_supplier;
    const showSupplierPortal = Boolean(linkedSupplier && !currentUrl.startsWith('/supplier'));

    // Fast switchers strictly matching the user's specific workspace
    const showPengurusPortal = user?.role === 'PENGURUS' && !currentUrl.startsWith('/pengurus');
    const showPengawasPortal = user?.role === 'PENGAWAS' && !currentUrl.startsWith('/pengawas');
    const showAdminPanel = user?.role === 'STAF' && !currentUrl.startsWith('/admin');
    const showKasirTerminal = user?.role === 'KASIR' && !currentUrl.startsWith('/kasir');
    const showMemberPortal = isRegisteredMember && isOperationalRole && !currentUrl.startsWith('/dashboard') && !currentUrl.startsWith('/simpanan') && !currentUrl.startsWith('/pembiayaan') && !currentUrl.startsWith('/mutasi');

    const hasPortalSwitchers = showPengurusPortal || showPengawasPortal || showAdminPanel || showKasirTerminal || showMemberPortal || showSupplierPortal;

    return (
        <Menu as="div" className="relative inline-block text-left z-50">
            {({ open }) => (
                <>
                    {/* Toolbar Trigger Button */}
                    <MenuButton className={`flex items-center gap-2 p-1 sm:pr-2.5 sm:pl-1 rounded-full sm:rounded-xl shadow-2xs transition-all cursor-pointer focus:outline-none ${
                        open 
                            ? 'bg-white ring-2 ring-[#1F6376]/25 shadow-xs border border-[#1F6376]/40' 
                            : 'bg-white/85 hover:bg-white backdrop-blur-md border border-slate-200/80 hover:shadow-xs'
                    }`}>
                        <div className="relative shrink-0">
                            <img 
                                src={avatarUrl} 
                                alt={user?.name || 'Profile'} 
                                className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full sm:rounded-lg object-cover border transition-all ${
                                    open ? 'border-[#1F6376]' : 'border-slate-100'
                                }`} 
                            />
                        </div>
                        
                        <div className="hidden sm:flex flex-col text-left min-w-0 max-w-[140px]">
                            <span className="text-[12.5px] font-semibold text-slate-800 leading-tight truncate">
                                {user?.name || 'User'}
                            </span>
                            <span className="text-[10.5px] font-normal text-slate-400 leading-tight truncate mt-0.5">
                                {position}
                            </span>
                        </div>

                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block ml-0.5 shrink-0 transition-transform duration-200 ${
                            open ? 'rotate-180 text-primary' : ''
                        }`} />
                    </MenuButton>

                    {/* Apple VisionOS Liquid Glass Popover */}
                    <LiquidGlassPopover open={open} widthClass="w-56" align="right">
                        {/* Quiet Identity Header */}
                        <div className="px-2.5 py-2">
                            <p className="text-[12.5px] font-semibold text-slate-900 leading-tight truncate">
                                {user?.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono leading-tight truncate mt-0.5">
                                {user?.email || user?.username || position}
                            </p>
                        </div>

                        {/* Account Settings / Profile Hub */}
                        <div className="pt-1 pb-0.5">
                            <MenuItem>
                                {({ focus }) => (
                                    <Link
                                        href="/profil"
                                        className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 text-[12.5px] font-medium rounded-lg transition-colors ${
                                            focus ? 'bg-slate-900/8 text-slate-900 font-semibold' : 'text-slate-700 hover:bg-slate-900/5'
                                        }`}
                                    >
                                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={1.75} />
                                        <span>Profil & Kinerja</span>
                                    </Link>
                                )}
                            </MenuItem>

                            {!isRegisteredMember && (
                                <MenuItem>
                                    {({ focus }) => (
                                        <Link
                                            href="/rewards"
                                            className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 text-[12.5px] font-medium rounded-lg transition-colors ${
                                                focus ? 'bg-slate-900/8 text-slate-900 font-semibold' : 'text-slate-700 hover:bg-slate-900/5'
                                            }`}
                                        >
                                            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" strokeWidth={1.75} />
                                            <span>Kartu & Poin Belanja</span>
                                        </Link>
                                    )}
                                </MenuItem>
                            )}
                        </div>

                        {/* Fast Portal Switchers */}
                        {hasPortalSwitchers && (
                            <div className="pt-1 pb-0.5">
                                {showPengurusPortal && (
                                    <MenuItem>
                                        {({ focus }) => (
                                            <Link
                                                href="/pengurus/dashboard"
                                                className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 text-[12.5px] font-medium rounded-lg transition-colors ${
                                                    focus ? 'bg-slate-900/8 text-slate-900 font-semibold' : 'text-slate-700 hover:bg-slate-900/5'
                                                }`}
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={1.75} />
                                                <span>Portal Pengurus</span>
                                            </Link>
                                        )}
                                    </MenuItem>
                                )}

                                {showPengawasPortal && (
                                    <MenuItem>
                                        {({ focus }) => (
                                            <Link
                                                href="/pengawas/dashboard"
                                                className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 text-[12.5px] font-medium rounded-lg transition-colors ${
                                                    focus ? 'bg-slate-900/8 text-slate-900 font-semibold' : 'text-slate-700 hover:bg-slate-900/5'
                                                }`}
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={1.75} />
                                                <span>Portal Pengawas</span>
                                            </Link>
                                        )}
                                    </MenuItem>
                                )}

                                {showMemberPortal && (
                                    <MenuItem>
                                        {({ focus }) => (
                                            <Link
                                                href="/dashboard"
                                                className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 text-[12.5px] font-medium rounded-lg transition-colors ${
                                                    focus ? 'bg-slate-900/8 text-slate-900 font-semibold' : 'text-slate-700 hover:bg-slate-900/5'
                                                }`}
                                            >
                                                <LayoutDashboard className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={1.75} />
                                                <span>Portal Anggota</span>
                                            </Link>
                                        )}
                                    </MenuItem>
                                )}

                                {showAdminPanel && (
                                    <MenuItem>
                                        {({ focus }) => (
                                            <Link
                                                href="/admin/dashboard"
                                                className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 text-[12.5px] font-medium rounded-lg transition-colors ${
                                                    focus ? 'bg-slate-900/8 text-slate-900 font-semibold' : 'text-slate-700 hover:bg-slate-900/5'
                                                }`}
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={1.75} />
                                                <span>Panel Admin</span>
                                            </Link>
                                        )}
                                    </MenuItem>
                                )}

                                {showKasirTerminal && (
                                    <MenuItem>
                                        {({ focus }) => (
                                            <Link
                                                href="/kasir/pos"
                                                className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 text-[12.5px] font-medium rounded-lg transition-colors ${
                                                    focus ? 'bg-slate-900/8 text-slate-900 font-semibold' : 'text-slate-700 hover:bg-slate-900/5'
                                                }`}
                                            >
                                                <Store className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={1.75} />
                                                <span>Terminal Kasir</span>
                                            </Link>
                                        )}
                                    </MenuItem>
                                )}

                                {showSupplierPortal && (
                                    <MenuItem>
                                        {({ focus }) => (
                                            <Link
                                                href="/portal-switch/supplier"
                                                className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 text-[12.5px] font-medium rounded-lg transition-colors ${
                                                    focus ? 'bg-emerald-500/10 text-emerald-800 font-semibold' : 'text-slate-700 hover:bg-slate-900/5'
                                                }`}
                                            >
                                                <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
                                                <span className="truncate">Portal Mitra UMKM</span>
                                                <span className="text-[10px] font-mono text-emerald-700/80 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/50 shrink-0 ml-auto">
                                                    {linkedSupplier.code}
                                                </span>
                                            </Link>
                                        )}
                                    </MenuItem>
                                )}
                            </div>
                        )}

                        {/* Sign Out */}
                        <div className="pt-1">
                            <MenuItem>
                                {({ focus }) => (
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 text-[12.5px] font-medium rounded-lg transition-colors cursor-pointer ${
                                            focus ? 'bg-rose-500/15 text-rose-700 font-semibold' : 'text-slate-700 hover:text-rose-600 hover:bg-rose-500/10'
                                        }`}
                                    >
                                        <LogOut className="w-3.5 h-3.5 text-rose-500/80 shrink-0" strokeWidth={1.75} />
                                        <span>Keluar</span>
                                    </Link>
                                )}
                            </MenuItem>
                        </div>
                    </LiquidGlassPopover>
                </>
            )}
        </Menu>
    );
}
