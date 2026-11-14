import React, { useState, useEffect } from 'react';
import { Menu, X, Maximize2, Minimize2, RotateCw } from 'lucide-react';
import PosNetworkStatusPill from '@/Pages/Kasir/Components/POS/PosNetworkStatusPill';
import PosPrinterStatusPill from '@/Pages/Kasir/Components/POS/PosPrinterStatusPill';

export default function KasirHeader({ auth, currentTime, isSidebarOpen, setIsSidebarOpen }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
    };

    const handleSyncOrReload = (e) => {
        // Shift + Click: Hard full browser reload
        if (e.shiftKey) {
            setIsRefreshing(true);
            if (typeof window !== 'undefined' && 'caches' in window) {
                caches.keys().then((names) => {
                    names.forEach((name) => caches.delete(name));
                }).catch(() => {});
            }
            setTimeout(() => {
                window.location.reload();
            }, 150);
            return;
        }

        // Standard Click: Fast In-App Catalog & Stock Sync (Preserves Cart & Hardware)
        setIsRefreshing(true);
        window.dispatchEvent(new CustomEvent('pos-request-catalog-sync', { detail: { force: true } }));
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1200);
    };

    return (
        <header className="bg-white border-b border-slate-200/80 h-16 flex items-center justify-between px-4 lg:px-6 relative z-30 shrink-0">
            {/* Left: Hamburger + Pure Typography Brand */}
            <div className="flex items-center gap-3">
                <button 
                    type="button"
                    className="p-2 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Toggle menu kasir"
                >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                    Manasuka
                </span>
            </div>



            {/* Right: Hardware & Network Status Cluster + Time + User */}
            <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Peripheral Status: Thermal Printer */}
                <PosPrinterStatusPill onOpenSettings={() => window.dispatchEvent(new CustomEvent('open-pos-hardware-settings'))} />

                {/* Peripheral Status: Network & Offline Queue */}
                <PosNetworkStatusPill />

                {/* Fast In-App Catalog & Stock Sync */}
                <button
                    type="button"
                    onClick={handleSyncOrReload}
                    disabled={isRefreshing}
                    className="w-8 h-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 rounded-full transition-all cursor-pointer flex items-center justify-center border border-slate-200/80 shadow-2xs select-none"
                    title="Perbarui Stok & Katalog dari Server (Shift+Klik untuk reload penuh)"
                    aria-label="Perbarui Stok & Katalog"
                >
                    <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
                </button>

                {/* Fullscreen Kiosk Toggle */}
                <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="w-8 h-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer hidden sm:flex items-center justify-center border border-slate-200/80 shadow-2xs"
                    title={isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Mode Layar Penuh (F11)'}
                >
                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Calm Digital Clock (HH:mm without per-second jumping) */}
                <div className="hidden sm:flex flex-col items-end px-1 select-none">
                    <span className="text-xs sm:text-[13px] font-mono font-semibold text-slate-800 leading-tight">
                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] uppercase font-medium text-slate-400 leading-tight tracking-wider">
                        {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </div>
        </header>
    );
}

