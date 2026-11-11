"use client";

import { useState, useEffect } from "react";
import { Send, HelpCircle, AlertTriangle, Compass, Volume2, VolumeX, TrendingUp, CheckCircle2, ShieldCheck } from "lucide-react";
import { Language, DICTIONARY } from "@/lib/i18n";

interface CopilotProps {
  currentCrop: string;
  currentMarket: string;
  currentPrice: number;
  arrivals: number;
  demand: number;
  lang: Language;
}

export default function DemandSupplyCopilot({
  currentCrop,
  currentMarket,
  currentPrice,
  arrivals,
  demand,
  lang,
}: CopilotProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeVoiceLang, setActiveVoiceLang] = useState<"ur" | "en" | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const [response, setResponse] = useState<{
    answer: string;
    answer_ur: string;
    keyDrivers: string[];
    marketOutlook: string;
    riskFactor: string;
    usedAI: boolean;
  } | null>(null);

  const t = DICTIONARY[lang];
  const isUrdu = lang === "ur";

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setActiveVoiceLang(null);
  };

  const cropUrduMap: Record<string, string> = {
    tomato: "ٹماٹر",
    onion: "پیاز",
    potato: "آلو",
    wheat: "گندم",
    rice_basmati: "چاول",
    Tomato: "ٹماٹر",
    Onion: "پیاز",
    Potato: "آلو",
    Wheat: "گندم",
  };
  const cropDisplay = isUrdu ? (cropUrduMap[currentCrop] || currentCrop) : currentCrop;

  const suggestedQuestions = isUrdu
    ? [
        `آج ${cropDisplay} کا بھاؤ کیوں بدل رہا ہے؟`,
        `منڈی میں ${arrivals} ٹن مال آنے سے قیمتوں پر کیا اثر ہوگا؟`,
        `کیا مجھے ${cropDisplay} ابھی بیچنا چاہیے یا کچھ دن روکوں؟`,
        `ڈیزل اور ٹرانسپورٹ کرایہ بڑھنے سے کسان کو کیا اثر پڑے گا؟`,
      ]
    : [
        `Why are ${currentCrop} prices projected to change next week?`,
        `How does the current arrival of ${arrivals} tons affect mandi elasticity?`,
        `What will happen to ${currentCrop} farmgate prices if fuel prices increase?`,
        `How does seasonal harvest from Sindh/Balochistan impact ${currentMarket}?`,
      ];

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim() || loading) return;
    setLoading(true);
    stopAudio();

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: queryText,
          crop: currentCrop,
          market: currentMarket,
          currentPrice,
          arrivals,
          demand,
        }),
      });

      if (res.ok) {
        const j = await res.json();
        setResponse(j);
        setQuestion("");
      }
    } catch (err) {
      console.error("Mandi Copilot Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fallbackSpeechSynthesis = (textToSpeak: string, targetLang: "ur" | "en") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = targetLang === "ur" ? "ur-PK" : "en-US";
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) =>
      targetLang === "ur"
        ? v.lang.startsWith("ur") || v.name.includes("Urdu")
        : v.lang.startsWith("en")
    );
    if (match) utterance.voice = match;

    utterance.onend = () => setActiveVoiceLang(null);
    utterance.onerror = () => setActiveVoiceLang(null);

    window.speechSynthesis.speak(utterance);
  };

  const playVoice = (targetLang: "ur" | "en") => {
    if (activeVoiceLang === targetLang) {
      stopAudio();
      return;
    }

    stopAudio();

    const spokenText =
      targetLang === "ur"
        ? response?.answer_ur || response?.answer || ""
        : response?.answer || "";

    if (!spokenText.trim()) return;

    setActiveVoiceLang(targetLang);

    // Primary: Google Neural Voice API via /api/voice
    try {
      const audioUrl = `/api/voice?lang=${targetLang}&text=${encodeURIComponent(spokenText)}`;
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);

      audio.onended = () => {
        setActiveVoiceLang(null);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        fallbackSpeechSynthesis(spokenText, targetLang);
      };

      audio.play().catch(() => {
        fallbackSpeechSynthesis(spokenText, targetLang);
      });
    } catch {
      fallbackSpeechSynthesis(spokenText, targetLang);
    }
  };

  return (
    <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-6 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E8F3EC] text-[#0F3E2E] flex items-center justify-center shrink-0 border border-[#BDE0CB]">
            <TrendingUp className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#14231B] text-sm sm:text-base">
              {t.demandSupplyCopilot}
            </h3>
            <p className="text-xs text-[#55695C] font-medium">
              {isUrdu
                ? "رسد، کھپت، موسمی اثرات یا منڈی ریٹس سے متعلق کوئی بھی تجارتی سوال پوچھیں"
                : "Ask any question about harvest supply, urban demand, inflation, or seasonal mandi shocks"}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#0F3E2E] bg-[#E8F3EC] px-3.5 py-1.5 rounded-full border border-[#BDE0CB] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>{isUrdu ? "منڈی ریسرچ ڈیسک منسلک" : "Live Market Desk"}</span>
        </div>
      </div>

      {/* Suggested Questions Grid */}
      <div className="mb-4">
        <div className="text-[11px] font-black uppercase tracking-wider text-[#66786D] mb-2 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-emerald-700" />
          <span>{isUrdu ? "اہم تجارتی سوالات (کلک کر کے پوچھیں):" : "Suggested Market Inquiries (Click to ask):"}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              disabled={loading}
              className="text-left p-2.5 rounded-xl border border-[#EAE4D8] bg-[#FAF8F3] hover:bg-[#F2ECE1] hover:border-[#0F3E2E] text-xs font-semibold text-[#14231B] transition-all flex items-center justify-between group disabled:opacity-50"
            >
              <span className={`line-clamp-1 ${isUrdu ? "font-urdu text-xs" : ""}`}>{q}</span>
              <Send className="w-3 h-3 text-[#7B8C80] group-hover:text-[#0F3E2E] shrink-0 ml-1.5 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk(question)}
          placeholder={t.copilotPlaceholder}
          disabled={loading}
          className={`flex-1 px-4 py-2.5 rounded-2xl border border-[#DCD3C3] bg-[#FEFDFB] text-xs sm:text-sm text-[#14231B] placeholder-[#8A9B8F] focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent ${
            isUrdu ? "font-urdu text-sm" : ""
          }`}
        />
        <button
          onClick={() => handleAsk(question)}
          disabled={loading || !question.trim()}
          className="px-5 py-2.5 bg-[#0F3E2E] hover:bg-[#144E3A] disabled:bg-[#BAC6BF] text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 text-[#FBBF24]" />
          )}
          <span>{t.sendQuestion}</span>
        </button>
      </div>

      {/* Response Panel */}
      {response && (
        <div className="mt-5 pt-5 border-t border-[#EAE4D8] space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between gap-3 bg-[#FAF8F3] p-3 rounded-2xl border border-[#EBE4D6]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-[#14231B]">
                {isUrdu ? "منڈی ڈیسک تجزیہ و جواب" : "Mandi Desk Intelligence Report"}
              </span>
            </div>

            {/* Audio Listen Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => playVoice("ur")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeVoiceLang === "ur"
                    ? "bg-[#D97706] text-white shadow-xs animate-pulse"
                    : "bg-[#FEFDFB] text-[#0F3E2E] hover:bg-[#E8F3EC] border border-[#BDE0CB]"
                }`}
                title="Listen in Urdu"
              >
                {activeVoiceLang === "ur" ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="font-urdu text-[11px]">{activeVoiceLang === "ur" ? "روکیں" : "سنیں (اردو)"}</span>
              </button>

              <button
                type="button"
                onClick={() => playVoice("en")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeVoiceLang === "en"
                    ? "bg-[#0F3E2E] text-white shadow-xs animate-pulse"
                    : "bg-[#FEFDFB] text-[#55695C] hover:bg-[#F5EFEB] border border-[#EAE4D8]"
                }`}
                title="Listen in English"
              >
                {activeVoiceLang === "en" ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{activeVoiceLang === "en" ? "Stop" : "English"}</span>
              </button>
            </div>
          </div>

          {/* Primary Answer Paragraph */}
          <div className="p-4 rounded-2xl bg-[#FEFDFB] border border-[#EAE4D8] text-xs sm:text-sm text-[#2A3B30] leading-relaxed shadow-2xs">
            <p className={isUrdu ? "font-urdu text-sm" : ""}>
              {isUrdu ? response.answer_ur || response.answer : response.answer}
            </p>
          </div>

          {/* Key Drivers & Outlook Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Outlook */}
            <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#EBE4D6]">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#55695C] mb-1">
                {isUrdu ? "منڈی آؤٹ لک" : "Market Outlook"}
              </div>
              <div className="text-xs font-black text-[#0F3E2E]">
                {response.marketOutlook}
              </div>
            </div>

            {/* Risk */}
            <div className="p-3 rounded-2xl bg-[#FFFDF5] border border-[#FCD34D]">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#92400E] mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>{isUrdu ? "اہم تجارتی خطرہ" : "Risk Factor"}</span>
              </div>
              <div className="text-xs font-bold text-[#853E06]">
                {response.riskFactor}
              </div>
            </div>

            {/* Top Drivers */}
            <div className="p-3 rounded-2xl bg-[#FAF8F3] border border-[#EBE4D6]">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#55695C] mb-1">
                {isUrdu ? "قیمت کے محرکات" : "Key Price Drivers"}
              </div>
              <div className="text-xs text-[#2A3B30] font-semibold line-clamp-2">
                {response.keyDrivers?.join(" • ") || "Arrival supply & transport"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
