import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  PiggyBank,
  LayoutDashboard,
  Coins,
  ReceiptText,
  Handshake,
  Users,
  Gift,
  History,
  Sliders,
  Printer,
  Trash2,
  Download,
  PlusCircle,
  ShieldCheck,
  Search,
  Star,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  Scissors,
  DollarSign,
} from 'lucide-react';

import {
  BankDatabase,
  Account,
  ChequeLeaf,
  ChequeBook,
  Transaction,
  Loan,
  ChequeStatus,
  AdminProfitRecord,
} from './types';
import { initialDatabase, sampleDemoDatabase, createChequebookForAccount } from './mockData';
import { toBanglaNumber, numberToBanglaWords } from './utils/numberToWords';
import { ChequeLeafComponent } from './components/ChequeLeafComponent';
import { ChequebookModal } from './components/ChequebookModal';
import { ClearDataModal } from './components/ClearDataModal';
import { PassbookModal } from './components/PassbookModal';
import { NewAccountModal } from './components/NewAccountModal';
import { NewLoanModal } from './components/NewLoanModal';
import { RepayLoanModal } from './components/RepayLoanModal';

const STORAGE_KEY = 'AMAR_BANK_KIDS_VAULT_CLEAN_SLATE_V1';

export default function App() {
  // Database state
  const [db, setDb] = useState<BankDatabase>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load storage', e);
    }
    return initialDatabase;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'quick-deposit'
    | 'cheque-withdraw'
    | 'chequebooks'
    | 'accounts'
    | 'kid-loans'
    | 'goals'
    | 'transactions'
    | 'settings'
  >('dashboard');

  // Modals state
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState(false);
  const [repayLoanTarget, setRepayLoanTarget] = useState<Loan | null>(null);
  const [viewingChequebookAccountNo, setViewingChequebookAccountNo] = useState<string | null>(null);
  const [viewingPassbookAccountNo, setViewingPassbookAccountNo] = useState<string | null>(null);

  // Quick Deposit State
  const [depositAccountNo, setDepositAccountNo] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('50');
  const [depositRef, setDepositRef] = useState<string>('মাটির ব্যাংক জমা');

  // Cheque Withdrawal State
  const [withdrawAccountNo, setWithdrawAccountNo] = useState<string>('');
  const [withdrawChequeNo, setWithdrawChequeNo] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawRef, setWithdrawRef] = useState<string>('পকেট মানি ও প্রয়োজনীয় সামগ্রী');

  // Filter & Search states
  const [accountSearch, setAccountSearch] = useState('');
  const [accountAgeFilter, setAccountAgeFilter] = useState<'ALL' | 'JUNIOR' | 'SENIOR'>('ALL');
  const [txSearch, setTxSearch] = useState('');
  const [txFilterType, setTxFilterType] = useState<string>('ALL');

  // Selected account for Chequebooks Shelf tab
  const [selectedShelfAccountNo, setSelectedShelfAccountNo] = useState<string>(
    db.accounts[0]?.accountNo || ''
  );

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Save failed', e);
    }
  }, [db]);

  // Keep shelf selection in sync if accounts change
  useEffect(() => {
    if (!selectedShelfAccountNo && db.accounts.length > 0) {
      setSelectedShelfAccountNo(db.accounts[0].accountNo);
    }
  }, [db.accounts, selectedShelfAccountNo]);

  // Strict Banking Rule: If no accounts exist, vault cash from deposits must be 0 (no ghost cash without people)
  useEffect(() => {
    if (db.accounts.length === 0 && db.adminVaultCash !== 0) {
      setDb((prev) => ({
        ...prev,
        adminVaultCash: 0,
      }));
    }
  }, [db.accounts.length, db.adminVaultCash]);

  // Confetti helper
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }
  };

  // Helper to calculate recent 60-day withdrawals for 2-month 1% profit rule
  const getKidRecentWithdrawals = (accountNo: string): number => {
    const sixtyDaysAgo = new Date(Date.now() - 86400000 * 60);
    return db.transactions
      .filter(
        (t) =>
          t.accountNo === accountNo &&
          t.type === 'WITHDRAWAL' &&
          new Date(t.timestamp) >= sixtyDaysAgo
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const isEligibleForProfit = (accountNo: string): boolean => {
    const totalWithdrawn = getKidRecentWithdrawals(accountNo);
    return totalWithdrawn <= (db.settings.withdrawalLimitForProfit || 200);
  };

  // 1. CLEAR ALL DATA (USER REQUEST: "সব ডাটা মোছার বাটন দাও")
  const handleClearAllData = (mode: 'BLANK' | 'FRESH_DEMO') => {
    if (mode === 'BLANK') {
      const blankDb: BankDatabase = {
        adminVaultCash: 0.0,
        adminEarnedProfit: 0.0,
        adminProfitHistory: [],
        settings: db.settings,
        admins: db.admins,
        currentAdminIndex: 0,
        accounts: [],
        chequebooks: {},
        loans: [],
        transactions: [],
      };
      setDb(blankDb);
      setDepositAccountNo('');
      setWithdrawAccountNo('');
      setSelectedShelfAccountNo('');
      alert('সিস্টেমের সমস্ত ডাটা সম্পূর্ণ মুছে ফেলা হয়েছে! কোনো ডেমো বা অটো কিছু নেই, সম্পূর্ণ খালি ব্যাংক রেডি।');
    } else {
      setDb(sampleDemoDatabase);
      setSelectedShelfAccountNo(sampleDemoDatabase.accounts[0]?.accountNo || '');
      triggerConfetti();
      alert('পরীক্ষামূলক ডেমো ডাটা সফলভাবে লোড করা হয়েছে!');
    }
  };

  // Delete an individual account
  const handleDeleteAccount = (accountNo: string) => {
    const acc = db.accounts.find((a) => a.accountNo === accountNo);
    if (!acc) return;
    if (
      !confirm(
        `সতর্কবার্তা: আপনি কি নিশ্চিত যে "${acc.name}" (${acc.accountNo})-এর অ্যাকাউন্ট সম্পূর্ণ মুছে ফেলবেন?\n\nএতে তার জমানো ৳${acc.balance} ফেরত দিয়ে অ্যাকাউন্ট বন্ধ করা হবে।`
      )
    ) {
      return;
    }

    setDb((prev) => {
      const remainingAccounts = prev.accounts.filter((a) => a.accountNo !== accountNo);
      const updatedChequebooks = { ...prev.chequebooks };
      delete updatedChequebooks[accountNo];
      const newVault = Math.max(0, prev.adminVaultCash - acc.balance);

      return {
        ...prev,
        adminVaultCash: remainingAccounts.length === 0 ? 0 : newVault,
        accounts: remainingAccounts,
        chequebooks: updatedChequebooks,
        loans: prev.loans.filter((l) => l.accountNo !== accountNo),
      };
    });

    if (depositAccountNo === accountNo) setDepositAccountNo('');
    if (withdrawAccountNo === accountNo) setWithdrawAccountNo('');
    if (selectedShelfAccountNo === accountNo) setSelectedShelfAccountNo('');
    alert(`"${acc.name}" এর অ্যাকাউন্ট বন্ধ ও মুছে ফেলা হয়েছে!`);
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `AmarBank_Kids_Backup_${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // 2. QUICK DEPOSIT LOGIC
  const handleExecuteDeposit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!depositAccountNo) {
      alert('অনুগ্রহ করে সঞ্চয়ী শিশু নির্বাচন করুন!');
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      alert('সঠিক জমার পরিমাণ দিন (যেমন: ১০, ২০, ৫০ বা ১০০ টাকা)');
      return;
    }

    const targetAccount = db.accounts.find((a) => a.accountNo === depositAccountNo);
    if (!targetAccount) return;

    const earnedStars = Math.floor(amt / (db.settings.starThreshold || 50));
    const newBal = targetAccount.balance + amt;

    const tx: Transaction = {
      id: `TX-K${Math.floor(1000 + Math.random() * 9000)}`,
      accountNo: depositAccountNo,
      chequeNo: '-',
      type: 'DEPOSIT',
      amount: amt,
      ref: depositRef || 'মাটির ব্যাংক সঞ্চয় জমা',
      timestamp: new Date().toISOString(),
      previousBalance: targetAccount.balance,
      newBalance: newBal,
    };

    setDb((prev) => ({
      ...prev,
      adminVaultCash: prev.adminVaultCash + amt,
      accounts: prev.accounts.map((a) =>
        a.accountNo === depositAccountNo
          ? {
              ...a,
              balance: newBal,
              stars: a.stars + earnedStars,
            }
          : a
      ),
      transactions: [tx, ...prev.transactions],
    }));

    triggerConfetti();
    alert(`৳${amt} সফলভাবে জমা হয়েছে! ভল্ট ক্যাশে যোগ করা হয়েছে। ${earnedStars > 0 ? `+${earnedStars} 🌟 স্টার অর্জিত!` : ''}`);
    setDepositAmount('50');
  };

  // 3. STRICT CHEQUE WITHDRAWAL LOGIC (USER REQUEST: "চেক ছাড়া উত্তোলন সম্ভব নয়")
  const handleExecuteWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);

    if (!withdrawAccountNo) {
      alert('অনুগ্রহ করে হিসাব নম্বর নির্বাচন করুন!');
      return;
    }

    // STRICT CHECK ENFORCEMENT
    if (!withdrawChequeNo || !withdrawChequeNo.trim()) {
      alert('❌ সতর্কতা: চেক ছাড়া কোনো উত্তোলন সম্ভব নয়!\nদয়া করে সঠিক চেক নম্বর প্রদান করুন অথবা চেকবুক থেকে চেক নির্বাচন করুন।');
      return;
    }

    const account = db.accounts.find((a) => a.accountNo === withdrawAccountNo);
    if (!account) {
      alert('অকার্যকর অ্যাকাউন্ট!');
      return;
    }

    // Verify cheque existence in this account's chequebook
    const chequebook = db.chequebooks[withdrawAccountNo];
    if (!chequebook) {
      alert(`❌ এই অ্যাকাউন্টের কোনো চেকবুক পাওয়া যায়নি! চেক ছাড়া টাকা তোলা সম্ভব নয়।`);
      return;
    }

    const chequeLeaf = chequebook.leaves.find((l) => l.chequeNo === withdrawChequeNo.trim());
    if (!chequeLeaf) {
      alert(`❌ অকার্যকর চেক নম্বর! "${withdrawChequeNo}" নম্বরটি এই অ্যাকাউন্টের চেকবইয়ের অন্তর্ভুক্ত নয়।\nচেক ছাড়া উত্তোলন সম্ভব নয়!`);
      return;
    }

    if (chequeLeaf.status === 'CASHED') {
      alert(`❌ এই চেক পাতাটি (${withdrawChequeNo}) ইতিমধ্যে ক্যাশ করা হয়ে গেছে (তারিখ: ${chequeLeaf.cashedDate || 'পূর্বে'})!\nএকই চেক দ্বিতীয়বার ব্যবহার করা যাবে না।`);
      return;
    }

    if (chequeLeaf.status === 'CANCELLED') {
      alert(`❌ এই চেক পাতাটি বাতিল (Cancelled)! এটি দিয়ে ক্যাশ তোলা যাবে না।`);
      return;
    }

    if (isNaN(amt) || amt <= 0) {
      alert('উত্তোলনের সঠিক পরিমাণ লিখুন!');
      return;
    }

    if (amt > account.balance) {
      alert(`দুঃখিত! অ্যাকাউন্টে পর্যাপ্ত জমানো টাকা নেই। বর্তমান ব্যালেন্স: ৳${account.balance}`);
      return;
    }

    if (amt > db.adminVaultCash) {
      alert(`এডমিন ক্যাশ ভল্টে পর্যাপ্ত নগদ অর্থ নেই! বর্তমান ভল্ট ক্যাশ: ৳${db.adminVaultCash}`);
      return;
    }

    const newBal = account.balance - amt;
    const txId = `TX-K${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const tx: Transaction = {
      id: txId,
      accountNo: withdrawAccountNo,
      chequeNo: withdrawChequeNo.trim(),
      type: 'WITHDRAWAL',
      amount: amt,
      ref: `চেক ${withdrawChequeNo} ক্যাশ: ${withdrawRef || 'নগদ উত্তোলন'}`,
      timestamp: new Date().toISOString(),
      previousBalance: account.balance,
      newBalance: newBal,
    };

    // Update database: mark cheque as CASHED, adjust balances
    setDb((prev) => {
      const updatedLeaves = prev.chequebooks[withdrawAccountNo].leaves.map((l) =>
        l.chequeNo === withdrawChequeNo.trim()
          ? {
              ...l,
              status: 'CASHED' as const,
              amount: amt,
              amountInWords: numberToBanglaWords(amt),
              cashedDate: todayStr,
              reason: withdrawRef,
              transactionId: txId,
            }
          : l
      );

      return {
        ...prev,
        adminVaultCash: prev.adminVaultCash - amt,
        accounts: prev.accounts.map((a) =>
          a.accountNo === withdrawAccountNo ? { ...a, balance: newBal } : a
        ),
        chequebooks: {
          ...prev.chequebooks,
          [withdrawAccountNo]: {
            ...prev.chequebooks[withdrawAccountNo],
            leaves: updatedLeaves,
          },
        },
        transactions: [tx, ...prev.transactions],
      };
    });

    const recentTotalWithdrawn = getKidRecentWithdrawals(withdrawAccountNo) + amt;
    const isExceededProfit = recentTotalWithdrawn > (db.settings.withdrawalLimitForProfit || 200);

    triggerConfetti();
    alert(
      `✅ চেক ${withdrawChequeNo} সফলভাবে ক্যাশ সম্পন্ন হয়েছে!\n` +
        `উত্তোলিত নগদ অর্থ: ৳${amt}\n` +
        `নতুন স্থিতি: ৳${newBal}\n` +
        (isExceededProfit
          ? `⚠️ সতর্কতা: গত ২ মাসে মোট ৳${recentTotalWithdrawn} তোলায় ২ মাসের ১% লাভ বোনাস সাময়িকভাবে স্থগিত থাকবে।`
          : `🎉 ২ মাসের ১% লাভ পাওয়ার যোগ্যতা এখনো বজায় আছে (≤২০০৳ তোলা)!`)
    );

    setWithdrawAmount('');
    setWithdrawChequeNo('');
  };

  // Helper when user clicks "এই চেক দিয়ে ক্যাশ তুলুন" from chequebook
  const handleUseChequeFromBook = (chequeNo: string, prefillAmt?: number, prefillReason?: string) => {
    // Find which account this cheque belongs to
    for (const [accNo, book] of Object.entries(db.chequebooks)) {
      if (book.leaves.some((l) => l.chequeNo === chequeNo)) {
        setWithdrawAccountNo(accNo);
        setWithdrawChequeNo(chequeNo);
        if (prefillAmt) setWithdrawAmount(String(prefillAmt));
        if (prefillReason) setWithdrawRef(prefillReason);
        setActiveTab('cheque-withdraw');
        break;
      }
    }
  };

  // Cancel Cheque
  const handleCancelCheque = (chequeNo: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে চেক ${chequeNo} বাতিল (Cancel) করতে চান?`)) return;

    setDb((prev) => {
      const updatedChequebooks = { ...prev.chequebooks };
      for (const [accNo, book] of Object.entries(updatedChequebooks)) {
        const idx = book.leaves.findIndex((l) => l.chequeNo === chequeNo);
        if (idx !== -1) {
          book.leaves[idx] = { ...book.leaves[idx], status: 'CANCELLED' };
          break;
        }
      }
      return { ...prev, chequebooks: updatedChequebooks };
    });
  };

  // Write Cheque Leaf Online
  const handleWriteCheque = (
    accountNo: string,
    chequeNo: string,
    payeeName: string,
    amount: number,
    date?: string,
    reason?: string
  ) => {
    setDb((prev) => {
      const book = prev.chequebooks[accountNo];
      if (!book) return prev;
      const updatedLeaves = book.leaves.map((l) =>
        l.chequeNo === chequeNo
          ? {
              ...l,
              payeeName,
              amount,
              amountInWords: numberToBanglaWords(amount),
              reason: reason || 'প্রয়োজনীয় খরচ',
              issueDate: date || new Date().toISOString().split('T')[0],
            }
          : l
      );
      return {
        ...prev,
        chequebooks: {
          ...prev.chequebooks,
          [accountNo]: { ...book, leaves: updatedLeaves },
        },
      };
    });
  };

  // Tear & Submit Cheque to Admin for Cash (User Request: "চেক ছিরে পাঠালে আমি টাকা দিয়ে দিব")
  const handleTearAndSubmitCheque = (
    accountNo: string,
    chequeNo: string,
    payeeName?: string,
    amount?: number,
    reason?: string
  ) => {
    setDb((prev) => {
      const book = prev.chequebooks[accountNo];
      if (!book) return prev;
      const updatedLeaves = book.leaves.map((l) => {
        if (l.chequeNo === chequeNo) {
          const finalAmt = amount !== undefined ? amount : l.amount;
          const finalPayee = payeeName || l.payeeName || 'নিজ / নগদ ক্যাশ';
          const finalReason = reason || l.reason || 'খরচের জন্য উত্তোলন';
          return {
            ...l,
            status: 'TORN_SUBMITTED' as ChequeStatus,
            payeeName: finalPayee,
            amount: finalAmt,
            amountInWords: finalAmt ? numberToBanglaWords(finalAmt) : l.amountInWords,
            reason: finalReason,
            issueDate: l.issueDate || new Date().toISOString().split('T')[0],
            tornDate: new Date().toISOString().split('T')[0],
          };
        }
        return l;
      });
      return {
        ...prev,
        chequebooks: {
          ...prev.chequebooks,
          [accountNo]: { ...book, leaves: updatedLeaves },
        },
      };
    });

    triggerConfetti();
    alert(`✂️ চেক নং ${chequeNo} সফলভাবে ছিঁড়ে কাউন্টারে পাঠানো হয়েছে!\nএডমিন চেক যাচাই করে সরাসরি ক্যাশ টাকা দিয়ে দিবেন।`);
  };

  // Admin pays cash for a torn & presented cheque ("চেক ছিরে পাঠালে আমি টাকা দিয়ে দিব")
  const handlePayTornCheque = (chequeNo: string) => {
    let targetAccount: Account | undefined;
    let targetCheque: ChequeLeaf | undefined;

    for (const [accNo, book] of Object.entries(db.chequebooks)) {
      const found = book.leaves.find((l) => l.chequeNo === chequeNo);
      if (found) {
        targetCheque = found;
        targetAccount = db.accounts.find((a) => a.accountNo === accNo);
        break;
      }
    }

    if (!targetCheque || !targetAccount) {
      alert('চেক পাতা বা সংশ্লিষ্ট শিশু অ্যাকাউন্ট খুঁজে পাওয়া যায়নি!');
      return;
    }

    const amt = targetCheque.amount;
    if (!amt || amt <= 0) {
      alert('এই চেকে কোনো টাকার অংক লেখা নেই!');
      return;
    }

    if (targetAccount.balance < amt) {
      alert(`অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই! বর্তমান ব্যালেন্স: ৳${targetAccount.balance} কিন্তু চেকে চাওয়া হয়েছে: ৳${amt}`);
      return;
    }

    const newBal = targetAccount.balance - amt;
    const txId = `TX-W-${Date.now().toString().slice(-4)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const tx: Transaction = {
      id: txId,
      accountNo: targetAccount.accountNo,
      chequeNo: targetCheque.chequeNo,
      type: 'WITHDRAWAL',
      amount: amt,
      ref: `ছিঁড়ে পাঠানো চেক নং ${targetCheque.chequeNo} এর বিপরীতে ক্যাশ পরিশোধ (${targetCheque.payeeName || 'নিজ'})`,
      timestamp: new Date().toISOString(),
      previousBalance: targetAccount.balance,
      newBalance: newBal,
    };

    setDb((prev) => {
      const book = prev.chequebooks[targetAccount!.accountNo];
      const updatedLeaves = book.leaves.map((l) =>
        l.chequeNo === chequeNo
          ? {
              ...l,
              status: 'CASHED' as ChequeStatus,
              cashedDate: todayStr,
              transactionId: txId,
            }
          : l
      );

      return {
        ...prev,
        adminVaultCash: Math.max(0, prev.adminVaultCash - amt),
        accounts: prev.accounts.map((a) =>
          a.accountNo === targetAccount!.accountNo ? { ...a, balance: newBal } : a
        ),
        chequebooks: {
          ...prev.chequebooks,
          [targetAccount!.accountNo]: { ...book, leaves: updatedLeaves },
        },
        transactions: [tx, ...prev.transactions],
      };
    });

    triggerConfetti();
    alert(`💵 ক্যাশ পরিশোধ সফল হয়েছে!\n\nহিসাবধারী: ${targetAccount.name}\nচেক নং: ${targetCheque.chequeNo}\nপরিশোধিত নগদ অর্থ: ৳${amt}\nঅবশিষ্ট ব্যালেন্স: ৳${newBal}\n\nচেক পাতায় "PAID & CASHED" সিল মারা হয়েছে।`);
  };

  // Return torn cheque to book as available
  const handleReturnTornCheque = (chequeNo: string) => {
    setDb((prev) => {
      const updatedChequebooks = { ...prev.chequebooks };
      for (const [accNo, book] of Object.entries(updatedChequebooks)) {
        const idx = book.leaves.findIndex((l) => l.chequeNo === chequeNo);
        if (idx !== -1) {
          book.leaves[idx] = {
            ...book.leaves[idx],
            status: 'AVAILABLE' as ChequeStatus,
            tornDate: undefined,
          };
          break;
        }
      }
      return { ...prev, chequebooks: updatedChequebooks };
    });
    alert(`চেক নং ${chequeNo} পুনরায় চেকবইতে ফেরত রাখা হয়েছে।`);
  };

  // Reset an account's chequebook completely to clean blank leaves (User Request: "বইটি ভালো করে একেবারে খালি করে দাও অটো কোনকিছু থাকবেনা")
  const handleResetChequebookToBlank = (accountNo: string) => {
    setDb((prev) => {
      const book = prev.chequebooks[accountNo];
      if (!book) return prev;
      const blankLeaves = book.leaves.map((l) => ({
        ...l,
        status: 'AVAILABLE' as ChequeStatus,
        payeeName: undefined,
        amount: undefined,
        amountInWords: undefined,
        issueDate: undefined,
        cashedDate: undefined,
        tornDate: undefined,
        reason: undefined,
        transactionId: undefined,
        isAccountPayeeOnly: false,
      }));
      return {
        ...prev,
        chequebooks: {
          ...prev.chequebooks,
          [accountNo]: { ...book, leaves: blankLeaves },
        },
      };
    });
    alert(`🧹 চেকবইয়ের সব পাতা সম্পূর্ণ খালি (Blank) করা হয়েছে! কোনো অটো বা পূর্বনির্ধারিত তথ্য নেই।`);
  };

  // Reset ALL chequebooks in the entire bank to clean blank leaves
  const handleResetAllChequebooksToBlank = () => {
    setDb((prev) => {
      const updatedChequebooks = { ...prev.chequebooks };
      for (const [accNo, book] of Object.entries(updatedChequebooks)) {
        updatedChequebooks[accNo] = {
          ...book,
          leaves: book.leaves.map((l) => ({
            ...l,
            status: 'AVAILABLE' as ChequeStatus,
            payeeName: undefined,
            amount: undefined,
            amountInWords: undefined,
            issueDate: undefined,
            cashedDate: undefined,
            tornDate: undefined,
            reason: undefined,
            transactionId: undefined,
            isAccountPayeeOnly: false,
          })),
        };
      }
      return { ...prev, chequebooks: updatedChequebooks };
    });
    alert('🧹 ব্যাংকের সকল চেকবই সম্পূর্ণ খালি করা হয়েছে! কোনো পূর্ববর্তী বা অটো লেখা নেই।');
  };

  // Issue more leaves for an account
  const handleIssueMoreLeaves = (accountNo: string, count: number = 4) => {
    setDb((prev) => {
      const book = prev.chequebooks[accountNo] || createChequebookForAccount(accountNo, 0);
      const startNum = book.leaves.length + 1;
      const suffix = accountNo.split('-').pop() || '1001';
      const newLeaves: ChequeLeaf[] = [];

      for (let i = 0; i < count; i++) {
        const leafNo = startNum + i;
        const leafNoStr = String(leafNo).padStart(2, '0');
        newLeaves.push({
          id: `${accountNo}-${leafNoStr}`,
          chequeNo: `CHK-${suffix}-${leafNoStr}`,
          accountNo,
          leafNumber: leafNo,
          status: 'AVAILABLE',
          isAccountPayeeOnly: false,
        });
      }

      return {
        ...prev,
        chequebooks: {
          ...prev.chequebooks,
          [accountNo]: {
            ...book,
            totalLeaves: book.totalLeaves + count,
            leaves: [...book.leaves, ...newLeaves],
          },
        },
      };
    });
    alert(`${count}টি নতুন চেক পাতা যুক্ত করা হয়েছে!`);
  };

  // Create New Account
  const handleCreateAccount = (data: {
    name: string;
    age: number;
    guardianName: string;
    phone: string;
    goalItem?: string;
    goalAmount?: number;
    initialDeposit: number;
  }) => {
    const nextNum = 1000 + db.accounts.length + 1;
    const newAccNo = `AMAR-KIDS-${nextNum}`;

    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      accountNo: newAccNo,
      name: data.name,
      age: data.age,
      guardianName: data.guardianName,
      phone: data.phone,
      goalItem: data.goalItem ? data.goalItem.trim() : undefined,
      goalAmount: data.goalAmount && data.goalAmount > 0 ? data.goalAmount : undefined,
      goalClaimed: false,
      goalClaimedDate: null,
      balance: data.initialDeposit,
      stars: Math.floor(data.initialDeposit / 50),
      createdAt: new Date().toISOString(),
    };

    // Auto generate 6-leaf authentic chequebook (3 A4 pages with 2 cheques each)
    const newChequebook = createChequebookForAccount(newAccNo, 6);

    const tx: Transaction = {
      id: `TX-K${Math.floor(1000 + Math.random() * 9000)}`,
      accountNo: newAccNo,
      chequeNo: '-',
      type: 'DEPOSIT',
      amount: data.initialDeposit,
      ref: 'নতুন অ্যাকাউন্ট খোলার প্রারম্ভিক জমা',
      timestamp: new Date().toISOString(),
      previousBalance: 0,
      newBalance: data.initialDeposit,
    };

    setDb((prev) => ({
      ...prev,
      adminVaultCash: prev.adminVaultCash + data.initialDeposit,
      accounts: [newAccount, ...prev.accounts],
      chequebooks: {
        ...prev.chequebooks,
        [newAccNo]: newChequebook,
      },
      transactions: [tx, ...prev.transactions],
    }));

    triggerConfetti();
    alert(`অ্যাকাউন্ট ${newAccNo} সফলভাবে খোলা হয়েছে এবং ৬ পাতার A4 চেকবুক তৈরি হয়েছে!`);
  };

  // Issue Micro-Loan
  const handleIssueLoan = (accountNo: string, amount: number, reason: string) => {
    const newLoan: Loan = {
      id: `LN-${Math.floor(100 + Math.random() * 900)}`,
      accountNo,
      amount,
      paidAmount: 0,
      reason,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    const tx: Transaction = {
      id: `TX-K${Math.floor(1000 + Math.random() * 9000)}`,
      accountNo,
      chequeNo: '-',
      type: 'LOAN_ISSUE',
      amount,
      ref: `নতুন লোন প্রদান: ${reason}`,
      timestamp: new Date().toISOString(),
      previousBalance: 0,
      newBalance: 0,
    };

    setDb((prev) => ({
      ...prev,
      adminVaultCash: prev.adminVaultCash - amount,
      loans: [newLoan, ...prev.loans],
      transactions: [tx, ...prev.transactions],
    }));

    triggerConfetti();
    alert(`৳${amount} লোন সফলভাবে মঞ্জুর করা হয়েছে ও নগদ ক্যাশ দেওয়া হয়েছে।`);
  };

  // Repay Loan
  const handleRepayLoan = (loanId: string, amount: number) => {
    setDb((prev) => {
      const loan = prev.loans.find((l) => l.id === loanId);
      if (!loan) return prev;

      const newPaid = loan.paidAmount + amount;
      const isCompleted = newPaid >= loan.amount;

      const tx: Transaction = {
        id: `TX-K${Math.floor(1000 + Math.random() * 9000)}`,
        accountNo: loan.accountNo,
        chequeNo: '-',
        type: 'LOAN_REPAY',
        amount,
        ref: `লোন ${loan.id} কিস্তি পরিশোধ`,
        timestamp: new Date().toISOString(),
        previousBalance: 0,
        newBalance: 0,
      };

      return {
        ...prev,
        adminVaultCash: prev.adminVaultCash + amount,
        loans: prev.loans.map((l) =>
          l.id === loanId
            ? {
                ...l,
                paidAmount: newPaid,
                status: isCompleted ? 'PAID' : 'ACTIVE',
              }
            : l
        ),
        transactions: [tx, ...prev.transactions],
      };
    });

    triggerConfetti();
    alert(`৳${amount} কিস্তি সফলভাবে জমা হয়েছে!`);
  };

  // Apply 2-Month 1% Profit to all eligible
  const handleDistributeProfit = () => {
    let count = 0;
    let totalProfit = 0;
    const profitTxs: Transaction[] = [];

    const newAccounts = db.accounts.map((a) => {
      if (isEligibleForProfit(a.accountNo) && a.balance > 0) {
        const profit = Math.max(1, Math.round((a.balance * (db.settings.twoMonthProfitRate || 1.0)) / 100));
        if (profit > 0) {
          count++;
          totalProfit += profit;
          profitTxs.push({
            id: `TX-PRF-${Math.floor(1000 + Math.random() * 9000)}-${count}`,
            accountNo: a.accountNo,
            chequeNo: '-',
            type: 'PROFIT',
            amount: profit,
            ref: 'মাসিক ১% লাভ বোনাস বিতরণ',
            timestamp: new Date().toISOString(),
            previousBalance: a.balance,
            newBalance: a.balance + profit,
          });
          return {
            ...a,
            balance: a.balance + profit,
            stars: a.stars + 1,
          };
        }
      }
      return a;
    });

    if (count === 0) {
      alert('লাভ পাওয়ার যোগ্য কোনো অ্যাকাউন্ট পাওয়া যায়নি! (শর্ত: অ্যাকাউন্টে ব্যালেন্স থাকতে হবে এবং গত ২ মাসে ২০০ টাকার বেশি তোলা যাবে না)');
      return;
    }

    setDb((prev) => ({
      ...prev,
      accounts: newAccounts,
      transactions: [...profitTxs, ...prev.transactions],
    }));

    triggerConfetti();
    alert(`মোট ${count} জন শিশুকে ৳${totalProfit} লাভ বোনাস বিতরণ করা হয়েছে!`);
  };

  // Give 1% profit manually to a specific chosen account by clicking (User Request: "আর লাভ কাকে দেব তা এখান থেকে ক্লিক করে করে দিয়ে দিব।")
  const handleGiveProfitToAccount = (accountNo: string, customAmount?: number) => {
    const account = db.accounts.find((a) => a.accountNo === accountNo);
    if (!account) return;

    if (account.balance <= 0 && (!customAmount || customAmount <= 0)) {
      alert(`${account.name}-এর অ্যাকাউন্টে কোনো স্থিতি (ব্যালেন্স) নেই। লাভ দিতে হলে অ্যাকাউন্টে ন্যূনতম টাকা জমা থাকতে হবে।`);
      return;
    }

    const profit = customAmount !== undefined && customAmount > 0
      ? customAmount
      : Math.max(1, Math.round((account.balance * (db.settings.twoMonthProfitRate || 1.0)) / 100));

    const newBal = account.balance + profit;

    const tx: Transaction = {
      id: `TX-PRF-${Math.floor(1000 + Math.random() * 9000)}`,
      accountNo: account.accountNo,
      chequeNo: '-',
      type: 'PROFIT',
      amount: profit,
      ref: `মাসিক ১% লাভ বোনাস প্রদান (এডমিন সরাসরি)`,
      timestamp: new Date().toISOString(),
      previousBalance: account.balance,
      newBalance: newBal,
    };

    setDb((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.accountNo === accountNo
          ? {
              ...a,
              balance: newBal,
              stars: a.stars + 1,
            }
          : a
      ),
      transactions: [tx, ...prev.transactions],
    }));

    triggerConfetti();
    alert(`🎉 ${account.name}-কে ১% লাভ ৳${profit} সফলভাবে যোগ করে দেওয়া হয়েছে!\nনতুন ব্যালেন্স: ৳${newBal}`);
  };

  // Collect Admin's own 1% monthly profit (User Request: "আর আমারওতো মাসে ১% লাভ আসার কথা।")
  const handleCollectAdminProfit = () => {
    if (totalKidsDeposits <= 0) {
      alert('ব্যাংকে এখনো কোনো শিশু সঞ্চয় নেই। শিশুরা ব্যাংকে টাকা জমা রাখলে মোট আমানতের ওপর প্রতি মাসে আপনার ১% লাভ আসার কথা।');
      return;
    }

    const profitAmount = Math.max(1, Math.round(totalKidsDeposits * 0.01));
    const currentAdminProfit = db.adminEarnedProfit || 0;
    const newTotalAdminProfit = currentAdminProfit + profitAmount;

    const record: AdminProfitRecord = {
      id: `AP-${Date.now().toString().slice(-4)}`,
      amount: profitAmount,
      totalVaultAtTime: totalKidsDeposits,
      timestamp: new Date().toISOString(),
    };

    setDb((prev) => ({
      ...prev,
      adminEarnedProfit: newTotalAdminProfit,
      adminProfitHistory: [record, ...(prev.adminProfitHistory || [])],
    }));

    triggerConfetti();
    alert(
      `👑 অভিনন্দন এডমিন!\n\n` +
        `ব্যাংকের বর্তমান মোট আমানত: ৳${totalKidsDeposits.toLocaleString()}\n` +
        `আপনার মাসিক ১% অর্জিত লাভ: ৳${profitAmount.toLocaleString()}\n` +
        `এযাবৎ সর্বমোট সংগৃহীত লাভ: ৳${newTotalAdminProfit.toLocaleString()}`
    );
  };

  // Toggle Goal Claim Status
  const handleToggleGoalClaim = (accountNo: string) => {
    setDb((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => {
        if (a.accountNo === accountNo) {
          const nextClaimed = !a.goalClaimed;
          if (nextClaimed) triggerConfetti();
          return {
            ...a,
            goalClaimed: nextClaimed,
            goalClaimedDate: nextClaimed ? new Date().toISOString().split('T')[0] : null,
          };
        }
        return a;
      }),
    }));
  };

  // Calculations for Overview Stats
  const totalKidsDeposits = db.accounts.reduce((sum, a) => sum + a.balance, 0);
  const adminExpectedMonthlyProfit = totalKidsDeposits * 0.01;
  const totalLoansDue = db.loans
    .filter((l) => l.status === 'ACTIVE')
    .reduce((sum, l) => sum + (l.amount - l.paidAmount), 0);
  const activeLoanCount = db.loans.filter((l) => l.status === 'ACTIVE').length;
  const eligibleKidsCount = db.accounts.filter((a) => isEligibleForProfit(a.accountNo)).length;

  // Currently viewing account for Chequebook Modal
  const viewingAccount = db.accounts.find((a) => a.accountNo === viewingChequebookAccountNo);
  const viewingPassbookAccount = db.accounts.find((a) => a.accountNo === viewingPassbookAccountNo);

  // Available cheques for withdrawal selector
  const availableChequesForWithdrawal = withdrawAccountNo
    ? db.chequebooks[withdrawAccountNo]?.leaves.filter((l) => l.status === 'AVAILABLE') || []
    : [];

  // Find all torn & submitted cheques awaiting admin cash disbursement
  const pendingTornCheques: { account: Account; cheque: ChequeLeaf }[] = [];
  for (const account of db.accounts) {
    const book = db.chequebooks[account.accountNo];
    if (book) {
      for (const leaf of book.leaves) {
        if (leaf.status === 'TORN_SUBMITTED') {
          pendingTornCheques.push({ account, cheque: leaf });
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between z-20 shadow-xl no-print">
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-sky-500 flex items-center justify-center text-slate-950 shadow-lg font-black text-xl">
                <PiggyBank className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-base text-white leading-tight flex items-center gap-1">
                  <span>আমার ব্যাংক</span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                    ভল্ট
                  </span>
                </h1>
                <p className="text-[10px] text-amber-300">A4 চেকবুক ও ছোটদের সঞ্চয়</p>
              </div>
            </div>
          </div>

          {/* Admin Mode Badge */}
          <div className="mx-3 my-3 p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <div>
                <p className="text-[11px] font-bold text-slate-200">
                  {db.admins[db.currentAdminIndex]?.name || 'ভল্ট এডমিন'}
                </p>
                <p className="text-[9px] text-emerald-400">ক্যাশ ও চেক ভল্ট মোড</p>
              </div>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              পিন: 1234
            </span>
          </div>

          {/* Nav Items */}
          <nav className="px-2 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>ড্যাশবোর্ড ও ওভারভিউ</span>
            </button>

            <button
              onClick={() => setActiveTab('chequebooks')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'chequebooks'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <div className="text-left flex-1">
                <span className="block leading-none">A4 চেকবুক (২ চেক/পাতা)</span>
                <span className="text-[9px] text-sky-300 font-normal">আসল ব্যাংক বই ও প্রিন্ট</span>
              </div>
              {pendingTornCheques.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 font-mono animate-pulse">
                  {pendingTornCheques.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('cheque-withdraw')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'cheque-withdraw'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-rose-400" />
              <div className="text-left flex-1">
                <span className="block leading-none">চেক দিয়ে ক্যাশ উত্তোলন</span>
                <span className="text-[9px] text-rose-300 font-normal">চেক ছাড়া তোলা অসম্ভব</span>
              </div>
              {pendingTornCheques.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 font-mono animate-pulse">
                  {pendingTornCheques.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('quick-deposit')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'quick-deposit'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>মাটির ব্যাংক জমা কাউন্টার</span>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'accounts'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>সঞ্চয়ী তালিকা ও চেকবই</span>
            </button>

            <button
              onClick={() => setActiveTab('kid-loans')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'kid-loans'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Handshake className="w-4 h-4 text-cyan-400" />
              <span>ছোটদের লোন ও বাকির খাতা</span>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'goals'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Gift className="w-4 h-4 text-pink-400" />
              <span>স্বপ্নের উপহার ট্র্যাকার</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'transactions'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4 text-purple-400" />
              <span>সঞ্চয় খাতা ও ট্রানজেকশন</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'settings'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>২ মাসের লাভ ও ভল্ট সেটিংস</span>
            </button>
          </nav>
        </div>

        {/* BOTTOM ACTIONS: USER REQUEST - সব ডাটা মোছার বাটন & BACKUP */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {/* CELEBRATION BUTTON */}
          <button
            type="button"
            onClick={triggerConfetti}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> ঝাকানাকা উৎসব 🥳
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-semibold border border-slate-700 transition"
              title="JSON ব্যাকআপ ডাউনলোড"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" /> ব্যাকআপ
            </button>

            {/* USER REQUEST: "সব ডাটা মোছার বাটন দাও" */}
            <button
              type="button"
              id="clearAllDataSidebarBtn"
              onClick={() => setIsClearDataModalOpen(true)}
              className="flex items-center justify-center gap-1 p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-[11px] text-rose-400 font-bold border border-rose-500/30 transition shadow-sm"
              title="সব ডাটা সম্পূর্ণ মুছে ফেলুন"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" /> সব ডাটা মুছুন
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {/* TOP BAR */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 no-print">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>আমার ব্যাংক - কিডস সেভিংস & চেকবুক</span>
              <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                A4 ২-চেক স্ট্যান্ডার্ড
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              আসল ব্যাংকের মতো A4 চেকবই, চেক নম্বর বাধ্যতামূলক উত্তোলন, মাটির ব্যাংক জমা ও ২ মাসের ১% লাভ
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsNewAccountModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন শিশু অ্যাকাউন্ট</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cheque-withdraw')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-bold text-xs shadow-lg transition"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>চেক দিয়ে টাকা তোলন</span>
            </button>

            {/* Header Direct Clear Data Button */}
            <button
              type="button"
              onClick={() => setIsClearDataModalOpen(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold border border-rose-500/40 transition"
              title="সব ডাটা মোছার অপশন"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">সব ডাটা মুছুন</span>
            </button>
          </div>
        </header>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Zero Accounts Notification Banner */}
            {db.accounts.length === 0 && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0 text-2xl">
                    🪙
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                      <span>কোনো সঞ্চয়ী ব্যক্তি/শিশু নিবন্ধিত নেই — তাই ব্যাংকে টাকা ৳০.০০</span>
                    </h4>
                    <p className="text-xs text-amber-300/80 mt-1">
                      ব্যাংকের নীতি অনুযায়ী, কোনো গ্রাহক বা শিশু না থাকলে সিস্টেমে কোনো আমানত বা জমানো ক্যাশ টাকা থাকতে পারে না। স্বাভাবিকভাবেই ব্যালেন্স শূন্য।
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsNewAccountModalOpen(true)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>নতুন শিশু অ্যাকাউন্ট</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClearAllData('FRESH_DEMO')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                  >
                    ডেমো ডাটা লোড
                  </button>
                </div>
              </div>
            )}

            {/* TORN & SUBMITTED CHEQUES AWAITING CASH (User Request: "চেক ছিরে পাঠালে আমি টাকা দিয়ে দিব") */}
            {pendingTornCheques.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-orange-950/70 to-slate-900 border-2 border-amber-500/60 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-lg">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>জমা পড়া ছেঁড়া চেক ({toBanglaNumber(pendingTornCheques.length)}টি) — নগদ টাকা প্রদানের অপেক্ষায়!</span>
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                          ACTION REQUIRED
                        </span>
                      </h4>
                      <p className="text-xs text-amber-200/80 mt-0.5">
                        সঞ্চয়ী শিশু চেক পূরণ করে ছিঁড়ে কাউন্টারে জমা দিয়েছে। আপনি নিচের বোতামে চাপ দিয়ে সরাসরি ক্যাশ টাকা পরিশোধ করতে পারেন।
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pendingTornCheques.map(({ account, cheque }) => (
                    <div
                      key={cheque.chequeNo}
                      className="p-4 rounded-xl bg-slate-900/90 border border-amber-400/40 space-y-3 relative overflow-hidden shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[11px] font-bold text-sky-400 block">{account.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">হিসাব: {account.accountNo}</span>
                          </div>
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                            পাতা #{toBanglaNumber(cheque.leafNumber)}
                          </span>
                        </div>

                        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs">
                          <div className="flex justify-between text-slate-300">
                            <span>চেক নম্বর:</span>
                            <span className="font-mono text-amber-300 font-bold">{cheque.chequeNo}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>প্রাপক:</span>
                            <span className="text-white font-medium">{cheque.payeeName || 'নিজ / নগদ ক্যাশ'}</span>
                          </div>
                          {cheque.reason && (
                            <div className="flex justify-between text-slate-400 text-[11px]">
                              <span>উদ্দেশ্য:</span>
                              <span className="text-slate-300 italic">{cheque.reason}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-amber-400">
                            <span className="font-bold">টাকার পরিমাণ:</span>
                            <span className="text-lg font-black text-emerald-400 font-mono">
                              ৳{(cheque.amount || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handlePayTornCheque(cheque.chequeNo)}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span>💵 টাকা দিয়ে দিন</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReturnTornCheque(cheque.chequeNo)}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition"
                          title="বইতে ফেরত পাঠান"
                        >
                          ↩️ ফেরত
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stat Cards Grid - 5 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Card 1: Admin Hand Cash */}
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden border-l-4 border-l-emerald-400 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5" /> আমার কাছে নগদ ক্যাশ
                    </p>
                    <h3 className="text-2xl font-black text-emerald-300 mt-1">
                      ৳{(db.accounts.length === 0 ? 0 : db.adminVaultCash).toLocaleString('bn-BD', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <PiggyBank className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {db.accounts.length === 0 ? 'ব্যক্তি/অ্যাকাউন্ট নেই:' : 'বাচ্চাদের জমা অনুযায়ী:'}
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded-full ${
                    db.accounts.length === 0
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                      : 'text-emerald-400 bg-emerald-500/10'
                  }`}>
                    {db.accounts.length === 0 ? 'ক্যাশ ৳০.০০ (খালি)' : 'সুরক্ষিত নগদ 🔐'}
                  </span>
                </div>
              </div>

              {/* Card 2: Total Kids Deposits */}
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden border-l-4 border-l-sky-400 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                      বাচ্চাদের মোট সঞ্চয়
                    </p>
                    <h3 className="text-2xl font-black text-sky-300 mt-1">
                      ৳{totalKidsDeposits.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400">মোট সঞ্চয়ী শিশু:</span>
                  <span className="text-sky-300 font-bold">{db.accounts.length} জন</span>
                </div>
              </div>

              {/* Card 3: Admin Monthly 1% Profit (USER REQUEST: "আর আমারওতো মাসে ১% লাভ আসার কথা") */}
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden border-l-4 border-l-amber-400 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> আমার মাসিক ১% লাভ
                    </p>
                    <h3 className="text-2xl font-black text-amber-300 mt-1">
                      ৳{adminExpectedMonthlyProfit.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <Coins className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400">মোট সংগৃহীত: ৳{(db.adminEarnedProfit || 0).toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={handleCollectAdminProfit}
                    className="font-bold text-[11px] px-2.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition shadow"
                    title="আমার মাসিক ১% লাভ সংগ্রহ করুন"
                  >
                    লাভ নিন 👑
                  </button>
                </div>
              </div>

              {/* Card 4: Active Loans */}
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden border-l-4 border-l-cyan-400 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      ছোটদের মোট লোন (বকেয়া)
                    </p>
                    <h3 className="text-2xl font-black text-cyan-300 mt-1">
                      ৳{totalLoansDue.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                    <Handshake className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400">চলতি লোন সংখ্যা:</span>
                  <span className="text-cyan-300 font-bold">{activeLoanCount} টি</span>
                </div>
              </div>

              {/* Card 5: Profit Status */}
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden border-l-4 border-l-purple-400 shadow-xl sm:col-span-2 lg:col-span-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                      ২ মাসের ১% লাভে যোগ্য
                    </p>
                    <h3 className="text-2xl font-black text-purple-300 mt-1">
                      {eligibleKidsCount} জন
                    </h3>
                  </div>
                  <div className="p-3 bg-purple-500/10 text-purple-300 rounded-xl border border-purple-500/20">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400">শর্ত: ২ মাসে ≤২০০৳ তোলা</span>
                  <span className="text-purple-300 font-bold">১% বোনাস 📈</span>
                </div>
              </div>
            </div>

            {/* DEDICATED USER REQUEST PANEL 1: ADMIN'S OWN 1% MONTHLY PROFIT BANNER */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl flex-shrink-0 shadow">
                  👑
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>আমার (এডমিন) মাসিক ১% ব্যাংক প্রফিট</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                      মাসিক ১% নিয়ম
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    ব্যাংকের মোট জমানো আমানত <strong className="text-amber-300">৳{totalKidsDeposits.toLocaleString()}</strong> এর ওপর প্রতি মাসে আপনার প্রাপ্য ১% লাভ হলো <strong className="text-emerald-400">৳{adminExpectedMonthlyProfit.toLocaleString()}</strong>। (সর্বমোট সংগৃহীত: ৳{(db.adminEarnedProfit || 0).toLocaleString()})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCollectAdminProfit}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4 text-slate-950" />
                  <span>আমার ১% লাভ সংগ্রহ করুন (৳{adminExpectedMonthlyProfit.toLocaleString()})</span>
                </button>
              </div>
            </div>

            {/* DEDICATED USER REQUEST PANEL 2: CLICK TO GIVE 1% PROFIT TO EACH ACCOUNT */}
            <div className="bg-slate-900/90 border border-purple-500/30 p-5 rounded-2xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>সঞ্চয়ীদের ১% লাভ বণ্টন (ক্লিক করে যাকে খুশি লাভ দিন)</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                        সরাসরি অ্যাকশন
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      নিচের তালিকা থেকে যে কাউকে সরাসরি ১ ক্লিকে ১% লাভ যোগ করে দিতে পারবেন।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDistributeProfit}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 font-bold text-xs shadow transition"
                  >
                    যোগ্য সবাইকে একসাথে দিন ⚡
                  </button>
                </div>
              </div>

              {db.accounts.length === 0 ? (
                <div className="p-6 text-center bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-300">কোনো সঞ্চয়ী শিশু নেই</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    অ্যাকাউন্ট খুললে এখানে শিশুদের নাম ও ১ ক্লিকে ১% লাভ দেওয়ার বোতাম চলে আসবে।
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsNewAccountModalOpen(true)}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1 shadow"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>নতুন শিশু অ্যাকাউন্ট</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {db.accounts.map((acc) => {
                    const profitAmt = Math.max(1, Math.round(acc.balance * 0.01));
                    const eligible = isEligibleForProfit(acc.accountNo);

                    return (
                      <div
                        key={acc.accountNo}
                        className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 hover:border-purple-500/50 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-500/30 text-purple-200 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {acc.name.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-white truncate">{acc.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{acc.accountNo}</p>
                            <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
                              ব্যালেন্স: ৳{acc.balance.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <button
                            type="button"
                            onClick={() => handleGiveProfitToAccount(acc.accountNo)}
                            disabled={acc.balance <= 0}
                            className={`px-3 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow ${
                              acc.balance <= 0
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/30'
                            }`}
                            title={`${acc.name}-কে ১% লাভ ৳${profitAmt} প্রদান করুন`}
                          >
                            <span>🎁 ১% লাভ দিন</span>
                            <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px]">
                              +৳{profitAmt}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notice Banner: Cheque rule */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-sky-950/50 border border-sky-500/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-sky-400/20 text-sky-400 flex items-center justify-center text-xl flex-shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>ঝাকানাকা মূল ব্যাংকিং নীতি: চেক ছাড়া ক্যাশ তোলা সম্পূর্ণ নিষিদ্ধ!</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    টাকা তুলতে চাইলে শিশুকে তার নিজস্ব A4 চেকবইয়ের চেক পাতা নিয়ে আসতে হবে। চেকে অভিভাবকের স্বাক্ষর নিয়ে কাউন্টারে জমা দিলে ক্যাশ দেওয়া হবে।
                  </p>
                </div>
              </div>
            </div>

            {/* 2-Column Section: Kids Accounts & Top Savers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kids Accounts Quick List */}
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>সঞ্চয়ী শিশুদের তালিকা ও চেকবুক অ্যাকশন</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('accounts')}
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    সকল অ্যাকাউন্ট দেখুন →
                  </button>
                </div>

                <div className="space-y-3">
                  {db.accounts.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                      <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-300">কোনো শিশু অ্যাকাউন্ট নেই</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        নতুন অ্যাকাউন্ট খুললে এখানে শিশুদের নাম ও চেকবুক অপশন দেখাবে।
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsNewAccountModalOpen(true)}
                        className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition inline-flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>অ্যাকাউন্ট খুলুন</span>
                      </button>
                    </div>
                  ) : (
                    db.accounts.slice(0, 4).map((acc) => {
                      const leaves = db.chequebooks[acc.accountNo]?.leaves || [];
                      const availCheques = leaves.filter((l) => l.status === 'AVAILABLE').length;

                      return (
                        <div
                          key={acc.accountNo}
                          className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-brand-700 text-white flex items-center justify-center font-bold text-sm shadow">
                              {acc.name.slice(0, 1)}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-100">{acc.name}</p>
                              <p className="text-[11px] font-mono text-amber-400">
                                {acc.accountNo} | বয়স: {acc.age} বছর
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-sm font-black text-emerald-400 block">
                                ৳{acc.balance.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-sky-300">
                                {availCheques}টি চেক প্রস্তুত
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingChequebookAccountNo(acc.accountNo)}
                                className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs border border-sky-500/30 transition flex items-center gap-1"
                                title="A4 চেকবুক খুলুন"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>চেকবুক</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setViewingPassbookAccountNo(acc.accountNo)}
                                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                                title="খাতা দেখুন"
                              >
                                খাতা
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>ঝাকানাকা সেরা সঞ্চয়ী স্টারস</span>
                  </h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    টপ স্টারস
                  </span>
                </div>

                <div className="space-y-3">
                  {db.accounts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      কোনো সঞ্চয়ী শিশু ডাটা নেই।
                    </div>
                  ) : (
                    [...db.accounts]
                      .sort((a, b) => b.stars - a.stars)
                      .slice(0, 5)
                      .map((acc, idx) => (
                        <div
                          key={acc.accountNo}
                          className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                                idx === 0
                                  ? 'bg-amber-400 text-slate-950 shadow'
                                  : idx === 1
                                  ? 'bg-slate-300 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-100">{acc.name}</p>
                              <p className="text-[10px] text-pink-400">{acc.goalItem || 'সাধারণ সঞ্চয়'}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-amber-400 flex items-center justify-end gap-1">
                              <span>{acc.stars}</span>
                              <Star className="w-3 h-3 fill-amber-400" />
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold block">
                              ৳{acc.balance}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: A4 CHEQUEBOOK SHELF & VIEWER (USER REQUEST) */}
        {activeTab === 'chequebooks' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sky-400" />
                  <span>আসল ব্যাংকের মতো চেকবই (A4 পেজে ২টি চেক)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  চেকবইয়ের মাপ A4 পেজ, একটি A4 পাতায় উপর-নিচ ২টি চেক থাকবে। ছিদ্রযুক্ত দাগ থেকে কেটে টাকা উত্তোলন করতে হবে।
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedShelfAccountNo}
                  onChange={(e) => setSelectedShelfAccountNo(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-amber-400 outline-none w-full md:w-auto"
                >
                  <option value="">-- সঞ্চয়ী চেকবুক নির্বাচন করুন --</option>
                  {db.accounts.map((a) => (
                    <option key={a.accountNo} value={a.accountNo}>
                      {a.name} ({a.accountNo}) - স্থিতি: ৳{a.balance}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Printer className="w-4 h-4" />
                  <span>A4 চেকবুক প্রিন্ট</span>
                </button>
              </div>
            </div>

            {/* Selected Account Chequebook View */}
            {selectedShelfAccountNo ? (
              (() => {
                const targetAccount = db.accounts.find((a) => a.accountNo === selectedShelfAccountNo);
                const book = db.chequebooks[selectedShelfAccountNo];
                const leaves = book?.leaves || [];

                // Pair into A4 pages (2 cheques per page)
                const pages: ChequeLeaf[][] = [];
                for (let i = 0; i < leaves.length; i += 2) {
                  pages.push(leaves.slice(i, i + 2));
                }

                return (
                  <div className="space-y-6">
                    {/* Account Chequebook Banner */}
                    <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-700/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-slate-400">হিসাবধারী: </span>
                        <span className="font-bold text-white text-sm">{targetAccount?.name}</span>
                        <span className="text-amber-400 font-mono ml-2">({selectedShelfAccountNo})</span>
                        <span className="ml-3 text-slate-400">মোট পাতা: </span>
                        <span className="font-bold text-sky-300">{leaves.length}টি চেক ({pages.length}টি A4 পেজ)</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`আপনি কি এই চেকবইটি সম্পূর্ণ খালি (Blank) করতে চান? কোনো অটো বা পূর্বনির্ধারিত লেখা থাকবে না।`)) {
                              handleResetChequebookToBlank(selectedShelfAccountNo);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 font-bold border border-slate-700 transition flex items-center gap-1.5"
                          title="চেকবইয়ের সব পাতা খালি করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>বইটি খালি করুন</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIssueMoreLeaves(selectedShelfAccountNo, 4)}
                          className="px-3 py-1.5 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 font-bold border border-sky-500/40 transition"
                        >
                          +৪ পাতা যোগ করুন
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingChequebookAccountNo(selectedShelfAccountNo)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 font-bold shadow transition"
                        >
                          চেক পূরণ বা এডিট করুন ✍️
                        </button>
                      </div>
                    </div>

                    {/* A4 Printable Sheets (2 cheques each) */}
                    <div id="chequebook-print-container" className="space-y-8">
                      {pages.map((pair, pIdx) => (
                        <div
                          key={pIdx}
                          className="a4-cheque-page rounded-2xl bg-slate-900/80 p-4 sm:p-6 border-2 border-dashed border-slate-700 space-y-6 shadow-2xl"
                        >
                          <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs text-slate-400 no-print">
                            <span className="font-bold text-sky-400">
                              📄 A4 কাগজ #{toBanglaNumber(pIdx + 1)} (উপরের চেক ও নিচের চেক)
                            </span>
                            <span className="font-mono text-[11px]">স্ট্যান্ডার্ড A4 সাইজ (210 x 297 mm)</span>
                          </div>

                          {/* Cheque 1 */}
                          {pair[0] && (
                            <ChequeLeafComponent
                              cheque={pair[0]}
                              account={targetAccount}
                              indexOnPage={1}
                              onUseForWithdrawal={(chequeNo) =>
                                handleUseChequeFromBook(chequeNo, pair[0].amount, pair[0].reason)
                              }
                              onCancelCheque={handleCancelCheque}
                              onWriteCheque={handleWriteCheque}
                              onTearAndSubmit={(chequeNo, payee, amt, rsn) =>
                                handleTearAndSubmitCheque(selectedShelfAccountNo, chequeNo, payee, amt, rsn)
                              }
                              onPayTornCheque={handlePayTornCheque}
                              onReturnTornCheque={handleReturnTornCheque}
                            />
                          )}

                          {/* Perforation line */}
                          <div className="flex items-center justify-center gap-2 py-2 text-slate-400 select-none">
                            <span className="border-t-2 border-dashed border-sky-400/80 flex-1"></span>
                            <span className="text-[11px] font-bold bg-slate-800 px-3 py-0.5 rounded-full border border-slate-700 flex items-center gap-1.5 text-slate-300">
                              ✂️ A4 পেজের মাঝের কাটার দাগ (Tear / Cut Here)
                            </span>
                            <span className="border-t-2 border-dashed border-sky-400/80 flex-1"></span>
                          </div>

                          {/* Cheque 2 */}
                          {pair[1] && (
                            <ChequeLeafComponent
                              cheque={pair[1]}
                              account={targetAccount}
                              indexOnPage={2}
                              onUseForWithdrawal={(chequeNo) =>
                                handleUseChequeFromBook(chequeNo, pair[1].amount, pair[1].reason)
                              }
                              onCancelCheque={handleCancelCheque}
                              onWriteCheque={handleWriteCheque}
                              onTearAndSubmit={(chequeNo, payee, amt, rsn) =>
                                handleTearAndSubmitCheque(selectedShelfAccountNo, chequeNo, payee, amt, rsn)
                              }
                              onPayTornCheque={handlePayTornCheque}
                              onReturnTornCheque={handleReturnTornCheque}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-12 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p>চেকবই দেখার জন্য উপরে একটি সঞ্চয়ী শিশু অ্যাকাউন্ট নির্বাচন করুন।</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CHEQUE WITHDRAWAL (STRICT CHECK MANDATORY - USER REQUEST) */}
        {activeTab === 'cheque-withdraw' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border-2 border-rose-500/40 p-6 rounded-2xl space-y-6 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-rose-400 flex items-center gap-2">
                    <FileCheck2 className="w-6 h-6 text-rose-400" />
                    <span>চেক পাতা নম্বর দিয়ে ক্যাশ উত্তোলন কাউন্টার</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    <strong className="text-amber-400">বাধ্যতামূলক নিয়ম:</strong> চেক ছাড়া উত্তোলন সম্ভব নয়! সঞ্চয়ীর চেকবুক থেকে চেক নম্বর যাচায় ছাড়া ক্যাশ দেওয়া হবে না।
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-rose-500/30">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">নিরাপদ চেক ভেরিফিকেশন</span>
                </div>
              </div>

              {/* TORN & SUBMITTED CHEQUES READY FOR 1-CLICK CASHING */}
              {pendingTornCheques.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-amber-400" />
                      <span>ছিঁড়ে জমা দেওয়া চেক ({toBanglaNumber(pendingTornCheques.length)}টি) — ১-ক্লিকেই ক্যাশ পরিশোধ করুন:</span>
                    </h4>
                    <span className="text-[11px] text-amber-400 font-bold">কাউন্টার ক্যাশ রিসিভ</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pendingTornCheques.map(({ account, cheque }) => (
                      <div
                        key={cheque.chequeNo}
                        className="p-3 bg-slate-950/80 rounded-xl border border-slate-700 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{account.name}</div>
                          <div className="text-[11px] text-amber-400 font-mono">{cheque.chequeNo} • ৳{(cheque.amount || 0).toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400">{cheque.payeeName}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handlePayTornCheque(cheque.chequeNo)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow transition"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>ক্যাশ দিন</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReturnTornCheque(cheque.chequeNo)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition"
                            title="বইতে ফেরত"
                          >
                            ↩️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleExecuteWithdrawal} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4 text-xs">
                  {/* Account Selector */}
                  <div>
                    <label className="block text-slate-200 font-bold mb-1.5">
                      ১. সঞ্চয়ী শিশু ও হিসাব নম্বর নির্বাচন করুন *
                    </label>
                    <select
                      value={withdrawAccountNo}
                      onChange={(e) => {
                        setWithdrawAccountNo(e.target.value);
                        setWithdrawChequeNo('');
                      }}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:border-rose-500 outline-none font-medium"
                    >
                      <option value="">-- একাউন্ট নম্বর বেছে নিন --</option>
                      {db.accounts.map((a) => (
                        <option key={a.accountNo} value={a.accountNo}>
                          {a.name} [{a.accountNo}] - জমানো ব্যালেন্স: ৳{a.balance.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cheque Selector / Input - STRICT MANDATE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-slate-200 font-bold">
                          ২. চেক পাতা নম্বর (Cheque No) *
                        </label>
                        {availableChequesForWithdrawal.length > 0 && (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            {availableChequesForWithdrawal.length}টি প্রস্তুত পাতা আছে
                          </span>
                        )}
                      </div>

                      {/* Dropdown for available cheques + manual input fallback */}
                      {availableChequesForWithdrawal.length > 0 ? (
                        <select
                          value={withdrawChequeNo}
                          onChange={(e) => setWithdrawChequeNo(e.target.value)}
                          required
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-amber-400 font-bold focus:border-rose-500 outline-none"
                        >
                          <option value="">-- অব্যবহৃত চেক পাতা বেছে নিন --</option>
                          {availableChequesForWithdrawal.map((l) => (
                            <option key={l.chequeNo} value={l.chequeNo}>
                              {l.chequeNo} (পাতা #{l.leafNumber})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={withdrawChequeNo}
                          onChange={(e) => setWithdrawChequeNo(e.target.value)}
                          placeholder="যেমন: CHK-1001-02"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-amber-400 font-bold focus:border-rose-500 outline-none"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-200 font-bold mb-1.5">
                        ৩. উত্তোলনের পরিমাণ (BDT ৳) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="যেমন: 150"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-rose-400 focus:border-rose-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      ৪. উত্তোলনের কারণ / খরচের খাত
                    </label>
                    <input
                      type="text"
                      value={withdrawRef}
                      onChange={(e) => setWithdrawRef(e.target.value)}
                      placeholder="যেমন: বইমেলায় নতুন বিজ্ঞান বই কেনা"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-rose-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2 transform active:scale-98"
                  >
                    <FileCheck2 className="w-5 h-5" />
                    <span>চেক নম্বর দিয়ে ক্যাশ অনুমোদন ও উত্তোলন নিশ্চিত করুন 💵</span>
                  </button>
                </div>

                {/* Live Cheque Verification Preview */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-rose-400 uppercase tracking-wider border-b border-slate-800 pb-2.5 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-400" />
                      <span>চেক ক্লিয়ারেন্স স্ট্যাটাস</span>
                    </h4>

                    {withdrawAccountNo ? (
                      (() => {
                        const target = db.accounts.find((a) => a.accountNo === withdrawAccountNo);
                        const amt = parseFloat(withdrawAmount) || 0;
                        const remBal = target ? Math.max(0, target.balance - amt) : 0;
                        const recentWithdrawn = getKidRecentWithdrawals(withdrawAccountNo);

                        return (
                          <div className="space-y-3 mt-3">
                            <div className="flex justify-between py-1 border-b border-slate-800">
                              <span className="text-slate-400">হিসাবধারীর নাম:</span>
                              <span className="font-bold text-slate-100">{target?.name}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800">
                              <span className="text-slate-400">চেক নম্বর:</span>
                              <span className="font-mono font-bold text-amber-400">
                                {withdrawChequeNo || 'দেওয়া হয়নি'}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800">
                              <span className="text-slate-400">বর্তমান গচ্ছিত টাকা:</span>
                              <span className="font-bold text-emerald-400">
                                ৳{target?.balance.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800">
                              <span className="text-slate-400">উত্তোলনের পর ব্যালেন্স:</span>
                              <span className="font-bold text-slate-200">
                                ৳{remBal.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800">
                              <span className="text-slate-400">বিগত ২ মাসে তোলা:</span>
                              <span className="font-bold text-amber-300">
                                ৳{recentWithdrawn.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-slate-500 py-6 text-center">
                        বামপাশে একটি একাউন্ট নম্বর নির্বাচন করুন।
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-[11px] text-rose-200 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>কঠোর নিয়মাবলী:</span>
                    </p>
                    <p>• চেক পাতা ছাড়া কোনো টাকা দেওয়া হবে না।</p>
                    <p>• ২ মাসে ≤২০০ টাকা তুললে ১% লাভ বোনাস বহাল থাকে।</p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: QUICK DEPOSIT COUNTER (মাটির ব্যাংক জমা) */}
        {activeTab === 'quick-deposit' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border-2 border-emerald-500/30 p-6 rounded-2xl space-y-6 shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                    <Coins className="w-6 h-6 text-emerald-400" />
                    <span>মাটির ব্যাংক ও পকেট মানি জমা কাউন্টার</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ১০৳, ২০৳, ৫০৳ বা ১০০৳ ১-ক্লিকেই জমা করুন ও এডমিন ক্যাশ ভল্ট বৃদ্ধি করুন
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-emerald-500/30">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-semibold text-slate-200">প্রতি ৫০৳ জমায় ১টি স্টার 🌟</span>
                </div>
              </div>

              <form onSubmit={handleExecuteDeposit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5 text-xs">
                  <div>
                    <label className="block text-slate-200 font-bold mb-2">
                      ১. সঞ্চয়ী শিশু নির্বাচন করুন (হিসাব নম্বর সহ) *
                    </label>
                    <select
                      value={depositAccountNo}
                      onChange={(e) => setDepositAccountNo(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:border-emerald-500 outline-none"
                    >
                      <option value="">-- সঞ্চয়ী বাচ্চা নির্বাচন করুন --</option>
                      {db.accounts.map((a) => (
                        <option key={a.accountNo} value={a.accountNo}>
                          {a.name} [{a.accountNo}] - বর্তমান জমানো: ৳{a.balance.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preset Amount Buttons */}
                  <div>
                    <label className="block text-slate-200 font-bold mb-2">
                      ২. জমার পরিমাণ বেছে নিন (Quick Preset Buttons)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[10, 20, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(String(amt))}
                          className={`p-3.5 rounded-2xl border text-center transition group shadow-md ${
                            depositAmount === String(amt)
                              ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold'
                              : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50 text-slate-300'
                          }`}
                        >
                          <span className="block text-[10px] text-slate-400">
                            {amt === 10
                              ? 'পকেট মানি'
                              : amt === 20
                              ? 'টিফিন সঞ্চয়'
                              : amt === 50
                              ? 'মাটির ব্যাংক'
                              : 'উপহার / বকশিশ'}
                          </span>
                          <span className="text-xl font-black text-emerald-400">৳{amt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        কাস্টম জমার পরিমাণ (৳)
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="যেমন: 50"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-emerald-400 font-bold focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        জমার উৎস / বিবরণ
                      </label>
                      <input
                        type="text"
                        value={depositRef}
                        onChange={(e) => setDepositRef(e.target.value)}
                        placeholder="যেমন: মাটির ব্যাংক বা ঈদ উপহার"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition flex items-center justify-center gap-2 transform active:scale-98"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>সঞ্চয় জমা নিশ্চিত করুন ও নগদ ভল্টে যোগ করুন 🪙</span>
                  </button>
                </div>

                {/* Deposit Preview */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2.5 flex items-center gap-2">
                      <ReceiptText className="w-4 h-4 text-amber-400" />
                      <span>জমা রসিদ প্রিভিউ</span>
                    </h4>

                    {depositAccountNo ? (
                      (() => {
                        const target = db.accounts.find((a) => a.accountNo === depositAccountNo);
                        const amt = parseFloat(depositAmount) || 0;
                        const newBal = (target?.balance || 0) + amt;

                        return (
                          <div className="space-y-3 mt-3">
                            <div className="flex justify-between py-1 border-b border-slate-800">
                              <span className="text-slate-400">নির্বাচিত শিশু:</span>
                              <span className="font-bold text-slate-100">{target?.name}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800">
                              <span className="text-slate-400">বর্তমান ব্যালেন্স:</span>
                              <span className="font-bold text-slate-200">
                                ৳{target?.balance.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800">
                              <span className="text-slate-400">জমা হতে চলেছে:</span>
                              <span className="font-bold text-emerald-400 text-base">
                                +৳{amt.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800">
                              <span className="text-slate-400">নতুন ব্যালেন্স হবে:</span>
                              <span className="font-bold text-amber-400 text-base">
                                ৳{newBal.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-slate-500 py-6 text-center">
                        সঞ্চয়ী শিশু নির্বাচন করলে সামারি প্রদর্শিত হবে।
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto mb-1 animate-spin" />
                    <p className="text-[11px] text-amber-300 font-bold">
                      প্রতি ৫০৳ জমায় শিশু ১টি করে ঝাকানাকা স্টার পাবে!
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: ACCOUNTS MANAGEMENT */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
              <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    placeholder="নাম বা হিসাব নং দিয়ে খুঁজুন..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={accountAgeFilter}
                  onChange={(e) => setAccountAgeFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="ALL">সকল বয়সের শিশু</option>
                  <option value="JUNIOR">ছোট (৫ - ৮ বছর)</option>
                  <option value="SENIOR">কিশোর (৯ - ১৫ বছর)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsNewAccountModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>নতুন শিশু অ্যাকাউন্ট</span>
              </button>
            </div>

            {/* Accounts Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/90 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">সঞ্চয়ী শিশুর নাম ও হিসাব নং</th>
                      <th className="p-4">অভিভাবক ও ফোন</th>
                      <th className="p-4">স্বপ্নের লক্ষ্য (Goal)</th>
                      <th className="p-4">মোট সঞ্চয়</th>
                      <th className="p-4">২ মাসের ১% লাভ</th>
                      <th className="p-4 text-center">আসল A4 চেকবুক ও খাতা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {db.accounts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400">
                          <Users className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                          <p className="font-bold text-slate-200 text-sm">কোনো সঞ্চয়ী ব্যক্তি বা শিশু নেই</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                            ব্যাংকের নিয়ম অনুযায়ী, কোনো ব্যক্তি/অ্যাকাউন্ট না থাকলে গ্রাহকদের জমানো টাকা এবং ভল্ট ক্যাশ স্বাভাবিকভাবেই ৳০.০০। নতুন সঞ্চয়ী শিশু যুক্ত করতে বাটনে চাপ দিন।
                          </p>
                          <div className="mt-4 flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => setIsNewAccountModalOpen(true)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow"
                            >
                              <PlusCircle className="w-4 h-4" />
                              <span>নতুন শিশু অ্যাকাউন্ট যোগ করুন</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClearAllData('FRESH_DEMO')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700"
                            >
                              ডেমো ডাটা লোড
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      db.accounts
                        .filter((a) => {
                          const matchText =
                            a.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
                            a.accountNo.toLowerCase().includes(accountSearch.toLowerCase()) ||
                            a.phone.includes(accountSearch);
                          let matchAge = true;
                          if (accountAgeFilter === 'JUNIOR') matchAge = a.age <= 8;
                          if (accountAgeFilter === 'SENIOR') matchAge = a.age > 8;
                          return matchText && matchAge;
                        })
                        .map((acc) => {
                          const eligible = isEligibleForProfit(acc.accountNo);
                          const book = db.chequebooks[acc.accountNo];
                          const availCheques =
                            book?.leaves.filter((l) => l.status === 'AVAILABLE').length || 0;

                          return (
                            <tr key={acc.accountNo} className="hover:bg-slate-800/40 transition">
                              <td className="p-4">
                                <p className="font-bold text-sm text-slate-100">{acc.name}</p>
                                <p className="font-mono text-amber-400 text-[11px]">
                                  {acc.accountNo} | বয়স: {acc.age} বছর
                                </p>
                              </td>
                              <td className="p-4">
                                <p className="text-slate-200 font-semibold">{acc.guardianName}</p>
                                <p className="text-slate-400 text-[10px]">{acc.phone}</p>
                              </td>
                              <td className="p-4">
                                <p className="text-pink-300 font-bold">{acc.goalItem || 'সাধারণ সঞ্চয়'}</p>
                                <p className="text-[10px] text-slate-400">
                                  {acc.goalAmount ? `বাজেট: ৳${acc.goalAmount.toLocaleString()}` : 'ড্রিম বাজেট নির্দিষ্ট নয়'}
                                </p>
                              </td>
                              <td className="p-4 font-black text-emerald-400 text-sm">
                                ৳{acc.balance.toLocaleString()}
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  {eligible ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1 w-fit text-[11px]">
                                      <CheckCircle2 className="w-3 h-3" /> ১% লাভ যোগ্য
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1 w-fit text-[11px]">
                                      <AlertCircle className="w-3 h-3" /> &gt;২০০৳ তোলায় স্থগিত
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleGiveProfitToAccount(acc.accountNo)}
                                    disabled={acc.balance <= 0}
                                    className="px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold border border-purple-500/40 text-[10px] flex items-center gap-1 disabled:opacity-40 transition"
                                    title="ক্লিক করে এই শিশুকে ১% লাভ দিন"
                                  >
                                    <Gift className="w-2.5 h-2.5" />
                                    <span>১% লাভ দিন (+৳{Math.max(1, Math.round(acc.balance * 0.01))})</span>
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setViewingChequebookAccountNo(acc.accountNo)}
                                    className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold border border-sky-500/30 transition flex items-center gap-1"
                                    title="A4 চেকবুক খুলুন"
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>চেকবুক ({availCheques})</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setViewingPassbookAccountNo(acc.accountNo)}
                                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/30 transition flex items-center gap-1"
                                    title="সঞ্চয় খাতা"
                                  >
                                    <span>খাতা</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAccount(acc.accountNo)}
                                    className="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-bold border border-rose-500/30 transition flex items-center gap-1"
                                    title="অ্যাকাউন্ট ক্লোজ ও মুছুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">মুছুন</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: KID MICRO-LOANS */}
        {activeTab === 'kid-loans' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-cyan-400" />
                  <span>ছোটদের লোন ও বাকির খাতা ট্র্যাকার</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  জমানো টাকায় সাইকেল বা বইয়ের দাম না কুলোলে এডমিন থেকে ছোটদের লোন অনুমোদন দিন ও কিস্তির হিসাব রাখুন
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewLoanModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>নতুন লোন অনুমোদন দিন</span>
              </button>
            </div>

            {/* Loans Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/90 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">লোন আইডি ও তারিখ</th>
                      <th className="p-4">সঞ্চয়ী শিশু ও একাউন্ট</th>
                      <th className="p-4">লোনের কারণ / বস্তু</th>
                      <th className="p-4">মূল লোন</th>
                      <th className="p-4">পরিশোধিত</th>
                      <th className="p-4">অবশিষ্ট বকেয়া</th>
                      <th className="p-4 text-center">কিস্তি প্রদান</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {db.loans.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          কোনো চলতি লোন নেই।
                        </td>
                      </tr>
                    ) : (
                      db.loans.map((loan) => {
                        const kid = db.accounts.find((a) => a.accountNo === loan.accountNo);
                        const due = loan.amount - loan.paidAmount;

                        return (
                          <tr key={loan.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-4">
                              <p className="font-mono font-bold text-cyan-400">{loan.id}</p>
                              <p className="text-[10px] text-slate-400">
                                {new Date(loan.createdAt).toLocaleDateString('bn-BD')}
                              </p>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-slate-100">{kid?.name || 'অজানা'}</p>
                              <p className="font-mono text-amber-400 text-[11px]">{loan.accountNo}</p>
                            </td>
                            <td className="p-4 font-medium text-slate-200">{loan.reason}</td>
                            <td className="p-4 font-bold text-slate-100">
                              ৳{loan.amount.toLocaleString()}
                            </td>
                            <td className="p-4 font-bold text-emerald-400">
                              ৳{loan.paidAmount.toLocaleString()}
                            </td>
                            <td
                              className={`p-4 font-black ${
                                due > 0 ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              ৳{due.toLocaleString()}
                            </td>
                            <td className="p-4 text-center">
                              {due > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setRepayLoanTarget(loan)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center gap-1 mx-auto"
                                >
                                  <Coins className="w-3.5 h-3.5" />
                                  <span>কিস্তি দিন</span>
                                </button>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                  পরিশোধিত ✅
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SAVINGS GOALS & WISHLIST */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Gift className="w-5 h-5 text-pink-400" />
                  <span>ছোটদের স্বপ্নের উইশলিস্ট ও উপহার বুঝে নেওয়ার ট্র্যাকার</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  সাইকেল, বই বা খেলনা কেনার সঞ্চয় সম্পন্ন হলে শিশুটি তা বুঝে পেয়েছে কি না স্ট্যাটাস দিন
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewAccountModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs shadow-md transition"
              >
                নতুন লক্ষ্য যোগ করুন
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {db.accounts.length === 0 ? (
                <div className="col-span-full p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
                  <Gift className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-base font-bold text-slate-200">কোনো অ্যাকাউন্ট বা উইশলিস্ট নেই</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    সঞ্চয়ী শিশু অ্যাকাউন্ট তৈরি করলে এখানে উইশলিস্ট বা সাধারণ সঞ্চয়ের ট্র্যাকার দেখাবে।
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsNewAccountModalOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>নতুন অ্যাকাউন্ট খুলুন</span>
                  </button>
                </div>
              ) : (
                db.accounts.map((acc) => {
                  const hasGoal = Boolean(acc.goalItem && acc.goalAmount && acc.goalAmount > 0);
                  const goalAmountSafe = acc.goalAmount || 1;
                  const percent = hasGoal ? Math.min(100, Math.round((acc.balance / goalAmountSafe) * 100)) : 100;
                  const isReached = hasGoal ? acc.balance >= (acc.goalAmount || 0) : true;

                  return (
                    <div
                      key={acc.accountNo}
                      className={`bg-slate-900 border p-5 rounded-2xl space-y-4 shadow-xl ${
                        acc.goalClaimed
                          ? 'border-emerald-500/60 bg-emerald-950/20'
                          : isReached && hasGoal
                          ? 'border-amber-500/60'
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-base text-white">
                            {acc.goalItem || 'সাধারণ সঞ্চয় (ড্রিম ঐচ্ছিক)'}
                          </h4>
                          <p className="text-xs text-amber-400 font-semibold">
                            {acc.name} ({acc.accountNo})
                          </p>
                        </div>
                        <span className="text-3xl">
                          {acc.goalClaimed ? '🎁' : isReached && hasGoal ? '🎯' : hasGoal ? '⏳' : '💰'}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-400">সঞ্চিত: ৳{acc.balance.toLocaleString()}</span>
                          <span className="text-slate-200">
                            {hasGoal ? `লক্ষ্য: ৳${acc.goalAmount!.toLocaleString()}` : 'বাজেট: অনির্দিষ্ট'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              acc.goalClaimed
                                ? 'bg-emerald-400'
                                : isReached && hasGoal
                                ? 'bg-gradient-to-r from-amber-400 to-pink-500'
                                : hasGoal
                                ? 'bg-sky-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          {acc.goalClaimed ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> জিনিস কিনে বুঝে পেয়েছে 🎉
                            </span>
                          ) : isReached && hasGoal ? (
                            <span className="text-amber-300 font-bold flex items-center gap-1 animate-pulse">
                              <Star className="w-4 h-4 fill-amber-300" /> টাকা জমেছে! কেনার পালা
                            </span>
                          ) : hasGoal ? (
                            <span className="text-slate-400">সঞ্চয় চলমান ({percent}%)...</span>
                          ) : (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Sparkles className="w-4 h-4 text-emerald-400" /> সাধারণ সঞ্চয়ী একাউন্ট
                            </span>
                          )}
                        </div>

                        {hasGoal && (
                          <button
                            type="button"
                            onClick={() => handleToggleGoalClaim(acc.accountNo)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition shadow ${
                              acc.goalClaimed
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500'
                            }`}
                          >
                            {acc.goalClaimed ? 'অবস্থা রিসেট' : 'উপহার বুঝে পেয়েছে 🎁'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 8: TRANSACTIONS LOG */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
              <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    placeholder="আইডি, চেক নং বা হিসাব খুঁজুন..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={txFilterType}
                  onChange={(e) => setTxFilterType(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="ALL">সকল লেনদেন</option>
                  <option value="DEPOSIT">জমা (Deposit)</option>
                  <option value="WITHDRAWAL">চেক উত্তোলন (Withdrawal)</option>
                  <option value="LOAN_REPAY">লোন কিস্তি (Loan Repay)</option>
                  <option value="PROFIT">১% লাভ (Profit)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>JSON ব্যাকআপ ডাউনলোড</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/90 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">ট্রানজেকশন ID ও সময়</th>
                      <th className="p-4">সঞ্চয়ী হিসাব নং</th>
                      <th className="p-4">টাইপ ও চেক নম্বর</th>
                      <th className="p-4">পরিমাণ</th>
                      <th className="p-4">বিবরণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {db.transactions
                      .filter((t) => {
                        const matchSearch =
                          t.id.toLowerCase().includes(txSearch.toLowerCase()) ||
                          t.accountNo.toLowerCase().includes(txSearch.toLowerCase()) ||
                          (t.chequeNo && t.chequeNo.toLowerCase().includes(txSearch.toLowerCase())) ||
                          t.ref.toLowerCase().includes(txSearch.toLowerCase());
                        let matchType = true;
                        if (txFilterType !== 'ALL') matchType = t.type === txFilterType;
                        return matchSearch && matchType;
                      })
                      .map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-4">
                            <p className="font-mono font-bold text-slate-200">{t.id}</p>
                            <p className="text-[10px] text-slate-500">
                              {new Date(t.timestamp).toLocaleString('bn-BD')}
                            </p>
                          </td>
                          <td className="p-4 font-mono font-bold text-amber-400">{t.accountNo}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full border font-bold text-[10px] ${
                                t.type === 'DEPOSIT'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : t.type === 'WITHDRAWAL'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              }`}
                            >
                              {t.type === 'DEPOSIT'
                                ? 'জমা 🪙'
                                : t.type === 'WITHDRAWAL'
                                ? 'চেক উত্তোলন 🔻'
                                : 'অন্যান্য'}
                            </span>
                            {t.chequeNo && t.chequeNo !== '-' && (
                              <span className="block text-[10px] font-mono text-amber-300 mt-1">
                                চেক নং: {t.chequeNo}
                              </span>
                            )}
                          </td>
                          <td
                            className={`p-4 font-black text-sm ${
                              t.type === 'WITHDRAWAL' ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {t.type === 'WITHDRAWAL' ? '-' : '+'}৳{t.amount.toLocaleString()}
                          </td>
                          <td className="p-4 text-slate-300">{t.ref}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS & PROFIT POLICY & USER REQUEST: "সব ডাটা মোছার বাটন দাও" */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vault Cash Refill */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-400" />
                <span>এডমিন ক্যাশ ভল্ট রিফিল (আমার কাছে নগদ জমা বাড়ানো)</span>
              </h3>
              <p className="text-xs text-slate-400">
                স্কুল বা অভিভাবকের মূল ক্যাশ বক্সে নতুন নগদ ক্যাশ অর্থ যোগ করুন।
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget;
                  const amtInput = target.elements.namedItem('refillAmt') as HTMLInputElement;
                  const amt = parseFloat(amtInput.value);
                  if (!isNaN(amt) && amt > 0) {
                    setDb((prev) => ({ ...prev, adminVaultCash: prev.adminVaultCash + amt }));
                    alert(`মূল ভল্টে ৳${amt} নগদ যুক্ত হয়েছে!`);
                    amtInput.value = '';
                  }
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    নগদ জমার পরিমাণ (৳)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    name="refillAmt"
                    required
                    placeholder="যেমন: 5000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
                >
                  মূল ক্যাশ ভল্টে ফান্ড যোগ করুন
                </button>
              </form>
            </div>

            {/* DEDICATED USER REQUEST: সব ডাটা মোছার বাটন ও ডাটাবেস রিসেট */}
            <div className="bg-slate-900 border-2 border-rose-600/50 p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-rose-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                  <span>সব ডাটা মোছার বাটন (Clear All Data / Reset)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  ব্যবহারকারীর নির্দেশে সম্পূর্ণ সিস্টেমের সকল সঞ্চয়ী শিশু অ্যাকাউন্ট, ইস্যুকৃত চেকবুক, মাটির ব্যাংকের জমা, লোন ও ট্রানজেকশন মুছে ফেলার জন্য নিচের বাটন ব্যবহার করুন।
                </p>

                <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-200">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>দ্বিগুণ সুরক্ষা সুবিধা:</span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    বাটনে ক্লিক করার পর একটি নিশ্চিতকরণ উইন্ডো আসবে, যেখানে সম্পূর্ণ ফাঁকা করার অথবা ফ্রেশ ডেমো লোড করার অপশন রয়েছে।
                  </p>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  type="button"
                  id="btnWipeAllDataMain"
                  onClick={() => setIsClearDataModalOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>সব ডাটা সম্পূর্ণ মুছে ফেলুন (Wipe All Database)</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>মুছার আগে নিরাপদ JSON ব্যাকআপ রাখুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('আপনি কি ব্যাংকের সকল শিশুর চেকবই সম্পূর্ণ খালি (Blank) করতে চান? কোনো অটো বা পূর্বনির্ধারিত লেখা থাকবে না।')) {
                      handleResetAllChequebooksToBlank();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-amber-500/30"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>🧹 সকল চেকবই সম্পূর্ণ খালি করুন (Blank Out Chequebooks)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: A4 CHEQUEBOOK MODAL VIEWER & PRINT */}
      {viewingAccount && (
        <ChequebookModal
          account={viewingAccount}
          chequebook={db.chequebooks[viewingAccount.accountNo]}
          onClose={() => setViewingChequebookAccountNo(null)}
          onUseForWithdrawal={handleUseChequeFromBook}
          onCancelCheque={handleCancelCheque}
          onIssueMoreLeaves={handleIssueMoreLeaves}
          onWriteCheque={handleWriteCheque}
          onTearAndSubmitCheque={handleTearAndSubmitCheque}
          onPayTornCheque={handlePayTornCheque}
          onReturnTornCheque={handleReturnTornCheque}
          onResetChequebookToBlank={handleResetChequebookToBlank}
        />
      )}

      {/* MODAL 2: PASSBOOK (সঞ্চয় খাতা) */}
      {viewingPassbookAccount && (
        <PassbookModal
          account={viewingPassbookAccount}
          transactions={db.transactions.filter(
            (t) => t.accountNo === viewingPassbookAccount.accountNo
          )}
          onClose={() => setViewingPassbookAccountNo(null)}
          onOpenChequebook={(accNo) => setViewingChequebookAccountNo(accNo)}
        />
      )}

      {/* MODAL 3: NEW ACCOUNT */}
      <NewAccountModal
        isOpen={isNewAccountModalOpen}
        onClose={() => setIsNewAccountModalOpen(false)}
        nextAccountSuffix={1000 + db.accounts.length + 1}
        onCreateAccount={handleCreateAccount}
      />

      {/* MODAL 4: NEW LOAN */}
      <NewLoanModal
        isOpen={isNewLoanModalOpen}
        onClose={() => setIsNewLoanModalOpen(false)}
        accounts={db.accounts}
        adminVaultCash={db.adminVaultCash}
        onIssueLoan={handleIssueLoan}
      />

      {/* MODAL 5: REPAY LOAN */}
      <RepayLoanModal
        loan={repayLoanTarget}
        account={db.accounts.find((a) => a.accountNo === repayLoanTarget?.accountNo)}
        isOpen={!!repayLoanTarget}
        onClose={() => setRepayLoanTarget(null)}
        onRepay={handleRepayLoan}
      />

      {/* MODAL 6: CLEAR ALL DATA MODAL (USER REQUEST) */}
      <ClearDataModal
        isOpen={isClearDataModalOpen}
        onClose={() => setIsClearDataModalOpen(false)}
        onClearAllData={handleClearAllData}
        onExportBackup={handleExportBackup}
      />
    </div>
  );
}
