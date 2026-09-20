import React, { useState } from 'react';
import { useKhata } from '../context/KhataContext';
import {
  Settings,
  Building2,
  Lock,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Plus,
  CheckCircle2,
  X,
  Shield,
  FileCode,
  Tag,
  Edit3,
} from 'lucide-react';
import { BusinessCategory } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    businesses,
    activeBusiness,
    updateBusiness,
    deleteBusiness,
    products,
    renameCategory,
    exportDataJson,
    importDataJson,
    resetToDefaults,
    setIsOnboardingOpen,
  } = useKhata();

  const [bizName, setBizName] = useState(activeBusiness.name);
  const [bizCategory, setBizCategory] = useState<BusinessCategory>(activeBusiness.category);
  const [bizCustomCategoryName, setBizCustomCategoryName] = useState(activeBusiness.customCategoryName || '');
  const [bizTagline, setBizTagline] = useState(activeBusiness.tagline || '');
  const [bizPhone, setBizPhone] = useState(activeBusiness.phone || '');
  const [bizAddress, setBizAddress] = useState(activeBusiness.address || '');
  const [pinCode, setPinCode] = useState(activeBusiness.pinCode || '1234');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Category renaming state
  const [categoryToRename, setCategoryToRename] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [renameSuccessMsg, setRenameSuccessMsg] = useState('');

  if (!isOpen) return null;

  const existingProductCategories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness({
      name: bizName.trim() || 'My Khata Business',
      category: bizCategory,
      customCategoryName: bizCustomCategoryName.trim() || undefined,
      tagline: bizTagline,
      phone: bizPhone,
      address: bizAddress,
      pinCode,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRenameCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToRename || !newCategoryName.trim()) return;
    renameCategory(categoryToRename, newCategoryName.trim());
    setRenameSuccessMsg(`Renamed category "${categoryToRename}" to "${newCategoryName.trim()}" successfully!`);
    setCategoryToRename('');
    setNewCategoryName('');
    setTimeout(() => setRenameSuccessMsg(''), 4000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataJson(content);
        if (ok) {
          alert('Backup restored successfully!');
          onClose();
        } else {
          alert('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all Khata data back to initial seed data?')) {
      resetToDefaults();
      onClose();
    }
  };

  const categoryPresets: Array<{ id: BusinessCategory; label: string }> = [
    { id: 'jewellery', label: 'Jewellery & Gold' },
    { id: 'real_estate', label: 'Real Estate & Plots' },
    { id: 'clothing', label: 'Clothing & Fashion' },
    { id: 'petrol_pump', label: 'Petrol Pump' },
    { id: 'grocery', label: 'Grocery & General Store' },
    { id: 'pharmacy', label: 'Pharmacy & Medical' },
    { id: 'restaurant', label: 'Restaurant / Food' },
    { id: 'automobile', label: 'Automobile & Workshop' },
    { id: 'electronics', label: 'Electronics & Mobile' },
    { id: 'wholesale', label: 'Wholesale & Distribution' },
    { id: 'retail', label: 'Retail & Supermarket' },
    { id: 'services', label: 'Services & Consulting' },
    { id: 'general', label: 'Custom / Other Business' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-[#0F172A]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0F172A] text-lg">Khata & Business Settings</h3>
              <p className="text-xs text-slate-500">Edit business name, category, modules & data backups</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>Business name and category updated successfully!</span>
          </div>
        )}

        {/* 1. Core Business Profile Form */}
        <form onSubmit={handleSaveSettings} className="space-y-4 mt-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
              <Building2 className="w-4 h-4 text-[#10B981]" />
              <span>Business Identity & Category Customization</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="e.g. Al-Madina Jewellers, Khan Fabrics..."
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Primary Category Type
                </label>
                <select
                  value={bizCategory}
                  onChange={(e) => setBizCategory(e.target.value as BusinessCategory)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {categoryPresets.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Custom Category / Trade Name (Optional)
              </label>
              <input
                type="text"
                value={bizCustomCategoryName}
                onChange={(e) => setBizCustomCategoryName(e.target.value)}
                placeholder="e.g. Bridal Jewellery & Bullion, Dairy & Milk Store, Footwear Mart..."
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                This custom name will appear on receipts, reports, invoices, and navbar badges.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Tagline / Business Header</label>
              <input
                type="text"
                value={bizTagline}
                onChange={(e) => setBizTagline(e.target.value)}
                placeholder="e.g. Fine 22K/24K Gold Jewellery Specialists"
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone / WhatsApp</label>
              <input
                type="text"
                value={bizPhone}
                onChange={(e) => setBizPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Shop Address / City</label>
              <input
                type="text"
                value={bizAddress}
                onChange={(e) => setBizAddress(e.target.value)}
                placeholder="e.g. Sarafa Bazar, Lahore"
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Owner Security PIN</label>
            <input
              type="password"
              maxLength={6}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full sm:w-1/2 text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-300 outline-none"
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-[0.99]"
            >
              Save Business Details & Category Name
            </button>
          </div>
        </form>

        {/* 2. Inventory Product Categories Renaming Tool */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-[#10B981]" />
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Rename Product & Stock Categories
            </h4>
          </div>

          {renameSuccessMsg && (
            <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{renameSuccessMsg}</span>
            </div>
          )}

          <p className="text-xs text-slate-500 mb-3">
            Select any existing category used by products in your inventory and rename it across all items:
          </p>

          {existingProductCategories.length > 0 ? (
            <form onSubmit={handleRenameCategorySubmit} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Select Current Category
                  </label>
                  <select
                    value={categoryToRename}
                    onChange={(e) => {
                      setCategoryToRename(e.target.value);
                      if (!newCategoryName) setNewCategoryName(e.target.value);
                    }}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                    required
                  >
                    <option value="">-- Choose Category ({existingProductCategories.length} available) --</option>
                    {existingProductCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    New Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Gold Bangles, Summer Pret..."
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!categoryToRename || !newCategoryName.trim()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Rename Category Across All Items</span>
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-400 italic">No products added yet. Add items in inventory to manage categories.</p>
          )}
        </div>

        {/* 3. Data Backup & Multi-Business Section */}
        <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Data Safety & Backup
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={exportDataJson}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup (.json)</span>
            </button>

            <label className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore Backup File</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsOnboardingOpen(true);
              }}
              className="text-xs font-bold text-[#10B981] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Configure Another Business with AI</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
