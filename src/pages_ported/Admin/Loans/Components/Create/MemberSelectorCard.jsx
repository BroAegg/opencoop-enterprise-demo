import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, Search, Check, AlertCircle, RefreshCw, Briefcase, CreditCard, Info } from 'lucide-react';
import TactileCard from '@/Components/UI/TactileCard';

export default function MemberSelectorCard({
    members = [],
    selectedMemberId,
    onSelectMember,
    activeLoans = {},
    error,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedMember = useMemo(() => {
        return members.find((m) => String(m.id) === String(selectedMemberId)) || null;
    }, [members, selectedMemberId]);

    const joinDate = selectedMember?.join_date || selectedMember?.created_at;
    const isNewMember = useMemo(() => {
        if (!joinDate) return false;
        const join = new Date(joinDate);
        const now = new Date();
        const diffMonths = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
        return diffMonths < 6;
    }, [joinDate]);

    const memberActiveLoans = useMemo(() => {
        return selectedMemberId && activeLoans[selectedMemberId] ? activeLoans[selectedMemberId] : [];
    }, [selectedMemberId, activeLoans]);

    const totalActiveOutstanding = useMemo(() => {
        return memberActiveLoans.reduce((sum, l) => sum + Number(l.remaining_amount || 0), 0);
    }, [memberActiveLoans]);

    const filteredMembers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return members.slice(0, 10);
        return members
            .filter((m) => {
                const name = (m.name || '').toLowerCase();
                const num = (m.member_number || '').toLowerCase();
                const unit = (m.unit_kerja || '').toLowerCase();
                return name.includes(query) || num.includes(query) || unit.includes(query);
            })
            .slice(0, 12);
    }, [members, searchQuery]);

    const handleSelect = (member) => {
        onSelectMember(member.id);
        setIsDropdownOpen(false);
        setSearchQuery('');
    };

    const handleClear = () => {
        onSelectMember('');
        setIsDropdownOpen(true);
    };

    return (
        <TactileCard variant="white" rounded="3xl" overflow="visible" className="p-5 sm:p-6 relative z-30">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div>
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                        1. Peminjam &amp; Konteks Anggota
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Pilih anggota aktif untuk memeriksa riwayat pinjaman &amp; kelayakan.
                    </p>
                </div>
            </div>

            {!selectedMember ? (
                <div ref={dropdownRef} className="relative">
                    <label className="text-[12px] font-semibold text-slate-700 block mb-1.5">
                        Cari Nama / Nomor Anggota <span className="text-rose-500">*</span>
                    </label>

                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsDropdownOpen(true);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            placeholder="Ketik nama atau nomor anggota (cth: Ahmad, 26000013)..."
                            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200/90 rounded-2xl text-[13px] font-medium text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.03)] transition-all"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>

                    {error && <p className="text-[11px] text-rose-600 font-medium mt-1.5">{error}</p>}

                    {isDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-64 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map((m) => {
                                    const hasLoan = activeLoans[m.id]?.length > 0;
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => handleSelect(m)}
                                            className="w-full px-4 py-3 text-left hover:bg-teal-50/50 flex items-center justify-between transition-colors group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-teal-100 text-slate-600 group-hover:text-teal-700 font-bold text-xs flex items-center justify-center shrink-0 transition-colors">
                                                    {(m.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                                                        {m.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[11px] font-mono text-slate-500">
                                                            {m.member_number || '-'}
                                                        </span>
                                                        {m.unit_kerja && (
                                                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                                                {m.unit_kerja}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {hasLoan && (
                                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <CreditCard className="w-3 h-3" />
                                                    Ada Utang
                                                </span>
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-6 text-center text-xs text-slate-400">
                                    Tidak ada anggota yang cocok dengan kata kunci "{searchQuery}"
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-[inset_0_1px_0_white] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white font-bold text-base flex items-center justify-center shadow-sm shrink-0">
                                {(selectedMember.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">
                                    {selectedMember.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white border border-slate-200/80 px-2 py-0.5 rounded-lg shadow-2xs">
                                        {selectedMember.member_number}
                                    </span>
                                    {selectedMember.unit_kerja && (
                                        <span className="text-[11px] text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                            <Briefcase className="w-3 h-3 text-slate-400" />
                                            {selectedMember.unit_kerja}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Ganti Anggota
                        </button>
                    </div>

                    {isNewMember && (
                        <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200/80 text-sky-900 flex items-center gap-2.5 text-xs">
                            <Info className="w-4 h-4 text-sky-600 shrink-0" />
                            <span>Masa keanggotaan baru &lt; 6 bulan (kebijakan AD/ART poin 5). Pastikan telah memperoleh dispensasi/persetujuan pengurus.</span>
                        </div>
                    )}

                    {memberActiveLoans.length > 0 ? (
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300/40 text-amber-900 flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <p className="font-semibold text-amber-900">
                                    Anggota memiliki {memberActiveLoans.length} pembiayaan berjalan
                                </p>
                                <p className="text-amber-800/90 mt-0.5">
                                    Total sisa outstanding:{' '}
                                    <span className="font-mono font-bold">
                                        Rp {totalActiveOutstanding.toLocaleString('id-ID')}
                                    </span>
                                    . Anda dapat mengaktifkan opsi <strong>Top-Up / Pelunasan Otomatis</strong> di bawah.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-300/40 text-emerald-900 flex items-center gap-2.5 text-xs">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Anggota bersih dari pinjaman aktif. Plafon dapat dicairkan penuh.</span>
                        </div>
                    )}
                </div>
            )}
        </TactileCard>
    );
}

