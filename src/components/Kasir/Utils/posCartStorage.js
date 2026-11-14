/**
 * posCartStorage: Resilient LocalStorage Manager for POS Parked (Held) Orders.
 */

export const MAX_HELD_ORDERS = 25;
export const MAX_HELD_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function loadHeldOrdersFromStorage() {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem('pos_held_orders');
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];
        const now = Date.now();
        return parsed
            .filter(item => {
                if (!item || typeof item !== 'object' || !Array.isArray(item.cart) || item.cart.length === 0) return false;
                const createdAt = item.createdAtMs || item.id;
                // Auto-prune orders older than 24 hours
                if (typeof createdAt === 'number' && (now - createdAt > MAX_HELD_AGE_MS)) return false;
                return true;
            })
            .slice(0, MAX_HELD_ORDERS);
    } catch (e) {
        console.warn('pos_held_orders corrupted or unparseable, clearing storage:', e);
        try {
            localStorage.removeItem('pos_held_orders');
        } catch (_) {}
        return [];
    }
}

export function saveHeldOrdersToStorage(heldOrders = []) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders));
    } catch (e) {
        console.error('Failed to save pos_held_orders to localStorage:', e);
    }
}

export function buildHeldOrderSnapshot(cart = [], member = null, intendedMethod = null, note = null) {
    const validMethods = ['CASH', 'QRIS', 'SPLIT', 'KASBON', 'TRANSFER'];
    const sanitizedMethod = (typeof intendedMethod === 'string' && validMethods.includes(intendedMethod.toUpperCase()))
        ? intendedMethod.toUpperCase()
        : null;
    const sanitizedNote = typeof note === 'string' ? note.slice(0, 255) : null;
    const now = Date.now();
    const dominantItem = [...cart].sort((a, b) => (b.qty || 1) - (a.qty || 1))[0];

    return {
        id: now,
        createdAtMs: now,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        cart: cart.map(item => ({
            id: item.id,
            cart_key: item.cart_key || `${item.id}`,
            name: String(item.name || 'Produk'),
            barcode: item.barcode ? String(item.barcode) : null,
            selling_price: Number(item.selling_price || 0),
            cost_price: Number(item.cost_price || 0),
            stock: item.stock !== undefined && item.stock !== null ? Number(item.stock) : null,
            qty: Math.max(1, Number(item.qty || 1)),
            selected_modifier: item.selected_modifier ? {
                id: item.selected_modifier.id,
                name: String(item.selected_modifier.name || ''),
                price: Number(item.selected_modifier.price || 0),
            } : null,
        })),
        member: member ? {
            id: member.id,
            name: String(member.name || ''),
            phone: member.phone ? String(member.phone) : null,
            member_code: member.member_code ? String(member.member_code) : null,
        } : null,
        intendedPaymentMethod: sanitizedMethod,
        primaryItemName: dominantItem ? `${dominantItem.qty}× ${dominantItem.name}` : null,
        note: sanitizedNote,
    };
}
