import React, { useState } from 'react';
import { Trash2, AlertTriangle, Download, RefreshCw, X, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData: (mode: 'BLANK' | 'FRESH_DEMO') => void;
  onExportBackup: () => void;
}

export const ClearDataModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onClearAllData,
  onExportBackup,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [selectedMode, setSelectedMode] = useState<'BLANK' | 'FRESH_DEMO'>('BLANK');

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim().toLowerCase() === 'মুছুন' || confirmText.trim().toUpperCase() === 'DELETE' || confirmText.trim() === '1234';

  const handleExecute = () => {
    if (!isConfirmed) {
      alert('সঠিকভাবে "মুছুন" বা "DELETE" লিখে কনফার্ম করুন!');
      return;
    }
    onClearAllData(selectedMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-rose-600/60 w-full max-w-md rounded-2xl p-6 relative shadow-2xl space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-2xl shadow-inner">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                <span>সব ডাটা মোছার অপশন</span>
                <span className="text-[10px] bg-rose-500/30 text-rose-300 font-mono px-2 py-0.5 rounded">
                  DATA PURGE
                </span>
              </h3>
              <p className="text-xs text-rose-400 font-semibold">
                সিস্টেমের সমস্ত তথ্য সম্পূর্ণ মুছে ফেলার কাউন্টার
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Notice */}
        <div className="p-3.5 bg-rose-950/50 border border-rose-600/40 rounded-xl flex items-start gap-3 text-xs text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-100">সতর্কবাণী: এটি একটি অপরিবর্তনীয় প্রক্রিয়া!</p>
            <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
              সব ডাটা মুছে ফেললে সমস্ত সঞ্চয়ী শিশু অ্যাকাউন্ট, ইস্যুকৃত চেকবুক ও চেকের পাতা, জমাকৃত মাটির ব্যাংকের টাকা, লোনের কিস্তি এবং ট্রানজেকশন মুছে যাবে।
            </p>
          </div>
        </div>

        {/* Safe Recommendation: Backup first */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-sky-400" />
            <span className="text-slate-300">মুছার পূর্বে ব্যাকআপ রাখতে চান?</span>
          </div>
          <button
            type="button"
            onClick={onExportBackup}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] transition shadow flex items-center gap-1"
          >
            JSON ব্যাকআপ ডাউনলোড
          </button>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2 text-xs">
          <label className="block font-bold text-slate-300">ডাটা মোছার ধরন নির্বাচন করুন:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedMode('BLANK')}
              className={`p-3 rounded-xl border text-left transition ${
                selectedMode === 'BLANK'
                  ? 'border-rose-500 bg-rose-500/10 text-white font-bold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Trash2 className="w-4 h-4 text-rose-400 mb-1" />
              <p className="text-xs">সম্পূর্ণ ফাঁকা করুন</p>
              <p className="text-[10px] text-slate-400">০ অ্যাকাউন্ট ও ফাঁকা ডাটাবেস</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode('FRESH_DEMO')}
              className={`p-3 rounded-xl border text-left transition ${
                selectedMode === 'FRESH_DEMO'
                  ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <RefreshCw className="w-4 h-4 text-amber-400 mb-1" />
              <p className="text-xs">নতুন ডেমো ডাটা</p>
              <p className="text-[10px] text-slate-400">নতুন শুরু করার ডেমো শিশু</p>
            </button>
          </div>
        </div>

        {/* Security confirmation input */}
        <div className="space-y-1.5 text-xs">
          <label className="block text-slate-300 font-semibold">
            নিশ্চিত করতে নিচে <span className="font-mono text-rose-400 font-bold">মুছুন</span> অথবা{' '}
            <span className="font-mono text-rose-400 font-bold">DELETE</span> লিখুন:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="মুছুন / DELETE"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center font-mono font-bold text-sm text-rose-400 focus:border-rose-500 outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            বাতিল করুন
          </button>
          <button
            type="button"
            disabled={!isConfirmed}
            onClick={handleExecute}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5 ${
              isConfirmed
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>হ্যাঁ, সব ডাটা মুছে ফেলুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
