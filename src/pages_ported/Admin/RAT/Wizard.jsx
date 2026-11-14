import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/UI/Card';
import FormInput from '@/Components/UI/FormInput';
import Button from '@/Components/UI/Button';
import { Calculator, CheckCircle2, ArrowRight, Save, DollarSign } from 'lucide-react';
import { formatRupiah } from '@/Utils/format';

export default function Wizard({ rat_session, all_sessions }) {
    const [step, setStep] = useState(1);
    
    // Convert 0 to 100 for Cadangan if legacy data has all zeroes
    const legacySisaSum = Number(rat_session?.cadangan_percentage || 0) + Number(rat_session?.pengurus_percentage || 0) + Number(rat_session?.dana_sosial_percentage || 0);
    const defaultCadangan = legacySisaSum === 0 ? 100 : (rat_session?.cadangan_percentage || 0);

    const { data, setData, post, processing, errors } = useForm({
        tahun_buku: rat_session?.tahun_buku || new Date().getFullYear().toString(),
        tanggal_rat: rat_session?.tanggal_rat ? rat_session.tanggal_rat.split('T')[0] : new Date().toISOString().split('T')[0],
        title: rat_session?.title || `RAT Koperasi Tahun Buku ${new Date().getFullYear()}`,
        total_net_profit: rat_session?.total_net_profit || 0,
        total_member_shu: rat_session?.total_member_shu || 0,
        jasa_simpanan_percentage: rat_session?.jasa_simpanan_percentage || 50,
        jasa_usaha_percentage: rat_session?.jasa_usaha_percentage || 50,
        cadangan_percentage: defaultCadangan,
        pengurus_percentage: rat_session?.pengurus_percentage || 0,
        dana_sosial_percentage: rat_session?.dana_sosial_percentage || 0,
    });

    const shuPercentageSum = Number(data.jasa_simpanan_percentage) + Number(data.jasa_usaha_percentage);
    const sisaDana = Number(data.total_net_profit) - Number(data.total_member_shu);
    const sisaPercentageSum = Number(data.cadangan_percentage) + Number(data.pengurus_percentage) + Number(data.dana_sosial_percentage);

    const submit = (e) => {
        e.preventDefault();
        post('/admin/rat/wizard');
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Langkah 1: Informasi Dasar & Nominal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <FormInput 
                                label="Tahun Buku" 
                                value={data.tahun_buku} 
                                onChange={e => setData('tahun_buku', e.target.value)} 
                                error={errors.tahun_buku}
                            />
                            <FormInput 
                                label="Tanggal Pelaksanaan RAT" 
                                type="date" 
                                value={data.tanggal_rat} 
                                onChange={e => setData('tanggal_rat', e.target.value)} 
                                error={errors.tanggal_rat}
                            />
                            <div className="md:col-span-2">
                                <FormInput 
                                    label="Judul Sesi RAT" 
                                    value={data.title} 
                                    onChange={e => setData('title', e.target.value)} 
                                    error={errors.title}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput 
                                label="Total Laba Bersih (Rp)" 
                                type="number" 
                                value={data.total_net_profit} 
                                onChange={e => setData('total_net_profit', e.target.value)} 
                                error={errors.total_net_profit}
                            />
                            <FormInput 
                                label="Alokasi SHU Anggota (Rp)" 
                                type="number" 
                                value={data.total_member_shu} 
                                onChange={e => setData('total_member_shu', e.target.value)} 
                                error={errors.total_member_shu}
                            />
                        </div>
                        
                        <div className="mt-4 p-4 rounded-xl border bg-slate-50 border-slate-200">
                            <p className="text-sm font-medium text-slate-600 mb-1">Sisa Dana (Laba Bersih - SHU Anggota):</p>
                            <p className={`text-xl font-bold ${sisaDana < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                                Rp {sisaDana.toLocaleString('id-ID')}
                            </p>
                            {sisaDana < 0 && <p className="text-xs text-rose-500 mt-1">Error: SHU Anggota tidak boleh melebihi Laba Bersih.</p>}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Langkah 2: Alokasi Sisa Dana</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Tentukan persentase alokasi untuk **Sisa Dana** (Rp {Number(sisaDana).toLocaleString('id-ID')}). Total harus tepat 100%.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormInput 
                                label="Dana Cadangan (%)" 
                                type="number" 
                                value={data.cadangan_percentage} 
                                onChange={e => setData('cadangan_percentage', e.target.value)} 
                                error={errors.cadangan_percentage}
                            />
                            <FormInput 
                                label="Dana Pengurus (%)" 
                                type="number" 
                                value={data.pengurus_percentage} 
                                onChange={e => setData('pengurus_percentage', e.target.value)} 
                                error={errors.pengurus_percentage}
                            />
                            <FormInput 
                                label="Dana Sosial / Pendidikan (%)" 
                                type="number" 
                                value={data.dana_sosial_percentage} 
                                onChange={e => setData('dana_sosial_percentage', e.target.value)} 
                                error={errors.dana_sosial_percentage}
                            />
                        </div>
                        
                        <div className={`mt-4 p-3 rounded-xl border ${sisaPercentageSum === 100 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'} font-bold text-center`}>
                            Total Alokasi Sisa Dana: {sisaPercentageSum}% {sisaPercentageSum !== 100 && '(Harus pas 100%)'}
                        </div>
                        
                        {sisaPercentageSum === 100 && sisaDana > 0 && (
                            <div className="mt-4 space-y-2 pl-4 border-l-2 border-amber-200">
                                <div className="text-sm flex justify-between">
                                    <span className="text-slate-600">Proyeksi Dana Cadangan:</span>
                                    <span className="font-semibold text-slate-800">Rp {(sisaDana * (data.cadangan_percentage / 100)).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="text-sm flex justify-between">
                                    <span className="text-slate-600">Proyeksi Dana Pengurus:</span>
                                    <span className="font-semibold text-slate-800">Rp {(sisaDana * (data.pengurus_percentage / 100)).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="text-sm flex justify-between">
                                    <span className="text-slate-600">Proyeksi Dana Sosial:</span>
                                    <span className="font-semibold text-slate-800">Rp {(sisaDana * (data.dana_sosial_percentage / 100)).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 3:
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Langkah 3: Proporsi SHU Anggota</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Tentukan persentase pembagian dari total **SHU Anggota** (Rp {Number(data.total_member_shu).toLocaleString('id-ID')}). Total harus tepat 100%.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput 
                                label="Jasa Modal / Simpanan (%)" 
                                type="number" 
                                value={data.jasa_simpanan_percentage} 
                                onChange={e => setData('jasa_simpanan_percentage', e.target.value)} 
                                error={errors.jasa_simpanan_percentage}
                            />
                            <FormInput 
                                label="Jasa Usaha / Transaksi (%)" 
                                type="number" 
                                value={data.jasa_usaha_percentage} 
                                onChange={e => setData('jasa_usaha_percentage', e.target.value)} 
                                error={errors.jasa_usaha_percentage}
                            />
                        </div>
                        
                        <div className={`mt-4 p-3 rounded-xl border ${shuPercentageSum === 100 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'} font-bold text-center`}>
                            Total Proporsi SHU Anggota: {shuPercentageSum}% {shuPercentageSum !== 100 && '(Harus pas 100%)'}
                        </div>
                        
                        {shuPercentageSum === 100 && Number(data.total_member_shu) > 0 && (
                            <div className="mt-4 space-y-2 pl-4 border-l-2 border-emerald-200">
                                <div className="text-sm flex justify-between">
                                    <span className="text-slate-600">Proyeksi Jasa Modal (Total Keseluruhan):</span>
                                    <span className="font-semibold text-slate-800">Rp {(Number(data.total_member_shu) * (data.jasa_simpanan_percentage / 100)).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="text-sm flex justify-between">
                                    <span className="text-slate-600">Proyeksi Jasa Usaha (Total Keseluruhan):</span>
                                    <span className="font-semibold text-slate-800">Rp {(Number(data.total_member_shu) * (data.jasa_usaha_percentage / 100)).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 4:
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Review & Konfirmasi</h3>
                            <p className="text-sm text-slate-500">Pastikan angka di bawah ini sudah sesuai dengan hasil Rapat Anggota Tahunan.</p>
                        </div>
                        
                        <div className="space-y-3 bg-slate-50 rounded-xl p-5 border border-slate-100">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                <span className="font-semibold text-slate-600">Total Laba Bersih</span>
                                <span className="font-bold text-slate-900 text-lg">Rp {Number(data.total_net_profit).toLocaleString('id-ID')}</span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-semibold text-amber-700">Sisa Dana (Selain Anggota)</span>
                                <span className="font-bold text-amber-600">Rp {sisaDana.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="pl-4 border-l-2 border-amber-500/20 space-y-1 mt-1 mb-3 text-sm">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>↳ Dana Cadangan ({data.cadangan_percentage}%)</span>
                                    <span>Rp {(sisaDana * (data.cadangan_percentage / 100)).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>↳ Dana Pengurus ({data.pengurus_percentage}%)</span>
                                    <span>Rp {(sisaDana * (data.pengurus_percentage / 100)).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>↳ Dana Sosial ({data.dana_sosial_percentage}%)</span>
                                    <span>Rp {(sisaDana * (data.dana_sosial_percentage / 100)).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2 pb-1 border-t border-slate-200">
                                <span className="font-semibold text-emerald-700">Total SHU Anggota</span>
                                <span className="font-bold text-emerald-600 text-lg">Rp {Number(data.total_member_shu).toLocaleString('id-ID')}</span>
                            </div>
                            
                            <div className="pl-4 border-l-2 border-emerald-500/20 space-y-1 mt-1 text-sm">
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>↳ Porsi Jasa Modal ({data.jasa_simpanan_percentage}%)</span>
                                    <span>Rp {(Number(data.total_member_shu) * (Number(data.jasa_simpanan_percentage) / 100)).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>↳ Porsi Jasa Usaha ({data.jasa_usaha_percentage}%)</span>
                                    <span>Rp {(Number(data.total_member_shu) * (Number(data.jasa_usaha_percentage) / 100)).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-sm">
                                Terdapat error validasi. Mohon periksa kembali input Anda di langkah sebelumnya.
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AdminLayout backUrl="/admin/rat" pageTitle={`Wizard RAT - Tahun Buku ${data.tahun_buku}`}>
            <Head title="Wizard Pembagian SHU" />
            
            <div className="max-w-3xl mx-auto">
                {/* Stepper Header */}
                <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col items-center flex-1 relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 
                                ${step >= i ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-slate-200 text-slate-500'}
                                transition-all duration-300
                            `}>
                                {i}
                            </div>
                            {i < 4 && (
                                <div className={`absolute top-5 left-1/2 w-full h-1 -translate-y-1/2 
                                    ${step > i ? 'bg-primary' : 'bg-slate-200'}
                                `}></div>
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={submit}>
                    <Card className="shadow-sm">
                        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                            <h2 className="font-bold text-slate-700 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-primary" /> 
                                {step === 1 && "Input Nominal"}
                                {step === 2 && "Alokasi Sisa Dana"}
                                {step === 3 && "Proporsi Jasa Anggota"}
                                {step === 4 && "Konfirmasi Akhir"}
                            </h2>
                        </div>
                        
                        <div className="p-6">
                            {renderStepContent()}
                        </div>

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between rounded-b-2xl">
                            <Button 
                                type="button"
                                variant="secondary" 
                                disabled={step === 1 || processing}
                                onClick={() => setStep(step - 1)}
                            >
                                Kembali
                            </Button>
                            
                            {step < 4 ? (
                                <Button 
                                    type="button"
                                    variant="primary"
                                    disabled={
                                        (step === 1 && sisaDana < 0) || 
                                        (step === 2 && sisaPercentageSum !== 100) ||
                                        (step === 3 && shuPercentageSum !== 100)
                                    }
                                    onClick={() => setStep(step + 1)}
                                >
                                    Lanjut <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            ) : (
                                <Button 
                                    type="submit"
                                    variant="primary"
                                    disabled={processing || shuPercentageSum !== 100 || sisaPercentageSum !== 100 || sisaDana < 0}
                                >
                                    <Save className="w-4 h-4 mr-2" /> Simpan Konfigurasi
                                </Button>
                            )}
                        </div>
                    </Card>
                </form>
            </div>
        </AdminLayout>
    );
}

