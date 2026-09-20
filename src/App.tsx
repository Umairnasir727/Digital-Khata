import React, { useState } from 'react';
import { KhataProvider, useKhata } from './context/KhataContext';
import { Navbar } from './components/Navbar';
import { OnboardingModal } from './components/OnboardingModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { SettingsModal } from './components/SettingsModal';

// Dashboards
import { JewelleryDashboard } from './components/dashboards/JewelleryDashboard';
import { RealEstateDashboard } from './components/dashboards/RealEstateDashboard';
import { ClothingDashboard } from './components/dashboards/ClothingDashboard';
import { PetrolPumpDashboard } from './components/dashboards/PetrolPumpDashboard';
import { GenericRetailDashboard } from './components/dashboards/GenericRetailDashboard';

// Views
import { KhataUdhaarView } from './components/views/KhataUdhaarView';
import { InventoryView } from './components/views/InventoryView';
import { SalesAnalyticsView } from './components/views/SalesAnalyticsView';
import { AICopilotView } from './components/views/AICopilotView';
import { AIInsightsView } from './components/views/AIInsightsView';
import { ReportsView } from './components/views/ReportsView';

import {
  LayoutDashboard,
  Users,
  Package,
  TrendingUp,
  Sparkles,
  Lightbulb,
  FileText,
  Mic,
} from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    activeBusiness,
    isOnboardingOpen,
    setIsOnboardingOpen,
    isVoiceAssistantOpen,
    setIsVoiceAssistantOpen,
    insights,
  } = useKhata();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Render business-specific dashboard
  const renderDynamicDashboard = () => {
    switch (activeBusiness.category) {
      case 'jewellery':
        return <JewelleryDashboard onNavigate={setActiveTab} />;
      case 'real_estate':
        return <RealEstateDashboard onNavigate={setActiveTab} />;
      case 'clothing':
        return <ClothingDashboard onNavigate={setActiveTab} />;
      case 'petrol_pump':
        return <PetrolPumpDashboard onNavigate={setActiveTab} />;
      default:
        return <GenericRetailDashboard onNavigate={setActiveTab} />;
    }
  };

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'khata', label: 'Khata / Udhaar', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sales', label: 'Sales & P&L', icon: TrendingUp },
    { id: 'copilot', label: 'AI Advisor', icon: Sparkles },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb, badge: insights.length > 0 ? insights.length : undefined },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-emerald-200">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Subheader Tabs Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap relative ${
                    isActive
                      ? 'bg-[#10B981] text-white shadow-sm shadow-emerald-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white text-emerald-800' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Dynamic View Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && renderDynamicDashboard()}
        {activeTab === 'khata' && <KhataUdhaarView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'sales' && <SalesAnalyticsView />}
        {activeTab === 'copilot' && <AICopilotView />}
        {activeTab === 'insights' && <AIInsightsView onNavigate={setActiveTab} />}
        {activeTab === 'reports' && <ReportsView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong className="text-slate-800">AI KHATA</strong> &mdash; Pakistan&apos;s Next-Generation Intelligent Business Management Platform.
          </p>
          <p className="text-[11px] text-slate-400">
            &ldquo;You run the business. AI runs the complexity.&rdquo;
          </p>
        </div>
      </footer>

      {/* Floating Action Button for Mobile Voice */}
      <div className="fixed bottom-5 right-5 z-40 sm:hidden">
        <button
          onClick={() => setIsVoiceAssistantOpen(true)}
          className="w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center active:scale-95 transition"
          aria-label="Talk to Ayesha Voice Agent"
        >
          <Mic className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <KhataProvider>
      <MainApp />
    </KhataProvider>
  );
}
