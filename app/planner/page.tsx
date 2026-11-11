"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { Language, DICTIONARY } from "@/lib/i18n";
import {
  computeCropPlan,
  SeasonKey,
  WaterSourceKey,
  CropRecommendation,
  CostBreakdown,
} from "@/lib/planner";
import {
  Sprout,
  Calendar,
  Sparkles,
  TrendingUp,
  Droplets,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Coins,
  Scale,
  Award,
  CheckCircle2,
  PieChart,
} from "lucide-react";

export default function PlannerPage() {
  // Synchronized language state
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

  // Farmer Inputs
  const [season, setSeason] = useState<SeasonKey>("rabi");
  const [acres, setAcres] = useState<number>(5);
  const [waterSource, setWaterSource] = useState<WaterSourceKey>("canal");
  const [region, setRegion] = useState<string>("Central Punjab (Lahore, Gujranwala, Faisalabad)");
  const [expandedCostCrop, setExpandedCostCrop] = useState<string | null>(null);

  // Audio Playback
  const [activeVoiceLang, setActiveVoiceLang] = useState<"ur" | "en" | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Compute recommendations
  const recommendations = useMemo(() => {
    return computeCropPlan({
      season,
      acres,
      waterSource,
      region,
    });
  }, [season, acres, waterSource, region]);

  const topCrop: CropRecommendation | undefined = recommendations[0];

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setActiveVoiceLang(null);
  };

  const playVoice = (targetLang: "ur" | "en") => {
    if (activeVoiceLang === targetLang) {
      stopAudio();
      return;
    }

    stopAudio();
    if (!topCrop) return;

    let textToSpeak = "";
    if (targetLang === "ur") {
      textToSpeak = `السلام علیکم کسان بھائی! آپ کے ${acres} ایکڑ رقبے کے لیے، آنے والے ${topCrop.season_ur} سیزن میں سب سے زیادہ منافع بخش فصل ${topCrop.name_ur} ہے۔ اس کی متوقع منڈی قیمت ${topCrop.expectedHarvestPricePerMaund} روپے فی من ہوگی۔ کل متوقع لاگت تقریباً ${topCrop.totalCostPkr.toLocaleString()} روپے اور متوقع خالص منافع ${topCrop.totalNetProfitPkr.toLocaleString()} روپے ہوگا، جس سے ${topCrop.roiPercent} فیصد منافع مل سکتا ہے۔`;
    } else {
      textToSpeak = `Hello respected farmer. For your ${acres} acres in the upcoming ${topCrop.season} season, the highest projected profit crop is ${topCrop.name_en}. The expected harvest price is ₨ ${topCrop.expectedHarvestPricePerMaund} per maund. Estimated total cost is ₨ ${topCrop.totalCostPkr.toLocaleString()} and your projected net profit is ₨ ${topCrop.totalNetProfitPkr.toLocaleString()}, delivering a ${topCrop.roiPercent}% return on investment.`;
    }

    setActiveVoiceLang(targetLang);

    try {
      const audioUrl = `/api/voice?lang=${targetLang}&text=${encodeURIComponent(textToSpeak)}`;
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);

      audio.onended = () => {
        setActiveVoiceLang(null);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        fallbackSpeechSynthesis(textToSpeak, targetLang);
      };

      audio.play().catch(() => {
        fallbackSpeechSynthesis(textToSpeak, targetLang);
      });
    } catch {
      fallbackSpeechSynthesis(textToSpeak, targetLang);
    }
  };

  const fallbackSpeechSynthesis = (text: string, targetLang: "ur" | "en") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setActiveVoiceLang(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang === "ur" ? "ur-PK" : "en-US";
    utterance.rate = 0.92;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) =>
      targetLang === "ur"
        ? v.lang.startsWith("ur") || v.name.toLowerCase().includes("urdu") || v.lang.startsWith("hi")
        : v.lang.startsWith("en")
    );
    if (match) utterance.voice = match;

    utterance.onend = () => setActiveVoiceLang(null);
    utterance.onerror = () => setActiveVoiceLang(null);

    window.speechSynthesis.speak(utterance);
  };

  const toggleCostDetails = (cropKey: string) => {
    setExpandedCostCrop(expandedCostCrop === cropKey ? null : cropKey);
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 px-3.5 py-1 rounded-full text-xs font-bold text-amber-300 border border-emerald-600/50 mb-2.5">
              <Calendar className="w-4 h-4" />
              <span>{isUrdu ? "مستقبل کی فصل منصوبہ بندی • پیشگوئی برائے اگلی سہ ماہی" : "Next-Quarter Predictive Crop Planning Engine"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              {t.plannerTitle}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200 mt-2 max-w-2xl font-medium">
              {t.plannerSubtitle}
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-emerald-950/80 px-4 py-2.5 rounded-2xl border border-emerald-700/60 text-xs font-bold text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isUrdu ? "زرعی تحقیقاتی کونسل (PARC) مصدقہ اخراجات" : "PARC & Punjab Extension Verified Budgets"}</span>
          </div>
        </div>

        {/* INPUTS ROW: Season, Acres, Water, Region */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          
          {/* 1. Seasons Selection Tabs */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2.5">
              {t.seasonLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSeason("rabi")}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  season === "rabi"
                    ? "border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20 text-emerald-950"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700"
                }`}
              >
                <span className="text-3xl">❄️</span>
                <div className="text-left">
                  <div className="font-extrabold text-sm sm:text-base">
                    {isUrdu ? "ربیع سیزن (سردیاں)" : "Rabi Season (Winter)"}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {isUrdu ? "گندم، پیاز، آلو، سرسوں" : "Wheat, Onion, Potato, Canola"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSeason("kharif")}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  season === "kharif"
                    ? "border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20 text-emerald-950"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700"
                }`}
              >
                <span className="text-3xl">☀️</span>
                <div className="text-left">
                  <div className="font-extrabold text-sm sm:text-base">
                    {isUrdu ? "خریف سیزن (گرمیاں)" : "Kharif Season (Summer)"}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {isUrdu ? "باسمتی چاول، کپاس، ٹماٹر" : "Basmati Rice, Cotton, Tomato"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSeason("zaid_spring")}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  season === "zaid_spring"
                    ? "border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20 text-emerald-950"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700"
                }`}
              >
                <span className="text-3xl">🌸</span>
                <div className="text-left">
                  <div className="font-extrabold text-sm sm:text-base">
                    {isUrdu ? "بہاریہ سیزن (درمیانی سہ ماہی)" : "Zaid / Spring Season"}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {isUrdu ? "بہاریہ مکئی، سورج مکھی" : "Spring Maize, Sunflower"}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Acres & Water Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 border-t border-slate-200">
            
            {/* Acres Selector (7 cols) */}
            <div className="lg:col-span-7">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                {t.landLabel}
              </label>
              
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {[1, 2, 5, 10, 25].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAcres(a)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      acres === a
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-2xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {a} {isUrdu ? "ایکڑ" : "Acres"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="number"
                  min={0.5}
                  max={500}
                  step={0.5}
                  value={acres}
                  onChange={(e) => setAcres(Math.max(0.5, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-600 shrink-0">
                  {isUrdu ? "ایکڑ رقبہ" : "Acres of Farmland"}
                </span>
              </div>
            </div>

            {/* Water Source & Region (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-teal-600" />
                  <span>{t.waterLabel}</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWaterSource("canal")}
                    className={`p-2 rounded-xl text-[11px] font-bold border text-center transition-all ${
                      waterSource === "canal"
                        ? "bg-teal-700 text-white border-teal-700 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isUrdu ? "نہری پانی" : "Canal"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterSource("tubewell")}
                    className={`p-2 rounded-xl text-[11px] font-bold border text-center transition-all ${
                      waterSource === "tubewell"
                        ? "bg-teal-700 text-white border-teal-700 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isUrdu ? "ٹیوب ویل" : "Tube-well"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterSource("rainfed")}
                    className={`p-2 rounded-xl text-[11px] font-bold border text-center transition-all ${
                      waterSource === "rainfed"
                        ? "bg-teal-700 text-white border-teal-700 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isUrdu ? "بارانی" : "Rainfed"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                  {isUrdu ? "علاقہ / زرعی زون" : "Agro-Ecological Region"}
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Central Punjab (Lahore, Gujranwala, Faisalabad)">Central Punjab (Lahore, Gujranwala, Faisalabad)</option>
                  <option value="South Punjab (Multan, Bahawalpur, Khanewal)">South Punjab (Multan, Bahawalpur, Khanewal)</option>
                  <option value="Sindh (Hyderabad, Sukkur, Larkana)">Sindh (Hyderabad, Sukkur, Larkana)</option>
                  <option value="Northern Punjab / KP (Rawalpindi, Attock, Peshawar)">Northern Punjab / KP (Rawalpindi, Attock)</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* HERO CARD: #1 RECOMMENDED CROP */}
        {topCrop && (
          <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-amber-50/90 via-white to-emerald-50/50 p-6 sm:p-8 shadow-md">
            
            {/* Top Bar with Audio Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
                  <Award className="w-4 h-4" />
                  <span>{isUrdu ? "🥇 نمبر 1 سب سے زیادہ منافع بخش فصل" : "🥇 #1 Top Recommendation"}</span>
                </span>

                <span className="inline-flex items-center gap-1 text-xs text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full font-bold shadow-2xs">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+{topCrop.roiPercent}% ROI</span>
                </span>
              </div>

              {/* 🔊 Voice Audio Buttons (Urdu & English) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playVoice("ur")}
                  type="button"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all shadow-sm active:scale-95 ${
                    activeVoiceLang === "ur"
                      ? "bg-emerald-700 text-white ring-2 ring-emerald-400 animate-pulse"
                      : "bg-emerald-900 hover:bg-emerald-800 text-white"
                  }`}
                >
                  {activeVoiceLang === "ur" ? (
                    <>
                      <VolumeX className="w-4 h-4 text-amber-300" />
                      <span>⏹ آواز بند کریں</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-amber-300" />
                      <span>🔊 مشورہ اردو میں سنیں</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => playVoice("en")}
                  type="button"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
                    activeVoiceLang === "en"
                      ? "bg-indigo-700 text-white ring-2 ring-indigo-400 animate-pulse"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {activeVoiceLang === "en" ? (
                    <>
                      <VolumeX className="w-4 h-4 text-indigo-300" />
                      <span>⏹ Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-slate-300" />
                      <span>🔊 English Voice</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Title & Calculations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3">
                  <span className="text-4xl sm:text-5xl">{topCrop.emoji}</span>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                      {isUrdu ? topCrop.name_ur : topCrop.name_en}
                    </h2>
                    <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                      {isUrdu ? topCrop.name_en : topCrop.name_ur} &bull; {topCrop.season_ur}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                  {isUrdu ? topCrop.rationale_ur : topCrop.rationale_en}
                </p>

                {/* Sowing & Harvest calendar pills */}
                <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs font-bold">
                  <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 flex items-center gap-1.5 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isUrdu ? `بجائی: ${topCrop.sowingWindow_ur}` : `Sowing: ${topCrop.sowingWindow_en}`}</span>
                  </span>
                  <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 flex items-center gap-1.5 shadow-2xs">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isUrdu ? `کٹائی: ${topCrop.harvestWindow_ur}` : `Harvest: ${topCrop.harvestWindow_en}`}</span>
                  </span>
                  <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 flex items-center gap-1.5 shadow-2xs">
                    <Droplets className="w-3.5 h-3.5 text-teal-600" />
                    <span>{isUrdu ? topCrop.waterRequirement_ur : topCrop.waterRequirement_en}</span>
                  </span>
                </div>
              </div>

              {/* Right Big Rupee Numbers */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {/* Total Expected Profit */}
                <div className="col-span-2 bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-4 shadow-sm">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200">
                    {isUrdu ? `آپ کے ${acres} ایکڑ پر متوقع خالص منافع:` : `Projected Net Profit on ${acres} Acres:`}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-amber-300 mt-1">
                    +₨ {topCrop.totalNetProfitPkr.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-200 font-bold mt-1">
                    +₨ {topCrop.netProfitPerAcre.toLocaleString()} {isUrdu ? "فی ایکڑ خالص بچت" : "/acre net profit"}
                  </div>
                </div>

                {/* Total Investment Cost */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    {isUrdu ? "متوقع کل لاگت" : "Total Investment"}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    ₨ {topCrop.totalCostPkr.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold">
                    ₨ {topCrop.costPerAcre.toLocaleString()}/ایکڑ
                  </div>
                </div>

                {/* Expected Harvest Price */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    {isUrdu ? "متوقع منڈی ریٹ" : "Harvest Mandi Rate"}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">
                    ₨ {topCrop.expectedHarvestPricePerMaund.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500">/من</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold">
                    ₨ {topCrop.expectedHarvestPricePerKg}/kg
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown Drawer Button */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-semibold">
                {isUrdu ? "بیج، ڈی اے پی کھاد، یوریا، ڈیزل اور مزدوری کا مکمل بجٹ دیکھیں:" : "Inspect official per-acre seed, fertilizer, and irrigation cost budget:"}
              </span>

              <button
                type="button"
                onClick={() => toggleCostDetails(topCrop.cropKey)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 rounded-xl text-xs font-extrabold shadow-2xs transition-all"
              >
                <span>{expandedCostCrop === topCrop.cropKey ? t.hideDetails : t.viewDetails}</span>
                {expandedCostCrop === topCrop.cropKey ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Expanded Cost Breakdown Table */}
            {expandedCostCrop === topCrop.cropKey && (
              <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>{t.costBreakdownTitle} ({isUrdu ? topCrop.name_ur : topCrop.name_en})</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">{isUrdu ? "بیج (Seed)" : "Seed"}</div>
                    <div className="font-extrabold text-slate-900 mt-1">₨ {topCrop.costBreakdown.seedPkr.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">{isUrdu ? "ڈی اے پی کھاد" : "DAP Fertilizer"}</div>
                    <div className="font-extrabold text-slate-900 mt-1">₨ {topCrop.costBreakdown.dapFertilizerPkr.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">{isUrdu ? "یوریا کھاد" : "Urea Fertilizer"}</div>
                    <div className="font-extrabold text-slate-900 mt-1">₨ {topCrop.costBreakdown.ureaFertilizerPkr.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">{isUrdu ? "آبپاشی و ایندھن" : "Irrigation & Fuel"}</div>
                    <div className="font-extrabold text-slate-900 mt-1">₨ {topCrop.costBreakdown.irrigationFuelPkr.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold">{isUrdu ? "سپرے و مزدوری" : "Pest & Labor"}</div>
                    <div className="font-extrabold text-slate-900 mt-1">₨ {topCrop.costBreakdown.pesticideLaborPkr.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] text-emerald-800 font-bold">{isUrdu ? "کل فی ایکڑ" : "Total / Acre"}</div>
                    <div className="font-black text-emerald-900 mt-1">₨ {topCrop.costBreakdown.totalPerAcrePkr.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* COMPARISON OF ALL CROPS FOR THIS SEASON */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {isUrdu ? "تمام متبادل فصلوں کا موازنہ و رینکنگ" : "Compare All Next-Quarter Crop Options"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isUrdu ? "فی ایکڑ لاگت، متوقع پیداوار اور منافع کا جامع تجزیہ" : "Ranked by net financial profit per acre"}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {recommendations.length} {isUrdu ? "فصلیں زیر غور" : "Crops Evaluated"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => {
              const isTop = rec.rank === 1;
              const isExpanded = expandedCostCrop === rec.cropKey;

              return (
                <div
                  key={rec.cropKey}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                    isTop
                      ? "border-emerald-500 bg-emerald-50/30 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div>
                    {/* Header with rank badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{rec.emoji}</span>
                        <div>
                          <div className="font-extrabold text-slate-900 text-base">
                            {isUrdu ? rec.name_ur : rec.name_en}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {isUrdu ? rec.name_en : rec.name_ur}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                          isTop
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        #{rec.rank} {isUrdu ? rec.badge_ur : rec.badge_en}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium mt-2 mb-4">
                      {isUrdu ? rec.rationale_ur : rec.rationale_en}
                    </p>

                    {/* Financial Metric Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-semibold">{isUrdu ? "فی ایکڑ خرچ" : "Cost / Acre"}</div>
                        <div className="font-black text-slate-900 mt-0.5">₨ {rec.costPerAcre.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-semibold">{isUrdu ? "متوقع ریٹ" : "Harvest Price"}</div>
                        <div className="font-black text-slate-900 mt-0.5">₨ {rec.expectedHarvestPricePerMaund}/من</div>
                      </div>
                      <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                        <div className="text-[10px] text-emerald-800 font-semibold">{isUrdu ? "خالص منافع" : "Net Profit"}</div>
                        <div className="font-black text-emerald-900 mt-0.5">+₨ {rec.netProfitPerAcre.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Total for your farm */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">{isUrdu ? `آپ کے ${acres} ایکڑ پر کل منافع:` : `Total for ${acres} Acres:`}</span>
                      <span className="text-emerald-800 text-sm font-black">+₨ {rec.totalNetProfitPkr.toLocaleString()} ({rec.roiPercent}% ROI)</span>
                    </div>
                  </div>

                  {/* Sowing timing & cost drawer button */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px] font-semibold">
                      {isUrdu ? `کٹائی: ${rec.harvestWindow_ur}` : `Harvest: ${rec.harvestWindow_en}`}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleCostDetails(rec.cropKey)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>{isExpanded ? t.hideDetails : t.viewDetails}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block">بیج:</span>
                        <strong className="text-slate-900">₨ {rec.costBreakdown.seedPkr.toLocaleString()}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block">کھادیں:</span>
                        <strong className="text-slate-900">₨ {(rec.costBreakdown.dapFertilizerPkr + rec.costBreakdown.ureaFertilizerPkr).toLocaleString()}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block">پانی و ایندھن:</span>
                        <strong className="text-slate-900">₨ {rec.costBreakdown.irrigationFuelPkr.toLocaleString()}</strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI AGRONOMIST DIVERSIFICATION ADVISORY */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              {isUrdu ? "زرعی ماہر کی خصوصی حکمت عملی (AI Agronomist Strategy)" : "AI Agronomist Farmland Allocation Strategy"}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-indigo-200 font-medium leading-relaxed max-w-3xl mb-5">
            {isUrdu
              ? `اگر آپ کے پاس ${acres} ایکڑ رقبہ ہے تو تمام رقبہ صرف ایک ہی فصل پر نہ لگائیں۔ رسک کم کرنے اور نقد رقم کا توازن قائم رکھنے کے لیے ہمارے زرعی ماہر کا مشورہ ہے:`
              : `To mitigate agricultural price volatility and drought risks across your ${acres} acres, our agronomist engine recommends a balanced portfolio allocation:`}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              <div className="flex items-center gap-2 mb-1.5">
                <PieChart className="w-4 h-4 text-amber-400" />
                <h4 className="font-extrabold text-sm text-white">
                  {isUrdu ? "65% رقبہ: ہائی ویلیو کیش کراپ" : "65% Land: High-Value Cash Crop"}
                </h4>
              </div>
              <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                {isUrdu
                  ? `${Math.round(acres * 0.65 * 10) / 10} ایکڑ پر ${topCrop ? topCrop.name_ur : "پیاز یا آلو"} لگائیں تاکہ آپ کو زیادہ سے زیادہ نقد منافع مل سکے۔`
                  : `Dedicate ${Math.round(acres * 0.65 * 10) / 10} acres to ${topCrop ? topCrop.name_en : "Onion / Potato"} to maximize total cash generation.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="font-extrabold text-sm text-white">
                  {isUrdu ? "35% رقبہ: محفوظ بنیادی اناج" : "35% Land: Food Security Staple"}
                </h4>
              </div>
              <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                {isUrdu
                  ? `${Math.round(acres * 0.35 * 10) / 10} ایکڑ پر گندم یا سرسوں رکھیں تاکہ مارکیٹ کے اتار چڑھاؤ سے تحفظ رہے اور گھریلو ضروریات پوری ہوں۔`
                  : `Dedicate ${Math.round(acres * 0.35 * 10) / 10} acres to Wheat or Canola for zero-risk floor price safety and family grain consumption.`}
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
