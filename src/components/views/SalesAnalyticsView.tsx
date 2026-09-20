import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Filter,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from 'lucide-react';
import { formatPKR } from '../../lib/formatters';

export const SalesAnalyticsView: React.FC = () => {
  const { sales, expenses, addExpense, activeBusiness } = useKhata();

  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Expense Form
  const [expCategory, setExpCategory] = useState<'Salary' | 'Rent' | 'Electricity' | 'Supplier' | 'Marketing' | 'Other'>('Rent');
  const [expAmount, setExpAmount] = useState('');
  const [expNotes, setExpNotes] = useState('');

  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = Math.max(0, totalSales - totalExpenses);
  const profitMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : '0';

  // Method Breakdown
  const methodStats = sales.reduce((acc: Record<string, number>, s) => {
    const m = s.paymentMethod || 'Cash';
    acc[m] = (acc[m] || 0) + s.totalAmount;
    return acc;
  }, {});

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (isNaN(amt) || amt <= 0) return;

    addExpense({
      date: new Date().toISOString().split('T')[0],
      category: expCategory,
      amount: amt,
      paymentMethod: 'Cash',
      notes: expNotes || `${expCategory} expense`,
    });

    setIsExpenseModalOpen(false);
    setExpAmount('');
    setExpNotes('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Performance Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Gross Sales Revenue</span>
          <p className="text-2xl font-black text-stone-900 mt-1">{formatPKR(totalSales)}</p>
          <p className="text-xs text-emerald-700 font-bold mt-0.5">{sales.length} transactions completed</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Business Expenses</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{formatPKR(totalExpenses)}</p>
          <p className="text-xs text-stone-500 mt-0.5">{expenses.length} expense logs</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Net Business Profit</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{formatPKR(netProfit)}</p>
          <p className="text-xs text-stone-500 mt-0.5">Calculated after direct expenses</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500">Gross Profit Margin</span>
          <p className="text-2xl font-black text-stone-900 mt-1">{profitMargin}%</p>
          <p className="text-xs text-stone-500 mt-0.5">Healthy Pakistani retail benchmark</p>
        </div>
      </div>

      {/* 2. Visual Sales Chart & Payment Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Sales Performance Trend</h3>
              <p className="text-xs text-stone-500">Revenue timeline for {activeBusiness.name}</p>
            </div>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              {(['today', 'week', 'month', 'year'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition ${
                    timeframe === t ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Simple Clean Bar Chart Visualizer */}
          <div className="pt-4">
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {sales.slice(0, 8).map((s, idx) => {
                const heightPct = Math.min(100, Math.max(20, (s.totalAmount / (totalSales || 1)) * 300));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] text-stone-500 opacity-0 group-hover:opacity-100 transition truncate max-w-[60px]">
                      {formatPKR(s.totalAmount, { compact: true })}
                    </span>
                    <div
                      className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-t-xl transition duration-200"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] text-stone-400 font-mono">
                      #{s.id.slice(-3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payment Channels & Expense Action */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-stone-900 text-base mb-1">Payment Modes</h3>
            <p className="text-xs text-stone-500">Breakdown of cash, bank & digital wallets</p>
          </div>

          <div className="space-y-3">
            {Object.entries(methodStats).map(([method, amount]) => {
              const numAmount = Number(amount) || 0;
              const pct = totalSales > 0 ? ((numAmount / totalSales) * 100).toFixed(0) : '0';
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-700">{method}</span>
                    <span className="text-stone-900 font-bold">{formatPKR(numAmount)} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record Business Expense</span>
          </button>
        </div>
      </div>

      {/* 3. Recent Sales Transactions Log */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
        <h3 className="font-bold text-stone-900 text-base">Recent Sales Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Items Sold</th>
                <th className="py-3 px-3">Payment Channel</th>
                <th className="py-3 px-3 text-right">Total Bill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50 transition">
                  <td className="py-3 px-3 text-stone-600">
                    {new Date(s.date).toLocaleDateString('en-PK')}
                  </td>
                  <td className="py-3 px-3 font-bold text-stone-900">
                    {s.customerName || 'Walk-in Customer'}
                  </td>
                  <td className="py-3 px-3 text-stone-600">
                    {s.items.map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-semibold">
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-emerald-700">
                    {formatPKR(s.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Expense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-stone-900 text-lg mb-1">Record Business Expense</h3>
            <p className="text-xs text-stone-500 mb-4">Track shop rent, salaries, utilities, and daily costs.</p>
            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="Rent">Shop / Plaza Rent (کرایہ)</option>
                  <option value="Salary">Staff / Karigar Salaries (تنخواہ)</option>
                  <option value="Electricity">Electricity / Generator Bill (بجلی کا بل)</option>
                  <option value="Supplier">Supplier Logistics / Carriage (کرایہ گاڑی)</option>
                  <option value="Marketing">Marketing & Advertising</option>
                  <option value="Other">Other Miscellaneous Expenses</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="e.g. 35000"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-stone-300"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Notes / Description</label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="e.g. Monthly shop rent paid to landlord"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
