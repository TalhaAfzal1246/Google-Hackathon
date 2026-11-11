"use client";

import { Language, DICTIONARY } from "@/lib/i18n";
import { Sliders, RotateCcw } from "lucide-react";

interface AssumptionSlidersProps {
  storage: number;
  spoil: number;
  rate: number;
  transport: number;
  onChangeStorage: (v: number) => void;
  onChangeSpoil: (v: number) => void;
  onChangeRate: (v: number) => void;
  onChangeTransport: (v: number) => void;
  onReset?: () => void;
  lang: Language;
}

export default function AssumptionSliders({
  storage,
  spoil,
  rate,
  transport,
  onChangeStorage,
  onChangeSpoil,
  onChangeRate,
  onChangeTransport,
  onReset,
  lang,
}: AssumptionSlidersProps) {
  const t = DICTIONARY[lang];
  const isUrdu = lang === "ur";

  const handleDefaultReset = () => {
    if (onReset) {
      onReset();
    } else {
      onChangeStorage(0.5);
      onChangeSpoil(0.005);
      onChangeRate(0.015);
      onChangeTransport(0);
    }
  };

  return (
    <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E8F3EC] text-[#0F3E2E] flex items-center justify-center border border-[#BDE0CB]">
            <Sliders className="w-4 h-4 text-emerald-800" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#14231B] text-sm">
              {isUrdu ? "فصل سنبھالنے اور سٹوریج کے متوقع اخراجات" : "Post-Harvest Cost Parameters"}
            </h3>
            <p className="text-[11px] text-[#55695C]">
              {isUrdu ? "فوری حسابی تبدیلی اور کسان کی بچت کا تخمینہ" : "Instant econometric re-computation on every slider adjustment"}
            </p>
          </div>
        </div>
        <button
          onClick={handleDefaultReset}
          className="flex items-center gap-1.5 text-xs text-[#55695C] hover:text-[#0F3E2E] hover:bg-[#FAF8F3] px-3 py-1.5 rounded-xl border border-[#EAE4D8] transition-colors font-bold"
          title="Reset to empirical defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isUrdu ? "اصل پر کریں" : "Defaults"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Storage cost */}
        <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border border-[#EAE4D8]">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#55695C] font-semibold">{t.storageSlider}</span>
            <span className="font-black text-[#14231B]">₨ {storage.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.02}
            max={0.45}
            step={0.01}
            value={storage}
            onChange={(e) => onChangeStorage(parseFloat(e.target.value))}
            className="w-full accent-emerald-700 cursor-pointer h-1.5 bg-[#EAE4D8] rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-[#7A8C80] mt-1 font-mono">
            <span>₨0.02/d</span>
            <span>₨0.45/d</span>
          </div>
        </div>

        {/* Spoilage rate */}
        <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border border-[#EAE4D8]">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#55695C] font-semibold">{t.spoilSlider}</span>
            <span className="font-black text-[#14231B]">{(spoil * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={0.001}
            max={0.03}
            step={0.001}
            value={spoil}
            onChange={(e) => onChangeSpoil(parseFloat(e.target.value))}
            className="w-full accent-emerald-700 cursor-pointer h-1.5 bg-[#EAE4D8] rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-[#7A8C80] mt-1 font-mono">
            <span>0.1%/d (Grains)</span>
            <span>3.0%/d (Perishables)</span>
          </div>
        </div>

        {/* Financial carry rate */}
        <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border border-[#EAE4D8]">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#55695C] font-semibold">{t.rateSlider}</span>
            <span className="font-black text-[#14231B]">{(rate * 30 * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={0.0001}
            max={0.0015}
            step={0.0001}
            value={rate}
            onChange={(e) => onChangeRate(parseFloat(e.target.value))}
            className="w-full accent-emerald-700 cursor-pointer h-1.5 bg-[#EAE4D8] rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-[#7A8C80] mt-1 font-mono">
            <span>0.3%/mo</span>
            <span>4.5%/mo</span>
          </div>
        </div>

        {/* Transport cost */}
        <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border border-[#EAE4D8]">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#55695C] font-semibold">{isUrdu ? "کرایہ و ایندھن (روپے/کلو)" : "Freight & Fuel (PKR/kg)"}</span>
            <span className="font-black text-[#14231B]">₨ {transport.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={8.0}
            step={0.5}
            value={transport}
            onChange={(e) => onChangeTransport(parseFloat(e.target.value))}
            className="w-full accent-emerald-700 cursor-pointer h-1.5 bg-[#EAE4D8] rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-[#7A8C80] mt-1 font-mono">
            <span>₨0.5/kg</span>
            <span>₨8.0/kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
