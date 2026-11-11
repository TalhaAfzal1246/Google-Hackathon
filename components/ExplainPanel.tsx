"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Language, DICTIONARY } from "@/lib/i18n";

interface ExplainPanelProps {
  explanation: {
    en: string;
    ur: string;
    bullets: string[];
    usedAI: boolean;
    verified: boolean;
  } | null;
  isLoading: boolean;
  onRefresh: () => void;
  lang: Language;
}

export default function ExplainPanel({
  explanation,
  isLoading,
  onRefresh,
  lang,
}: ExplainPanelProps) {
  const [tab, setTab] = useState<"en" | "ur">(lang === "ur" ? "ur" : "en");
  const t = DICTIONARY[lang];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {t.explanationTitle}
            </h3>
            <p className="text-[11px] text-slate-500">
              Econometric reasoning synthesized by Google Gemini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {explanation && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                explanation.verified
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {explanation.verified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.verifiedBadge}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.unverifiedBadge}</span>
                </>
              )}
            </span>
          )}

          {/* Lang Tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setTab("en")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                tab === "en" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setTab("ur")}
              className={`px-2.5 py-1 rounded-md font-urdu transition-colors ${
                tab === "ur" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              اردو
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Re-analyze with Gemini"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-slate-500">
            Consulting Google Gemini with mandi arrivals and historical quantiles...
          </p>
        </div>
      ) : explanation ? (
        <div>
          <div
            className={`text-sm text-slate-700 leading-relaxed mb-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 ${
              tab === "ur" ? "font-urdu text-base text-right" : ""
            }`}
          >
            {tab === "en" ? explanation.en : explanation.ur}
          </div>

          {tab === "en" && explanation.bullets?.length > 0 && (
            <ul className="space-y-1.5 text-xs text-slate-600">
              {explanation.bullets.map((b, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="text-xs text-slate-400 py-4 text-center">
          Move sliders or click Refresh to generate reasoning.
        </div>
      )}
    </div>
  );
}
