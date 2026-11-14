import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Search } from 'lucide-react';
import UserProfileDropdown from '@/Components/Navigation/UserProfileDropdown';
import AdminNotificationPopover from './AdminNotificationPopover';

/**
 * AdminHeader
 *
 * Apple macOS Sequoia Native Toolbar.
 * Compact 64px height, sleek search palette trigger,
 * dynamic live notification center, and understated user profile pill.
 */
export default function AdminHeader({ 
    hideHeader, 
    backUrl, 
    onBack, 
    pageTitle, 
    setIsCommandPaletteOpen, 
    user,
    pendingBadges = {}
}) {
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    if (hideHeader) return null;

    return (
        <header className="shrink-0 flex relative z-30 bg-[#FBFBFC]/95 backdrop-blur-md h-[60px] sm:h-[64px] border-b border-slate-200/70 px-4 sm:px-6 items-center justify-between transition-all">
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {(backUrl || onBack) ? (
                    backUrl ? (
                        <Link href={backUrl} className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors shrink-0">
                            <div className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200/80 rounded-lg shadow-2xs">
                                <ArrowLeft className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[14px] font-semibold tracking-tight truncate">{pageTitle || "Kembali"}</span>
                        </Link>
                    ) : (
                        <button type="button" onClick={onBack} className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors shrink-0">
                            <div className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200/80 rounded-lg shadow-2xs">
                                <ArrowLeft className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[14px] font-semibold tracking-tight truncate">{pageTitle || "Kembali"}</span>
                        </button>
                    )
                ) : (
                    <Link href="/admin/dashboard" className="flex lg:hidden items-center gap-2 shrink-0">
                        <img src="/logo.png" alt="Manasuka" className="w-6 h-6 object-contain" />
                        <span className="text-base font-bold text-slate-900 tracking-tight">
                            Manasuka
                        </span>
                    </Link>
                )}
                
                {/* Search / Command Palette Trigger */}
                <div className={`relative w-full max-w-xs sm:max-w-sm hidden lg:block ${(backUrl || onBack) ? 'ml-2' : ''}`}>
                    <button
                        type="button"
                        onClick={() => setIsCommandPaletteOpen(true)}
                        className="w-full h-9 flex items-center justify-between bg-white border border-slate-200/80 rounded-lg px-3 hover:border-slate-300 hover:bg-slate-50/70 transition-all text-slate-400 group shadow-2xs"
                    >
                        <div className="flex items-center gap-2.5">
                            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" strokeWidth={1.75} />
                            <span className="text-[12.5px] font-normal text-slate-400 group-hover:text-slate-600">Cari menu, modul...</span>
                        </div>
                        <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100/90 border border-slate-200/60 rounded shadow-2xs">
                            ⌘ K
                        </kbd>
                    </button>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
                {/* Mobile Search Trigger */}
                <button 
                    type="button"
                    onClick={() => setIsCommandPaletteOpen(true)}
                    className="w-8 h-8 lg:hidden rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shadow-2xs"
                    title="Cari"
                >
                    <Search className="w-4 h-4" strokeWidth={1.75} />
                </button>

                {/* Notifications Bell Dropdown */}
                <AdminNotificationPopover 
                    isOpen={isNotifOpen}
                    setIsOpen={setIsNotifOpen}
                    pendingBadges={pendingBadges}
                />

                {/* User Profile Dropdown */}
                <UserProfileDropdown user={user} />
            </div>
        </header>
    );
}

