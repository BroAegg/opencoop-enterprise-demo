import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    ShoppingBag, ArrowUpRight, ArrowDownLeft, Plus, RefreshCw,
    Activity, ChevronRight, FileText
} from 'lucide-react';

// Map action codes from ActivityLog to visual config (Naked Inline Glyphs)
const defaultIconStyle = 'text-slate-400';

const actionIconMap = {
    'rat_disburse': { icon: ArrowUpRight, color: defaultIconStyle },
    'rat_reverse': { icon: RefreshCw, color: 'text-amber-600' },
    'loan_approve': { icon: ArrowUpRight, color: defaultIconStyle },
    'loan_disburse': { icon: ArrowUpRight, color: defaultIconStyle },
    'loan_payment': { icon: ArrowDownLeft, color: defaultIconStyle },
    'simpanan_setor': { icon: Plus, color: defaultIconStyle },
    'simpanan_tarik': { icon: ArrowUpRight, color: defaultIconStyle },
    'pos_sale': { icon: ShoppingBag, color: defaultIconStyle },
    'expense_approve': { icon: FileText, color: defaultIconStyle },
};

function getIconConfig(action) {
    if (!action) return { icon: Activity, color: defaultIconStyle };
    const key = Object.keys(actionIconMap).find(k => action.includes(k));
    return actionIconMap[key] || { icon: Activity, color: defaultIconStyle };
}

function formatTime(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default function DashboardRecentActivityFeed({
    activities = [],
    className = '',
}) {
    return (
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col ${className}`}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
                    Aktivitas Terbaru
                </h3>
                <Link
                    href="/admin/retail/shifts"
                    className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
                >
                    Lihat semua <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Feed List */}
            <div className="divide-y divide-slate-100">
                {activities && activities.length > 0 ? (
                    activities.map((act) => {
                        const { icon: Icon, color } = getIconConfig(act.action);
                        return (
                            <div key={act.id} className="p-3 px-5 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${color}`} strokeWidth={1.75} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-semibold text-slate-900 leading-snug line-clamp-2">
                                        {act.description}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                        {act.user?.name || 'Sistem'} · {formatDate(act.created_at)} <span className="font-mono tabular-nums">{formatTime(act.created_at)}</span>
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">
                        <Activity className="w-6 h-6 mx-auto mb-2 opacity-40" />
                        Belum ada aktivitas tercatat.
                    </div>
                )}
            </div>
        </div>
    );
}
