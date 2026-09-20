import React, { useState } from 'react';
import { ChequeLeaf, Account } from '../types';
import { toBanglaNumber, numberToBanglaWords } from '../utils/numberToWords';
import { Scissors, CheckCircle, Ban, Edit3, Send, DollarSign, RotateCcw, AlertCircle } from 'lucide-react';

interface Props {
  cheque: ChequeLeaf;
  account?: Account;
  indexOnPage?: number; // 1 or 2 (top or bottom on A4 sheet)
  showInteractiveActions?: boolean;
  onUseForWithdrawal?: (chequeNo: string, amount?: number, reason?: string) => void;
  onCancelCheque?: (chequeNo: string) => void;
  onWriteCheque?: (
    accountNo: string,
    chequeNo: string,
    payeeName: string,
    amount: number,
    date: string,
    reason: string
  ) => void;
  onTearAndSubmit?: (
    chequeNo: string,
    payeeName?: string,
    amount?: number,
    reason?: string
  ) => void;
  onPayTornCheque?: (chequeNo: string) => void;
  onReturnTornCheque?: (chequeNo: string) => void;
  isPrintMode?: boolean;
}

export const ChequeLeafComponent: React.FC<Props> = ({
  cheque,
  account,
  indexOnPage = 1,
  showInteractiveActions = true,
  onUseForWithdrawal,
  onCancelCheque,
  onWriteCheque,
  onTearAndSubmit,
  onPayTornCheque,
  onReturnTornCheque,
  isPrintMode = false,
}) => {
  // Inline writing state
  const [isWritingOpen, setIsWritingOpen] = useState(false);
  const [inputPayee, setInputPayee] = useState(cheque.payeeName || '');
  const [inputAmount, setInputAmount] = useState(cheque.amount ? String(cheque.amount) : '');
  const [inputDate, setInputDate] = useState(cheque.issueDate || new Date().toISOString().split('T')[0]);
  const [inputReason, setInputReason] = useState(cheque.reason || '');

  // Formatting date digits: ONLY if cheque has an explicit issueDate!
  // If not written, date digits are blank spaces!
  const hasDate = Boolean(cheque.issueDate);
  let ddmmyyyy: string[] = ['', '', '', '', '', '', '', ''];
  if (hasDate && cheque.issueDate) {
    const [yyyy, mm, dd] = cheque.issueDate.split('-');
    const formatted = `${dd || ''}${mm || ''}${yyyy || ''}`;
    ddmmyyyy = formatted.split('').slice(0, 8);
    while (ddmmyyyy.length < 8) ddmmyyyy.push('');
  }

  const hasAmount = typeof cheque.amount === 'number' && cheque.amount > 0;
  const displayAmount = hasAmount
    ? (cheque.amount as number).toLocaleString('en-US', { minimumFractionDigits: 2 })
    : '';
  const displayAmountInWords = hasAmount
    ? (cheque.amountInWords || numberToBanglaWords(cheque.amount as number))
    : '';

  const micrCode = `⑈${cheque.chequeNo.replace(/\D/g, '').padEnd(6, '0')}⑈ 020000048⑈ ${account?.accountNo.replace(/\D/g, '').padEnd(10, '0')}⑈ 20`;

  const parsedInputAmt = parseFloat(inputAmount);
  const previewWords = !isNaN(parsedInputAmt) && parsedInputAmt > 0 ? numberToBanglaWords(parsedInputAmt) : '';

  const handleSaveWrite = (andTear: boolean = false) => {
    if (!account) return;
    const amt = parseFloat(inputAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('অনুগ্রহ করে চেকে সঠিক টাকার পরিমাণ লিখুন!');
      return;
    }
    if (amt > account.balance) {
      alert(`অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই! বর্তমান জমানো ব্যালেন্স: ৳${account.balance.toLocaleString()}`);
      return;
    }

    const finalPayee = inputPayee.trim() || 'নিজ / নগদ ক্যাশ';
    const finalDate = inputDate || new Date().toISOString().split('T')[0];
    const finalReason = inputReason.trim() || 'প্রয়োজনীয় খরচ';

    if (onWriteCheque) {
      onWriteCheque(account.accountNo, cheque.chequeNo, finalPayee, amt, finalDate, finalReason);
    }

    if (andTear && onTearAndSubmit) {
      onTearAndSubmit(cheque.chequeNo, finalPayee, amt, finalReason);
    }

    setIsWritingOpen(false);
  };

  const handleTearClick = () => {
    if (!hasAmount || !cheque.payeeName) {
      // Need to write details first
      setIsWritingOpen(true);
      return;
    }
    if (onTearAndSubmit) {
      onTearAndSubmit(cheque.chequeNo, cheque.payeeName, cheque.amount, cheque.reason);
    }
  };

  return (
    <div
      className={`cheque-leaf-unit relative rounded-2xl border-2 overflow-hidden text-slate-900 transition-all ${
        isPrintMode
          ? 'bg-white border-sky-800 shadow-none'
          : cheque.status === 'TORN_SUBMITTED'
          ? 'bg-gradient-to-r from-amber-50/90 via-sky-50/95 to-amber-50/90 border-amber-500/80 shadow-2xl ring-2 ring-amber-400/40'
          : 'bg-gradient-to-r from-sky-50/95 via-amber-50/90 to-sky-50/95 border-sky-600/60 shadow-xl'
      }`}
      style={{ minHeight: isPrintMode ? '132mm' : 'auto' }}
    >
      {/* Top Banner / Cheque Indicator */}
      <div className="flex justify-between items-center bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 text-white px-3.5 py-1.5 text-[11px] font-semibold tracking-wide print:hidden">
        <div className="flex items-center gap-2">
          <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded text-[10px] font-bold">
            চেক পাতা #{toBanglaNumber(cheque.leafNumber)} (A4 পেজের {indexOnPage === 1 ? 'উপরের চেক' : 'নিচের চেক'})
          </span>
          <span className="font-mono text-sky-200">নং: {cheque.chequeNo}</span>
        </div>
        <div className="flex items-center gap-2">
          {cheque.status === 'AVAILABLE' && (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {hasAmount ? '✍️ চেকে লেখা হয়েছে (অব্যবহৃত)' : '⚪ খালি পাতা (লেখা হয়নি)'}
            </span>
          )}
          {cheque.status === 'TORN_SUBMITTED' && (
            <span className="bg-amber-500/30 text-amber-300 border border-amber-400/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
              <Scissors className="w-3 h-3 text-amber-300" />
              <span>✂️ চেক ছিঁড়ে পাঠানো হয়েছে (টাকা দেওয়ার অপেক্ষায়)</span>
            </span>
          )}
          {cheque.status === 'CASHED' && (
            <span className="bg-rose-500/30 text-rose-300 border border-rose-400/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              ক্যাশ পরিশোধিত (Cashed)
            </span>
          )}
          {cheque.status === 'CANCELLED' && (
            <span className="bg-slate-600 text-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              বাতিল (Cancelled)
            </span>
          )}
        </div>
      </div>

      {/* Main Cheque Body: Left Counterfoil + Tear line + Right Main Cheque */}
      <div className="flex flex-col sm:flex-row relative">
        {/* WATERMARK STAMPS FOR TORN / CASHED / CANCELLED */}
        {cheque.status === 'TORN_SUBMITTED' && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            <div className="transform -rotate-6 border-4 border-amber-600/80 bg-amber-500/15 text-amber-900 px-8 py-3 rounded-2xl text-center shadow-2xl backdrop-blur-[1px]">
              <p className="text-xl sm:text-2xl font-black uppercase tracking-widest leading-none text-amber-950">
                ✂️ TORN & PRESENTED
              </p>
              <p className="text-xs font-bold mt-1 text-amber-900">
                চেক ছিঁড়ে কাউন্টারে জমা দেওয়া হয়েছে — ক্যাশ প্রদানের অপেক্ষায়
              </p>
              {hasAmount && (
                <p className="text-sm font-mono font-black text-emerald-900 mt-0.5">টাকার পরিমাণ: ৳{displayAmount}</p>
              )}
            </div>
          </div>
        )}

        {cheque.status === 'CASHED' && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            <div className="transform -rotate-12 border-4 border-rose-600/80 bg-rose-500/15 text-rose-700 px-8 py-3 rounded-2xl text-center shadow-lg backdrop-blur-[1px]">
              <p className="text-2xl font-black uppercase tracking-widest leading-none">PAID & CASHED</p>
              <p className="text-xs font-bold mt-1 text-rose-800">ক্যাশ পরিশোধিত ও সিল মোহরকৃত</p>
              {cheque.cashedDate && (
                <p className="text-[10px] font-mono text-slate-800 font-bold">
                  তারিখ: {cheque.cashedDate} | ৳{displayAmount || cheque.amount}
                </p>
              )}
            </div>
          </div>
        )}

        {cheque.status === 'CANCELLED' && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            <div className="transform -rotate-12 border-4 border-slate-600/80 bg-slate-500/10 text-slate-700 px-8 py-3 rounded-2xl text-center shadow-lg">
              <p className="text-2xl font-black uppercase tracking-widest leading-none">CANCELLED / VOID</p>
              <p className="text-xs font-bold mt-1 text-slate-800">অকার্যকর চেক পাতা</p>
            </div>
          </div>
        )}

        {/* 1. LEFT COUNTERFOIL / STUB (কাউন্টারফয়েল - ব্যাংকের রেকর্ড অংশ) */}
        <div
          className={`w-full sm:w-[28%] p-3 sm:p-4 bg-sky-50/70 border-b-2 sm:border-b-0 sm:border-r-2 border-dashed border-sky-300 flex flex-col justify-between text-[11px] leading-tight font-sans ${
            cheque.status === 'TORN_SUBMITTED' || cheque.status === 'CASHED' ? 'bg-amber-50/50' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between border-b border-sky-300 pb-1.5 mb-2">
              <div>
                <span className="font-bold text-sky-900 text-xs">কাউন্টারফয়েল (স্লিপ)</span>
                <p className="text-[9px] text-slate-500">ছোট সঞ্চয়ীর নিজ সংরক্ষণী</p>
              </div>
              <span className="font-mono font-bold text-sky-950 text-[10px] bg-sky-200/80 px-1.5 py-0.5 rounded">
                {cheque.chequeNo}
              </span>
            </div>

            <div className="space-y-1.5 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">তারিখ / Date:</span>
                <span className="font-mono font-bold text-slate-900">
                  {cheque.issueDate ? cheque.issueDate : '....................'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">প্রাপক / To:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[120px]">
                  {cheque.payeeName ? cheque.payeeName : '....................'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">হিসাব নং / A/C:</span>
                <span className="font-mono font-bold text-sky-900 text-[10px]">
                  {account?.accountNo || 'KIDS-XXXX'}
                </span>
              </div>
            </div>

            {/* Stub Ledger Grid */}
            <div className="mt-3 border border-sky-300 rounded-lg bg-white/90 overflow-hidden text-[10px]">
              <div className="grid grid-cols-2 p-1 border-b border-sky-200 bg-sky-100/60 font-semibold text-slate-700">
                <span>বিবরণ</span>
                <span className="text-right">টাকা (৳)</span>
              </div>
              <div className="grid grid-cols-2 p-1 border-b border-sky-100">
                <span className="text-slate-600">পূর্বের স্থিতি:</span>
                <span className="text-right font-mono font-bold text-slate-800">
                  {account ? `৳${account.balance.toLocaleString()}` : '____'}
                </span>
              </div>
              <div className="grid grid-cols-2 p-1 border-b border-sky-100 bg-rose-50/50">
                <span className="text-rose-700 font-semibold">এই চেকের টাকা:</span>
                <span className="text-right font-mono font-bold text-rose-700">
                  {hasAmount ? `৳${displayAmount}` : '................'}
                </span>
              </div>
              <div className="grid grid-cols-2 p-1 bg-emerald-50/50">
                <span className="text-emerald-800 font-semibold">অবশিষ্ট স্থিতি:</span>
                <span className="text-right font-mono font-bold text-emerald-800">
                  {account && hasAmount
                    ? `৳${Math.max(0, account.balance - (cheque.amount as number)).toLocaleString()}`
                    : '................'}
                </span>
              </div>
            </div>

            {/* If torn off, show confirmation in stub */}
            {(cheque.status === 'TORN_SUBMITTED' || cheque.status === 'CASHED') && (
              <div className="mt-2.5 p-1.5 rounded-lg bg-emerald-100/90 border border-emerald-300 text-[10px] text-emerald-900 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span>চেক পাতা ছাঁটা ও উপস্থাপন করা হয়েছে</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-sky-200 flex justify-between items-end text-[9px] text-slate-500">
            <span>সঞ্চয়ীর ইনিশিয়াল</span>
            <div className="w-20 border-b border-slate-700"></div>
          </div>
        </div>

        {/* PERFORATION LINE WITH SCISSORS (ছিদ্রযুক্ত কাটার দাগ) */}
        <div
          className={`hidden sm:flex flex-col items-center justify-center px-1 text-sky-600 select-none ${
            cheque.status === 'TORN_SUBMITTED' || cheque.status === 'CASHED'
              ? 'bg-amber-200/60'
              : 'bg-sky-100/40'
          }`}
        >
          <Scissors className="w-3.5 h-3.5 transform -rotate-90 my-1 text-sky-700" />
          <div className="h-full border-r-2 border-dashed border-sky-500"></div>
          <span className="text-[8px] font-bold transform -rotate-90 py-4 text-sky-800 tracking-wider">
            TEAR HERE
          </span>
          <div className="h-full border-r-2 border-dashed border-sky-500"></div>
          <Scissors className="w-3.5 h-3.5 transform -rotate-90 my-1 text-sky-700" />
        </div>

        {/* 2. MAIN BANK CHEQUE LEAF (মূল চেক পাতা) */}
        <div className="flex-1 p-4 sm:p-5 relative bank-security-bg flex flex-col justify-between">
          {/* Subtle Security Background Watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04] overflow-hidden select-none">
            <span className="text-7xl font-black tracking-widest text-sky-900 rotate-[-18deg] whitespace-nowrap">
              AMAR BANK BANGLADESH
            </span>
          </div>

          {/* Cheque Header: Bank Name, Logo, Crossed Lines, Cheque No, Date Boxes */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b-2 border-sky-700 pb-2.5">
              <div className="flex items-start gap-3">
                {/* Crossed Line for A/C Payee Only */}
                <div className="border-l-2 border-r-2 border-slate-800 px-1.5 py-0.5 transform -rotate-45 text-[9px] font-black uppercase text-slate-800 self-center tracking-tighter leading-none select-none">
                  A/C PAYEE ONLY
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      🏦
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-sky-950 leading-tight">আমার ব্যাংক - কিডস ব্যাংকিং শাখা</h3>
                      <p className="text-[10px] text-sky-800 font-semibold">AMAR BANK JUNIOR SAVINGS & CHEQUE VAULT</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-600 mt-0.5">শাখা: ভল্ট ও শিশু সঞ্চয় শাখা, ঢাকা | IFSC: AMAR0007842</p>
                </div>
              </div>

              {/* Cheque No and Date Box */}
              <div className="flex flex-col items-end w-full sm:w-auto">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-semibold text-slate-600">চেক নং / Cheque No:</span>
                  <span className="font-mono font-bold text-xs bg-white border border-sky-400 px-2 py-0.5 rounded shadow-inner text-sky-950">
                    {cheque.chequeNo}
                  </span>
                </div>

                {/* 8-Digit Date Box [D][D][M][M][Y][Y][Y][Y] */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-slate-700 mr-1">তারিখ / Date:</span>
                  <div className="flex border-2 border-sky-800 rounded bg-white shadow-sm overflow-hidden">
                    {ddmmyyyy.map((digit, idx) => (
                      <div
                        key={idx}
                        className={`w-5 h-6 flex items-center justify-center font-mono font-bold text-xs text-sky-950 ${
                          idx !== ddmmyyyy.length - 1 ? 'border-r border-sky-300' : ''
                        } ${idx === 1 || idx === 3 ? 'bg-sky-50' : 'bg-white'}`}
                      >
                        {digit}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-[8px] text-slate-400 flex justify-between w-40 px-1 mt-0.5 font-mono">
                  <span>D D</span>
                  <span>M M</span>
                  <span>Y Y Y Y</span>
                </div>
              </div>
            </div>

            {/* Cheque Body Fillable Lines */}
            <div className="mt-3 space-y-2.5 text-xs">
              {/* Payee Line */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 whitespace-nowrap min-w-[110px]">
                  প্রাপক / Pay To:
                </span>
                <div className="flex-1 border-b-2 border-dotted border-slate-700 px-2 py-0.5 font-bold text-sky-950 text-sm flex items-center justify-between min-h-[26px]">
                  {cheque.payeeName ? (
                    <span className="font-serif text-sky-950 text-base">{cheque.payeeName}</span>
                  ) : (
                    <span className="text-slate-400 text-xs italic tracking-wider">
                      ..........................................................................................................................
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 italic font-normal whitespace-nowrap">
                    অথবা বাহককে / Or Bearer
                  </span>
                </div>
              </div>

              {/* Amount in Words */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 whitespace-nowrap min-w-[110px]">
                  কথায় / Rupees/Taka:
                </span>
                <div className="flex-1 border-b-2 border-dotted border-slate-700 px-2 py-0.5 font-semibold text-slate-800 text-xs min-h-[26px]">
                  {displayAmountInWords ? (
                    <span className="font-bold text-sky-950 text-sm">{displayAmountInWords}</span>
                  ) : (
                    <span className="text-slate-400 text-xs italic tracking-wider">
                      ............................................................................................................................................................
                    </span>
                  )}
                </div>
              </div>

              {/* Account Number & Amount in Figures Box */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                {/* Account Number Embossed Box */}
                <div className="flex items-center gap-2 bg-white/95 border-2 border-sky-800 px-3 py-1.5 rounded-lg shadow-inner w-full sm:w-auto">
                  <span className="font-bold text-slate-700 text-[11px]">হিসাব নং / A/C No:</span>
                  <span className="font-mono font-black text-sky-950 text-sm tracking-wider">
                    {account?.accountNo || 'AMAR-KIDS-1001'}
                  </span>
                </div>

                {/* Amount in Figures Decorated Box */}
                <div className="flex items-center bg-white border-2 border-sky-800 rounded-lg overflow-hidden shadow-md w-full sm:w-auto">
                  <div className="bg-sky-800 text-white font-black text-lg px-3 py-1.5 flex items-center justify-center">
                    ৳
                  </div>
                  <div className="px-4 py-1 font-mono font-black text-lg text-emerald-900 min-w-[130px] text-right tracking-wide">
                    {hasAmount ? `${displayAmount}/-` : '...................... /-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures and Footer */}
          <div className="mt-4 pt-3 border-t border-sky-200 flex flex-col justify-between">
            <div className="flex justify-between items-end text-[11px] mb-3">
              {/* Account Holder Signature */}
              <div className="text-center w-40">
                <div className="h-7 flex items-end justify-center">
                  {hasAmount ? (
                    <span className="font-serif italic text-sky-900 text-xs font-bold">
                      {account?.name || 'হিসাবধারী'}
                    </span>
                  ) : (
                    <span className="text-slate-300 font-mono text-[10px]">........................</span>
                  )}
                </div>
                <div className="border-t-2 border-slate-800 pt-1">
                  <span className="font-bold text-slate-800 block leading-tight">হিসাবধারীর স্বাক্ষর</span>
                  <span className="text-[9px] text-slate-500">ছোট সঞ্চয়ীর দস্তখত</span>
                </div>
              </div>

              {/* Authorized Bank Signatory */}
              <div className="text-center w-44">
                <div className="h-7 flex items-end justify-center">
                  {cheque.status === 'CASHED' ? (
                    <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 rounded border border-emerald-300">
                      APPROVED & PAID
                    </span>
                  ) : cheque.status === 'TORN_SUBMITTED' ? (
                    <span className="font-mono text-[10px] text-amber-800 font-bold bg-amber-50 px-2 rounded border border-amber-300 animate-pulse">
                      AWAITING PAYMENT
                    </span>
                  ) : (
                    <span className="text-slate-300 font-mono text-[10px]">........................</span>
                  )}
                </div>
                <div className="border-t-2 border-slate-800 pt-1">
                  <span className="font-bold text-slate-800 block leading-tight">অনুমোদিত স্বাক্ষর</span>
                  <span className="text-[9px] text-slate-500">প্রধান শিক্ষক / ভল্ট এডমিন</span>
                </div>
              </div>
            </div>

            {/* MICR BANK CODE BAND */}
            <div className="bg-white/80 border-t border-sky-300 pt-1.5 pb-1 px-3 rounded flex items-center justify-between text-[11px] font-mono text-slate-800 select-all">
              <div className="micr-font font-bold tracking-widest text-slate-800 text-xs sm:text-sm">
                {micrCode}
              </div>
              <span className="text-[9px] text-slate-400 font-sans hidden sm:inline">
                MICR Coded Cheque | CTS-2010 Compliant
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* INLINE WRITE CHEQUE DRAWER (When clicking "✍️ চেকে লিখুন") */}
      {isWritingOpen && !isPrintMode && (
        <div className="bg-slate-900 border-t-2 border-amber-500 p-4 text-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-sm text-amber-400">
                চেক নং {cheque.chequeNo} এ তথ্য লিখুন
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsWritingOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              বন্ধ করুন ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Payee */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                প্রাপক (Pay To):
              </label>
              <input
                type="text"
                value={inputPayee}
                onChange={(e) => setInputPayee(e.target.value)}
                placeholder="যেমন: নিজ / ক্যাশ, গল্পের বই কেনা"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-medium focus:border-amber-400 outline-none"
              />
              <div className="flex gap-1.5 mt-1">
                {['নিজ / ক্যাশ', 'বই কেনা', 'স্কুল ফি', 'খেলনা'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setInputPayee(preset)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                টাকার পরিমাণ (৳):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={account?.balance || 50000}
                  step="any"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="যেমন: ১০০"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-slate-100 font-mono font-bold focus:border-amber-400 outline-none"
                />
                <span className="absolute left-2.5 top-2 text-slate-500 font-bold">৳</span>
              </div>
              {previewWords && (
                <p className="text-[11px] text-amber-300 mt-1 font-semibold truncate">
                  কথায়: {previewWords}
                </p>
              )}
            </div>

            {/* Date & Reason */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                তারিখ (Date):
              </label>
              <input
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-medium focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] text-slate-400">
              হিসাবের বর্তমান জমানো টাকা: <strong className="text-emerald-400">৳{account?.balance.toLocaleString()}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveWrite(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700"
              >
                💾 চেকে লিখে সংরক্ষণ
              </button>
              <button
                type="button"
                onClick={() => handleSaveWrite(true)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition shadow flex items-center gap-1.5"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>লিখে এখনই চেক ছিঁড়ে পাঠান ✂️</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quick Actions (Hidden in Print Mode) */}
      {showInteractiveActions && !isPrintMode && (
        <div className="bg-slate-900 text-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 text-xs print:hidden">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">অবস্থা:</span>
            <span
              className={`font-bold ${
                cheque.status === 'AVAILABLE'
                  ? 'text-emerald-400'
                  : cheque.status === 'TORN_SUBMITTED'
                  ? 'text-amber-400 animate-pulse'
                  : cheque.status === 'CASHED'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {cheque.status === 'AVAILABLE'
                ? hasAmount
                  ? '🟢 প্রস্তুত চেক (লেখা হয়েছে)'
                  : '⚪ খালি চেক পাতা'
                : cheque.status === 'TORN_SUBMITTED'
                ? '🟡 চেক ছিঁড়ে পাঠানো হয়েছে (টাকা দেওয়া বাকি)'
                : cheque.status === 'CASHED'
                ? '🔴 ক্যাশ সম্পন্ন'
                : '⚫ বাতিল'}
            </span>

            {hasAmount && (
              <span className="text-emerald-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                ৳{displayAmount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* If AVAILABLE: option to write or tear */}
            {cheque.status === 'AVAILABLE' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsWritingOpen(!isWritingOpen)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition flex items-center gap-1.5 border border-amber-500/30 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{hasAmount ? 'পুনরায় লিখুন' : '✍️ চেকে লিখুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTearClick}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center gap-1.5"
                  title="চেক ছিঁড়ে জমা দিন"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>✂️ চেক ছিঁড়ে পাঠান</span>
                </button>
              </>
            )}

            {/* If TORN_SUBMITTED: Admin pays cash or returns */}
            {cheque.status === 'TORN_SUBMITTED' && (
              <>
                {onPayTornCheque && (
                  <button
                    type="button"
                    onClick={() => onPayTornCheque(cheque.chequeNo)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center gap-1.5 animate-bounce"
                    title="চেক যাচাই করে ক্যাশ টাকা দিয়ে দিন"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>💵 টাকা দিয়ে দিন (Pay Cash)</span>
                  </button>
                )}

                {onReturnTornCheque && (
                  <button
                    type="button"
                    onClick={() => onReturnTornCheque(cheque.chequeNo)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition flex items-center gap-1"
                    title="চেক বইতে ফিরিয়ে রাখুন"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>বইতে ফেরত</span>
                  </button>
                )}
              </>
            )}

            {/* Cancel option */}
            {cheque.status === 'AVAILABLE' && onCancelCheque && (
              <button
                type="button"
                onClick={() => onCancelCheque(cheque.chequeNo)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs transition flex items-center gap-1"
                title="চেক পাতা বাতিল"
              >
                <Ban className="w-3 h-3" /> বাতিল
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
