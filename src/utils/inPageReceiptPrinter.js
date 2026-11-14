/**
 * Silent In-Page Thermal Receipt Printer
 * 
 * Prints receipts directly via an invisible iframe without navigating away
 * or opening new browser tabs (solving the tablet popup -> new tab issue).
 */

export function printReceiptInPage(transaction, coop = null) {
    if (!transaction) return;

    let iframe = document.getElementById('pos-silent-receipt-frame');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'pos-silent-receipt-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '100%';
        iframe.style.bottom = '100%';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);
    }

    const items = transaction.items || [];
    const itemsHtml = items.map((item) => {
        const name = item.product_name || item.name || 'Produk';
        const qty = item.qty || 1;
        const price = Number(item.unit_price || item.price || 0);
        const subtotal = Number(item.subtotal || (qty * price));

        let modifierHtml = '';
        if (item.selected_modifier) {
            modifierHtml = `<div style="font-size: 10px; color: #444; padding-left: 6px;">+ ${item.selected_modifier.name || ''}</div>`;
        } else if (item.selected_modifiers && Array.isArray(item.selected_modifiers)) {
            modifierHtml = item.selected_modifiers.map((m) => 
                `<div style="font-size: 10px; color: #444; padding-left: 6px;">+ ${m.name || ''}</div>`
            ).join('');
        }

        return `
            <tr>
                <td colspan="3" style="padding-top: 5px; font-weight: bold; word-break: break-word;">${name}</td>
            </tr>
            <tr>
                <td style="padding-left: 6px; font-size: 11px; white-space: nowrap;">${qty} × ${price.toLocaleString('id-ID')}</td>
                <td></td>
                <td style="text-align: right; font-size: 11px; white-space: nowrap;">${subtotal.toLocaleString('id-ID')}</td>
            </tr>
            ${modifierHtml ? `<tr><td colspan="3">${modifierHtml}</td></tr>` : ''}
        `;
    }).join('');

    const coopName = coop?.name || 'KOPERASI Manasuka';
    const coopAddress = coop?.address || 'Jl. Raya Panguragan Kulon No. 45';
    const coopPhone = coop?.phone || '';
    const dateFormatted = transaction.created_at ? new Date(transaction.created_at).toLocaleString('id-ID') : new Date().toLocaleString('id-ID');
    const totalAmount = Number(transaction.total_amount || 0);
    const rounding = Number(transaction.rounding_amount || 0);
    const cashReceived = transaction.cash_received ? Number(transaction.cash_received) : null;
    const changeAmount = Number(transaction.change_amount || (cashReceived ? Math.max(0, cashReceived - totalAmount) : 0));
    const cashierName = transaction.cashier?.name || transaction.cashier_name || 'Kasir';
    const memberName = transaction.member?.name || (transaction.member_id ? `Member #${transaction.member_id}` : null);

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Struk - ${transaction.invoice_number}</title>
            <style>
                @page {
                    size: 58mm auto;
                    margin: 0;
                }
                * {
                    box-sizing: border-box;
                }
                body {
                    width: 58mm;
                    margin: 0 auto;
                    padding: 6px 10px 14px 10px;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 11px;
                    color: #000;
                    line-height: 1.25;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .divider { border-top: 1px dashed #000; margin: 6px 0; }
                table { width: 100%; border-collapse: collapse; }
                td { vertical-align: top; }
            </style>
        </head>
        <body>
            <div class="text-center">
                <div class="bold" style="font-size: 13px; text-transform: uppercase;">${coopName}</div>
                <div style="font-size: 10px; margin-top: 2px;">${coopAddress}</div>
                ${coopPhone ? `<div style="font-size: 10px;">Telp: ${coopPhone}</div>` : ''}
            </div>

            <div class="divider"></div>

            <table style="font-size: 10px;">
                <tr><td style="width: 45px;">No</td><td>: ${transaction.invoice_number}</td></tr>
                <tr><td>Tgl</td><td>: ${dateFormatted}</td></tr>
                <tr><td>Kasir</td><td>: ${cashierName}</td></tr>
                ${memberName ? `<tr><td>Member</td><td>: ${memberName}</td></tr>` : ''}
            </table>

            <div class="divider"></div>

            <table>
                ${itemsHtml}
            </table>

            <div class="divider"></div>

            <table>
                ${Number(transaction.points_discount_amount || 0) > 0 ? `<tr><td>Potongan Poin (${transaction.points_redeemed || 0} pt)</td><td class="text-right">-Rp ${Number(transaction.points_discount_amount).toLocaleString('id-ID')}</td></tr>` : ''}
                ${rounding !== 0 ? `<tr><td>Pembulatan</td><td class="text-right">${rounding > 0 ? '+' : ''}${rounding.toLocaleString('id-ID')}</td></tr>` : ''}
                <tr class="bold" style="font-size: 12px;">
                    <td style="padding-top: 2px;">TOTAL</td>
                    <td class="text-right" style="padding-top: 2px;">Rp ${totalAmount.toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                    <td style="font-size: 10px;">Bayar (${transaction.payment_method || 'CASH'})</td>
                    <td class="text-right" style="font-size: 10px;">${cashReceived ? 'Rp ' + cashReceived.toLocaleString('id-ID') : 'Rp ' + totalAmount.toLocaleString('id-ID')}</td>
                </tr>
                ${changeAmount > 0 ? `
                <tr class="bold" style="font-size: 12px;">
                    <td>KEMBALIAN</td>
                    <td class="text-right">Rp ${changeAmount.toLocaleString('id-ID')}</td>
                </tr>
                ` : ''}
            </table>

            ${transaction.member ? `
            <div class="divider"></div>
            <div style="border: 1px dashed #000; padding: 4px; text-align: center; font-size: 10px; margin: 4px 0;">
                <div class="bold">★ Manasuka Rewards ★</div>
                <table style="font-size: 10px; margin-top: 2px;">
                    <tr><td>Poin Didapat</td><td class="text-right bold">+${transaction.points_earned || 0} pt</td></tr>
                    ${Number(transaction.points_redeemed || 0) > 0 ? `<tr><td>Poin Ditukar</td><td class="text-right bold">-${transaction.points_redeemed} pt</td></tr>` : ''}
                    <tr><td>Total Saldo Poin</td><td class="text-right bold">${transaction.member?.points || 0} pt</td></tr>
                </table>
                <div style="border-top: 1px dashed #666; margin-top: 3px; padding-top: 2px; font-size: 9px; color: #333;">
                    <div>Klaim & Cek Kartu: <b>Manasuka.id/rewards</b></div>
                    <div>ID: ${transaction.member?.phone || transaction.member?.nim || '-'}</div>
                    <div>PIN Awal: 6 digit terakhir No. HP</div>
                </div>
            </div>
            ` : `
            <div class="divider"></div>
            <div style="border: 1px dashed #888; padding: 4px; text-align: center; font-size: 9px; margin: 4px 0;">
                <div class="bold">Mau Koin Belanja Tiap Transaksi?</div>
                <div>Daftar kilat di kasir atau kunjungi:</div>
                <div class="bold">Manasuka.id/daftar-member</div>
            </div>
            `}

            <div class="divider"></div>

            <div class="text-center" style="font-size: 10px; margin-top: 6px;">
                <div>Terima Kasih Atas Kunjungan Anda</div>
                <div style="font-size: 9px; margin-top: 2px;">Barang yang dibeli tidak dapat ditukar</div>
            </div>
        </body>
        </html>
    `;

    try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            } catch (err) {
                console.warn('In-page print execution error:', err);
            }
        }, 150);
    } catch (e) {
        console.error('Failed to write receipt to invisible iframe:', e);
    }
}

export function printSupplierPayoutReceiptInPage(payoutData, coop = null, cashierName = 'Kasir') {
    if (!payoutData) return;

    let iframe = document.getElementById('pos-silent-receipt-frame');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'pos-silent-receipt-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '100%';
        iframe.style.bottom = '100%';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);
    }

    const settlement = payoutData.settlement || {};
    const supplier = payoutData.supplier || settlement.supplier || {};
    const amount = Number(payoutData.amount || settlement.total_amount || 0);
    const soldItems = payoutData.sold_items || [];
    const returnedItems = payoutData.returned_items || [];
    const coopName = coop?.name || 'KOPERASI Manasuka';
    const coopAddress = coop?.address || 'Jl. Raya Panguragan Kulon No. 45';
    const coopPhone = coop?.phone || '';
    const dateFormatted = settlement.created_at ? new Date(settlement.created_at).toLocaleString('id-ID') : new Date().toLocaleString('id-ID');

    const soldItemsHtml = soldItems.map((item) => {
        const name = item.product_name || item.name || 'Produk';
        const qty = item.qty_sold || item.qty || 0;
        const price = Number(item.cost_price || item.unit_price || 0);
        const subtotal = Number(item.subtotal_earned || (qty * price));
        return `
            <tr>
                <td colspan="3" style="padding-top: 4px; font-weight: bold; word-break: break-word;">${name}</td>
            </tr>
            <tr>
                <td style="padding-left: 6px; font-size: 11px; white-space: nowrap;">${qty} × Rp ${price.toLocaleString('id-ID')}</td>
                <td></td>
                <td style="text-align: right; font-size: 11px; white-space: nowrap;">Rp ${subtotal.toLocaleString('id-ID')}</td>
            </tr>
        `;
    }).join('');

    const returnedItemsHtml = returnedItems.length > 0 ? `
        <div class="divider"></div>
        <div class="bold" style="font-size: 10px; margin-bottom: 3px;">RETUR FISIK SISA RAK:</div>
        <table style="font-size: 10px;">
            ${returnedItems.map(ret => `
                <tr>
                    <td>- ${ret.name}</td>
                    <td style="text-align: right;">${ret.qty_returned} pcs</td>
                </tr>
            `).join('')}
        </table>
    ` : '';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Bukti Payout - ${settlement.settlement_number || 'Settlement'}</title>
            <style>
                @page { size: 58mm auto; margin: 0; }
                * { box-sizing: border-box; }
                body {
                    width: 58mm;
                    margin: 0 auto;
                    padding: 6px 10px 14px 10px;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 11px;
                    color: #000;
                    line-height: 1.25;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .divider { border-top: 1px dashed #000; margin: 6px 0; }
                table { width: 100%; border-collapse: collapse; }
                td { vertical-align: top; }
            </style>
        </head>
        <body>
            <div class="text-center">
                <div class="bold" style="font-size: 13px; text-transform: uppercase;">${coopName}</div>
                <div style="font-size: 10px; margin-top: 2px;">${coopAddress}</div>
                ${coopPhone ? `<div style="font-size: 10px;">Telp: ${coopPhone}</div>` : ''}
            </div>

            <div class="divider"></div>

            <div class="text-center bold" style="font-size: 11px;">
                BUKTI PENGELUARAN KAS LACI<br>
                <span style="font-size: 10px; font-weight: normal;">(Settlement Bagi Hasil Konsinyasi)</span>
            </div>

            <div class="divider"></div>

            <table style="font-size: 10px;">
                <tr><td style="width: 50px;">No. Bukti</td><td>: ${settlement.settlement_number || '-'}</td></tr>
                <tr><td>Tgl</td><td>: ${dateFormatted}</td></tr>
                <tr><td>Kasir</td><td>: ${cashierName}</td></tr>
                <tr><td>Supplier</td><td>: ${supplier.name || '-'}</td></tr>
                ${supplier.phone ? `<tr><td>No. HP</td><td>: ${supplier.phone}</td></tr>` : ''}
            </table>

            ${soldItems.length > 0 ? `
                <div class="divider"></div>
                <div class="bold" style="font-size: 10px; margin-bottom: 3px;">RINCIAN PENJUALAN HARI INI:</div>
                <table>${soldItemsHtml}</table>
            ` : ''}

            <div class="divider"></div>

            <table>
                <tr class="bold" style="font-size: 12px;">
                    <td style="padding-top: 2px;">TOTAL DIBAYAR</td>
                    <td class="text-right" style="padding-top: 2px;">Rp ${amount.toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                    <td style="font-size: 10px;">Metode Bayar</td>
                    <td class="text-right" style="font-size: 10px;">TUNAI KAS LACI</td>
                </tr>
            </table>

            ${returnedItemsHtml}

            <div class="divider"></div>

            <table style="font-size: 10px; margin-top: 10px; text-align: center;">
                <tr>
                    <td style="width: 50%;">Penerima,</td>
                    <td style="width: 50%;">Kasir,</td>
                </tr>
                <tr>
                    <td style="height: 40px;"></td>
                    <td style="height: 40px;"></td>
                </tr>
                <tr>
                    <td class="bold">(${supplier.name ? supplier.name.substring(0, 14) : 'Supplier'})</td>
                    <td class="bold">(${cashierName ? cashierName.substring(0, 14) : 'Kasir'})</td>
                </tr>
            </table>

            <div class="text-center" style="font-size: 9px; margin-top: 10px; color: #555;">
                Simpan bukti pembayaran ini sebagai arsip pencairan kas.
            </div>
        </body>
        </html>
    `;

    try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            } catch (err) {
                console.warn('In-page print execution error:', err);
            }
        }, 150);
    } catch (e) {
        console.error('Failed to write payout receipt to invisible iframe:', e);
    }
}

