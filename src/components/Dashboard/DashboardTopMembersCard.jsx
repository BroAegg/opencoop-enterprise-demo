import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import Avatar from '@/Components/UI/Avatar';

export default function DashboardTopMembersCard({
    top_members = [],
    className = '',
}) {
    return (
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col ${className}`}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
                    Anggota Kontributor Teratas
                </h3>
                <Link
                    href="/admin/members"
                    className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
                >
                    Kelola <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Member List */}
            <div className="divide-y divide-slate-100">
                {top_members && top_members.length > 0 ? (
                    top_members.map((member, idx) => {
                        const hasPoints = Number(member.points || 0) > 0;

                        return (
                            <div key={member.id || idx} className="p-3 px-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-3 min-w-0 pr-3">
                                    <Avatar
                                        name={member.name}
                                        photo={member.photo}
                                        size="sm"
                                        shape="rounded-full"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-semibold text-slate-900 leading-tight truncate">
                                            {member.name}
                                        </p>
                                        <p className="text-[10px] font-mono text-slate-400">
                                            {member.member_number}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    {hasPoints ? (
                                        <>
                                            <span className="text-[12px] font-bold font-mono text-slate-900 tabular-nums">
                                                {Number(member.points).toLocaleString('id-ID')}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium ml-1">
                                                poin
                                            </span>
                                        </>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide bg-primary/10 text-primary">
                                            Aktif
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-6 text-center text-slate-400 text-xs">
                        Belum ada data anggota kontributor.
                    </div>
                )}
            </div>
        </div>
    );
}
