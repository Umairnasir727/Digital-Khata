import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import {
  Gem,
  Calculator,
  TrendingUp,
  Scale,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  RefreshCw,
  Coins,
  Sparkles,
  DollarSign,
  User,
  ShoppingBag,
  History,
} from 'lucide-react';
import { formatPKR, tolaToGrams, gramsToTolaBreakdown } from '../../lib/formatters';

export const JewelleryDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const {
    activeBusiness,
    products,
    customers,
    sales,
    updateGoldRate,
    recordSale,
    userRole,
    setIsVoiceAssistantOpen,
  } = useKhata();

  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [newRateInput, setNewRateInput] = useState(activeBusiness.goldRates?.rate24k.toString() || '485000');

  // Calculator State
  const [calcTola, setCalcTola] = useState('1');
  const [calcMasha, setCalcMasha] = useState('0');
  const [calcRatti, setCalcRatti] = useState('0');
  const [calcGrams, setCalcGrams] = useState('11.66');
  const [calcPurity, setCalcPurity] = useState<'24K' | '22K' | '21K' | '18K'>('22K');
  const [calcMaking, setCalcMaking] = useState('15000');

  // Quick Sale Modal State
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [saleItemName, setSaleItemName] = useState('Bridal Gold Set');
  const [salePurity, setSalePurity] = useState<'24K' | '22K' | '21K' | '18K'>('22K');
  const [saleTola, setSaleTola] = useState('1.5');
  const [saleMaking, setSaleMaking] = useState('30000');
  const [saleCustName, setSaleCustName] = useState('');
  const [saleCustPhone, setSaleCustPhone] = useState('');
  const [salePaymentMethod, setSalePaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Easypaisa' | 'JazzCash' | 'Udhaar'>('Cash');
  const [saleReceivedAmount, setSaleReceivedAmount] = useState('');

  const goldRates = activeBusiness.goldRates || {
    rate24k: 485000,
    rate22k: 444580,
    rate21k: 424375,
    rate18k: 363750,
    lastUpdated: new Date().toISOString(),
  };

  // Calculations for calculator widget
  const getRateForPurity = (p: '24K' | '22K' | '21K' | '18K') => {
    switch (p) {
      case '24K': return goldRates.rate24k;
      case '22K': return goldRates.rate22k;
      case '21K': return goldRates.rate21k;
      case '18K': return goldRates.rate18k;
    }
  };

  const calculatedTolaTotal =
    (parseFloat(calcTola) || 0) +
    (parseFloat(calcMasha) || 0) / 12 +
    (parseFloat(calcRatti) || 0) / 96;

  const calculatedGoldValue = Math.round(calculatedTolaTotal * getRateForPurity(calcPurity));
  const calculatedGrandTotal = calculatedGoldValue + (parseFloat(calcMaking) || 0);

  // Vault Totals
  const totalGoldTolas = products.reduce((sum, p) => sum + ((p.weightTola || 0) * (p.stock || 1)), 0);
  const totalVaultValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const todaySales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalReceivable = customers.reduce((sum, c) => sum + c.totalReceivable, 0);

  const handleUpdateRate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(newRateInput.replace(/,/g, ''));
    if (!isNaN(parsed) && parsed > 50000) {
      updateGoldRate(parsed);
      setIsRateModalOpen(false);
    }
  };

  const handleQuickSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tola = parseFloat(saleTola) || 1;
    const rate = getRateForPurity(salePurity);
    const goldCost = Math.round(tola * rate);
    const making = parseFloat(saleMaking) || 0;
    const totalAmount = goldCost + making;
    const received = saleReceivedAmount ? parseFloat(saleReceivedAmount) : totalAmount;
    const udhaar = Math.max(0, totalAmount - received);

    recordSale({
      date: new Date().toISOString(),
      customerName: saleCustName || 'Walk-in Gold Customer',
      customerPhone: saleCustPhone,
      items: [
        {
          productId: 'prod_gold_custom',
          productName: `${salePurity} ${saleItemName} (${tola} Tola)`,
          quantity: 1,
          unitPrice: totalAmount,
          unit: 'Tola',
          total: totalAmount,
          meta: { goldPurity: salePurity, weightTola: tola, makingCharges: making },
        },
      ],
      subtotal: totalAmount,
      discount: 0,
      tax: 0,
      totalAmount,
      receivedAmount: received,
      udhaarAmount: udhaar,
      paymentMethod: salePaymentMethod,
      notes: `${salePurity} Gold Sale at Rs. ${rate.toLocaleString()}/tola rate`,
      type: 'sale',
    });

    setIsSaleModalOpen(false);
    setSaleCustName('');
    setSaleReceivedAmount('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Live Gold Ticker Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                Sarafa Bazar Live Gold Ticker
              </span>
              <span className="text-[11px] text-slate-400">
                &bull; Updated: {new Date(goldRates.lastUpdated).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#D97706]">
                {formatPKR(goldRates.rate24k)}
              </h2>
              <span className="text-xs text-slate-300 font-normal">/ Tola (24K Pure)</span>
            </div>
          </div>

          {/* Rates Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">22K Gold</span>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5">{formatPKR(goldRates.rate22k)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">21K Gold</span>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5">{formatPKR(goldRates.rate21k)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">18K Gold</span>
              <p className="text-xs sm:text-sm font-bold text-white mt-0.5">{formatPKR(goldRates.rate18k)}</p>
            </div>
          </div>

          {/* Rate Update Button */}
          {userRole === 'owner' && (
            <button
              onClick={() => setIsRateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 self-start md:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Today&apos;s Rate</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Jewellery Metrics Cards with Geometric Balance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vault Gold</span>
              <Scale className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">{totalGoldTolas.toFixed(2)} <span className="text-base font-medium text-slate-500">Tola</span></h2>
            </div>
          </div>
          <div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-4/5 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">≈ {(totalGoldTolas * 11.6638).toFixed(1)} Grams in Vault</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inventory Value</span>
              <Coins className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700">{formatPKR(totalVaultValue, { compact: true })}</h2>
            </div>
          </div>
          <div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 w-3/4 rounded-full" />
            </div>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 bg-emerald-50 text-[10px] font-bold text-emerald-700 rounded">{totalGoldTolas.toFixed(1)} Tola Gold</span>
              <span className="px-2 py-0.5 bg-blue-50 text-[10px] font-bold text-blue-700 rounded">{products.length} Items</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Udhaar (Receivable)</span>
              <DollarSign className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600">{formatPKR(totalReceivable)}</h2>
            </div>
          </div>
          <div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 w-1/2 rounded-full" />
            </div>
            <button
              onClick={() => onNavigate('khata')}
              className="text-[11px] text-emerald-600 font-bold hover:underline mt-2 block"
            >
              Check Udhaar Ledger &rarr;
            </button>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today&apos;s Sales</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">{formatPKR(todaySales)}</h2>
              <span className="text-emerald-500 text-xs font-bold">+12%</span>
            </div>
          </div>
          <div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-2/3 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{sales.length} transactions recorded</p>
          </div>
        </div>
      </div>

      {/* 3. Interactive Tola / Masha / Ratti Gold Calculator & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Weight & Making Calculator */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F172A] text-base">Live Jewellery Rate & Weight Calculator</h3>
                <p className="text-xs text-slate-500">1 Tola = 12 Masha = 96 Ratti = 11.6638 Grams</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Pakistani Standard
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tola (تولہ)</label>
              <input
                type="number"
                step="0.01"
                value={calcTola}
                onChange={(e) => {
                  setCalcTola(e.target.value);
                  const grams = tolaToGrams(parseFloat(e.target.value) || 0, parseFloat(calcMasha) || 0, parseFloat(calcRatti) || 0);
                  setCalcGrams(grams.toString());
                }}
                className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Masha (ماشہ)</label>
              <input
                type="number"
                min="0"
                max="11"
                value={calcMasha}
                onChange={(e) => {
                  setCalcMasha(e.target.value);
                  const grams = tolaToGrams(parseFloat(calcTola) || 0, parseFloat(e.target.value) || 0, parseFloat(calcRatti) || 0);
                  setCalcGrams(grams.toString());
                }}
                className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Ratti (رتی)</label>
              <input
                type="number"
                min="0"
                max="7"
                value={calcRatti}
                onChange={(e) => {
                  setCalcRatti(e.target.value);
                  const grams = tolaToGrams(parseFloat(calcTola) || 0, parseFloat(calcMasha) || 0, parseFloat(e.target.value) || 0);
                  setCalcGrams(grams.toString());
                }}
                className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Grams (گرام)</label>
              <input
                type="number"
                step="0.01"
                value={calcGrams}
                onChange={(e) => {
                  const g = parseFloat(e.target.value) || 0;
                  setCalcGrams(e.target.value);
                  const breakdown = gramsToTolaBreakdown(g);
                  setCalcTola(breakdown.tola.toString());
                  setCalcMasha(breakdown.masha.toString());
                  setCalcRatti(breakdown.ratti.toString());
                }}
                className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Gold Purity (قیراط)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['24K', '22K', '21K', '18K'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCalcPurity(p)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      calcPurity === p
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Making Charges / Katai (مزدوری)</label>
              <input
                type="number"
                value={calcMaking}
                onChange={(e) => setCalcMaking(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
              />
            </div>
          </div>

          {/* Calculator Output Summary Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                Net Weight: {calculatedTolaTotal.toFixed(3)} Tola ({calcGrams}g) @ {calcPurity}
              </span>
              <div className="text-xs text-slate-600 mt-0.5">
                Gold Cost: {formatPKR(calculatedGoldValue)} + Mazdoori: {formatPKR(parseFloat(calcMaking) || 0)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Estimated Price</span>
              <p className="text-xl sm:text-2xl font-black text-[#0F172A]">{formatPKR(calculatedGrandTotal)}</p>
            </div>
          </div>
        </div>

        {/* Quick Jewellery Actions Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-[#0F172A] text-base mb-1">Quick Gold Actions</h3>
            <p className="text-xs text-slate-500">Record transactions or use AI voice</p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => setIsSaleModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Create Gold Sale Invoice</span>
              </div>
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('khata')}
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Add Customer Udhaar (ادھار)</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Speak into Gold Assistant</span>
              </div>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Karigar & Old Gold Reminder Box */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-900 block mb-0.5">Puraana Sona (Scrap Buyback)</span>
            Deduct 1 to 2 Ratti impurity per tola before buying back old gold at current bullion rate.
          </div>
        </div>
      </div>

      {/* 4. Featured Jewellery Items in Vault */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[#0F172A] text-base">Vault Stock & Jewellery Catalog</h3>
            <p className="text-xs text-slate-500">Live price auto-calculated from today&apos;s gold rate</p>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            View All Stock &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.name}</h4>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                    {item.goldPurity || '22K'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                  <span>Weight: <strong>{item.weightTola ? `${item.weightTola} Tola` : `${item.weightGram || 0}g`}</strong></span>
                  <span>Mazdoori: <strong>{formatPKR(item.makingCharges || 0)}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200">
                <span className="text-xs text-slate-500">In Stock: <strong className="text-slate-800">{item.stock} pcs</strong></span>
                <span className="text-sm font-extrabold text-emerald-700">{formatPKR(item.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Update Gold Rate */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-[#0F172A] text-lg mb-1">Update Today&apos;s Sarafa Gold Rate</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter 24K pure gold rate per tola. 22K, 21K, and 18K will auto-calculate.
            </p>
            <form onSubmit={handleUpdateRate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">24K Gold Rate (PKR / Tola)</label>
                <input
                  type="text"
                  value={newRateInput}
                  onChange={(e) => setNewRateInput(e.target.value)}
                  placeholder="e.g. 485,000"
                  className="w-full text-lg font-mono font-bold px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs"
                >
                  Save & Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Gold Sale Invoice */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-[#0F172A] text-lg mb-1">Create Gold Jewellery Sale</h3>
            <p className="text-xs text-slate-500 mb-4">
              Calculate instant billing based on today&apos;s gold rate + making charges.
            </p>
            <form onSubmit={handleQuickSaleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Jewellery Item Description</label>
                <input
                  type="text"
                  value={saleItemName}
                  onChange={(e) => setSaleItemName(e.target.value)}
                  placeholder="e.g. 22K Bridal Necklace Set / Gold Bangles"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Purity</label>
                  <select
                    value={salePurity}
                    onChange={(e) => setSalePurity(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="24K">24K Pure</option>
                    <option value="22K">22K Standard</option>
                    <option value="21K">21K Traditional</option>
                    <option value="18K">18K Diamond Set</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Weight (Tola)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={saleTola}
                    onChange={(e) => setSaleTola(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Making Charges (Katai)</label>
                  <input
                    type="number"
                    value={saleMaking}
                    onChange={(e) => setSaleMaking(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={salePaymentMethod}
                    onChange={(e) => setSalePaymentMethod(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Udhaar">Full Udhaar (Credit)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={saleCustName}
                    onChange={(e) => setSaleCustName(e.target.value)}
                    placeholder="e.g. Chaudhry Usman"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Amount Received (PKR)</label>
                  <input
                    type="number"
                    value={saleReceivedAmount}
                    onChange={(e) => setSaleReceivedAmount(e.target.value)}
                    placeholder="Leave empty for full payment"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex justify-between font-bold">
                <span>Calculated Total:</span>
                <span className="text-[#0F172A]">
                  {formatPKR(
                    Math.round((parseFloat(saleTola) || 1) * getRateForPurity(salePurity)) +
                      (parseFloat(saleMaking) || 0)
                  )}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaleModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-xs"
                >
                  Save & Print Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
