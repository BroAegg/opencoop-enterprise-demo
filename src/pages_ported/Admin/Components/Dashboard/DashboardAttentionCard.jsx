import React from 'react';
import { Link } from '@inertiajs/react';
import { AlertCircle, FileText, Package, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

const defaultHealthyPillars = [
    {
        id: 'healthy_loans',
        title: 'Portofolio Pinjaman',
        subtitle: 'Portofolio lancar, nihil tunggakan kritis',
        icon: 'alert-circle',
        href: '/admin/loans',
    },
    {
        id: 'healthy_simpanan',
        title: 'Simpanan Anggota',
        subtitle: 'Seluruh mutasi simpanan tercatat rapi',
        icon: 'file-text',
        href: '/admin/simpanan',
    },
    {
        id: 'healthy_inventory',
        title: 'Persediaan Minimarket',
        subtitle: 'Ketersediaan barang aman di atas batas minimum',
        icon: 'package',
        href: '/admin/products',
    },
    {
        id: 'healthy_cash',
        title: 'Operasional Toko & Shift',
        subtitle: 'Kinerja penjualan dan kas kasir berjalan normal',
        icon: 'clock',
        href: '/admin/retail',
    },
];

export default function DashboardAttentionCard({
    items = [],
    className = '',
}) {
    const iconMap = {
        'alert-circle': AlertCircle,
        'file-text': FileText,
        'package': Package,
        'clock': Clock,
    };

    const hasAlerts = items && items.length > 0;

    return (
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between ${className}`}>
            {/* Header */}
            <div className={`px-5 py-4 border-b border-slate-100 flex items-center justify-between ${
                hasAlerts ? 'bg-amber-50/30' : 'bg-slate-50/50'
            }`}>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                        hasAlerts ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                    }`} />
                    <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">
                        {hasAlerts ? 'Perlu Perhatian' : 'Status Operasional'}
                    </h3>
                </div>
                {hasAlerts ? (
                    <Link
                        href="/admin/approvals"
                        className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
                    >
                        Lihat semua <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                ) : (
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Normal
                    </span>
                )}
            </div>

            {/* List: Alerts or Affirmative Health Audit */}
            <div className="divide-y divide-slate-100">
                {hasAlerts ? (
                    items.map((item) => {
                        const Icon = iconMap[item.icon] || AlertCircle;
                        return (
                            <Link
                                key={item.id}
                                href={item.href || '#'}
                                className="group p-3.5 px-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                            >
                                <div className="flex items-start gap-3 min-w-0 pr-3">
                                    <Icon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-hover:text-slate-600 transition-colors" strokeWidth={1.75} />
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-semibold text-slate-900 group-hover:text-primary transition-colors truncate">
                                            {item.title}
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-medium">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Status Urgency Dot Only */}
                                <div className="shrink-0 flex items-center self-center">
                                    <span className={`w-2 h-2 rounded-full ring-2 ${
                                        item.is_urgent 
                                            ? 'bg-rose-500 ring-rose-100' 
                                            : 'bg-amber-500 ring-amber-100'
                                    }`} />
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    /* 4-Pillar Affirmative Health Audit (Apple HIG & Mission Control Pattern) */
                    defaultHealthyPillars.map((pillar) => {
                        const Icon = iconMap[pillar.icon] || CheckCircle2;
                        return (
                            <Link
                                key={pillar.id}
                                href={pillar.href}
                                className="group p-3.5 px-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                            >
                                <div className="flex items-start gap-3 min-w-0 pr-3">
                                    <Icon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 group-hover:text-slate-600 transition-colors" strokeWidth={1.75} />
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-semibold text-slate-900 group-hover:text-primary transition-colors truncate">
                                            {pillar.title}
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-medium">
                                            {pillar.subtitle}
                                        </p>
                                    </div>
                                </div>

                                {/* Reassuring Emerald Health Dot */}
                                <div className="shrink-0 flex items-center self-center">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}

