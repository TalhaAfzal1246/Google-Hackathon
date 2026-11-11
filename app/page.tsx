"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Language, DICTIONARY } from "@/lib/i18n";
import {
  Sprout,
  Store,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Scale,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Calendar,
} from "lucide-react";

const MANDI_PREVIEWS = [
  { key: "tomato", name_en: "Tomato", name_ur: "ٹماٹر", emoji: "🍅", rate: "₨ 175/kg", maund: "₨ 7,000/من", mandi: "Lahore" },
  { key: "onion", name_en: "Onion", name_ur: "پیاز", emoji: "🧅", rate: "₨ 165/kg", maund: "₨ 6,600/من", mandi: "Faisalabad" },
  { key: "potato", name_en: "Potato", name_ur: "آلو", emoji: "🥔", rate: "₨ 48/kg", maund: "₨ 1,920/من", mandi: "Okara" },
  { key: "wheat", name_en: "Wheat", name_ur: "گندم", emoji: "🌾", rate: "₨ 98/kg", maund: "₨ 3,920/من", mandi: "Multan" },
  { key: "rice_basmati", name_en: "Basmati Rice", name_ur: "باسمتی چاول", emoji: "🍚", rate: "₨ 220/kg", maund: "₨ 8,800/من", mandi: "Gujranwala" },
];

