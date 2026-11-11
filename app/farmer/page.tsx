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
  ChevronDown,
  ChevronUp,
  Store,
  ShieldCheck,
  TrendingUp,
  Sliders,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Award,
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
  const ArrowIcon = isUrdu ? ArrowLeft : ArrowRight;

  // Layman vs Advanced Toggle
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Selections
  const [selectedCrop, setSelectedCrop] = useState<CropKey>("tomato");
  const [selectedMarket, setSelectedMarket] = useState<MarketKey>("lahore_badami_bagh");
  const [qtyKg, setQtyKg] = useState<number>(2000);
  const [selectedAsOfDate, setSelectedAsOfDate] = useState<string>("");
  const [showReplay, setShowReplay] = useState<boolean>(false);

  // Sliders for holding costs
  const [storageCost, setStorageCost] = useState<number>(0.18);
  const [spoilRate, setSpoilRate] = useState<number>(0.012);
  const [financeRate, setFinanceRate] = useState<number>(0.015);
  const [transportCost, setTransportCost] = useState<number>(0);

  // Data states
  const [seriesData, setSeriesData] = useState<MarketRecord[]>([]);
  const [forecastsData, setForecastsData] = useState<Record<string, ForecastEntry>>({});
  const [marketsData, setMarketsData] = useState<Record<string, any>>({});
  const [buyersData, setBuyersData] = useState<BuyerProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Econometric Explanation State
  const [explanation, setExplanation] = useState<{
    en: string;
    ur: string;
    bullets: string[];
    usedAI: boolean;
    verified: boolean;
  } | null>(null);
  const [explainLoading, setExplainLoading] = useState<boolean>(false);

  // Load Data Artifacts
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sRes, fRes, mRes, bRes] = await Promise.all([
          fetch("/data/series_compact.json"),
          fetch("/data/forecasts.json"),
          fetch("/data/markets.json"),
          fetch("/data/buyers.json"),
        ]);

        const [sJson, fJson, mJson, bJson] = await Promise.all([
          sRes.json(),
          fRes.json(),
          mRes.json(),
          bRes.json(),
        ]);

        setSeriesData(sJson);
        setForecastsData(fJson);
        setMarketsData(mJson);
        setBuyersData(bJson);

        const initialKey = "tomato::lahore_badami_bagh";
        if (fJson[initialKey]?.as_of_evaluations) {
          const dates = Object.keys(fJson[initialKey].as_of_evaluations).sort();
          if (dates.length > 0) {
            setSelectedAsOfDate(dates[dates.length - 1]);
          }
        }
      } catch (err) {
        console.error("Failed to load farmer advisory data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update cost defaults when crop changes
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
  const currentForecastEntry = forecastsData[currentForecastKey];

  const availableAsOfDates = useMemo(() => {
    if (!currentForecastEntry?.as_of_evaluations) return [];
    return Object.keys(currentForecastEntry.as_of_evaluations).sort();
  }, [currentForecastEntry]);

  // Keep as-of date valid
  useEffect(() => {
    if (availableAsOfDates.length > 0) {
      if (!selectedAsOfDate || !availableAsOfDates.includes(selectedAsOfDate)) {
        setSelectedAsOfDate(availableAsOfDates[availableAsOfDates.length - 1]);
      }
    }
  }, [availableAsOfDates, selectedAsOfDate]);

  // Active As-Of Evaluation
  const activeEvaluation: AsOfEvaluation | null = useMemo(() => {
    if (!currentForecastEntry?.as_of_evaluations || !selectedAsOfDate) return null;
    return currentForecastEntry.as_of_evaluations[selectedAsOfDate] || null;
  }, [currentForecastEntry, selectedAsOfDate]);

  // Filtered History Series for Chart
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

  // Trigger Econometric Explanation
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
    <div className={`min-h-screen bg-[#FAF7F2] text-[#1E2621] flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Authoritative Mandi Banner */}
        <div className="bg-gradient-to-r from-[#0E3E28] via-[#134E35] to-[#1E2621] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-[#0A2D21]">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#1A5C40] px-3.5 py-1 rounded-full text-xs font-bold text-[#FDE68A] border border-[#237854] mb-2.5">
              <ShieldCheck className="w-4 h-4 text-[#FBBF24]" />
              <span>{isUrdu ? "سرکاری منڈی ڈیٹا (AMIS پنجاب) • فصل فروخت مشورہ" : "Official Mandi Advisory • Punjab AMIS Data"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              {isUrdu ? "السلام علیکم کسان بھائی! اپنی فصل کا بہترین ریٹ جانیں" : "Welcome, Grower! Check Verified Mandi Rates & Harvest Timing"}
            </h1>
            <p className="text-xs sm:text-sm text-[#A7D9C0] mt-2 max-w-2xl font-medium">
              {isUrdu
                ? "اپنی فصل، منڈی اور مقدار چنیں — ہمارا سسٹم سرکاری منڈی ریٹس کے حسابی تجزیے سے بتائے گا کہ کب بیچنا سب سے زیادہ منافع بخش ہے۔"
                : "Select your crop, mandi, and harvest volume. Our econometric model analyzes official Punjab AMIS price bulletins to maximize your take-home cash."}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="bg-[#092418] p-1.5 rounded-2xl border border-[#164D35] flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowAdvanced(false)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                !showAdvanced
                  ? "bg-[#D97706] text-white shadow-xs"
                  : "text-[#A7D9C0] hover:text-white"
              }`}
            >
              {isUrdu ? "🌾 سادہ کسان موڈ" : "🌾 Simple Mode"}
            </button>
            <button
              onClick={() => setShowAdvanced(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                showAdvanced
                  ? "bg-[#FEFDFB] text-[#1E2621] shadow-xs"
                  : "text-[#A7D9C0] hover:text-white"
              }`}
            >
              {isUrdu ? "📊 تفصیلی تجزیہ" : "📊 Analyst Mode"}
            </button>
          </div>
        </div>

        {/* STEP 1: Select Crop (5 Big Visual Touch Cards) */}
        <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm sm:text-base font-black text-[#14231B] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0F3E2E] text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>{isUrdu ? "فصل منتخب کریں (Select Crop)" : "Step 1: Select Your Crop"}</span>
            </h2>
            <span className="text-xs text-[#55695C] font-semibold">
              {isUrdu ? "5 بڑی غلہ و سبزی فصلیں" : "5 Verified Crops"}
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
                      ? "border-[#0F3E2E] bg-[#F5FAF6] shadow-xs ring-2 ring-emerald-700/20"
                      : "border-[#EAE4D8] hover:border-[#BDE0CB] hover:bg-[#FAF8F3] bg-[#FEFDFB]"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-700" />
                  )}
                  <div>
                    <span className="text-3xl sm:text-4xl block mb-2">{c.emoji}</span>
                    <div className="font-extrabold text-[#14231B] text-sm sm:text-base group-hover:text-[#0F3E2E]">
                      {isUrdu ? c.name_ur : c.name_en}
                    </div>
                    <div className="text-[11px] text-[#55695C] font-semibold">
                      {isUrdu ? c.name_en : c.name_ur}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#EAE4D8]">
                    <div className="text-xs font-black text-[#0F3E2E]">
                      ₨ {mandiPrice}/kg
                    </div>
                    <div className="text-[10px] text-[#55695C] font-bold">
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
          <div className="lg:col-span-7 bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs">
            <h2 className="text-sm sm:text-base font-black text-[#14231B] flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#0F3E2E] text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>{isUrdu ? "ہدف منڈی کا انتخاب کریں" : "Step 2: Choose Wholesale Mandi"}</span>
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
                        ? "border-[#0F3E2E] bg-[#F5FAF6] shadow-xs ring-1 ring-emerald-700/20"
                        : "border-[#EAE4D8] hover:border-[#DCD3C3] bg-[#FEFDFB]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-[#0F3E2E] text-white" : "bg-[#F5EFEB] text-[#55695C]"
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-[#14231B]">
                        {isUrdu ? m.name_ur : m.name_en}
                      </div>
                      <div className="text-[10px] text-[#55695C] font-medium">
                        {m.city} Regional Hub
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Selection (5 cols) */}
          <div className="lg:col-span-5 bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-black text-[#14231B] flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#0F3E2E] text-white text-xs flex items-center justify-center font-bold">3</span>
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
                          ? "bg-[#0F3E2E] text-white border-[#0F3E2E] shadow-2xs"
                          : "bg-[#FAF8F3] text-[#2A3B30] border-[#EAE4D8] hover:bg-[#F2ECE1]"
                      }`}
                    >
                      {s.maund} {isUrdu ? "من" : "Maunds"} ({s.kg.toLocaleString()} kg)
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <div className="bg-[#FAF8F3] rounded-2xl p-3 border border-[#EAE4D8]">
                <label className="block text-[11px] font-bold text-[#55695C] mb-1">
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
                    className="w-full bg-[#FEFDFB] border border-[#DCD3C3] rounded-xl px-3 py-2 text-sm font-extrabold text-[#14231B] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <div className="text-xs font-bold text-[#55695C] shrink-0">
                    = {maundsCount} {isUrdu ? "من" : "Maunds"}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#7A8C80] font-medium mt-3">
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
          <div className="lg:col-span-7 bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F3EC] text-[#0F3E2E] flex items-center justify-center font-bold border border-[#BDE0CB]">
                  <TrendingUp className="w-4 h-4 text-emerald-800" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#14231B]">
                    {isUrdu ? "کسان کے لیے 3 نکاتی معاشی خلاصہ" : "Plain 3-Point Actionable Advice"}
                  </h3>
                  <p className="text-[11px] text-[#55695C] font-medium">
                    {isUrdu ? "سرکاری منڈی رہنمائی • پنجاب زرعی مارکیٹ ڈیٹا" : "Official Mandi Advisory • Punjab AMIS Data"}
                  </p>
                </div>
              </div>

              <button
                onClick={fetchExplanation}
                disabled={explainLoading}
                className="p-2 text-[#55695C] hover:text-[#0F3E2E] hover:bg-[#FAF8F3] rounded-xl transition-all border border-[#EAE4D8]"
                title="Refresh Analysis"
              >
                <RefreshCw className={`w-4 h-4 ${explainLoading ? "animate-spin text-emerald-700" : ""}`} />
              </button>
            </div>

            {explainLoading ? (
              <div className="space-y-2 py-4">
                <div className="h-4 bg-[#F5EFEB] rounded-md animate-pulse w-3/4" />
                <div className="h-4 bg-[#F5EFEB] rounded-md animate-pulse w-5/6" />
                <div className="h-4 bg-[#F5EFEB] rounded-md animate-pulse w-2/3" />
              </div>
            ) : (
              <div className="space-y-3">
                {explanation?.bullets && explanation.bullets.length > 0 ? (
                  explanation.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF8F3] border border-[#EBE4D6]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <p className={`text-xs sm:text-sm text-[#2A3B30] font-medium leading-relaxed ${isUrdu ? "font-urdu" : ""}`}>
                        {bullet}
                      </p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF8F3] border border-[#EBE4D6]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <p className={`text-xs sm:text-sm text-[#2A3B30] font-medium leading-relaxed ${isUrdu ? "font-urdu" : ""}`}>
                        {isUrdu
                          ? `آج ${activeMarketMeta.name_ur} میں ${activeCropMeta.name_ur} کا ریٹ ₨ ${todayMandiPrice}/kg ہے۔`
                          : `Current rate in ${activeMarketMeta.name_en} is ₨ ${todayMandiPrice}/kg (₨ ${(todayMandiPrice * 40).toLocaleString()}/maund).`}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF8F3] border border-[#EBE4D6]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <p className={`text-xs sm:text-sm text-[#2A3B30] font-medium leading-relaxed ${isUrdu ? "font-urdu" : ""}`}>
                        {isUrdu
                          ? `منڈی کے شماریاتی ماڈل کے مطابق ${computedVerdict.verdict_ur}۔`
                          : `Our statistical econometric model confirms ${computedVerdict.verdict}.`}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FAF8F3] border border-[#EBE4D6]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <p className={`text-xs sm:text-sm text-[#2A3B30] font-medium leading-relaxed ${isUrdu ? "font-urdu" : ""}`}>
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
          <div className="lg:col-span-5 bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E8F3EC] text-[#0F3E2E] flex items-center justify-center font-bold border border-[#BDE0CB]">
                  <Store className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#14231B]">
                    {isUrdu ? "براہ راست خریدار (بغیر آڑھتی)" : "Direct Verified Buyers"}
                  </h3>
                  <p className="text-[11px] text-[#55695C]">
                    {isUrdu ? "فوری بینک یا راست ٹرانسفر" : "Instant Bank / Raast Settlement"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/market")}
                className="text-xs font-bold text-[#0F3E2E] hover:text-[#144E3A] flex items-center gap-1"
              >
                <span>{isUrdu ? "سب دیکھیں" : "View All"}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {matchedBuyers.length > 0 ? (
                matchedBuyers.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl border border-[#EAE4D8] hover:border-[#0F3E2E] transition-all bg-[#FAF8F3] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-black text-[#14231B]">
                        {isUrdu ? b.name_ur : b.name}
                      </div>
                      <div className="text-[10px] text-[#55695C] flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-[#0F3E2E]">★ {Math.round(b.trust_score * 100)}% Trust</span>
                        <span>&bull;</span>
                        <span>{b.city}</span>
                        <span>&bull;</span>
                        <span>{b.payment_terms}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/negotiate/${b.id}?crop=${selectedCrop}&qty=${qtyKg}&price=${computedVerdict.recommendedPrice}`)}
                      className="px-3.5 py-1.5 bg-[#0F3E2E] hover:bg-[#144E3A] text-white rounded-xl text-xs font-black shrink-0 shadow-2xs"
                    >
                      {isUrdu ? "سودا کریں" : "Trade"}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[#6B7C70]">
                  {isUrdu ? "اس منڈی میں خریدار تلاش کیے جا رہے ہیں..." : "Searching active buyers in this market..."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next-Quarter Crop Planning Banner */}
        <div className="bg-gradient-to-r from-[#D97706] via-[#B45309] to-[#0F3E2E] text-white rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border border-[#B45309]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Calendar className="w-6 h-6 text-[#FDE68A]" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#FDE68A]">
                {isUrdu ? "پیشگی زرعی منصوبہ بندی" : "Predictive Season Planning"}
              </div>
              <h3 className="text-base sm:text-lg font-black mt-0.5">
                {isUrdu ? "اگلی سہ ماہی کے لیے کون سی فصل سب سے زیادہ منافع دے گی؟" : "What crop should you plant next quarter for maximum profit?"}
              </h3>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                {isUrdu
                  ? "اپنے رقبے کے مطابق بیج، کھاد، ڈیزل کے اخراجات اور متوقع خالص منافع کا حساب لگائیں۔"
                  : "Calculate per-acre seed, DAP fertilizer, diesel costs, and projected harvest profits for your land."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/planner")}
            className="px-6 py-3 bg-[#FEFDFB] hover:bg-[#F5EFEB] text-[#14231B] rounded-2xl text-xs sm:text-sm font-black shrink-0 shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <span>{isUrdu ? "اگلی فصل کا پلان بنائیں" : "Open Crop Planner"}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>

        {/* ADVANCED ANALYTICS SECTION */}
        <div className="border border-[#EAE4D8] rounded-3xl bg-[#FEFDFB] overflow-hidden shadow-xs">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-[#FAF8F3] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F5EFEB] text-[#2A3B30] flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#14231B]">
                  {isUrdu ? "تفصیلی شماریاتی تجزیہ، چارٹ اور ٹائم مشین" : "Detailed Statistical Analytics, Quantile Fan Chart & Time Machine"}
                </h3>
                <p className="text-xs text-[#55695C]">
                  {isUrdu
                    ? "قیمتوں کے شماریاتی ماڈلز، ہورائزن ٹیبل اور ماضی کے ڈیٹا پر ٹیسٹنگ"
                    : "P10-P90 prediction envelopes, horizon decision matrix, and holding cost assumptions"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0F3E2E] hidden sm:inline-block">
                {showAdvanced ? (isUrdu ? "چھپائیں ▲" : "Hide ▲") : (isUrdu ? "دیکھیں ▼" : "Expand ▼")}
              </span>
              {showAdvanced ? <ChevronUp className="w-5 h-5 text-[#55695C]" /> : <ChevronDown className="w-5 h-5 text-[#55695C]" />}
            </div>
          </button>

          {showAdvanced && (
            <div className="p-5 sm:p-6 border-t border-[#EAE4D8] space-y-6 bg-[#FAF7F2]">
              {/* As-Of Date Selection (Time Machine) */}
              <div className="bg-[#FEFDFB] rounded-2xl border border-[#EAE4D8] p-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-black uppercase tracking-wider text-[#14231B]">
                      {t.asOfDateLabel}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-[#0F3E2E] bg-[#E8F3EC] px-3 py-1 rounded-full border border-[#BDE0CB]">
                    {selectedAsOfDate || "Current"}
                  </span>
                </div>

                {availableAsOfDates.length > 0 && (
                  <select
                    value={selectedAsOfDate}
                    onChange={(e) => {
                      setSelectedAsOfDate(e.target.value);
                      setShowReplay(false);
                    }}
                    className="w-full bg-[#FAF8F3] border border-[#DCD3C3] rounded-xl px-3 py-2 text-xs font-bold text-[#14231B] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    {availableAsOfDates.map((d) => (
                      <option key={d} value={d}>
                        {d} (Historical Mandi Point)
                      </option>
                    ))}
                  </select>
                )}
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

              {/* Time-Machine Historical Replay */}
              <ReplayReveal
                showReplay={showReplay}
                onToggle={() => setShowReplay(!showReplay)}
                gain={computedVerdict.gain}
                qtyKg={qtyKg}
                lang={lang}
              />

              {/* Windows Table */}
              <WindowsTable
                windows={computedVerdict.windows}
                horizons={activeEvaluation?.horizons || []}
                todayPrice={todayMandiPrice}
                bestStep={computedVerdict.bestStep}
              />

              {/* Holding Cost Assumption Sliders */}
              <AssumptionSliders
                storage={storageCost}
                spoil={spoilRate}
                rate={financeRate}
                transport={transportCost}
                onChangeStorage={setStorageCost}
                onChangeSpoil={setSpoilRate}
                onChangeRate={setFinanceRate}
                onChangeTransport={setTransportCost}
                lang={lang}
              />

              {/* Economic Explanation */}
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
