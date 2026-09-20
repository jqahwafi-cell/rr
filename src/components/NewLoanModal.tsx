import React, { useState } from 'react';
import { Account } from '../types';
import { HandCoins, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  adminVaultCash: number;
  onIssueLoan: (accountNo: string, amount: number, reason: string) => void;
}

export const NewLoanModal: React.FC<Props> = ({
  isOpen,
  onClose,
  accounts,
  adminVaultCash,
  onIssueLoan,
}) => {
  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!accountNo) {
      alert('সঞ্চয়ী শিশু নির্বাচন করুন!');
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      alert('সঠিক লোনের পরিমাণ দিন!');
      return;
    }
    if (amt > adminVaultCash) {
      alert(`এডমিন ক্যাশ ভল্টে পর্যাপ্ত নগদ অর্থ নেই! বর্তমান ভল্ট ক্যাশ: ৳${adminVaultCash}`);
      return;
    }

    onIssueLoan(accountNo, amt, reason.trim() || 'জরুরি প্রয়োজন');
    onClose();
    setAmount('');
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 relative shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-none">ছোটদের লোন অনুমোদন</h3>
              <p className="text-xs text-slate-400 mt-0.5">জমানো টাকায় সাইকেল বা বই না কুলোলে সাহায্য</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">সঞ্চয়ী শিশু নির্বাচন করুন</label>
            <select
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-500 outline-none"
            >
              <option value="">-- একাউন্ট নির্বাচন করুন --</option>
              {accounts.map((a) => (
                <option key={a.accountNo} value={a.accountNo}>
                  {a.name} [{a.accountNo}] - জমানো: ৳{a.balance}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">লোনের পরিমাণ (৳)</label>
            <input
              type="number"
              min="50"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="যেমন: 200"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-cyan-300 font-bold focus:border-cyan-500 outline-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              ভল্টে নগদ ক্যাশ আছে: ৳{adminVaultCash.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">লোনের কারণ / উদ্দেশ্য</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="যেমন: বইমেলায় অতিরিক্ত ৩টি গল্পের বই কেনা"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg"
            >
              লোন মঞ্জুর করুন 🤝
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
