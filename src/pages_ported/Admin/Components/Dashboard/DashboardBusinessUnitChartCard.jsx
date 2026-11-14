import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import ChartTooltip from '@/Components/UI/ChartTooltip';

export default function DashboardBusinessUnitChartCard({
    className = '',
}) {
    // 30-day trend data for the 3 main cooperative units
    const unitTrendData = [
        { date: '21 Agu', minimarket: 8200000, simpanPinjam: 15400000, keuangan: 5200000 },
        { date: '28 Agu', minimarket: 9400000, simpanPinjam: 16800000, keuangan: 6100000 },
        { date: '04 Sep', minimarket: 10800000, simpanPinjam: 18200000, keuangan: 6800000 },
        { date: '11 Sep', minimarket: 11900000, simpanPinjam: 21500000, keuangan: 7400000 },
        { date: '18 Sep', minimarket: 12840500, simpanPinjam: 23100000, keuangan: 8200000 },
    ];

    const formatYAxis = (val) => {
        if (!val || val === 0) return '0';
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)} jt`;
        if (val >= 1_000) return `${(val / 1_000).toFixed(0)} rb`;
        return String(val);
    };

    return (
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
                    Kinerja Unit Usaha <span className="text-[11px] font-normal text-slate-400">(30 Hari)</span>
                </h3>
                <Link
                    href="/admin/laporan"
                    className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
                >
                    Lihat detail <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px] font-medium text-slate-600 mt-3 mb-1">
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Minimarket
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    Simpan Pinjam
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Keuangan &amp; Kas
                </span>
            </div>

            {/* Chart */}
            <div className="w-full h-[155px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={unitTrendData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="unitMini" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.08} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="unitSP" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.08} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="unitKeu" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }} 
                            dy={6} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'SF Mono, JetBrains Mono, monospace' }}
                            tickFormatter={formatYAxis}
                            width={54}
                        />
                        <Tooltip 
                            content={
                                <ChartTooltip 
                                    subLabel="Omzet / Hasil" 
                                />
                            } 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="simpanPinjam" 
                            name="Simpan Pinjam"
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#unitSP)" 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="minimarket" 
                            name="Minimarket"
                            stroke="#f59e0b" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#unitMini)" 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="keuangan" 
                            name="Keuangan"
                            stroke="#10b981" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#unitKeu)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

