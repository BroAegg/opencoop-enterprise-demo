import React from 'react';
import { usePage } from '@inertiajs/react';
import { Printer, FileDown } from 'lucide-react';
import Modal from '@/Components/UI/Modal';
import { formatRupiah, formatDateTime } from '@/Utils/format';
import { METHOD_LABELS } from './constants';

export default function SlipModal({ distribution, session, onClose }) {
    const { coop } = usePage().props;

    if (!distribution) return null;

    const isDisbursed = Boolean(distribution.is_disbursed);

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal 
            isOpen={!!distribution} 
            onClose={onClose} 
            title={isDisbursed ? 'Kuitansi Pencairan SHU' : 'Rincian Hak SHU'} 
            maxWidth="sm"
        >
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-receipt, #printable-receipt * {
                        visibility: visible !important;
                    }
                    #printable-receipt {
                        position: fixed !important;
                        left: 0 !important;
                        right: 0 !important;
                        top: 10mm !important;
                        margin: 0 auto !important;
                        width: 90mm !important;
                        max-width: 90mm !important;
                        box-shadow: none !important;
                        border: 1px solid #cbd5e1 !important;
                        border-radius: 8px !important;
                        background: #ffffff !important;
                        padding: 0 !important;
                    }
                }
            `}</style>

            <div className="p-5 sm:p-6 space-y-4 bg-slate-50">
                {/* Physical Receipt Card */}
                <div 
                    id="printable-receipt" 
                    className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden text-slate-800"
                >
                    {/* Header */}
                    <div className="text-center px-5 pt-5 pb-4 border-b border-dashed border-slate-200 bg-slate-50/50">
                        <img 
                            src={coop?.logo ?? '/logo.png'} 
                            alt="Logo" 
                            className="w-9 h-9 object-contain mx-auto mb-2" 
                        />
                        <h4 className="text-[13px] font-bold text-slate-900 tracking-tight uppercase">
                            {coop?.name ?? 'KOPERASI Manasuka'}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mt-0.5">
                            {isDisbursed ? 'Kuitansi Pencairan SHU' : 'Rincian Alokasi Hak SHU'}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                            Tahun Buku {session.tahun_buku}
                        </p>
                    </div>

                    {/* Hero Total Amount */}
                    <div className="text-center px-5 py-5 border-b border-dashed border-slate-200 bg-white">
                        <p className="text-[11px] font-medium text-slate-500 mb-1">
                            {isDisbursed ? 'Total Diterima' : 'Total Hak SHU'}
                        </p>
                        <p className="text-[26px] font-bold text-slate-900 font-mono tracking-tight leading-none">
                            {formatRupiah(distribution.shu_amount)}
                        </p>
                        {isDisbursed && distribution.disbursement_method && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200/60 mt-2.5 uppercase">
                                {METHOD_LABELS[distribution.disbursement_method] ?? distribution.disbursement_method}
                            </span>
                        )}
                    </div>

                    {/* Detail Breakdown */}
                    <div className="p-5 space-y-2.5 text-[12px]">
                        {/* Member Identity */}
                        <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                            <span className="text-slate-500">Anggota</span>
                            <div className="text-right">
                                <p className="font-semibold text-slate-900">{distribution.member?.name}</p>
                                <p className="text-[10px] font-mono text-slate-400">
                                    {distribution.member?.member_number}
                                    {distribution.member?.unit_kerja ? ` • ${distribution.member.unit_kerja}` : ''}
                                </p>
                            </div>
                        </div>

                        {/* Breakdown Components */}
                        <div className="flex justify-between items-center py-1">
                            <span className="text-slate-500">Jasa Modal / Simpanan</span>
                            <span className="font-semibold font-mono text-slate-800">
                                {formatRupiah(distribution.jasa_simpanan_amount)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-slate-500">Jasa Usaha / Anggota</span>
                            <span className="font-semibold font-mono text-slate-800">
                                {formatRupiah(distribution.jasa_usaha_amount)}
                            </span>
                        </div>

                        {/* Audit Trail / Disbursed Details */}
                        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                            {isDisbursed ? (
                                <>
                                    {distribution.disbursed_at && (
                                        <div className="flex justify-between items-center text-slate-500">
                                            <span>Waktu Pencairan</span>
                                            <span className="font-mono text-slate-700">
                                                {formatDateTime(distribution.disbursed_at)}
                                            </span>
                                        </div>
                                    )}
                                    {distribution.notes && (
                                        <div className="flex justify-between items-start text-slate-500 gap-2">
                                            <span className="shrink-0">Catatan</span>
                                            <span className="text-right text-slate-700 italic">
                                                {distribution.notes}
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex justify-between items-center text-slate-500">
                                    <span>Status</span>
                                    <span className="font-medium text-slate-600">
                                        Belum Dicairkan
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Signatures for physical receipt */}
                        <div className="pt-6 pb-2 grid grid-cols-2 gap-4 text-center text-[10px]">
                            <div>
                                <p className="text-slate-500 mb-10">Penerima,</p>
                                <div className="border-b border-slate-300 mx-3"></div>
                                <p className="mt-1 font-medium text-slate-700 truncate px-1">
                                    {distribution.member?.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500 mb-10">Kasir / Pengurus,</p>
                                <div className="border-b border-slate-300 mx-3"></div>
                                <p className="mt-1 font-medium text-slate-700">
                                    (........................)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Reference Footer */}
                    <div className="bg-slate-50/75 px-5 py-3 border-t border-slate-100 flex justify-between items-center text-[9px] font-mono text-slate-400">
                        <span>REF: {String(distribution.id).padStart(5, '0')}-SHU-{session.tahun_buku}</span>
                        <span>{formatDateTime(new Date())}</span>
                    </div>
                </div>

                {/* Modal Action Controls (Hidden on Print) */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1 print:hidden">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-100 bg-white transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-[13px] font-medium transition-colors flex items-center justify-center gap-2 bg-white cursor-pointer"
                        title="Cetak struk fisik via browser / thermal printer"
                    >
                        <Printer className="w-4 h-4 text-slate-500" />
                        Cetak Struk
                    </button>
                    <a
                        href={`/admin/rat/${session.id}/distributions/${distribution.id}/slip-pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#1F6376] hover:bg-[#184f5e] text-white text-[13px] font-medium transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer text-center"
                    >
                        <FileDown className="w-4 h-4" />
                        Unduh PDF Resmi
                    </a>
                </div>
            </div>
        </Modal>
    );
}

