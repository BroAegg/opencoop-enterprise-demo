/**
 * posVendorSearch.js
 * 
 * Apple Spotlight-style flexible search utility for Vendor Hub.
 * Features:
 * 1. Multi-token, order-independent matching ("snack prita" matches "Prita Snack")
 * 2. Product-level associative search (searching "lemper" or "risol" matches vendors selling that menu)
 * 3. Person/PIC matching (matches owner_name)
 * 4. Clean phone digits matching
 * 5. Score-based ranking so most relevant vendors appear at the top
 */

export function filterVendorsFlexible(vendors = [], searchQuery = '', filterMode = 'ALL') {
    const rawQ = (searchQuery || '').trim().toLowerCase();

    // 1. Status Filter (Apple Mail style: All vs Unsettled)
    const baseList = vendors.filter((vendor) => {
        if (filterMode === 'UNSETTLED') {
            return Number(vendor.unsettled_balance || 0) > 0;
        }
        return true;
    });

    if (!rawQ) {
        return baseList.map((v) => ({ ...v, _matchedReason: null, _matchedProduct: null }));
    }

    // 2. Tokenize search query (e.g. "snack prita" -> ["snack", "prita"])
    const tokens = rawQ.split(/\s+/).filter(Boolean);
    const cleanQueryNum = rawQ.replace(/\D/g, '');

    const scoredResults = [];

    for (const vendor of baseList) {
        const vName = (vendor.name || '').toLowerCase();
        const vCode = (vendor.code || '').toLowerCase();
        const vOwner = (vendor.owner_name || '').toLowerCase();
        const vCompany = (vendor.company_name || '').toLowerCase();
        const vPhone = (vendor.phone_wa || vendor.phone || '').replace(/\D/g, '');
        const isBeliPutus = vendor.partnership_type === 'BELI_PUTUS';

        let matchedReason = null;
        let matchedProduct = null;
        let score = 0;

        // A. Multi-token vendor identity check (including COD / Beli Putus keyword associative matching)
        const vendorTextPool = `${vName} ${vCode} ${vOwner} ${vCompany} ${isBeliPutus ? 'beli putus cod direct' : 'titipan konsinyasi'}`;
        const allTokensInVendor = tokens.every((token) => vendorTextPool.includes(token));

        if (allTokensInVendor) {
            if (vName === rawQ) {
                score = 100;
            } else if (vName.startsWith(rawQ)) {
                score = 85;
            } else if (vName.includes(rawQ)) {
                score = 70;
            } else if (vCode.includes(rawQ)) {
                score = 65;
            } else if (vOwner.includes(rawQ)) {
                score = 60;
                matchedReason = `PIC: ${vendor.owner_name}`;
            } else {
                score = 50;
            }
        }

        // B. Phone digits check
        if (cleanQueryNum.length >= 3 && vPhone.includes(cleanQueryNum)) {
            score = Math.max(score, 55);
            if (!matchedReason) {
                matchedReason = `Telp: ${vendor.phone_wa || vendor.phone}`;
            }
        }

        // C. Associative Product / Menu search
        if (Array.isArray(vendor.products) && vendor.products.length > 0) {
            for (const prod of vendor.products) {
                const pName = (prod.name || '').toLowerCase();
                const pSku = (prod.sku || '').toLowerCase();
                const prodTextPool = `${pName} ${pSku}`;

                const allTokensInProd = tokens.every((token) => prodTextPool.includes(token));
                if (allTokensInProd) {
                    matchedProduct = prod;
                    const prodScore = pName.startsWith(rawQ) ? 80 : 60;
                    score = Math.max(score, prodScore);
                    matchedReason = `Menu: ${prod.name}`;
                    break;
                }
            }
        }

        if (score > 0) {
            scoredResults.push({
                ...vendor,
                _score: score,
                _matchedReason: matchedReason,
                _matchedProduct: matchedProduct,
            });
        }
    }

    // Sort by relevance score descending
    scoredResults.sort((a, b) => (b._score || 0) - (a._score || 0));

    return scoredResults;
}
