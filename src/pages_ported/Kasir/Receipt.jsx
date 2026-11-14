import React, { useEffect, useRef, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Printer, X } from 'lucide-react';

export default function Receipt({ transaction, logoBase64 }) {
    const { coop } = usePage().props;
    const [logoSrc, setLogoSrc] = useState(logoBase64 || coop?.logo || '/logo.png');
    const [logoError, setLogoError] = useState(false);
    const hasPrinted = useRef(false);

    const triggerPrint = () => {
        if (!hasPrinted.current) {
            hasPrinted.current = true;
            setTimeout(() => {
                window.print();
            }, 200);
        }
    };

    // Auto print when component mounts or once image is confirmed ready
    useEffect(() => {
        if (logoBase64) {
            triggerPrint();
            return;
        }

        const timer = setTimeout(() => {
            triggerPrint();
        }, 1200);

        return () => clearTimeout(timer);
    }, [logoBase64]);

    const handleLogoLoad = () => {
        triggerPrint();
    };

    const handleLogoError = () => {
        if (logoSrc !== '/logo.png') {
            setLogoSrc('/logo.png');
        } else {
            setLogoError(true);
            triggerPrint();
        }
    };

    const date = new Date(transaction.created_at).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <>
            <Head title={`Struk - ${transaction.invoice_number}`} />

            {/* Non-print controls (Hidden in print) */}
            <div className="print:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white p-3 sm:p-4 flex justify-between items-center z-50 shadow-md">
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-bold text-sm sm:text-base">Pratinjau Struk Kasir</span>
                    <span className="text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                        POS 58mm
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.close()}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                        title="Tutup Jendela"
                    >
                        <X className="w-3.5 h-3.5" /> Tutup
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                        <Printer className="w-4 h-4" /> Cetak Sekarang
                    </button>
                </div>
            </div>

            {/* Print Area - 58mm Thermal Printer Optimization */}
            <div className="pt-20 print:pt-0 pb-10 flex justify-center bg-gray-100 print:bg-white min-h-screen">

                <div className="bg-white p-4 shadow-lg print:shadow-none font-mono text-sm leading-tight text-black w-[300px] print:w-full print:max-w-full m-auto print:m-0 print:p-0 print-area">

                    {/* VOID Indicator Banner */}
                    {transaction.status === 'VOID' && (
                        <div className="border-2 border-black p-1 text-center font-black text-xs mb-2 tracking-widest uppercase">
                            *** BATAL / VOID ***
                        </div>
                    )}

                    {/* Header */}
                    <div className="text-center mb-3">
                        {!logoError && (
                            <img
                                src={logoSrc}
                                alt=""
                                onLoad={handleLogoLoad}
                                onError={handleLogoError}
                                className="w-12 h-12 object-contain mx-auto mb-1.5 filter grayscale contrast-150"
                            />
                        )}
                        <h1 className="font-bold text-sm sm:text-base uppercase tracking-wider mb-1 leading-tight">
                            {coop?.name ?? 'KOPERASI Manasuka'}
                        </h1>
                        {coop?.address && (
                            <p className="text-[10px] leading-tight text-gray-700 px-1">
                                {coop.address}
                            </p>
                        )}
                        {coop?.phone && (
                            <p className="text-[10px] leading-tight text-gray-700 mt-0.5">
                                Telp: {coop.phone}
                            </p>
                        )}
                    </div>

                    <div className="border-t border-dashed border-gray-400 my-2"></div>
                    
                    {/* Transaction Info */}
                    <div className="mb-2 text-xs">
                        <div className="flex justify-between">
                            <span>No: {transaction.invoice_number}</span>
                            <span>{date}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span>Kasir: {transaction.cashier?.name?.substring(0,10) || 'Kasir'}</span>
                        </div>
                        {transaction.member && (
                            <div className="flex justify-between mt-1">
                                <span>Member: {transaction.member.name?.substring(0,10)}</span>
                                <span>Poin: +{transaction.points_earned}</span>
                            </div>
                        )}
                        {transaction.status === 'VOID' && transaction.supervisor && (
                            <div className="flex justify-between mt-1 font-bold">
                                <span>Supervisor: {transaction.supervisor.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-dashed border-gray-400 my-2"></div>

                    {/* Items */}
                    <div className="mb-2">
                        {transaction.items.map((item, idx) => (
                            <div key={idx} className="mb-1.5 flex flex-col">
                                <span className="font-bold">{item.product_name}</span>
                                {item.selected_modifiers && Array.isArray(item.selected_modifiers) && item.selected_modifiers.length > 0 && (
                                    <div className="text-[11px] text-gray-700 italic pl-2">
                                        {item.selected_modifiers.map((m, mIdx) => (
                                            <div key={mIdx}>
                                                + {m.name} {Number(m.price) > 0 && `(+Rp ${Number(m.price).toLocaleString('id-ID')})`}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-between font-bold">
                                    <span>{item.qty} x {Number(item.unit_price).toLocaleString('id-ID')}</span>
                                    <span>{Number(item.subtotal).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-gray-400 my-2"></div>

                    {/* Totals */}
                    <div className="flex flex-col gap-1 text-sm font-bold">
                        {Number(transaction.points_discount_amount || 0) > 0 && (
                            <div className="flex justify-between text-xs font-normal">
                                <span>POTONGAN POIN ({transaction.points_redeemed || 0} pt)</span>
                                <span>-Rp {Number(transaction.points_discount_amount).toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>TOTAL</span>
                            <span>Rp {Number(transaction.total_amount).toLocaleString('id-ID')}</span>
                        </div>

                        {Number(transaction.rounding_amount || 0) !== 0 && (
                            <div className="flex justify-between text-xs">
                                <span>PEMBULATAN</span>
                                <span>Rp {Number(transaction.rounding_amount).toLocaleString('id-ID')}</span>
                            </div>
                        )}

                        {transaction.payments && transaction.payments.length > 0 ? (
                            transaction.payments.map((p, idx) => (
                                <div key={idx} className="flex justify-between text-xs">
                                    <span>{p.payment_method}</span>
                                    <span>Rp {Number(p.amount).toLocaleString('id-ID')}</span>
                                </div>
                            ))
                        ) : (
                            <div className="flex justify-between">
                                <span>{transaction.payment_method}</span>
                                <span>Rp {Number(transaction.cash_received || transaction.total_amount).toLocaleString('id-ID')}</span>
                            </div>
                        )}

                        {Number(transaction.change_amount || 0) > 0 && (
                            <div className="flex justify-between">
                                <span>KEMBALI</span>
                                <span>Rp {Number(transaction.change_amount).toLocaleString('id-ID')}</span>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-dashed border-gray-400 my-2"></div>

                    {/* Loyalty Rewards & Membership Struk Callout */}
                    {transaction.member ? (
                        <div className="border border-dashed border-gray-400 p-2 my-2 text-center rounded text-[11px] space-y-1">
                            <div className="font-bold tracking-wider text-xs">
                                ★ Manasuka REWARDS ★
                            </div>
                            <div className="flex justify-between font-mono">
                                <span>Poin Transaksi:</span>
                                <span className="font-bold">+{transaction.points_earned || 0} pt</span>
                            </div>
                            {Number(transaction.points_redeemed || 0) > 0 && (
                                <div className="flex justify-between font-mono">
                                    <span>Poin Ditukar:</span>
                                    <span className="font-bold">-{transaction.points_redeemed} pt</span>
                                </div>
                            )}
                            <div className="flex justify-between font-mono">
                                <span>Total Saldo Poin:</span>
                                <span className="font-bold">{transaction.member?.points || 0} pt</span>
                            </div>
                            <div className="border-t border-dashed border-gray-300 pt-1 mt-1 text-[10px] text-gray-700">
                                <div>Klaim & Kartu: <span className="font-bold">Manasuka.id/rewards</span></div>
                                <div className="font-mono">ID: {transaction.member?.phone || transaction.member?.nim || '-'}</div>
                                <div className="font-mono text-gray-500">PIN Awal: 6 digit terakhir No. HP</div>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-dashed border-gray-300 p-1.5 my-2 text-center text-[10px] text-gray-700 space-y-0.5">
                            <p className="font-bold">Mau Koin Belanja Tiap Transaksi?</p>
                            <p>Daftar kilat di kasir atau scan:</p>
                            <p className="font-bold font-mono">Manasuka.id/daftar-member</p>
                        </div>
                    )}

                    <div className="border-t border-dashed border-gray-400 my-2"></div>

                    {/* Footer */}
                    <div className="text-center text-xs space-y-0.5">
                        <p className="font-bold tracking-wider">{coop?.receipt_footer ?? 'TERIMA KASIH'}</p>
                        <p className="text-[10px] leading-tight text-gray-600 font-normal">
                            {coop?.receipt_policy ?? 'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.'}
                        </p>
                    </div>

                </div>
            </div>

            {/* Specific Print CSS to force thermal width and hide margins */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page {
                        margin: 0;
                        size: 58mm auto;
                    }
                    html, body {
                        margin: 0;
                        padding: 0;
                        width: 58mm;
                        background: #fff;
                        color: #000;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    /* Area cetak efektif printer 58mm biasanya 48mm */
                    .print-area {
                        width: 48mm !important;
                        margin: 0 auto !important;
                        padding-top: 2mm !important;
                        padding-bottom: 4mm !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}} />
        </>
    );
}

