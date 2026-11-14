import React, { useEffect, useRef, useState } from 'react';
import Modal from '@/Components/UI/Modal';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Copy, Check, QrCode, Barcode } from 'lucide-react';

/**
 * MemberCardPassModal
 *
 * Apple Wallet-inspired digital pass modal for members.
 * Supports dual-mode scanning:
 * 1. QR Code (2D) for camera/tablet POS and modern scanners
 * 2. Barcode 1D (Code 128) for conventional 1D laser retail scanners
 */
export default function MemberCardPassModal({ isOpen, onClose, user = {} }) {
    const [scanMode, setScanMode] = useState('qr'); // 'qr' | 'barcode'
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const barcodeRef = useRef(null);

    const memberCode = String(user?.member_number || user?.nip_nbm || user?.id || '').trim();
    const formattedNumber = memberCode.replace(/(.{4})/g, '$1 ').trim();

    // Generate QR Code
    useEffect(() => {
        if (!isOpen || !memberCode) return;
        
        let isMounted = true;
        QRCode.toDataURL(memberCode, {
            width: 260,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: {
                dark: '#0f172a',
                light: '#ffffff',
            },
        })
            .then(url => {
                if (isMounted) setQrDataUrl(url);
            })
            .catch(err => {
                console.error('QR generation failed', err);
            });

        return () => {
            isMounted = false;
        };
    }, [isOpen, memberCode]);

    // Generate Barcode 1D
    useEffect(() => {
        if (!isOpen || !barcodeRef.current || !memberCode || scanMode !== 'barcode') return;

        try {
            JsBarcode(barcodeRef.current, memberCode, {
                format: 'CODE128',
                lineColor: '#0f172a',
                width: 2,
                height: 72,
                displayValue: true,
                fontSize: 14,
                font: 'monospace',
                textMargin: 8,
                margin: 12,
                background: '#ffffff',
            });
        } catch (e) {
            console.error('Barcode generation failed', e);
        }
    }, [isOpen, memberCode, scanMode]);

    const handleCopy = () => {
        if (!memberCode) return;
        navigator.clipboard?.writeText(memberCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Kartu Identitas Anggota" maxWidth="md">
            <div className="p-5 sm:p-6 flex flex-col items-center">
                
                {/* Apple Wallet-style Header Badge */}
                <div className="w-full rounded-2xl bg-gradient-to-br from-[#124b5a] via-primary to-[#0f3d4a] text-white p-4 mb-5 shadow-lg border border-white/10 relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2.5">
                            <img src="/logo.png" alt="Manasuka" className="w-5 h-5 brightness-0 invert opacity-90" />
                            <span className="text-xs font-bold tracking-widest uppercase text-white/90">Manasuka Pass</span>
                        </div>
                    </div>

                    <div className="mt-3 relative z-10">
                        <p className="text-base sm:text-lg font-bold tracking-tight text-white line-clamp-1">{user?.name || 'Anggota Koperasi'}</p>
                        <p className="text-xs font-mono tracking-widest text-white/80 mt-0.5">{formattedNumber || '---'}</p>
                    </div>

                    {/* Ambient subtle glow */}
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                </div>

                {/* Segmented Mode Selector */}
                <div className="w-full grid grid-cols-2 bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold">
                    <button
                        type="button"
                        onClick={() => setScanMode('qr')}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
                            scanMode === 'qr'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <QrCode className="w-4 h-4" />
                        <span>QR Code (2D)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setScanMode('barcode')}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
                            scanMode === 'barcode'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Barcode className="w-4 h-4" />
                        <span>Barcode 1D (Laser)</span>
                    </button>
                </div>

                {/* High Contrast Scan Surface (Apple HIG Scanner Optimization) */}
                <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center min-h-[220px] shadow-xs">
                    {scanMode === 'qr' ? (
                        <div className="flex flex-col items-center">
                            {qrDataUrl ? (
                                <img
                                    src={qrDataUrl}
                                    alt={`QR Code ${memberCode}`}
                                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg transition-transform duration-300 hover:scale-102"
                                />
                            ) : (
                                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                                    Membuat QR Code...
                                </div>
                            )}
                            <p className="text-[11px] text-slate-400 font-medium mt-2">
                                Cocok untuk kamera smartphone / scanner 2D
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center w-full">
                            <div className="w-full flex justify-center py-2 overflow-x-auto">
                                <svg ref={barcodeRef} className="max-w-full" />
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium mt-2">
                                Standar Code 128 untuk scanner laser minimarket
                            </p>
                        </div>
                    )}
                </div>

                {/* Member Number & Copy Button */}
                <div className="w-full mt-4 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Nomor Anggota (NIA)</span>
                        <span className="text-sm font-mono font-bold text-slate-900">{memberCode || '-'}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-2xs active:scale-95 cursor-pointer"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Tersalin</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Salin</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Footer hint */}
                <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
                    Tunjukkan kode ini ke kasir saat berbelanja di minimarket/toko koperasi untuk pencatatan otomatis transaksi anggota.
                </p>
            </div>
        </Modal>
    );
}

