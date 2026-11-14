import React from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RotateCcw } from 'lucide-react';

export default function SignaturePad({ 
    canvasRef, 
    error, 
    onClear, 
    onBegin,
    label = "Tanda Tangan Digital Pemohon",
    legalText = "Tanda tangan digital sah dan tersimpan secara elektronik sesuai regulasi yang berlaku.",
    heightClass = "h-[140px]"
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
                <label className="text-[13px] font-medium text-slate-700">
                    {label}
                </label>
                {onClear && (
                    <button 
                        type="button" 
                        onClick={onClear}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-700 active:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-3 h-3" strokeWidth={1.75} />
                        <span>Ulangi</span>
                    </button>
                )}
            </div>

            <div className={`border rounded-xl bg-white overflow-hidden relative shadow-2xs transition-all ${
                error 
                    ? 'border-rose-300 ring-4 ring-rose-400/20' 
                    : 'border-slate-200/90 hover:border-slate-300 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10'
            }`}>
                <SignatureCanvas 
                    ref={canvasRef}
                    onBegin={onBegin}
                    penColor="#0f172a"
                    velocityFilterWeight={0.7}
                    minWidth={1.2}
                    maxWidth={2.6}
                    canvasProps={{ className: `w-full ${heightClass} cursor-crosshair touch-none` }} 
                />
            </div>
            
            {error ? (
                <p className="text-[11px] text-rose-500 font-medium">{error}</p>
            ) : legalText ? (
                <p className="text-[11px] text-slate-400 leading-relaxed">
                    {legalText}
                </p>
            ) : null}
        </div>
    );
}


