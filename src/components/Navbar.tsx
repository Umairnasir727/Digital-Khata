import React, { useState } from 'react';
import { useKhata } from '../context/KhataContext';
import {
  Sparkles,
  Mic,
  ChevronDown,
  Building2,
  Gem,
  Home,
  Shirt,
  Fuel,
  Store,
  ShieldCheck,
  UserCheck,
  Plus,
  Bell,
  Settings,
  X,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { formatPKR } from '../lib/formatters';

interface NavbarProps {
  onOpenSettings: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, activeTab, setActiveTab }) => {
  const {
    businesses,
    activeBusiness,
    switchBusiness,
    setIsOnboardingOpen,
    setIsVoiceAssistantOpen,
    userRole,
    setUserRole,
    insights,
    customers,
  } = useKhata();

  const [isBizMenuOpen, setIsBizMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const getBizIcon = (category: string) => {
    switch (category) {
      case 'jewellery':
        return <Gem className="w-4 h-4 text-amber-500" />;
      case 'real_estate':
        return <Home className="w-4 h-4 text-emerald-600" />;
      case 'clothing':
        return <Shirt className="w-4 h-4 text-rose-500" />;
      case 'petrol_pump':
        return <Fuel className="w-4 h-4 text-blue-500" />;
      default:
        return <Store className="w-4 h-4 text-emerald-500" />;
    }
  };

  const overdueCount = customers.filter((c) => c.totalReceivable > 0).length;
  const totalReceivables = customers.reduce((sum, c) => sum + c.totalReceivable, 0);

  const handleRoleToggle = (targetRole: 'owner' | 'employee') => {
    if (targetRole === 'owner' && userRole === 'employee') {
      setIsRoleModalOpen(true);
    } else {
      setUserRole(targetRole);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === activeBusiness.pinCode || pinInput === '1234') {
      setUserRole('owner');
      setIsRoleModalOpen(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Multi-Business Switcher */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center text-white font-bold text-xl shadow-xs">
                  K
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[#0F172A] tracking-tight text-lg">AI KHATA</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Pakistan
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block">Intelligent Business Platform</p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block" />

              {/* Active Business Dropdown */}
              <div className="relative">
                <button
                  id="business-switcher-btn"
                  onClick={() => setIsBizMenuOpen(!isBizMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 transition text-left"
                >
                  <div className="p-1 rounded-lg bg-white shadow-xs border border-slate-200">
                    {getBizIcon(activeBusiness.category)}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span className="truncate max-w-[150px]">{activeBusiness.name}</span>
                      <span className="text-[10px] text-slate-600 uppercase font-medium bg-slate-200/80 px-1 py-0.2 rounded">
                        {activeBusiness.customCategoryName || activeBusiness.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {isBizMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsBizMenuOpen(false)} />
                    <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        My Businesses ({businesses.length})
                      </div>
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                        {businesses.map((biz) => (
                          <button
                            key={biz.id}
                            onClick={() => {
                              switchBusiness(biz.id);
                              setIsBizMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-slate-50 transition ${
                              biz.id === activeBusiness.id ? 'bg-emerald-50/70 font-semibold text-emerald-900' : 'text-slate-700'
                            }`}
                          >
                            <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                              {getBizIcon(biz.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-semibold">{biz.name}</p>
                              <p className="text-[10px] text-slate-500 capitalize">{biz.customCategoryName || biz.category.replace('_', ' ')}</p>
                            </div>
                            {biz.id === activeBusiness.id && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="pt-2 mt-1 border-t border-slate-100 px-2">
                        <button
                          onClick={() => {
                            setIsBizMenuOpen(false);
                            setIsOnboardingOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Business (AI Setup)</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Role Switcher, Voice Action Trigger, Alerts & Settings */}
            <div className="flex items-center gap-2.5">
              {/* Role Toggle Pill (Owner / Staff) */}
              <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => handleRoleToggle('owner')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                    userRole === 'owner'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Owner mode: Full access to profit, bank records, and settings"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Owner</span>
                </button>
                <button
                  onClick={() => handleRoleToggle('employee')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                    userRole === 'employee'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Munshi / Cashier mode: Restricted view"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Staff / Munshi</span>
                </button>
              </div>

              {/* Big "Talk to your Khata" Voice Agent Trigger */}
              <button
                id="voice-assistant-main-btn"
                onClick={() => setIsVoiceAssistantOpen(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-98 transition group"
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute animate-ping inline-flex h-3 w-3 rounded-full bg-emerald-300 opacity-75"></span>
                  <Mic className="w-4 h-4 relative z-10 group-hover:scale-110 transition" />
                </div>
                <span className="hidden md:inline">Talk to your Khata</span>
                <span className="md:hidden">Voice</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full uppercase font-mono font-normal tracking-wide hidden lg:inline">
                  Ayesha AI
                </span>
              </button>

              {/* Notifications / Alerts Drawer Trigger */}
              <div className="relative">
                <button
                  id="notifications-drawer-btn"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition relative"
                  aria-label="Smart Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {insights.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {insights.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                          <Bell className="w-4 h-4 text-emerald-600" />
                          <span>Smart Business Alerts</span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{insights.length} active</span>
                      </div>

                      <div className="mt-2.5 max-h-72 overflow-y-auto space-y-2">
                        {insights.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            No urgent alerts. Khata is running smoothly!
                          </div>
                        ) : (
                          insights.map((ins) => (
                            <div
                              key={ins.id}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                  {ins.type === 'alert' ? (
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                  ) : (
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                  )}
                                  {ins.title}
                                </span>
                                <span className="text-[10px] text-slate-500">{ins.timestamp}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">{ins.description}</p>
                              {ins.actionPrompt && (
                                <button
                                  onClick={() => {
                                    setIsNotifOpen(false);
                                    setActiveTab('khata');
                                  }}
                                  className="mt-2 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                                >
                                  {ins.actionPrompt} &rarr;
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {overdueCount > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500">{overdueCount} customers with overdue udhaar</span>
                          <span className="font-bold text-slate-900">{formatPKR(totalReceivables)}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Settings / Multi-Business Button */}
              <button
                id="settings-modal-btn"
                onClick={onOpenSettings}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Staff to Owner PIN Prompt Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Owner Verification</h3>
              </div>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Enter the 4-digit security PIN for <strong>{activeBusiness.name}</strong> to switch into Owner Mode. (Default: <code>1234</code>)
            </p>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter 4-digit PIN"
                className="w-full text-center text-xl font-mono tracking-widest px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                autoFocus
              />
              {pinError && <p className="text-xs text-rose-600 text-center font-medium">Incorrect PIN. Try default: 1234</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Unlock Owner Mode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
