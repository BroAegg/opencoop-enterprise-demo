import React from 'react';
import { Banknote, Scale, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function TransactionItem({ transaction: tx, isLast, compact = false, showStatus = true, showBalance = false }) {
    if (!tx) return null;

    return (
        <div className={`flex items-center justify-between hover:bg-slate-50 transition-colors relative group ${compact ? 'p-3.5 px-4' : 'p-4 sm:p-5'}`}>
            {!isLast && (
                <div className={`absolute bottom-0 right-0 h-px bg-slate-100 ${compact ? 'left-[72px]' : 'left-[76px]'}`}></div>
            )}
            
            <div className={`flex items-center min-w-0 flex-1 ${compact ? 'gap-4' : 'gap-3 sm:gap-4'}`}>
                <div className={`rounded-full flex items-center justify-center shrink-0 ${compact ? 'w-11 h-11' : 'w-10 h-10 sm:w-12 sm:h-12'} ${
                    tx.transaction_type === 'SETOR'
                        ? 'bg-emerald-50 text-emerald-600'
                        : tx.transaction_type === 'TARIK'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-slate-100 text-slate-500'
                }`}>
                    {tx.transaction_type === 'SETOR' ? (
                        <ArrowDownRight className={compact ? 'w-5 h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} strokeWidth={2.5} />
                    ) : tx.transaction_type === 'TARIK' ? (
                        <ArrowUpRight className={compact ? 'w-5 h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} strokeWidth={2.5} />
                    ) : (
                        <Scale className={compact ? 'w-5 h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} strokeWidth={2.5} />
                    )}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                    <span className={`${compact ? 'text-[15px]' : 'text-[15px] sm:text-[16px]'} font-semibold text-slate-900 leading-tight truncate tracking-tight`}>
                        {tx.transaction_type === 'KOREKSI' ? 'Penyesuaian Sistem' : (tx.description || tx.type || `${tx.transaction_type} Simpanan`)}
                    </span>
                    <span className={`${compact ? 'text-[13px]' : 'text-[12px] sm:text-[13px]'} text-slate-500 font-medium truncate`}>
                        {new Date(tx.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                    {tx.description && tx.transaction_type === 'KOREKSI' && (
                        <span className={`${compact ? 'text-[12px]' : 'text-[11px] sm:text-[12px]'} text-slate-400 truncate italic`}>
                            {tx.description}
                        </span>
                    )}
                </div>
            </div>
            
            <div className={`flex flex-col items-end gap-1 shrink-0 ${compact ? 'ml-2' : 'ml-2 sm:ml-4'}`}>
                <span className={`${compact ? 'text-[15px]' : 'text-[15px] sm:text-[17px]'} font-bold tracking-tight font-mono ${
                    tx.transaction_type === 'SETOR' ? 'text-emerald-600' : tx.transaction_type === 'TARIK' ? 'text-slate-900' : 'text-slate-500'
                }`}>
                    {tx.transaction_type === 'SETOR' ? '+' : (tx.transaction_type === 'TARIK' ? '-' : '')}Rp {Number(tx.amount).toLocaleString('id-ID')}
                </span>
                {showStatus && tx.status && tx.status !== 'COMPLETED' && (
                    <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        tx.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                        {tx.status}
                    </div>
                )}
                {showBalance && tx.balance_after !== undefined && tx.balance_after !== null && (
                    <span className={`${compact ? 'text-[11px]' : 'text-[11px] sm:text-[12px]'} text-slate-400 font-medium mt-0.5`}>
                        Saldo: Rp {Number(tx.balance_after).toLocaleString('id-ID')}
                    </span>
                )}
            </div>
        </div>
    );
}

