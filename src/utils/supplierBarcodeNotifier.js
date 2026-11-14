/**
 * Utility for formatting and opening WhatsApp barcode broadcast messages
 * to consignment suppliers with concise, glanceable instructions.
 */

export function cleanPhoneNumber(rawPhone) {
    if (!rawPhone) return '';
    return String(rawPhone)
        .replace(/[^0-9]/g, '')
        .replace(/^0/, '62');
}

export function buildSupplierBroadcastMessage(supplier) {
    const supplierName = supplier?.name || 'Mitra';

    return (
        `Halo Kak, *${supplierName}*, izin menginformasikan terkait penerapan barcode produk di Koperasi Manasuka.\n\n` +
        `Malam ini kami sampaikan informasi terlebih dahulu agar Kakak memiliki waktu persiapan besok. Penerapan barcode ini akan mulai efektif berlaku lusa, yaitu pada *hari Kamis*.\n\n` +
        `Untuk produk yang memiliki kemasan (plastik, pouch, box, dan sejenisnya), mohon setiap kemasan dilengkapi barcode. Barcode sudah disiapkan oleh koperasi dan file PDF berisi barcode saya lampirkan setelah pesan ini. Silakan dicetak dan ditempelkan pada masing-masing kemasan produk.\n\n` +
        `(Di dalam PDF, barcode sudah dikelompokkan rapi sesuai nama produk masing-masing ya kak).\n\n` +
        `Khusus produk yang berpotensi terkena air, seperti makanan/minuman yang disimpan dikulkas, mohon barcode dicetak menggunakan kertas \`vinyl\` agar tidak mudah luntur atau rusak.\n\n` +
        `Untuk produk tanpa kemasan seperti gorengan, tidak perlu menggunakan barcode. Terima kasih atas kerja samanya, kak *${supplierName}* 🙏`
    );
}

export function buildSingleProductBarcodeMessage(supplier, product) {
    const supplierName = supplier?.name || product?.supplier?.name || 'Mitra';

    return (
        `Halo Kak, *${supplierName}*, izin menginformasikan terkait penerapan barcode produk di Koperasi Manasuka.\n\n` +
        `Malam ini kami sampaikan informasi terlebih dahulu agar Kakak memiliki waktu persiapan besok. Mulai lusa (*hari Kamis*), mohon khusus produk titipan *${product.name}* pada setiap kemasannya dilengkapi stiker barcode mandiri sebelum disetor ke toko agar transaksi di kasir berjalan lancar.\n\n` +
        `File PDF berisi barcode produk ini saya lampirkan setelah pesan ini ya kak. Silakan dicetak dan ditempelkan pada masing-masing kemasan.\n\n` +
        `Khusus produk yang berpotensi terkena air, seperti makanan/minuman yang disimpan dikulkas, mohon barcode dicetak menggunakan kertas \`vinyl\` agar tidak mudah luntur atau rusak.\n\n` +
        `Terima kasih atas kerja samanya, kak *${supplierName}* 🙏`
    );
}

export function openSupplierBarcodeWa(supplier) {
    const rawPhone = supplier?.phone_wa || supplier?.phone;
    const clean = cleanPhoneNumber(rawPhone);
    if (!clean) return;

    const msg = buildSupplierBroadcastMessage(supplier);
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
}

export function openSingleProductBarcodeWa(supplier, product) {
    const rawPhone = supplier?.phone_wa || supplier?.phone || product?.supplier?.phone_wa || product?.supplier?.phone;
    const clean = cleanPhoneNumber(rawPhone);
    if (!clean) return;

    const msg = buildSingleProductBarcodeMessage(supplier, product);
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
}

