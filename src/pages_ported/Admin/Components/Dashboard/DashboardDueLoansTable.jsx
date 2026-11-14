import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export default function DashboardDueLoansTable({
    loans = [],
    className = '',
}) {
    const formatRp = (num) => `Rp ${Number(num || 0).toLocaleString('id-ID')}`;

    return (
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
                    Piutang Pinjaman <span className="text-[11px] font-normal text-slate-400">(Jatuh Tempo Terdekat)</span>
                </h3>
                <Link
                    href="/admin/loans"
                    className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
                >
                    Lihat semua <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left border-collapse text-[12px]">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                            <th className="py-2.5 px-4 w-10 text-center">No</th>
                            <th className="py-2.5 px-4">Nama Anggota</th>
                            <th className="py-2.5 px-4 text-right">Jumlah Pinjaman</th>
                            <th className="py-2.5 px-4 text-right">Sisa Pokok</th>
                            <th className="py-2.5 px-4">Jatuh Tempo</th>
                            <th className="py-2.5 px-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loans && loans.length > 0 ? (
                            loans.map((loan, idx) => (
                                <tr key={loan.id || idx} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                                        {loan.no || idx + 1}
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-slate-900">
                                        <div>{loan.member_name}</div>
                                        <div className="text-[10px] font-mono text-slate-400 font-normal">
                                            {loan.member_number}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                                        {formatRp(loan.total_loan)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                                        {formatRp(loan.remaining_amount)}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 font-medium">
                                        {loan.due_date}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            loan.is_urgent 
                                                ? 'bg-amber-100 text-amber-800' 
                                                : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {loan.status_label}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                                    Tidak ada data pinjaman yang mendekati jatuh tempo.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

