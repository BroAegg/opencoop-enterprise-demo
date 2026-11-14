import { Product, Account, Member, JournalEntry } from './types';

export const COOP_INFO = {
  name: 'Koperasi Konsumen Nusantara Mandiri',
  shortName: 'NusaCoop Enterprise',
  legalNumber: 'AHU-0012948.AH.01.26.TAHUN.2024',
  address: 'Jl. Inovasi Teknologi No. 42, Kota Bandung, Jawa Barat',
  phone: '+62 22 7350 9988',
  email: 'info@nusacoop-demo.id',
  website: 'https://opencoop-demo.vercel.app',
};

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'PRD-001', sku: 'SEM-001', barcode: '89999991001', name: 'Beras Premium Ramos 5kg', category: 'Sembako', buyPrice: 68000, sellPrice: 75000, stock: 45, minStock: 10, unit: 'Karung' },
  { id: 'PRD-002', sku: 'SEM-002', barcode: '89999991002', name: 'Minyak Goreng Sawit 2L', category: 'Sembako', buyPrice: 31000, sellPrice: 34500, stock: 60, minStock: 15, unit: 'Pouch' },
  { id: 'PRD-003', sku: 'SEM-003', barcode: '89999991003', name: 'Gula Pasir Kristal Putih 1kg', category: 'Sembako', buyPrice: 15200, sellPrice: 17500, stock: 80, minStock: 20, unit: 'Kg' },
  { id: 'PRD-004', sku: 'SEM-004', barcode: '89999991004', name: 'Tepung Terigu Serbaguna 1kg', category: 'Sembako', buyPrice: 11000, sellPrice: 13000, stock: 35, minStock: 10, unit: 'Kg' },
  { id: 'PRD-005', sku: 'DRK-001', barcode: '89999992001', name: 'Kopi Arabika Gayo Blend 250g', category: 'Minuman', buyPrice: 42000, sellPrice: 50000, stock: 24, minStock: 5, unit: 'Pcs' },
  { id: 'PRD-006', sku: 'DRK-002', barcode: '89999992002', name: 'Teh Celup Melati Kotak 25s', category: 'Minuman', buyPrice: 6500, sellPrice: 8500, stock: 50, minStock: 12, unit: 'Kotak' },
  { id: 'PRD-007', sku: 'DRK-003', barcode: '89999992003', name: 'Susu UHT Full Cream 1000ml', category: 'Minuman', buyPrice: 17500, sellPrice: 20500, stock: 40, minStock: 10, unit: 'Kotak' },
  { id: 'PRD-008', sku: 'SNK-001', barcode: '89999993001', name: 'Keripik Tempe Renyah Oven 150g', category: 'Snack', buyPrice: 12000, sellPrice: 16000, stock: 30, minStock: 8, unit: 'Bks' },
  { id: 'PRD-009', sku: 'SNK-002', barcode: '89999993002', name: 'Biskuit Gandum Cokelat 200g', category: 'Snack', buyPrice: 8500, sellPrice: 11000, stock: 45, minStock: 10, unit: 'Bks' },
  { id: 'PRD-010', sku: 'ATK-001', barcode: '89999994001', name: 'Kertas HVS A4 75gsm 1 Rim', category: 'ATK', buyPrice: 46000, sellPrice: 52000, stock: 28, minStock: 5, unit: 'Rim' },
  { id: 'PRD-011', sku: 'ATK-002', barcode: '89999994002', name: 'Pulpen Gel Hitam 0.5mm Pack', category: 'ATK', buyPrice: 18000, sellPrice: 24000, stock: 55, minStock: 15, unit: 'Pack' },
  { id: 'PRD-012', sku: 'CLN-001', barcode: '89999995001', name: 'Sabun Cuci Piring Jeruk Nipis 750ml', category: 'Kebersihan', buyPrice: 12500, sellPrice: 15000, stock: 40, minStock: 10, unit: 'Pouch' }
];

