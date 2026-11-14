/**
 * hrDateTime.js
 *
 * Timezone-safe date and time formatting helpers for Master SDM & Kasir Shift logs.
 * Prevents raw ISO-8601 UTC strings (e.g. 2026-10-22T17:00:00.000000Z) or UTC off-by-7-hour shifts.
 */

const JAKARTA_TZ = 'Asia/Jakarta';

/**
 * Format a date string or ISO timestamp into clean Indonesian date (e.g. "23 Okt 2026").
 */
export function formatDateId(value, fallback = '-') {
    if (!value) return fallback;
    const str = String(value).trim();

    // Exact YYYY-MM-DD date string (no time component) -> format without timezone shift
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [year, month, day] = str.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(date);
    }

    const parsed = new Date(str);
    if (Number.isNaN(parsed.getTime())) return fallback;

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: JAKARTA_TZ,
    }).format(parsed);
}

/**
 * Format a time string ("07:05", "07:05:00") or ISO timestamp into Jakarta HH:mm (e.g. "07:05").
 */
export function formatTimeId(value, fallback = '-') {
    if (!value) return fallback;
    const str = String(value).trim();

    // Already "HH:mm" or "HH:mm:ss"
    const hhmmMatch = str.match(/^(\d{2}:\d{2})(?::\d{2})?$/);
    if (hhmmMatch) {
        return hhmmMatch[1];
    }

    const parsed = new Date(str);
    if (Number.isNaN(parsed.getTime())) return fallback;

    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: JAKARTA_TZ,
    })
        .format(parsed)
        .replace('.', ':');
}

/**
 * Format an ISO datetime into Jakarta "12 Nov 2026, 07:05".
 */
export function formatDateTimeId(value, fallback = '-') {
    if (!value) return fallback;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return fallback;

    const datePart = formatDateId(parsed, '');
    const timePart = formatTimeId(parsed, '');

    return datePart && timePart ? `${datePart}, ${timePart}` : fallback;
}

/**
 * Normalize a date value or UTC ISO string into "YYYY-MM-DD" in Asia/Jakarta for HTML <input type="date">.
 */
export function toInputDate(value) {
    if (!value) return '';
    const str = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
    }

    const parsed = new Date(str);
    if (Number.isNaN(parsed.getTime())) {
        return str.substring(0, 10);
    }

    const parts = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: JAKARTA_TZ,
    }).formatToParts(parsed);

    const map = {};
    parts.forEach((p) => {
        map[p.type] = p.value;
    });

    return `${map.year}-${map.month}-${map.day}`;
}
