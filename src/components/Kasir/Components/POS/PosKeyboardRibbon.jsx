import React from 'react';
import { Command } from 'lucide-react';

/**
 * PosKeyboardRibbon: Apple HIG Keyboard Shortcuts Ribbon
 * Displayed on desktop workstations only, hidden on touch tablets.
 */
export default function PosKeyboardRibbon({ isTouchDevice = false }) {
    if (isTouchDevice) return null;

    return (
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between overflow-x-auto text-[11px] text-slate-500 shrink-0 gap-3">
            <div className="flex items-center gap-1.5 shrink-0 font-medium">
                <Command className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-700">Papan Ketik Cepat:</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 font-medium">
                <span><kbd className="px-1.5 py-0.5 font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">↑↓←→</kbd> Pilih</span>
                <span><kbd className="px-1.5 py-0.5 font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">↵ Enter</kbd> Tambah</span>
                <span><kbd className="px-1.5 py-0.5 font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">F1 / Space</kbd> Tunai</span>
                <span><kbd className="px-1.5 py-0.5 font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">F2</kbd> QRIS</span>
                <span><kbd className="px-1.5 py-0.5 font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">F3</kbd> Member</span>
                <span><kbd className="px-1.5 py-0.5 font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">F4</kbd> Parkir</span>
                <span><kbd className="px-1.5 py-0.5 font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">F6</kbd> Kas Laci</span>
                <span><kbd className="px-1.5 py-0.5 font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">F9</kbd> Titipan</span>
                <span><kbd className="px-1.5 py-0.5 font-mono font-bold bg-slate-100 text-slate-700 rounded border border-slate-200">Esc</kbd> Batal</span>
            </div>
        </div>
    );
}
