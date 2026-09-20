import React from 'react';
import { useKhata } from '../../context/KhataContext';
import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { formatPKR } from '../../lib/formatters';

export const AIInsightsView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { insights, dismissInsight, activeBusiness, customers, products } = useKhata();

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-xl font-extrabold text-[#0F172A]">Proactive AI Business Insights</h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time anomaly detection, margin warnings, and recovery recommendations for {activeBusiness.name}.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs self-start sm:self-auto">
          {insights.length} Active Insights
        </span>
      </div>

      {/* 2. Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#10B981]" />
            <h4 className="font-bold text-[#0F172A] text-sm">All Systems Running Smoothly</h4>
            <p className="text-xs text-slate-500 mt-1">No risk anomalies or stock warnings detected.</p>
          </div>
        ) : (
          insights.map((ins) => {
            const isAlert = ins.type === 'alert';
            return (
              <div
                key={ins.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-xl ${
                          isAlert
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isAlert ? <AlertCircle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {ins.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{ins.timestamp}</span>
                  </div>

                  <h3 className="font-bold text-[#0F172A] text-sm mt-3">{ins.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ins.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  {ins.actionPrompt ? (
                    <button
                      onClick={() => onNavigate('khata')}
                      className="text-xs font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-1"
                    >
                      <span>{ins.actionPrompt}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={() => dismissInsight(ins.id)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
