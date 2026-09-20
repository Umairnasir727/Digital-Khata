import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import {
  Store,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Plus,
  ArrowUpRight,
  Sparkles,
  Package,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';
import { formatPKR } from '../../lib/formatters';

export const GenericRetailDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const {
    activeBusiness,
    products,
    customers,
    sales,
    recordSale,
    setIsVoiceAssistantOpen,
  } = useKhata();

  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
  const [saleItemName, setSaleItemName] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [saleCustomer, setSaleCustomer] = useState('');
  const [saleIsUdhaar, setSaleIsUdhaar] = useState(false);

  const totalProducts = products.length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalReceivables = customers.reduce((sum, c) => sum + c.totalReceivable, 0);
  const todaySales = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  const lowStockProducts = products.filter((p) => p.stock <= (p.minStockAlert || 5));

  const handleQuickSale = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(saleAmount) || 0;
    if (amount <= 0) return;

    recordSale({
      date: new Date().toISOString(),
      customerName: saleCustomer || 'Counter Customer',
      items: [
        {
          productId: 'prod_general_sale',
          productName: saleItemName || 'General Store Sale',
          quantity: 1,
          unitPrice: amount,
          unit: 'Item',
          total: amount,
        },
      ],
      subtotal: amount,
      discount: 0,
      tax: 0,
      totalAmount: amount,
      receivedAmount: saleIsUdhaar ? 0 : amount,
      udhaarAmount: saleIsUdhaar ? amount : 0,
      paymentMethod: saleIsUdhaar ? 'Udhaar' : 'Cash',
      notes: `Counter register sale`,
      type: 'sale',
    });

    setIsQuickSaleOpen(false);
    setSaleItemName('');
    setSaleAmount('');
    setSaleCustomer('');
    setSaleIsUdhaar(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Today&apos;s Sales</span>
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#10B981] mt-1">{formatPKR(todaySales)}</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-4/5 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{sales.length} transactions recorded</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Customer Udhaar</span>
              <DollarSign className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-1">{formatPKR(totalReceivables)}</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 w-1/2 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{customers.length} ledger accounts</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Inventory Items</span>
              <Package className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-1">{totalStockUnits} Units</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-400 w-3/4 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{totalProducts} registered items</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Active Category</span>
              <Store className="w-4 h-4 text-[#10B981]" />
            </div>
            <p className="text-base sm:text-lg font-bold text-[#0F172A] capitalize truncate mt-1">
              {activeBusiness.category.replace('_', ' ')}
            </p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-full rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Units: {activeBusiness.suggestedUnits?.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* 2. Fast Actions & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-[#0F172A] text-base">Quick Counter Sales & POS</h3>
              <p className="text-xs text-slate-500">Record fast counter cash sales or add credit</p>
            </div>
            <button
              onClick={() => setIsQuickSaleOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Sale</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">{p.name}</h4>
                  <span className="text-[11px] text-slate-500">
                    Stock: <strong>{p.stock} {p.unit}</strong>
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-[#10B981]">{formatPKR(p.price)}</p>
                  <button
                    onClick={() => {
                      setSaleItemName(p.name);
                      setSaleAmount(p.price.toString());
                      setIsQuickSaleOpen(true);
                    }}
                    className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 mt-1"
                  >
                    Quick Sell &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Card */}
        <div className="bg-gradient-to-br from-[#10B981] to-[#059669] text-white rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-emerald-100" />
              <h4 className="font-bold text-sm">Urdu Voice Munshi</h4>
            </div>
            <p className="text-xs text-emerald-50">
              Speak naturally: &ldquo;Ahmed se 15 hazaar wasool hue&rdquo; or &ldquo;Aj 45 hazaar ki sale hui&rdquo;.
            </p>
          </div>
          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-white text-[#0F172A] font-bold text-xs shadow-md hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <span>Open Voice Assistant</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal: Quick Sale */}
      {isQuickSaleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-[#0F172A] text-lg mb-1">Record Counter Sale</h3>
            <p className="text-xs text-slate-500 mb-4">Enter item and amount.</p>
            <form onSubmit={handleQuickSale} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Item / Description</label>
                <input
                  type="text"
                  value={saleItemName}
                  onChange={(e) => setSaleItemName(e.target.value)}
                  placeholder="e.g. Rice 10kg Bag / Samsung Screen / Syrup"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Total Amount (PKR)</label>
                <input
                  type="number"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  placeholder="e.g. 4500"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Customer Name (Optional)</label>
                <input
                  type="text"
                  value={saleCustomer}
                  onChange={(e) => setSaleCustomer(e.target.value)}
                  placeholder="e.g. Chaudhry Usman"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="udhaar-check"
                  checked={saleIsUdhaar}
                  onChange={(e) => setSaleIsUdhaar(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="udhaar-check" className="text-xs font-bold text-slate-800">
                  This is an Udhaar (Credit) sale &mdash; add to customer ledger
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickSaleOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-xs"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
