import React, { useState } from 'react';
import { Account, ChequeBook, ChequeLeaf } from '../types';
import { ChequeLeafComponent } from './ChequeLeafComponent';
import { toBanglaNumber, numberToBanglaWords } from '../utils/numberToWords';
import {
  X,
  Printer,
  PlusCircle,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Scissors,
  DollarSign,
  Sparkles,
} from 'lucide-react';

interface Props {
  account: Account;
  chequebook?: ChequeBook;
  onClose: () => void;
  onUseForWithdrawal: (chequeNo: string, amount?: number, reason?: string) => void;
  onCancelCheque: (chequeNo: string) => void;
  onIssueMoreLeaves: (accountNo: string, count: number) => void;
  onWriteCheque: (
    accountNo: string,
    chequeNo: string,
    payeeName: string,
    amount: number,
    date?: string,
    reason?: string
  ) => void;
  onTearAndSubmitCheque?: (
    accountNo: string,
    chequeNo: string,
    payeeName?: string,
    amount?: number,
    reason?: string
  ) => void;
  onPayTornCheque?: (chequeNo: string) => void;
  onReturnTornCheque?: (chequeNo: string) => void;
  onResetChequebookToBlank?: (accountNo: string) => void;
}

export const ChequebookModal: React.FC<Props> = ({
  account,
  chequebook,
  onClose,
  onUseForWithdrawal,
  onCancelCheque,
  onIssueMoreLeaves,
  onWriteCheque,
  onTearAndSubmitCheque,
  onPayTornCheque,
  onReturnTornCheque,
  onResetChequebookToBlank,
}) => {
  const leaves = chequebook?.leaves || [];
  const [activeTab, setActiveTab] = useState<'A4_PAGES' | 'WRITE_CHEQUE' | 'BOOK_COVER'>('A4_PAGES');
  const [selectedLeafForWriting, setSelectedLeafForWriting] = useState<string>(
    leaves.find((l) => l.status === 'AVAILABLE')?.chequeNo || ''
  );
  const [writePayee, setWritePayee] = useState<string>('নিজ / নগদ ক্যাশ');
  const [writeAmount, setWriteAmount] = useState<string>('');
  const [writeDate, setWriteDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [writeReason, setWriteReason] = useState<string>('প্রয়োজনীয় খরচ');

  // Pair leaves into groups of 2 for A4 pages (exactly 2 cheques per A4 page)
  const a4Pages: ChequeLeaf[][] = [];
  for (let i = 0; i < leaves.length; i += 2) {
    a4Pages.push(leaves.slice(i, i + 2));
  }

  const availableCount = leaves.filter((l) => l.status === 'AVAILABLE').length;
  const tornCount = leaves.filter((l) => l.status === 'TORN_SUBMITTED').length;
  const cashedCount = leaves.filter((l) => l.status === 'CASHED').length;

  const handlePrint = () => {
    window.print();
  };

  const handleWriteSubmit = (e: React.FormEvent, andTear: boolean = false) => {
    e.preventDefault();
    const amt = parseFloat(writeAmount);
    if (!selectedLeafForWriting) {
      alert('অনুগ্রহ করে একটি অব্যবহৃত চেক পাতা নির্বাচন করুন!');
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      alert('সঠিক টাকার পরিমাণ দিন!');
      return;
    }
    if (amt > account.balance) {
      alert(`অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই! বর্তমান ব্যালেন্স: ৳${account.balance.toLocaleString()}`);
      return;
    }

    onWriteCheque(
      account.accountNo,
      selectedLeafForWriting,
      writePayee || 'নিজ / নগদ ক্যাশ',
      amt,
      writeDate || new Date().toISOString().split('T')[0],
      writeReason || 'প্রয়োজনীয় খরচ'
    );

    if (andTear && onTearAndSubmitCheque) {
      onTearAndSubmitCheque(
        account.accountNo,
        selectedLeafForWriting,
        writePayee || 'নিজ / নগদ ক্যাশ',
        amt,
        writeReason || 'প্রয়োজনীয় খরচ'
      );
    }

    setActiveTab('A4_PAGES');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950 px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-amber-500 text-white flex items-center justify-center text-xl shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white leading-none">
                  {account.name}-এর চেকবুক (A4 সাইজ)
                </h3>
                <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  ১ পেজে ২টি চেক
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                হিসাব নম্বর: <span className="text-amber-400 font-mono font-bold">{account.accountNo}</span> | বর্তমান গচ্ছিত ব্যালেন্স: <span className="text-emerald-400 font-bold">৳{account.balance.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onResetChequebookToBlank && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`আপনি কি ${account.name}-এর পুরো চেকবইটি সম্পূর্ণ খালি (খাঁটি ব্ল্যাঙ্ক) করতে চান? এতে পূর্বের কোনো অটো লেখা থাকবে না।`)) {
                    onResetChequebookToBlank(account.accountNo);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 font-bold text-xs border border-slate-700 transition flex items-center gap-1.5"
                title="চেকবইয়ের সব পাতা খালি ও নতুনের মতো করুন"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                <span>বইটি সম্পূর্ণ খালি করুন</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>A4 চেকবুক প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Torn Cheque Pending Disbursement Banner (User Request: "চেক ছিরে পাঠালে আমি টাকা দিয়ে দিব") */}
        {tornCount > 0 && (
          <div className="bg-gradient-to-r from-amber-600/30 via-orange-600/30 to-amber-600/30 border-b border-amber-500/50 p-3 px-5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200 no-print animate-pulse">
            <div className="flex items-center gap-2.5">
              <Scissors className="w-5 h-5 text-amber-400" />
              <div>
                <strong className="text-white text-sm">
                  {tornCount}টি চেক পাতা ছিঁড়ে পাঠানো হয়েছে!
                </strong>
                <span className="block text-[11px] text-amber-300">
                  সঞ্চয়ী চেক ছিঁড়ে পাঠিয়েছে — আপনি নিচে প্রতিটি চেকের বিপরীতে &quot;💵 টাকা দিয়ে দিন&quot; বোতামে চাপ দিলে ক্যাশ পরিশোধ হয়ে যাবে।
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {leaves
                .filter((l) => l.status === 'TORN_SUBMITTED')
                .map((torn) => (
                  <button
                    key={torn.chequeNo}
                    type="button"
                    onClick={() => onPayTornCheque && onPayTornCheque(torn.chequeNo)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow flex items-center gap-1.5 transition"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {torn.chequeNo} এর ৳{torn.amount || 0} টাকা দিন
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Chequebook Navigation Tabs & Stats Bar */}
        <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('A4_PAGES')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'A4_PAGES'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 চেকবুক পাতা সমূহ ({a4Pages.length}টি পাতা)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('WRITE_CHEQUE')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'WRITE_CHEQUE'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>✍️ চেকে লিখুন (Write Cheque)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('BOOK_COVER')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'BOOK_COVER'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>বইয়ের কভার ও বিবরণ</span>
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-emerald-400 font-semibold bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              ⚪ প্রস্তুত/খালি: {availableCount}টি
            </span>
            {tornCount > 0 && (
              <span className="text-amber-400 font-semibold bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-500/30 animate-pulse">
                ✂️ ছিঁড়ে পাঠানো: {tornCount}টি
              </span>
            )}
            <span className="text-rose-400 font-semibold bg-rose-950/50 px-2.5 py-1 rounded-lg border border-rose-500/30">
              🔴 ক্যাশ সম্পন্ন: {cashedCount}টি
            </span>
            <button
              type="button"
              onClick={() => onIssueMoreLeaves(account.accountNo, 4)}
              className="text-sky-400 hover:text-sky-300 font-semibold underline text-xs"
            >
              +৪ পাতা খালি চেক যোগ করুন
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: A4 PAGES VIEW (2 CHEQUES PER A4 PAGE) */}
          {activeTab === 'A4_PAGES' && (
            <div id="chequebook-print-container" className="space-y-8">
              <div className="bg-sky-950/40 border border-sky-500/30 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-sky-200 no-print">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>আসল ব্যাংকের মতো নিয়ম:</strong> নিচে প্রতিটি সেকশনে ১টি পূর্ণাঙ্গ A4 পেজে উপর-নিচ ২টি চেক সাজানো আছে। যেকোনো চেকে সরাসরি <strong>&quot;✍️ চেকে লিখুন&quot;</strong> এবং <strong>&quot;✂️ চেক ছিঁড়ে পাঠান&quot;</strong> করতে পারেন।
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold whitespace-nowrap"
                  >
                    প্রিন্ট প্রিভিউ 🖨️
                  </button>
                </div>
              </div>

              {a4Pages.map((pageCheques, pageIndex) => (
                <div
                  key={pageIndex}
                  className="a4-cheque-page rounded-2xl bg-slate-900/60 p-4 sm:p-6 border-2 border-dashed border-slate-700 relative space-y-6 shadow-xl"
                >
                  {/* A4 Sheet Header Badge */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-700 text-xs text-slate-400 no-print">
                    <span className="font-bold text-sky-400">
                      📄 A4 পেজ #{toBanglaNumber(pageIndex + 1)} (২টি চেক পাতা: পাতা #{toBanglaNumber(pageIndex * 2 + 1)} ও #{toBanglaNumber(pageIndex * 2 + 2)})
                    </span>
                    <span className="font-mono text-[11px]">সাইজ: A4 Portrait (210mm x 297mm)</span>
                  </div>

                  {/* Top Cheque (Cheque 1 of this page) */}
                  {pageCheques[0] && (
                    <div className="space-y-1">
                      <ChequeLeafComponent
                        cheque={pageCheques[0]}
                        account={account}
                        indexOnPage={1}
                        onUseForWithdrawal={(chequeNo) => {
                          onUseForWithdrawal(chequeNo, pageCheques[0].amount, pageCheques[0].reason);
                          onClose();
                        }}
                        onCancelCheque={onCancelCheque}
                        onWriteCheque={onWriteCheque}
                        onTearAndSubmit={(chequeNo, payee, amt, rsn) =>
                          onTearAndSubmitCheque &&
                          onTearAndSubmitCheque(account.accountNo, chequeNo, payee, amt, rsn)
                        }
                        onPayTornCheque={onPayTornCheque}
                        onReturnTornCheque={onReturnTornCheque}
                      />
                    </div>
                  )}

                  {/* Mid-Page Perforation Divider between Cheque 1 and Cheque 2 */}
                  <div className="flex items-center justify-center gap-2 py-2 text-slate-400 select-none">
                    <span className="border-t-2 border-dashed border-sky-400/80 flex-1"></span>
                    <span className="text-[11px] font-bold bg-slate-800 px-3 py-0.5 rounded-full border border-slate-700 flex items-center gap-1.5 text-slate-300">
                      ✂️ A4 পেজের মাঝখান থেকে কাটার রেখা (Cut line between Cheque 1 & 2)
                    </span>
                    <span className="border-t-2 border-dashed border-sky-400/80 flex-1"></span>
                  </div>

                  {/* Bottom Cheque (Cheque 2 of this page) */}
                  {pageCheques[1] && (
                    <div className="space-y-1">
                      <ChequeLeafComponent
                        cheque={pageCheques[1]}
                        account={account}
                        indexOnPage={2}
                        onUseForWithdrawal={(chequeNo) => {
                          onUseForWithdrawal(chequeNo, pageCheques[1].amount, pageCheques[1].reason);
                          onClose();
                        }}
                        onCancelCheque={onCancelCheque}
                        onWriteCheque={onWriteCheque}
                        onTearAndSubmit={(chequeNo, payee, amt, rsn) =>
                          onTearAndSubmitCheque &&
                          onTearAndSubmitCheque(account.accountNo, chequeNo, payee, amt, rsn)
                        }
                        onPayTornCheque={onPayTornCheque}
                        onReturnTornCheque={onReturnTornCheque}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: WRITE / FILL OUT A CHEQUE */}
          {activeTab === 'WRITE_CHEQUE' && (
            <div className="max-w-2xl mx-auto bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-amber-400" />
                  <span>চেক পূরণ করুন (Payee, Amount & Note)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  সঞ্চয়ী নিজের প্রয়োজনে চেকে প্রাপক ও টাকার অংক লিখবে। লেখার পর চেক ছিঁড়ে পাঠালে ক্যাশ টাকা পাওয়া যাবে।
                </p>
              </div>

              <form onSubmit={(e) => handleWriteSubmit(e, false)} className="space-y-4 text-xs">
                {/* Cheque Leaf Picker */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    ১. কোন চেক পাতাটিতে লিখবেন? *
                  </label>
                  <select
                    value={selectedLeafForWriting}
                    onChange={(e) => setSelectedLeafForWriting(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-amber-400 font-mono font-bold focus:border-amber-400 outline-none"
                  >
                    <option value="">-- অব্যবহৃত চেক পাতা নির্বাচন করুন --</option>
                    {leaves
                      .filter((l) => l.status === 'AVAILABLE')
                      .map((l) => (
                        <option key={l.chequeNo} value={l.chequeNo}>
                          চেক পাতা #{l.leafNumber} [{l.chequeNo}]{' '}
                          {l.amount ? `(ইতোমধ্যে লেখা ৳${l.amount})` : '(খালি পাতা)'}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Payee Name */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    ২. প্রাপকের নাম (Pay To) *
                  </label>
                  <input
                    type="text"
                    value={writePayee}
                    onChange={(e) => setWritePayee(e.target.value)}
                    required
                    placeholder="যেমন: নিজ / ক্যাশ, বইমেলা স্টল, খেলনা দোকান"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-medium focus:border-amber-400 outline-none"
                  />
                  <div className="flex gap-2 mt-1.5">
                    {['নিজ / ক্যাশ', 'গল্পের বই কেনা', 'স্কুল ফি', 'চিত্রাঙ্কন খাতা', 'মিষ্টি / চকলেট'].map(
                      (p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setWritePayee(p)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      ৩. টাকার পরিমাণ (৳ অংকে) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={account.balance}
                        step="any"
                        value={writeAmount}
                        onChange={(e) => setWriteAmount(e.target.value)}
                        required
                        placeholder="যেমন: ৫০, ১০০, ২০০"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-100 font-mono font-bold focus:border-amber-400 outline-none"
                      />
                      <span className="absolute left-3 top-2.5 text-slate-500 font-bold">৳</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      ৪. তারিখ (Issue Date) *
                    </label>
                    <input
                      type="date"
                      value={writeDate}
                      onChange={(e) => setWriteDate(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-medium focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                {/* Live Words Preview */}
                {parseFloat(writeAmount) > 0 && (
                  <div className="bg-sky-950/60 border border-sky-600/40 p-3 rounded-xl text-sky-200">
                    <span className="text-[10px] text-sky-400 block font-bold">কথায় (স্বয়ংক্রিয় বাংলা):</span>
                    <span className="font-bold text-sm text-white">
                      {numberToBanglaWords(parseFloat(writeAmount))}
                    </span>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    ৫. খরচের উদ্দেশ্য / বিবরণ
                  </label>
                  <input
                    type="text"
                    value={writeReason}
                    onChange={(e) => setWriteReason(e.target.value)}
                    placeholder="যেমন: নতুন গল্পের বই কেনার জন্য"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-medium focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                  <span className="text-slate-400 text-xs">
                    বর্তমান জমানো স্থিতি: <strong className="text-emerald-400">৳{account.balance.toLocaleString()}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition border border-amber-500/30"
                    >
                      💾 চেকে লিখে সেভ করুন
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleWriteSubmit(e, true)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-1.5"
                    >
                      <Scissors className="w-4 h-4" />
                      <span>লিখে এখনই চেক ছিঁড়ে পাঠান ✂️</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: BOOK COVER & PARTICULARS */}
          {activeTab === 'BOOK_COVER' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-900 via-sky-800 to-indigo-950 text-white shadow-2xl border-4 border-amber-400/80 relative overflow-hidden">
                <div className="flex justify-between items-start border-b border-sky-400/40 pb-4 mb-4">
                  <div>
                    <h3 className="text-xl font-black text-amber-300">আমার ব্যাংক - চেকবই</h3>
                    <p className="text-xs text-sky-200">AMAR BANK JUNIOR SAVINGS PASS & CHEQUE VAULT</p>
                  </div>
                  <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black">
                    A4 সাইজ বুক
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-sky-700/60 pb-1.5">
                    <span className="text-sky-300">হিসাবধারীর নাম:</span>
                    <span className="font-bold text-white text-base">{account.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-sky-700/60 pb-1.5">
                    <span className="text-sky-300">হিসাব নম্বর:</span>
                    <span className="font-mono font-bold text-amber-300 text-base">{account.accountNo}</span>
                  </div>
                  <div className="flex justify-between border-b border-sky-700/60 pb-1.5">
                    <span className="text-sky-300">অভিভাবকের নাম:</span>
                    <span className="font-bold text-white">{account.guardianName}</span>
                  </div>
                  <div className="flex justify-between border-b border-sky-700/60 pb-1.5">
                    <span className="text-sky-300">যোগাযোগ নম্বর:</span>
                    <span className="font-mono text-white">{account.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-sky-700/60 pb-1.5">
                    <span className="text-sky-300">বই ইস্যুর তারিখ:</span>
                    <span className="font-mono text-white">
                      {new Date(chequebook?.issuedAt || Date.now()).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sky-300">মোট পাতা সংখ্যা:</span>
                    <span className="font-bold text-white">{toBanglaNumber(leaves.length)} পাতা</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-sky-400/40 flex justify-between items-center text-xs text-sky-200">
                  <span>ভল্ট শাখা, ঢাকা</span>
                  <span className="font-bold text-amber-300">সঞ্চয়ই ভবিষ্যতের শক্তি 🌟</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 text-xs text-slate-300">
                <h5 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>চেকবই ব্যবহারের নিয়মাবলী</span>
                </h5>
                <ul className="list-disc list-inside space-y-1 text-slate-400 leading-relaxed">
                  <li>চেকবই সম্পূর্ণ খালি থাকবে; প্রয়োজনে শিশু নিজেই প্রাপক ও টাকার অংক লিখবে।</li>
                  <li>চেক ছিঁড়ে ক্যাশ কাউন্টারে পাঠালে এডমিন যাচাই করে নগদ টাকা প্রদান করবেন।</li>
                  <li>এক পাতা A4 কাগজে ২টি চেক প্রিন্ট করা যাবে এবং দাগ থেকে কেটে নেওয়া যাবে।</li>
                  <li>২ মাসে ২০০ টাকার বেশি উত্তোলন না করলে বিশেষ ১% লাভ বোনাস পাওয়া যাবে।</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
