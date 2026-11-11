"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import SpreadChart from "@/components/SpreadChart";
import DecompositionBar from "@/components/DecompositionBar";
import { Language, DICTIONARY } from "@/lib/i18n";
import { CropKey, MarketKey, MarketRecord } from "@/lib/types";
import { decomposeSpread, SpreadDecomposition } from "@/lib/spread";
import { ShieldAlert, Sprout, MapPin, Scale, Search, ShieldCheck } from "lucide-react";

export default function WatchdogPage() {
  const [lang, setLang] = useState<Language>("ur");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferred_lang") as Language;
      if (saved === "en" || saved === "ur") setLang(saved);
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

  const [selectedCrop, setSelectedCrop] = useState<CropKey>("tomato");
  const [selectedMarket, setSelectedMarket] = useState<MarketKey>("lahore_badami_bagh");
  const [seriesData, setSeriesData] = useState<MarketRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MarketRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSeries() {
      try {
        setLoading(true);
        const res = await fetch("/data/series_compact.json");
        const json = await res.json();
        setSeriesData(json);
      } catch (err) {
        console.error("Failed to load watchdog data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSeries();
  }, []);

  // Filter series for selected crop and market
  const filteredRecords = useMemo(() => {
    return seriesData.filter(
      (r) => r.crop === selectedCrop && r.market === selectedMarket
    );
  }, [seriesData, selectedCrop, selectedMarket]);

  // Detected anomaly episodes
  const anomalyEpisodes = useMemo(() => {
    return filteredRecords.filter((r) => r.is_anomaly);
  }, [filteredRecords]);

  // Set default selected record when filtered records change
  useEffect(() => {
    if (anomalyEpisodes.length > 0) {
      setSelectedRecord(anomalyEpisodes[anomalyEpisodes.length - 1]);
    } else if (filteredRecords.length > 0) {
      setSelectedRecord(filteredRecords[filteredRecords.length - 1]);
    }
  }, [filteredRecords, anomalyEpisodes]);

  const activeDecomposition: SpreadDecomposition | null = useMemo(() => {
    if (!selectedRecord) return null;
    return decomposeSpread(selectedRecord);
  }, [selectedRecord]);

  return (
    <div className={`min-h-screen bg-[#FAF7F2] text-[#1E2621] flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-[#FEE2E2] text-[#991B1B] px-3 py-1 rounded-full border border-[#FECACA]">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>{isUrdu ? "آڑھتی کٹوتی و منافع مانیٹر" : "Middleman Spread Monitor"}</span>
            </span>
            <span className="text-xs text-[#55695C] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Statistical Spread Audit</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#14231B] tracking-tight">
            {t.watchdogTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#55695C] mt-1 max-w-2xl font-medium">
            {t.watchdogSubtitle}
          </p>
        </div>

        {/* Filter Controls (Warm Cream Surface) */}
        <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-4 sm:p-5 shadow-xs flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-[#14231B]">{isUrdu ? "فصل:" : "Crop:"}</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value as CropKey)}
              className="bg-[#FAF8F3] border border-[#DCD3C3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#14231B] focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="tomato">Tomato / ٹماٹر</option>
              <option value="onion">Onion / پیاز</option>
              <option value="potato">Potato / آلو</option>
              <option value="wheat">Wheat / گندم</option>
              <option value="rice_basmati">Basmati Rice / چاول</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-[#14231B]">{isUrdu ? "منڈی ہب:" : "Market Hub:"}</span>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value as MarketKey)}
              className="bg-[#FAF8F3] border border-[#DCD3C3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#14231B] focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="lahore_badami_bagh">Lahore (Badami Bagh)</option>
              <option value="multan_ghalla">Multan (Ghalla Mandi)</option>
              <option value="faisalabad_gole">Faisalabad (Gole Mandi)</option>
              <option value="karachi_superhighway">Karachi (Super Highway)</option>
              <option value="rawalpindi_i11">Rawalpindi / Islamabad</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className="text-[#55695C] font-semibold">{isUrdu ? "نشان زدہ غیر معمولی منافع:" : "Flagged Episodes:"}</span>
            <span className="font-black text-[#991B1B] bg-[#FEE2E2] px-3 py-1 rounded-full border border-[#FECACA]">
              {anomalyEpisodes.length} {isUrdu ? "واقعات" : "Episodes"}
            </span>
          </div>
        </div>

        {/* Spread Chart */}
        <SpreadChart
          records={filteredRecords}
          onSelectRecord={setSelectedRecord}
          selectedDate={selectedRecord?.date}
          lang={lang}
        />

        {/* Decomposition Bar for Selected Record */}
        {selectedRecord && activeDecomposition && (
          <DecompositionBar
            decomposition={activeDecomposition}
            date={selectedRecord.date}
            cropName={selectedRecord.crop_name}
            marketName={selectedRecord.market_name}
            lang={lang}
          />
        )}

        {/* Anomaly Episode Table */}
        <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] overflow-hidden shadow-xs">
          <div className="px-5 py-4 bg-[#FAF8F3] border-b border-[#EAE4D8] flex items-center justify-between">
            <h3 className="font-black text-[#14231B] text-sm sm:text-base">
              {isUrdu ? "غیر معمولی منافع خوری و قیمتوں کا تفصیلی ریکارڈ" : "Detected Spread Discrepancies & Gouging Episodes"}
            </h3>
            <span className="text-xs text-[#55695C] font-semibold">
              {isUrdu ? "اضافی منافع مارجن پی 90 حد سے تجاوز کرتا ہے" : "Residual exceeds rolling P90 threshold"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" dir={isUrdu ? "rtl" : "ltr"}>
              <thead className="bg-[#FAF8F3] text-[#55695C] font-bold border-b border-[#EAE4D8]">
                <tr>
                  <th className="py-3 px-4">{isUrdu ? "تاریخ" : "Date"}</th>
                  <th className="py-3 px-4">{isUrdu ? "کسان کو ملا" : "Farmgate Paid"}</th>
                  <th className="py-3 px-4">{isUrdu ? "ہول سیل منڈی" : "Wholesale Mandi"}</th>
                  <th className="py-3 px-4">{isUrdu ? "شہری ریٹیل قیمت" : "Retail City Price"}</th>
                  <th className="py-3 px-4">{isUrdu ? "حقیقی فرق" : "Actual Spread"}</th>
                  <th className="py-3 px-4">{isUrdu ? "معمول کا فرق" : "Normal Benchmark"}</th>
                  <th className="py-3 px-4">{isUrdu ? "غیر معمولی خلا" : "Unexplained Gap"}</th>
                  <th className="py-3 px-4">{isUrdu ? "کارروائی" : "Inspect"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE4D8]">
                {anomalyEpisodes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#7A8C80] font-medium">
                      {isUrdu
                        ? "اس فصل اور منڈی کے جوڑے میں کوئی غیر معمولی کٹوتی نہیں پائی گئی۔ مارجن مسابقتی ہے۔"
                        : "No cartel anomalies detected for this crop-mandi pair. Spreads are competitive."}
                    </td>
                  </tr>
                ) : (
                  anomalyEpisodes.map((rec) => {
                    const decomp = decomposeSpread(rec);
                    const isSelected = selectedRecord?.date === rec.date;
                    return (
                      <tr
                        key={rec.date}
                        className={`hover:bg-[#FAF8F3] cursor-pointer transition-colors ${
                          isSelected ? "bg-[#FFF1F2] font-semibold" : ""
                        }`}
                        onClick={() => setSelectedRecord(rec)}
                      >
                        <td className="py-3 px-4 font-mono font-medium text-[#14231B]" dir="ltr">
                          {rec.date}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#0F3E2E]" dir="ltr">
                          ₨ {rec.farmgate_price}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#2A3B30]" dir="ltr">
                          ₨ {rec.wholesale_price}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#3730A3]" dir="ltr">
                          ₨ {rec.retail_price}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#14231B]" dir="ltr">
                          ₨ {rec.spread_pkr}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#55695C]" dir="ltr">
                          ₨ {rec.normal_spread_pkr}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#991B1B]" dir="ltr">
                          +₨ {decomp.unexplainedSurplusPkr} ({decomp.unexplainedSurplusPct}%)
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedRecord(rec)}
                            className="px-3 py-1 bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] rounded-lg text-xs font-bold border border-[#FECACA]"
                          >
                            {isUrdu ? "جائزہ" : "Inspect"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
