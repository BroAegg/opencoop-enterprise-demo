import React from 'react';
import { Link } from '@inertiajs/react';
import TactileTooltip from '@/Components/UI/TactileTooltip';

/**
 * SidebarRail
 *
 * Reusable, ultra-slim Apple HIG & Linear-inspired vertical navigation rail.
 * Replaces bulky 80px sidebars with a sleek 56px (w-14) column featuring:
 * - Tactile squircle buttons with active edge indicators
 * - Integrated right-docked TactileTooltips
 * - Dynamic notification & approval badges
 * - Specular frosted glass backdrop
 */
export default function SidebarRail({
    items = [],
    logo,
    logoHref = '/',
    footerItems,
    user,
    widthClass = 'w-14',
    className = '',
}) {
    return (
        <aside
            className={`hidden md:flex flex-col items-center justify-between py-5 bg-white/80 backdrop-blur-xl border-r border-slate-200/80 h-screen fixed left-0 top-0 z-40 shrink-0 shadow-[1px_0_12px_rgba(0,0,0,0.02)] ${widthClass} ${className}`}
            aria-label="Sidebar Navigasi"
        >
            {/* Top: Logo / Brand Emblem */}
            <div className="flex flex-col items-center w-full">
                {logo ? (
                    typeof logo === 'function' ? logo() : logo
                ) : (
                    <Link
                        href={logoHref}
                        className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#1F6376] to-[#154856] text-white flex items-center justify-center shadow-sm shadow-[#1F6376]/20 ring-1 ring-white/30 hover:scale-105 active:scale-95 transition-all"
                        aria-label="Beranda Utama"
                    >
                        <span className="font-bold text-sm tracking-tight font-serif">M</span>
                    </Link>
                )}
            </div>

            {/* Middle: Navigation Items */}
            <nav className="flex-1 flex flex-col items-center gap-2.5 w-full mt-6 px-2">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = item.active;
                    const title = item.title || item.name;

                    const content = (
                        <div className="relative">
                            {/* Active edge indicator pill */}
                            {isActive && (
                                <span
                                    className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#1F6376] rounded-r-full shadow-2xs"
                                    aria-hidden="true"
                                />
                            )}

                            <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 relative ${
                                    isActive
                                        ? 'bg-[#1F6376] text-white shadow-sm shadow-[#1F6376]/25 ring-1 ring-[#1F6376]/20 font-semibold'
                                        : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 active:scale-95'
                                }`}
                            >
                                {Icon && <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2 : 1.75} />}

                                {/* Apple HIG Micro Counter Badge */}
                                {Boolean(item.badge) && (
                                    <span
                                        className={`absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 rounded-full text-[8.5px] font-mono font-bold leading-none flex items-center justify-center ring-[1.5px] ring-white shadow-2xs tabular-nums pointer-events-none ${
                                            item.badgeColor || 'bg-amber-500 text-white'
                                        }`}
                                    >
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>
                        </div>
                    );

                    return (
                        <TactileTooltip
                            key={item.href || item.name || index}
                            content={title}
                            placement="right"
                            delay={60}
                        >
                            {item.onClick ? (
                                <button
                                    type="button"
                                    onClick={item.onClick}
                                    aria-label={title}
                                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6376] rounded-xl"
                                >
                                    {content}
                                </button>
                            ) : (
                                <Link
                                    href={item.href}
                                    aria-label={title}
                                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6376] rounded-xl"
                                >
                                    {content}
                                </Link>
                            )}
                        </TactileTooltip>
                    );
                })}
            </nav>

            {/* Bottom: Custom Footer Actions or User Profile */}
            <div className="flex flex-col items-center gap-3.5 w-full px-2 mt-auto">
                {footerItems ? (
                    typeof footerItems === 'function' ? footerItems() : footerItems
                ) : user ? (
                    <TactileTooltip content={user.name || 'Profil & Akun'} placement="right" delay={60}>
                        <Link
                            href="/profil"
                            className="w-8 h-8 rounded-full overflow-hidden border border-slate-200/90 shadow-2xs hover:ring-2 hover:ring-[#1F6376]/30 hover:border-[#1F6376] transition-all"
                            aria-label="Profil & Akun"
                        >
                            {user.photo ? (
                                <img src={user.photo} alt={user.name || 'User'} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-b from-[#1F6376] to-[#154856] flex items-center justify-center text-white font-bold text-xs">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                        </Link>
                    </TactileTooltip>
                ) : null}
            </div>
        </aside>
    );
}
