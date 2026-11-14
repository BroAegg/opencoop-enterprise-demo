/**
 * offlineReceiptPrinter.js: Client-side Receipt HTML Generator & Browser Print for Offline Mode
 */

export function printOfflineReceipt(transaction, coop = {}) {
    if (!transaction) return;

    const coopName = coop?.name || 'KOPERASI Manasuka';
    const coopAddress = coop?.address || 'Jl. Soekarno-Hatta No.752, Bandung';
    const coopPhone = coop?.phone || '+62 877 6595 2600';
    const footerText = coop?.receipt_footer || 'TERIMA KASIH';
    const policyText = coop?.receipt_policy || 'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.';

    const dateFormatted = new Date(transaction.created_at || new Date()).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    const itemsHtml = (transaction.items || []).map((item) => {
        const itemTotal = (Number(item.unit_price) || 0) * (Number(item.qty) || 1);
        let modifierName = '';
        if (item.selected_modifier?.name) {
            modifierName = `<div style="font-size: 10px; color: #555; padding-left: 8px;">+ ${item.selected_modifier.name}</div>`;
        }

        return `
            <div style="margin-bottom: 6px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="font-weight: bold; max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${item.product_name || 'Item'}
                    </span>
                    <span>Rp ${itemTotal.toLocaleString('id-ID')}</span>
                </div>
                <div style="font-size: 11px; color: #555;">
                    ${item.qty} x Rp ${(Number(item.unit_price) || 0).toLocaleString('id-ID')}
                </div>
                ${modifierName}
            </div>
        `;
    }).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Struk - ${transaction.invoice_number}</title>
            <style>
                @page { margin: 0; size: 58mm auto; }
                body {
                    margin: 0;
                    padding: 8px 4px;
                    font-family: 'Courier New', Courier, monospace, monospace;
                    font-size: 12px;
                    line-height: 1.25;
                    color: #000;
                    background: #fff;
                    width: 58mm;
                    max-width: 58mm;
                    box-sizing: border-box;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .divider { border-top: 1px dashed #000; margin: 6px 0; }
                .flex-between { display: flex; justify-content: space-between; }
                .offline-badge {
                    border: 1px dashed #000;
                    padding: 3px;
                    text-align: center;
                    font-size: 10px;
                    font-weight: bold;
                    margin-bottom: 6px;
                }
                @media print {
                    body { width: 48mm; margin: 0 auto; }
                }
            </style>
        </head>
        <body>
            <div class="offline-badge">STRUK TERSIMPAN LOKAL</div>
            <div class="text-center">
                <div class="bold" style="font-size: 14px; text-transform: uppercase;">${coopName}</div>
                <div style="font-size: 9px; margin-top: 2px;">${coopAddress}</div>
                <div style="font-size: 9px;">Telp: ${coopPhone}</div>
            </div>

            <div class="divider"></div>

            <div style="font-size: 10px;">
                <div class="flex-between">
                    <span>No: ${transaction.invoice_number}</span>
                    <span>${dateFormatted}</span>
                </div>
                <div>Kasir: ${transaction.cashier?.name || 'Kasir'}</div>
            </div>

            <div class="divider"></div>

            <div>${itemsHtml}</div>

            <div class="divider"></div>

            <div style="font-size: 11px;">
                <div class="flex-between bold">
                    <span>TOTAL:</span>
                    <span>Rp ${(Number(transaction.total_amount) || 0).toLocaleString('id-ID')}</span>
                </div>
                <div class="flex-between" style="margin-top: 2px;">
                    <span>Bayar (${transaction.payment_method || 'TUNAI'}):</span>
                    <span>Rp ${(Number(transaction.cash_received) || Number(transaction.total_amount) || 0).toLocaleString('id-ID')}</span>
                </div>
                <div class="flex-between">
                    <span>Kembali:</span>
                    <span>Rp ${(Number(transaction.change_amount) || 0).toLocaleString('id-ID')}</span>
                </div>
            </div>

            <div class="divider"></div>

            <div class="text-center" style="font-size: 10px; margin-top: 8px;">
                <div class="bold">${footerText}</div>
                <div style="font-size: 8.5px; margin-top: 3px; color: #333;">${policyText}</div>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 800);
                };
            </script>
        </body>
        </html>
    `;

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

    try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(html);
            doc.close();
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            }, 150);
        }
    } catch (e) {
        console.error('Failed to print offline receipt:', e);
    }
}

