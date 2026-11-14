import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { BookMarked, Download, FileText } from 'lucide-react';

export default function BookGenerator({ year = 2026 }) {
    
    const chapters = [
        "Bab I: Pendahuluan & Susunan Pengurus",
        "Bab II: Laporan Pertanggungjawaban Pengurus",
        "Bab III: Laporan Hasil Pemeriksaan Pengawas",
        "Bab IV: Laporan Keuangan (Neraca & Laba Rugi)",
        "Bab V: Rencana Kerja Tahun Buku Berikutnya",
        "Bab VI: Rencana Anggaran Pendapatan dan Belanja (RAPB)",
        "Bab VII: Usulan Pembagian SHU",
        "Bab VIII: Penutup",
    ];

    return (
        <AdminLayout pageTitle={`Buku RAT - Tahun ${year}`}>
            <Head title="RAT Book Generator" />
            
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6">
                
                {/* Left Panel: Chapters Checklist */}
                <Card className="flex-1 shadow-sm h-fit">
                    <div className="border-b border-slate-100 pb-4 mb-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <BookMarked className="w-5 h-5 text-primary" />
                            Struktur Buku RAT
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Checklist dokumen yang di-generate otomatis dari sistem.</p>
                    </div>
                    
                    <div className="space-y-3">
                        {chapters.map((chapter, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-primary/30 transition-colors">
                                <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                                <span className="text-sm font-semibold text-slate-700">{chapter}</span>
                                <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                    <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                    </svg>
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Right Panel: Export Options */}
                <div className="w-full md:w-80 flex flex-col gap-4">
                    <div className="bg-primary text-white rounded-2xl p-6 shadow-md shadow-primary/20 text-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                            <Download className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Generate Buku</h3>
                        <p className="text-sm text-primary-50 mb-6">
                            Kompilasi semua laporan di atas menjadi satu dokumen utuh siap cetak.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <Button variant="secondary" className="w-full font-bold">
                                Download PDF
                            </Button>
                            <Button variant="secondary" className="w-full opacity-80 hover:opacity-100">
                                Download Word (.docx)
                            </Button>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                        <h4 className="font-bold text-amber-800 text-sm mb-1">Catatan Penting</h4>
                        <p className="text-xs text-amber-700">
                            Pastikan Anda telah melakukan "Tutup Buku" pada menu Periode Pembukuan sebelum men-generate buku RAT agar data keuangan yang disajikan valid dan final.
                        </p>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}

