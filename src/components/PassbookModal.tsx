import React from 'react';
import { Account, Transaction } from '../types';
import { toBanglaNumber } from '../utils/numberToWords';
import { X, BookOpen, Star, Gift, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  account: Account;
  transactions: Transaction[];
  onClose: () => void;
  onOpenChequebook: (accountNo: string) => void;
}

export const PassbookModal: React.FC<Props> = ({
  account,
  transactions,
  onClose,
  onOpenChequebook,
}) => {
  const sixtyDaysAgo = new Date(Date.now() - 86400000 * 60);
  const totalRecentWithdrawn = transactions
    .filter((t) => t.type === 'WITHDRAWAL' && new Date(t.timestamp) >= sixtyDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0);

  const isEligibleForProfit = totalRecentWithdrawn <= 200;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-none">
                {account.name}-এর সঞ্চয় খাতা (Passbook)
              </h3>
              <p className="text-xs text-amber-400 font-mono mt-1">{account.accountNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">মোট সঞ্চিত অর্থ</span>
            <p className="text-xl font-black text-emerald-400 mt-0.5">৳{account.balance.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">ঝাকানাকা স্টার</span>
            <p className="text-base font-bold text-amber-400 flex items-center gap-1 mt-0.5">
              <span>{account.stars}</span>
              <Star className="w-4 h-4 fill-amber-400" />
            </p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">স্বপ্নের লক্ষ্য</span>
            <p className="text-xs font-semibold text-pink-300 truncate mt-0.5" title={account.goalItem || 'সাধারণ সঞ্চয়ী'}>
              {account.goalItem || 'সাধারণ সঞ্চয়'}
            </p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">২ মাসের ১% লাভ</span>
            <div className="mt-0.5">
              {isEligibleForProfit ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5" /> লাভ পাওয়ার যোগ্য
                </span>
              ) : (
                <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]" title={`গত ২ মাসে ৳${totalRecentWithdrawn} তোলায় স্থগিত`}>
                  <XCircle className="w-3.5 h-3.5" /> স্থগিত (&gt;২০০৳ তোলায়)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick action to open Chequebook */}
        <div className="p-3 bg-sky-950/40 border border-sky-600/30 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="text-slate-300">
            <span className="font-bold text-white">অফিসিয়াল A4 চেকবুক দেখুন: </span>
            <span className="text-slate-400">টাকা তোলার জন্য চেক প্রিন্ট বা চেক পাতা প্রস্তুত করুন।</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenChequebook(account.accountNo);
            }}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold whitespace-nowrap shadow transition"
          >
            চেকবই খুলুন 📖
          </button>
        </div>

        {/* Transaction History in this Passbook */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            লেনদেনের খতিয়ান ও চেক বিবরণী ({transactions.length}টি লেনদেন)
          </h4>
          {transactions.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">এখনো কোনো লেনদেন সম্পন্ন হয়নি।</p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          t.type === 'DEPOSIT'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : t.type === 'WITHDRAWAL'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {t.type === 'DEPOSIT'
                          ? 'জমা'
                          : t.type === 'WITHDRAWAL'
                          ? 'চেক উত্তোলন'
                          : t.type === 'PROFIT'
                          ? '১% লাভ'
                          : 'কিস্তি'}
                      </span>
                      {t.chequeNo && t.chequeNo !== '-' && (
                        <span className="font-mono text-amber-400 text-[11px] font-semibold">
                          চেক: {t.chequeNo}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{t.ref}</p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(t.timestamp).toLocaleString('bn-BD')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-mono font-bold text-sm ${
                        t.type === 'WITHDRAWAL' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {t.type === 'WITHDRAWAL' ? '-' : '+'}৳{t.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      জের: ৳{t.newBalance?.toLocaleString() || account.balance}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
