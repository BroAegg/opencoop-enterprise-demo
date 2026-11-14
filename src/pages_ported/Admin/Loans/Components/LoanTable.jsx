import React from 'react';
import { router, Link } from '@inertiajs/react';
import TactileDataTable from '@/Components/UI/TactileDataTable';
import StatusBadge from '@/Components/UI/StatusBadge';
import { ArrowUpRight, ChevronRight } from 'lucide-react';

export default function LoanTable({ loans, pagination, className = '' }) {
    const columns = [
        {
            key: 'loan_number',
            label: 'No. Pembiayaan & Anggota',
            headerClassName: 'w-[32%]',
            render: (val, row) => {
                const isBmt = row.loan_source === 'BMT_ITQAN';
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 tracking-tight text-xs">
                                {row.loan_number}
                            </span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                                isBmt 
                                    ? 'bg-purple-50 text-purple-700 border-purple-200/70' 
                                    : 'bg-[#1F6376]/10 text-[#1F6376] border-[#1F6376]/20'
                            }`}>
                                {isBmt ? 'BMT ITQAN' : 'Koperasi'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-semibold text-slate-800">
                                {row.member?.name || '-'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                                ({row.member?.member_number || '-'})
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'base_amount',
            label: 'Plafon & Tenor',
            align: 'right',
            mono: true,
            render: (val, row) => (
                <div className="space-y-0.5">
                    <div className="font-bold text-slate-800 font-mono text-xs">
                        Rp {Number(row.base_amount || 0).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10.5px] text-slate-400 font-medium">
                        Tenor {row.tenor || 0} bln
                    </div>
                </div>
            ),
        },
        {
            key: 'remaining_amount',
            label: 'Sisa Pokok & Pelunasan',
            align: 'right',
            mono: true,
            render: (val, row) => {
                const base = Number(row.base_amount || 1);
                const remaining = Number(row.remaining_amount || 0);
                const paid = Math.max(0, base - remaining);
                const percent = Math.min(100, Math.max(0, Math.round((paid / base) * 100)));
                const isLunas = row.status === 'LUNAS' || remaining <= 0;

                return (
                    <div className="space-y-1">
                        <div className="font-bold text-slate-900 font-mono text-xs">
                            Rp {remaining.toLocaleString('id-ID')}
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all ${isLunas ? 'bg-emerald-500' : 'bg-[#1F6376]'}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">
                                {percent}%
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'monthly_installment',
            label: 'Angsuran / Bln',
            align: 'right',
            mono: true,
            render: (val, row) => (
                <div className="space-y-0.5">
                    <div className="font-semibold text-slate-700 font-mono text-xs">
                        Rp {Number(row.monthly_installment || 0).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                        per bulan
                    </div>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            align: 'center',
            render: (val, row) => (
                <StatusBadge 
                    status={row.status} 
                    dot={row.status === 'PENDING' || row.status === 'ACTIVE'}
                    pulse={row.status === 'PENDING'}
                />
            ),
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            render: (val, row) => (
                <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                    <Link
                        href={`/admin/pembiayaan/${row.id}`}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                        title="Buka rincian pembiayaan"
                    >
                        <span className="sm:inline hidden text-[11px] text-slate-500 hover:text-slate-900">Rincian</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                </div>
            ),
        },
    ];

    const renderMobileCard = (row) => {
        const isBmt = row.loan_source === 'BMT_ITQAN';
        const base = Number(row.base_amount || 1);
        const remaining = Number(row.remaining_amount || 0);
        const paid = Math.max(0, base - remaining);
        const percent = Math.min(100, Math.max(0, Math.round((paid / base) * 100)));

        return (
            <div 
                onClick={() => router.visit(`/admin/pembiayaan/${row.id}`)}
                className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5 cursor-pointer active:scale-[0.99] transition-all hover:border-slate-300"
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                            {row.loan_number}
                        </span>
                        <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                            isBmt 
                                ? 'bg-purple-50 text-purple-700 border-purple-200/70' 
                                : 'bg-[#1F6376]/10 text-[#1F6376] border-[#1F6376]/20'
                        }`}>
                            {isBmt ? 'BMT' : 'Koperasi'}
                        </span>
                    </div>
                    <StatusBadge status={row.status} />
                </div>

                {/* Member */}
                <div>
                    <div className="font-bold text-slate-900 text-[13px]">
                        {row.member?.name || '-'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                        No. Anggota: {row.member?.member_number || '-'}
                    </div>
                </div>

                {/* Metric Split */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50/90 border border-slate-100 text-xs">
                    <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Plafon ({row.tenor} bln)</span>
                        <span className="font-mono font-bold text-slate-700">
                            Rp {Number(row.base_amount || 0).toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-medium block">Sisa Pokok</span>
                        <span className="font-mono font-bold text-slate-900">
                            Rp {remaining.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

                {/* Progress & Link */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#1F6376] rounded-full"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                        <span className="text-[10.5px] font-mono text-slate-500 font-medium">
                            {percent}% lunas
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#1F6376]">
                        <span>Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <TactileDataTable 
            columns={columns}
            data={loans.data}
            onRowClick={(row) => router.visit(`/admin/pembiayaan/${row.id}`)}
            renderMobileCard={renderMobileCard}
            pagination={pagination}
            emptyTitle="Tidak Ada Pembiayaan"
            emptyMessage="Belum ada data pembiayaan yang cocok dengan filter ini."
            className={`border border-slate-200/70 ${className}`}
        />
    );
}

