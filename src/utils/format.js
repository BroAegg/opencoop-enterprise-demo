/**
 * Memformat angka menjadi string mata uang Rupiah
 * @param {number} amount - Nilai mata uang
 * @param {boolean} withPrefix - Apakah menyertakan 'Rp' atau tidak
 * @returns {string} String terformat (e.g. "Rp 200.000")
 */
export const formatRupiah = (amount, withPrefix = true) => {
    if (amount === undefined || amount === null || amount === '') return '';
    
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return amount;
    
    const formatted = numericAmount.toLocaleString('id-ID');
    return withPrefix ? `Rp ${formatted}` : formatted;
};

/**
 * Parsing string mata uang ke dalam angka (menghapus non-digit)
 * @param {string} str - String mata uang
 * @returns {number} Nilai angka
 */
export const parseRupiah = (str) => {
    if (!str) return 0;
    const numericStr = String(str).replace(/[^0-9-]/g, '');
    return parseInt(numericStr, 10) || 0;
};

/**
 * Memformat string periode YYYY-MM menjadi format nama bulan (e.g. "November 2026")
 * @param {string} periodStr 
 * @returns {string}
 */
export const formatPeriod = (periodStr) => {
    if (!periodStr) return '-';
    const [year, month] = String(periodStr).split('-');
    if (!year || !month) return periodStr;
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return `${months[monthIndex] || month} ${year}`;
};

/**
 * Memformat ISO string / date string menjadi format Indonesia (e.g. "31 Juli 2026")
 * @param {string|Date} dateStr 
 * @returns {string}
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr).split('T')[0];
        return new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(d);
    } catch {
        return String(dateStr).split('T')[0];
    }
};

/**
 * Memformat jam transaksi (e.g. "15:45" atau "15:45:00") di zona waktu Indonesia (WIB)
 * @param {string|Date} dateStr 
 * @param {boolean} withSeconds
 * @returns {string}
 */
export const formatTime = (dateStr, withSeconds = false) => {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '-';
        return new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour: '2-digit',
            minute: '2-digit',
            ...(withSeconds ? { second: '2-digit' } : {}),
            hour12: false,
        }).format(d).replace(/\./g, ':');
    } catch {
        return '-';
    }
};

/**
 * Memformat ISO string / date string menjadi format Indonesia dengan waktu (e.g. "19 Sep 2026, 05:00 WIB")
 * @param {string|Date} dateStr 
 * @param {boolean} withTz
 * @returns {string}
 */
export const formatDateTime = (dateStr, withTz = false) => {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        const formatted = new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(d).replace(/\./g, ':');
        return withTz ? `${formatted} WIB` : formatted;
    } catch {
        return String(dateStr);
    }
};

/**
 * Konversi angka numerik ke kalimat terbilang Bahasa Indonesia
 * @param {number} nilai 
 * @returns {string}
 */
export const angkaKeTerbilang = (nilai) => {
    const angka = Math.floor(Math.abs(Number(nilai) || 0));
    const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

    if (angka < 12) {
        return bilangan[angka];
    } else if (angka < 20) {
        return angkaKeTerbilang(angka - 10) + ' Belas';
    } else if (angka < 100) {
        return angkaKeTerbilang(Math.floor(angka / 10)) + ' Puluh ' + angkaKeTerbilang(angka % 10);
    } else if (angka < 200) {
        return 'Seratus ' + angkaKeTerbilang(angka - 100);
    } else if (angka < 1000) {
        return angkaKeTerbilang(Math.floor(angka / 100)) + ' Ratus ' + angkaKeTerbilang(angka % 100);
    } else if (angka < 2000) {
        return 'Seribu ' + angkaKeTerbilang(angka - 1000);
    } else if (angka < 1000000) {
        return angkaKeTerbilang(Math.floor(angka / 1000)) + ' Ribu ' + angkaKeTerbilang(angka % 1000);
    } else if (angka < 1000000000) {
        return angkaKeTerbilang(Math.floor(angka / 1000000)) + ' Juta ' + angkaKeTerbilang(angka % 1000000);
    } else if (angka < 1000000000000) {
        return angkaKeTerbilang(Math.floor(angka / 1000000000)) + ' Miliar ' + angkaKeTerbilang(angka % 1000000000);
    }
    return '';
};


