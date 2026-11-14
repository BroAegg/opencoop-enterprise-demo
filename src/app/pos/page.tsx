'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  WifiOff, 
  Wifi, 
  Barcode, 
  CreditCard, 
  Banknote, 
  QrCode, 
  RotateCcw,
  User,
  CheckCircle2
} from 'lucide-react';
import { Product, CartItem, OfflineTransaction, Member } from '@/lib/types';
import { 
  initDb, 
  getProductsFromDb, 
  enqueueOfflineTransaction, 
  decrementStockInDb 
} from '@/lib/indexedDb';
import { INITIAL_MEMBERS } from '@/lib/dummyData';
import ReceiptModal from '@/components/ReceiptModal';

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'QRIS' | 'POTONG_GAJI'>('TUNAI');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [isOffline, setIsOffline] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<OfflineTransaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Load IndexedDB Catalog on Mount
  useEffect(() => {
    async function loadCatalog() {
      const prods = await initDb();
      setProducts(prods);
    }
    loadCatalog();

    // Listen to network status change from Navbar toggle
    const handleNetworkChange = (e: any) => {
      setIsOffline(e.detail.isOffline);
    };
    window.addEventListener('network-status-change', handleNetworkChange);
    return () => window.removeEventListener('network-status-change', handleNetworkChange);
  }, []);

  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Stok barang habis!');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('Jumlah melebihi stok yang tersedia di rak!');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              alert('Jumlah melebihi batas stok!');
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((acc, item) => acc + item.product.sellPrice * item.quantity, 0);

  // Auto-fill cash tendered if payment is not cash
  useEffect(() => {
    if (paymentMethod !== 'TUNAI') {
      setCashTendered(subtotal);
    } else if (cashTendered < subtotal) {
      setCashTendered(subtotal);
    }
  }, [subtotal, paymentMethod]);

  const changeDue = Math.max(0, cashTendered - subtotal);

  // Handle Checkout (Handles both Online and Offline-First with IndexedDB)
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong!');
      return;
    }
    if (paymentMethod === 'TUNAI' && cashTendered < subtotal) {
      alert('Uang tunai yang diterima kurang!');
      return;
    }

    const clientUuid = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'uuid-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = isOffline ? `OFF-${dateStr}-${randSuffix}` : `INV-${dateStr}-${randSuffix}`;

    const memberObj = INITIAL_MEMBERS.find((m) => m.id === selectedMember);

    const transactionPayload: OfflineTransaction = {
      client_uuid: clientUuid,
      invoice_number: invoiceNumber,
      cashier_name: 'Ahmad Kasir (Shift 1)',
      items: cart.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        sell_price: item.product.sellPrice,
        subtotal: item.product.sellPrice * item.quantity,
      })),
      total_amount: subtotal,
      payment_method: paymentMethod,
      cash_tendered: cashTendered,
      change_due: changeDue,
      created_at: now.toISOString(),
      status: isOffline ? 'PENDING_SYNC' : 'SYNCED',
      member_id: memberObj?.id,
      member_name: memberObj?.name,
    };

    if (isOffline) {
      // 100% OFFLINE-FIRST: Enqueue to IndexedDB & decrement local product cache
      await enqueueOfflineTransaction(transactionPayload);
    } else {
      // Direct Server Sync
      await decrementStockInDb(cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity })));
      try {
        await fetch('/api/pos/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions: [transactionPayload] }),
        });
      } catch (e) {
        console.warn('API error, saving to local outbox instead');
        await enqueueOfflineTransaction({ ...transactionPayload, status: 'PENDING_SYNC' });
      }
    }

    // Refresh local product list
    const updated = await getProductsFromDb();
    setProducts(updated);

    // Open receipt modal
    setCompletedTransaction(transactionPayload);
    setIsReceiptOpen(true);
    clearCart();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining Offline-First mechanism */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
        isOffline 
          ? 'bg-rose-50 border-rose-200 text-rose-900' 
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center gap-2.5">
          {isOffline ? (
            <div className="w-8 h-8 rounded-lg bg-rose-200 text-rose-700 flex items-center justify-center font-bold">
              <WifiOff className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
              <Wifi className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="font-bold">
              {isOffline ? 'MODE OFFLINE-FIRST AKTIF (Simulasi Jaringan Terputus)' : 'Koneksi Server Online'}
            </div>
            <div className="text-[11px] opacity-80">
              {isOffline 
                ? 'Transaksi kasir disimpan langsung ke IndexedDB lokal browser (outbox_transactions) dan stok lokal langsung dipotong.' 
                : 'Transaksi langsung divalidasi dan dicatat ke General Ledger secara real-time.'}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            const nextState = !isOffline;
            setIsOffline(nextState);
            window.dispatchEvent(new CustomEvent('network-status-change', { detail: { isOffline: nextState } }));
          }}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors ${
            isOffline ? 'bg-rose-700 hover:bg-rose-800 text-white' : 'bg-emerald-700 hover:bg-emerald-800 text-white'
          }`}
        >
          {isOffline ? 'Kembalikan ke Mode Online' : 'Uji Mode Offline Kasir'}
        </button>
      </div>

      {/* POS Grid: Catalog on Left (8 cols) & Cart on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Product Catalog */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Search Bar & Quick Category Chips */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama produk, kode SKU, atau scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const inCart = cart.find((i) => i.product.id === product.id)?.quantity || 0;
              const isLowStock = product.stock <= product.minStock;

              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[10px] font-mono font-semibold text-slate-400">
                        {product.sku}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        product.stock === 0 
                          ? 'bg-rose-100 text-rose-700' 
                          : isLowStock 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        Stok: {product.stock}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                      {product.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="font-extrabold text-xs text-slate-900">
                      Rp {product.sellPrice.toLocaleString('id-ID')}
                    </div>
                    {inCart > 0 && (
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center">
                        {inCart}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Checkout Cart & Payment */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[520px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900">Pesanan Kasir</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Bersihkan
                </button>
              )}
            </div>

            {/* Member Identification (Optional) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Pilih Anggota (Bagi Hasil SHU)
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">-- Non-Anggota / Umum --</option>
                {INITIAL_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.memberNumber} - {m.name} ({m.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Belum ada produk yang dipilih
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 max-w-[140px]">
                      <div className="font-semibold text-slate-900 truncate">{item.product.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Rp {item.product.sellPrice.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-slate-900 min-w-[65px] text-right">
                        Rp {(item.product.sellPrice * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment & Checkout Section */}
          <div className="pt-4 border-t border-slate-200 space-y-3 mt-4">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                onClick={() => setPaymentMethod('TUNAI')}
                className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 border transition-colors ${
                  paymentMethod === 'TUNAI'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" /> Tunai
              </button>
              <button
                onClick={() => setPaymentMethod('QRIS')}
                className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 border transition-colors ${
                  paymentMethod === 'QRIS'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> QRIS
              </button>
              <button
                onClick={() => setPaymentMethod('POTONG_GAJI')}
                className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1 border transition-colors ${
                  paymentMethod === 'POTONG_GAJI'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Gaji
              </button>
            </div>

            {/* Cash Input */}
            {paymentMethod === 'TUNAI' && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Uang Diterima:</span>
                  <div className="flex gap-1">
                    {[50000, 100000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setCashTendered(amt)}
                        className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-semibold hover:bg-slate-200"
                      >
                        Rp {amt / 1000}k
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  value={cashTendered || ''}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-right focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            )}

            {/* Subtotal & Change Due */}
            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {paymentMethod === 'TUNAI' && (
                <div className="flex justify-between font-medium text-emerald-700">
                  <span>Kembalian:</span>
                  <span>Rp {changeDue.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-100">
                <span>TOTAL:</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-xl font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all ${
                cart.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isOffline
                  ? 'bg-rose-700 hover:bg-rose-800 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>SIMPAN KE INDEXEDDB OFFLINE</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SELESAIKAN PEMBAYARAN & CETAK</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Printable Thermal Receipt Modal */}
      <ReceiptModal
        transaction={completedTransaction}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
}
