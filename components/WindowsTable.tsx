"use client";

import { WindowResult, HorizonQuantile } from "@/lib/types";

interface WindowsTableProps {
  windows: WindowResult[];
  horizons: HorizonQuantile[];
  todayPrice: number;
  bestStep: number;
}

export default function WindowsTable({
  windows,
  horizons,
  todayPrice,
  bestStep,
}: WindowsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-sm">
          Harvest Horizon Evaluation Window ($t+3$ to $t+30$ Days)
        </h3>
        <span className="text-xs text-slate-500">
          Evaluated against Risk-Adjusted Net Return
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-4">Horizon</th>
              <th className="py-2.5 px-4">Target Date</th>
              <th className="py-2.5 px-4">P50 Price</th>
              <th className="py-2.5 px-4">P10 Downside</th>
              <th className="py-2.5 px-4">P90 Upside</th>
              <th className="py-2.5 px-4">Net Return (50%)</th>
              <th className="py-2.5 px-4">Net Return (10%)</th>
              <th className="py-2.5 px-4">Strategic Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Immediate Sale Baseline */}
            <tr className={`hover:bg-slate-50/60 ${bestStep === 0 ? "bg-emerald-50/50 font-semibold" : ""}`}>
              <td className="py-2.5 px-4 font-medium text-slate-900">Today ($t+0$)</td>
              <td className="py-2.5 px-4 text-slate-500">Current Mandi Auction</td>
              <td className="py-2.5 px-4 font-mono font-bold text-slate-800">₨ {todayPrice}</td>
              <td className="py-2.5 px-4 font-mono text-slate-500">₨ {todayPrice}</td>
              <td className="py-2.5 px-4 font-mono text-slate-500">₨ {todayPrice}</td>
              <td className="py-2.5 px-4 font-mono text-slate-700">₨ {todayPrice}</td>
              <td className="py-2.5 px-4 font-mono text-slate-700">₨ {todayPrice}</td>
              <td className="py-2.5 px-4">
                {bestStep === 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    ★ Optimal Window
                  </span>
                ) : (
                  <span className="text-slate-400">Baseline</span>
                )}
              </td>
            </tr>

            {/* Evaluated horizons */}
            {windows.map((w) => {
              const h = horizons.find((item) => item.horizon_days === w.step);
              const isBest = w.step === bestStep && bestStep > 0;
              return (
                <tr
                  key={w.step}
                  className={`hover:bg-slate-50/60 transition-colors ${
                    isBest ? "bg-amber-50/60 font-semibold" : ""
                  }`}
                >
                  <td className="py-2.5 px-4 font-medium text-slate-900">
                    +{w.step} Days
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {h?.target_date || `Day +${w.step}`}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-800">
                    ₨ {h?.p50 ?? "—"}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">
                    ₨ {h?.p10 ?? "—"}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">
                    ₨ {h?.p90 ?? "—"}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">
                    ₨ {w.net50}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-600">
                    ₨ {w.net10}
                  </td>
                  <td className="py-2.5 px-4">
                    {isBest ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200 text-amber-900">
                        ★ Recommended Target
                      </span>
                    ) : (
                      <span className="text-slate-400">Sub-optimal</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
