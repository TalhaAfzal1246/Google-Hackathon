"use client";

import { SpreadDecomposition } from "@/lib/spread";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface DecompositionBarProps {
  decomposition: SpreadDecomposition;
  date: string;
  cropName: string;
  marketName: string;
}

export default function DecompositionBar({
  decomposition,
  date,
  cropName,
  marketName,
}: DecompositionBarProps) {
  const total =
    decomposition.fuelTransportPkr +
    decomposition.handlingCommissionPkr +
    decomposition.normalStoragePkr +
    decomposition.unexplainedSurplusPkr;

  const pct = (val: number) => (total > 0 ? (val / total) * 100 : 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                decomposition.isGouging
                  ? "bg-rose-100 text-rose-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {decomposition.isGouging ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Exploitative Middleman Surplus Detected</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Competitive Distribution Spread</span>
                </>
              )}
            </span>
            <span className="text-xs text-slate-500">Date: {date}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm">
            Mandi Price Margin Decomposition ({cropName} &bull; {marketName})
          </h3>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">Unexplained Surplus</div>
          <div
            className={`text-xl font-extrabold ${
              decomposition.isGouging ? "text-rose-600" : "text-emerald-700"
            }`}
          >
            ₨ {decomposition.unexplainedSurplusPkr}/kg
            <span className="text-xs font-normal text-slate-500"> ({decomposition.unexplainedSurplusPct}%)</span>
          </div>
        </div>
      </div>

      {/* Stacked Progress Bar */}
      <div className="h-6 w-full rounded-xl overflow-hidden flex bg-slate-100 p-0.5 border border-slate-200">
        {/* Fuel & Transport */}
        <div
          style={{ width: `${pct(decomposition.fuelTransportPkr)}%` }}
          className="bg-amber-400 h-full rounded-l-lg transition-all"
          title={`Freight & Fuel: ₨ ${decomposition.fuelTransportPkr}/kg`}
        />
        {/* Commission */}
        <div
          style={{ width: `${pct(decomposition.handlingCommissionPkr)}%` }}
          className="bg-blue-400 h-full transition-all"
          title={`Arthi Commission: ₨ ${decomposition.handlingCommissionPkr}/kg`}
        />
        {/* Normal Storage */}
        <div
          style={{ width: `${pct(decomposition.normalStoragePkr)}%` }}
          className="bg-emerald-400 h-full transition-all"
          title={`Normal Storage: ₨ ${decomposition.normalStoragePkr}/kg`}
        />
        {/* Unexplained Surplus */}
        <div
          style={{ width: `${pct(decomposition.unexplainedSurplusPkr)}%` }}
          className="bg-rose-500 h-full rounded-r-lg transition-all"
          title={`Unexplained Cartel Margin: ₨ ${decomposition.unexplainedSurplusPkr}/kg`}
        />
      </div>

      {/* Legend & Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
          <span className="w-3 h-3 rounded bg-amber-400 flex-shrink-0" />
          <div>
            <div className="text-slate-500 text-[10px]">Freight & Transport</div>
            <div className="font-bold text-slate-800">₨ {decomposition.fuelTransportPkr}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
          <span className="w-3 h-3 rounded bg-blue-400 flex-shrink-0" />
          <div>
            <div className="text-slate-500 text-[10px]">Arthi Mandi Comm.</div>
            <div className="font-bold text-slate-800">₨ {decomposition.handlingCommissionPkr}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
          <span className="w-3 h-3 rounded bg-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-slate-500 text-[10px]">Normal Storage</div>
            <div className="font-bold text-slate-800">₨ {decomposition.normalStoragePkr}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-rose-50/70 border border-rose-100 rounded-lg">
          <span className="w-3 h-3 rounded bg-rose-500 flex-shrink-0" />
          <div>
            <div className="text-rose-700 text-[10px] font-semibold">Unexplained Surplus</div>
            <div className="font-bold text-rose-900">₨ {decomposition.unexplainedSurplusPkr}</div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
        <span>
          <strong>Economic Disclosure:</strong> Unexplained spreads may reflect localized distress sales, informal credit ties (peshgi), or sudden perishable sorting losses not captured in transport indices.
        </span>
      </div>
    </div>
  );
}
