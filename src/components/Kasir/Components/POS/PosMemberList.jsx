import React from 'react';
import { Sparkles, UserPlus } from 'lucide-react';
import Avatar from '@/Components/UI/Avatar';

export default function PosMemberList({
    memberResults = [],
    selectedIndex = 0,
    onSelectMember,
    memberQuery = '',
    isSearchingMember = false,
    onQuickRegisterClick,
}) {
    return (
        <div className="max-h-64 overflow-y-auto custom-scrollbar flex flex-col gap-2 pt-1">
            {memberResults.map((m, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                    <button 
                        key={m.id} 
                        type="button" 
                        onClick={() => onSelectMember(m)}
                        className={`flex items-center justify-between text-left p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer group ${
                            isSelected 
                                ? 'border-slate-900 bg-slate-900 text-white shadow-sm' 
                                : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/80'
                        }`}
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                            <Avatar 
                                name={m.name} 
                                photo={m.photo} 
                                size="md" 
                                shape="rounded-xl"
                                variant={isSelected ? 'dark' : 'light'}
                                className={isSelected ? 'border-white/20 text-white bg-white/10 ring-1 ring-white/20' : ''}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className={`font-semibold text-sm truncate ${
                                        isSelected ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        {m.name}
                                    </span>
                                    {m.is_employee && (
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {m.role || 'Staf'}
                                        </span>
                                    )}
                                </div>
                                <div className={`flex items-center gap-1.5 mt-0.5 text-[11px] font-mono font-tabular ${
                                    isSelected ? 'text-slate-300' : 'text-slate-500'
                                }`}>
                                    <span>ID: {m.id_number || m.member_number || m.phone || '-'}</span>
                                    {m.saldo_sukarela !== undefined && m.saldo_sukarela > 0 && (
                                        <>
                                            <span className={isSelected ? 'text-white/40' : 'text-slate-300'}>·</span>
                                            <span className={`font-semibold inline-flex items-center gap-1 ${
                                                isSelected ? 'text-emerald-300' : 'text-slate-800'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'} shrink-0`} />
                                                <span>Rp {Number(m.saldo_sukarela || 0).toLocaleString('id-ID')}</span>
                                            </span>
                                        </>
                                    )}
                                    {m.points > 0 && (
                                        <>
                                            <span className={isSelected ? 'text-white/40' : 'text-slate-300'}>·</span>
                                            <span className={isSelected ? 'text-slate-200' : 'text-slate-600'}>
                                                {m.points} pt
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
                            isSelected 
                                ? 'bg-white text-slate-900 border-white shadow-2xs' 
                                : 'bg-slate-50 text-slate-600 border-slate-200/80 group-hover:bg-slate-100 group-hover:text-slate-900'
                        }`}>
                            {isSelected ? 'Pilih ↵' : 'Pilih'}
                        </span>
                    </button>
                );
            })}

            {/* Tactile Empty State with 1-click Quick Register */}
            {memberQuery.length > 1 && memberResults.length === 0 && !isSearchingMember && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center gap-2 my-1">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-900">
                            Member Belum Terdaftar
                        </h4>
                        <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                            Cukup nama & WhatsApp dalam 5 detik agar pembeli langsung dapat koin belanja.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onQuickRegisterClick}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 mt-1"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Daftarkan Kilat "{memberQuery}" ↵</span>
                    </button>
                </div>
            )}
        </div>
    );
}
