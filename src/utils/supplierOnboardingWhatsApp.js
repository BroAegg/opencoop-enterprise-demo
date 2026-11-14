/**
 * Helper to build pre-formatted WhatsApp onboarding link for active suppliers.
 * Adheres to Koperasi Manasuka Industrial ERP and Apple HIG standards.
 *
 * @param {Object} supplier
 * @returns {string|null}
 */
export function getSupplierOnboardingWaUrl(supplier) {
    if (!supplier) return null;

    const rawPhone = supplier.phone_wa || supplier.phone || '';
    let cleanPhone = rawPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) return null;

    if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('8')) {
        cleanPhone = '62' + cleanPhone;
    }

    const recipientName =
        supplier.owner_name && supplier.owner_name.trim().length > 0
            ? supplier.owner_name.trim()
            : supplier.name;

    const loginId = rawPhone || supplier.phone || supplier.code || '';

    const message = `Assalamu'alaikum,
${recipientName}

Dalam rangka meningkatkan transparansi dan kenyamanan kemitraan, Koperasi Manasuka kini resmi menghadirkan Portal Mandiri Mitra Usaha.

Melalui portal ini, Anda dapat memantau secara langsung:
• Penjualan produk Anda di kasir toko secara real-time.
• Riwayat barang masuk (drop harian) dan catatan retur.
• Estimasi hak pencairan dana dan kwitansi pembayaran digital.

Akses Portal Mitra:
Tautan: https://Manasuka.id/login
ID Pengguna: ${loginId}
Kata Sandi Sementara: 12345678

Demi keamanan akun, Anda disarankan untuk memperbarui kata sandi setelah berhasil masuk pada menu Profil.

Hormat kami,
Koperasi Manasuka
Layanan Bantuan: https://wa.me/6281224258870`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