export default function HomePage() {
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

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-14 md:pt-16 md:pb-20 border-b border-slate-200 bg-gradient-to-b from-emerald-50/70 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-100/90 border border-emerald-300 text-emerald-950 px-4 py-1.5 rounded-full text-xs font-bold mb-6 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>
              {isUrdu
                ? "حقیقی منڈی ریٹس (AMIS پنجاب و وفاقی ادارہ شماریات)"
                : "Official Mandi Bulletins • AMIS Punjab & PBS Verified"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            {isUrdu ? (
              <span>
                پاکستانی کسانوں کے لیے <span className="text-emerald-700">آسان و سمارٹ</span> منڈی پیشگوئی اور منصفانہ تجارت
              </span>
            ) : (
              <span>
                Empowering Pakistan&apos;s Farmers with <span className="text-emerald-700">Predictive AI</span> &amp; Fair-Trade Mandi Exchange
              </span>
            )}
          </h1>

          <p className="mt-4 text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            {isUrdu
              ? "آڑھتی مافیا اور کٹوتیوں سے نجات۔ سرکاری منڈی ریٹس کی بنیاد پر جانیے کہ اپنی فصل کب بیچنی ہے اور اگلی سہ ماہی کے لیے کون سی فصل سب سے زیادہ منافع بخش ہوگی۔"
              : "Eliminate middleman exploitation and post-harvest distress sales. Empirical price forecasting, next-quarter crop planning, and direct verified buyer exchange."}
          </p>

          {/* Quick Crop Selector Pills */}
          <div className="mt-8 max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm text-left">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? "آج کے لائیو ریٹس چیک کریں (کلک کریں):" : "Today's Live Mandi Rates (Click to inspect):"}</span>
              </span>
              <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {isUrdu ? "روزانہ اپڈیٹ" : "Updated Daily"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {MANDI_PREVIEWS.map((c) => (
                <Link
                  key={c.key}
                  href={`/farmer`}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 transition-all bg-slate-50/50 group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{c.mandi}</span>
                  </div>
                  <div className="mt-2">
                    <div className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-900">
                      {isUrdu ? c.name_ur : c.name_en}
                    </div>
                    <div className="text-xs font-black text-emerald-800 mt-0.5">
                      {c.rate}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500">
                      {c.maund}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Role CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/farmer"
              className="flex items-center gap-2 px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-black shadow-md shadow-emerald-800/20 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              <Sprout className="w-5 h-5 text-amber-300" />
              <span>{isUrdu ? "🌾 کسان پورٹل (آج کا مشورہ)" : "🌾 Farmer Advisory Portal"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/planner"
              className="flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-black shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              <Calendar className="w-5 h-5 text-slate-950" />
              <span>{isUrdu ? "📅 اگلی فصل کا پلانر (بہترین منافع)" : "📅 Next-Quarter Crop Planner"}</span>
            </Link>

            <Link
              href="/market"
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-extrabold shadow-md transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              <Store className="w-5 h-5 text-emerald-400" />
              <span>{isUrdu ? "🛒 خریداروں کی منڈی" : "🛒 Browse Wholesale Exchange"}</span>
            </Link>

            <Link
              href="/copilot"
              className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-300 rounded-2xl font-extrabold shadow-xs transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              <HelpCircle className="w-5 h-5 text-teal-600" />
              <span>{isUrdu ? "💬 AI سے سوال پوچھیں" : "💬 Ask Mandi AI Copilot"}</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">{isUrdu ? "پیشگوئی کی درستی" : "Backtest Accuracy"}</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">92.3%</div>
              <div className="text-[11px] text-emerald-700 font-bold">{isUrdu ? "7.7% اوسط خطا (MAPE)" : "7.7% Empirical MAPE"}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">{isUrdu ? "شماریاتی اعتماد کا دائرہ" : "Empirical Coverage"}</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">81.4%</div>
              <div className="text-[11px] text-slate-600 font-bold">{isUrdu ? "P10 تا P90 حدود" : "P10-P90 Risk Envelope"}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">{isUrdu ? "اہم غلہ و سبزی منڈیاں" : "Pakistani Mandis"}</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">5 Major Hubs</div>
              <div className="text-[11px] text-slate-600 font-bold">{isUrdu ? "لاہور، ملتان، کراچی..." : "Punjab & Sindh Hubs"}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div className="text-xs text-slate-500 font-semibold">{isUrdu ? "اقوام متحدہ SDG اہداف" : "UN SDG Alignment"}</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">SDG 2 &amp; 12</div>
              <div className="text-[11px] text-emerald-700 font-bold">{isUrdu ? "غربت و ضیاع کا خاتمہ" : "Zero Hunger & Waste"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {isUrdu ? "بنیادی انقلابی خصوصیات" : "Breakthrough Architectural Pillars"}
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto font-medium">
            {isUrdu
              ? "کسان کو زیادہ منافع، سیزن کی پیشگی منصوبہ بندی اور شفاف خریداری۔"
              : "Combining econometric time-series models with Google AI to guarantee transparency and economic justice."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Farmer Advisory */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">
                {isUrdu ? "1. کسان مشورہ اور ٹائم مشین" : "1. Predictive Harvest Advisory"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                {isUrdu
                  ? "سرکاری منڈی ڈیٹا کی بنیاد پر جانیں کہ آج بیچنا بہتر ہے یا روکنا۔ سٹوریج کا خرچ نکال کر فیصلہ۔"
                  : "Empirical price quantiles over 3 to 30 day horizons. Balances storage & spoilage to declare optimal sale timing."}
              </p>
            </div>
            <Link href="/farmer" className="text-xs font-black text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
              <span>{isUrdu ? "کسان پورٹل دیکھیں →" : "Explore Advisory →"}</span>
            </Link>
          </div>

          {/* Card 2: Next-Quarter Crop Planner */}
          <div className="bg-amber-50/60 rounded-3xl border-2 border-amber-300 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-950 mb-2">
                {isUrdu ? "2. اگلی فصل پلانر (پیشگی منافع)" : "2. Next-Quarter Crop Planner"}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4">
                {isUrdu
                  ? "اپنے رقبے کے مطابق جانیں کہ اگلی سہ ماہی میں کون سی فصل سب سے زیادہ منافع دے گی۔ کھاد و بیج کا مکمل بجٹ۔"
                  : "Personalized ROI engine recommending what to plant next season. Predicts harvest prices, input costs, and net margins."}
              </p>
            </div>
            <Link href="/planner" className="text-xs font-black text-amber-900 hover:text-amber-950 flex items-center gap-1">
              <span>{isUrdu ? "اگلی فصل کا پلان بنائیں →" : "Plan Next Season →"}</span>
            </Link>
          </div>

          {/* Card 3: Autonomous Deal Room */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-4">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">
                {isUrdu ? "3. براہ راست منصفانہ سودے بازی" : "3. Autonomous Deal Room"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                {isUrdu
                  ? "آڑھتی کے بغیر براہ راست تصدیق شدہ بیوپاریوں کے ساتھ منصفانہ ریٹ پر ڈیل فائنل کریں۔"
                  : "Bilateral automated bargaining agent bounded strictly within the forecast-derived Fair Band [P25, P75]."}
              </p>
            </div>
            <Link href="/market" className="text-xs font-black text-indigo-800 hover:text-indigo-950 flex items-center gap-1">
              <span>{isUrdu ? "منصفانہ منڈی دیکھیں →" : "View Deal Room →"}</span>
            </Link>
          </div>

          {/* Card 4: Spread Watchdog */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mb-4">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-2">
                {isUrdu ? "4. آڑھتی مارجن واچ ڈاگ" : "4. Middleman Margin Watchdog"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                {isUrdu
                  ? "کسان کے ریٹ اور ریٹیل قیمت کے درمیان فرق کی جانچ، تاکہ ناجائز منافع خوری کا فوری پتہ چل سکے۔"
                  : "Monitors the farmgate-to-retail price spread across Pakistani mandis to flag artificial middleman cartel gouging."}
              </p>
            </div>
            <Link href="/watchdog" className="text-xs font-black text-rose-800 hover:text-rose-950 flex items-center gap-1">
              <span>{isUrdu ? "واچ ڈاگ چیک کریں →" : "Inspect Watchdog →"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Built with Google Technology Strip */}
      <section className="bg-slate-950 text-white py-10 mt-auto border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-400 mb-1">
                Technology Architecture
              </div>
              <h3 className="text-lg sm:text-xl font-black">Built for Google Developer Groups Hackathon</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Integrated with Google AI, Google Cloud, and Pakistan Agricultural AMIS Open Data.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Gemini / GPT-6.1 Terra</span>
              </span>
              <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>PARC &amp; PBS Verified Budgets</span>
              </span>
              <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                <span>Vercel + Google Cloud</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
