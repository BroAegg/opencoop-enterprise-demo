/**
 * escpos.js: Pure ESC/POS Command Encoder for 58mm / 80mm Thermal Receipt Printers.
 * 
 * Generates raw Uint8Array binary buffers for direct WebSerial / WebUSB transmission.
 */

// ESC/POS Constants
export const CMD = {
    INIT: [0x1B, 0x40],                    // ESC @
    ALIGN_LEFT: [0x1B, 0x61, 0x00],         // ESC a 0
    ALIGN_CENTER: [0x1B, 0x61, 0x01],       // ESC a 1
    ALIGN_RIGHT: [0x1B, 0x61, 0x02],        // ESC a 2
    FONT_NORMAL: [0x1B, 0x21, 0x00],        // ESC ! 0
    FONT_BOLD: [0x1B, 0x21, 0x08],          // ESC ! 8
    FONT_DOUBLE_HEIGHT: [0x1B, 0x21, 0x10], // ESC ! 16
    FONT_DOUBLE_WIDTH: [0x1B, 0x21, 0x20],  // ESC ! 32
    FONT_DOUBLE_SIZE: [0x1B, 0x21, 0x30],   // ESC ! 48
    FEED_LINE: [0x0A],                      // LF
    CUT_FULL: [0x1D, 0x56, 0x00],           // GS V 0
    CUT_PARTIAL: [0x1D, 0x56, 0x42, 0x00],  // GS V 66 0
    KICK_DRAWER: [0x1B, 0x70, 0x00, 0x19, 0xFA], // ESC p 0 25 250
};

/**
 * Text formatting helpers for character-grid thermal receipts.
 */
export function padRow(left = '', right = '', width = 32) {
    const l = String(left);
    const r = String(right);
    const spaceCount = Math.max(1, width - l.length - r.length);
    return l + ' '.repeat(spaceCount) + r;
}

export function divider(width = 32, char = '-') {
    return char.repeat(width);
}

function formatRp(val) {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
}

/**
 * Build ESC/POS binary receipt for a POS transaction.
 */
