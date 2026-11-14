import React from 'react';
import TactileCard from '@/Components/UI/TactileCard';
import SegmentedControl from '@/Components/UI/SegmentedControl';
import FormInput from '@/Components/UI/FormInput';
import FormCurrencyInput from '@/Components/UI/FormCurrencyInput';

const PURPOSE_PRESETS = [
    'Pendidikan / SPP Anak',
    'Keperluan Medis / Berobat',
    'Renovasi Rumah',
    'Modal Usaha Mikro',
    'Kebutuhan Mendesak Keluarga',
];

export default function LoanTermsCard({ data, setData, errors }) {
    const isBmt = data.source === 'BMT_ITQAN';

    const handleSourceChange = (newSource) => {
        const isSwitchingToBmt = newSource === 'BMT_ITQAN';
        setData((prev) => ({
            ...prev,
            source: newSource,
            admin_fee: isSwitchingToBmt ? '0' : '25000',
            interest_rate: isSwitchingToBmt
                ? prev.interest_rate === '0' || !prev.interest_rate
                    ? '21.12'
                    : prev.interest_rate
                : '0',
            bmt_account_number: isSwitchingToBmt ? prev.bmt_account_number : '',
        }));
    };

    const plafonPresets = isBmt
        ? [5000000, 8000000, 10000000, 15000000, 20000000]
        : [500000, 1000000, 2000000, 3000000, 5000000];

    const tenorPresets = [3, 6, 10, 12, 18, 24];

    const marginPresets = [
        { label: '21.12%', value: '21.12' },
        { label: '45.90%', value: '45.90' },
        { label: '52.80%', value: '52.80' },
        { label: '63.00%', value: '63.00' },
    ];

    const adminFeePresets = [
        { label: 'Rp 0', value: '0' },
        { label: 'Rp 25.000 / bln', value: '25000' },
        { label: 'Rp 50.000 / bln', value: '50000' },
    ];

    return (
        <TactileCard variant="white" rounded="3xl" className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                        2. Parameter &amp; Skema Pembiayaan
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Tentukan sumber permodalan, plafon, tenor, dan biaya administrasi.
                    </p>
                </div>
            </div>

            {/* Sumber Dana (Segmented Control) */}
            <div className="space-y-2">
                <label className="text-[12px] font-semibold text-slate-700 block">
                    Sumber Dana Pembiayaan <span className="text-rose-500">*</span>
                </label>
                <SegmentedControl
                    value={data.source}
                    onChange={handleSourceChange}
                    size="md"
                    pill={false}
                    options={[
                        { id: 'Manasuka', label: 'Koperasi Manasuka (Internal)' },
                        { id: 'BMT_ITQAN', label: 'BMT ITQAN (Kemitraan)' },
                    ]}
                />
                {errors.source && <p className="text-[11px] text-rose-600 font-medium">{errors.source}</p>}
            </div>

            {/* Rekening BMT jika BMT ITQAN */}
            {isBmt && (
                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200/70 space-y-2">
                    <FormInput
                        label="Nomor Rekening Anggota di BMT ITQAN"
                        id="bmt_account_number"
                        value={data.bmt_account_number}
                        onChange={(e) => setData('bmt_account_number', e.target.value)}
                        error={errors.bmt_account_number}
                        placeholder="Contoh: 7123910301"
                        required={isBmt}
                        helpText="Wajib diisi untuk proses kliring dan pencairan dana kemitraan BMT."
                    />
                </div>
            )}

            {/* Plafon Pembiayaan */}
            <div className="space-y-2">
                <FormCurrencyInput
                    label="Plafon Pembiayaan"
                    id="base_amount"
                    value={data.base_amount}
                    onChange={(e) => setData('base_amount', e.target.value)}
                    error={errors.base_amount}
                    placeholder="0"
                    required
                />
                {/* Plafon Quick Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                        Pilihan Cepat:
                    </span>
                    {plafonPresets.map((amt) => (
                        <button
                            key={amt}
                            type="button"
                            onClick={() => setData('base_amount', String(amt))}
                            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                                String(data.base_amount) === String(amt)
                                    ? 'bg-teal-700 text-white shadow-sm'
                                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/70'
                            }`}
                        >
                            Rp {(amt / 1000).toLocaleString('id-ID')}k
                        </button>
                    ))}
                </div>
            </div>

            {/* Tenor & Margin (Margin adaptif hanya tampil jika BMT ITQAN) */}
            <div className={isBmt ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-2'}>
                {/* Tenor (Bulan) */}
                <div className="space-y-2">
                    <FormInput
                        label="Tenor Angsuran"
                        id="tenor"
                        type="number"
                        suffix="Bulan"
                        value={data.tenor}
                        onChange={(e) => setData('tenor', e.target.value)}
                        error={errors.tenor}
                        placeholder={isBmt ? 'Cth: 12' : 'Cth: 10'}
                        required
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {tenorPresets.map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setData('tenor', String(t))}
                                className={`px-2 py-0.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                                    String(data.tenor) === String(t)
                                        ? 'bg-slate-900 text-white font-semibold'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                            >
                                {t} Bln
                            </button>
                        ))}
                    </div>
                </div>

                {/* Suku Margin Tahunan (%) - Hanya BMT ITQAN */}
                {isBmt && (
                    <div className="space-y-2">
                        <FormInput
                            label="Margin / Bagi Hasil Tahunan"
                            id="interest_rate"
                            type="number"
                            step="0.01"
                            suffix="%"
                            value={data.interest_rate}
                            onChange={(e) => setData('interest_rate', e.target.value)}
                            error={errors.interest_rate}
                            placeholder="21.12"
                            required
                        />
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {marginPresets.map((m) => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setData('interest_rate', m.value)}
                                    className={`px-2 py-0.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                                        String(data.interest_rate) === String(m.value)
                                            ? 'bg-slate-900 text-white font-semibold'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                    }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Biaya Administrasi Bulanan via Payroll (Khusus Manasuka Internal) */}
            {!isBmt && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                    <FormCurrencyInput
                        label="Biaya Admin Bulanan (via Payroll)"
                        id="admin_fee"
                        value={data.admin_fee}
                        onChange={(e) => setData('admin_fee', e.target.value)}
                        error={errors.admin_fee}
                        placeholder="25000"
                        helpText="Dipotong tiap bulan dari payroll bersama angsuran pokok (Standar internal: Rp 25.000 / bulan)."
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                            Preset Admin:
                        </span>
                        {adminFeePresets.map((fee) => (
                            <button
                                key={fee.value}
                                type="button"
                                onClick={() => setData('admin_fee', fee.value)}
                                className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                    String(data.admin_fee) === String(fee.value)
                                        ? 'bg-teal-700 text-white font-semibold'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                            >
                                {fee.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tujuan Pembiayaan */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
                <FormInput
                    label="Tujuan Pembiayaan / Catatan Akad *"
                    id="purpose"
                    value={data.purpose}
                    onChange={(e) => setData('purpose', e.target.value)}
                    error={errors.purpose}
                    placeholder="Contoh: Renovasi tempat tinggal, modal usaha mikro, kebutuhan pendidikan anak..."
                    required
                    helpText="Wajib diisi sebagai klausul peruntukan sah pada Surat Akad dan pertimbangan komite pengurus."
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                        Pilihan Cepat:
                    </span>
                    {PURPOSE_PRESETS.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            onClick={() => setData('purpose', preset)}
                            className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                data.purpose === preset
                                    ? 'bg-amber-600 text-white font-semibold shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                        >
                            {preset}
                        </button>
                    ))}
                </div>
            </div>
        </TactileCard>
    );
}

