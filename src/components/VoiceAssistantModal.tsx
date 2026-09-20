import React, { useState, useEffect, useRef } from 'react';
import { useKhata } from '../context/KhataContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  X,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Clock,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { voiceLogs, processVoiceTranscript, activeBusiness } = useKhata();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, voiceLogs]);

  if (!isOpen) return null;

  // Speak text using Web Speech Synthesis API in a warm, natural tone
  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.15; // friendly, natural female tone

    const voices = window.speechSynthesis.getVoices();
    // Try to find Urdu or Pakistani / Indian English voice or general clear female voice
    const femaleVoice = voices.find(
      (v) =>
        v.lang.startsWith('ur') ||
        v.lang.includes('en-PK') ||
        v.lang.includes('en-IN') ||
        (v.name.toLowerCase().includes('female') && v.lang.startsWith('en')) ||
        v.name.includes('Zira') ||
        v.name.includes('Samantha')
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleStartListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported directly in this browser. You can type your request or click any sample below!');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'ur-PK';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          await submitTranscript(transcript);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const submitTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setInputText('');

    const result = await processVoiceTranscript(transcript);
    setIsProcessing(false);

    if (result.voiceResponseText) {
      speakText(result.voiceResponseText);
    }
    if (result.actionTaken) {
      setLastAction(result.actionTaken);
      setTimeout(() => setLastAction(null), 5000);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitTranscript(inputText);
  };

  // Sample prompts tailored to active business
  const getSuggestedPrompts = () => {
    switch (activeBusiness.category) {
      case 'jewellery':
        return [
          '“Ali se pachaas hazaar lene hain”',
          '“Aaj gold ka rate 485,000 per tola hai”',
          '“Usman ne 2 tola ki bridal chain order ki”',
          '“Dr Farhana ko 190,000 ki ring sale ki”',
        ];
      case 'real_estate':
        return [
          '“Ali bought a 10 marla plot for 1.45 crore”',
          '“Mian Ahmed se 12 lakh installment receive hui”',
          '“Rana Sohail dealer ka 250,000 commission note karo”',
          '“Phase 6 me 5 marla file token 750,000 aya”',
        ];
      case 'clothing':
        return [
          '“Al-Madina Boutique se 185,000 lene hain”',
          '“Aaj 20 luxury lawn suits 148,000 me beche”',
          '“Iqbal textile fabric bill 420,000 payable add karo”',
          '“Medium size cotton kurta stock check karo”',
        ];
      case 'petrol_pump':
        return [
          '“Aaj 4,500 litres petrol sell hua”',
          '“Niazi Transport ne 3 lakh payment bhej di”',
          '“Euro-V Diesel tank dip 228 cm note karo”',
          '“Aaj ki total sales 31 lakh record karo”',
        ];
      default:
        return [
          '“Ali se 50 hazaar lene hain”',
          '“Bhai Ahmed ka 20 hazaar baki hai”',
          '“Aaj ki counter sales 85 hazaar record karo”',
          '“Usman ko 15,000 ka udhaar diya”',
        ];
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-xl w-full h-[620px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-600 bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-geometric-dots opacity-20 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-white border-2 border-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">Ayesha — Voice Khata Agent</h3>
                <span className="text-[10px] bg-white/25 text-white px-2 py-0.5 rounded-full font-bold">
                  AI Live
                </span>
              </div>
              <p className="text-xs text-emerald-50">Urdu &bull; Roman Urdu &bull; English</p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-xl transition"
              title={voiceEnabled ? 'Voice output enabled' : 'Voice output muted'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-200" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Confirmation Banner */}
        {lastAction && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-900 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{lastAction}</span>
          </div>
        )}

        {/* Conversation Logs */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAFC]">
          {voiceLogs.map((log) => {
            const isUser = log.speaker === 'user';
            return (
              <div
                key={log.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs text-xs sm:text-sm ${
                    isUser
                      ? 'bg-[#10B981] text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{log.text}</p>
                  {log.urduText && (
                    <p className="mt-1.5 pt-1.5 border-t border-slate-100 text-slate-600 font-serif text-right text-xs leading-relaxed" dir="rtl">
                      {log.urduText}
                    </p>
                  )}
                  {log.actionTaken && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{log.actionTaken}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-xs flex items-center gap-2 text-xs text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Ayesha is updating your business ledger...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Tap Prompts */}
        <div className="px-4 py-2 bg-slate-100/80 border-t border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Try Tap:</span>
          {getSuggestedPrompts().map((p, idx) => (
            <button
              key={idx}
              onClick={() => submitTranscript(p.replace(/["“”]/g, ''))}
              className="text-xs px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-slate-700 shrink-0 font-medium transition active:scale-95"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Bottom Voice / Text Input Controller */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            {/* Pulsing Mic Button */}
            <button
              type="button"
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`p-3.5 rounded-2xl flex items-center justify-center transition active:scale-95 shadow-md ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                  : 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white hover:from-[#059669] hover:to-[#047857] shadow-emerald-500/20'
              }`}
              title={isListening ? 'Stop recording' : 'Speak to Ayesha'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input Box */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening... Bolain...' : "Or type in Roman Urdu / English..."}
              className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-2xl border border-slate-300 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="p-3.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-40 text-white transition active:scale-95 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-slate-500 text-center mt-2">
            Speak naturally: Record sales, udhaar credit, payments, and rate updates instantly.
          </p>
        </div>
      </div>
    </div>
  );
};
