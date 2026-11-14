import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Check, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast() {
    const { flash } = usePage().props;
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.info) toast.info(flash.info);
        if (flash?.warning) toast.warning(flash.warning);
        if (flash?.message) toast.info(flash.message);
    }, [flash]);

    useEffect(() => {
        const handleToast = (e) => {
            const { message, type = 'info', duration = 3000 } = e.detail;
            const id = Date.now();
            
            setToasts((prev) => [...prev, { id, message, type }]);

            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        };

        window.addEventListener('toast', handleToast);
        return () => window.removeEventListener('toast', handleToast);
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
            {toasts.map((toast) => {
                // Dynamic Island styling
                return (
                    <div 
                        key={toast.id}
                        className="flex items-center gap-3 px-4 py-3 bg-black/90 backdrop-blur-md rounded-2xl sm:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-white border border-white/10 animate-in slide-in-from-top-10 fade-in duration-300 pointer-events-auto max-w-[calc(100vw-32px)] sm:max-w-md w-max text-left"
                    >
                        {toast.type === 'success' && <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0"><Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} /></div>}
                        {toast.type === 'error' && <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0"><X className="w-3.5 h-3.5 text-rose-400" strokeWidth={3} /></div>}
                        {toast.type === 'warning' && <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" strokeWidth={3} /></div>}
                        {toast.type === 'info' && <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"><Info className="w-3.5 h-3.5 text-blue-400" strokeWidth={3} /></div>}
                        
                        <span className="text-[13px] font-medium tracking-wide pr-2">{toast.message}</span>
                    </div>
                );
            })}
        </div>
    );
}

// Helper to trigger toasts globally
export const toast = {
    success: (message, duration) => window.dispatchEvent(new CustomEvent('toast', { detail: { message, type: 'success', duration } })),
    error: (message, duration) => window.dispatchEvent(new CustomEvent('toast', { detail: { message, type: 'error', duration } })),
    info: (message, duration) => window.dispatchEvent(new CustomEvent('toast', { detail: { message, type: 'info', duration } })),
    warning: (message, duration) => window.dispatchEvent(new CustomEvent('toast', { detail: { message, type: 'warning', duration } })),
};

