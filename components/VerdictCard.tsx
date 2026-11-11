"use client";

import { VerdictResult } from "@/lib/types";
import { Language, DICTIONARY } from "@/lib/i18n";
import { TrendingUp, CheckCircle, Clock, ShieldCheck, ArrowRight } from "lucide-react";

interface VerdictCardProps {
  verdict: VerdictResult;
  lang: Language;
  onListProduce?: () => void;
}

export default function VerdictCard({ verdict, lang, onListProduce }: VerdictCardProps) {
  const t = DICTIONARY[lang];
  const isUrdu = lang === "ur";
  const isHold = verdict.bestStep > 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all ${
        isHold
          ? "border-amber-300 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40"
          : "border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isHold ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {isHold ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
              {t.verdictTitle}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {t.dataVerified}
            </span>
          </div>

          <h2
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isHold ? "text-amber-900" : "text-emerald-900"
            } ${isUrdu ? "font-urdu text-3xl" : ""}`}
          >
            {isUrdu ? verdict.verdict_ur : verdict.verdict}
          </h2>

          <p className="mt-2 text-sm text-slate-600 max-w-xl">
            {isHold
              ? isUrdu
                ? `منڈی کا ڈیٹا بتاتا ہے کہ فصل ${verdict.bestStep} دن روک کر سٹوریج اور ضیاع نکالنے کے بعد بھی زیادہ منافع ملے گا۔`
                : `Holding for ${verdict.bestStep} days beats today's sale price after factoring in cold storage, financing carry, and spoilage losses.`
              : isUrdu
                ? "منڈی میں رسد زیادہ ہے اور فصل روکنے کا خرچ ممکنہ اضافے سے زیادہ ہے۔ فوری فروخت بہترین حکمت عملی ہے۔"
                : "Immediate sale is optimal. Risk-adjusted storage and spoilage costs exceed projected price gains."}
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <div className="bg-white/90 border border-slate-200 rounded-xl p-3.5 text-center min-w-[130px] shadow-sm">
            <div className="text-xs text-slate-500 font-medium">{t.gainPotential}</div>
            <div
              className={`text-2xl font-bold flex items-center justify-center gap-1 mt-0.5 ${
                verdict.gain >= 0 ? "text-emerald-600" : "text-slate-600"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{verdict.gain >= 0 ? `+₨ ${verdict.gain}` : `₨ ${verdict.gain}`}</span>
              <span className="text-xs font-normal text-slate-500">/kg</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-700">
              {verdict.gainPercent > 0 ? `+${verdict.gainPercent}% ROI` : "Benchmark"}
            </div>
          </div>

          <div className="bg-white/90 border border-slate-200 rounded-xl p-3.5 text-center min-w-[130px] shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Recommended Floor</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              ₨ {verdict.recommendedPrice}
              <span className="text-xs font-normal text-slate-500">/kg</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-600">P50 Fair Value</div>
          </div>
        </div>
      </div>

      {onListProduce && (
        <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Directly connect with certified institutional buyers with pre-set price floors.
          </span>
          <button
            onClick={onListProduce}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all hover:gap-3 active:scale-95"
          >
            <span>{t.listProduceBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
