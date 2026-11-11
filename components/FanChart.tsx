"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { HorizonQuantile, MarketRecord } from "@/lib/types";

interface FanChartProps {
  history: MarketRecord[];
  horizons: HorizonQuantile[];
  asOfDate: string;
  showReplay: boolean;
  bestStep: number;
}

export default function FanChart({
  history,
  horizons,
  asOfDate,
  showReplay,
  bestStep,
}: FanChartProps) {
  const chartData = useMemo(() => {
    // 1. Take up to 20 past historical points leading to asOfDate
    const past = history.slice(-20).map((r) => ({
      date: r.date.substring(5), // MM-DD
      historical: r.farmgate_price,
      p10: null,
      p25: null,
      p50: null,
      p75: null,
      p90: null,
      p10_p90_band: null,
      p25_p75_band: null,
      realized: null,
      isForecast: false,
    }));

    if (past.length === 0) return [];

    const lastHistorical = past[past.length - 1];

    // Bridge point to connect history to forecast
    const bridgePoint = {
      date: asOfDate.substring(5),
      historical: lastHistorical.historical,
      p10: lastHistorical.historical,
      p25: lastHistorical.historical,
      p50: lastHistorical.historical,
      p75: lastHistorical.historical,
      p90: lastHistorical.historical,
      p10_p90_band: [lastHistorical.historical, lastHistorical.historical],
      p25_p75_band: [lastHistorical.historical, lastHistorical.historical],
      realized: lastHistorical.historical,
      isForecast: false,
    };

    // 2. Map forward horizons
    const forward = horizons.map((h) => ({
      date: h.target_date.substring(5),
      historical: null,
      p10: h.p10,
      p25: h.p25,
      p50: h.p50,
      p75: h.p75,
      p90: h.p90,
      p10_p90_band: [h.p10, h.p90],
      p25_p75_band: [h.p25, h.p75],
      realized: showReplay ? h.realized : null,
      isForecast: true,
      horizon_days: h.horizon_days,
    }));

    return [...past.slice(0, -1), bridgePoint, ...forward];
  }, [history, horizons, asOfDate, showReplay]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            Mandi Price Trajectory & Empirical Uncertainty Cone
          </h3>
          <p className="text-xs text-slate-500">
            Solid line shows historical arrivals; shaded fan indicates P10–P90 empirical statistical confidence bounds.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            P50 Median
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
            Fair Band (P25-P75)
          </span>
          {showReplay && (
            <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
              <span className="w-3 h-0.5 bg-rose-500 inline-block" />
              Realized Market Reality
            </span>
          )}
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(v) => `₨${v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white rounded-xl p-3 text-xs shadow-xl border border-slate-700 min-w-[170px]">
                      <div className="font-bold text-slate-300 border-b border-slate-700 pb-1 mb-1.5 flex justify-between">
                        <span>Date: {label}</span>
                        {d.isForecast && (
                          <span className="text-emerald-400 font-semibold">+{d.horizon_days}d Forecast</span>
                        )}
                      </div>
                      {d.historical !== null && (
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-400">Recorded Price:</span>
                          <span className="font-bold text-emerald-400">₨ {d.historical}/kg</span>
                        </div>
                      )}
                      {d.p50 !== null && (
                        <>
                          <div className="flex justify-between py-0.5">
                            <span className="text-slate-400">P50 Median:</span>
                            <span className="font-bold text-emerald-300">₨ {d.p50}/kg</span>
                          </div>
                          <div className="flex justify-between py-0.5">
                            <span className="text-slate-400">P25 - P75 Band:</span>
                            <span className="font-mono text-slate-200">₨ {d.p25} - {d.p75}</span>
                          </div>
                          <div className="flex justify-between py-0.5">
                            <span className="text-slate-400">P10 - P90 Cone:</span>
                            <span className="font-mono text-slate-400">₨ {d.p10} - {d.p90}</span>
                          </div>
                        </>
                      )}
                      {showReplay && d.realized !== null && (
                        <div className="flex justify-between py-0.5 mt-1 border-t border-slate-800 text-rose-300">
                          <span>Actual Realized:</span>
                          <span className="font-bold">₨ {d.realized}/kg</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* P10 - P90 Outermost Light Band */}
            <Area
              type="monotone"
              dataKey="p10_p90_band"
              stroke="none"
              fill="#d1fae5"
              fillOpacity={0.4}
              isAnimationActive={false}
            />

            {/* P25 - P75 Inner Confident Band */}
            <Area
              type="monotone"
              dataKey="p25_p75_band"
              stroke="none"
              fill="#a7f3d0"
              fillOpacity={0.6}
              isAnimationActive={false}
            />

            {/* Historical Recorded Line */}
            <Line
              type="monotone"
              dataKey="historical"
              stroke="#0f766e"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: "#0f766e" }}
              activeDot={{ r: 5 }}
            />

            {/* Forecast P50 Dashed Median Line */}
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#059669"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: "#059669" }}
            />

            {/* Realized Market Reality Line (Time Machine Overlay) */}
            {showReplay && (
              <Line
                type="monotone"
                dataKey="realized"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ r: 3, fill: "#f43f5e" }}
              />
            )}

            <ReferenceLine
              x={asOfDate.substring(5)}
              stroke="#94a3b8"
              strokeDasharray="2 2"
              label={{ value: "As-Of Point", position: "top", fill: "#64748b", fontSize: 10 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
