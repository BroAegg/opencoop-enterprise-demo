import React, { useEffect, useRef, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { usePage } from '@inertiajs/react';
import { ScanBarcode, AlertCircle } from 'lucide-react';
import { generateDynamicQris, extractMerchantName } from '../../Utils/qrisGenerator';

export default function PosQrisPaymentView({
    amount = 0,
    qrisPayload = null,
}) {
    const { coop } = usePage().props;
    const canvasRef = useRef(null);
    const [renderError, setRenderError] = useState(null);

    // Resolve static payload from props or global Inertia shared coop settings
    const rawStaticPayload = qrisPayload || coop?.qris_payload || '';

    // Generate dynamic QRIS string with locked amount
    const dynamicQris = useMemo(() => {
        if (!rawStaticPayload || typeof rawStaticPayload !== 'string' || rawStaticPayload.trim().length < 20) {
            return null;
        }
        try {
            return generateDynamicQris(rawStaticPayload, amount);
        } catch (e) {
            console.error('Error generating dynamic QRIS:', e);
            return null;
        }
    }, [rawStaticPayload, amount]);

    // Extract Merchant Name (Tag 59)
    const merchantName = useMemo(() => {
        if (!rawStaticPayload) return null;
        return extractMerchantName(rawStaticPayload) || coop?.legal_name || 'KSPPS BERKAH MADANI UMB';
    }, [rawStaticPayload, coop?.legal_name]);

    // Render QR onto Canvas
    useEffect(() => {
        if (!canvasRef.current || !dynamicQris) return;

        setRenderError(null);
        QRCode.toCanvas(
            canvasRef.current,
            dynamicQris,
            {
                width: 196,
                margin: 1,
                color: {
                    dark: '#0f172a',
                    light: '#ffffff',
                },
                errorCorrectionLevel: 'M',
            },
            (error) => {
                if (error) {
                    console.error('QRCode canvas render error:', error);
                    setRenderError('Gagal merender QR Code');
                }
            }
        );
    }, [dynamicQris]);

    // State 1: Belum Ada Konfigurasi QRIS (Placeholder Standar)
    if (!dynamicQris) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-48 h-48 bg-slate-50 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 mb-3 p-4 text-center">
                    <ScanBarcode className="w-12 h-12 text-slate-500 mb-2 opacity-80" strokeWidth={1.5} />
                    <span className="text-slate-500 font-mono font-bold text-xs tracking-widest">QRIS STATIS / DINAMIS</span>
                    <span className="font-tabular font-black text-slate-900 text-sm mt-1">
                        Rp {amount.toLocaleString('id-ID')}
                    </span>
                </div>
                <p className="text-xs text-slate-500 text-center font-medium max-w-xs">
                    Arahkan pembeli memindai QRIS kasir melalui m-Banking atau E-Wallet.
                </p>
            </div>
        );
    }

    // State 2: QRIS Dinamis Aktif (Apple HIG Clean & Quiet)
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-3 text-center">
            {/* Merchant Identity */}
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 max-w-xs truncate">
                {merchantName}
            </p>

            {/* QR Card Container */}
            <div className="p-3.5 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col items-center justify-center">
                {renderError ? (
                    <div className="w-48 h-48 flex flex-col items-center justify-center text-rose-500 gap-1 text-xs">
                        <AlertCircle className="w-6 h-6" />
                        <span>{renderError}</span>
                    </div>
                ) : (
                    <canvas 
                        ref={canvasRef} 
                        className="rounded-xl block"
                    />
                )}

                {/* Amount on Card */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 w-full flex items-center justify-center gap-1.5">
                    <span className="text-lg font-black font-tabular text-slate-900 tracking-tight">
                        Rp {amount.toLocaleString('id-ID')}
                    </span>
                </div>
            </div>

            {/* Clean, Quiet Secondary Text */}
            <p className="text-xs text-slate-400 text-center font-medium max-w-xs mt-3">
                Pindai dengan m-Banking atau E-Wallet
            </p>
        </div>
    );
}

