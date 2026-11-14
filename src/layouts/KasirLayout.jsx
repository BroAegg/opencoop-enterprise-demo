import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Toast from '@/Components/UI/Toast';
import KasirHeader from './Kasir/KasirHeader';
import KasirSidebar from './Kasir/KasirSidebar';

export default function KasirLayout({ children, pageTitle }) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const isPosRoute = url.startsWith('/kasir/pos') || url === '/kasir';
    
    const [currentTime, setCurrentTime] = useState(new Date());
    // Auto-collapse sidebar on POS route to maximize workstation canvas
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isPosRoute);

    useEffect(() => {
        if (isPosRoute) {
            setIsSidebarOpen(false);
        }
    }, [isPosRoute, url]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 10000);
        return () => clearInterval(timer);
    }, []);

    // Register PWA Service Worker for Offline Workstation capability
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch((err) => {
                console.warn('[PWA] Service Worker registration failed:', err);
            });
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-primary/20">
            <Toast />
            <KasirHeader 
                auth={auth} 
                currentTime={currentTime} 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen} 
            />

            <div className="flex flex-1 overflow-hidden relative">
                <KasirSidebar 
                    isPosRoute={isPosRoute} 
                    isSidebarOpen={isSidebarOpen} 
                    setIsSidebarOpen={setIsSidebarOpen} 
                />

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
                    {pageTitle && (
                        <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 hidden sm:block">
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{pageTitle}</h2>
                        </div>
                    )}
                    <div className="p-4 sm:p-6 flex-1">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
