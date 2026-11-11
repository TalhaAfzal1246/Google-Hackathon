"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DemandSupplyCopilot from "@/components/DemandSupplyCopilot";
import { Language, DICTIONARY } from "@/lib/i18n";
import { TrendingUp, Lightbulb, Compass, Database, ShieldCheck } from "lucide-react";

export default function CopilotPage() {
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

  return (
    <div className={`min-h-screen bg-[#FAF7F2] text-[#1E2621] flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-[#E8F3EC] text-[#0F3E2E] px-3 py-1 rounded-full border border-[#BDE0CB]">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isUrdu ? "منڈی مارکیٹ انٹیلی جنس" : "Mandi Commodity Intelligence"}</span>
            </span>
            <span className="text-xs text-[#55695C] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>AMIS &amp; PBS Benchmark Analytics</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#14231B] tracking-tight">
            {t.demandSupplyCopilot}
          </h1>
          <p className="text-xs sm:text-sm text-[#55695C] mt-1 max-w-2xl font-medium">
            Inquire about harvest calendars, wholesale mandi elasticities, transport freight impacts, or regional price transmission in Pakistan.
          </p>
        </div>

        {/* Live Mandi Intelligence Interactive Desk */}
        <DemandSupplyCopilot
          currentCrop="Tomato"
          currentMarket="Lahore (Badami Bagh Mandi)"
          currentPrice={175}
          arrivals={240}
          demand={250}
          lang={lang}
        />

        {/* Informational Cards (Warm Cream Surface) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FEFDFB] p-5 rounded-3xl border border-[#EAE4D8] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#E8F3EC] text-[#0F3E2E] flex items-center justify-center mb-3 border border-[#BDE0CB]">
              <Lightbulb className="w-4 h-4 text-emerald-800" />
            </div>
            <h4 className="font-extrabold text-[#14231B] text-sm mb-1">Inelastic Staples</h4>
            <p className="text-xs text-[#55695C] leading-relaxed font-medium">
              Onions and tomatoes exhibit high price inelasticity in Pakistani urban centers. A 15% arrival drop can trigger a 40%+ auction price surge.
            </p>
          </div>

          <div className="bg-[#FEFDFB] p-5 rounded-3xl border border-[#EAE4D8] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#EBE9F5] text-[#3730A3] flex items-center justify-center mb-3 border border-[#C7D2FE]">
              <Compass className="w-4 h-4 text-indigo-700" />
            </div>
            <h4 className="font-extrabold text-[#14231B] text-sm mb-1">Seasonal Harvest Waves</h4>
            <p className="text-xs text-[#55695C] leading-relaxed font-medium">
              Sindh winter harvest arrives Dec–Feb; Punjab main crop hits in March–May; northern valleys (Swat, Quetta) supply the July–Oct monsoon window.
            </p>
          </div>

          <div className="bg-[#FEFDFB] p-5 rounded-3xl border border-[#EAE4D8] shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F3] text-[#853E06] flex items-center justify-center mb-3 border border-[#EAE4D8]">
              <Database className="w-4 h-4 text-amber-700" />
            </div>
            <h4 className="font-extrabold text-[#14231B] text-sm mb-1">Logistics &amp; Fuel Freight</h4>
            <p className="text-xs text-[#55695C] leading-relaxed font-medium">
              Long-haul transit from Balochistan or Sindh adds ₨ 4–8/kg in diesel freight, creating natural inter-mandi geographic price differentials.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
