import React, { useState } from 'react';
import { useKhata } from '../context/KhataContext';
import {
  Sparkles,
  Mic,
  MicOff,
  Gem,
  Home,
  Shirt,
  Fuel,
  Store,
  Pill,
  UtensilsCrossed,
  Car,
  Tv,
  Boxes,
  ShoppingBag,
  Briefcase,
  Layers,
  ArrowRight,
  CheckCircle2,
  X,
  Loader2,
  Edit3,
  Plus,
} from 'lucide-react';
import { BusinessCategory } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { addNewBusiness, addProduct } = useKhata();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [customBusinessName, setCustomBusinessName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | 'custom'>('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Review step edit state
  const [newUnitInput, setNewUnitInput] = useState('');

  if (!isOpen) return null;

  const categories: Array<{ id: BusinessCategory; label: string; icon: any; desc: string }> = [
    { id: 'jewellery', label: 'Jewellery & Gold', icon: Gem, desc: 'Tola, Masha, Ratti, 21K/22K, Making charges, Bullion' },
    { id: 'real_estate', label: 'Real Estate & Plots', icon: Home, desc: 'Marla, Kanal, Residential & Commercial Plots, Files' },
    { id: 'clothing', label: 'Clothing & Fashion', icon: Shirt, desc: 'Size Variants (S/M/L/XL), Fabrics, Unstitched Lawn' },
    { id: 'petrol_pump', label: 'Petrol Pump', icon: Fuel, desc: 'Litres sold, Tank Dips, Nozzles, Fleet credit khata' },
    { id: 'grocery', label: 'Grocery & General Store', icon: Store, desc: 'Kg, Pack, Fast POS counter checkout, daily cash' },
    { id: 'pharmacy', label: 'Pharmacy & Medical', icon: Pill, desc: 'Batch numbers, Expiry dates, Formula & Strips' },
    { id: 'restaurant', label: 'Restaurant / Food', icon: UtensilsCrossed, desc: 'Dine-in, Takeaway, Recipes, Daily food cost' },
    { id: 'automobile', label: 'Automobile & Workshop', icon: Car, desc: 'Vehicle registration, Spare parts, Mechanic labour' },
    { id: 'electronics', label: 'Electronics & Mobile', icon: Tv, desc: 'IMEI, Serial numbers, Warranty, Device models' },
    { id: 'wholesale', label: 'Wholesale & Distribution', icon: Boxes, desc: 'Cartons, Bulk sacks, Supplier credit terms' },
    { id: 'retail', label: 'Retail & Supermarket', icon: ShoppingBag, desc: 'Barcodes, Customer loyalty, Fast register' },
    { id: 'services', label: 'Services & Consulting', icon: Briefcase, desc: 'Job billing, Advance tokens, Retainers' },
    { id: 'general', label: 'Other / Custom Business', icon: Layers, desc: 'Type your own category name and custom units' },
  ];

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setBusinessDescription('I sell gold jewellery and also buy old gold from customers.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ur-PK';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setBusinessDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = () => {
        setIsListening(false);
        setBusinessDescription('I sell gold jewellery and also buy old gold from customers.');
      };
      recognition.start();
    } catch {
      setIsListening(false);
      setBusinessDescription('I sell gold jewellery and also buy old gold from customers.');
    }
  };

  const handleAnalyzeAndProceed = async () => {
    setIsAnalyzing(true);
    const categoryToSend = selectedCategory === 'custom' ? 'general' : (selectedCategory || 'general');
    const customCat = customCategoryName.trim() || (selectedCategory ? categories.find(c => c.id === selectedCategory)?.label : '');
    
    try {
      const res = await fetch('/api/ai/setup-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: customBusinessName.trim(),
          category: categoryToSend,
          customCategory: customCat,
          description: businessDescription,
        }),
      });
      const json = await res.json();
      const resultData = json.data || {};
      if (customBusinessName.trim()) {
        resultData.businessName = customBusinessName.trim();
      }
      if (customCat) {
        resultData.customCategoryName = customCat;
      }
      setAnalysisResult(resultData);
      setStep(3);
    } catch (err) {
      console.warn('Setup analyze notice:', err);
      // Fallback
      setAnalysisResult({
        businessName: customBusinessName.trim() || 'My Business Khata',
        businessCategory: categoryToSend,
        customCategoryName: customCat,
        tagline: `Reliable ${customCat || 'Business'} in Pakistan`,
        suggestedUnits: ['Piece', 'Pack', 'Kg'],
        primaryModules: ['Inventory Stock', 'Customer Udhaar', 'Sales Analytics', 'AI Voice Assistant'],
        summary: `Customized Khata configured for ${customBusinessName || customCat || 'your business'}.`,
        sampleProducts: [
          { name: `${customCat || 'Item'} 01`, category: customCat || 'General', price: 1500, cost: 1200, stock: 20, unit: 'Piece' },
          { name: `${customCat || 'Item'} Premium`, category: customCat || 'General', price: 3500, cost: 2800, stock: 10, unit: 'Piece' },
        ],
      });
      setStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateKhata = () => {
    if (!analysisResult) return;

    const chosenCategory = (analysisResult.businessCategory === 'custom' ? 'general' : analysisResult.businessCategory) || (selectedCategory === 'custom' ? 'general' : selectedCategory) || 'general';
    const chosenName = analysisResult.businessName?.trim() || customBusinessName.trim() || 'My Business Khata';

    addNewBusiness({
      name: chosenName,
      category: chosenCategory as BusinessCategory,
      customCategoryName: analysisResult.customCategoryName || customCategoryName || undefined,
      tagline: analysisResult.tagline || 'Intelligent AI Powered Business Khata',
      suggestedUnits: analysisResult.suggestedUnits || ['Piece', 'Pack'],
      featuresEnabled: analysisResult.featuresEnabled,
    });

    if (analysisResult.sampleProducts && Array.isArray(analysisResult.sampleProducts)) {
      analysisResult.sampleProducts.forEach((p: any) => {
        addProduct({
          name: p.name,
          category: p.category || analysisResult.customCategoryName || 'General',
          sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
          price: p.price || 1000,
          cost: p.cost || 800,
          stock: p.stock || 10,
          unit: p.unit || 'Piece',
          ...p.extraMeta,
        });
      });
    }

    onClose();
    setStep(1);
    setSelectedCategory('');
    setCustomCategoryName('');
    setCustomBusinessName('');
    setBusinessDescription('');
    setAnalysisResult(null);
  };

  const handleAddCustomUnit = () => {
    if (!newUnitInput.trim() || !analysisResult) return;
    const unitToAdd = newUnitInput.trim();
    if (!analysisResult.suggestedUnits.includes(unitToAdd)) {
      setAnalysisResult({
        ...analysisResult,
        suggestedUnits: [...(analysisResult.suggestedUnits || []), unitToAdd],
      });
    }
    setNewUnitInput('');
  };

  const handleRemoveUnit = (unitToRemove: string) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      suggestedUnits: (analysisResult.suggestedUnits || []).filter((u: string) => u !== unitToRemove),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SCREEN 1: Welcome */}
        {step === 1 && (
          <div className="p-6 sm:p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-[#10B981] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-3">
              AI Intelligent Onboarding
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Setup Your Business Khata
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-md mx-auto">
              Write your own business name, select or customize categories, and get a tailored Pakistani digital khata.
            </p>

            <div className="mt-8 bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Write Your Own Business & Category Name</h4>
                  <p className="text-xs text-slate-600">
                    Full flexibility to type any custom business title, shop name, and industry categories.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Pakistani Specialized Units & Workflows</h4>
                  <p className="text-xs text-slate-600">
                    Tola/Masha/Ratti for jewellery, Marla/Kanal for real estate, Litres for pumps, and Suit/Meters for apparel.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Urdu & Roman Urdu Voice Agent</h4>
                  <p className="text-xs text-slate-600">
                    Record sales, udhaar, and receipts naturally with voice commands.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition active:scale-98"
              >
                <span>Get Started & Configure Khata</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: Business Name, Category Selector or Custom Category */}
        {step === 2 && (
          <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
            <div className="text-left mb-5">
              <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">Step 2 of 3</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">Business & Category Details</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Write your own business name and choose or write a custom category.
              </p>
            </div>

            {/* 1. Write Your Own Business Name */}
            <div className="mb-5 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Your Business / Shop Name (Apna Business Name Likhein):</span>
              </label>
              <input
                type="text"
                value={customBusinessName}
                onChange={(e) => setCustomBusinessName(e.target.value)}
                placeholder="e.g. Royal Gold Jewellers, Khan Fabrics, Prime Autos, Al-Madina Store"
                className="w-full text-xs sm:text-sm font-semibold p-3 rounded-xl border border-emerald-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                You can write your exact shop or enterprise name here.
              </p>
            </div>

            {/* 2. Category Cards Grid */}
            <div className="mb-2">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Select Business Category or Choose Custom:
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      if (cat.id !== 'general') {
                        setCustomCategoryName(cat.label);
                      }
                    }}
                    className={`p-3 rounded-2xl text-left border transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#10B981] text-white' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A] leading-tight">{cat.label}</h4>
                      <p className="text-[10px] text-slate-600 line-clamp-2 mt-1">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 3. Custom Category Name Input (if user wants to write custom category or rename) */}
            <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Customize / Change Category Name:</span>
              </label>
              <input
                type="text"
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                placeholder="e.g. Bridal Jewellery / Lawn Boutique / Mobile Accessories / Bakery"
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                You can change the name of the category or type your own custom industry title.
              </p>
            </div>

            {/* 4. "Describe your business" Text + Mic */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Optional Details / Audio Description:</span>
                </label>
                <span className="text-[11px] text-slate-500">Urdu / Roman Urdu / English</span>
              </div>
              <div className="relative">
                <textarea
                  rows={2}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="e.g. 'We sell 22K gold bangles and bridal sets in Lahore' or 'We deal in 5 Marla plots in Bahria'."
                  className="w-full text-xs sm:text-sm p-3 pr-12 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`absolute bottom-3 right-3 p-2 rounded-lg transition ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                  title="Speak to describe business"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Back
              </button>
              <button
                type="button"
                disabled={(!selectedCategory && !customBusinessName.trim() && !customCategoryName.trim()) || isAnalyzing}
                onClick={handleAnalyzeAndProceed}
                className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Configuring Your Khata...</span>
                  </>
                ) : (
                  <>
                    <span>Next: Review & Confirm</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3: "Review, Edit and Create Khata" */}
        {step === 3 && analysisResult && (
          <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider">AI Configured Khata</span>
                <h3 className="text-xl font-extrabold text-[#0F172A]">Review & Customize Your Khata</h3>
              </div>
            </div>

            {/* Editable Business Name & Category Card */}
            <div className="p-4 rounded-2xl bg-[#0F172A] text-white mb-5 shadow-sm border border-slate-800 space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Business Name (You can edit directly):
                </label>
                <input
                  type="text"
                  value={analysisResult.businessName || ''}
                  onChange={(e) => setAnalysisResult({ ...analysisResult, businessName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white font-bold text-base sm:text-lg px-3 py-1.5 rounded-xl outline-none focus:border-emerald-400"
                  placeholder="Enter business name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Category Name:
                  </label>
                  <input
                    type="text"
                    value={analysisResult.customCategoryName || analysisResult.businessCategory || ''}
                    onChange={(e) => setAnalysisResult({ ...analysisResult, customCategoryName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-emerald-300 font-semibold text-xs px-3 py-1.5 rounded-xl outline-none focus:border-emerald-400"
                    placeholder="e.g. Jewellery, Fashion, Grocery"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Business Tagline:
                  </label>
                  <input
                    type="text"
                    value={analysisResult.tagline || ''}
                    onChange={(e) => setAnalysisResult({ ...analysisResult, tagline: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl outline-none focus:border-emerald-400"
                    placeholder="Tagline / description"
                  />
                </div>
              </div>

              {analysisResult.summary && (
                <p className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                  {analysisResult.summary}
                </p>
              )}
            </div>

            {/* Configured Units of Measurement */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Units of Measurement (Add / Remove Units):</span>
                </h5>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {(analysisResult.suggestedUnits || ['Piece']).map((u: string) => (
                  <span
                    key={u}
                    className="inline-flex items-center gap-1 text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-semibold text-slate-700 shadow-2xs"
                  >
                    <span>{u}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUnit(u)}
                      className="text-slate-400 hover:text-rose-600 ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newUnitInput}
                  onChange={(e) => setNewUnitInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomUnit())}
                  placeholder="Add custom unit (e.g. Gram, Carton, Pair)"
                  className="flex-1 text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomUnit}
                  className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Unit</span>
                </button>
              </div>
            </div>

            {/* Sample Starter Products */}
            {analysisResult.sampleProducts && analysisResult.sampleProducts.length > 0 && (
              <div className="mb-5">
                <h5 className="text-xs font-bold text-[#0F172A] mb-2">Initial Sample Stock for Your Khata:</h5>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                  {analysisResult.sampleProducts.map((p: any, idx: number) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <span className="font-semibold text-[#0F172A]">{p.name}</span>
                        <span className="text-slate-500 text-[11px] ml-2">({p.category})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#10B981]">Rs. {(p.price || 0).toLocaleString()}</span>
                        <span className="text-slate-500 text-[10px] ml-1">/ {p.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final CTA */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Change Details
              </button>
              <button
                type="button"
                onClick={handleCreateKhata}
                className="px-8 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-sm shadow-sm flex items-center gap-2 transition active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create & Launch Khata</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

