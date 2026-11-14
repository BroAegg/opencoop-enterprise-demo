import React, { useState } from 'react';
import axios from 'axios';
import { Phone, User, GraduationCap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function PosQuickRegisterForm({
    initialQuery = '',
    onSuccess,
    onCancel,
}) {
    // Discern if initial query looks like a phone number or a name
    const isNumeric = /^[0-9+]+$/.test(initialQuery.trim());
    const [phone, setPhone] = useState(isNumeric ? initialQuery.trim() : '');
    const [name, setName] = useState(!isNumeric ? initialQuery.trim() : '');
    const [showStudentFields, setShowStudentFields] = useState(false);
    const [nim, setNim] = useState('');
    const [prodi, setProdi] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setErrorMsg('');

        if (!name.trim()) {
            setErrorMsg('Nama lengkap wajib diisi.');
            return;
        }

        if (!phone.trim() || phone.trim().length < 8) {
            setErrorMsg('Nomor WhatsApp / HP valid wajib diisi (minimal 8 digit).');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axios.post('/kasir/api/members/quick-register', {
                name: name.trim(),
                phone: phone.trim(),
                nim: nim.trim() || null,
                prodi: prodi.trim() || null,
            });

            if (res.data?.success && res.data?.member) {
                onSuccess(res.data.member);
            } else {
                setErrorMsg(res.data?.message || 'Gagal mendaftarkan member.');
            }
        } catch (err) {
            const validationErrors = err.response?.data?.errors;
            if (validationErrors) {
                const first = Object.values(validationErrors)[0];
                setErrorMsg(Array.isArray(first) ? first[0] : first);
            } else {
                setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat pendaftaran.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 pt-1">
            {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                </div>
            )}

            <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        autoFocus={!isNumeric || !phone}
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="081234567890"
                        className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition-all outline-none font-mono"
                    />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Default PIN/Password portal: 6 digit terakhir nomor HP.
                </p>
            </div>

            <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        autoFocus={isNumeric && !!phone}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Aditya Pratama"
                        className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition-all outline-none"
                    />
                </div>
            </div>

            {/* Collapsible Student Fields */}
            <div className="pt-1">
                {!showStudentFields ? (
                    <button
                        type="button"
                        onClick={() => setShowStudentFields(true)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <GraduationCap className="w-4 h-4 text-slate-500" />
                        <span>+ Mahasiswa Kampus? (Isi NIM & Prodi)</span>
                    </button>
                ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5 text-slate-600" />
                                Data Mahasiswa (Opsional)
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowStudentFields(false);
                                    setNim('');
                                    setProdi('');
                                }}
                                className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold"
                            >
                                Sembunyikan
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <input
                                    type="text"
                                    value={nim}
                                    onChange={(e) => setNim(e.target.value)}
                                    placeholder="NIM Mahasiswa"
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none focus:border-slate-900"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    value={prodi}
                                    onChange={(e) => setProdi(e.target.value)}
                                    placeholder="Program Studi"
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-slate-900"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                    Kembali (Esc)
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Mendaftarkan...</span>
                        </>
                    ) : (
                        <>
                            <span>Daftar & Pasang ke Transaksi</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