export const INITIAL_MEMBERS: Member[] = [
  { id: 'MBR-001', memberNumber: 'NK-2024-001', name: 'Budi Santoso, M.T.', department: 'Fakultas Teknik', joinDate: '2024-01-15', simpananPokok: 500000, simpananWajib: 1200000, simpananSukarela: 2500000, totalSimpanan: 4200000, annualRetailPurchases: 6850000, activeLoanBalance: 0 },
  { id: 'MBR-002', memberNumber: 'NK-2024-002', name: 'Siti Rahmawati, S.Kom.', department: 'Pusat Komputer', joinDate: '2024-01-20', simpananPokok: 500000, simpananWajib: 1200000, simpananSukarela: 1800000, totalSimpanan: 3500000, annualRetailPurchases: 5400000, activeLoanBalance: 4500000 },
  { id: 'MBR-003', memberNumber: 'NK-2024-003', name: 'Dr. Ahmad Fauzi, M.Sc.', department: 'Bioteknologi', joinDate: '2024-02-01', simpananPokok: 500000, simpananWajib: 1100000, simpananSukarela: 5000000, totalSimpanan: 6600000, annualRetailPurchases: 8900000, activeLoanBalance: 0 },
  { id: 'MBR-004', memberNumber: 'NK-2024-004', name: 'Dewi Lestari, S.E.', department: 'Biro Keuangan', joinDate: '2024-02-15', simpananPokok: 500000, simpananWajib: 1100000, simpananSukarela: 800000, totalSimpanan: 2400000, annualRetailPurchases: 4200000, activeLoanBalance: 2000000 },
  { id: 'MBR-005', memberNumber: 'NK-2024-005', name: 'Hendra Wijaya, S.Pd.', department: 'Lembaga Bahasa', joinDate: '2024-03-01', simpananPokok: 500000, simpananWajib: 1000000, simpananSukarela: 1200000, totalSimpanan: 2700000, annualRetailPurchases: 3750000, activeLoanBalance: 0 },
  { id: 'MBR-006', memberNumber: 'NK-2024-006', name: 'Novi Andriani, S.ST.', department: 'Tata Usaha FST', joinDate: '2024-03-10', simpananPokok: 500000, simpananWajib: 1000000, simpananSukarela: 1500000, totalSimpanan: 3000000, annualRetailPurchases: 5100000, activeLoanBalance: 3200000 },
  { id: 'MBR-007', memberNumber: 'NK-2024-007', name: 'Rizki Pratama, M.Ds.', department: 'Desain Komunikasi', joinDate: '2024-04-05', simpananPokok: 500000, simpananWajib: 900000, simpananSukarela: 600000, totalSimpanan: 2000000, annualRetailPurchases: 3100000, activeLoanBalance: 0 },
  { id: 'MBR-008', memberNumber: 'NK-2024-008', name: 'drh. Fitri Handayani', department: 'Farmasi & Pangan', joinDate: '2024-04-20', simpananPokok: 500000, simpananWajib: 900000, simpananSukarela: 3400000, totalSimpanan: 4800000, annualRetailPurchases: 7200000, activeLoanBalance: 6000000 },
  { id: 'MBR-009', memberNumber: 'NK-2024-009', name: 'Eko Wahyudi', department: 'Keamanan & Logistik', joinDate: '2024-05-02', simpananPokok: 500000, simpananWajib: 800000, simpananSukarela: 400000, totalSimpanan: 1700000, annualRetailPurchases: 2950000, activeLoanBalance: 1200000 },
  { id: 'MBR-010', memberNumber: 'NK-2024-010', name: 'Tri Utami, S.I.Pust.', department: 'Perpustakaan Pusat', joinDate: '2024-05-18', simpananPokok: 500000, simpananWajib: 800000, simpananSukarela: 900000, totalSimpanan: 2200000, annualRetailPurchases: 4650000, activeLoanBalance: 0 }
];

