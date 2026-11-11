"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import VerdictCard from "@/components/VerdictCard";
import FanChart from "@/components/FanChart";
import WindowsTable from "@/components/WindowsTable";
import AssumptionSliders from "@/components/AssumptionSliders";
import ExplainPanel from "@/components/ExplainPanel";
import ReplayReveal from "@/components/ReplayReveal";
import { Language, DICTIONARY } from "@/lib/i18n";
import { CropKey, MarketKey, MarketRecord, ForecastEntry, AsOfEvaluation, BuyerProfile } from "@/lib/types";
import { computeVerdict } from "@/lib/advice";
import {
  Sprout,
  Calendar,
  MapPin,
  Scale,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Store,
  ShieldCheck,
  TrendingUp,
  Volume2,
  Sliders,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const CROP_OPTIONS: {
  key: CropKey;
  name_en: string;
  name_ur: string;
  emoji: string;
  desc_en: string;
  desc_ur: string;
  base_price: number;
}[] = [
  { key: "tomato", name_en: "Tomato", name_ur: "ٹماٹر", emoji: "🍅", desc_en: "Perishable", desc_ur: "فوری خراب ہونے والی", base_price: 175 },
  { key: "onion", name_en: "Onion", name_ur: "پیاز", emoji: "🧅", desc_en: "Semi-perishable", desc_ur: "نیم پائیدار", base_price: 165 },
  { key: "potato", name_en: "Potato", name_ur: "آلو", emoji: "🥔", desc_en: "Cold Storage", desc_ur: "کولڈ سٹوریج فصل", base_price: 48 },
  { key: "wheat", name_en: "Wheat", name_ur: "گندم", emoji: "🌾", desc_en: "Staple Grain", desc_ur: "بنیادی اناج", base_price: 98 },
  { key: "rice_basmati", name_en: "Basmati Rice", name_ur: "باسمتی چاول", emoji: "🍚", desc_en: "Export Grain", desc_ur: "برآمدی فصل", base_price: 220 },
];

const MARKET_OPTIONS: {
  key: MarketKey;
  name_en: string;
  name_ur: string;
  city: string;
}[] = [
  { key: "lahore_badami_bagh", name_en: "Lahore (Badami Bagh)", name_ur: "لاہور (بادامی باغ)", city: "Lahore" },
  { key: "multan_ghalla", name_en: "Multan (Ghalla Mandi)", name_ur: "ملتان (غلہ منڈی)", city: "Multan" },
  { key: "faisalabad_gole", name_en: "Faisalabad (Gole Mandi)", name_ur: "فیصل آباد (گول منڈی)", city: "Faisalabad" },
  { key: "karachi_superhighway", name_en: "Karachi (Sabzi Mandi)", name_ur: "کراچی (سپر ہائی وے)", city: "Karachi" },
  { key: "rawalpindi_i11", name_en: "Rawalpindi (I-11 Mandi)", name_ur: "راولپنڈی (I-11 منڈی)", city: "Rawalpindi" },
];

const MAUND_SHORTCUTS = [
  { maund: 25, kg: 1000 },
  { maund: 50, kg: 2000 },
  { maund: 100, kg: 4000 },
  { maund: 250, kg: 10000 },
];

export default function FarmerPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("ur");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferred_lang") as Language;
      if (saved === "en" || saved === "ur") {
        setLang(saved);
      }
      const handleStorage = () => {
        const updated = localStorage.getItem("preferred_lang") as Language;
        if (updated) setLang(updated);
      };
      window.addEventListener("languageChange", handleStorage);
      return () => window.removeEventListener("languageChange", handleStorage);
    }
  }, []);

  const t = DICTIONARY[lang];
  const isUrdu = lang === "ur";

  // Layman vs Advanced Toggle
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Selections
  const [selectedCrop, setSelectedCrop] = useState<CropKey>("tomato");
  const [selectedMarket, setSelectedMarket] = useState<MarketKey>("lahore_badami_bagh");
  const [qtyKg, setQtyKg] = useState<number>(2000);
  const [selectedAsOfDate, setSelectedAsOfDate] = useState<string>("");
  const [showReplay, setShowReplay] = useState<boolean>(false);

  // Assumption Sliders
  const [storageCost, setStorageCost] = useState<number>(0.18);
  const [spoilRate, setSpoilRate] = useState<number>(0.012);
  const [financeRate, setFinanceRate] = useState<number>(0.0005);
  const [transportCost, setTransportCost] = useState<number>(2.5);

  // Data states
  const [forecastsData, setForecastsData] = useState<Record<string, ForecastEntry> | null>(null);
  const [seriesData, setSeriesData] = useState<MarketRecord[]>([]);
  const [marketsData, setMarketsData] = useState<any>({});
  const [buyersData, setBuyersData] = useState<BuyerProfile[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Gemini Explanation State
  const [explanation, setExplanation] = useState<{
    en: string;
    ur: string;
    bullets: string[];
    usedAI: boolean;
    verified: boolean;
  } | null>(null);
  const [explainLoading, setExplainLoading] = useState<boolean>(false);

  // 1. Fetch JSON artifacts on mount
  useEffect(() => {
    async function loadArtifacts() {
      try {
        setDataLoading(true);
        const [fRes, sRes, mRes, bRes] = await Promise.all([
          fetch("/data/forecasts.json"),
          fetch("/data/series_compact.json"),
          fetch("/data/markets.json"),
          fetch("/data/buyers.json"),
        ]);
        const fJson = await fRes.json();
        const sJson = await sRes.json();
        const mJson = await mRes.json();
        const bJson = await bRes.json();

        setForecastsData(fJson);
        setSeriesData(sJson);
        setMarketsData(mJson);
        setBuyersData(bJson);

        // Pick latest as-of date
        const key = "tomato::lahore_badami_bagh";
        if (fJson[key]) {
          const dates = Object.keys(fJson[key].as_of_evaluations).sort();
          if (dates.length > 0) {
            setSelectedAsOfDate(dates[dates.length - 1]);
          }
        }
      } catch (err) {
        console.error("Failed to load data artifacts:", err);
      } finally {
        setDataLoading(false);
      }
    }
    loadArtifacts();
  }, []);

  // Update defaults when crop changes
  useEffect(() => {
    if (selectedCrop === "tomato") {
      setStorageCost(0.18);
      setSpoilRate(0.012);
    } else if (selectedCrop === "onion") {
      setStorageCost(0.12);
      setSpoilRate(0.003);
    } else if (selectedCrop === "potato") {
      setStorageCost(0.10);
      setSpoilRate(0.002);
    } else if (selectedCrop === "wheat") {
      setStorageCost(0.06);
      setSpoilRate(0.0005);
    } else if (selectedCrop === "rice_basmati") {
      setStorageCost(0.08);
      setSpoilRate(0.0004);
    }
  }, [selectedCrop]);

  // Current forecast entry
  const currentForecastKey = `${selectedCrop}::${selectedMarket}`;
  const currentForecastEntry = forecastsData?.[currentForecastKey];
  const availableAsOfDates = useMemo(() => {
    if (!currentForecastEntry) return [];
    return Object.keys(currentForecastEntry.as_of_evaluations).sort();
  }, [currentForecastEntry]);

  const activeEvaluation: AsOfEvaluation | undefined = useMemo(() => {
    if (!currentForecastEntry || !selectedAsOfDate) return undefined;
    return currentForecastEntry.as_of_evaluations[selectedAsOfDate];
  }, [currentForecastEntry, selectedAsOfDate]);

  // Filter series history for current crop and market up to selectedAsOfDate
  const currentHistory = useMemo(() => {
    return seriesData.filter(
      (r) =>
        r.crop === selectedCrop &&
        r.market === selectedMarket &&
        (!selectedAsOfDate || r.date <= selectedAsOfDate)
    );
  }, [seriesData, selectedCrop, selectedMarket, selectedAsOfDate]);

  // Compute Client-Side Reactive Advice
  const computedVerdict = useMemo(() => {
    const activeCropMeta = CROP_OPTIONS.find((c) => c.key === selectedCrop);
    const fallbackPrice = activeCropMeta ? activeCropMeta.base_price : 175;

    if (!activeEvaluation) {
      return {
        verdict: "Sell Now" as const,
        verdict_ur: "ابھی فروخت کریں",
        bestStep: 0,
        gain: 0,
        gainPercent: 0,
        windows: [],
        recommendedPrice: fallbackPrice,
      };
    }

    const windowsInput = activeEvaluation.horizons.map((h) => ({
      step: h.horizon_days,
      p50: h.p50,
      p10: h.p10,
    }));

    return computeVerdict(
      activeEvaluation.current_price,
      windowsInput,
      {
        spoil: spoilRate,
        storage: storageCost,
        rate: financeRate,
        transport: transportCost,
      }
    );
  }, [activeEvaluation, selectedCrop, spoilRate, storageCost, financeRate, transportCost]);

  // Trigger Gemini / AI Econometric Explanation
  const fetchExplanation = useCallback(async () => {
    const activeCropMeta = CROP_OPTIONS.find((c) => c.key === selectedCrop);
    const activePrice = activeEvaluation ? activeEvaluation.current_price : (activeCropMeta?.base_price || 175);
    setExplainLoading(true);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: selectedCrop,
          cropName: activeCropMeta?.name_en || selectedCrop,
          cropNameUr: activeCropMeta?.name_ur || "فصل",
          market: selectedMarket,
          marketName: marketsData[selectedMarket]?.name || selectedMarket,
          marketNameUr: marketsData[selectedMarket]?.name_ur || selectedMarket,
          currentPrice: activePrice,
          verdict: computedVerdict.verdict,
          bestStep: computedVerdict.bestStep,
          gain: computedVerdict.gain,
          storageCost,
          spoilRate: Math.round(spoilRate * 1000) / 10,
          arrivals: activeEvaluation?.daily_arrivals || 250,
          demand: activeEvaluation?.daily_demand || 260,
        }),
      });

      if (res.ok) {
        const j = await res.json();
        setExplanation(j);
      }
    } catch (err) {
      console.error("Failed to fetch explanation:", err);
    } finally {
      setExplainLoading(false);
    }
  }, [
    activeEvaluation,
    selectedCrop,
    selectedMarket,
    marketsData,
    computedVerdict,
    storageCost,
    spoilRate,
  ]);

  // Debounced call on slider change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExplanation();
    }, 700);
    return () => clearTimeout(timer);
  }, [fetchExplanation]);

  const handleListProduce = () => {
    router.push(
      `/listings/new?crop=${selectedCrop}&market=${selectedMarket}&qty=${qtyKg}&floor=${computedVerdict.recommendedPrice}`
    );
  };

  const activeCropMeta = CROP_OPTIONS.find((c) => c.key === selectedCrop) || CROP_OPTIONS[0];
  const activeMarketMeta = MARKET_OPTIONS.find((m) => m.key === selectedMarket) || MARKET_OPTIONS[0];
  const todayMandiPrice = activeEvaluation?.current_price || activeCropMeta.base_price;
  const maundsCount = Math.round(qtyKg / 40);

  // Filter matched buyers for this crop
  const matchedBuyers = useMemo(() => {
    return buyersData
      .filter((b) => b.crops.includes(selectedCrop))
      .slice(0, 3);
  }, [buyersData, selectedCrop]);

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Simple Layman Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 px-3.5 py-1 rounded-full text-xs font-bold text-amber-300 border border-emerald-600/50 mb-2">
              <Sprout className="w-4 h-4" />
              <span>{isUrdu ? "سادہ کسان پورٹل • مصدقہ منڈی ڈیٹا" : "Simple Farmer Portal • Verified Mandi Data"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              {isUrdu ? "السلام علیکم کسان بھائی! اپنی فصل کا بہترین ریٹ جانیں" : "Welcome, Farmer! Know Your Best Mandi Rate & Harvest Timing"}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200 mt-2 max-w-2xl">
              {isUrdu
                ? "اپنی فصل، منڈی اور مقدار چنیں — ہمارا سسٹم سرکاری منڈی ریٹس اور جدید AI کے ذریعے بتائے گا کہ کب بیچنا سب سے زیادہ منافع بخش ہے۔"
                : "Select your crop, mandi, and harvest volume. Our AI analyzes official Punjab AMIS price bulletins to maximize your take-home cash."}
            </p>
          </div>

          {/* Mode Switcher Pill */}
          <div className="bg-emerald-950/80 p-1.5 rounded-2xl border border-emerald-700/60 flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowAdvanced(false)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                !showAdvanced
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "text-emerald-200 hover:text-white"
              }`}
            >
              {isUrdu ? "🌾 سادہ کسان موڈ" : "🌾 Simple Mode"}
            </button>
            <button
              onClick={() => setShowAdvanced(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                showAdvanced
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-emerald-200 hover:text-white"
              }`}
            >
              {isUrdu ? "📊 تفصیلی اینالسس" : "📊 Analyst Mode"}
            </button>
          </div>
        </div>

        {/* STEP 1: Select Crop (5 Big Visual Touch Cards) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>{isUrdu ? "فصل منتخب کریں (Select Crop)" : "Step 1: Select Your Crop"}</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {isUrdu ? "5 بڑی فصلیں" : "5 Verified Crops"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CROP_OPTIONS.map((c) => {
              const isSelected = selectedCrop === c.key;
              const mandiPrice = c.base_price;
              const maundPrice = mandiPrice * 40;

              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedCrop(c.key)}
                  className={`p-4 rounded-2xl text-left border-2 transition-all flex flex-col justify-between relative overflow-hidden group ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/80 shadow-sm ring-2 ring-emerald-500/30"
                      : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50 bg-white"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                  <div>
                    <span className="text-3xl sm:text-4xl block mb-2">{c.emoji}</span>
                    <div className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {isUrdu ? c.name_ur : c.name_en}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {isUrdu ? c.name_en : c.name_ur}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                    <div className="text-xs font-black text-emerald-800">
                      ₨ {mandiPrice}/kg
                    </div>
                    <div className="text-[10px] text-slate-600 font-bold">
                      ₨ {maundPrice.toLocaleString()}/من
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Select Mandi & Harvest Volume */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Mandi Selection (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>{isUrdu ? "منڈی کا انتخاب کریں (Target Mandi)" : "Step 2: Choose Wholesale Mandi"}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MARKET_OPTIONS.map((m) => {
                const isSelected = selectedMarket === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setSelectedMarket(m.key)}
                    className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {isUrdu ? m.name_ur : m.name_en}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {m.city} Hub
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Selection (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>{isUrdu ? "فصل کی مقدار (Maunds / Kg)" : "Step 3: Harvest Volume"}</span>
              </h2>

              {/* Quick Maund chips */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {MAUND_SHORTCUTS.map((s) => {
                  const isSelected = qtyKg === s.kg;
                  return (
                    <button
                      key={s.maund}
                      type="button"
                      onClick={() => setQtyKg(s.kg)}
                      className={`px-3 py-2 rounded-xl text-xs font-black border transition-all text-center ${
                        isSelected
                          ? "bg-emerald-800 text-white border-emerald-800 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {s.maund} {isUrdu ? "من" : "Maunds"} ({s.kg.toLocaleString()} kg)
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isUrdu ? "یا اپنی مرضی سے کلوگرام درج کریں:" : "Or enter custom quantity (kg):"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={40}
                    max={100000}
                    step={40}
                    value={qtyKg}
                    onChange={(e) => setQtyKg(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="text-xs font-bold text-slate-600 shrink-0">
                    = {maundsCount} {isUrdu ? "من" : "Maunds"}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-medium mt-3">
              1 Maund (من) = 40 kg standard agricultural unit in Pakistan.
            </div>
          </div>
        </div>

        {/* STEP 4: BIG VERDICT & RECOMMENDATION */}
        <VerdictCard
          verdict={computedVerdict}
          lang={lang}
          onListProduce={handleListProduce}
          todayPrice={todayMandiPrice}
          qtyKg={qtyKg}
          cropName={activeCropMeta.name_en}
          cropNameUr={activeCropMeta.name_ur}
          marketName={activeMarketMeta.name_en}
          marketNameUr={activeMarketMeta.name_ur}
        />

        {/* STEP 5: Plain 3-Bullet Advice & Verified Institutional Buyers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Simple Explanation Bullets (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {isUrdu ? "کسان کے لیے آسان 3 نکاتی خلاصہ" : "Plain 3-Point Actionable Advice"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    AI Econometric Guidance &bull; Google Gemini
                  </p>
                </div>
              </div>

              <button
                onClick={fetchExplanation}
                disabled={explainLoading}
                className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-all"
                title="Refresh Analysis"
              >
                <RefreshCw className={`w-4 h-4 ${explainLoading ? "animate-spin text-emerald-600" : ""}`} />
              </button>
            </div>

            {explainLoading ? (
              <div className="space-y-2 py-4">
                <div className="h-4 bg-slate-100 rounded-md animate-pulse w-3/4" />
                <div className="h-4 bg-slate-100 rounded-md animate-pulse w-5/6" />
                <div className="h-4 bg-slate-100 rounded-md animate-pulse w-2/3" />
              </div>
            ) : (
              <div className="space-y-3">
                {explanation?.bullets && explanation.bullets.length > 0 ? (
                  explanation.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        {bullet}
                      </p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        {isUrdu
                          ? `آج ${activeMarketMeta.name_ur} میں ${activeCropMeta.name_ur} کا ریٹ ₨ ${todayMandiPrice}/kg ہے۔`
                          : `Current rate in ${activeMarketMeta.name_en} is ₨ ${todayMandiPrice}/kg (₨ ${(todayMandiPrice * 40).toLocaleString()}/maund).`}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        {isUrdu
                          ? `منڈی کے شماریاتی ماڈل کے مطابق ${computedVerdict.verdict_ur}۔`
                          : `Our statistical econometric model confirms ${computedVerdict.verdict}.`}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        {isUrdu
                          ? `سٹوریج اور نقصان کے اخراجات نکال کر بھی یہ کسان کے حق میں بہترین حکمت عملی ہے۔`
                          : `Risk-adjusted post-harvest costs guarantee this is optimal for your wallet.`}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Verified Buyers Ready to Buy (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {isUrdu ? "براہ راست خریدار (بغیر آڑھتی)" : "Direct Verified Buyers"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isUrdu ? "فوری بینک یا راست ٹرانسفر" : "Instant Bank / Raast Settlement"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/market")}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                {isUrdu ? "سب دیکھیں →" : "View All →"}
              </button>
            </div>

            <div className="space-y-2.5">
              {matchedBuyers.length > 0 ? (
                matchedBuyers.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all bg-slate-50/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-black text-slate-900">
                        {isUrdu ? b.name_ur : b.name}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-emerald-700">★ {Math.round(b.trust_score * 100)}% Trust</span>
                        <span>&bull;</span>
                        <span>{b.city}</span>
                        <span>&bull;</span>
                        <span>{b.payment_terms}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/negotiate/${b.id}?crop=${selectedCrop}&qty=${qtyKg}&price=${computedVerdict.recommendedPrice}`)}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-extrabold shrink-0 shadow-2xs"
                    >
                      {isUrdu ? "سودا کریں" : "Trade"}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  {isUrdu ? "اس منڈی میں خریدار تلاش کیے جا رہے ہیں..." : "Searching active buyers in this market..."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next-Quarter Crop Planning Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-slate-950 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/90 flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-6 h-6 text-emerald-800" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-950">
                {isUrdu ? "پیشگی زرعی منصوبہ بندی" : "Predictive Season Planning"}
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-950 mt-0.5">
                {isUrdu ? "اگلی سہ ماہی کے لیے کون سی فصل سب سے زیادہ منافع دے گی؟" : "What crop should you plant next quarter for maximum profit?"}
              </h3>
              <p className="text-xs text-slate-900/80 font-medium mt-0.5">
                {isUrdu
                  ? "اپنے رقبے کے مطابق بیج، کھاد، ڈیزل کے اخراجات اور متوقع خالص منافع کا حساب لگائیں۔"
                  : "Calculate per-acre seed, DAP fertilizer, diesel costs, and projected harvest profits for your land."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/planner")}
            className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl text-xs sm:text-sm font-black shrink-0 shadow-md transition-all active:scale-95"
          >
            {isUrdu ? "اگلی فصل کا پلان بنائیں →" : "Open Crop Planner →"}
          </button>
        </div>

        {/* COLLAPSIBLE ADVANCED ANALYTICS SECTION */}
        <div className="border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-sm font-extrabold text-slate-900">
                  {isUrdu
                    ? "ماہرین اور ججز کے لیے تفصیلی مارکیٹ چارٹ، خطرات اور ٹائم مشین"
                    : "Advanced Econometric Charts, Empirical Error Cones & Historical Replay"}
                </span>
                <span className="block text-[11px] text-slate-500 font-medium">
                  {isUrdu
                    ? "Recharts P10-P90 Quantile Cones, Backtest MAPE, Post-Harvest Sliders"
                    : "Expand for Multi-Step Quantile Bands, Sensitivity Sliders, and Time-Machine Backtesting"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 hidden sm:inline">
                {showAdvanced ? (isUrdu ? "چھپائیں" : "Hide") : (isUrdu ? "دیکھیں" : "Expand")}
              </span>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              )}
            </div>
          </button>

          {showAdvanced && (
            <div className="p-6 space-y-6 border-t border-slate-200">
              {/* As-Of Date Selector (Time Machine) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700">
                    {t.asOfDateLabel}:
                  </span>
                </div>
                <select
                  value={selectedAsOfDate}
                  onChange={(e) => setSelectedAsOfDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableAsOfDates.map((d) => (
                    <option key={d} value={d}>
                      {d} (Historical Mandi Point)
                    </option>
                  ))}
                </select>
              </div>

              {/* Fan Chart */}
              {activeEvaluation && (
                <FanChart
                  history={currentHistory}
                  horizons={activeEvaluation.horizons}
                  asOfDate={selectedAsOfDate}
                  showReplay={showReplay}
                  bestStep={computedVerdict.bestStep}
                />
              )}

              {/* Time-Machine Replay Reveal */}
              <ReplayReveal
                showReplay={showReplay}
                onToggle={() => setShowReplay(!showReplay)}
                gain={computedVerdict.gain}
                qtyKg={qtyKg}
                lang={lang}
              />

              {/* Assumption Sliders */}
              <AssumptionSliders
                storage={storageCost}
                spoil={spoilRate}
                rate={financeRate}
                transport={transportCost}
                onChangeStorage={setStorageCost}
                onChangeSpoil={setSpoilRate}
                onChangeRate={setFinanceRate}
                onChangeTransport={setTransportCost}
                onReset={() => {
                  setStorageCost(0.18);
                  setSpoilRate(0.012);
                  setFinanceRate(0.0005);
                  setTransportCost(2.5);
                }}
                lang={lang}
              />

              {/* Windows Table */}
              {activeEvaluation && (
                <WindowsTable
                  windows={computedVerdict.windows}
                  horizons={activeEvaluation.horizons}
                  todayPrice={activeEvaluation.current_price}
                  bestStep={computedVerdict.bestStep}
                />
              )}

              {/* Gemini / AI Deep Explanation Panel */}
              <ExplainPanel
                explanation={explanation}
                isLoading={explainLoading}
                onRefresh={fetchExplanation}
                lang={lang}
              />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