export function buildReceiptEscPos(transaction, coopInfo = {}, options = {}) {
    const width = options.paperWidth === '80mm' ? 48 : 32;
    const shouldKick = options.kickDrawer !== false && (
        transaction.payment_method === 'CASH' || 
        transaction.payment_method === 'SPLIT' || 
        (transaction.payments && transaction.payments.some(p => p.payment_method === 'CASH'))
    );

    const encoder = new TextEncoder();
    const chunks = [];

    const append = (bytes) => chunks.push(...bytes);
    const appendText = (text) => chunks.push(...encoder.encode(text));
    const appendLine = (text = '') => {
        chunks.push(...encoder.encode(text));
        chunks.push(0x0A);
    };

    // 1. Initialize
    append(CMD.INIT);

    // 2. Kick Cash Drawer immediately if cash tender
    if (shouldKick) {
        append(CMD.KICK_DRAWER);
    }

    // 3. Header
    append(CMD.ALIGN_CENTER);
    append(CMD.FONT_BOLD);
    appendLine(coopInfo.name || 'KOPERASI Manasuka');
    append(CMD.FONT_NORMAL);
    if (coopInfo.address) appendLine(coopInfo.address);
    if (coopInfo.phone) appendLine(`Telp: ${coopInfo.phone}`);
    appendLine(divider(width, '-'));

    // VOID indicator
    if (transaction.status === 'VOID') {
        append(CMD.FONT_BOLD);
        appendLine('*** BATAL / VOID ***');
        append(CMD.FONT_NORMAL);
        appendLine(divider(width, '='));
    }

    // 4. Invoice & Cashier Info
    append(CMD.ALIGN_LEFT);
    const dateStr = new Date(transaction.created_at || Date.now()).toLocaleDateString('id-ID', {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    appendLine(padRow(`No: ${transaction.invoice_number}`, dateStr, width));
    appendLine(`Kasir: ${transaction.cashier?.name || 'Kasir Aktif'}`);
    if (transaction.member) {
        appendLine(padRow(`Member: ${transaction.member.name}`, `Poin: +${transaction.points_earned || 0}`, width));
    }
    appendLine(divider(width, '-'));

    // 5. Items
    const items = transaction.items || [];
    for (const item of items) {
        // Line 1: Item Name
        appendLine(item.product_name);
        // Line 1b: Modifiers (if any)
        const mods = item.selected_modifiers || [];
        if (Array.isArray(mods) && mods.length > 0) {
            for (const mod of mods) {
                const modExtra = Number(mod.price) > 0 ? ` (+Rp ${Number(mod.price).toLocaleString('id-ID')})` : '';
                appendLine(`  + ${mod.name}${modExtra}`);
            }
        }
        // Line 2: Qty x Unit Price ... Subtotal
        const detail = `  ${item.qty} x ${Number(item.unit_price).toLocaleString('id-ID')}`;
        const subtotal = Number(item.subtotal).toLocaleString('id-ID');
        appendLine(padRow(detail, subtotal, width));
    }
    appendLine(divider(width, '-'));

    // 6. Totals & Tender
    if (Number(transaction.points_discount_amount || 0) > 0) {
        appendLine(padRow(`POTONGAN POIN (${transaction.points_redeemed || 0}pt)`, `-${formatRp(transaction.points_discount_amount)}`, width));
    }
    append(CMD.FONT_BOLD);
    appendLine(padRow('TOTAL', formatRp(transaction.total_amount), width));
    append(CMD.FONT_NORMAL);

    if (Number(transaction.rounding_amount || 0) !== 0) {
        appendLine(padRow('PEMBULATAN', formatRp(transaction.rounding_amount), width));
    }

    // Payment slices
    if (transaction.payments && transaction.payments.length > 0) {
        for (const p of transaction.payments) {
            appendLine(padRow(p.payment_method, formatRp(p.amount), width));
        }
    } else {
        appendLine(padRow(transaction.payment_method || 'CASH', formatRp(transaction.cash_received || transaction.total_amount), width));
    }

    if (Number(transaction.change_amount || 0) > 0) {
        append(CMD.FONT_BOLD);
        appendLine(padRow('KEMBALI', formatRp(transaction.change_amount), width));
        append(CMD.FONT_NORMAL);
    }

    // 7. Footer
    appendLine(divider(width, '-'));
    append(CMD.ALIGN_CENTER);
    appendLine(coopInfo.receipt_footer || 'TERIMA KASIH');
    if (coopInfo.receipt_policy) {
        appendLine(coopInfo.receipt_policy);
    } else {
        appendLine('Barang yang sudah dibeli');
        appendLine('tidak dapat ditukar/dikembalikan');
    }
    appendLine('');
    appendLine('');

    // 8. Feed and Cut Paper
    append(CMD.CUT_PARTIAL);

    return new Uint8Array(chunks);
}

/**
 * Build ESC/POS test print pattern.
 */
export function buildTestReceiptEscPos(coopInfo = {}, options = {}) {
    const width = options.paperWidth === '80mm' ? 48 : 32;
    const encoder = new TextEncoder();
    const chunks = [];

    const append = (bytes) => chunks.push(...bytes);
    const appendLine = (text = '') => {
        chunks.push(...encoder.encode(text));
        chunks.push(0x0A);
    };

    append(CMD.INIT);
    append(CMD.ALIGN_CENTER);
    append(CMD.FONT_BOLD);
    appendLine(coopInfo.name || 'Manasuka POS');
    append(CMD.FONT_NORMAL);
    appendLine('UJI COBA CETAK THERMAL DIRECT');
    appendLine(divider(width, '='));
    append(CMD.ALIGN_LEFT);
    appendLine(`Koneksi: Direct WebSerial / WebUSB`);
    appendLine(`Format: ESC/POS Thermal (${width} Kolom)`);
    appendLine(`Waktu: ${new Date().toLocaleTimeString('id-ID')}`);
    appendLine(divider(width, '-'));
    append(CMD.ALIGN_CENTER);
    appendLine('PRINTER SIAP DIGUNAKAN');
    appendLine('');
    appendLine('');
    append(CMD.CUT_PARTIAL);

    return new Uint8Array(chunks);
}

/**
 * Build ESC/POS binary receipt for Supplier Payout (Settlement).
 */
export function buildSupplierPayoutEscPos(payoutData, coopInfo = {}, options = {}) {
    const width = options.paperWidth === '80mm' ? 48 : 32;
    const encoder = new TextEncoder();
    const chunks = [];

    const append = (bytes) => chunks.push(...bytes);
    const appendLine = (text = '') => {
        chunks.push(...encoder.encode(text));
        chunks.push(0x0A);
    };

    const settlement = payoutData.settlement || {};
    const supplier = payoutData.supplier || settlement.supplier || {};
    const amount = Number(payoutData.amount || settlement.total_amount || 0);
    const soldItems = payoutData.sold_items || [];
    const returnedItems = payoutData.returned_items || [];
    const cashierName = payoutData.cashier_name || 'Kasir';

    // 1. Init & Kick drawer to release cash
    append(CMD.INIT);
    append(CMD.KICK_DRAWER);

    // 2. Header
    append(CMD.ALIGN_CENTER);
    append(CMD.FONT_BOLD);
    appendLine(coopInfo.name || 'KOPERASI Manasuka');
    append(CMD.FONT_NORMAL);
    if (coopInfo.address) appendLine(coopInfo.address);
    if (coopInfo.phone) appendLine(`Telp: ${coopInfo.phone}`);
    appendLine(divider(width, '-'));

    // Title
    append(CMD.FONT_BOLD);
    appendLine('BUKTI PENGELUARAN KAS LACI');
    appendLine('SETTLEMENT BAGI HASIL');
    append(CMD.FONT_NORMAL);
    appendLine(divider(width, '='));

    // Meta Info
    append(CMD.ALIGN_LEFT);
    const dateStr = new Date(settlement.created_at || Date.now()).toLocaleDateString('id-ID', {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    appendLine(padRow(`No: ${settlement.settlement_number || '-'}`, dateStr, width));
    appendLine(`Kasir: ${cashierName}`);
    appendLine(`Supplier: ${supplier.name || '-'} (${supplier.code || '-'})`);
    if (supplier.phone) appendLine(`Telp: ${supplier.phone}`);
    appendLine(divider(width, '-'));

    // 3. Sold Items Breakdown
    if (soldItems.length > 0) {
        appendLine('Rincian Penjualan Hari Ini:');
        soldItems.forEach((item) => {
            const name = item.product_name || item.name || 'Produk';
            append(CMD.FONT_BOLD);
            appendLine(name.length > width ? name.substring(0, width) : name);
            append(CMD.FONT_NORMAL);
            const qty = item.qty_sold || item.qty || 0;
            const price = Number(item.cost_price || item.unit_price || 0);
            const subtotal = Number(item.subtotal_earned || (qty * price));
            appendLine(padRow(`  ${qty} x ${formatRp(price)}`, formatRp(subtotal), width));
        });
        appendLine(divider(width, '-'));
    }

    // 4. Total Payout
    append(CMD.ALIGN_RIGHT);
    append(CMD.FONT_BOLD);
    append(CMD.FONT_DOUBLE_HEIGHT);
    appendLine(padRow('DIBAYARKAN:', formatRp(amount), width));
    append(CMD.FONT_NORMAL);
    appendLine(padRow('Metode:', 'TUNAI KAS LACI', width));

    // 5. Returned Items
    if (returnedItems.length > 0) {
        append(CMD.ALIGN_LEFT);
        appendLine(divider(width, '-'));
        append(CMD.FONT_BOLD);
        appendLine('Retur Fisik Sisa Rak:');
        append(CMD.FONT_NORMAL);
        returnedItems.forEach((ret) => {
            appendLine(padRow(`  ${ret.name}`, `${ret.qty_returned} pcs`, width));
        });
    }

    // 6. Signatures
    appendLine(divider(width, '-'));
    append(CMD.ALIGN_CENTER);
    appendLine('');
    appendLine(padRow('Penerima,', 'Kasir,', width));
    appendLine('');
    appendLine('');
    appendLine(padRow(`(${supplier.name ? supplier.name.substring(0, 12) : 'Supplier'})`, `(${cashierName.substring(0, 12)})`, width));
    appendLine('');
    appendLine('Simpan bukti ini sebagai arsip');
    appendLine('');
    appendLine('');

    append(CMD.CUT_PARTIAL);

    return new Uint8Array(chunks);
}

/**
 * Build ESC/POS binary receipt for Supplier COD Payout.
 */
export function buildSupplierCodPayoutEscPos(codData, coopInfo = {}, options = {}) {
    const width = options.paperWidth === '80mm' ? 48 : 32;
    const encoder = new TextEncoder();
    const chunks = [];

    const append = (bytes) => chunks.push(...bytes);
    const appendLine = (text = '') => {
        chunks.push(...encoder.encode(text));
        chunks.push(0x0A);
    };

    const movement = codData.movement || codData;
    const amount = Number(movement.amount || codData.amount || 0);
    const supplierName = codData.supplier_name || movement.metadata?.supplier_name || movement.supplier?.name || codData.supplier?.name || 'Supplier / Sales';
    const invoiceNumber = movement.invoice_number || movement.metadata?.invoice_number || codData.invoice_number || '-';
    const authorizedByName = movement.authorized_by_name || movement.metadata?.authorized_by_name || movement.authorized_by?.name || codData.supervisor?.name || '-';
    const description = movement.description || codData.description || 'Pembayaran Tunai COD';
    const cashierName = codData.cashier_name || 'Kasir';
    const voucherRef = movement.id ? `CSH-OUT-#${movement.id}` : `COD-${Date.now().toString().slice(-6)}`;

    // 1. Init & Kick drawer to release cash
    append(CMD.INIT);
    append(CMD.KICK_DRAWER);

    // 2. Header
    append(CMD.ALIGN_CENTER);
    append(CMD.FONT_BOLD);
    appendLine(coopInfo.name || 'KOPERASI Manasuka');
    append(CMD.FONT_NORMAL);
    if (coopInfo.address) appendLine(coopInfo.address);
    if (coopInfo.phone) appendLine(`Telp: ${coopInfo.phone}`);
    appendLine(divider(width, '-'));

    // Title
    append(CMD.FONT_BOLD);
    appendLine('BUKTI PENGELUARAN KAS LACI');
    appendLine('BAYAR SUPPLIER / COD');
    append(CMD.FONT_NORMAL);
    appendLine(divider(width, '='));

    // Meta Info
    append(CMD.ALIGN_LEFT);
    const dateStr = new Date(movement.created_at || Date.now()).toLocaleDateString('id-ID', {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    appendLine(padRow(`No: ${voucherRef}`, dateStr, width));
    appendLine(`Kasir: ${cashierName}`);
    appendLine(`Otorisator: ${authorizedByName}`);
    appendLine(divider(width, '-'));

    appendLine(`Supplier  : ${supplierName}`);
    appendLine(`No. Faktur: ${invoiceNumber}`);
    appendLine(`Rincian   : ${description}`);

    const items = codData.items || movement.metadata?.items || [];
    if (items.length > 0) {
        appendLine(divider(width, '-'));
        appendLine('Barang Diterima (+):');
        items.forEach(it => {
            const sub = it.subtotal ? formatRp(it.subtotal) : '';
            appendLine(`${it.name || 'Item'} x${it.qty}`);
            if (sub) {
                appendLine(padRow(`  @${formatRp(it.unit_cost || 0)}`, sub, width));
            }
        });
    }

    const returnItems = codData.return_items || movement.metadata?.return_items || [];
    if (returnItems.length > 0) {
        appendLine(divider(width, '-'));
        appendLine('Barang Retur/Tukar (-):');
        returnItems.forEach(it => {
            const sub = it.subtotal ? `-${formatRp(it.subtotal)}` : '';
            const reasonStr = it.reason ? ` [${it.reason}]` : '';
            appendLine(`${it.name || 'Item'} x${it.qty}${reasonStr}`);
            if (sub) {
                appendLine(padRow(`  @${formatRp(it.unit_cost || 0)}`, sub, width));
            }
        });
    }

    appendLine(divider(width, '-'));

    append(CMD.FONT_BOLD);
    if (amount === 0 && (items.length > 0 || returnItems.length > 0)) {
        appendLine(padRow('TOTAL BAYAR:', 'RP 0 (TUKAR GULING)', width));
        append(CMD.FONT_NORMAL);
        appendLine(padRow('Status:', 'SEIMBANG / NON-TUNAI', width));
    } else {
        appendLine(padRow('TOTAL BAYAR:', formatRp(amount), width));
        append(CMD.FONT_NORMAL);
        appendLine(padRow('Metode:', 'TUNAI KAS LACI', width));
    }

    // Signatures
    appendLine(divider(width, '-'));
    append(CMD.ALIGN_CENTER);
    appendLine('');
    appendLine(padRow('Penerima (Sales),', 'Kasir Toko,', width));
    appendLine('');
    appendLine('');
    appendLine(padRow(`(${supplierName.substring(0, 12)})`, `(${cashierName.substring(0, 12)})`, width));
    appendLine('');
    appendLine('* Staples ke faktur asli & simpan di laci');
    appendLine('');
    appendLine('');

    append(CMD.CUT_PARTIAL);

    return new Uint8Array(chunks);
}

/**
 * Build ESC/POS binary receipt for Batch Parkir Settlement Summary.
 */
export function buildBatchSummaryEscPos(batchData, coopInfo = {}, options = {}) {
    const width = options.paperWidth === '80mm' ? 48 : 32;
    const encoder = new TextEncoder();
    const chunks = [];

    const append = (bytes) => chunks.push(...bytes);
    const appendLine = (text = '') => {
        chunks.push(...encoder.encode(text));
        chunks.push(0x0A);
    };

    const count = Number(batchData.processed_count || 0);
    const totalAmount = Number(batchData.total_amount || 0);
    const totalCash = Number(batchData.total_cash || 0);
    const totalQris = Number(batchData.total_qris || 0);
    const cashierName = batchData.cashier_name || 'Kasir';
    const timestamp = batchData.timestamp || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    append(CMD.INIT);
    append(CMD.ALIGN_CENTER);
    append(CMD.FONT_BOLD);
    appendLine(coopInfo.name || 'KOPERASI Manasuka');
    append(CMD.FONT_NORMAL);
    appendLine('REKAP ACC BATCH PARKIR');
    appendLine(divider(width, '='));

    append(CMD.ALIGN_LEFT);
    appendLine(padRow('Waktu Rekap:', timestamp, width));
    appendLine(padRow('Kasir:', cashierName, width));
    appendLine(padRow('Total Pesanan:', `${count} Transaksi`, width));
    appendLine(divider(width, '-'));

    appendLine(padRow('Porsi Tunai (Kas):', formatRp(totalCash), width));
    appendLine(padRow('Porsi QRIS:', formatRp(totalQris), width));
    appendLine(divider(width, '='));

    append(CMD.FONT_BOLD);
    appendLine(padRow('GRAND TOTAL:', formatRp(totalAmount), width));
    append(CMD.FONT_NORMAL);
    appendLine(divider(width, '-'));

    append(CMD.ALIGN_CENTER);
    appendLine('* Bukti Rekap Konfirmasi Massal *');
    appendLine('* Simpan struk ini bersama uang kas *');
    appendLine('');
    appendLine('');

    append(CMD.CUT_PARTIAL);

    return new Uint8Array(chunks);
}

/**
 * Build ESC/POS binary receipt for Unified Morning Consignment Drop & Reconciliation.
 */
export function buildConsignmentMorningWorkflowEscPos(data, coopInfo = {}, options = {}) {
    const width = options.paperWidth === '80mm' ? 48 : 32;
    const encoder = new TextEncoder();
    const chunks = [];

    const append = (bytes) => chunks.push(...bytes);
    const appendLine = (text = '') => {
        chunks.push(...encoder.encode(text));
        chunks.push(0x0A);
    };

    const supplierName = data.supplier_name || data.supplier?.name || 'Mitra Konsinyasi';
    const cashierName = data.cashier_name || 'Kasir';
    const payoutAmount = Number(data.payout_amount || 0);
    const payoutMethod = data.payout_method || 'RECORD_DEBT';
    const incomingPcs = Number(data.incoming_pcs || 0);
    const incomingItems = data.incoming_items || [];
    const returnedItems = data.reconciliation_summary?.returned_items || [];
    const shortageItems = data.reconciliation_summary?.shortage_items || [];
    const unsettledRemaining = Number(data.unsettled_balance_remaining || 0);
    const dateStr = new Date().toLocaleDateString('id-ID', {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
    });

    append(CMD.INIT);
    if (payoutAmount > 0 && payoutMethod === 'CASH') {
        append(CMD.KICK_DRAWER);
    }

    // Header
    append(CMD.ALIGN_CENTER);
    append(CMD.FONT_BOLD);
    appendLine(coopInfo.name || 'KOPERASI Manasuka');
    append(CMD.FONT_NORMAL);
    if (coopInfo.address) appendLine(coopInfo.address);
    appendLine(divider(width, '-'));

    append(CMD.FONT_BOLD);
    appendLine('TANDA TERIMA & REKONSILIASI');
    appendLine('TITIPAN PAGI HARIAN');
    append(CMD.FONT_NORMAL);
    appendLine(divider(width, '='));

    // Meta
    append(CMD.ALIGN_LEFT);
    appendLine(padRow('Waktu:', dateStr, width));
    appendLine(padRow('Mitra:', supplierName.substring(0, width - 7), width));
    appendLine(padRow('Kasir:', cashierName, width));
    appendLine(divider(width, '-'));

    // 1. Titipan Baru Hari Ini
    if (incomingItems.length > 0) {
        append(CMD.FONT_BOLD);
        appendLine(`Barang Titipan Baru (+${incomingPcs} pcs):`);
        append(CMD.FONT_NORMAL);
        incomingItems.forEach(it => {
            if (Number(it.qty) > 0) {
                appendLine(padRow(`• ${it.name}`, `${it.qty} pcs`, width));
            }
        });
        appendLine(divider(width, '-'));
    }

    // 2. Rekonsiliasi Sisa Kemarin (jika ada)
    if (returnedItems.length > 0 || shortageItems.length > 0) {
        append(CMD.FONT_BOLD);
        appendLine('Rekonsiliasi Sisa Kemarin:');
        append(CMD.FONT_NORMAL);
        if (shortageItems.length > 0) {
            shortageItems.forEach(s => {
                appendLine(padRow(`  Laku/Selisih: ${s.product_name}`, `${s.shortage_qty} pcs`, width));
            });
        }
        if (returnedItems.length > 0) {
            returnedItems.forEach(r => {
                appendLine(padRow(`  Retur Fisik: ${r.name}`, `${r.qty_returned} pcs`, width));
            });
        }
        appendLine(divider(width, '-'));
    }

    // 3. Keuangan & Hak Mitra
    append(CMD.FONT_BOLD);
    if (payoutAmount > 0) {
        appendLine(padRow('DIBAYARKAN:', formatRp(payoutAmount), width));
        append(CMD.FONT_NORMAL);
        const methodLabel = payoutMethod === 'CASH' ? 'TUNAI KAS LACI' : 'TRANSFER BANK';
        appendLine(padRow('Metode:', methodLabel, width));
    } else {
        appendLine(padRow('STATUS PEMBAYARAN:', 'DISIMPAN SALDO UTANG', width));
        append(CMD.FONT_NORMAL);
    }

    if (unsettledRemaining > 0) {
        appendLine(padRow('Sisa Saldo Utang Toko:', formatRp(unsettledRemaining), width));
    }
    appendLine(divider(width, '-'));

    // 4. Tanda Tangan
    append(CMD.ALIGN_CENTER);
    appendLine('');
    appendLine(padRow('Penitip (Mitra),', 'Kasir Toko,', width));
    appendLine('');
    appendLine('');
    appendLine(padRow(`(${supplierName.substring(0, 12)})`, `(${cashierName.substring(0, 12)})`, width));
    appendLine('');
    appendLine('* Bukti Sah Terima & Bagi Hasil *');
    appendLine('');
    appendLine('');

    append(CMD.CUT_PARTIAL);

    return new Uint8Array(chunks);
}



