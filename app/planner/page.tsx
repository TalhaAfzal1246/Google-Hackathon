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
  TrendingUp,
  Droplets,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Coins,
  Scale,
  Award,
  CheckCircle2,
  PieChart,
  ArrowRight,
  ArrowLeft,
  Building2,
  Layers,
  Snowflake,
  Sun,
  Flower2,
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
  const ArrowIcon = isUrdu ? ArrowLeft : ArrowRight;

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

    const spokenText =
      targetLang === "ur"
        ? `کسان بھائی! اگلی سہ ماہی کے لیے آپ کے ${acres} ایکڑ پر سب سے زیادہ منافع بخش فصل ${topCrop.name_ur} ہے۔ اس سے فی ایکڑ متوقع خالص منافع ₨ ${topCrop.netProfitPerAcre.toLocaleString()} بنے گا، اور آپ کے کل رقبے پر متوقع خالص بچت ₨ ${topCrop.totalNetProfitPkr.toLocaleString()} متوقع ہے۔`
        : `Crop planning recommendation: For your ${acres} acres next season, the highest profit crop is ${topCrop.name_en}. Projected net profit is PKR ${topCrop.netProfitPerAcre.toLocaleString()} per acre, yielding a total projected return of PKR ${topCrop.totalNetProfitPkr.toLocaleString()}.`;

    setActiveVoiceLang(targetLang);

    // Primary: Google Neural Voice API
    try {
      const audioUrl = `/api/voice?lang=${targetLang}&text=${encodeURIComponent(spokenText)}`;
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);

      audio.onended = () => {
        setActiveVoiceLang(null);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        fallbackSpeechSynthesis(spokenText, targetLang);
      };

      audio.play().catch(() => {
        fallbackSpeechSynthesis(spokenText, targetLang);
      });
    } catch {
      fallbackSpeechSynthesis(spokenText, targetLang);
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
    <div className={`min-h-screen bg-[#FAF7F2] text-[#1E2621] flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Banner Header with Warm Cream Tones */}
        <div className="bg-gradient-to-r from-[#0E3E28] via-[#134E35] to-[#1E2621] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-[#0A2D21]">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#1A5C40] px-3.5 py-1 rounded-full text-xs font-bold text-[#FDE68A] border border-[#237854] mb-2.5">
              <Calendar className="w-4 h-4 text-[#FBBF24]" />
              <span>{isUrdu ? "مستقبل کی فصل منصوبہ بندی • پیشگوئی برائے اگلی سہ ماہی" : "Next-Quarter Predictive Crop Planning Engine"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              {t.plannerTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#A7D9C0] mt-2 max-w-2xl font-medium">
              {t.plannerSubtitle}
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-[#092418] px-4 py-2.5 rounded-2xl border border-[#164D35] text-xs font-bold text-[#FDE68A]">
            <ShieldCheck className="w-4 h-4 text-[#FBBF24]" />
            <span>{isUrdu ? "زرعی تحقیقاتی کونسل (PARC) مصدقہ اخراجات" : "PARC & Punjab Extension Verified Budgets"}</span>
          </div>
        </div>

        {/* INPUTS ROW: Season, Acres, Water, Region */}
        <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs space-y-5">
          
          {/* 1. Seasons Selection Tabs */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#55695C] mb-2.5">
              {t.seasonLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSeason("rabi")}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  season === "rabi"
                    ? "border-[#0F3E2E] bg-[#F5FAF6] shadow-xs ring-2 ring-emerald-700/20 text-[#14231B]"
                    : "border-[#EAE4D8] hover:border-[#DCD3C3] bg-[#FAF8F3] text-[#2A3B30]"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <Snowflake className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-sm sm:text-base text-[#14231B]">
                    {isUrdu ? "ربیع سیزن (سردیاں)" : "Rabi Season (Winter)"}
                  </div>
                  <div className="text-[11px] text-[#55695C] font-semibold">
                    {isUrdu ? "گندم، پیاز، آلو، سرسوں" : "Wheat, Onion, Potato, Canola"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSeason("kharif")}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  season === "kharif"
                    ? "border-[#0F3E2E] bg-[#F5FAF6] shadow-xs ring-2 ring-emerald-700/20 text-[#14231B]"
                    : "border-[#EAE4D8] hover:border-[#DCD3C3] bg-[#FAF8F3] text-[#2A3B30]"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-sm sm:text-base text-[#14231B]">
                    {isUrdu ? "خریف سیزن (گرمیاں)" : "Kharif Season (Summer)"}
                  </div>
                  <div className="text-[11px] text-[#55695C] font-semibold">
                    {isUrdu ? "باسمتی چاول، کپاس، ٹماٹر" : "Basmati Rice, Cotton, Tomato"}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSeason("zaid_spring")}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  season === "zaid_spring"
                    ? "border-[#0F3E2E] bg-[#F5FAF6] shadow-xs ring-2 ring-emerald-700/20 text-[#14231B]"
                    : "border-[#EAE4D8] hover:border-[#DCD3C3] bg-[#FAF8F3] text-[#2A3B30]"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
                  <Flower2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-sm sm:text-base text-[#14231B]">
                    {isUrdu ? "بہاریہ سیزن (درمیانی سہ ماہی)" : "Zaid / Spring Season"}
                  </div>
                  <div className="text-[11px] text-[#55695C] font-semibold">
                    {isUrdu ? "بہاریہ مکئی، سورج مکھی" : "Spring Maize, Sunflower"}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Acres & Water Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 border-t border-[#EAE4D8]">
            
            {/* Acres Selector (7 cols) */}
            <div className="lg:col-span-7">
              <label className="block text-xs font-black uppercase tracking-wider text-[#55695C] mb-2">
                {t.landLabel}
              </label>
              
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {[1, 2, 5, 10, 25].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAcres(a)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all ${
                      acres === a
                        ? "bg-[#0F3E2E] text-white border-[#0F3E2E] shadow-2xs"
                        : "bg-[#FAF8F3] hover:bg-[#F2ECE1] text-[#2A3B30] border-[#EAE4D8]"
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
                  className="w-full bg-[#FAF8F3] border border-[#DCD3C3] rounded-xl px-3 py-2 text-sm font-extrabold text-[#14231B] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <span className="text-xs font-bold text-[#55695C] shrink-0">
                  {isUrdu ? "ایکڑ رقبہ" : "Acres of Farmland"}
                </span>
              </div>
            </div>

            {/* Water Source & Region (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#55695C] mb-1.5 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-teal-700" />
                  <span>{t.waterLabel}</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWaterSource("canal")}
                    className={`p-2 rounded-xl text-[11px] font-bold border text-center transition-all ${
                      waterSource === "canal"
                        ? "bg-[#0F3E2E] text-white border-[#0F3E2E] shadow-2xs"
                        : "bg-[#FAF8F3] text-[#2A3B30] border-[#EAE4D8] hover:bg-[#F2ECE1]"
                    }`}
                  >
                    {isUrdu ? "نہری پانی" : "Canal"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterSource("tubewell")}
                    className={`p-2 rounded-xl text-[11px] font-bold border text-center transition-all ${
                      waterSource === "tubewell"
                        ? "bg-[#0F3E2E] text-white border-[#0F3E2E] shadow-2xs"
                        : "bg-[#FAF8F3] text-[#2A3B30] border-[#EAE4D8] hover:bg-[#F2ECE1]"
                    }`}
                  >
                    {isUrdu ? "ٹیوب ویل" : "Tube-well"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterSource("rainfed")}
                    className={`p-2 rounded-xl text-[11px] font-bold border text-center transition-all ${
                      waterSource === "rainfed"
                        ? "bg-[#0F3E2E] text-white border-[#0F3E2E] shadow-2xs"
                        : "bg-[#FAF8F3] text-[#2A3B30] border-[#EAE4D8] hover:bg-[#F2ECE1]"
                    }`}
                  >
                    {isUrdu ? "بارانی" : "Rainfed"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#55695C] mb-1">
                  {isUrdu ? "علاقہ / زرعی زون" : "Agro-Ecological Region"}
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-[#FAF8F3] border border-[#DCD3C3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#14231B] focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#F59E0B] bg-gradient-to-br from-[#FFFDF5] via-[#FFFBEB] to-[#FEF3C7]/40 p-6 sm:p-8 shadow-sm">
            
            {/* Top Bar with Audio Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-[#D97706] text-white px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
                  <Award className="w-4 h-4 text-[#FDE68A]" />
                  <span>{isUrdu ? "نمبر 1 سب سے زیادہ منافع بخش فصل" : "#1 Top Recommendation"}</span>
                </span>

                <span dir="ltr" className="inline-flex items-center gap-1 text-xs text-[#2A3B30] bg-[#FEFDFB] border border-[#EAE4D8] px-3 py-1 rounded-full font-bold shadow-2xs">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                  <span>+{topCrop.roiPercent}% ROI</span>
                </span>
              </div>

              {/* 🔊 Voice Audio Buttons (Urdu & English) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playVoice("ur")}
                  type="button"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all shadow-sm active:scale-95 border ${
                    activeVoiceLang === "ur"
                      ? "bg-[#D97706] text-white border-[#B45309] ring-2 ring-amber-300 animate-pulse"
                      : "bg-[#0F3E2E] hover:bg-[#144E3A] text-white border-[#0A2D21]"
                  }`}
                >
                  {activeVoiceLang === "ur" ? (
                    <>
                      <VolumeX className="w-4 h-4 text-[#FDE68A]" />
                      <span className="font-urdu">⏹ آواز بند کریں</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-[#FDE68A]" />
                      <span className="font-urdu">🔊 مشورہ سنیں</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => playVoice("en")}
                  type="button"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 border ${
                    activeVoiceLang === "en"
                      ? "bg-[#3730A3] text-white border-[#312E81] ring-2 ring-indigo-300 animate-pulse"
                      : "bg-[#1E2621] hover:bg-[#2B3630] text-white border-[#141A17]"
                  }`}
                >
                  {activeVoiceLang === "en" ? (
                    <>
                      <VolumeX className="w-4 h-4 text-indigo-300" />
                      <span>⏹ Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-[#D6CEBF]" />
                      <span>🔊 English</span>
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
                    <h2 className="text-3xl sm:text-4xl font-black text-[#14231B] tracking-tight">
                      {isUrdu ? topCrop.name_ur : topCrop.name_en}
                    </h2>
                    <div className="text-xs sm:text-sm font-semibold text-[#55695C] mt-0.5">
                      {isUrdu ? topCrop.name_en : topCrop.name_ur} &bull; {topCrop.season_ur}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm sm:text-base text-[#2A3B30] leading-relaxed font-medium">
                  {isUrdu ? topCrop.rationale_ur : topCrop.rationale_en}
                </p>

                {/* Sowing & Harvest calendar pills */}
                <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs font-bold">
                  <span className="bg-[#FEFDFB] border border-[#EAE4D8] px-3 py-1.5 rounded-xl text-[#2A3B30] flex items-center gap-1.5 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isUrdu ? `بجائی: ${topCrop.sowingWindow_ur}` : `Sowing: ${topCrop.sowingWindow_en}`}</span>
                  </span>
                  <span className="bg-[#FEFDFB] border border-[#EAE4D8] px-3 py-1.5 rounded-xl text-[#2A3B30] flex items-center gap-1.5 shadow-2xs">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isUrdu ? `کٹائی: ${topCrop.harvestWindow_ur}` : `Harvest: ${topCrop.harvestWindow_en}`}</span>
                  </span>
                  <span className="bg-[#FEFDFB] border border-[#EAE4D8] px-3 py-1.5 rounded-xl text-[#2A3B30] flex items-center gap-1.5 shadow-2xs">
                    <Droplets className="w-3.5 h-3.5 text-teal-700" />
                    <span>{isUrdu ? topCrop.waterRequirement_ur : topCrop.waterRequirement_en}</span>
                  </span>
                </div>
              </div>

              {/* Right Big Rupee Numbers */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {/* Total Expected Profit */}
                <div className="col-span-2 bg-gradient-to-r from-[#0E3E28] to-[#134E35] text-white rounded-2xl p-4 shadow-sm border border-[#0A2D21]">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#A7D9C0]">
                    {isUrdu ? `آپ کے ${acres} ایکڑ پر متوقع خالص منافع:` : `Projected Net Profit on ${acres} Acres:`}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-[#FDE68A] mt-1">
                    {isUrdu ? `+${topCrop.totalNetProfitPkr.toLocaleString()} روپے` : `+₨ ${topCrop.totalNetProfitPkr.toLocaleString()}`}
                  </div>
                  <div className="text-xs text-[#A7D9C0] font-bold mt-1">
                    {isUrdu ? `+${topCrop.netProfitPerAcre.toLocaleString()} روپے فی ایکڑ خالص منافع` : `+₨ ${topCrop.netProfitPerAcre.toLocaleString()} /acre net profit`}
                  </div>
                </div>

                {/* Total Investment Cost */}
                <div className="bg-[#FEFDFB] rounded-2xl p-3.5 border border-[#EAE4D8] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-[#55695C]">
                    {isUrdu ? "متوقع کل لاگت" : "Total Investment"}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-[#14231B] mt-0.5">
                    {isUrdu ? `${topCrop.totalCostPkr.toLocaleString()} روپے` : `₨ ${topCrop.totalCostPkr.toLocaleString()}`}
                  </div>
                  <div className="text-[11px] text-[#55695C] font-semibold">
                    {isUrdu ? `${topCrop.costPerAcre.toLocaleString()} روپے/ایکڑ` : `₨ ${topCrop.costPerAcre.toLocaleString()}/acre`}
                  </div>
                </div>

                {/* Expected Harvest Price */}
                <div className="bg-[#FEFDFB] rounded-2xl p-3.5 border border-[#EAE4D8] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-[#55695C]">
                    {isUrdu ? "متوقع منڈی ریٹ" : "Harvest Mandi Rate"}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-[#0F3E2E] mt-0.5">
                    {isUrdu ? `${topCrop.expectedHarvestPricePerMaund.toLocaleString()} روپے / من` : `₨ ${topCrop.expectedHarvestPricePerMaund.toLocaleString()}/من`}
                  </div>
                  <div className="text-[11px] text-[#55695C] font-semibold">
                    {isUrdu ? `${topCrop.expectedHarvestPricePerKg} روپے فی کلو` : `₨ ${topCrop.expectedHarvestPricePerKg}/kg`}
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown Drawer Button */}
            <div className="mt-6 pt-4 border-t border-[#EAE4D8] flex items-center justify-between">
              <span className="text-xs text-[#55695C] font-bold">
                {isUrdu ? "بیج، ڈی اے پی کھاد، یوریا، ڈیزل اور مزدوری کا سرکاری بجٹ دیکھیں:" : "Inspect official per-acre seed, fertilizer, and irrigation cost budget:"}
              </span>

              <button
                type="button"
                onClick={() => toggleCostDetails(topCrop.cropKey)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#FEFDFB] hover:bg-[#FAF8F3] text-[#14231B] border border-[#DCD3C3] rounded-xl text-xs font-black shadow-2xs transition-all"
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
              <div className="mt-4 p-4 rounded-2xl bg-[#FEFDFB] border border-[#EAE4D8] shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#14231B] mb-3 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-700" />
                  <span>{t.costBreakdownTitle} ({isUrdu ? topCrop.name_ur : topCrop.name_en})</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#EAE4D8]">
                    <div className="text-[10px] text-[#55695C] font-semibold">{isUrdu ? "بیج (Seed)" : "Seed"}</div>
                    <div className="font-extrabold text-[#14231B] mt-1">₨ {topCrop.costBreakdown.seedPkr.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#EAE4D8]">
                    <div className="text-[10px] text-[#55695C] font-semibold">{isUrdu ? "ڈی اے پی کھاد" : "DAP Fertilizer"}</div>
                    <div className="font-extrabold text-[#14231B] mt-1">₨ {topCrop.costBreakdown.dapFertilizerPkr.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#EAE4D8]">
                    <div className="text-[10px] text-[#55695C] font-semibold">{isUrdu ? "یوریا کھاد" : "Urea Fertilizer"}</div>
                    <div className="font-extrabold text-[#14231B] mt-1">₨ {topCrop.costBreakdown.ureaFertilizerPkr.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#EAE4D8]">
                    <div className="text-[10px] text-[#55695C] font-semibold">{isUrdu ? "آبپاشی و ایندھن" : "Irrigation & Fuel"}</div>
                    <div className="font-extrabold text-[#14231B] mt-1">₨ {topCrop.costBreakdown.irrigationFuelPkr.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#EAE4D8]">
                    <div className="text-[10px] text-[#55695C] font-semibold">{isUrdu ? "سپرے و مزدوری" : "Pest & Labor"}</div>
                    <div className="font-extrabold text-[#14231B] mt-1">₨ {topCrop.costBreakdown.pesticideLaborPkr.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#E8F3EC] border border-[#BDE0CB]">
                    <div className="text-[10px] text-[#0F3E2E] font-bold">{isUrdu ? "کل فی ایکڑ" : "Total / Acre"}</div>
                    <div className="font-black text-[#0F3E2E] mt-1">₨ {topCrop.costBreakdown.totalPerAcrePkr.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* COMPARISON OF ALL CROPS FOR THIS SEASON */}
        <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#14231B]">
                {isUrdu ? "تمام متبادل فصلوں کا موازنہ و رینکنگ" : "Compare All Next-Quarter Crop Options"}
              </h3>
              <p className="text-xs text-[#55695C] font-medium">
                {isUrdu ? "فی ایکڑ لاگت، متوقع پیداوار اور منافع کا جامع موازنہ" : "Ranked by net financial profit per acre"}
              </p>
            </div>
            <span className="text-xs font-bold text-[#0F3E2E] bg-[#E8F3EC] px-3 py-1 rounded-full border border-[#BDE0CB]">
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
                      ? "border-[#0F3E2E] bg-[#F5FAF6] shadow-xs"
                      : "border-[#EAE4D8] bg-[#FEFDFB] hover:border-[#DCD3C3]"
                  }`}
                >
                  <div>
                    {/* Header with rank badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{rec.emoji}</span>
                        <div>
                          <div className="font-extrabold text-[#14231B] text-base">
                            {isUrdu ? rec.name_ur : rec.name_en}
                          </div>
                          <div className="text-[11px] text-[#55695C] font-medium">
                            {isUrdu ? rec.name_en : rec.name_ur}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                          isTop
                            ? "bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]"
                            : "bg-[#FAF8F3] text-[#55695C] border border-[#EAE4D8]"
                        }`}
                      >
                        #{rec.rank} {isUrdu ? rec.badge_ur : rec.badge_en}
                      </span>
                    </div>

                    <p className="text-xs text-[#2A3B30] leading-relaxed font-medium mt-2 mb-4">
                      {isUrdu ? rec.rationale_ur : rec.rationale_en}
                    </p>

                    {/* Financial Metric Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                      <div className="bg-[#FAF8F3] p-2 rounded-xl border border-[#EAE4D8]">
                        <div className="text-[10px] text-[#55695C] font-semibold">{isUrdu ? "فی ایکڑ خرچ" : "Cost / Acre"}</div>
                        <div className="font-black text-[#14231B] mt-0.5">₨ {rec.costPerAcre.toLocaleString()}</div>
                      </div>
                      <div className="bg-[#FAF8F3] p-2 rounded-xl border border-[#EAE4D8]">
                        <div className="text-[10px] text-[#55695C] font-semibold">{isUrdu ? "متوقع ریٹ" : "Harvest Price"}</div>
                        <div className="font-black text-[#14231B] mt-0.5">₨ {rec.expectedHarvestPricePerMaund}/من</div>
                      </div>
                      <div className="bg-[#E8F3EC] p-2 rounded-xl border border-[#BDE0CB]">
                        <div className="text-[10px] text-[#0F3E2E] font-semibold">{isUrdu ? "خالص منافع" : "Net Profit"}</div>
                        <div className="font-black text-[#0F3E2E] mt-0.5">+₨ {rec.netProfitPerAcre.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Total for your farm */}
                    <div className="p-3 bg-[#FAF8F3] rounded-2xl border border-[#EAE4D8] flex items-center justify-between text-xs font-bold">
                      <span className="text-[#55695C]">{isUrdu ? `آپ کے ${acres} ایکڑ پر کل منافع:` : `Total for ${acres} Acres:`}</span>
                      <span className="text-[#0F3E2E] text-sm font-black">+₨ {rec.totalNetProfitPkr.toLocaleString()} ({rec.roiPercent}% ROI)</span>
                    </div>
                  </div>

                  {/* Sowing timing & cost drawer button */}
                  <div className="mt-4 pt-3 border-t border-[#EAE4D8] flex items-center justify-between text-xs">
                    <span className="text-[#55695C] text-[11px] font-semibold">
                      {isUrdu ? `کٹائی: ${rec.harvestWindow_ur}` : `Harvest: ${rec.harvestWindow_en}`}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleCostDetails(rec.cropKey)}
                      className="text-xs font-bold text-[#0F3E2E] hover:text-[#144E3A] flex items-center gap-1"
                    >
                      <span>{isExpanded ? t.hideDetails : t.viewDetails}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[#EAE4D8] grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="bg-[#FEFDFB] p-2 rounded-lg border border-[#EAE4D8]">
                        <span className="text-[#55695C] block">بیج:</span>
                        <strong className="text-[#14231B]">₨ {rec.costBreakdown.seedPkr.toLocaleString()}</strong>
                      </div>
                      <div className="bg-[#FEFDFB] p-2 rounded-lg border border-[#EAE4D8]">
                        <span className="text-[#55695C] block">کھادیں:</span>
                        <strong className="text-[#14231B]">₨ {(rec.costBreakdown.dapFertilizerPkr + rec.costBreakdown.ureaFertilizerPkr).toLocaleString()}</strong>
                      </div>
                      <div className="bg-[#FEFDFB] p-2 rounded-lg border border-[#EAE4D8]">
                        <span className="text-[#55695C] block">پانی و ایندھن:</span>
                        <strong className="text-[#14231B]">₨ {rec.costBreakdown.irrigationFuelPkr.toLocaleString()}</strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* FARMLAND ALLOCATION & RISK DIVERSIFICATION STRATEGY */}
        <div className="bg-[#0E3E28] text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#0A2D21]">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-5 h-5 text-[#FBBF24]" />
            <h3 className="text-base sm:text-lg font-black text-white">
              {isUrdu ? "زرعی ماہرین کی تجویز کردہ رقبہ تقسیم حکمت عملی" : "Farmland Risk Mitigation & Portfolio Strategy"}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-[#A7D9C0] font-medium leading-relaxed max-w-3xl mb-5">
            {isUrdu
              ? `اگر آپ کے پاس ${acres} ایکڑ رقبہ ہے تو تمام رقبہ صرف ایک ہی فصل پر نہ لگائیں۔ رسک کم کرنے اور نقد رقم کا توازن قائم رکھنے کے لیے زرعی ماہرین کا مشورہ ہے:`
              : `To mitigate agricultural price volatility and drought risks across your ${acres} acres, our agronomist model recommends a balanced portfolio allocation:`}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
              <div className="flex items-center gap-2 mb-1.5">
                <Coins className="w-4 h-4 text-[#FDE68A]" />
                <h4 className="font-extrabold text-sm text-white">
                  {isUrdu ? "65% رقبہ: ہائی ویلیو کیش کراپ" : "65% Land: High-Value Cash Crop"}
                </h4>
              </div>
              <p className="text-xs text-[#D1E7DD] leading-relaxed font-medium">
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
              <p className="text-xs text-[#D1E7DD] leading-relaxed font-medium">
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
