import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * TactilePagination
 * Responsive, tactile pagination control for Industrial ERP Data Tables.
 */
export default function TactilePagination({ pagination }) {
    if (!pagination || pagination.total <= 0) return null;

    const from = Math.min((pagination.page - 1) * pagination.perPage + 1, pagination.total);
    const to = Math.min(pagination.page * pagination.perPage, pagination.total);
    const hasPageChange = typeof pagination.onPageChange === 'function';
    const hasPerPageChange = typeof pagination.onPerPageChange === 'function';

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-white border-t border-slate-200/70 select-none">
            <div className="text-[11px] sm:text-xs text-slate-500 font-medium text-center sm:text-left">
                Menampilkan <span className="font-bold text-slate-800">{from}</span> - <span className="font-bold text-slate-800">{to}</span> dari{' '}
                <span className="font-bold text-slate-900 font-mono">{pagination.total}</span> data
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
                {hasPerPageChange && (
                    <div className="flex items-center gap-1.5 mr-1 sm:mr-2">
                        <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Baris:</span>
                        <select
                            value={pagination.perPage}
                            onChange={(e) => pagination.onPerPageChange(Number(e.target.value))}
                            className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1F6376] shadow-2xs"
                        >
                            {[10, 25, 50, 100].map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        disabled={!hasPageChange || pagination.page <= 1}
                        onClick={() => hasPageChange && pagination.onPageChange(pagination.page - 1)}
                        className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs transition-all active:scale-95"
                        title="Halaman Sebelumnya"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#1F6376] text-white shadow-2xs">
                        {pagination.page}
                    </span>

                    <button
                        type="button"
                        disabled={!hasPageChange || (pagination.page * pagination.perPage >= pagination.total)}
                        onClick={() => hasPageChange && pagination.onPageChange(pagination.page + 1)}
                        className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs transition-all active:scale-95"
                        title="Halaman Selanjutnya"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

