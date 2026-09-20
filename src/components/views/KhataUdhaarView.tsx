import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import {
  Users,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  MessageCircle,
  Phone,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Send,
  X,
  Filter,
} from 'lucide-react';
import { formatPKR } from '../../lib/formatters';
import { Customer } from '../../types';

export const KhataUdhaarView: React.FC = () => {
  const {
    customers,
    addCustomer,
    addCustomerTransaction,
    activeBusiness,
    setIsVoiceAssistantOpen,
  } = useKhata();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [filterType, setFilterType] = useState<'all' | 'receivables' | 'payables'>('all');

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [txType, setTxType] = useState<'udhaar_given' | 'payment_received'>('udhaar_given');
  const [txAmount, setTxAmount] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [txPaymentMethod, setTxPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Easypaisa' | 'JazzCash' | 'Cheque'>('Cash');

  // New Customer Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustType, setNewCustType] = useState<'customer' | 'supplier'>('customer');
  const [newCustReceivable, setNewCustReceivable] = useState('');
  const [newCustPayable, setNewCustPayable] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');

  // WhatsApp Prompt Modal
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppMsg, setWhatsAppMsg] = useState('');

  const totalReceivables = customers.reduce((sum, c) => sum + c.totalReceivable, 0);
  const totalPayables = customers.reduce((sum, c) => sum + c.totalPayable, 0);
  const netBalance = totalReceivables - totalPayables;

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);

    if (filterType === 'receivables') return matchesSearch && c.totalReceivable > 0;
    if (filterType === 'payables') return matchesSearch && c.totalPayable > 0;
    return matchesSearch;
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newId = addCustomer({
      name: newCustName,
      phone: newCustPhone || '+92 300 0000000',
      type: newCustType,
      totalReceivable: parseFloat(newCustReceivable) || 0,
      totalPayable: parseFloat(newCustPayable) || 0,
      notes: newCustNotes,
    });

    setSelectedCustomerId(newId);
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustReceivable('');
    setNewCustPayable('');
    setNewCustNotes('');
  };

  const handleRecordTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const amount = parseFloat(txAmount);
    if (isNaN(amount) || amount <= 0) return;

    addCustomerTransaction(selectedCustomer.id, {
      date: new Date().toISOString(),
      type: txType,
      amount,
      paymentMethod: txPaymentMethod,
      notes: txNotes || (txType === 'udhaar_given' ? 'Udhaar diya gaya' : 'Wasooli / Payment Received'),
    });

    setIsTransactionModalOpen(false);
    setTxAmount('');
    setTxNotes('');
  };

  const openWhatsAppModal = (customer: Customer) => {
    const msg = `Assalam-o-Alaikum ${customer.name} sahib,\n\nAapka ${activeBusiness.name} par Rs. ${customer.totalReceivable.toLocaleString()} ka hisab baqaya hai.\n\nBaraye meherbani payment clear farma dain ya JazzCash/Easypaisa/Bank se send kar dain.\n\nJazakAllah Khair,\n${activeBusiness.name}\n${activeBusiness.phone || ''}`;
    setWhatsAppMsg(msg);
    setIsWhatsAppOpen(true);
  };

  const sendWhatsAppDirect = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsWhatsAppOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Summary Banner (Lene Hain vs Dene Hain) with Geometric Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Lene Hain (Receivables) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lene Hain (Receivables)</span>
              <ArrowDownLeft className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600">{formatPKR(totalReceivables)}</h2>
            </div>
          </div>
          <div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 w-3/4 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {customers.filter((c) => c.totalReceivable > 0).length} customers owe money
            </p>
          </div>
        </div>

        {/* Dene Hain (Payables) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dene Hain (Payables)</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#10B981]">{formatPKR(totalPayables)}</h2>
            </div>
          </div>
          <div>
            <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-1/2 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {customers.filter((c) => c.totalPayable > 0).length} suppliers / vendors
            </p>
          </div>
        </div>

        {/* Net Business Balance */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:p-6 rounded-2xl text-white shadow-sm flex flex-col justify-between border border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-2 text-slate-400">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Net Khata Surplus</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-300">{formatPKR(netBalance)}</h2>
            </div>
          </div>
          <div>
            <div className="mt-4 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 w-4/5 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Surplus Net Business Capital</p>
          </div>
        </div>
      </div>

      {/* 2. Main Khata Split View (Customer List + Customer Ledger Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Directory (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#0F172A] text-base">Khata Accounts</h3>
              <p className="text-xs text-slate-500">{filteredCustomers.length} khata entries found</p>
            </div>
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or phone number..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
            </div>

            <div className="flex gap-1.5 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterType === 'all' ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({customers.length})
              </button>
              <button
                onClick={() => setFilterType('receivables')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterType === 'receivables' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-rose-700 hover:bg-slate-200'
                }`}
              >
                Lene Hain
              </button>
              <button
                onClick={() => setFilterType('payables')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterType === 'payables' ? 'bg-[#10B981] text-white' : 'bg-slate-100 text-emerald-800 hover:bg-slate-200'
                }`}
              >
                Dene Hain
              </button>
            </div>
          </div>

          {/* Customer Cards List */}
          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto pr-1">
            {filteredCustomers.map((cust) => {
              const isSelected = cust.id === selectedCustomerId;
              return (
                <button
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className={`w-full text-left p-3 rounded-2xl transition my-1 flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/90 border border-emerald-300 shadow-xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                      {cust.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-[#0F172A] text-xs sm:text-sm truncate">{cust.name}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{cust.phone || 'No phone'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {cust.totalReceivable > 0 ? (
                      <div>
                        <span className="text-[10px] text-rose-600 font-bold uppercase">Lene Hain</span>
                        <p className="text-xs sm:text-sm font-extrabold text-rose-600">
                          {formatPKR(cust.totalReceivable)}
                        </p>
                      </div>
                    ) : cust.totalPayable > 0 ? (
                      <div>
                        <span className="text-[10px] text-emerald-700 font-bold uppercase">Dene Hain</span>
                        <p className="text-xs sm:text-sm font-extrabold text-emerald-700">
                          {formatPKR(cust.totalPayable)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Hisab Clear</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Customer Ledger & Transaction Log (7 Cols) */}
        {selectedCustomer ? (
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            {/* Customer Detail Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#10B981] text-white flex items-center justify-center font-black text-lg shadow-sm">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[#0F172A] text-lg">{selectedCustomer.name}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {selectedCustomer.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedCustomer.phone} &bull; {selectedCustomer.notes || 'VIP Customer'}</p>
                </div>
              </div>

              {/* Action Buttons: WhatsApp Reminder & Add Entry */}
              <div className="flex items-center gap-2">
                {selectedCustomer.totalReceivable > 0 && (
                  <button
                    onClick={() => openWhatsAppModal(selectedCustomer)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Reminder</span>
                  </button>
                )}

                <button
                  onClick={() => setIsTransactionModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Transaction</span>
                </button>
              </div>
            </div>

            {/* Current Balance Display */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Current Account Net Balance</span>
                <p className="text-xl sm:text-2xl font-black text-[#0F172A] mt-0.5">
                  {selectedCustomer.totalReceivable > 0
                    ? `Lene Hain: ${formatPKR(selectedCustomer.totalReceivable)}`
                    : selectedCustomer.totalPayable > 0
                    ? `Dene Hain: ${formatPKR(selectedCustomer.totalPayable)}`
                    : 'Hisab Bilkul Clear Hai'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTxType('payment_received');
                    setIsTransactionModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#10B981] text-white font-bold text-xs hover:bg-[#059669] transition shadow-xs"
                >
                  + Wasooli (Received)
                </button>
                <button
                  onClick={() => {
                    setTxType('udhaar_given');
                    setIsTransactionModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition shadow-xs"
                >
                  + Udhaar Diya
                </button>
              </div>
            </div>

            {/* Transaction Ledger History */}
            <div>
              <h4 className="font-bold text-[#0F172A] text-sm mb-3">Transaction Ledger History</h4>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {selectedCustomer.transactions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400">
                    No transactions recorded for this customer yet.
                  </div>
                ) : (
                  selectedCustomer.transactions.map((tx) => {
                    const isUdhaar = tx.type === 'udhaar_given';
                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl ${
                              isUdhaar
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isUdhaar ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-[#0F172A] text-xs sm:text-sm">
                              {isUdhaar ? 'Udhaar Diya (Credit Given)' : 'Wasooli (Payment Received)'}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span>{new Date(tx.date).toLocaleDateString('en-PK')}</span>
                              <span>&bull;</span>
                              <span>{tx.paymentMethod}</span>
                              {tx.notes && (
                                <>
                                  <span>&bull;</span>
                                  <span className="italic">{tx.notes}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-sm sm:text-base font-extrabold ${
                              isUdhaar ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            {isUdhaar ? `+ ${formatPKR(tx.amount)}` : `- ${formatPKR(tx.amount)}`}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-3xl p-12 border border-slate-200 text-center text-slate-400">
            Select a customer from the left list to view their ledger.
          </div>
        )}
      </div>

      {/* Modal: Add Customer */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-[#0F172A] text-lg mb-1">Add New Khata Contact</h3>
            <p className="text-xs text-slate-500 mb-4">Add a customer or supplier to your digital ledger.</p>
            <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Haji Aslam / Babar Jewellers"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (WhatsApp)</label>
                  <input
                    type="text"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Type</label>
                  <select
                    value={newCustType}
                    onChange={(e) => setNewCustType(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-emerald-600"
                  >
                    <option value="customer">Customer (گاہک)</option>
                    <option value="supplier">Supplier (سپلائر)</option>
                    <option value="dealer">Dealer / Broker</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Opening Receivable (Lene Hain)</label>
                  <input
                    type="number"
                    value={newCustReceivable}
                    onChange={(e) => setNewCustReceivable(e.target.value)}
                    placeholder="0"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Opening Payable (Dene Hain)</label>
                  <input
                    type="number"
                    value={newCustPayable}
                    onChange={(e) => setNewCustPayable(e.target.value)}
                    placeholder="0"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-xs"
                >
                  Save Khata Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Transaction */}
      {isTransactionModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-[#0F172A] text-lg mb-1">
              Record Entry: {selectedCustomer.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Add credit or log payment received.</p>

            <form onSubmit={handleRecordTransaction} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType('payment_received')}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    txType === 'payment_received'
                      ? 'bg-[#10B981] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Wasooli (Payment Received)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('udhaar_given')}
                  className={`py-2 text-xs font-bold rounded-lg transition ${
                    txType === 'udhaar_given'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Udhaar Diya (Credit Given)
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full text-lg font-bold font-mono p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={txPaymentMethod}
                  onChange={(e) => setTxPaymentMethod(e.target.value as any)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-emerald-600"
                >
                  <option value="Cash">Cash (نقد)</option>
                  <option value="Bank Transfer">Bank Transfer (بینک ٹرانسفر)</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description / Bill Notes</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="e.g. Part payment for bridal necklace"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransactionModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: WhatsApp Reminder Preview & Send */}
      {isWhatsAppOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-emerald-800">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-bold text-[#0F172A] text-lg">Send WhatsApp Payment Reminder</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              AI has generated a polite Urdu reminder for <strong>{selectedCustomer.name}</strong>.
            </p>

            <textarea
              rows={6}
              value={whatsAppMsg}
              onChange={(e) => setWhatsAppMsg(e.target.value)}
              className="w-full text-xs font-mono p-3 rounded-2xl border border-slate-300 bg-slate-50/50 mb-4 focus:outline-hidden focus:border-emerald-600"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsWhatsAppOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => sendWhatsAppDirect(selectedCustomer.phone, whatsAppMsg)}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
