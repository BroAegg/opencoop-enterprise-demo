import React from 'react';
import { Building2, CreditCard, Info } from 'lucide-react';
import CopyButton from '@/Components/UI/CopyButton';

/**
 * PosVendorBankTransferCard
 * 
 * Apple HIG-compliant destination bank account card for consignment payouts.
 * Allows instant 1-click clipboard copy of account numbers, displays account holder,
 * provides optional transfer reference input, and reassures cashier about cash drawer safety.
 */
export default function PosVendorBankTransferCard({
    selectedVendor,
    bankReference = '',
    setBankReference,
}) {
    const hasBankDetails = Boolean(selectedVendor?.bank_name || selectedVendor?.bank_account_number);
    const bankName = selectedVendor?.bank_name || 'BANK';
    const accountNumber = selectedVendor?.bank_account_number || '';
    const accountHolder = selectedVendor?.bank_account_holder || selectedVendor?.name || '-';

    return (
        <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
            {/* Header: Bank and Destination Info */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 shrink-0">
                        <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-blue-600 text-white tracking-wider">
                                {bankName}
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate">
                                {accountHolder}
                            </span>
                        </div>
                        {hasBankDetails && accountNumber ? (
                            <span className="font-mono text-xs font-semibold text-slate-600 tracking-wide block mt-0.5">
                                {accountNumber}
                            </span>
                        ) : (
                            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                                Rekening belum diatur di data supplier
                            </span>
                        )}
                    </div>
                </div>

                {hasBankDetails && accountNumber && (
                    <CopyButton
                        text={accountNumber}
                        label="Salin No. Rek"
                        size="sm"
                        className="shrink-0"
                    />
                )}
            </div>

            {/* Input: Transfer Reference / Proof */}
            <div>
                <input
                    type="text"
                    value={bankReference}
                    onChange={(e) => setBankReference?.(e.target.value)}
                    placeholder="No. Ref / Bukti Transfer (opsional, cth: Ref m-BCA 4921)"
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                />
            </div>

            {/* Informative Safe-Guard Footnote */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                    Pembayaran transfer <strong>tidak memotong kas fisik laci</strong> kasir.
                </span>
            </div>
        </div>
    );
}
