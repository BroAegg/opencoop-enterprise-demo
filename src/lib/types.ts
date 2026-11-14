export type UserRole = 'admin' | 'kasir' | 'pengawas';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  unit: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OfflineTransaction {
  client_uuid: string;
  invoice_number: string;
  cashier_name: string;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    sell_price: number;
    subtotal: number;
  }[];
  total_amount: number;
  payment_method: 'TUNAI' | 'QRIS' | 'POTONG_GAJI';
  cash_tendered: number;
  change_due: number;
  created_at: string;
  status: 'PENDING_SYNC' | 'SYNCED' | 'FAILED';
  member_id?: string;
  member_name?: string;
}

export interface Account {
  code: string;
  name: string;
  category: 'ASET' | 'KEWAJIBAN' | 'EKUITAS' | 'PENDAPATAN' | 'HPP' | 'BEBAN';
  normalBalance: 'DEBIT' | 'KREDIT';
  balance: number;
}

export interface JournalEntryItem {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  referenceNumber: string;
  date: string;
  description: string;
  items: JournalEntryItem[];
  totalDebit: number;
  totalCredit: number;
  status: 'POSTED';
}

export interface Member {
  id: string;
  memberNumber: string;
  name: string;
  department: string;
  joinDate: string;
  simpananPokok: number;
  simpananWajib: number;
  simpananSukarela: number;
  totalSimpanan: number;
  annualRetailPurchases: number;
  activeLoanBalance: number;
}

export interface LoanSimulation {
  loanAmount: number;
  interestRateAnnual: number;
  tenorMonths: number;
  monthlyPrincipal: number;
  monthlyInterest: number;
  totalMonthlyInstallment: number;
  totalPayback: number;
}

export interface ShuCalculationResult {
  memberId: string;
  memberName: string;
  memberNumber: string;
  simpananWeight: number; // Percentage of total savings
  transaksiWeight: number; // Percentage of total retail purchases
  jasaModalAmount: number;
  jasaUsahaAmount: number;
  totalShuReceived: number;
}
