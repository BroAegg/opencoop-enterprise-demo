/**
 * EMVCo QRIS Generator Utility for POS Cashier.
 * Converts static QRIS string into dynamic QRIS with embedded amount and recalculates CRC16-CCITT checksum.
 */

/**
 * Calculate CRC16-CCITT/FALSE (Polynomial 0x1021, Initial 0xFFFF)
 * @param {string} str 
 * @returns {string} 4-character uppercase hex checksum
 */
export function calculateCrc16(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
        const byte = str.charCodeAt(c);
        let x = ((crc >> 8) ^ byte) & 0xFF;
        x ^= x >> 4;
        crc = (((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF);
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Parse EMVCo TLV (Tag-Length-Value) string into an array of objects
 * @param {string} qrisStr 
 * @returns {Array<{ tag: string, val: string }>}
 */
export function parseQrisTlv(qrisStr) {
    if (!qrisStr || typeof qrisStr !== 'string') return [];
    const clean = qrisStr.trim();
    const tags = [];
    let idx = 0;

    while (idx < clean.length) {
        const tag = clean.slice(idx, idx + 2);
        const len = parseInt(clean.slice(idx + 2, idx + 4), 10);
        if (isNaN(len)) break;
        const val = clean.slice(idx + 4, idx + 4 + len);
        tags.push({ tag, val });
        idx += 4 + len;
    }

    return tags;
}

/**
 * Extract Merchant Name from EMVCo QRIS string (Tag 59)
 * @param {string} staticPayload 
 * @returns {string|null}
 */
export function extractMerchantName(staticPayload) {
    const tags = parseQrisTlv(staticPayload);
    const tag59 = tags.find(t => t.tag === '59');
    return tag59 ? tag59.val : null;
}

/**
 * Convert a static QRIS payload into a dynamic QRIS payload with locked transaction amount
 * @param {string} staticPayload Base static QRIS string
 * @param {number|string} amount Transaction amount in Rupiah (integer)
 * @returns {string|null} Valid dynamic QRIS string or null if payload is invalid
 */
export function generateDynamicQris(staticPayload, amount) {
    if (!staticPayload || typeof staticPayload !== 'string') return null;
    const clean = staticPayload.trim();
    if (clean.length < 25) return null;

    const tags = parseQrisTlv(clean);
    if (!tags.some(t => t.tag === '00') || !tags.some(t => t.tag === '53')) {
        return null; // Not a valid EMVCo QR
    }

    const numericAmount = Math.max(0, Math.round(Number(amount) || 0));
    const amtStr = numericAmount.toString();

    let result = '';
    let tag54Inserted = false;

    for (const item of tags) {
        if (item.tag === '63') continue; // Strip old CRC tag

        // Tag 01: Change Point of Initiation Method from 11 (Static) to 12 (Dynamic)
        if (item.tag === '01') {
            result += '010212';
            continue;
        }

        // Tag 54: Replace existing amount if already present
        if (item.tag === '54') {
            const lenStr = amtStr.length.toString().padStart(2, '0');
            result += '54' + lenStr + amtStr;
            tag54Inserted = true;
            continue;
        }

        // Insert Tag 54 right before Tag 58 (Country Code) or Tag 59 (Merchant Name)
        const tagNum = parseInt(item.tag, 10);
        if (!tag54Inserted && !isNaN(tagNum) && tagNum >= 58) {
            const lenStr = amtStr.length.toString().padStart(2, '0');
            result += '54' + lenStr + amtStr;
            tag54Inserted = true;
        }

        const lenStr = item.val.length.toString().padStart(2, '0');
        result += item.tag + lenStr + item.val;
    }

    if (!tag54Inserted) {
        const lenStr = amtStr.length.toString().padStart(2, '0');
        result += '54' + lenStr + amtStr;
    }

    // Append Tag 63 with length 04 and calculate recomputed CRC16-CCITT
    result += '6304';
    const checksum = calculateCrc16(result);

    return result + checksum;
}

