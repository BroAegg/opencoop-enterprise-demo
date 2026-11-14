import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/UI/DataTable';
import Button from '@/Components/UI/Button';
import StatusBadge from '@/Components/UI/StatusBadge';
import FilterDropdown from '@/Components/UI/FilterDropdown';
import SearchInput from '@/Components/UI/SearchInput';
import { Plus, ListTree } from 'lucide-react';

export default function Index({ accounts = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilterChange = (key, value) => {
        router.get('/admin/coa', { 
            ...filters, 
            search: search,
            [key]: value 
        }, { preserveState: true, replace: true });
    };

    const columns = [
        { header: 'Kode Akun', accessor: 'code', cell: row => <span className={`font-mono ${row.is_group ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{row.code}</span> },
        { header: 'Nama Akun', accessor: 'name', cell: row => <span className={`font-medium ${row.is_group ? 'text-slate-900 font-bold' : 'text-slate-700 ml-4'}`}>{row.name}</span> },
        { header: 'Tipe', accessor: 'type', cell: row => <span className="text-[12px] uppercase tracking-wider text-slate-500">{row.type}</span> },
        { header: 'Saldo Normal', accessor: 'normal_balance', cell: row => <span className="text-[12px] uppercase text-slate-500">{row.normal_balance}</span> },
        { header: 'Status', accessor: 'is_active', cell: row => (
            <StatusBadge status={row.is_active ? 'AKTIF' : 'NONAKTIF'} />
        )},
    ];

    const actions = (
        <div className="flex items-center gap-2">
            <SearchInput 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Cari kode/nama akun..." 
                className="w-64"
            />
            <FilterDropdown 
                label="Semua Tipe"
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                options={[
                    { value: 'ASET', label: 'Aktiva (Aset)' },
                    { value: 'LIABILITAS', label: 'Kewajiban (Liabilitas)' },
                    { value: 'EKUITAS', label: 'Ekuitas (Modal)' },
                    { value: 'PENDAPATAN', label: 'Pendapatan' },
                    { value: 'BEBAN', label: 'Beban/Biaya' },
                ]}
            />
        </div>
    );

    return (
        <AdminLayout pageTitle="Chart of Accounts">
            <Head title="Chart of Accounts" />
            <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-2">
                            <ListTree className="w-6 h-6 text-primary" />
                            Chart of Accounts (COA)
                        </h1>
                        <p className="text-[13px] text-slate-500 font-medium">
                            Manajemen daftar kode akun perkiraan untuk pembukuan koperasi.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="primary" size="sm">
                            <Plus className="w-4 h-4" /> Tambah Akun Baru
                        </Button>
                    </div>
                </div>

                <DataTable 
                    title="Daftar Akun"
                    columns={columns}
                    data={accounts}
                    actions={actions}
                    emptyMessage="Tidak ada data akun perkiraan."
                />
            </div>
        </AdminLayout>
    );
}