export const CHART_OF_ACCOUNTS: Account[] = [
  // ASET (1000)
  { code: '1101', name: 'Kas Kasir Toko Retail', category: 'ASET', normalBalance: 'DEBIT', balance: 4500000 },
  { code: '1102', name: 'Kas Operasional Kantor', category: 'ASET', normalBalance: 'DEBIT', balance: 12800000 },
  { code: '1103', name: 'Bank Syariah Mandiri Utama', category: 'ASET', normalBalance: 'DEBIT', balance: 84500000 },
  { code: '1104', name: 'Piutang Pembiayaan Anggota', category: 'ASET', normalBalance: 'DEBIT', balance: 42000000 },
  { code: '1105', name: 'Persediaan Barang Retail (Toko)', category: 'ASET', normalBalance: 'DEBIT', balance: 36700000 },
  { code: '1201', name: 'Aset Tetap - Perangkat Kasir & POS', category: 'ASET', normalBalance: 'DEBIT', balance: 18500000 },
  { code: '1202', name: 'Akumulasi Penyusutan Aset Tetap', category: 'ASET', normalBalance: 'KREDIT', balance: -3700000 },

  // KEWAJIBAN (2000)
  { code: '2101', name: 'Utang Dagang / Konsinyasi Supplier', category: 'KEWAJIBAN', normalBalance: 'KREDIT', balance: 14200000 },
  { code: '2102', name: 'Simpanan Sukarela Anggota', category: 'KEWAJIBAN', normalBalance: 'KREDIT', balance: 18100000 },
  { code: '2103', name: 'Titipan Dana Pendidikan & Sosial', category: 'KEWAJIBAN', normalBalance: 'KREDIT', balance: 4500000 },

  // EKUITAS (3000)
  { code: '3101', name: 'Simpanan Pokok Anggota', category: 'EKUITAS', normalBalance: 'KREDIT', balance: 50000000 },
  { code: '3102', name: 'Simpanan Wajib Anggota', category: 'EKUITAS', normalBalance: 'KREDIT', balance: 68500000 },
  { code: '3103', name: 'Dana Cadangan Koperasi', category: 'EKUITAS', normalBalance: 'KREDIT', balance: 25000000 },
  { code: '3104', name: 'Sisa Hasil Usaha (SHU) Berjalan', category: 'EKUITAS', normalBalance: 'KREDIT', balance: 33500000 },

  // PENDAPATAN (4000)
  { code: '4101', name: 'Pendapatan Penjualan Retail Toko', category: 'PENDAPATAN', normalBalance: 'KREDIT', balance: 125400000 },
  { code: '4102', name: 'Pendapatan Jasa Pembiayaan / Margin', category: 'PENDAPATAN', normalBalance: 'KREDIT', balance: 18600000 },

  // HPP (5000)
  { code: '5101', name: 'Harga Pokok Penjualan (HPP) Retail', category: 'HPP', normalBalance: 'DEBIT', balance: 94200000 },

  // BEBAN (6000)
  { code: '6101', name: 'Beban Gaji Pengelola & Kasir', category: 'BEBAN', normalBalance: 'DEBIT', balance: 12000000 },
  { code: '6102', name: 'Beban Listrik, Internet & Operasional', category: 'BEBAN', normalBalance: 'DEBIT', balance: 2800000 },
  { code: '6103', name: 'Beban Penyusutan Peralatan Kasir', category: 'BEBAN', normalBalance: 'DEBIT', balance: 1500000 }
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'JRN-20241101-001',
    referenceNumber: 'JU/2024/11/001',
    date: '2024-11-01',
    description: 'Penerimaan Simpanan Wajib Kolektif Anggota via Potong Gaji',
    items: [
      { accountCode: '1103', accountName: 'Bank Syariah Mandiri Utama', debit: 10000000, credit: 0 },
      { accountCode: '3102', accountName: 'Simpanan Wajib Anggota', debit: 0, credit: 10000000 }
    ],
    totalDebit: 10000000,
    totalCredit: 10000000,
    status: 'POSTED'
  },
  {
    id: 'JRN-20241105-002',
    referenceNumber: 'JU/2024/11/002',
    date: '2024-11-05',
    description: 'Penyaluran Pembiayaan Murabahah Anggota (Dr. Ahmad Fauzi)',
    items: [
      { accountCode: '1104', accountName: 'Piutang Pembiayaan Anggota', debit: 15000000, credit: 0 },
      { accountCode: '1103', accountName: 'Bank Syariah Mandiri Utama', debit: 0, credit: 15000000 }
    ],
    totalDebit: 15000000,
    totalCredit: 15000000,
    status: 'POSTED'
  },
  {
    id: 'JRN-20241110-003',
    referenceNumber: 'JU/2024/11/003',
    date: '2024-11-10',
    description: 'Setoran Penjualan Kasir Shift Pagi Toko Retail ke Rekening Bank',
    items: [
      { accountCode: '1103', accountName: 'Bank Syariah Mandiri Utama', debit: 4250000, credit: 0 },
      { accountCode: '1101', accountName: 'Kas Kasir Toko Retail', debit: 0, credit: 4250000 }
    ],
    totalDebit: 4250000,
    totalCredit: 4250000,
    status: 'POSTED'
  },
  {
    id: 'JRN-20241112-004',
    referenceNumber: 'JU/2024/11/004',
    date: '2024-11-12',
    description: 'Pelunasan Utang Konsinyasi Supplier Sembako Nusantara',
    items: [
      { accountCode: '2101', accountName: 'Utang Dagang / Konsinyasi Supplier', debit: 6500000, credit: 0 },
      { accountCode: '1103', accountName: 'Bank Syariah Mandiri Utama', debit: 0, credit: 6500000 }
    ],
    totalDebit: 6500000,
    totalCredit: 6500000,
    status: 'POSTED'
  }
];
