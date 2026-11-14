import React from 'react';
import TactileFilterToolbar from '@/Components/UI/TactileFilterToolbar';
import { Landmark } from 'lucide-react';

export default function LoanFilters({
    search,
    onSearchChange,
    statusCounts = {},
    filters = {},
    onFilterChange,
}) {
    const statusOptions = [
        { id: 'all', label: 'Semua Status', count: statusCounts.all },
        { id: 'PENDING', label: 'Menunggu Review', count: statusCounts.PENDING },
        { id: 'APPROVED', label: 'Siap Cair', count: statusCounts.APPROVED },
        { id: 'ACTIVE', label: 'Aktif Berjalan', count: statusCounts.ACTIVE },
        { id: 'LUNAS', label: 'Lunas', count: statusCounts.LUNAS },
        { id: 'REJECTED', label: 'Ditolak', count: statusCounts.REJECTED },
    ];

    const secondaryControls = (
        <div className="relative">
            <select
                value={filters.source || 'all'}
                onChange={(e) => onFilterChange('source', e.target.value)}
                className="h-10 pl-8 pr-8 text-xs font-bold rounded-2xl bg-white border border-slate-200/80 text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_white] hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#1F6376] appearance-none cursor-pointer transition-all"
            >
                <option value="all">Semua Sumber Dana</option>
                <option value="Manasuka">Dana Koperasi</option>
                <option value="BMT_ITQAN">BMT ITQAN</option>
            </select>
            <Landmark className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
        </div>
    );

    return (
        <TactileFilterToolbar
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Cari nomor pembiayaan, nama anggota, NIK..."
            filterOptions={statusOptions}
            activeFilter={filters.status || 'all'}
            onFilterChange={(newStatus) => onFilterChange('status', newStatus)}
            secondaryControls={secondaryControls}
        />
    );
}

