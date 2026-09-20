import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Coins,
  ArrowRight,
} from 'lucide-react';
import { formatPKR } from '../../lib/formatters';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AICopilotView: React.FC = () => {
  const { askAICopilot, activeBusiness, sales, customers, products } = useKhata();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm_init',
      sender: 'ai',
      text: `Assalam-o-Alaikum! Main aapka AI Business Advisor hoon. Aap ${activeBusiness.name} ke baray me koi bhi sawal pooch sakte hain—jese profit, udhaar recovery, best selling stock, ya cost analysis.`,
      timestamp: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    'How much profit did I make this month?',
    'Which customers owe the most money?',
    'What inventory should I restock soon?',
    'Aaj ki total wasooli kitni hui?',
    'Summarize my business health and cashflow.',
  ];

  const handleSend = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `m_u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const answer = await askAICopilot(query);

    const aiMsg: Message = {
      id: `m_ai_${Date.now()}`,
      sender: 'ai',
      text: answer,
      timestamp: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-6 shadow-sm border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-[#10B981] shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight">AI Business Copilot & Advisor</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                Pakistan First
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live intelligence connected to {activeBusiness.name} ledger
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m) => {
            const isAI = m.sender === 'ai';
            return (
              <div key={m.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isAI
                      ? 'bg-white text-[#0F172A] border border-slate-200/80 rounded-bl-none shadow-xs'
                      : 'bg-[#10B981] text-white rounded-br-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span
                    className={`text-[10px] mt-2 block ${
                      isAI ? 'text-slate-400 text-left' : 'text-emerald-100 text-right'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-3xl rounded-bl-none p-3.5 shadow-xs flex items-center gap-2 text-xs text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
                <span>AI is analyzing your live business ledger...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Questions Bar */}
        <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Ask AI:</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-slate-700 font-medium shrink-0 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about your profit, stock, sales or customers..."
              className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-300 focus:outline-hidden focus:border-[#10B981] focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
