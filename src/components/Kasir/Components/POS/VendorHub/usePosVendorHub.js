import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from '@/Components/UI/Toast';

/**
 * usePosVendorHub
 * 
 * Root coordinator hook for POS Kasir Vendor Dual-Workspace (F9).
 * Implements Master-Detail on-demand loading, client-side caching, and zero-latency switching.
 */
export default function usePosVendorHub({
    isOpen = false,
    onClose,
    onSuccess,
}) {
    // 1. Loading & General State
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingBatches, setIsLoadingBatches] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [selectedVendorId, setSelectedVendorId] = useState(null);
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [batchesCache, setBatchesCache] = useState({});

    // Keep ref to selectedVendorId so fetchConsignmentData has a stable identity
    const selectedVendorIdRef = useRef(selectedVendorId);
    useEffect(() => {
        selectedVendorIdRef.current = selectedVendorId;
    }, [selectedVendorId]);

    // 2. Live Shift & Cash Drawer Data
    const [shiftData, setShiftData] = useState(null);
    const availableCash = Number(shiftData?.available_cash ?? shiftData?.metrics?.current_cash ?? 0);

    // Fetch consignment daily directory data (Lightweight Master List)
    const fetchConsignmentData = useCallback(async (keepSelection = false) => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const res = await axios.get('/kasir/api/consignment/daily?all=1', { timeout: 30000 });
            const data = res.data || {};
            const supList = Array.isArray(data.suppliers) ? data.suppliers : [];
            setSuppliers(supList);

            if (data.shift) {
                setShiftData(data.shift);
            }

            const currentId = selectedVendorIdRef.current;
            if (keepSelection && currentId) {
                // Invalidate cache for selected vendor to fetch fresh batches
                setBatchesCache((prev) => {
                    const next = { ...prev };
                    delete next[currentId];
                    return next;
                });
            } else if (!keepSelection) {
                setSelectedVendorId(null);
            }
        } catch (err) {
            console.error('Failed to load consignment daily data:', err);
            setErrorMsg(err.response?.data?.message || 'Gagal memuat data titipan harian.');
            toast.error('Gagal memuat data titipan harian.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // On-demand fetch batches for the selected vendor (Detail Lazy Loading)
    const cachedBatches = batchesCache[selectedVendorId];
    useEffect(() => {
        if (!isOpen || !selectedVendorId) return;

        if (cachedBatches) {
            return;
        }

        let isMounted = true;
        const fetchBatches = async () => {
            setIsLoadingBatches(true);
            try {
                const res = await axios.get(`/kasir/api/consignment/suppliers/${selectedVendorId}/batches`, { timeout: 20000 });
                if (isMounted && res.data?.batches) {
                    setBatchesCache((prev) => ({
                        ...prev,
                        [selectedVendorId]: res.data.batches,
                    }));
                }
            } catch (err) {
                console.error(`Failed to load batches for supplier ${selectedVendorId}:`, err);
            } finally {
                if (isMounted) setIsLoadingBatches(false);
            }
        };

        fetchBatches();

        return () => {
            isMounted = false;
        };
    }, [isOpen, selectedVendorId, cachedBatches]);

    // Refresh current shift live cash
    const refreshShift = useCallback(async () => {
        try {
            const res = await axios.get('/kasir/api/shift/current');
            if (res.data?.shift) {
                setShiftData({
                    ...res.data.shift,
                    metrics: res.data.metrics,
                    available_cash: res.data.metrics?.current_cash ?? 0,
                });
            }
        } catch (err) {
            console.error('Failed to refresh shift:', err);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchConsignmentData();
        }
    }, [isOpen, fetchConsignmentData]);

    // Selected vendor entity
    const selectedVendor = useMemo(() => {
        return suppliers.find((s) => s.id === selectedVendorId) || null;
    }, [suppliers, selectedVendorId]);

    // Registered products of selected vendor (guaranteed Array)
    const vendorProducts = useMemo(() => {
        const raw = selectedVendor?.products;
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === 'object') return Object.values(raw);
        return [];
    }, [selectedVendor]);

    // Batches for selected vendor (from on-demand cache or vendor entity, guaranteed Array)
    const vendorBatches = useMemo(() => {
        if (!selectedVendorId) return [];
        const raw = batchesCache[selectedVendorId] || selectedVendor?.batches;
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === 'object') return Object.values(raw);
        return [];
    }, [selectedVendorId, batchesCache, selectedVendor]);

    // Active batch for physical reconciliation (defaults to active today or latest unpaid)
    const activeBatch = useMemo(() => {
        if (vendorBatches.length === 0) return null;
        if (selectedBatchId) {
            return vendorBatches.find((b) => b.receiving_id === selectedBatchId) || vendorBatches[0];
        }
        return (
            vendorBatches.find((b) => b.badge_status === 'ACTIVE_TODAY') ||
            vendorBatches.find((b) => b.settlement_status === 'UNPAID') ||
            vendorBatches[0]
        );
    }, [vendorBatches, selectedBatchId]);

    return {
        isLoading,
        isLoadingBatches,
        errorMsg,
        suppliers,
        selectedVendorId,
        setSelectedVendorId,
        selectedVendor,
        vendorProducts,
        vendorBatches,
        activeBatch,
        selectedBatchId,
        setSelectedBatchId,
        fetchConsignmentData,
        refreshShift,
        availableCash,
        onSuccess,
    };
}
