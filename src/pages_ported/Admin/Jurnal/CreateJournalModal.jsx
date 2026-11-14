import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/UI/Modal';
import FormInput from '@/Components/UI/FormInput';
import Button from '@/Components/UI/Button';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { toast } from '@/Components/UI/Toast';

export default function CreateJournalModal({ isOpen, onClose, accounts = [] }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
        entries: [
            { account_id: null, debit: 0, credit: 0, description: '' },
            { account_id: null, debit: 0, credit: 0, description: '' },
        ],
    });

    const accountOptions = accounts.map(acc => ({
        value: acc.id,
        label: `${acc.code} - ${acc.name}`
    }));

    // Calculate totals
    const totalDebit = data.entries.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0);
    const totalCredit = data.entries.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen]);

    const handleAddRow = () => {
        setData('entries', [
            ...data.entries,
            { account_id: null, debit: 0, credit: 0, description: '' }
        ]);
    };

    const handleRemoveRow = (index) => {
        if (data.entries.length <= 2) {
            toast.error('Jurnal minimal memiliki 2 baris (Debit & Kredit)');
            return;
        }
        const newEntries = [...data.entries];
        newEntries.splice(index, 1);
        setData('entries', newEntries);
    };

    const handleEntryChange = (index, field, value) => {
        const newEntries = [...data.entries];
        
        // If changing debit, force credit to 0 (and vice versa) to prevent double entry on same row
        if (field === 'debit' && Number(value) > 0) {
            newEntries[index].credit = 0;
        } else if (field === 'credit' && Number(value) > 0) {
            newEntries[index].debit = 0;
        }

        newEntries[index][field] = value;
        setData('entries', newEntries);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if any row has no account selected
        const hasEmptyAccount = data.entries.some(entry => !entry.account_id);
        if (hasEmptyAccount) {
            toast.error('Pilih akun untuk semua baris jurnal.');
            return;
        }

        if (!isBalanced) {
            toast.error('Total Debit dan Kredit harus balance!');
            return;
        }

        post('/admin/jurnal', {
            onSuccess: () => {
                toast.success('Jurnal berhasil disimpan!');
                onClose();
            },
            onError: (err) => {
                toast.error(err.error || 'Terjadi kesalahan saat menyimpan jurnal. Silakan periksa kembali form.');
            }
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Entri Jurnal Baru"
            maxWidth="4xl"
        >
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <FormInput
                        label="Tanggal Transaksi"
                        type="date"
                        value={data.transaction_date}
                        onChange={e => setData('transaction_date', e.target.value)}
                        error={errors.transaction_date}
                        required
                    />
                    <FormInput
                        label="Uraian Jurnal"
                        type="text"
                        placeholder="Catatan transaksi..."
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        error={errors.description}
                        required
                    />
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto custom-scrollbar mb-4">
                    <table className="w-full min-w-[620px] text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                            <tr>
                                <th className="px-4 py-3 w-1/3">Akun Perkiraan</th>
                                <th className="px-4 py-3 w-1/4">Keterangan</th>
                                <th className="px-4 py-3 w-1/5 text-right">Debit (Rp)</th>
                                <th className="px-4 py-3 w-1/5 text-right">Kredit (Rp)</th>
                                <th className="px-4 py-3 w-12 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.entries.map((entry, index) => (
                                <tr key={index} className="bg-white">
                                    <td className="px-4 py-2">
                                        <select
                                            value={entry.account_id || ''}
                                            onChange={(e) => handleEntryChange(index, 'account_id', e.target.value)}
                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-primary focus:border-primary min-h-[38px]"
                                        >
                                            <option value="" disabled>Pilih Akun...</option>
                                            {accountOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        {errors[`entries.${index}.account_id`] && (
                                            <div className="text-red-500 text-xs mt-1">{errors[`entries.${index}.account_id`]}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="text" 
                                            value={entry.description}
                                            onChange={(e) => handleEntryChange(index, 'description', e.target.value)}
                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-primary focus:border-primary"
                                            placeholder="Opsional"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={entry.debit}
                                            onChange={(e) => handleEntryChange(index, 'debit', e.target.value)}
                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-primary focus:border-primary text-right"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={entry.credit}
                                            onChange={(e) => handleEntryChange(index, 'credit', e.target.value)}
                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-primary focus:border-primary text-right"
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveRow(index)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-medium">
                            <tr>
                                <td colSpan="2" className="px-4 py-3 text-slate-600">
                                    <button 
                                        type="button" 
                                        onClick={handleAddRow}
                                        className="text-primary hover:text-primary-dark inline-flex items-center gap-1 text-sm font-medium transition-colors"
                                    >
                                        <Plus className="w-4 h-4" /> Tambah Baris
                                    </button>
                                </td>
                                <td className={`px-4 py-3 text-right ${isBalanced ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {totalDebit.toLocaleString('id-ID')}
                                </td>
                                <td className={`px-4 py-3 text-right ${isBalanced ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {totalCredit.toLocaleString('id-ID')}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {!isBalanced && (
                    <div className="text-sm text-red-500 font-medium mb-4 flex items-center justify-end">
                        Total Debit dan Kredit tidak seimbang! (Selisih: Rp {Math.abs(totalDebit - totalCredit).toLocaleString('id-ID')})
                    </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">
                        Batal
                    </Button>
                    <Button type="submit" variant="primary" disabled={processing || !isBalanced} className="w-full sm:w-auto">
                        <Save className="w-4 h-4 mr-1.5" />
                        Simpan Jurnal
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

