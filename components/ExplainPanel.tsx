"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, FileText, TrendingUp, ShieldCheck } from "lucide-react";
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
  const isUrdu = lang === "ur";

  return (
    <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E8F3EC] text-[#0F3E2E] flex items-center justify-center border border-[#BDE0CB] shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#14231B] text-sm sm:text-base">
              {t.explanationTitle}
            </h3>
            <p className="text-[11px] text-[#55695C] font-medium">
              {isUrdu
                ? "پنجاب زرعی مارکیٹ اور سرکاری ڈیٹا پر مبنی معاشی جائزہ"
                : "Econometric market assessment based on Punjab AMIS bulletins"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {explanation && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                explanation.verified
                  ? "bg-[#E8F3EC] text-[#0F3E2E] border border-[#BDE0CB]"
                  : "bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]"
              }`}
            >
              {explanation.verified ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t.verifiedBadge}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t.unverifiedBadge}</span>
                </>
              )}
            </span>
          )}

          {/* Lang Tabs */}
          <div className="flex bg-[#F5EFEB] p-1 rounded-xl text-xs font-bold border border-[#E2D8C7]">
            <button
              onClick={() => setTab("en")}
              className={`px-3 py-1 rounded-lg transition-colors ${
                tab === "en" ? "bg-[#0F3E2E] text-white shadow-xs" : "text-[#55695C] hover:text-[#14231B]"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setTab("ur")}
              className={`px-3 py-1 rounded-lg font-urdu transition-colors ${
                tab === "ur" ? "bg-[#0F3E2E] text-white shadow-xs" : "text-[#55695C] hover:text-[#14231B]"
              }`}
            >
              اردو
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-[#55695C] hover:text-[#0F3E2E] hover:bg-[#F5EFEB] rounded-xl transition-colors border border-[#EAE4D8]"
            title="Refresh Economic Analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-700" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          <div className="h-4 bg-[#F5EFEB] rounded-md animate-pulse w-3/4" />
          <div className="h-4 bg-[#F5EFEB] rounded-md animate-pulse w-5/6" />
          <div className="h-4 bg-[#F5EFEB] rounded-md animate-pulse w-2/3" />
        </div>
      ) : explanation ? (
        <div className="space-y-4">
          {/* Main Narrative Paragraph */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE4D8] text-xs sm:text-sm text-[#2A3B30] leading-relaxed">
            <p className={tab === "ur" ? "font-urdu text-sm" : ""}>
              {tab === "en" ? explanation.en : explanation.ur}
            </p>
          </div>

          {/* Key Factor Bullets */}
          {explanation.bullets && explanation.bullets.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#55695C] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>{tab === "en" ? "Key Economic Drivers" : "بنیادی مارکیٹ عوامل"}</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {explanation.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 bg-[#FEFDFB] p-3 rounded-2xl border border-[#EAE4D8] text-xs font-semibold text-[#14231B]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span className={tab === "ur" ? "font-urdu text-xs" : ""}>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-[#6B7C70] font-medium">
          {isUrdu ? "معاشی تجزیہ تیار کیا جا رہا ہے..." : "Preparing economic market assessment..."}
        </div>
      )}
    </div>
  );
}
