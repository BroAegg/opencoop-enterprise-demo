import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * DataTable
 *
 * Apple HIG & Monochromatic Pro Standard.
 * - Crisp, clean border (border-slate-200/80) with soft shadow-xs.
 * - Refined table header with #F8FAFC background and precise 11px uppercase tracking.
 * - Compact row density (py-3 px-5, text-[13px]) for pro data workflows.
 */
export default function DataTable({ 
    columns, 
    data, 
    onRowClick, 
    emptyMessage = "Tidak ada data yang ditemukan",
    title,
    actions,
    expandableContent,
    className = '',
}) {
    const [expandedRows, setExpandedRows] = useState(new Set());
    const tableData = Array.isArray(data) ? data : (data?.data || []);

    const toggleRow = (e, rowId) => {
        e.stopPropagation(); // prevent triggering row click
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(rowId)) {
            newExpanded.delete(rowId);
        } else {
            newExpanded.add(rowId);
        }
        setExpandedRows(newExpanded);
    };

    return (
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col transition-all ${className}`}>
            
            {/* Table Header Section */}
            {(title || actions) && (
                <div className="px-5 py-3.5 border-b border-slate-200/70 flex justify-between items-center bg-white z-10 sticky top-0">
                    {title && <h3 className="text-[14px] font-semibold text-slate-900 tracking-tight">{title}</h3>}
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            )}
            
            {/* Table Content */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200/70 bg-[#F8FAFC]">
                            {expandableContent && <th className="w-10 px-4 py-2.5"></th>}
                            {columns.map((col, index) => (
                                <th 
                                    key={index}
                                    className={`text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-5 py-2.5 whitespace-nowrap ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {tableData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (expandableContent ? 1 : 0)} className="px-6 py-12 text-center text-slate-500 text-sm">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="w-8 h-8 text-slate-300 mb-2 stroke-[1.25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <span className="text-xs text-slate-400">{emptyMessage}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            tableData.map((row, rowIndex) => {
                                const rowKey = row.id || rowIndex;
                                const isExpanded = expandedRows.has(rowKey);
                                
                                return (
                                    <React.Fragment key={rowKey}>
                                        <tr 
                                            onClick={(e) => {
                                                if (expandableContent) toggleRow(e, rowKey);
                                                if (onRowClick) onRowClick(row);
                                            }}
                                            className={`transition-colors
                                                ${(onRowClick || expandableContent) ? 'cursor-pointer hover:bg-slate-50/70' : 'hover:bg-slate-50/40'}
                                                ${isExpanded ? 'bg-slate-50/40' : ''}`}
                                        >
                                            {expandableContent && (
                                                <td className="px-4 py-3 text-slate-400">
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => toggleRow(e, rowKey)} 
                                                        className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
                                                    >
                                                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                    </button>
                                                </td>
                                            )}
                                            {columns.map((col, colIndex) => (
                                                <td key={colIndex} className={`px-5 py-3 text-[13px] text-slate-700 whitespace-nowrap ${col.cellClassName || ''}`}>
                                                    {col.cell ? col.cell(row) : row[col.accessor]}
                                                </td>
                                            ))}
                                        </tr>
                                        {isExpanded && expandableContent && (
                                            <tr className="bg-[#F8FAFC]/60 border-t-0">
                                                <td colSpan={columns.length + 1} className="px-5 py-3.5">
                                                    {expandableContent(row)}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

