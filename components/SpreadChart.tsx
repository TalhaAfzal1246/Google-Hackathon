"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { MarketRecord } from "@/lib/types";

interface SpreadChartProps {
  records: MarketRecord[];
  onSelectRecord?: (rec: MarketRecord) => void;
  selectedDate?: string;
}

export default function SpreadChart({
  records,
  onSelectRecord,
  selectedDate,
}: SpreadChartProps) {
  const chartData = useMemo(() => {
    // Take the last 60 records
    return records.slice(-60).map((r) => ({
      date: r.date.substring(5),
      fullDate: r.date,
      farmgate: r.farmgate_price,
      wholesale: r.wholesale_price,
      retail: r.retail_price,
      spread: r.spread_pkr,
      normalSpread: r.normal_spread_pkr,
      isAnomaly: r.is_anomaly,
      raw: r,
    }));
  }, [records]);

  return (
    <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="font-black text-[#14231B] text-sm sm:text-base">
            Farmgate to Retail Mandi Spread Monitor (60-Day Window)
          </h3>
          <p className="text-xs text-[#55695C] font-medium">
            Click on any anomaly point (highlighted in red) to inspect the middleman cost decomposition.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
            Farmgate
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-0.5 bg-indigo-600 inline-block" />
            Retail
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            Exploitative Anomaly
          </span>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload.length) {
                const rec = e.activePayload[0].payload.raw;
                if (onSelectRecord) onSelectRecord(rec);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `₨${v}`} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white rounded-xl p-3 text-xs shadow-xl border border-slate-700 min-w-[170px]">
                      <div className="font-bold text-slate-300 border-b border-slate-700 pb-1 mb-1.5 flex justify-between">
                        <span>Date: {d.fullDate}</span>
                        {d.isAnomaly && (
                          <span className="text-rose-400 font-bold uppercase text-[10px]">
                            Cartel Anomaly!
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-400">Farmgate Price:</span>
                        <span className="font-bold text-emerald-400">₨ {d.farmgate}/kg</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-400">Retail City Price:</span>
                        <span className="font-bold text-indigo-400">₨ {d.retail}/kg</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-t border-slate-800 mt-1">
                        <span className="text-slate-400">Total Spread:</span>
                        <span className={`font-bold ${d.isAnomaly ? "text-rose-400" : "text-slate-300"}`}>
                          ₨ {d.spread}/kg
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Line
              type="monotone"
              dataKey="retail"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="farmgate"
              stroke="#059669"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.isAnomaly) {
                  return (
                    <circle
                      key={`anomaly-${payload.fullDate}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      className="cursor-pointer animate-pulse"
                    />
                  );
                }
                return <circle key={`dot-${payload.fullDate}`} cx={cx} cy={cy} r={1.5} fill="#059669" />;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
