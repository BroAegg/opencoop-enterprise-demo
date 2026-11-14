import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/UI/DataTable';
import Button from '@/Components/UI/Button';
import { Plus, BookOpen, Printer, Search, X } from 'lucide-react';
import Pagination from '@/Components/UI/Pagination';
import CreateJournalModal from './CreateJournalModal';

export default function Index({ journals = { data: [] }, accounts = [], filters = {} }) {
    const [search, setSearch]   = useState(filters.reference || '');
    const [date, setDate]       = useState(filters.date || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const applyFilters = (overrides = {}) => {
        const params = {
            reference: search,
            date: date,
            ...overrides,
        };
        // Remove empty values so URL stays clean
        Object.keys(params).forEach((k) => {
            if (!params[k]) { delete params[k]; }
        });
        router.get('/admin/jurnal', params, { preserveState: true, replace: true });
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') { applyFilters(); }
    };

    const clearFilters = () => {
        setSearch('');
        setDate('');
        router.get('/admin/jurnal', {}, { preserveState: false, replace: true });
    };

    const hasActiveFilter = filters.reference || filters.date;

    const columns = [
        {
            header: 'Tanggal',
            accessor: 'transaction_date',
            cell: (row) => new Date(row.transaction_date).toLocaleDateString('id-ID', {
                year: 'numeric', month: 'short', day: 'numeric',
            }),
        },
        {
            header: 'No. Bukti',
            accessor: 'journal_number',
            cell: (row) => <span className="font-mono text-slate-700 font-semibold text-[12px]">{row.journal_number}</span>,
        },
        {
            header: 'Uraian / Akun',
            accessor: 'description',
            cell: (row) => (
                <div>
                    <p className="font-medium text-slate-900 text-[13px]">{row.description}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                        {row.entries && row.entries.map((line, idx) => {
                            const isDebit = Number(line.debit) > 0;
                            const amount  = isDebit ? Number(line.debit) : Number(line.credit);
                            return (
                                <div key={idx} className={`text-[11px] flex gap-2 ${isDebit ? 'text-slate-600' : 'text-slate-500 pl-4'}`}>
                                    <span className="flex-1">{line.account?.code} - {line.account?.name}</span>
                                    <span className="shrink-0 tabular-nums">
                                        {isDebit ? `Dr Rp ${amount.toLocaleString('id-ID')}` : `Cr Rp ${amount.toLocaleString('id-ID')}`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ),
        },
        {
            header: 'Total (Rp)',
            accessor: 'total_amount',
            cell: (row) => {
                const total = row.entries?.reduce((sum, line) => sum + Number(line.debit), 0) || 0;
                return <span className="font-medium text-emerald-600 tabular-nums">Rp {total.toLocaleString('id-ID')}</span>;
            },
        },
        {
            header: 'Aksi',
            accessor: 'actions',
            cell: (row) => (
                <a href={`/admin/jurnal/${row.id}`} className="text-[12px] font-medium text-primary hover:underline">
                    Detail
                </a>
            ),
        },
    ];

    const filterBar = (
        <div className="flex flex-wrap items-center gap-2">
            {/* Search / Keyword */}
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Cari no bukti / uraian..."
                    className="pl-8 pr-3 py-1.5 text-[13px] border border-slate-200 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
            </div>

            {/* Date filter */}
            <input
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); applyFilters({ date: e.target.value }); }}
                className="px-3 py-1.5 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />

            <Button variant="primary" size="sm" onClick={() => applyFilters()}>
                <Search className="w-3.5 h-3.5" /> Cari
            </Button>

            {hasActiveFilter && (
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-[12px] text-slate-500 hover:text-red-500 transition-colors"
                >
                    <X className="w-3.5 h-3.5" /> Reset
                </button>
            )}
        </div>
    );

    return (
        <AdminLayout pageTitle="Jurnal Umum">
            <Head title="Jurnal Umum" />
            <div className="max-w-[1400px] mx-auto flex flex-col gap-6">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-primary" />
                            Jurnal Umum
                        </h1>
                        <p className="text-[13px] text-slate-500 font-medium">
                            Daftar seluruh transaksi yang telah dijurnal ke sistem.
                            {hasActiveFilter && (
                                <span className="ml-2 text-primary font-semibold">
                                    · Filter aktif
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" size="sm">
                            <Printer className="w-4 h-4" /> Cetak Laporan
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                            <Plus className="w-4 h-4" /> Entri Jurnal Baru
                        </Button>
                    </div>
                </div>

                <DataTable
                    title="Riwayat Jurnal"
                    columns={columns}
                    data={journals.data || journals}
                    actions={filterBar}
                    emptyMessage="Tidak ada riwayat jurnal yang sesuai filter."
                />

                {journals.links && (
                    <div className="mt-[-24px]">
                        <Pagination links={journals.links} />
                    </div>
                )}
            </div>

            <CreateJournalModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                accounts={accounts}
            />
        </AdminLayout>
    );
}

