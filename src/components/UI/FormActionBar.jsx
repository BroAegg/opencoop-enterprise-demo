import React from 'react';
import Button from '@/Components/UI/Button';
import { Save } from 'lucide-react';

export default function FormActionBar({ 
    title, 
    cancelUrl, 
    saveText = "Simpan", 
    saveTextMobile = "Simpan",
    processing = false 
}) {
    return (
        <div className="
            fixed bottom-0 left-0 right-0 z-50 p-4 px-5 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]
            sm:sticky sm:top-4 sm:bottom-auto sm:left-auto sm:right-auto sm:z-40 sm:p-3 sm:px-3 sm:bg-white/80 sm:border sm:border-slate-200/80 sm:rounded-2xl sm:shadow-sm
            flex justify-between items-center transition-all
        ">
            <div className="text-[16px] sm:text-[14px] font-bold text-slate-800 pl-1 sm:pl-2">
                {title}
            </div>
            <div className="flex items-center gap-3 sm:gap-2">
                <Button variant="secondary" size="sm" href={cancelUrl} type="button">
                    Batal
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={processing}>
                    <Save className="w-4 h-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">{processing ? 'Menyimpan...' : saveText}</span>
                    <span className="sm:hidden">{processing ? '...' : saveTextMobile}</span>
                </Button>
            </div>
        </div>
    );
}