/**
 * Print 2-Ply Thermal Voucher Slip for Direct Store Delivery (COD / Beli Putus) Payout.
 */
export function printSupplierCodReceiptInPage(codData, coop = null, cashierName = 'Kasir') {
    if (!codData) return;

    let iframe = document.getElementById('pos-silent-receipt-frame');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'pos-silent-receipt-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '100%';
        iframe.style.bottom = '100%';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);
    }

    const movement = codData.movement || codData;
    const amount = Number(movement.amount || codData.amount || 0);
    const supplierName = codData.supplier_name || movement.metadata?.supplier_name || movement.supplier?.name || codData.supplier?.name || 'Supplier / Sales';
    const invoiceNumber = movement.invoice_number || movement.metadata?.invoice_number || codData.invoice_number || '-';
    const authorizedByName = movement.authorized_by_name || movement.metadata?.authorized_by_name || movement.authorized_by?.name || codData.supervisor?.name || '-';
    const description = movement.description || codData.description || 'Pembayaran COD Beli Putus';
    const coopName = coop?.name || 'KOPERASI Manasuka';
    const coopAddress = coop?.address || 'Jl. Raya Panguragan Kulon No. 45';
    const coopPhone = coop?.phone || '';
    const dateFormatted = movement.created_at ? new Date(movement.created_at).toLocaleString('id-ID') : new Date().toLocaleString('id-ID');
    const voucherRef = movement.id ? `COD-#${movement.id}` : `COD-${Date.now().toString().slice(-6)}`;
    const effectiveCashier = codData.cashier_name || cashierName;
    const paymentMethod = codData.payment_method || movement.metadata?.payment_method || (movement.type === 'CASH_OUT' ? 'CASH' : 'BANK_TRANSFER');
    const isBank = paymentMethod === 'BANK_TRANSFER';
    const paymentMethodLabel = isBank ? 'TRANSFER BANK' : 'TUNAI KAS LACI';
    const bankRef = movement.metadata?.bank_reference || codData.bank_reference;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Bukti COD - ${voucherRef}</title>
            <style>
                @page { size: 58mm auto; margin: 0; }
                * { box-sizing: border-box; }
                body {
                    width: 58mm;
                    margin: 0 auto;
                    padding: 6px 10px 14px 10px;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 11px;
                    color: #000;
                    line-height: 1.25;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .divider { border-top: 1px dashed #000; margin: 6px 0; }
                table { width: 100%; border-collapse: collapse; }
                td { vertical-align: top; }
            </style>
        </head>
        <body>
            <div class="text-center">
                <div class="bold" style="font-size: 13px; text-transform: uppercase;">${coopName}</div>
                <div style="font-size: 10px; margin-top: 2px;">${coopAddress}</div>
                ${coopPhone ? `<div style="font-size: 10px;">Telp: ${coopPhone}</div>` : ''}
            </div>

            <div class="divider"></div>

            <div class="text-center bold" style="font-size: 11px;">
                ${isBank ? 'BUKTI PEMBAYARAN BANK' : 'BUKTI PENGELUARAN KAS LACI'}<br>
                <span style="font-size: 10px; font-weight: normal;">(BAYAR SUPPLIER / COD BELI PUTUS)</span>
            </div>

            <div class="divider"></div>

            <table style="font-size: 10px;">
                <tr><td style="width: 55px;">No. Bukti</td><td>: ${voucherRef}</td></tr>
                <tr><td>Tgl</td><td>: ${dateFormatted}</td></tr>
                <tr><td>Kasir</td><td>: ${effectiveCashier}</td></tr>
                <tr><td>Otorisator</td><td>: ${authorizedByName}</td></tr>
            </table>

            <div class="divider"></div>

            <table style="font-size: 10px;">
                <tr><td style="width: 55px;">Supplier</td><td class="bold">: ${supplierName}</td></tr>
                <tr><td>No. Faktur</td><td>: ${invoiceNumber}</td></tr>
                ${bankRef ? `<tr><td>Ref Bank</td><td>: ${bankRef}</td></tr>` : ''}
                <tr><td>Rincian</td><td>: ${description}</td></tr>
            </table>

            ${((codData.items || movement.metadata?.items || []).length > 0) ? `
            <div class="divider"></div>
            <table style="font-size: 9px; margin-bottom: 2px;">
                <tr class="bold" style="border-bottom: 1px dashed #000;">
                    <td style="padding-bottom: 2px;">Barang Diterima</td>
                    <td class="text-right" style="padding-bottom: 2px; width: 35px;">Qty</td>
                    <td class="text-right" style="padding-bottom: 2px; width: 60px;">Total</td>
                </tr>
                ${(codData.items || movement.metadata?.items || []).map(it => `
                    <tr>
                        <td style="padding: 1px 0;">${it.name || 'Barang'}</td>
                        <td class="text-right" style="padding: 1px 0;">${it.qty}</td>
                        <td class="text-right" style="padding: 1px 0;">${it.subtotal ? 'Rp ' + Number(it.subtotal).toLocaleString('id-ID') : '-'}</td>
                    </tr>
                `).join('')}
            </table>
            ` : ''}

            <div class="divider"></div>

            <table>
                <tr class="bold" style="font-size: 12px;">
                    <td style="padding-top: 2px;">TOTAL BAYAR</td>
                    <td class="text-right" style="padding-top: 2px;">Rp ${amount.toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                    <td style="font-size: 10px;">Metode Bayar</td>
                    <td class="text-right" style="font-size: 10px;">${paymentMethodLabel}</td>
                </tr>
            </table>

            <div class="divider"></div>

            <table style="font-size: 10px; margin-top: 8px; text-align: center;">
                <tr>
                    <td style="width: 50%;">Penerima (Sales),</td>
                    <td style="width: 50%;">Kasir Toko,</td>
                </tr>
                <tr>
                    <td style="height: 38px;"></td>
                    <td style="height: 38px;"></td>
                </tr>
                <tr>
                    <td class="bold">(${supplierName.length > 14 ? supplierName.substring(0, 14) + '..' : supplierName})</td>
                    <td class="bold">(${effectiveCashier.length > 14 ? effectiveCashier.substring(0, 14) + '..' : effectiveCashier})</td>
                </tr>
            </table>

            <div class="text-center" style="font-size: 9px; margin-top: 10px; color: #333; line-height: 1.3;">
                * Lembar 1: Laci kasir (distaples ke faktur asli)<br>
                * Lembar 2: Arsip sales driver (jika perlu)
            </div>
        </body>
        </html>
    `;

    try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            } catch (err) {
                console.warn('In-page print execution error:', err);
            }
        }, 150);
    } catch (e) {
        console.error('Failed to write COD receipt to invisible iframe:', e);
    }
}


