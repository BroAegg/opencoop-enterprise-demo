import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Activity } from 'lucide-react';

export default function DashboardUnitActivityCard({
    activities = [],
    className = '',
}) {
    const formatRp = (num) => `Rp ${Math.round(Number(num || 0)).toLocaleString('id-ID')}`;

    return (
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between ${className}`}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
                    Aktivitas Hari Ini
                </h3>
                <Link
                    href="/admin/retail/shifts"
                    className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
                >
                    Lihat detail <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* List or Empty State */}
            {activities.length > 0 ? (
                <div className="divide-y divide-slate-100">
                    {activities.map((item, idx) => (
                        <div key={idx} className="p-3.5 px-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-bold text-slate-900">
                                        {item.unit}
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium">
                                    {item.action}
                                </span>
                            </div>

                            <div className="text-right">
                                <div className="text-[13px] font-bold font-mono text-slate-900 tabular-nums">
                                    {formatRp(item.amount)}
                                </div>
                                <div className="text-[10px] font-medium text-slate-400 font-mono tabular-nums">
                                    {item.count} transaksi
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-10 px-5 text-center">
                    <Activity className="w-8 h-8 text-slate-200 mb-3" strokeWidth={1.5} />
                    <p className="text-[12px] font-semibold text-slate-400">Belum ada aktivitas hari ini</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">Transaksi akan muncul secara otomatis</p>
                </div>
            )}
        </div>
    );
}

