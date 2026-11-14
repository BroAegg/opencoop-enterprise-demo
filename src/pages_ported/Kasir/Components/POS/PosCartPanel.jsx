import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, X, Plus, Minus, UserPlus, PauseCircle, Ban, CreditCard, Store } from 'lucide-react';
import Avatar from '@/Components/UI/Avatar';

export default function PosCartPanel({
    cart = [],
    selectedMember = null,
    onOpenMemberModal,
    onRemoveMember,
    onUpdateQty,
    onUpdateModifier,
    onRemoveItem,
    onHoldOrder,
    onClearCart,
    onOpenPayment,
    onOpenInternalUse,
}) {
    const totalAmount = cart.reduce((sum, item) => {
        const modPrice = Number(item.selected_modifier?.price || 0);
        return sum + ((Number(item.selling_price || 0) + modPrice) * item.qty);
    }, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    return (
        <div className="w-full md:w-[350px] lg:w-[400px] xl:w-[450px] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col shrink-0 overflow-hidden relative">
            {/* Member Selection Header Strip (Apple HIG Quiet Authority) */}
            <div className={`p-3 sm:p-3.5 border-b border-slate-100 flex items-center justify-between transition-colors ${selectedMember ? 'bg-slate-50/90' : 'bg-white'}`}>
                {selectedMember ? (
                    <div className="flex items-center gap-2.5 w-full">
                        <Avatar
                            name={selectedMember.name}
                            photo={selectedMember.photo}
                            size="sm"
                            shape="rounded-xl"
                            variant="light"
                        />
                        <div className="flex-1 overflow-hidden min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate tracking-tight">{selectedMember.name}</p>
                            <div className="flex items-center gap-1.5 text-[11px] font-mono font-tabular text-slate-500 mt-0.5 truncate">
                                <span>{selectedMember.id_number || selectedMember.member_number || selectedMember.nip_nbm || '-'}</span>
                                {selectedMember.saldo_sukarela !== undefined && (
                                    <>
                                        <span className="text-slate-300">·</span>
                                        <span className="font-semibold text-slate-800 inline-flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                            <span>Rp {Number(selectedMember.saldo_sukarela || 0).toLocaleString('id-ID')}</span>
                                        </span>
                                    </>
                                )}
                                {selectedMember.points > 0 && (
                                    <>
                                        <span className="text-slate-300">·</span>
                                        <span className="text-slate-600 font-medium">
                                            {selectedMember.points} pt
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={onRemoveMember} 
                            className="w-7 h-7 rounded-full bg-slate-200/70 hover:bg-slate-300/80 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                            title="Hapus Member"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <button 
                        type="button"
                        onClick={onOpenMemberModal}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-xs sm:text-sm transition-all w-full p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 hover:border-slate-300 justify-center border-dashed cursor-pointer active:scale-[0.99]"
                    >
                        <UserPlus className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                        <span>Identifikasi Member</span>
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">F3</kbd>
                    </button>
                )}
            </div>

            {/* Cart Items List: Apple HIG Inset Grouped Table (52px Density) */}
            <div className="flex-1 overflow-y-auto bg-white divide-y divide-slate-100 custom-scrollbar">
                <AnimatePresence>
                    {cart.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center text-slate-400 italic gap-3 py-16"
                        >
                            <ShoppingCart className="w-12 h-12 opacity-20" strokeWidth={1.5} />
                            <span className="text-sm font-medium text-slate-400">Keranjang masih kosong.</span>
                            <span className="text-xs text-slate-400">Scan barcode atau ketik SKU produk.</span>
                        </motion.div>
                    ) : (
                        cart.map((item, index) => {
                            const isLastItem = index === cart.length - 1;
                            const itemKey = item.cart_key || item.id;
                            const modPrice = Number(item.selected_modifier?.price || 0);
                            const unitPrice = Number(item.selling_price || 0) + modPrice;
                            const itemSubtotal = unitPrice * item.qty;

                            return (
                                <motion.div 
                                    key={itemKey}
                                    layout
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                    transition={{ duration: 0.15 }}
                                    className={`px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2.5 transition-colors ${
                                        isLastItem 
                                            ? 'bg-slate-50/90 border-l-2 border-slate-900' 
                                            : 'bg-white hover:bg-slate-50/60'
                                    }`}
                                >
                                    {/* SISI KIRI: Inline Micro-Stepper Taktil */}
                                    <div className="flex items-center bg-slate-100/90 rounded-lg p-0.5 border border-slate-200/60 shrink-0">
                                        <button 
                                            type="button"
                                            onClick={() => onUpdateQty(itemKey, -1)} 
                                            className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-slate-200/70 text-slate-700 shadow-2xs active:scale-90 transition-all cursor-pointer"
                                            title="Kurangi 1"
                                            aria-label={`Kurangi 1 ${item.name}`}
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="w-7 text-center font-bold font-mono text-xs text-slate-900 select-none tabular-nums">
                                            {item.qty}
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => onUpdateQty(itemKey, 1)} 
                                            className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-slate-200/70 text-slate-900 shadow-2xs active:scale-90 transition-all cursor-pointer font-bold"
                                            title="Tambah 1"
                                            aria-label={`Tambah 1 ${item.name}`}
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* SISI TENGAH: Nama Produk & Metadata */}
                                    <div className="flex-1 min-w-0 pr-1">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="font-bold text-slate-900 text-xs sm:text-[13px] leading-tight truncate">
                                                {item.name}
                                            </h4>
                                            {isLastItem && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-900 text-white shrink-0 font-mono">
                                                    Baru
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-mono mt-0.5 truncate">
                                            <span>@ Rp {unitPrice.toLocaleString('id-ID')}</span>
                                            {item.supplier && (
                                                <>
                                                    <span className="text-slate-300">·</span>
                                                    <span className="text-slate-400 truncate max-w-[130px]">
                                                        {item.supplier.company_name || item.supplier.name}
                                                    </span>
                                                </>
                                            )}
                                            {modPrice > 0 && (
                                                <>
                                                    <span className="text-slate-300">·</span>
                                                    <span className="text-slate-700 font-semibold truncate">
                                                        {item.selected_modifier?.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* Modifiers (jika produk memiliki opsi modifikasi) */}
                                        {item.modifiers && item.modifiers.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-1.5">
                                                {item.modifiers.map(mod => {
                                                    const isSelected = item.selected_modifier?.id === mod.id;
                                                    return (
                                                        <button
                                                            key={mod.id}
                                                            type="button"
                                                            onClick={() => onUpdateModifier?.(itemKey, mod)}
                                                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                                                                isSelected
                                                                    ? 'bg-slate-900 text-white shadow-2xs'
                                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                                                            }`}
                                                        >
                                                            <span>{mod.name}</span>
                                                            {Number(mod.price) > 0 && (
                                                                <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>
                                                                    (+Rp {Number(mod.price).toLocaleString('id-ID')})
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* SISI KANAN: Subtotal Tabular & Quiet Delete */}
                                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 text-right">
                                        <span className="font-mono font-bold text-xs sm:text-[13px] text-slate-900 tracking-tight tabular-nums min-w-[65px]">
                                            Rp {itemSubtotal.toLocaleString('id-ID')}
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => onRemoveItem(itemKey)} 
                                            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                            title="Hapus Item"
                                            aria-label={`Hapus ${item.name}`}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

             {/* Hold, Store Expense & Clear Actions (Apple HIG 42px touch target) */}
             <div className="px-3 sm:px-4 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                 <button 
                     type="button"
                     disabled={cart.length === 0}
                     onClick={() => onHoldOrder?.()}
                     className="flex-1 h-10 px-2 sm:px-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-xs disabled:opacity-40 disabled:pointer-events-none border border-slate-200/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                     title="Parkir Transaksi (F4)"
                 >
                     <PauseCircle className="w-4 h-4 text-slate-500 shrink-0" />
                     <span>Parkir</span>
                     <kbd className="hidden sm:inline-block px-1 text-[10px] font-mono bg-white text-slate-600 rounded border border-slate-200">F4</kbd>
                 </button>

                 <button 
                     type="button"
                     disabled={cart.length === 0}
                     onClick={() => onOpenInternalUse?.()}
                     className="flex-1 h-10 px-2 sm:px-3 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl font-bold text-xs disabled:opacity-40 disabled:pointer-events-none border border-slate-200/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                     title="Pemakaian Operasional Toko / Beban Toko at HPP (F10)"
                 >
                     <Store className="w-4 h-4 text-slate-500 shrink-0" />
                     <span>Toko</span>
                     <kbd className="hidden sm:inline-block px-1 text-[10px] font-mono bg-white text-slate-600 rounded border border-slate-200">F10</kbd>
                 </button>

                 <button 
                     type="button"
                     disabled={cart.length === 0}
                     onClick={() => onClearCart?.()}
                     className="flex-1 h-10 px-2 sm:px-3 text-slate-700 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 rounded-xl font-bold text-xs disabled:opacity-40 disabled:pointer-events-none border border-slate-200/80 hover:border-rose-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                     title="Kosongkan Seluruh Keranjang (Shift+Del)"
                 >
                     <Ban className="w-4 h-4 text-slate-400 hover:text-rose-600 shrink-0" />
                     <span>Kosongkan</span>
                     <kbd className="hidden sm:inline-block px-1 text-[10px] font-mono bg-white text-slate-600 rounded border border-slate-200">Shift+Del</kbd>
                 </button>
             </div>

             {/* Payment Section (Apple HIG High-Signal Authoritative Panel) */}
             <div className="p-4 sm:p-5 bg-white border-t border-slate-200 shadow-sm flex flex-col gap-3">
                 <div className="flex justify-between items-baseline pt-0.5">
                     <div>
                         <span className="text-slate-500 font-bold text-xs uppercase tracking-wider block">Total Tagihan</span>
                         <span className="text-[11px] text-slate-400 font-tabular font-medium">{totalItems} barang</span>
                     </div>
                     <span className="text-2xl sm:text-3xl font-black font-tabular text-slate-900 tracking-tight">
                         Rp {totalAmount.toLocaleString('id-ID')}
                     </span>
                 </div>
                 
                 <button 
                     type="button" 
                     disabled={cart.length === 0}
                     onClick={() => onOpenPayment?.()}
                     className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white py-4 rounded-2xl text-base font-black shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer tracking-wide"
                 >
                     <CreditCard className="w-5 h-5 text-slate-300" />
                     <span>BAYAR SEKARANG</span>
                     <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono font-bold bg-white/20 text-white rounded border border-white/20">
                         Space / F1
                     </kbd>
                 </button>
             </div>
        </div>
    );
}

