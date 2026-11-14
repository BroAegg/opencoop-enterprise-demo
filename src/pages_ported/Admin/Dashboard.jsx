import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Skeleton from '@/Components/UI/Skeleton';
import DashboardMetricStrip from './Components/Dashboard/DashboardMetricStrip';
import DashboardAttentionCard from './Components/Dashboard/DashboardAttentionCard';
import DashboardFinancialChartCard from './Components/Dashboard/DashboardFinancialChartCard';
import DashboardAssetDonutCard from './Components/Dashboard/DashboardAssetDonutCard';
import DashboardUnitActivityCard from './Components/Dashboard/DashboardUnitActivityCard';
import DashboardBusinessUnitChartCard from './Components/Dashboard/DashboardBusinessUnitChartCard';
import DashboardDueLoansTable from './Components/Dashboard/DashboardDueLoansTable';
import DashboardRecentActivityFeed from './Components/Dashboard/DashboardRecentActivityFeed';
import DashboardTopMembersCard from './Components/Dashboard/DashboardTopMembersCard';
import { Calendar } from 'lucide-react';

export default function Dashboard(props) {
    const data = props.dashboard_data || props;
    const { 
        total_members = 0, 
        total_simpanan = 0, 
        total_loans_outstanding = 0, 
        kas_bank = 0,
        trend_data = [],
        portfolio_quality = {},
        retail_revenue = 0,
        asset_composition = {},
        recent_activities = [],
        top_members = [],
        near_due_loans = [],
        attention_items = [],
        today_unit_activity = [],
    } = data;

    const { auth } = usePage().props;
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const unbindStart = router.on('start', (event) => {
            const visit = event?.detail?.visit;
            if (visit?.prefetch) return;

            const rawUrl = visit?.url;
            const targetPath = typeof rawUrl === 'string'
                ? (rawUrl.startsWith('http') ? new URL(rawUrl).pathname : rawUrl.split('?')[0])
                : (rawUrl?.pathname || '');

            if (targetPath === '/admin/dashboard' || targetPath === '/admin') {
                setIsNavigating(true);
            }
        });
        const unbindFinish = router.on('finish', () => setIsNavigating(false));
        return () => {
            unbindStart();
            unbindFinish();
        };
    }, []);

    const isLoading = isNavigating || (!props.dashboard_data && !props.total_members && !props.total_simpanan);

    const rawName = auth?.user?.name ?? '';
    // Use first word only if it's meaningful (> 1 char), else fall back to first two words
    const nameParts = rawName.trim().split(' ').filter(Boolean);
    const userName = nameParts.length === 0
        ? 'Pengurus'
        : nameParts[0].length <= 1 && nameParts.length > 1
            ? nameParts.slice(0, 2).join(' ')
            : nameParts[0];

    // Current formatted date in Indonesian
    const todayFormatted = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <AdminLayout pageTitle="Dashboard">
            <Head title="Dashboard Admin" />
            <div className="max-w-[1520px] mx-auto flex flex-col gap-5 pb-10">
                
                {/* Header: Greeting & Date Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-[28px] font-serif font-semibold tracking-tight text-slate-900">
                            Selamat bertugas, {userName}
                        </h1>
                        <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                            Ringkasan komprehensif kondisi harian, kesehatan portofolio, dan kontrol multi-unit koperasi.
                        </p>
                    </div>

                    {/* Date Badge */}
                    <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs text-[12px] font-medium text-slate-600 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{todayFormatted}</span>
                    </div>
                </div>

                {/* Unified 9:3 Workstation Grid: Instant Skeleton vs Data */}
                {isLoading ? (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                        {/* Primary Operational Canvas Skeleton (9 Columns) */}
                        <div className="xl:col-span-9 flex flex-col gap-4 min-w-0">
                            {/* 1. 4-KPI Metric Strip Skeleton */}
                            <Skeleton.KpiGrid count={4} />

                            {/* 2. Sub-row A: Financial Chart (8 cols) + Asset Donut (4 cols) */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                                <div className="lg:col-span-8 min-w-0">
                                    <Skeleton.ChartCard />
                                </div>
                                <div className="lg:col-span-4 min-w-0">
                                    <Skeleton.Card height="h-[360px]" />
                                </div>
                            </div>

                            {/* 3. Sub-row B: Aktivitas Unit Usaha (5 cols) + Komparatif (7 cols) */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                                <div className="lg:col-span-5 min-w-0">
                                    <Skeleton.Card height="h-[280px]" />
                                </div>
                                <div className="lg:col-span-7 min-w-0">
                                    <Skeleton.Card height="h-[280px]" />
                                </div>
                            </div>

                            {/* 4. Sub-row C: Piutang Jatuh Tempo Table */}
                            <div className="min-w-0">
                                <Skeleton.Table rows={5} />
                            </div>
                        </div>

                        {/* Quick Ops Rail Skeleton (3 Columns) */}
                        <div className="xl:col-span-3 flex flex-col gap-4 min-w-0">
                            {/* 1. Alert Perlu Perhatian Skeleton */}
                            <Skeleton.Card height="h-[140px]" />

                            {/* 2. Aktivitas Log Skeleton */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                                <div className="h-4 bg-slate-200/80 rounded w-28 animate-pulse" />
                                <Skeleton.List count={4} />
                            </div>

                            {/* 3. Top Members Skeleton */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                                <div className="h-4 bg-slate-200/80 rounded w-32 animate-pulse" />
                                <Skeleton.List count={3} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                        {/* Primary Operational Canvas (9 Columns / 75% Width) */}
                        <div className="xl:col-span-9 flex flex-col gap-4 min-w-0">
                            {/* 1. 4-KPI Metric Strip */}
                            <DashboardMetricStrip
                                total_simpanan={total_simpanan}
                                total_loans_outstanding={total_loans_outstanding}
                                retail_revenue={retail_revenue}
                                total_members={total_members}
                                active_loan_count={portfolio_quality?.active_loan_count}
                                kas_bank={kas_bank}
                            />

                            {/* 2. Sub-row A: Financial Trend Chart (7-8 cols) + Asset Donut (4-5 cols) */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                                <div className="lg:col-span-8 min-w-0">
                                    <DashboardFinancialChartCard
                                        trend_data={trend_data}
                                        className="h-full"
                                    />
                                </div>
                                <div className="lg:col-span-4 min-w-0">
                                    <DashboardAssetDonutCard
                                        asset_composition={asset_composition}
                                        className="h-full"
                                    />
                                </div>
                            </div>

                            {/* 3. Sub-row B: Aktivitas Unit Usaha (5 cols) + Kinerja Komparatif 30 Hari (7 cols) */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                                <div className="lg:col-span-5 min-w-0">
                                    <DashboardUnitActivityCard
                                        activities={today_unit_activity}
                                        className="h-full"
                                    />
                                </div>
                                <div className="lg:col-span-7 min-w-0">
                                    <DashboardBusinessUnitChartCard 
                                        className="h-full"
                                    />
                                </div>
                            </div>

                            {/* 4. Sub-row C: Piutang Pinjaman Jatuh Tempo Terdekat */}
                            <div className="min-w-0">
                                <DashboardDueLoansTable
                                    loans={near_due_loans}
                                />
                            </div>
                        </div>

                        {/* Quick Ops Rail (3 Columns / 25% Width - Unified Vertical Rail) */}
                        <div className="xl:col-span-3 flex flex-col gap-4 min-w-0">
                            {/* 1. Alert Perlu Perhatian */}
                            <DashboardAttentionCard
                                items={attention_items}
                            />

                            {/* 2. Aktivitas Log & Transaksi Terbaru */}
                            <DashboardRecentActivityFeed
                                activities={recent_activities}
                            />

                            {/* 3. Anggota Kontributor Teratas */}
                            <DashboardTopMembersCard
                                top_members={top_members}
                            />
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

