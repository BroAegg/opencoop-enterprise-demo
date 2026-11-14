import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserCheck, X, UserPlus, ArrowLeft } from 'lucide-react';
import Avatar from '@/Components/UI/Avatar';
import PosQuickRegisterForm from './PosQuickRegisterForm';
import PosMemberList from './PosMemberList';

export default function PosMemberModal({
    isOpen = false,
    onClose,
    memberQuery = '',
    setMemberQuery,
    memberResults = [],
    isSearchingMember = false,
    onSelectMember,
    currentUser = null,
}) {
    const [viewMode, setViewMode] = useState('SEARCH'); // 'SEARCH' | 'REGISTER'
    const [registerInitialQuery, setRegisterInitialQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setViewMode('SEARCH');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [memberResults]);

    // In-modal hotkeys: F7 to toggle quick-register, Escape to step back to SEARCH
    useEffect(() => {
        if (!isOpen) return;

        const handleModalKey = (e) => {
            if (e.key === 'F7') {
                e.preventDefault();
                if (viewMode === 'SEARCH') {
                    setRegisterInitialQuery(memberQuery);
                    setViewMode('REGISTER');
                } else {
                    setViewMode('SEARCH');
                }
            } else if (e.key === 'Escape' && viewMode === 'REGISTER') {
                e.preventDefault();
                e.stopPropagation();
                setViewMode('SEARCH');
            }
        };

        window.addEventListener('keydown', handleModalKey, true);
        return () => window.removeEventListener('keydown', handleModalKey, true);
    }, [isOpen, viewMode, memberQuery]);

    if (!isOpen) return null;

    const switchToRegister = (query = '') => {
        setRegisterInitialQuery(query || memberQuery);
        setViewMode('REGISTER');
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: -15 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.95, opacity: 0, y: -15 }}
                    className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
                >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                        <div className="flex items-center gap-2">
                            {viewMode === 'REGISTER' ? (
                                <button
                                    type="button"
                                    onClick={() => setViewMode('SEARCH')}
                                    className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center mr-0.5 cursor-pointer transition-colors"
                                    title="Kembali ke Pencarian (Esc)"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                            ) : (
                                <UserCheck className="w-5 h-5 text-slate-700" />
                            )}
                            <h3 className="font-bold text-slate-900 text-base">
                                {viewMode === 'REGISTER' ? 'Daftar Member Kilat' : 'Identifikasi Member'}
                            </h3>
                        </div>

                        <div className="flex items-center gap-1.5">
                            {viewMode === 'SEARCH' ? (
                                <button
                                    type="button"
                                    onClick={() => switchToRegister()}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-all shadow-2xs active:scale-95"
                                    title="Daftar Member Baru Kilat (F7)"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span>+ Baru</span>
                                    <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded font-mono">F7</span>
                                </button>
                            ) : null}

                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer flex items-center justify-center"
                                title="Tutup (Esc)"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-4 sm:p-5">
                        {viewMode === 'REGISTER' ? (
                            <PosQuickRegisterForm
                                initialQuery={registerInitialQuery}
                                onSuccess={(member) => onSelectMember(member)}
                                onCancel={() => setViewMode('SEARCH')}
                            />
                        ) : (
                            <div className="flex flex-col gap-3">
                                {currentUser && (
                                    <div className="flex items-center justify-between pb-1">
                                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Akses Cepat</span>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    const res = await axios.get(`/kasir/api/members/search?id=${currentUser.id}`);
                                                    if (res.data && res.data[0]) {
                                                        onSelectMember(res.data[0]);
                                                        return;
                                                    }
                                                } catch {
                                                    // Fallback
                                                }
                                                onSelectMember({
                                                    id: currentUser.id,
                                                    name: currentUser.name,
                                                    id_number: currentUser.member_number || currentUser.nip_nbm || currentUser.id_number || 'KASIR',
                                                    member_number: currentUser.member_number,
                                                    role: currentUser.role,
                                                    is_employee: true,
                                                    points: currentUser.points || 0,
                                                    saldo_sukarela: currentUser.saldo_sukarela || 0,
                                                });
                                            }}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-all border border-slate-200 cursor-pointer active:scale-95"
                                        >
                                            <Avatar name={currentUser.name} photo={currentUser.photo} size="xs" shape="rounded-md" />
                                            <span>Saya Sendiri ({currentUser.name})</span>
                                        </button>
                                    </div>
                                )}

                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        autoFocus
                                        type="text"
                                        value={memberQuery}
                                        onChange={e => setMemberQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'ArrowDown') {
                                                e.preventDefault();
                                                setSelectedIndex(prev => Math.min(prev + 1, Math.max(0, memberResults.length - 1)));
                                            } else if (e.key === 'ArrowUp') {
                                                e.preventDefault();
                                                setSelectedIndex(prev => Math.max(prev - 1, 0));
                                            } else if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (memberResults[selectedIndex]) {
                                                    onSelectMember(memberResults[selectedIndex]);
                                                } else if (memberQuery.length > 1 && memberResults.length === 0) {
                                                    switchToRegister(memberQuery);
                                                }
                                            }
                                        }}
                                        placeholder="Scan QR / ketik HP / NIM / nama..."
                                        className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-sm font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition-all outline-none"
                                    />
                                    {isSearchingMember && (
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                                    )}
                                </div>

                                <PosMemberList
                                    memberResults={memberResults}
                                    selectedIndex={selectedIndex}
                                    onSelectMember={onSelectMember}
                                    memberQuery={memberQuery}
                                    isSearchingMember={isSearchingMember}
                                    onQuickRegisterClick={() => switchToRegister(memberQuery)}
                                />

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                    <span>Tekan <kbd className="font-mono font-bold text-slate-600">Esc</kbd> tutup</span>
                                    <span><kbd className="font-mono font-bold text-slate-600">F7</kbd> Daftar Kilat</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
