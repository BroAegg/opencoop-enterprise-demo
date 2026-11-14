import React, { useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { 
    Bell, 
    Users, 
    HandCoins, 
    Truck, 
    Receipt, 
    PackageCheck, 
    FileText,
    ChevronRight
} from 'lucide-react';

export default function AdminNotificationPopover({
    isOpen,
    setIsOpen,
    pendingBadges = {},
    placement = 'bottom-right',
    variant = 'toolbar',
    isPengurus = false,
}) {
    const notifRef = useRef(null);
    const totalPending = pendingBadges.total || 0;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, setIsOpen]);

    const actionItems = [
        {
            key: 'members',
            count: pendingBadges.members,
            href: '/admin/members',
            label: 'Antrean Anggota',
            description: 'Pengembalian hak & pendaftar',
            icon: Users,
        },
        {
            key: 'loans',
            count: pendingBadges.loans,
            href: isPengurus ? '/pengurus/approvals' : '/admin/pembiayaan',
            label: 'Pengajuan Pembiayaan',
            description: 'Menunggu persetujuan',
            icon: HandCoins,
        },
        {
            key: 'suppliers',
            count: pendingBadges.suppliers,
            href: '/admin/suppliers?tab=pendaftaran',
            label: 'Pendaftaran Supplier',
            description: 'Kurasi berkas & uji sampel',
            icon: Truck,
        },
        {
            key: 'expenses',
            count: pendingBadges.expenses,
            href: '/admin/expenses',
            label: 'Pengeluaran Kas',
            description: 'Beban butuh otorisasi',
            icon: Receipt,
        },
        {
            key: 'receiving',
            count: pendingBadges.receiving,
            href: '/admin/inventory/receiving',
            label: 'Barang Masuk (Receiving)',
            description: 'PO Shipped butuh cek fisik',
            icon: PackageCheck,
        },
        {
            key: 'payroll',
            count: pendingBadges.payroll,
            href: isPengurus ? '/pengurus/approvals' : '/admin/payroll',
            label: 'Payroll Batch',
            description: 'Draft penggajian bulanan',
            icon: FileText,
        },
    ].filter((item) => Boolean(item.count && item.count > 0));

    const triggerClasses = variant === 'rail'
        ? `w-9 h-9 rounded-xl transition-all flex items-center justify-center relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6376]/40 ${
            isOpen
                ? 'bg-[#1F6376]/10 text-[#1F6376]'
                : 'text-slate-400 hover:text-[#1F6376] hover:bg-slate-100/80'
        }`
        : `w-8 h-8 rounded-lg bg-white border transition-colors flex items-center justify-center relative shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 ${
            isOpen ? 'border-primary text-primary bg-primary/5' : 'border-slate-200/80 text-slate-500 hover:bg-slate-50'
        }`;

    const popoverPositionClasses = placement === 'right-end'
        ? 'left-full bottom-0 ml-3 w-72 sm:w-80'
        : 'right-0 top-full mt-2 w-72 sm:w-80';

    return (
        <div className="relative" ref={notifRef}>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={triggerClasses}
                title={totalPending > 0 ? `${totalPending} tindakan tertunda` : "Pusat Tindakan"}
                aria-label="Pusat Tindakan"
                aria-expanded={isOpen}
            >
                <Bell className="w-4 h-4" strokeWidth={1.75} />
                {totalPending > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full text-[8.5px] font-mono font-bold leading-none bg-amber-500 text-white flex items-center justify-center ring-[1.5px] ring-white shadow-2xs tabular-nums pointer-events-none">
                        {totalPending > 99 ? '99+' : totalPending}
                    </span>
                )}
            </button>

            {/* Apple HIG Action Center Popover */}
            {isOpen && (
                <div className={`absolute ${popoverPositionClasses} bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-lg p-2 z-50 divide-y divide-slate-100`}>
                    {/* Header: Clean Typography & Secondary Monospace Counter (No Pastel Badge) */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 pb-2">
                        <span className="text-[12.5px] font-semibold text-slate-900 tracking-tight">
                            Pusat Tindakan
                        </span>
                        {totalPending > 0 ? (
                            <span className="text-[11px] text-slate-400 font-medium">
                                <span className="font-mono tabular-nums font-semibold text-slate-600">{totalPending}</span> antrean
                            </span>
                        ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                                Semua selesai
                            </span>
                        )}
                    </div>

                    {/* Action Items List */}
                    <div className="py-1 space-y-0.5 max-h-72 overflow-y-auto custom-scrollbar">
                        {actionItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-100/70 active:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors group"
                                >
                                    <div className="w-6 h-6 rounded-md text-slate-400 group-hover:text-slate-800 flex items-center justify-center shrink-0 transition-colors">
                                        <Icon className="w-4 h-4" strokeWidth={1.75} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-[12px] font-medium text-slate-800 truncate group-hover:text-slate-950">
                                            {item.label}
                                        </div>
                                        <div className="text-[10px] text-slate-400 truncate">
                                            {item.description}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 ml-auto shrink-0 pl-2">
                                        <span className="text-[11.5px] font-mono font-semibold text-slate-400 group-hover:text-slate-700 tabular-nums">
                                            {item.count}
                                        </span>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                    </div>
                                </Link>
                            );
                        })}

                        {actionItems.length === 0 && (
                            <div className="py-6 text-center text-xs text-slate-400 font-medium">
                                Semua antrean bersih &bull; Tidak ada tindakan tertunda.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
