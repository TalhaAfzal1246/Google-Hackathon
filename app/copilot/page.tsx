"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import DemandSupplyCopilot from "@/components/DemandSupplyCopilot";
import { Language, DICTIONARY } from "@/lib/i18n";
import { HelpCircle, BrainCircuit, Lightbulb, Compass, Database } from "lucide-react";

export default function CopilotPage() {
  const [lang, setLang] = useState<Language>("en");
  const t = DICTIONARY[lang];
  const isUrdu = lang === "ur";

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
              <BrainCircuit className="w-3.5 h-3.5 text-teal-600" />
              Agri Econometric Intelligence
            </span>
            <span className="text-xs text-slate-500">Google Gemini 3.8 Flash Powered</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isUrdu ? "رسد و طلب (Demand & Supply) سمارٹ معاون" : "Agricultural Demand & Supply Intelligence"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Inquire about harvest calendars, wholesale mandi elasticities, transport freight impacts, or regional price transmission in Pakistan.
          </p>
        </div>

        {/* Live Copilot Interactive Assistant */}
        <DemandSupplyCopilot
          currentCrop="Tomato"
          currentMarket="Lahore (Badami Bagh Mandi)"
          currentPrice={65}
          arrivals={240}
          demand={250}
          lang={lang}
        />

        {/* Informational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Inelastic Staples</h4>
            <p className="text-xs text-slate-600">
              Onions and tomatoes exhibit high price inelasticity in Pakistani urban centers. A 15% arrival drop can trigger a 40%+ auction price surge.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
              <Compass className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Seasonal Harvest Waves</h4>
            <p className="text-xs text-slate-600">
              Sindh winter harvest arrives Dec–Feb; Punjab main crop hits in March–May; northern valleys (Swat, Quetta) supply the July–Oct monsoon window.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Logistics & Fuel Transmission</h4>
            <p className="text-xs text-slate-600">
              Long-haul transit from Balochistan or Sindh adds ₨ 4–8/kg in diesel freight, creating natural inter-mandi geographic price differentials.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
