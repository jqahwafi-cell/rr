import React, { useState } from 'react';
import { Loan, Account } from '../types';
import { Coins, X } from 'lucide-react';

interface Props {
  loan: Loan | null;
  account?: Account;
  isOpen: boolean;
  onClose: () => void;
  onRepay: (loanId: string, amount: number) => void;
}

export const RepayLoanModal: React.FC<Props> = ({
  loan,
  account,
  isOpen,
  onClose,
  onRepay,
}) => {
  const [repayAmount, setRepayAmount] = useState('');

  if (!isOpen || !loan) return null;

  const dueAmount = loan.amount - loan.paidAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(repayAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('সঠিক কিস্তির পরিমাণ দিন!');
      return;
    }
    if (amt > dueAmount) {
      alert(`বকেয়ার চেয়ে বেশি দেওয়া যাবে না! সর্বোচ্চ বকেয়া: ৳${dueAmount}`);
      return;
    }

    onRepay(loan.id, amt);
    onClose();
    setRepayAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">লোনের কিস্তি পরিশোধ</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">লোন আইডি:</span>
            <span className="font-mono font-bold text-amber-400">{loan.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">শিশু:</span>
            <span className="font-bold text-slate-200">{account?.name} ({loan.accountNo})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">কারণ:</span>
            <span className="text-slate-300 truncate max-w-[180px]">{loan.reason}</span>
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold">
            <span className="text-slate-400">বর্তমান বকেয়া:</span>
            <span className="text-rose-400 text-sm">৳{dueAmount.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">পরিশোধের পরিমাণ (৳)</label>
            <input
              type="number"
              min="1"
              max={dueAmount}
              required
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              placeholder={`সর্বোচ্চ ৳${dueAmount}`}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-emerald-400 font-bold focus:border-emerald-500 outline-none"
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
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
            >
              কিস্তি জমা দিন 💸
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
