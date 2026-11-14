import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatCard from '@/Components/UI/StatCard';
import Button from '@/Components/UI/Button';
import { HandCoins, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import LoanTable from './Components/LoanTable';
import LoanFilters from './Components/LoanFilters';

export default function Index({ loans, stats = {}, statusCounts = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/admin/pembiayaan', {
                    ...filters,
                    search: search || undefined,
                    page: 1,
                }, { preserveState: true, replace: true });
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    const handleFilterChange = (key, value) => {
        const updated = {
            ...filters,
            [key]: value === 'all' ? undefined : value,
            page: 1,
        };

        router.get('/admin/pembiayaan', updated, { preserveState: true, replace: true });
    };

    const pagination = {
        page: loans.current_page || 1,
        perPage: loans.per_page || 20,
        total: loans.total || 0,
        onPageChange: (newPage) => {
            router.get('/admin/pembiayaan', {
                ...filters,
                page: newPage,
            }, { preserveState: true, replace: true });
        },
        onPerPageChange: (newPerPage) => {
            router.get('/admin/pembiayaan', {
                ...filters,
                per_page: newPerPage,
                page: 1,
            }, { preserveState: true, replace: true });
        },
    };

    return (
        <AdminLayout pageTitle="Daftar Pembiayaan">
            <Head title="Pembiayaan" />
            
            <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Manajemen Pembiayaan
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
                                {loans.total || 0} Data
                            </span>
                        </div>
                        <p className="text-[13px] text-slate-500 font-medium mt-1">
                            Kelola pengajuan, persetujuan akad, dan portofolio pembiayaan anggota.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="primary" 
                            size="sm" 
                            href="/admin/pembiayaan/create"
                            className="rounded-2xl shadow-2xs font-bold"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Pengajuan Baru
                        </Button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard 
                        title="Total Outstanding" 
                        value={Number(stats.total_outstanding || 0)} 
                        prefix="Rp"
                        label="Pinjaman Berjalan" 
                        icon={HandCoins} 
                    />
                    <StatCard 
                        title="Pembiayaan Aktif" 
                        value={stats.active_count || 0} 
                        label="Sedang Mengangsur" 
                        icon={CheckCircle} 
                    />
                    <StatCard 
                        title="Menunggu Review" 
                        value={stats.pending_count || 0} 
                        label="Perlu Verifikasi" 
                        icon={Clock} 
                    />
                    <StatCard 
                        title="Menunggu Pencairan" 
                        value={stats.approved_count || 0} 
                        label="Akad Disetujui (Siap Cair)" 
                        icon={AlertCircle} 
                    />
                </div>

                {/* Industrial ERP Filter Bar & Data Table Card */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                    <LoanFilters
                        search={search}
                        onSearchChange={setSearch}
                        statusCounts={statusCounts}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />

                    <LoanTable 
                        loans={loans}
                        pagination={pagination}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}

