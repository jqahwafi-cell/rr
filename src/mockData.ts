import { BankDatabase, ChequeBook, ChequeLeaf } from './types';

export function createInitialChequeLeaves(accountNo: string, count: number = 6): ChequeLeaf[] {
  const leaves: ChequeLeaf[] = [];
  const suffix = accountNo.split('-').pop() || '1001';
  for (let i = 1; i <= count; i++) {
    const leafNoStr = String(i).padStart(2, '0');
    const chequeNo = `CHK-${suffix}-${leafNoStr}`;
    leaves.push({
      id: `${accountNo}-${leafNoStr}`,
      chequeNo,
      accountNo,
      leafNumber: i,
      status: 'AVAILABLE',
      payeeName: undefined,
      amount: undefined,
      amountInWords: undefined,
      issueDate: undefined,
      cashedDate: undefined,
      tornDate: undefined,
      reason: undefined,
      transactionId: undefined,
      isAccountPayeeOnly: false,
    });
  }
  return leaves;
}

export function createChequebookForAccount(accountNo: string, totalLeaves: number = 6): ChequeBook {
  const leaves = createInitialChequeLeaves(accountNo, totalLeaves);
  return {
    accountNo,
    bookSeries: `SERIES-${accountNo.slice(-4)}`,
    totalLeaves,
    leaves,
    issuedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  };
}

export const initialDatabase: BankDatabase = {
  adminVaultCash: 0,
  adminEarnedProfit: 0,
  adminProfitHistory: [],
  settings: {
    twoMonthProfitRate: 1.0,
    withdrawalLimitForProfit: 200.0,
    starThreshold: 50,
    bankName: 'আমার ব্যাংক - কিডস ব্যাংকিং শাখা',
    branchName: 'ভল্ট ও শিশু সঞ্চয় শাখা, ঢাকা',
  },
  admins: [
    { name: 'প্রধান শিক্ষক / অভিভাবক এডমিন', role: 'Super Admin', pass: '1234' },
    { name: 'সহকারী অভিভাবক / কোষাধ্যক্ষ', role: 'Parent Admin', pass: '8888' },
  ],
  currentAdminIndex: 0,
  accounts: [],
  chequebooks: {},
  loans: [],
  transactions: [],
};

export const sampleDemoDatabase: BankDatabase = {
  adminVaultCash: 4620.0,
  adminEarnedProfit: 46.0,
  adminProfitHistory: [
    {
      id: 'AP-1',
      amount: 46.0,
      totalVaultAtTime: 4620.0,
      timestamp: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
  ],
  settings: {
    twoMonthProfitRate: 1.0,
    withdrawalLimitForProfit: 200.0,
    starThreshold: 50,
    bankName: 'আমার ব্যাংক - কিডস ব্যাংকিং শাখা',
    branchName: 'ভল্ট ও শিশু সঞ্চয় শাখা, ঢাকা',
  },
  admins: [
    { name: 'প্রধান শিক্ষক / অভিভাবক এডমিন', role: 'Super Admin', pass: '1234' },
    { name: 'সহকারী অভিভাবক / কোষাধ্যক্ষ', role: 'Parent Admin', pass: '8888' },
  ],
  currentAdminIndex: 0,
  accounts: [
    {
      id: 'acc-1',
      accountNo: 'AMAR-KIDS-1001',
      name: 'আরিফ হোসেন',
      age: 10,
      guardianName: 'মোঃ রফিকুল ইসলাম',
      phone: '01712345678',
      goalItem: 'নতুন বাইসাইকেল 🚲',
      goalAmount: 3000.0,
      goalClaimed: false,
      goalClaimedDate: null,
      balance: 2450.0,
      stars: 49,
      createdAt: new Date(Date.now() - 86400000 * 70).toISOString(),
    },
    {
      id: 'acc-2',
      accountNo: 'AMAR-KIDS-1002',
      name: 'সাদিয়া তাসনিন',
      age: 8,
      guardianName: 'ফারজানা বেগম',
      phone: '01898765432',
      goalItem: 'গল্পের বইয়ের সেট 📚',
      goalAmount: 800.0,
      goalClaimed: true,
      goalClaimedDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
      balance: 620.0,
      stars: 12,
      createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    },
    {
      id: 'acc-3',
      accountNo: 'AMAR-KIDS-1003',
      name: 'রাফি ইসলাম',
      age: 12,
      guardianName: 'নুরুল ইসলাম',
      phone: '01555443322',
      goalItem: 'ফুটবল ও স্পোর্টস জুতা ⚽',
      goalAmount: 1500.0,
      goalClaimed: false,
      goalClaimedDate: null,
      balance: 1100.0,
      stars: 22,
      createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
    },
    {
      id: 'acc-4',
      accountNo: 'AMAR-KIDS-1004',
      name: 'মাইশা আনজুম',
      age: 7,
      guardianName: 'তানজিলা আক্তার',
      phone: '01911223344',
      goalItem: 'ড্রয়িং কালার বক্স ও আর্ট প্যাড 🎨',
      goalAmount: 600.0,
      goalClaimed: false,
      goalClaimedDate: null,
      balance: 450.0,
      stars: 9,
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
  ],
  chequebooks: {
    'AMAR-KIDS-1001': createChequebookForAccount('AMAR-KIDS-1001', 6),
    'AMAR-KIDS-1002': createChequebookForAccount('AMAR-KIDS-1002', 6),
    'AMAR-KIDS-1003': createChequebookForAccount('AMAR-KIDS-1003', 6),
    'AMAR-KIDS-1004': createChequebookForAccount('AMAR-KIDS-1004', 6),
  },
  loans: [
    {
      id: 'LN-501',
      accountNo: 'AMAR-KIDS-1002',
      amount: 250.0,
      paidAmount: 100.0,
      reason: 'বইমেলায় অতিরিক্ত চিত্রাঙ্কন বই কেনা',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
  ],
  transactions: [
    {
      id: 'TX-K101',
      accountNo: 'AMAR-KIDS-1001',
      chequeNo: '-',
      type: 'DEPOSIT',
      amount: 200.0,
      ref: 'মাটির ব্যাংক থেকে ২০০ টাকা জমা',
      timestamp: new Date(Date.now() - 86400000 * 15).toISOString(),
      previousBalance: 2250.0,
      newBalance: 2450.0,
    },
    {
      id: 'TX-K102',
      accountNo: 'AMAR-KIDS-1002',
      chequeNo: '-',
      type: 'DEPOSIT',
      amount: 150.0,
      ref: 'ড্রয়িং প্রতিযোগিতার পুরস্কারের টাকা জমা',
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
      previousBalance: 470.0,
      newBalance: 620.0,
    },
    {
      id: 'TX-K103',
      accountNo: 'AMAR-KIDS-1003',
      chequeNo: '-',
      type: 'DEPOSIT',
      amount: 100.0,
      ref: 'ঈদ সেলামির উপহারের টাকা জমা',
      timestamp: new Date(Date.now() - 86400000 * 8).toISOString(),
      previousBalance: 1000.0,
      newBalance: 1100.0,
    },
  ],
};
