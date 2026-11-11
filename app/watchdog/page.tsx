"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import SpreadChart from "@/components/SpreadChart";
import DecompositionBar from "@/components/DecompositionBar";
import { Language, DICTIONARY } from "@/lib/i18n";
import { CropKey, MarketKey, MarketRecord } from "@/lib/types";
import { decomposeSpread, SpreadDecomposition } from "@/lib/spread";
import { ShieldAlert, AlertTriangle, Filter, Info, Sprout, MapPin } from "lucide-react";

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
    <div className={`min-h-screen bg-slate-50 flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Middleman Anomaly Monitor
            </span>
            <span className="text-xs text-slate-500">Autonomous Cartel Detection</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isUrdu ? "آڑھتی و درمیانی منافع خوری واچ ڈاگ" : "Farmgate-to-Retail Spread Watchdog"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Flags price gouging where retail consumer prices spike while farmer farmgate remuneration stays depressed.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-700">Crop:</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value as CropKey)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900"
            >
              <option value="tomato">Tomato / ٹماٹر</option>
              <option value="onion">Onion / پیاز</option>
              <option value="potato">Potato / آلو</option>
              <option value="wheat">Wheat / گندم</option>
              <option value="rice_basmati">Basmati Rice / چاول</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-700">Market Hub:</span>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value as MarketKey)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900"
            >
              <option value="lahore_badami_bagh">Lahore (Badami Bagh)</option>
              <option value="multan_ghalla">Multan (Ghalla Mandi)</option>
              <option value="faisalabad_gole">Faisalabad (Gole Mandi)</option>
              <option value="karachi_superhighway">Karachi (Super Highway)</option>
              <option value="rawalpindi_i11">Rawalpindi / Islamabad</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className="text-slate-500">Flagged Anomalies:</span>
            <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {anomalyEpisodes.length} Episodes
            </span>
          </div>
        </div>

        {/* Spread Chart */}
        <SpreadChart
          records={filteredRecords}
          onSelectRecord={setSelectedRecord}
          selectedDate={selectedRecord?.date}
        />

        {/* Decomposition Bar for Selected Record */}
        {selectedRecord && activeDecomposition && (
          <DecompositionBar
            decomposition={activeDecomposition}
            date={selectedRecord.date}
            cropName={selectedRecord.crop_name}
            marketName={selectedRecord.market_name}
          />
        )}

        {/* Anomaly Episode Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              Detected Spread Discrepancies &amp; Gouging Episodes
            </h3>
            <span className="text-xs text-slate-500">
              Residual exceeds rolling P90 threshold
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Farmgate Paid</th>
                  <th className="py-2.5 px-4">Wholesale Mandi</th>
                  <th className="py-2.5 px-4">Retail City Price</th>
                  <th className="py-2.5 px-4">Actual Spread</th>
                  <th className="py-2.5 px-4">Normal Benchmark</th>
                  <th className="py-2.5 px-4">Unexplained Gap</th>
                  <th className="py-2.5 px-4">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {anomalyEpisodes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400">
                      No cartel anomalies detected for this crop-mandi pair. Spreads are competitive.
                    </td>
                  </tr>
                ) : (
                  anomalyEpisodes.map((rec) => {
                    const decomp = decomposeSpread(rec);
                    const isSelected = selectedRecord?.date === rec.date;
                    return (
                      <tr
                        key={rec.date}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                          isSelected ? "bg-rose-50/60 font-semibold" : ""
                        }`}
                        onClick={() => setSelectedRecord(rec)}
                      >
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                          {rec.date}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-emerald-700">
                          ₨ {rec.farmgate_price}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-700">
                          ₨ {rec.wholesale_price}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-indigo-700">
                          ₨ {rec.retail_price}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                          ₨ {rec.spread_pkr}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">
                          ₨ {rec.normal_spread_pkr}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-rose-600">
                          +₨ {decomp.unexplainedSurplusPkr} ({decomp.unexplainedSurplusPct}%)
                        </td>
                        <td className="py-2.5 px-4">
                          <button
                            onClick={() => setSelectedRecord(rec)}
                            className="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded text-[11px] font-semibold"
                          >
                            Inspect
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
