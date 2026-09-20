export interface Account {
  id: string;
  accountNo: string;
  name: string;
  age: number;
  guardianName: string;
  phone: string;
  goalItem?: string;
  goalAmount?: number;
  goalClaimed: boolean;
  goalClaimedDate: string | null;
  balance: number;
  stars: number;
  createdAt: string;
}

export type ChequeStatus = 'AVAILABLE' | 'TORN_SUBMITTED' | 'CASHED' | 'CANCELLED';

export interface ChequeLeaf {
  id: string;
  chequeNo: string;
  accountNo: string;
  leafNumber: number;
  status: ChequeStatus;
  payeeName?: string;
  amount?: number;
  amountInWords?: string;
  issueDate?: string;
  cashedDate?: string;
  tornDate?: string;
  reason?: string;
  transactionId?: string;
  isAccountPayeeOnly?: boolean;
}

export interface ChequeBook {
  accountNo: string;
  bookSeries: string;
  totalLeaves: number;
  leaves: ChequeLeaf[];
  issuedAt: string;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'LOAN_ISSUE' | 'LOAN_REPAY' | 'PROFIT';

export interface Transaction {
  id: string;
  accountNo: string;
  chequeNo?: string;
  type: TransactionType;
  amount: number;
  ref: string;
  timestamp: string;
  previousBalance: number;
  newBalance: number;
}

export interface Loan {
  id: string;
  accountNo: string;
  amount: number;
  paidAmount: number;
  reason: string;
  status: 'ACTIVE' | 'PAID';
  createdAt: string;
}

export interface AppSettings {
  twoMonthProfitRate: number; // e.g. 1.0%
  withdrawalLimitForProfit: number; // e.g. 200.0 BDT
  starThreshold: number; // e.g. 50 BDT = 1 star
  bankName: string;
  branchName: string;
}

export interface AdminProfile {
  name: string;
  role: string;
  pass: string;
}

export interface AdminProfitRecord {
  id: string;
  amount: number;
  totalVaultAtTime: number;
  timestamp: string;
}

export interface BankDatabase {
  adminVaultCash: number;
  adminEarnedProfit?: number;
  adminProfitHistory?: AdminProfitRecord[];
  settings: AppSettings;
  admins: AdminProfile[];
  currentAdminIndex: number;
  accounts: Account[];
  chequebooks: Record<string, ChequeBook>; // accountNo -> ChequeBook
  loans: Loan[];
  transactions: Transaction[];
}
