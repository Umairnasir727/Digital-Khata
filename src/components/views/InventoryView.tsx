import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Scale,
  Sparkles,
  ArrowUpDown,
  Filter,
  DollarSign,
  Tag,
  CheckCircle2,
  X,
} from 'lucide-react';
import { formatPKR } from '../../lib/formatters';
import { ProductItem } from '../../types';

export const InventoryView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, activeBusiness, renameCategory } = useKhata();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);

  // Category Rename Modal State
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [categoryToRename, setCategoryToRename] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [renameSuccessMsg, setRenameSuccessMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('10');
  const [unit, setUnit] = useState(activeBusiness.suggestedUnits?.[0] || 'Piece');
  const [sku, setSku] = useState('');

  // Category specific fields
  const [weightTola, setWeightTola] = useState('');
  const [goldPurity, setGoldPurity] = useState<'24K' | '22K' | '21K' | '18K'>('22K');
  const [makingCharges, setMakingCharges] = useState('');
  const [areaMarla, setAreaMarla] = useState('');
  const [location, setLocation] = useState('');

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalValuation = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalCostValuation = products.reduce((sum, p) => sum + (p.cost || p.price * 0.8) * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= (p.minStockAlert || 5)).length;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategory(categories[0] || 'General');
    setPrice('');
    setCost('');
    setStock('10');
    setUnit(activeBusiness.suggestedUnits?.[0] || 'Piece');
    setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
    setWeightTola('');
    setMakingCharges('');
    setAreaMarla('');
    setLocation('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: ProductItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price.toString());
    setCost((item.cost || 0).toString());
    setStock(item.stock.toString());
    setUnit(item.unit);
    setSku(item.sku || '');
    setWeightTola((item.weightTola || '').toString());
    setGoldPurity((item.goldPurity as any) || '22K');
    setMakingCharges((item.makingCharges || '').toString());
    setAreaMarla((item.areaMarla || '').toString());
    setLocation(item.location || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price) || 0;
    const costNum = parseFloat(cost) || priceNum * 0.8;
    const stockNum = parseFloat(stock) || 0;

    const payload: Omit<ProductItem, 'id' | 'businessId'> = {
      name,
      category,
      sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
      price: priceNum,
      cost: costNum,
      stock: stockNum,
      unit,
      weightTola: weightTola ? parseFloat(weightTola) : undefined,
      goldPurity: activeBusiness.category === 'jewellery' ? goldPurity : undefined,
      makingCharges: makingCharges ? parseFloat(makingCharges) : undefined,
      areaMarla: areaMarla ? parseFloat(areaMarla) : undefined,
      location: location || undefined,
    };

    if (editingItem) {
      updateProduct(editingItem.id, payload);
    } else {
      addProduct(payload);
    }

    setIsAddModalOpen(false);
  };

  const handleRenameCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToRename || !newCatName.trim()) return;
    renameCategory(categoryToRename, newCatName.trim());
    setRenameSuccessMsg(`Renamed "${categoryToRename}" to "${newCatName.trim()}"!`);
    if (selectedCategory === categoryToRename) {
      setSelectedCategory(newCatName.trim());
    }
    setCategoryToRename('');
    setNewCatName('');
    setTimeout(() => {
      setRenameSuccessMsg('');
      setIsRenameModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Inventory Valuation Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Retail Inventory Valuation</span>
          <p className="text-2xl font-extrabold text-[#0F172A] mt-1">{formatPKR(totalValuation)}</p>
          <p className="text-xs text-slate-500 mt-0.5">{products.length} Products registered</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Purchase Cost Valuation</span>
          <p className="text-2xl font-extrabold text-[#10B981] mt-1">{formatPKR(totalCostValuation)}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Est. Unrealized Profit: {formatPKR(totalValuation - totalCostValuation)}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Low Stock Attention</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{lowStockCount} Items</p>
          <p className="text-xs text-slate-500 mt-0.5">Stock &le; 5 units remaining</p>
        </div>
      </div>

      {/* 2. Controls & Product Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search item or SKU..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold p-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {categories.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCategoryToRename(categories[0] || '');
                  setNewCatName(categories[0] || '');
                  setIsRenameModalOpen(true);
                }}
                className="px-2.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
                title="Change or rename category names"
              >
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Rename Category</span>
              </button>
            )}
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Item / Stock</span>
          </button>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Item Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Selling Price</th>
                <th className="py-3 px-3">Cost Price</th>
                <th className="py-3 px-3">Stock Level</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#0F172A]">{p.name}</div>
                    <div className="text-[11px] text-slate-500">
                      SKU: {p.sku || 'N/A'}
                      {p.weightTola ? ` • ${p.weightTola} Tola (${p.goldPurity || '22K'})` : ''}
                      {p.areaMarla ? ` • ${p.areaMarla} Marla` : ''}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-[#0F172A]">{formatPKR(p.price)}</td>
                  <td className="py-3 px-3 text-slate-500">{formatPKR(p.cost || p.price * 0.8)}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.stock <= (p.minStockAlert || 5)
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {p.stock <= (p.minStockAlert || 5) && <AlertTriangle className="w-3 h-3" />}
                      {p.stock} {p.unit}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Edit Product */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-[#0F172A] text-lg mb-1">
              {editingItem ? 'Edit Product Item' : 'Add New Inventory Item'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configured for {activeBusiness.name} ({activeBusiness.category.replace('_', ' ')})
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Name / Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 22K Gold Bangles / Lawn Suit / 5 Marla Plot"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Bridal / Pret / Residential"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unit of Measurement</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {(activeBusiness.suggestedUnits || ['Piece', 'Pack', 'Tola', 'Marla', 'Litre', 'Suit']).map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Selling Price (PKR)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cost Price (PKR)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0"
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              {/* Specialized fields for Jewellery */}
              {activeBusiness.category === 'jewellery' && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Purity</label>
                    <select
                      value={goldPurity}
                      onChange={(e) => setGoldPurity(e.target.value as any)}
                      className="w-full text-xs font-semibold p-2 rounded-xl border border-amber-300 bg-white"
                    >
                      <option value="24K">24K Pure</option>
                      <option value="22K">22K Standard</option>
                      <option value="21K">21K Traditional</option>
                      <option value="18K">18K Modern</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Weight (Tola)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={weightTola}
                      onChange={(e) => setWeightTola(e.target.value)}
                      placeholder="e.g. 1.25"
                      className="w-full text-xs font-semibold p-2 rounded-xl border border-amber-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">Making (PKR)</label>
                    <input
                      type="number"
                      value={makingCharges}
                      onChange={(e) => setMakingCharges(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full text-xs font-semibold p-2 rounded-xl border border-amber-300 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Specialized fields for Real Estate */}
              {activeBusiness.category === 'real_estate' && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-emerald-900 block mb-1">Size in Marlas</label>
                    <input
                      type="number"
                      step="0.5"
                      value={areaMarla}
                      onChange={(e) => setAreaMarla(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full text-xs font-semibold p-2 rounded-xl border border-emerald-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-emerald-900 block mb-1">Location / Society</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Phase 6, Sector C"
                      className="w-full text-xs font-semibold p-2 rounded-xl border border-emerald-300 bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-xs"
                >
                  {editingItem ? 'Update Item' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Rename Category Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                  <Tag className="w-4 h-4 text-[#10B981]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0F172A] text-sm sm:text-base">Rename Category</h3>
                  <p className="text-[11px] text-slate-500">Update category across all inventory products</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRenameModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renameSuccessMsg && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>{renameSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleRenameCategorySubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Category to Rename
                </label>
                <select
                  value={categoryToRename}
                  onChange={(e) => {
                    setCategoryToRename(e.target.value);
                    if (!newCatName) setNewCatName(e.target.value);
                  }}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  New Category Name
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Bridal Jewellery / 22K Rings / Cotton Pret"
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!categoryToRename || !newCatName.trim()}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 rounded-xl shadow-xs transition"
                >
                  Save & Update All Items
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
