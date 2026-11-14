import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { TerminalSquare, ReceiptText, Clock, LogOut } from 'lucide-react';

export default function KasirSidebar({ isPosRoute, isSidebarOpen, setIsSidebarOpen }) {
    const { url } = usePage();
    const { auth } = usePage().props;
    const user = auth?.user;

    const avatarUrl = (typeof user?.photo === 'string' && user.photo)
        ? (user.photo.startsWith('http') ? user.photo : `/storage/${user.photo}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Kasir')}&background=1F6376&color=fff`;

    const navItems = [
        { name: 'POS (Point of Sale)', href: '/kasir/pos', icon: TerminalSquare, active: url.startsWith('/kasir/pos') || url === '/kasir' },
        { name: 'Riwayat Transaksi', href: '/kasir/riwayat', icon: ReceiptText, active: url.startsWith('/kasir/riwayat') },
        { name: 'Manajemen Shift', href: '/kasir/shift', icon: Clock, active: url.startsWith('/kasir/shift') },
    ];

    return (
        <>
            {/* Sidebar Navigation */}
            <aside className={`
                inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out shrink-0 flex flex-col
                ${isPosRoute ? 'absolute' : 'absolute lg:static'}
                ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                <div className="flex-1 py-6 px-4 overflow-y-auto">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link 
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => {
                                        if (window.innerWidth < 1024 || item.href === '/kasir/pos') {
                                            setIsSidebarOpen(false);
                                        }
                                    }}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                                        ${item.active 
                                            ? 'bg-primary text-white font-semibold shadow-md shadow-primary/20' 
                                            : 'hover:bg-slate-800 hover:text-white font-medium'
                                        }
                                    `}
                                >
                                    <Icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
                                    <span className="text-[14px]">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
                
                {/* User Profile & Session Footer */}
                <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between gap-2.5">
                    <Link
                        href="/profil"
                        className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity p-1 -m-1 rounded-lg"
                        title="Lihat Profil Akun"
                    >
                        <img 
                            src={avatarUrl} 
                            alt={user?.name || 'Kasir'} 
                            className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0" 
                        />
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate leading-tight">
                                {user?.name || 'Kasir'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                                {user?.role === 'PENGURUS' ? 'Pengurus' : user?.role === 'STAF' ? 'Staf Toko' : 'Kasir Toko'}
                            </p>
                        </div>
                    </Link>

                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Keluar / Ganti Kasir"
                        aria-label="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </Link>
                </div>
            </aside>

            {/* Backdrop */}
            {isSidebarOpen && (
                <div 
                    className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 ${isPosRoute ? 'block' : 'lg:hidden'}`}
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </>
    );
}
