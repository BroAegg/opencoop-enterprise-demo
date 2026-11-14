import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { RotateCw } from 'lucide-react';

/**
 * ManasukaMemberCard
 *
 * Revolut / Apple Card-inspired 3D Interactive Flip Card.
 * - Front: Pure luxury dark-teal membership card with zero visual clutter.
 * - Back: Retail-ready Code 128 1D Barcode on high-contrast white substrate for 100% laser scanner readability.
 * - Interaction: 3D perspective flip on tap/click with cross-browser WebKit support.
 */
export default function ManasukaMemberCard({ user = {}, className = '' }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const barcodeRef = useRef(null);

    const isCoop = Boolean(user?.is_member_koperasi);
    const rawNumber = String(
        user?.card_number || (isCoop ? (user?.member_number || user?.nip_nbm) : (user?.nim || user?.phone)) || user?.id || ''
    ).trim();
    const formattedNumber = rawNumber.replace(/(.{4})/g, '$1 ').trim();
    const barcodeValue = user?.card_number || rawNumber;

    useEffect(() => {
        if (!barcodeRef.current || !barcodeValue) return;

        try {
            JsBarcode(barcodeRef.current, barcodeValue, {
                format: 'CODE128',
                lineColor: '#0f172a',
                width: 1.6,
                height: 48,
                displayValue: true, // Human-readable fallback for cashier manual typing
                fontSize: 12,
                font: 'monospace',
                textMargin: 6,
                margin: 6,
                background: '#ffffff',
            });
        } catch (e) {
            console.error('Failed to generate member barcode', e);
        }
    }, [barcodeValue, isFlipped]);

    return (
        <div 
            className={`w-full h-full select-none cursor-pointer ${className}`}
            style={{ perspective: 1200, WebkitPerspective: 1200 }}
            onClick={() => setIsFlipped(prev => !prev)}
            title="Ketuk kartu untuk membalik & melihat barcode kasir"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsFlipped(prev => !prev);
                }
            }}
        >
            <div 
                className="relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                style={{
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    WebkitTransform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transformStyle: 'preserve-3d',
                    WebkitTransformStyle: 'preserve-3d',
                }}
            >
                {/* ================= SISI DEPAN (FRONT FACE) ================= */}
                <div 
                    className="absolute inset-0 w-full h-full rounded-[32px] shadow-2xl shadow-primary/20"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(0deg)',
                        WebkitTransform: 'rotateY(0deg)',
                        zIndex: isFlipped ? 0 : 2,
                    }}
                >
                    <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-gradient-to-br from-[#124b5a] via-primary to-[#0f3d4a] p-7 sm:p-8 border border-white/15 flex flex-col justify-between">
                        {/* Noise texture overlay */}
                        <div 
                            className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none" 
                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
                        />
                        
                        {/* Ambient light reflection */}
                        <div className="absolute -right-8 -top-8 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Top Row: Logo Manasuka & Tier Badge */}
                        <div className="relative z-10 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <img src="/logo.png" alt="Manasuka" className="w-6 h-6 brightness-0 invert opacity-95" />
                                <span className="text-white/95 font-bold tracking-widest text-[13px] uppercase">
                                    {isCoop ? 'Manasuka' : 'Manasuka Pass'}
                                </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-full material-liquid-glass-dark text-[10px] font-mono font-bold tracking-wider text-white/90 uppercase border border-white/20 shadow-xs">
                                {isCoop ? 'Anggota' : (user?.nim ? 'Student' : 'Rewards')}
                            </span>
                        </div>

                        {/* Bottom Row: Member Number & Name */}
                        <div className="relative z-10 mt-auto">
                            <p className="text-xl sm:text-2xl md:text-3xl font-mono tracking-wider mb-1 text-white/95 drop-shadow-sm font-tabular">
                                {formattedNumber || '---- ---- ---- ----'}
                            </p>
                            <p className="font-bold tracking-tight text-[15px] sm:text-[17px] text-white/95 truncate">
                                {user?.name || (isCoop ? 'Anggota Koperasi' : 'Pelanggan Manasuka')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ================= SISI BELAKANG (BACK FACE) ================= */}
                <div 
                    className="absolute inset-0 w-full h-full rounded-[32px] shadow-2xl shadow-primary/20"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        WebkitTransform: 'rotateY(180deg)',
                        zIndex: isFlipped ? 2 : 0,
                    }}
                >
                    <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-gradient-to-br from-[#0d343f] via-[#103e4b] to-[#0a2830] p-6 sm:p-7 border border-white/15 flex flex-col justify-between">
                        {/* Top: Header & Flip-back Button */}
                        <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="Manasuka" className="w-4 h-4 brightness-0 invert opacity-80" />
                                <span className="text-[11px] font-bold tracking-widest uppercase text-white/70">
                                    {isCoop ? 'Scan Member Kasir' : 'Scan Barcode Kasir'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-white/70 hover:text-white transition-colors">
                                <RotateCw className="w-3.5 h-3.5" />
                                <span>Balik</span>
                            </div>
                        </div>

                        {/* Center: High-Contrast Scanning Substrate for Laser Scanner */}
                        <div className="relative z-10 w-full bg-white rounded-2xl p-2.5 shadow-lg flex flex-col items-center justify-center overflow-hidden my-auto">
                            {barcodeValue ? (
                                <svg ref={barcodeRef} className="max-w-full" />
                            ) : (
                                <div className="h-16 flex items-center justify-center text-slate-400 text-xs font-mono">
                                    Barcode tidak tersedia
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

