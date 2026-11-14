import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Inbox, ArrowDownUp } from 'lucide-react';
import TactileMobileRowCard from './TactileMobileRowCard';
import TactilePagination from './TactilePagination';

/**
 * TactileDataTable
 * Modern Industrial ERP Data Table for Koperasi Manasuka.
 * Features:
 * - Dual Presentation: High-density Desktop Table + Apple Inset Mobile Cards
 * - Sorting indicator on column headers (Desktop) & Apple sort capsule (Mobile)
 * - Monospace right-alignment for financial numbers
 * - Tactile pagination controls with dark/solid active pills
 * - Zero AI pastel slop
 */
export default function TactileDataTable({
    columns = [],
    data = [],
    title = null,
    actions = null,
    topBanner = null,
    sortColumn = null,
    sortDirection = 'asc', // 'asc' | 'desc'
    onSort = null,
    pagination = null, // { page, perPage, total, onPageChange, onPerPageChange }
    onRowClick = null,
    renderMobileCard = null,
    emptyTitle = "Data Kosong",
    emptyMessage = "Belum ada catatan transaksi pada filter ini.",
    emptyIcon: EmptyIcon = Inbox,
    density = "normal", // 'compact' | 'normal'
    className = "",
    footer = null,
    mobileBreakpoint = "md", // 'sm' | 'md' | 'lg'
}) {
    const [mobileView, setMobileView] = React.useState('card');
    const tableData = Array.isArray(data) ? data : (data?.data || []);
    const isCompact = density === 'compact';
    const sortableCols = columns.filter(c => c.sortable);

    const mobileHiddenClass = mobileBreakpoint === 'lg'
        ? 'lg:hidden'
        : mobileBreakpoint === 'sm'
        ? 'sm:hidden'
        : 'md:hidden';

    const desktopVisibleClass = mobileBreakpoint === 'lg'
        ? 'hidden lg:block'
        : mobileBreakpoint === 'sm'
        ? 'hidden sm:block'
        : 'hidden md:block';

    const renderSortIcon = (col) => {
        if (!col.sortable) return null;
        if (sortColumn !== col.key) {
            return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />;
        }
        return sortDirection === 'asc' ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#1F6376] stroke-[2.5]" />
        ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#1F6376] stroke-[2.5]" />
        );
    };

    return (
        <div className={`bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col ${className}`}>
            {/* Top Banner (Optional context strip) */}
            {topBanner && (
                <div className="border-b border-slate-200/70">
                    {topBanner}
                </div>
            )}

            {/* Table Header Section */}
            {(title || actions) && (
                <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200/70 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white z-10">
                    {title && (typeof title === 'string' ? <h3 className="text-[14px] font-semibold text-slate-900 tracking-tight">{title}</h3> : title)}
                    {actions && <div className="flex items-center gap-2 w-full sm:w-auto">{actions}</div>}
                </div>
            )}

            {/* --- 1. MOBILE PHONE PRESENTATION : Apple Inset Card List & View Switcher --- */}
            <div className={`${mobileHiddenClass} flex flex-col`}>
                {/* Mobile View Switcher & Sort Toolbar */}
                <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-slate-200/90 shadow-2xs">
                        <button
                            type="button"
                            onClick={() => setMobileView('card')}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                                mobileView === 'card'
                                    ? 'bg-white text-slate-900 shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Kartu
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileView('table')}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                                mobileView === 'table'
                                    ? 'bg-white text-slate-900 shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Tabel
                        </button>
                    </div>

                    {sortableCols.length > 0 && onSort && (
                        <div className="flex items-center gap-1.5">
                            <select
                                value={sortColumn || ''}
                                onChange={(e) => onSort(e.target.value)}
                                className="text-xs font-semibold py-1 pl-2 pr-6 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1F6376] shadow-2xs"
                            >
                                <option value="" disabled>Urutkan</option>
                                {sortableCols.map(col => (
                                    <option key={col.key} value={col.key}>
                                        {col.sortLabel || (typeof col.label === 'string' ? col.label : col.key)}
                                    </option>
                                ))}
                            </select>

                            {sortColumn && (
                                <button
                                    type="button"
                                    onClick={() => onSort(sortColumn)}
                                    className="p-1 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs active:scale-95 transition-all"
                                    title={sortDirection === 'asc' ? 'Urutan: Naik' : 'Urutan: Turun'}
                                >
                                    {sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#1F6376]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#1F6376]" />}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Card Items (rendered only when mobileView is 'card') */}
                {mobileView === 'card' && (
                    <div className="p-3 space-y-2.5 bg-slate-50/50">
                        {tableData.length === 0 ? (
                            <div className="px-4 py-9 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-400 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                                    <EmptyIcon className="w-5 h-5 stroke-[1.5]" />
                                </div>
                                <h4 className="text-xs font-bold text-slate-700 mb-0.5">{emptyTitle}</h4>
                                <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">{emptyMessage}</p>
                            </div>
                        ) : (
                            tableData.map((row, rowIndex) => (
                                <TactileMobileRowCard
                                    key={row.id || rowIndex}
                                    columns={columns}
                                    row={row}
                                    rowIndex={rowIndex}
                                    onRowClick={onRowClick}
                                    renderMobileCard={renderMobileCard}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* --- 2. DESKTOP & TABLET PRESENTATION : Industrial ERP Multi-Column Table --- */}
            <div className={`${mobileView === 'table' ? 'block' : desktopVisibleClass} overflow-x-auto custom-scrollbar`}>
                <table className="w-full min-w-[720px] text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200/75 bg-slate-50/80">
                            {columns.map((col, index) => {
                                const isSortable = !!col.sortable;
                                const alignClass = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';

                                return (
                                    <th
                                        key={col.key || index}
                                        onClick={() => isSortable && onSort && onSort(col.key)}
                                        className={`px-4 sm:px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none ${alignClass} ${
                                            isSortable ? 'cursor-pointer hover:bg-slate-100/70 transition-colors group' : ''
                                        } ${col.headerClassName || ''}`}
                                    >
                                        <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                                            {col.headerRender ? col.headerRender(col) : <span>{col.label}</span>}
                                            {renderSortIcon(col)}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                        {tableData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-14 text-center">
                                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-400 flex items-center justify-center mb-3 shadow-2xs">
                                            <EmptyIcon className="w-6 h-6 stroke-[1.5]" />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700 mb-1">{emptyTitle}</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            tableData.map((row, rowIndex) => {
                                const rowKey = row.id || rowIndex;
                                return (
                                    <tr
                                        key={rowKey}
                                        onClick={() => onRowClick && onRowClick(row)}
                                        className={`transition-colors ${
                                            onRowClick ? 'cursor-pointer hover:bg-slate-50/90' : 'hover:bg-slate-50/50'
                                        }`}
                                    >
                                        {columns.map((col, colIndex) => {
                                            const alignClass = col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                                            const monoClass = col.mono ? 'font-mono' : '';
                                            const cellPadding = isCompact ? 'py-2.5 px-4 sm:px-5' : 'py-3.5 px-4 sm:px-5';

                                            return (
                                                <td
                                                    key={col.key || colIndex}
                                                    className={`${cellPadding} ${alignClass} ${monoClass} ${col.cellClassName || 'text-slate-700'}`}
                                                >
                                                    {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    {footer && (
                        <tfoot className="border-t border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 text-xs">
                            {footer}
                        </tfoot>
                    )}
                </table>
            </div>

            {/* --- 3. TACTILE PAGINATION BAR (Responsive on all viewports) --- */}
            <TactilePagination pagination={pagination} />
        </div>
    );
}

