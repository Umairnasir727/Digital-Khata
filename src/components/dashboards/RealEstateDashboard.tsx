import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import {
  Home,
  MapPin,
  FileText,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  Users,
  Search,
  Building,
  Key,
} from 'lucide-react';
import { formatPKR, formatMarlaToKanal, marlaToSqFt } from '../../lib/formatters';

export const RealEstateDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { products, customers, sales, addProduct, recordSale, setIsVoiceAssistantOpen } = useKhata();

  const [filterType, setFilterType] = useState<string>('all');
  const [isNewPlotModalOpen, setIsNewPlotModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);

  // New Plot Form
  const [plotName, setPlotName] = useState('');
  const [plotCategory, setPlotCategory] = useState<'Plot' | 'File' | 'Commercial' | 'House'>('Plot');
  const [plotMarla, setPlotMarla] = useState('5');
  const [plotSociety, setPlotSociety] = useState('');
  const [plotNumber, setPlotNumber] = useState('');
  const [plotPrice, setPlotPrice] = useState('');
  const [plotCost, setPlotCost] = useState('');

  // Deal Form
  const [dealPlotId, setDealPlotId] = useState('');
  const [dealBuyerName, setDealBuyerName] = useState('');
  const [dealBuyerPhone, setDealBuyerPhone] = useState('');
  const [dealTotalAmount, setDealTotalAmount] = useState('');
  const [dealTokenAmount, setDealTokenAmount] = useState('');
  const [dealCommission, setDealCommission] = useState('');

  const totalPlots = products.length;
  const availablePlots = products.filter((p) => p.stock > 0).length;
  const totalReceivable = customers.reduce((sum, c) => sum + c.totalReceivable, 0);
  const totalSalesVolume = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  const filteredPlots = products.filter((p) => {
    if (filterType === 'all') return true;
    if (filterType === 'plot') return p.category.toLowerCase().includes('plot');
    if (filterType === 'file') return p.category.toLowerCase().includes('file');
    if (filterType === 'commercial') return p.category.toLowerCase().includes('commercial');
    return true;
  });

  const handleCreatePlot = (e: React.FormEvent) => {
    e.preventDefault();
    const marla = parseFloat(plotMarla) || 5;
    const price = parseFloat(plotPrice) || 5000000;
    const cost = parseFloat(plotCost) || (price * 0.9);

    addProduct({
      name: `${plotMarla} Marla ${plotCategory} #${plotNumber} (${plotSociety || 'Phase 1'})`,
      category: plotCategory,
      sku: `PLT-${Math.floor(1000 + Math.random() * 9000)}`,
      price,
      cost,
      stock: 1,
      unit: 'Marla',
      areaMarla: marla,
      location: `${plotSociety || 'Society'}, Plot #${plotNumber || 'N/A'}`,
      isCommercial: plotCategory === 'Commercial',
    });

    setIsNewPlotModalOpen(false);
    setPlotName('');
    setPlotSociety('');
    setPlotNumber('');
    setPlotPrice('');
    setPlotCost('');
  };

  const handleRecordDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(dealTotalAmount) || 10000000;
    const token = parseFloat(dealTokenAmount) || 1000000;
    const remaining = Math.max(0, total - token);

    recordSale({
      date: new Date().toISOString(),
      customerName: dealBuyerName || 'Property Investor',
      customerPhone: dealBuyerPhone,
      items: [
        {
          productId: dealPlotId || 'prod_plot_deal',
          productName: `Property Deal (${dealPlotId ? 'Selected Plot' : 'Direct Booking'})`,
          quantity: 1,
          unitPrice: total,
          unit: 'Deal',
          total,
        },
      ],
      subtotal: total,
      discount: 0,
      tax: 0,
      totalAmount: total,
      receivedAmount: token,
      udhaarAmount: remaining,
      paymentMethod: 'Bank Transfer',
      notes: `Token/Bayana received: ${formatPKR(token)}. Remaining balance on registry/possession: ${formatPKR(remaining)}. Commission: ${formatPKR(parseFloat(dealCommission) || 0)}`,
      type: 'deal',
    });

    setIsDealModalOpen(false);
    setDealBuyerName('');
    setDealTotalAmount('');
    setDealTokenAmount('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Plots & Files</span>
              <Home className="w-4 h-4 text-[#10B981]" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-1">{totalPlots} Units</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-4/5 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{availablePlots} Available for Sale</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Installments Baqaya</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-1">{formatPKR(totalReceivable, { compact: true })}</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-2/3 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{customers.length} Active Buyers / Investors</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Deals Volume</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#10B981] mt-1">{formatPKR(totalSalesVolume, { compact: true })}</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-full rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{sales.length} Deals Closed</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Conversion Units</span>
              <Building className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-base sm:text-lg font-bold text-[#0F172A] mt-1">1 Kanal = 20 Marla</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-400 w-1/2 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">1 Marla = 225 / 272.25 Sq Ft</p>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions & Deal Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => setIsDealModalOpen(true)}
          className="p-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5" />
            <div className="text-left">
              <span>Book Property Deal / Token</span>
              <p className="text-[11px] font-normal text-emerald-100">Record Bayana, Token & Installment schedule</p>
            </div>
          </div>
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsNewPlotModalOpen(true)}
          className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#0F172A] font-bold text-xs sm:text-sm shadow-xs flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2.5">
            <Home className="w-5 h-5 text-[#10B981]" />
            <div className="text-left">
              <span>List New Plot / File</span>
              <p className="text-[11px] font-normal text-slate-500">Add Marla size, society, and demand price</p>
            </div>
          </div>
          <Plus className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setIsVoiceAssistantOpen(true)}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5" />
            <div className="text-left">
              <span>Voice Deal Assistant</span>
              <p className="text-[11px] font-normal text-emerald-100">“Ali ne 10 marla plot 1.4 crore me khareeda”</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Plots & Property Inventory Catalog */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-bold text-[#0F172A] text-base">Plot & Property Inventory</h3>
            <p className="text-xs text-slate-500">Track demand, cost, size in Marlas/Kanals, and location</p>
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'plot', 'file', 'commercial'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition ${
                  filterType === t
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPlots.map((plot) => (
            <div
              key={plot.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-[#0F172A] text-sm">{plot.name}</h4>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full shrink-0">
                    {plot.category}
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{plot.location || 'Prime Location'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 pt-1">
                    <span>Size: <strong>{plot.areaMarla || 5} Marla ({formatMarlaToKanal(plot.areaMarla || 5)})</strong></span>
                    <span>Sq Ft: <strong>{marlaToSqFt(plot.areaMarla || 5)}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Demand Price</span>
                  <p className="text-base font-extrabold text-[#0F172A]">{formatPKR(plot.price)}</p>
                </div>
                <button
                  onClick={() => {
                    setDealPlotId(plot.id);
                    setDealTotalAmount(plot.price.toString());
                    setIsDealModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-200 transition"
                >
                  Book Deal &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: New Plot */}
      {isNewPlotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-[#0F172A] text-lg mb-1">List New Property / Plot</h3>
            <p className="text-xs text-slate-500 mb-4">Add plot details, marla size, and target selling price.</p>
            <form onSubmit={handleCreatePlot} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Type</label>
                  <select
                    value={plotCategory}
                    onChange={(e) => setPlotCategory(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                  >
                    <option value="Plot">Residential Plot</option>
                    <option value="Commercial">Commercial Plot</option>
                    <option value="File">Installment File</option>
                    <option value="House">Constructed House</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Size (Marla)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={plotMarla}
                    onChange={(e) => setPlotMarla(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Society / Scheme</label>
                  <input
                    type="text"
                    value={plotSociety}
                    onChange={(e) => setPlotSociety(e.target.value)}
                    placeholder="e.g. DHA Phase 6"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Plot / File Number</label>
                  <input
                    type="text"
                    value={plotNumber}
                    onChange={(e) => setPlotNumber(e.target.value)}
                    placeholder="e.g. 412-B"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Demand Selling Price (PKR)</label>
                  <input
                    type="number"
                    value={plotPrice}
                    onChange={(e) => setPlotPrice(e.target.value)}
                    placeholder="e.g. 14500000"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cost / Purchase (PKR)</label>
                  <input
                    type="number"
                    value={plotCost}
                    onChange={(e) => setPlotCost(e.target.value)}
                    placeholder="e.g. 13000000"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPlotModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-xs"
                >
                  Add Property Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Property Deal */}
      {isDealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-[#0F172A] text-lg mb-1">Book Property Deal & Token</h3>
            <p className="text-xs text-slate-500 mb-4">Record buyer bayana, payment installments, and dealer commission.</p>
            <form onSubmit={handleRecordDeal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Buyer / Investor Name</label>
                  <input
                    type="text"
                    value={dealBuyerName}
                    onChange={(e) => setDealBuyerName(e.target.value)}
                    placeholder="e.g. Malik Tariq"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Buyer Phone</label>
                  <input
                    type="text"
                    value={dealBuyerPhone}
                    onChange={(e) => setDealBuyerPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Total Deal Value (PKR)</label>
                  <input
                    type="number"
                    value={dealTotalAmount}
                    onChange={(e) => setDealTotalAmount(e.target.value)}
                    placeholder="e.g. 14500000"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Token / Bayana Received (PKR)</label>
                  <input
                    type="number"
                    value={dealTokenAmount}
                    onChange={(e) => setDealTokenAmount(e.target.value)}
                    placeholder="e.g. 1500000"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dealer / Agent Commission (PKR)</label>
                <input
                  type="number"
                  value={dealCommission}
                  onChange={(e) => setDealCommission(e.target.value)}
                  placeholder="e.g. 145000 (1%)"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDealModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-xs"
                >
                  Save Deal & Update Khata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
