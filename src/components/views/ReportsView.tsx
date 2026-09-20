import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  FileSpreadsheet,
  FileDown,
  CheckCircle2,
  Calendar,
  Loader2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  Layers,
} from 'lucide-react';
import { formatPKR } from '../../lib/formatters';
import { downloadFinancialCSV, downloadFinancialPDF } from '../../lib/exportReports';

export const ReportsView: React.FC = () => {
  const {
    activeBusiness,
    sales,
    expenses,
    customers,
    products,
    generateMonthlyReport,
    exportDataJson,
  } = useKhata();

  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalReceived = sales.reduce((sum, s) => sum + s.receivedAmount, 0);
  const totalSalesUdhaar = sales.reduce((sum, s) => sum + s.udhaarAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalSales - totalExpenses;
  const totalReceivables = customers.reduce((sum, c) => sum + c.totalReceivable, 0);
  const totalPayables = customers.reduce((sum, c) => sum + c.totalPayable, 0);
  const totalStockValuation = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const handleGenerateAIReport = async () => {
    setIsGenerating(true);
    const res = await generateMonthlyReport();
    setReportData(res);
    setIsGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      downloadFinancialPDF(activeBusiness, sales, expenses, customers, products, reportData);
      setDownloadSuccess('Financial Report PDF downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const handleDownloadCSV = () => {
    try {
      downloadFinancialCSV(activeBusiness, sales, expenses, customers, products);
      setDownloadSuccess('Accounting Ledger CSV downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('Error generating CSV:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-xl font-extrabold text-[#0F172A]">Financial Reports & Accounting Ledger</h2>
          </div>
          <p className="text-xs text-slate-500">
            Export official balance sheets, sales records, expenses, and AI strategic growth reports.
          </p>
        </div>

        {/* Action Buttons: PDF, CSV, Print, JSON */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            id="download-pdf-button"
            className="px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-98"
            title="Download formatted Financial Report as PDF"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            id="download-csv-button"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-98"
            title="Download raw Accounting Ledger as CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition"
            title="Print Current Statement"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={exportDataJson}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition"
            title="Export full JSON backup"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
      </div>

      {/* Download Alert Toast / Notice */}
      {downloadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Daily P&L Snapshot */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#0F172A] text-base">Profit & Loss Balance Sheet Snapshot</h3>
          <span className="text-xs text-slate-400 font-medium">Accounting Period: Current Ledger</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Total Sales Revenue</span>
            <p className="text-lg font-black text-[#0F172A] mt-1">{formatPKR(totalSales)}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{sales.length} transactions</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Operating Expenses</span>
            <p className="text-lg font-black text-rose-600 mt-1">{formatPKR(totalExpenses)}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{expenses.length} records logged</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Net Realized Profit</span>
            <p className={`text-lg font-black mt-1 ${netProfit >= 0 ? 'text-[#10B981]' : 'text-rose-600'}`}>
              {formatPKR(netProfit)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Revenue minus Expenses</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Inventory Asset Value</span>
            <p className="text-lg font-black text-[#0F172A] mt-1">{formatPKR(totalStockValuation, { compact: true })}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{products.length} catalog items</p>
          </div>
        </div>

        {/* Detailed Accounts Breakdown Bar */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Collected Revenue (Cash/Bank):</span>
            <span className="font-extrabold text-[#10B981]">{formatPKR(totalReceived)}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Outstanding Udhaar (Lene Hain):</span>
            <span className="font-extrabold text-rose-600">{formatPKR(totalReceivables)}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium">Payables (Dene Hain):</span>
            <span className="font-extrabold text-slate-700">{formatPKR(totalPayables)}</span>
          </div>
        </div>
      </div>

      {/* Accounting Quick Export Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-600" />
            <h4 className="text-sm font-bold text-[#0F172A]">Tax & Accounting Export Options</h4>
          </div>
          <p className="text-xs text-slate-500">
            Compatible with Microsoft Excel, Google Sheets, QuickBooks, or chartered accountant audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
          >
            <FileDown className="w-4 h-4" />
            <span>Generate & Download PDF</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV Spreadsheet</span>
          </button>
        </div>
      </div>

      {/* AI Monthly Advisor Generator Card */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-[#10B981]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">AI Monthly Strategic Business Advisor</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generates actionable recommendations in Urdu & English tailored for Pakistani market.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateAIReport}
            disabled={isGenerating}
            className="px-6 py-3 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>AI Analyzing 30-Day Ledger...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate Executive AI Report</span>
              </>
            )}
          </button>
        </div>

        {/* Display Generated AI Report */}
        {reportData && (
          <div className="bg-white text-[#0F172A] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider">
                  Executive Assessment
                </span>
                <h4 className="text-base font-extrabold">{activeBusiness.name} Growth Analysis</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Business Health Score:</span>
                <span className="text-sm font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                  {reportData.healthScore || 88} / 100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[#0F172A] uppercase">Executive Summary (English)</h5>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {reportData.executiveSummary}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[#0F172A] uppercase text-right" dir="rtl">
                  خلاصہ برائے بزنس اونر (اردو)
                </h5>
                <p
                  className="text-xs text-slate-700 font-serif leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 text-right"
                  dir="rtl"
                >
                  {reportData.urduSummary}
                </p>
              </div>
            </div>

            {/* Strategic Recommendations */}
            {reportData.actionItems && (
              <div className="pt-2">
                <h5 className="text-xs font-bold text-[#0F172A] mb-2">3 Recommended Action Items:</h5>
                <div className="space-y-1.5">
                  {reportData.actionItems.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

