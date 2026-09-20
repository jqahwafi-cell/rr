import React, { useState } from 'react';
import { UserPlus, X, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nextAccountSuffix: number;
  onCreateAccount: (data: {
    name: string;
    age: number;
    guardianName: string;
    phone: string;
    goalItem?: string;
    goalAmount?: number;
    initialDeposit: number;
  }) => void;
}

export const NewAccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  nextAccountSuffix,
  onCreateAccount,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(8);
  const [guardianName, setGuardianName] = useState('');
  const [phone, setPhone] = useState('');
  const [goalItem, setGoalItem] = useState('');
  const [goalAmount, setGoalAmount] = useState<string>('');
  const [initialDeposit, setInitialDeposit] = useState<number>(50);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !guardianName.trim()) {
      alert('শিশুর নাম ও অভিভাবকের নাম দিন!');
      return;
    }

    onCreateAccount({
      name: name.trim(),
      age: Number(age),
      guardianName: guardianName.trim(),
      phone: phone.trim(),
      goalItem: goalItem.trim() ? goalItem.trim() : undefined,
      goalAmount: goalAmount && Number(goalAmount) > 0 ? Number(goalAmount) : undefined,
      initialDeposit: Number(initialDeposit) || 20,
    });

    onClose();
    setName('');
    setGuardianName('');
    setPhone('');
    setGoalItem('');
    setGoalAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 relative shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-none">নতুন সঞ্চয়ী শিশু অ্যাকাউন্ট</h3>
              <p className="text-[11px] text-amber-400 font-mono mt-0.5">
                অ্যাকাউন্ট নং হবে: AMAR-KIDS-{nextAccountSuffix}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">শিশুর পুরো নাম</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: তানভীর আহমেদ"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:border-amber-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">বয়স (বছর)</label>
              <input
                type="number"
                min="3"
                max="18"
                required
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">প্রারম্ভিক জমা (৳)</label>
              <input
                type="number"
                min="10"
                required
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-emerald-400 font-bold focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">অভিভাবকের নাম</label>
              <input
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="মাতা / পিতা"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">মোবাইল ফোন নং</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                স্বপ্নের উপহার / ড্রিম <span className="text-amber-400/80 font-normal text-[11px]">(ঐচ্ছিক)</span>
              </label>
              <input
                type="text"
                value={goalItem}
                onChange={(e) => setGoalItem(e.target.value)}
                placeholder="যেমন: বাইসাইকেল (না থাকলে ফাঁকা রাখুন)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:border-amber-500 outline-none placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                লক্ষ্যের বাজেট (৳) <span className="text-amber-400/80 font-normal text-[11px]">(ঐচ্ছিক)</span>
              </label>
              <input
                type="number"
                min="0"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="০ (ঐচ্ছিক)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:border-amber-500 outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="p-2.5 bg-sky-950/60 border border-sky-600/30 rounded-xl text-[11px] text-sky-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>অ্যাকাউন্ট খোলার সাথে সাথে স্বয়ংক্রিয়ভাবে ৬ পাতার আসল ব্যাংকের A4 চেকবুক তৈরি হবে!</span>
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
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-brand-600 hover:from-sky-400 hover:to-brand-500 text-white font-bold shadow-lg"
            >
              অ্যাকাউন্ট তৈরি করুন 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
