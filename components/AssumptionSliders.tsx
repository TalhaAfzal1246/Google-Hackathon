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
  onReset: () => void;
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Post-Harvest Cost Parameters</h3>
            <p className="text-[11px] text-slate-500">Live client-side re-computation (&lt; 16ms reaction)</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
          title="Reset to empirical defaults"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Storage cost */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-600 font-medium">{t.storageSlider}</span>
            <span className="font-bold text-slate-900">₨ {storage.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0.02}
            max={0.45}
            step={0.01}
            value={storage}
            onChange={(e) => onChangeStorage(parseFloat(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>₨0.02/d</span>
            <span>₨0.45/d</span>
          </div>
        </div>

        {/* Spoilage rate */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-600 font-medium">{t.spoilSlider}</span>
            <span className="font-bold text-slate-900">{(spoil * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={0.001}
            max={0.03}
            step={0.001}
            value={spoil}
            onChange={(e) => onChangeSpoil(parseFloat(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0.1%/d (Grains)</span>
            <span>3.0%/d (Perishables)</span>
          </div>
        </div>

        {/* Financial carry rate */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-600 font-medium">{t.rateSlider}</span>
            <span className="font-bold text-slate-900">{(rate * 30 * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={0.0001}
            max={0.0015}
            step={0.0001}
            value={rate}
            onChange={(e) => onChangeRate(parseFloat(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>0.3%/mo</span>
            <span>4.5%/mo</span>
          </div>
        </div>

        {/* Transport cost */}
        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-600 font-medium">Freight & Fuel (PKR/kg)</span>
            <span className="font-bold text-slate-900">₨ {transport.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={8.0}
            step={0.5}
            value={transport}
            onChange={(e) => onChangeTransport(parseFloat(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>₨0.5/kg</span>
            <span>₨8.0/kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
