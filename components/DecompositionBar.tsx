"use client";

import { SpreadDecomposition } from "@/lib/spread";
import { Language } from "@/lib/i18n";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface DecompositionBarProps {
  decomposition: SpreadDecomposition;
  date: string;
  cropName: string;
  marketName: string;
  lang?: Language;
}

export default function DecompositionBar({
  decomposition,
  date,
  cropName,
  marketName,
  lang = "ur",
}: DecompositionBarProps) {
  const isUrdu = lang === "ur";

  const total =
    decomposition.fuelTransportPkr +
    decomposition.handlingCommissionPkr +
    decomposition.normalStoragePkr +
    decomposition.unexplainedSurplusPkr;

  const pct = (val: number) => (total > 0 ? (val / total) * 100 : 0);

  const cropNameLocalized = isUrdu
    ? cropName.toLowerCase().includes("tomato")
      ? "ٹماٹر"
      : cropName.toLowerCase().includes("onion")
      ? "پیاز"
      : cropName.toLowerCase().includes("potato")
      ? "آلو"
      : cropName.toLowerCase().includes("wheat")
      ? "گندم"
      : cropName
    : cropName;

  return (
    <div className={`bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${
                decomposition.isGouging
                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
            >
              {decomposition.isGouging ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{isUrdu ? "غیر معمولی کٹوتی و منافع کا انکشاف" : "Exploitative Middleman Surplus Detected"}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{isUrdu ? "مسابقتی منصفانہ مارجن" : "Competitive Distribution Spread"}</span>
                </>
              )}
            </span>
            <span className="text-xs text-[#55695C] font-semibold" dir="ltr">
              Date: {date}
            </span>
          </div>
          <h3 className="font-extrabold text-[#14231B] text-sm sm:text-base">
            {isUrdu
              ? `منڈی قیمت اور مارجن کا تفصیلی تجزیہ (${cropNameLocalized} • ${marketName})`
              : `Mandi Price Margin Decomposition (${cropName} • ${marketName})`}
          </h3>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs text-[#55695C] font-bold">
            {isUrdu ? "غیر معمولی منافع / خلا" : "Unexplained Surplus"}
          </div>
          <div
            className={`text-xl font-black ${
              decomposition.isGouging ? "text-rose-600" : "text-emerald-700"
            }`}
            dir="ltr"
          >
            ₨ {decomposition.unexplainedSurplusPkr}/kg
            <span className="text-xs font-bold text-[#55695C]"> ({decomposition.unexplainedSurplusPct}%)</span>
          </div>
        </div>
      </div>

      {/* Stacked Progress Bar */}
      <div className="h-6 w-full rounded-xl overflow-hidden flex bg-[#FAF8F3] p-0.5 border border-[#EAE4D8]" dir="ltr">
        {/* Fuel & Transport */}
        <div
          style={{ width: `${pct(decomposition.fuelTransportPkr)}%` }}
          className="bg-amber-400 h-full rounded-l-lg transition-all"
          title={`Freight & Fuel: ₨ ${decomposition.fuelTransportPkr}/kg`}
        />
        {/* Commission */}
        <div
          style={{ width: `${pct(decomposition.handlingCommissionPkr)}%` }}
          className="bg-blue-400 h-full transition-all"
          title={`Arthi Commission: ₨ ${decomposition.handlingCommissionPkr}/kg`}
        />
        {/* Normal Storage */}
        <div
          style={{ width: `${pct(decomposition.normalStoragePkr)}%` }}
          className="bg-emerald-400 h-full transition-all"
          title={`Normal Storage: ₨ ${decomposition.normalStoragePkr}/kg`}
        />
        {/* Unexplained Surplus */}
        <div
          style={{ width: `${pct(decomposition.unexplainedSurplusPkr)}%` }}
          className="bg-rose-500 h-full rounded-r-lg transition-all"
          title={`Unexplained Cartel Margin: ₨ ${decomposition.unexplainedSurplusPkr}/kg`}
        />
      </div>

      {/* Legend & Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs">
        <div className="flex items-center gap-2 p-2.5 bg-[#FAF8F3] rounded-2xl border border-[#EAE4D8]">
          <span className="w-3.5 h-3.5 rounded-lg bg-amber-400 shrink-0" />
          <div>
            <div className="text-[#55695C] text-[10px] font-bold">{isUrdu ? "ٹرانسپورٹ و ایندھن" : "Freight & Transport"}</div>
            <div className="font-black text-[#14231B]" dir="ltr">₨ {decomposition.fuelTransportPkr}/kg</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-[#FAF8F3] rounded-2xl border border-[#EAE4D8]">
          <span className="w-3.5 h-3.5 rounded-lg bg-blue-400 shrink-0" />
          <div>
            <div className="text-[#55695C] text-[10px] font-bold">{isUrdu ? "آڑھتی منڈی کمیشن" : "Arthi Mandi Comm."}</div>
            <div className="font-black text-[#14231B]" dir="ltr">₨ {decomposition.handlingCommissionPkr}/kg</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-[#FAF8F3] rounded-2xl border border-[#EAE4D8]">
          <span className="w-3.5 h-3.5 rounded-lg bg-emerald-400 shrink-0" />
          <div>
            <div className="text-[#55695C] text-[10px] font-bold">{isUrdu ? "سٹوریج و سنبھال" : "Normal Storage"}</div>
            <div className="font-black text-[#14231B]" dir="ltr">₨ {decomposition.normalStoragePkr}/kg</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl">
          <span className="w-3.5 h-3.5 rounded-lg bg-rose-500 shrink-0" />
          <div>
            <div className="text-[#991B1B] text-[10px] font-bold">{isUrdu ? "غیر معمولی منافع" : "Unexplained Surplus"}</div>
            <div className="font-black text-[#991B1B]" dir="ltr">₨ {decomposition.unexplainedSurplusPkr}/kg</div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-[11px] text-[#55695C] bg-[#FAF8F3] p-3 rounded-2xl border border-[#EAE4D8] leading-relaxed">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <span>
          <strong>{isUrdu ? "معاشی وضاحتی نوٹ: " : "Economic Disclosure: "}</strong>
          {isUrdu
            ? "غیر معمولی منافع کا فرق مقامی مجبوری فروخت، پیشگی ادھار کی شرائط (پیشگی)، یا اچانک گلنے سڑنے کی خرابیوں کو بھی ظاہر کر سکتا ہے۔"
            : "Unexplained spreads may reflect localized distress sales, informal credit ties (peshgi), or sudden perishable sorting losses not captured in transport indices."}
        </span>
      </div>
    </div>
  );
}
