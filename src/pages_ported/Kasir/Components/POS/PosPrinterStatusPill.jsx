import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Printer } from 'lucide-react';
import { thermalPrinter } from '@/Utils/thermalPrinterDriver';

export default function PosPrinterStatusPill({ onOpenSettings }) {
    const [status, setStatus] = useState(thermalPrinter.getStatus());

    useEffect(() => {
        const unsubscribe = thermalPrinter.subscribe(setStatus);
        return () => unsubscribe();
    }, []);

    const isConnected = status.isConnected;
    const modeLabel = status.isNative 
        ? (status.connectionMode === 'USB' ? 'USB Eppos' : 'Bluetooth') 
        : 'Serial';

    return (
        <motion.button
            type="button"
            onClick={onOpenSettings}
            whileTap={{ scale: 0.95 }}
            className={`relative w-8 h-8 rounded-full border shadow-2xs flex items-center justify-center transition-colors cursor-pointer select-none ${
                isConnected
                    ? 'bg-white/80 hover:bg-white border-slate-200/80 text-slate-700 hover:text-slate-900'
                    : 'bg-white/80 hover:bg-white border-slate-200/80 text-slate-400 hover:text-slate-600'
            }`}
            title={
                isConnected
                    ? `Printer ${modeLabel} Siap: ${status.savedName || 'Eppos'} (${status.paperWidth}) · Klik untuk pengaturan`
                    : `Printer Belum Terhubung · Klik untuk hubungkan`
            }
            aria-label={isConnected ? 'Printer Terhubung' : 'Printer Belum Terhubung'}
        >
            <Printer className="w-3.5 h-3.5" />
            
            {/* Subtle Status Indicator Dot */}
            <span 
                className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ring-1 ring-white ${
                    isConnected ? 'bg-emerald-500' : 'bg-slate-300'
                }`} 
            />
        </motion.button>
    );
}


