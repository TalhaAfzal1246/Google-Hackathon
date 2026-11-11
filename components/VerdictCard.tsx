"use client";

import { VerdictResult } from "@/lib/types";
import { Language, DICTIONARY } from "@/lib/i18n";
import { TrendingUp, CheckCircle, Clock, ShieldCheck, ArrowRight, Wheat } from "lucide-react";

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
      className={`relative overflow-hidden rounded-2xl border p-6 sm:p-7 shadow-xs transition-all ${
        isHold
          ? "border-amber-400/80 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/30"
          : "border-emerald-300/80 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/30"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isHold
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-300"
              }`}
            >
              {isHold ? <Clock className="w-3.5 h-3.5 text-amber-700" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />}
              {t.verdictTitle}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full font-medium shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              {t.dataVerified}
            </span>
          </div>

          <h2
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isHold ? "text-amber-950" : "text-emerald-950"
            } ${isUrdu ? "font-urdu text-3xl" : ""}`}
          >
            {isUrdu ? verdict.verdict_ur : verdict.verdict}
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-slate-700 max-w-xl leading-relaxed">
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
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center min-w-[140px] shadow-xs">
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{t.gainPotential}</div>
            <div
              className={`text-2xl font-extrabold flex items-center justify-center gap-1 mt-1 ${
                verdict.gain >= 0 ? "text-emerald-700" : "text-slate-700"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{verdict.gain >= 0 ? `+₨ ${verdict.gain}` : `₨ ${verdict.gain}`}</span>
              <span className="text-xs font-normal text-slate-500">/kg</span>
            </div>
            <div className="text-[11px] font-bold text-emerald-800 mt-0.5">
              {verdict.gainPercent > 0 ? `+${verdict.gainPercent}% ROI Yield` : "Benchmark"}
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 text-center min-w-[140px] shadow-xs">
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Recommended Floor</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              ₨ {verdict.recommendedPrice}
              <span className="text-xs font-normal text-slate-500">/kg</span>
            </div>
            <div className="text-[11px] font-bold text-amber-800 mt-0.5 flex items-center justify-center gap-1">
              <Wheat className="w-3 h-3 text-amber-600" />
              <span>P50 Fair Value</span>
            </div>
          </div>
        </div>
      </div>

      {onListProduce && (
        <div className="mt-6 pt-4 border-t border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-600">
            Connect directly with verified wholesale buyers without exploitative middleman cuts.
          </span>
          <button
            onClick={onListProduce}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:gap-3 active:scale-95"
          >
            <span>{t.listProduceBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
