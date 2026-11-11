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
import { CropKey, MarketKey, MarketRecord, ForecastEntry, AsOfEvaluation } from "@/lib/types";
import { computeVerdict } from "@/lib/advice";
import { Sprout, Calendar, MapPin, Scale, RefreshCw } from "lucide-react";

export default function FarmerPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("en");
  const t = DICTIONARY[lang];
  const isUrdu = lang === "ur";

  // Selections
  const [selectedCrop, setSelectedCrop] = useState<CropKey>("tomato");
  const [selectedMarket, setSelectedMarket] = useState<MarketKey>("lahore_badami_bagh");
  const [qtyKg, setQtyKg] = useState<number>(3500);
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
        const [fRes, sRes, mRes] = await Promise.all([
          fetch("/data/forecasts.json"),
          fetch("/data/series_compact.json"),
          fetch("/data/markets.json"),
        ]);
        const fJson = await fRes.json();
        const sJson = await sRes.json();
        const mJson = await mRes.json();

        setForecastsData(fJson);
        setSeriesData(sJson);
        setMarketsData(mJson);

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
    if (!activeEvaluation) {
      return {
        verdict: "Sell Now" as const,
        verdict_ur: "ابھی فروخت کریں",
        bestStep: 0,
        gain: 0,
        gainPercent: 0,
        windows: [],
        recommendedPrice: 65,
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
  }, [activeEvaluation, spoilRate, storageCost, financeRate, transportCost]);

  // Trigger Gemini Econometric Explanation
  const fetchExplanation = useCallback(async () => {
    if (!activeEvaluation) return;
    setExplainLoading(true);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: selectedCrop,
          cropName: selectedCrop.toUpperCase(),
          cropNameUr: selectedCrop === "tomato" ? "ٹماٹر" : selectedCrop === "onion" ? "پیاز" : "آلو",
          market: selectedMarket,
          marketName: marketsData[selectedMarket]?.name || selectedMarket,
          marketNameUr: marketsData[selectedMarket]?.name_ur || selectedMarket,
          currentPrice: activeEvaluation.current_price,
          verdict: computedVerdict.verdict,
          bestStep: computedVerdict.bestStep,
          gain: computedVerdict.gain,
          storageCost,
          spoilRate: Math.round(spoilRate * 1000) / 10,
          arrivals: activeEvaluation.daily_arrivals,
          demand: activeEvaluation.daily_demand,
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

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Title & Context bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Sprout className="w-7 h-7 text-emerald-600" />
              <span>{isUrdu ? "کسان کونسل اور پیشگوئی ڈیش بورڈ" : "Predictive Harvest & Sale Advisory"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Empirical multi-horizon quantiles, post-harvest cost modeling, and historical Time-Machine replay.
            </p>
          </div>
        </div>

        {/* Inputs Control Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Crop Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.cropLabel}</span>
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value as CropKey)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="tomato">Tomato / ٹماٹر (Perishable)</option>
                <option value="onion">Onion / پیاز (Semi-perishable)</option>
                <option value="potato">Potato / آلو (Storage crop)</option>
                <option value="wheat">Wheat / گندم (Staple grain)</option>
                <option value="rice_basmati">Basmati Rice / باسمتی چاول (Export grain)</option>
              </select>
            </div>

            {/* Market Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.marketLabel}</span>
              </label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value as MarketKey)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="lahore_badami_bagh">Lahore (Badami Bagh Mandi)</option>
                <option value="multan_ghalla">Multan (Ghalla Mandi)</option>
                <option value="faisalabad_gole">Faisalabad (Gole Mandi)</option>
                <option value="karachi_superhighway">Karachi (Super Highway Mandi)</option>
                <option value="rawalpindi_i11">Rawalpindi / Islamabad (I-11 Mandi)</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.qtyLabel}</span>
              </label>
              <input
                type="number"
                min={500}
                max={50000}
                step={500}
                value={qtyKg}
                onChange={(e) => setQtyKg(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* As-Of Date Selector (Time Machine) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.asOfDateLabel}</span>
              </label>
              <select
                value={selectedAsOfDate}
                onChange={(e) => setSelectedAsOfDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {availableAsOfDates.map((d) => (
                  <option key={d} value={d}>
                    {d} (Historical Mandi Point)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Verdict Card */}
        <VerdictCard
          verdict={computedVerdict}
          lang={lang}
          onListProduce={handleListProduce}
        />

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

        {/* Gemini Explanation Panel */}
        <ExplainPanel
          explanation={explanation}
          isLoading={explainLoading}
          onRefresh={fetchExplanation}
          lang={lang}
        />
      </main>
    </div>
  );
}
