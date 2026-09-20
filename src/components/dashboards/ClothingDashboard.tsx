import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import {
  Shirt,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Sparkles,
  Scissors,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { formatPKR } from '../../lib/formatters';

export const ClothingDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { products, customers, sales, recordSale, setIsVoiceAssistantOpen } = useKhata();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isQuickCheckoutOpen, setIsQuickCheckoutOpen] = useState(false);

  // Quick Clothing Sale
  const [cartItem, setCartItem] = useState(products[0] || null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [saleQty, setSaleQty] = useState('1');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Easypaisa' | 'JazzCash' | 'Card' | 'Udhaar'>('Cash');
  const [discountVal, setDiscountVal] = useState('0');

  const totalSuitsInStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const todaySales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalReceivable = customers.reduce((sum, c) => sum + c.totalReceivable, 0);

  const lowStockItems = products.filter((p) => p.stock <= 5);

  const filteredItems = products.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const handleClothingSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartItem) return;

    const qty = parseInt(saleQty) || 1;
    const itemTotal = cartItem.price * qty;
    const disc = parseFloat(discountVal) || 0;
    const finalAmount = Math.max(0, itemTotal - disc);
    const isUdhaar = paymentMode === 'Udhaar';

    recordSale({
      date: new Date().toISOString(),
      customerName: custName || 'Boutique Walk-in Customer',
      customerPhone: custPhone,
      items: [
        {
          productId: cartItem.id,
          productName: `${cartItem.name} [Size: ${selectedSize}]`,
          quantity: qty,
          unitPrice: cartItem.price,
          unit: 'Suit',
          total: itemTotal,
          meta: { size: selectedSize },
        },
      ],
      subtotal: itemTotal,
      discount: disc,
      tax: 0,
      totalAmount: finalAmount,
      receivedAmount: isUdhaar ? 0 : finalAmount,
      udhaarAmount: isUdhaar ? finalAmount : 0,
      paymentMethod: paymentMode as any,
      notes: `Sold ${qty}x ${cartItem.name} (${selectedSize})`,
      type: 'sale',
    });

    setIsQuickCheckoutOpen(false);
    setCustName('');
    setDiscountVal('0');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Boutique Inventory</span>
              <Shirt className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-1">{totalSuitsInStock} Suits</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 w-3/4 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{products.length} Designs / SKUs</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Stock Value</span>
              <ShoppingBag className="w-4 h-4 text-[#10B981]" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-1">{formatPKR(totalStockValue, { compact: true })}</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-4/5 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Average Margin: 38%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Client Udhaar</span>
              <Package className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-1">{formatPKR(totalReceivable)}</p>
          </div>
          <div>
            <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-1/2 rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{customers.length} Accounts Active</p>
          </div>
        </div>

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
              <div className="h-full bg-emerald-500 w-full rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{sales.length} Bills Generated</p>
          </div>
        </div>
      </div>

      {/* 2. Low Stock Alerts & Quick Counter POS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Counter POS Fast Action */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-[#0F172A] text-base">Fashion Catalog & Size Inventory</h3>
              <p className="text-xs text-slate-500">Pick any design to launch instant Counter POS billing</p>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'pret', 'unstitched', 'formal'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl capitalize transition ${
                    selectedCategory === c
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-[#0F172A] text-sm">{item.name}</h4>
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Fabric: {item.fabric || 'Pure Lawn'}</p>

                  {/* Size Matrix Badges */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {item.variants && item.variants.length > 0 ? (
                      item.variants.map((v) => (
                        <span
                          key={v.size}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700"
                        >
                          {v.size}: <strong>{v.stock}</strong>
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                        Stock: {item.stock}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200">
                  <span className="text-sm font-extrabold text-[#0F172A]">{formatPKR(item.price)}</span>
                  <button
                    onClick={() => {
                      setCartItem(item);
                      setIsQuickCheckoutOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center gap-1 transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Sell Suit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Rail: Size Alerts & Voice Assistant */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-[#0F172A] text-sm mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Stock Alerts</span>
            </h3>
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-slate-400">All sizes adequately stocked.</p>
            ) : (
              <div className="space-y-2">
                {lowStockItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                    <span className="font-bold text-[#0F172A] block">{item.name}</span>
                    <span className="text-amber-800 font-semibold">Only {item.stock} left in stock</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-[#10B981] to-[#059669] text-white rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-100" />
              <h4 className="font-bold text-sm">Boutique Voice Assistant</h4>
            </div>
            <p className="text-xs text-emerald-50">
              Speak naturally: &ldquo;Sold 2 medium luxury lawn suits to Mrs. Babar&rdquo;.
            </p>
            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-white text-[#0F172A] font-bold text-xs shadow-md hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              <span>Speak to Voice Agent</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Quick Clothing POS Checkout */}
      {isQuickCheckoutOpen && cartItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-[#0F172A] text-lg mb-1">Counter Sale: {cartItem.name}</h3>
            <p className="text-xs text-slate-500 mb-4">Price: {formatPKR(cartItem.price)} per suit</p>

            <form onSubmit={handleClothingSale} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                  >
                    <option value="XS">XS (Extra Small)</option>
                    <option value="S">S (Small)</option>
                    <option value="M">M (Medium)</option>
                    <option value="L">L (Large)</option>
                    <option value="XL">XL (Extra Large)</option>
                    <option value="Unstitched">Unstitched 3-Piece</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={saleQty}
                    onChange={(e) => setSaleQty(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Mrs. Babar"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Udhaar">Udhaar (Khata Credit)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs font-bold">
                <span>Total Bill:</span>
                <span className="text-base text-[#10B981]">
                  {formatPKR(cartItem.price * (parseInt(saleQty) || 1))}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCheckoutOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-xs"
                >
                  Confirm Sale & Print
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
