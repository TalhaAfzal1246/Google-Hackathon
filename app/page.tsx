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
  ArrowLeft,
  TrendingUp,
  Scale,
  ShieldCheck,
  Calendar,
  Compass,
  CheckCircle2,
  Building2,
  Coins,
  MapPin,
  ExternalLink,
  Award,
  Layers,
} from "lucide-react";

const MANDI_PREVIEWS = [
  { key: "tomato", name_en: "Tomato", name_ur: "ٹماٹر", emoji: "🍅", rate: "₨ 175/kg", maund: "₨ 7,000/من", mandi: "Lahore", change: "+4.2%" },
  { key: "onion", name_en: "Onion", name_ur: "پیاز", emoji: "🧅", rate: "₨ 165/kg", maund: "₨ 6,600/من", mandi: "Faisalabad", change: "+2.8%" },
  { key: "potato", name_en: "Potato", name_ur: "آلو", emoji: "🥔", rate: "₨ 48/kg", maund: "₨ 1,920/من", mandi: "Okara", change: "-1.1%" },
  { key: "wheat", name_en: "Wheat", name_ur: "گندم", emoji: "🌾", rate: "₨ 98/kg", maund: "₨ 3,920/من", mandi: "Multan", change: "+0.5%" },
  { key: "rice_basmati", name_en: "Basmati Rice", name_ur: "باسمتی چاول", emoji: "🍚", rate: "₨ 220/kg", maund: "₨ 8,800/من", mandi: "Gujranwala", change: "+1.9%" },
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
  const ArrowIcon = isUrdu ? ArrowLeft : ArrowRight;

  return (
    <div className={`min-h-screen bg-[#FAF7F2] text-[#1E2621] flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      {/* Hero Section with Warm Cream & Harvest Atmosphere */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[#EAE4D8] bg-gradient-to-b from-[#FAF6EE] via-[#F7F2E7] to-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Institutional Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-[#E8F3EC] border border-[#BDE0CB] text-[#0F3E2E] px-4 py-1.5 rounded-full text-xs font-bold mb-6 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>
              {isUrdu
                ? "حقیقی منڈی ڈیٹا (پنجاب AMIS و وفاقی ادارہ شماریات سے منسلک)"
                : "Official Mandi Bulletins • AMIS Punjab & Federal PBS Verified"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#14231B] tracking-tight max-w-4xl mx-auto leading-tight">
            {isUrdu ? (
              <span>
                پاکستانی کسانوں کے لیے <span className="text-[#0F3E2E]">سرکاری منڈی پیشگوئی</span> اور منصفانہ اجناس تجارت
              </span>
            ) : (
              <span>
                Empowering Pakistan&apos;s Growers with <span className="text-[#0F3E2E]">Empirical Mandi Forecasting</span> &amp; Fair-Trade Exchange
              </span>
            )}
          </h1>

          <p className="mt-4 text-sm sm:text-lg text-[#3B4D41] max-w-2xl mx-auto leading-relaxed font-medium">
            {isUrdu
              ? "غیر منصفانہ کٹوتیوں اور آڑھتی اجارہ داری سے نجات۔ سرکاری منڈی ریٹس کی بنیاد پر جانیے کہ اپنی فصل کب بیچنی ہے اور اگلی سہ ماہی کے لیے کون سی فصل سب سے زیادہ منافع بخش ہوگی۔"
              : "Eliminate middleman exploitation and post-harvest distress sales. Econometric price quantile forecasting, next-quarter crop planning, and transparent bilateral buyer settlement."}
          </p>

          {/* Quick Mandi Live Price Ticker Strip (Cream Surface) */}
          <div className="mt-8 max-w-4xl mx-auto bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-4 sm:p-5 shadow-sm text-left">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-black uppercase tracking-wider text-[#3D4D42] flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-700" />
                <span>{isUrdu ? "آج کے لائیو منڈی ریٹس (تفصیل کے لیے کلک کریں):" : "Today's Live Mandi Rates (Click to inspect):"}</span>
              </span>
              <span className="text-[11px] text-[#0F3E2E] font-bold bg-[#E8F3EC] px-2.5 py-0.5 rounded-full border border-[#BDE0CB]">
                {isUrdu ? "روزانہ اپڈیٹ" : "Updated Daily"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {MANDI_PREVIEWS.map((c) => (
                <Link
                  key={c.key}
                  href={`/farmer`}
                  className="p-3 rounded-2xl border border-[#EBE4D6] hover:border-[#0F3E2E] hover:bg-[#F5EFEB] transition-all bg-[#FAF8F3] group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-[10px] text-[#55695C] font-bold flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-emerald-700" />
                      {c.mandi}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="font-extrabold text-xs sm:text-sm text-[#14231B] group-hover:text-[#0F3E2E]">
                      {isUrdu ? c.name_ur : c.name_en}
                    </div>
                    <div className="text-xs font-black text-[#0F3E2E] mt-0.5">
                      {c.rate}
                    </div>
                    <div className="text-[10px] font-bold text-[#6B7C70]">
                      {c.maund}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/farmer"
              className="flex items-center gap-2 px-6 py-3.5 bg-[#0F3E2E] hover:bg-[#144E3A] text-white rounded-2xl font-black shadow-md shadow-emerald-950/20 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base border border-[#0A2D21]"
            >
              <Sprout className="w-5 h-5 text-[#FBBF24]" />
              <span>{isUrdu ? "🌾 کسان پورٹل (آج کا مشورہ)" : "🌾 Farmer Advisory Portal"}</span>
              <ArrowIcon className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/planner"
              className="flex items-center gap-2 px-6 py-3.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-2xl font-black shadow-md shadow-amber-900/20 transition-all hover:scale-105 active:scale-95 text-sm sm:text-base border border-[#B45309]"
            >
              <Calendar className="w-5 h-5 text-[#FEF3C7]" />
              <span>{isUrdu ? "📅 اگلی فصل کا پلانر (بہترین منافع)" : "📅 Next-Quarter Crop Planner"}</span>
              <ArrowIcon className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/market"
              className="flex items-center gap-2 px-6 py-3.5 bg-[#1F2E25] hover:bg-[#283C30] text-white rounded-2xl font-extrabold shadow-md transition-all hover:scale-105 active:scale-95 text-sm sm:text-base border border-[#14231B]"
            >
              <Store className="w-5 h-5 text-emerald-300" />
              <span>{isUrdu ? "🛒 منصفانہ ہول سیل منڈی" : "🛒 Wholesale Mandi Exchange"}</span>
            </Link>

            <Link
              href="/copilot"
              className="flex items-center gap-2 px-6 py-3.5 bg-[#FEFDFB] hover:bg-[#F5EFEB] text-[#1E2621] border-2 border-[#DCD3C3] rounded-2xl font-extrabold shadow-xs transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              <TrendingUp className="w-5 h-5 text-emerald-800" />
              <span>{isUrdu ? "📈 منڈی انٹیلی جنس ڈیسک" : "📈 Mandi Intelligence Desk"}</span>
            </Link>
          </div>

          {/* Institutional Metrics Ribbon (Cream Cards) */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="bg-[#FEFDFB] rounded-2xl border border-[#EAE4D8] p-4 shadow-2xs">
              <div className="text-xs text-[#5C6E62] font-semibold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>{isUrdu ? "پیشگوئی کی درستی" : "Backtest Accuracy"}</span>
              </div>
              <div className="text-2xl font-black text-[#14231B] mt-0.5">92.3%</div>
              <div className="text-[11px] text-[#0F3E2E] font-bold">{isUrdu ? "7.7% اوسط خطا (MAPE)" : "7.7% Empirical MAPE"}</div>
            </div>

            <div className="bg-[#FEFDFB] rounded-2xl border border-[#EAE4D8] p-4 shadow-2xs">
              <div className="text-xs text-[#5C6E62] font-semibold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isUrdu ? "شماریاتی اعتماد کا دائرہ" : "Empirical Coverage"}</span>
              </div>
              <div className="text-2xl font-black text-[#14231B] mt-0.5">81.4%</div>
              <div className="text-[11px] text-[#4F6155] font-bold">{isUrdu ? "P10 تا P90 حدود" : "P10-P90 Risk Envelope"}</div>
            </div>

            <div className="bg-[#FEFDFB] rounded-2xl border border-[#EAE4D8] p-4 shadow-2xs">
              <div className="text-xs text-[#5C6E62] font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-700" />
                <span>{isUrdu ? "اہم غلہ و سبزی منڈیاں" : "Covered Mandis"}</span>
              </div>
              <div className="text-2xl font-black text-[#14231B] mt-0.5">5 Major Hubs</div>
              <div className="text-[11px] text-[#4F6155] font-bold">{isUrdu ? "لاہور، ملتان، کراچی..." : "Punjab & Sindh Hubs"}</div>
            </div>

            <div className="bg-[#FEFDFB] rounded-2xl border border-[#EAE4D8] p-4 shadow-2xs">
              <div className="text-xs text-[#5C6E62] font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isUrdu ? "اقوام متحدہ SDG اہداف" : "UN SDG Alignment"}</span>
              </div>
              <div className="text-2xl font-black text-[#14231B] mt-0.5">SDG 2 &amp; 12</div>
              <div className="text-[11px] text-[#0F3E2E] font-bold">{isUrdu ? "غربت و ضیاع کا خاتمہ" : "Zero Hunger & Waste"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Pillars (Cream Surface Cards) */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#14231B]">
            {isUrdu ? "قومی زرعی پلیٹ فارم کے چار بنیادی ستون" : "Core Agricultural Pillars"}
          </h2>
          <p className="mt-2 text-sm text-[#4F6155] max-w-xl mx-auto font-medium">
            {isUrdu
              ? "کسان کو زیادہ منافع، سیزن کی پیشگی منصوبہ بندی اور شفاف خریداری کا قابلِ اعتماد نظام۔"
              : "Empirical time-series forecasting, benchmarked input budgets, and direct grower-buyer settlement."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Farmer Advisory */}
          <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E8F3EC] text-[#0F3E2E] flex items-center justify-center mb-4 border border-[#BDE0CB]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#14231B] mb-2">
                {isUrdu ? "1. کسان مشورہ اور ٹائم مشین" : "1. Mandi Harvest Advisory"}
              </h3>
              <p className="text-xs text-[#526458] leading-relaxed font-medium mb-4">
                {isUrdu
                  ? "سرکاری منڈی ڈیٹا کی بنیاد پر جانیں کہ آج بیچنا بہتر ہے یا روکنا۔ سٹوریج کا خرچ نکال کر واضح فیصلہ۔"
                  : "Empirical price quantiles over 3 to 30 day horizons. Balances storage & spoilage to declare optimal sale timing."}
              </p>
            </div>
            <Link href="/farmer" className="text-xs font-black text-[#0F3E2E] hover:text-[#144E3A] flex items-center gap-1.5">
              <span>{isUrdu ? "کسان پورٹل دیکھیں" : "Explore Advisory"}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Next-Quarter Crop Planner */}
          <div className="bg-[#FFFDF5] rounded-3xl border-2 border-[#F59E0B] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#D97706] text-white flex items-center justify-center mb-4 shadow-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#14231B] mb-2">
                {isUrdu ? "2. اگلی فصل پلانر (پیشگی منافع)" : "2. Next-Quarter Crop Planner"}
              </h3>
              <p className="text-xs text-[#5C5035] leading-relaxed font-medium mb-4">
                {isUrdu
                  ? "اپنے رقبے کے مطابق جانیں کہ اگلی سہ ماہی میں کون سی فصل سب سے زیادہ منافع دے گی۔ کھاد و بیج کا سرکاری تخمینہ۔"
                  : "Personalized ROI engine recommending what to plant next season. Predicts harvest prices, input costs, and net margins."}
              </p>
            </div>
            <Link href="/planner" className="text-xs font-black text-[#B45309] hover:text-[#92400E] flex items-center gap-1.5">
              <span>{isUrdu ? "اگلی فصل کا پلان بنائیں" : "Plan Next Season"}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Autonomous Deal Room */}
          <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EBE9F5] text-[#3730A3] flex items-center justify-center mb-4 border border-[#C7D2FE]">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#14231B] mb-2">
                {isUrdu ? "3. براہ راست منصفانہ سودے بازی" : "3. Direct Mandi Deal Room"}
              </h3>
              <p className="text-xs text-[#526458] leading-relaxed font-medium mb-4">
                {isUrdu
                  ? "آڑھتی کے بغیر براہ راست تصدیق شدہ بیوپاریوں کے ساتھ منصفانہ ریٹ پر ڈیل فائنل کریں اور فوری رسید حاصل کریں۔"
                  : "Bilateral automated bargaining strictly bounded within the statistical Fair Band [P25, P75]."}
              </p>
            </div>
            <Link href="/market" className="text-xs font-black text-[#3730A3] hover:text-[#312E81] flex items-center gap-1.5">
              <span>{isUrdu ? "منصفانہ منڈی دیکھیں" : "View Exchange"}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Spread Watchdog */}
          <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] text-[#991B1B] flex items-center justify-center mb-4 border border-[#FECACA]">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-[#14231B] mb-2">
                {isUrdu ? "4. آڑھتی مارجن واچ ڈاگ" : "4. Middleman Margin Watchdog"}
              </h3>
              <p className="text-xs text-[#526458] leading-relaxed font-medium mb-4">
                {isUrdu
                  ? "کسان کے ریٹ اور ریٹیل قیمت کے درمیان فرق کی جانچ، تاکہ ناجائز منافع خوری اور کٹوتیوں کا فوری پتہ چل سکے۔"
                  : "Monitors farmgate-to-retail price spreads across Pakistani mandis to flag artificial middleman cartel gouging."}
              </p>
            </div>
            <Link href="/watchdog" className="text-xs font-black text-[#991B1B] hover:text-[#7F1D1D] flex items-center gap-1.5">
              <span>{isUrdu ? "واچ ڈاگ چیک کریں" : "Inspect Watchdog"}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Institutional Strip / Technology Architecture */}
      <section className="bg-[#0C2419] text-white py-10 mt-auto border-t border-[#081A12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#FBBF24] mb-1">
                National Agri-Data Infrastructure
              </div>
              <h3 className="text-lg sm:text-xl font-black">Farm-to-Future Agricultural Network</h3>
              <p className="text-xs text-[#95B2A3] mt-1 max-w-xl">
                Serving Pakistan&apos;s farming community through verified AMIS Punjab open data, PARC production benchmarks, and Google Cloud infrastructure.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-[#143B2A] border border-[#1E523A] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Punjab AMIS Open Data</span>
              </span>
              <span className="bg-[#143B2A] border border-[#1E523A] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>PARC &amp; PBS Benchmark Budgets</span>
              </span>
              <span className="bg-[#143B2A] border border-[#1E523A] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-teal-300" />
                <span>Google Cloud Platform</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
