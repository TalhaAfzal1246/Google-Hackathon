"use client";

import { useState, useEffect } from "react";
import { Sparkles, Send, HelpCircle, AlertTriangle, Compass, Volume2, VolumeX } from "lucide-react";
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
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
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const suggestedQuestions = isUrdu
    ? [
        `آج ${currentCrop} کا بھاؤ کیوں بدل رہا ہے؟`,
        `منڈی میں ${arrivals} ٹن مال آنے سے قیمتوں پر کیا اثر ہوگا؟`,
        `کیا مجھے ${currentCrop} ابھی بیچنا چاہیے یا کچھ دن روکوں؟`,
        `ڈیزل اور ٹرانسپورٹ کرایہ بڑھنے سے کسان کو کیا نقصان ہوگا؟`,
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
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }

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
        const data = await res.json();
        setResponse(data);
      }
    } catch (err) {
      console.error("Copilot error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Audio speech synthesis is not supported on this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    const spokenText = isUrdu
      ? (response?.answer_ur || response?.answer || "")
      : (response?.answer || "");

    if (!spokenText) return;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = isUrdu ? "ur-PK" : "en-US";
    utterance.rate = 0.92;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              {t.demandSupplyCopilot}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? "رسد، کھپت، موسمی اثرات یا منڈی ریٹس سے متعلق کوئی بھی سوال پوچھیں"
                : "Ask any question about harvest supply, urban demand, inflation, or seasonal mandi shocks"}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>GPT-6.1 Terra</span>
        </div>
      </div>

      {/* Suggested quick pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuestion(q);
              handleAsk(q);
            }}
            disabled={loading}
            className="text-xs bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 font-medium px-3 py-1.5 rounded-full border border-slate-200 transition-all text-left"
          >
            💬 {q}
          </button>
        ))}
      </div>

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(question);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={isUrdu ? "اپنا سوال یہاں لکھیں... (مثلاً: ٹماٹر کا ریٹ کل کیا ہوگا؟)" : t.copilotPlaceholder}
          className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-sm transition-all active:scale-95 shrink-0"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{isUrdu ? "پوچھیں" : t.sendQuestion}</span>
            </>
          )}
        </button>
      </form>

      {/* Response Display */}
      {response && (
        <div className="mt-5 pt-5 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isUrdu ? "منڈی آؤٹ لک:" : "Mandi Outlook:"}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Compass className="w-3.5 h-3.5" />
                {response.marketOutlook}
              </span>
            </div>

            {/* Audio Readout */}
            <button
              onClick={handleToggleAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                isPlayingAudio
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>{isUrdu ? "روکیں" : "Stop"}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isUrdu ? "🔊 جواب سنیں" : "🔊 Listen Answer"}</span>
                </>
              )}
            </button>
          </div>

          {/* Key Drivers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
            {response.keyDrivers.map((driver, i) => (
              <div
                key={i}
                className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>{driver}</span>
              </div>
            ))}
          </div>

          {/* Urdu summary if available */}
          {response.answer_ur && (
            <div className="mb-3 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 font-urdu leading-relaxed">
              <div className="font-bold mb-1 text-emerald-900 flex items-center gap-1">
                <span>🌾 اردو تجزیہ:</span>
              </div>
              {response.answer_ur}
            </div>
          )}

          {/* Answer Text */}
          <div className="bg-slate-50 p-4 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed border border-slate-200 whitespace-pre-line font-medium">
            {response.answer}
          </div>

          {/* Risk factor */}
          {response.riskFactor && (
            <div className="mt-3 flex items-start gap-2.5 text-xs text-amber-900 bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>{isUrdu ? "اہم خطرہ:" : "Primary Risk Factor:"}</strong> {response.riskFactor}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
