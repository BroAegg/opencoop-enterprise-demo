import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/UI/Card';
import StatusBadge from '@/Components/UI/StatusBadge';
import { FileText, ChevronRight, BookOpen, Calendar, User, Hash } from 'lucide-react';

export default function Show({ journal = null }) {
    if (!journal) {
        return (
            <AdminLayout pageTitle="Detail Jurnal">
                <Head title="Detail Jurnal" />
                <div className="max-w-3xl mx-auto text-center py-20 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>Jurnal tidak ditemukan.</p>
                </div>
            </AdminLayout>
        );
    }

    const totalDebit = journal.entries?.reduce((s, e) => s + Number(e.debit ?? 0), 0) ?? 0;
    const totalCredit = journal.entries?.reduce((s, e) => s + Number(e.credit ?? 0), 0) ?? 0;
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    return (
        <AdminLayout pageTitle="Detail Jurnal">
            <Head title={`Jurnal ${journal.journal_number}`} />

            <div className="max-w-4xl mx-auto flex flex-col gap-6">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[13px] text-slate-500">
                    <Link href="/admin/jurnal" className="hover:text-primary transition-colors">Jurnal Umum</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="font-medium text-slate-900">{journal.journal_number}</span>
                </div>

                {/* Header Card */}
                <Card innerPadding="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">{journal.journal_number}</h1>
                                    <p className="text-[12px] text-slate-500 mt-0.5">{journal.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-medium">Tanggal</p>
                                        <p className="text-[13px] font-semibold text-slate-900">
                                            {journal.transaction_date
                                                ? new Date(journal.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                : '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-medium">Periode</p>
                                        <p className="text-[13px] font-semibold text-slate-900">{journal.fiscal_period?.code ?? '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-medium">Dibuat Oleh</p>
                                        <p className="text-[13px] font-semibold text-slate-900">{journal.created_by_user?.name ?? 'Sistem'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <StatusBadge status={journal.is_posted ? 'POSTED' : 'DRAFT'} />
                    </div>
                </Card>

                {/* Journal Entries */}
                <Card>
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Entri Jurnal</h2>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${isBalanced ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {isBalanced ? '✓ Seimbang' : '⚠ Tidak Seimbang'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Akun</th>
                                    <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Keterangan</th>
                                    <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Debit (Rp)</th>
                                    <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kredit (Rp)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(journal.entries ?? []).map((entry, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <span className="font-mono text-[12px] text-slate-500 mr-2">{entry.account?.code}</span>
                                            <span className="font-medium text-slate-900">{entry.account?.name}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-500">{entry.description ?? '-'}</td>
                                        <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                                            {Number(entry.debit) > 0 ? Number(entry.debit).toLocaleString('id-ID') : '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                                            {Number(entry.credit) > 0 ? Number(entry.credit).toLocaleString('id-ID') : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-50 border-t-2 border-slate-200">
                                    <td colSpan={2} className="px-5 py-3 font-bold text-[13px] text-slate-900 uppercase tracking-wider">Total</td>
                                    <td className="px-5 py-3 text-right font-bold text-[13px] text-slate-900">
                                        {totalDebit.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-5 py-3 text-right font-bold text-[13px] text-slate-900">
                                        {totalCredit.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Card>

            </div>
        </AdminLayout>
    );
}

