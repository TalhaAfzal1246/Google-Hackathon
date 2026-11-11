"use client";

import { useState } from "react";
import { Sparkles, Send, HelpCircle, AlertTriangle, TrendingUp, Compass } from "lucide-react";
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

  const suggestedQuestions = [
    `Why are ${currentCrop} prices projected to change next week?`,
    `How does the current arrival of ${arrivals} tons affect mandi elasticity?`,
    `What will happen to ${currentCrop} farmgate prices if fuel prices increase by 10%?`,
    `How does seasonal harvest from Sindh/Balochistan impact ${currentMarket}?`,
  ];

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim() || loading) return;
    setLoading(true);

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            {t.demandSupplyCopilot}
          </h3>
          <p className="text-[11px] text-slate-500">
            Ask any question about harvest supply, urban demand, inflation, or seasonal mandi shocks
          </p>
        </div>
      </div>

      {/* Suggested quick pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuestion(q);
              handleAsk(q);
            }}
            disabled={loading}
            className="text-[11px] bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 transition-colors"
          >
            {q}
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
          placeholder={t.copilotPlaceholder}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>{t.sendQuestion}</span>
            </>
          )}
        </button>
      </form>

      {/* Response Display */}
      {response && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Mandi Outlook:
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <Compass className="w-3 h-3" />
                {response.marketOutlook}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Powered by GPT-6.1 Terra</span>
            </div>
          </div>

          {/* Key Drivers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
            {response.keyDrivers.map((driver, i) => (
              <div
                key={i}
                className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-xs font-medium text-slate-700 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span>{driver}</span>
              </div>
            ))}
          </div>

          {/* Answer Text */}
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100 whitespace-pre-line">
            {response.answer}
          </div>

          {/* Urdu summary */}
          {response.answer_ur && (
            <div className="mt-2.5 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-900 font-urdu text-right">
              {response.answer_ur}
            </div>
          )}

          {/* Risk factor */}
          {response.riskFactor && (
            <div className="mt-2.5 flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Primary Risk Factor:</strong> {response.riskFactor}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
