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
import { Language } from "@/lib/i18n";

interface SpreadChartProps {
  records: MarketRecord[];
  onSelectRecord?: (rec: MarketRecord) => void;
  selectedDate?: string;
  lang?: Language;
}

export default function SpreadChart({
  records,
  onSelectRecord,
  selectedDate,
  lang = "ur",
}: SpreadChartProps) {
  const isUrdu = lang === "ur";

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
    <div className={`bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="font-black text-[#14231B] text-sm sm:text-base">
            {isUrdu
              ? "فارم گیٹ تا ریٹیل منڈی مارجن مانیٹر (60 روزہ جائزہ)"
              : "Farmgate to Retail Mandi Spread Monitor (60-Day Window)"}
          </h3>
          <p className="text-xs text-[#55695C] font-medium">
            {isUrdu
              ? "غیر معمولی منافع اور کٹوتیوں کی تفصیلی لاگت دیکھنے کے لیے لال نشان پر کلک کریں۔"
              : "Click on any anomaly point (highlighted in red) to inspect the middleman cost decomposition."}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap" dir="ltr">
          <span className="flex items-center gap-1.5 text-[#55695C] font-semibold">
            <span className="w-3 h-1 bg-emerald-600 rounded-full inline-block" />
            <span>{isUrdu ? "فارم گیٹ ریٹ" : "Farmgate"}</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#55695C] font-semibold">
            <span className="w-3 h-1 bg-indigo-600 rounded-full inline-block" />
            <span>{isUrdu ? "ریٹیل قیمت" : "Retail"}</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#991B1B] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse" />
            <span>{isUrdu ? "غیر معمولی کٹوتی" : "Cartel Anomaly"}</span>
          </span>
        </div>
      </div>

      <div className="h-[280px] w-full" dir="ltr">
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
                    <div className="bg-[#14231B] text-white rounded-2xl p-3 text-xs shadow-xl border border-[#2A3B30] min-w-[190px]">
                      <div className="font-bold text-[#A7D9C0] border-b border-[#2A3B30] pb-1.5 mb-2 flex justify-between items-center">
                        <span>Date: {d.fullDate}</span>
                        {d.isAnomaly && (
                          <span className="text-[#FECACA] bg-[#991B1B] px-1.5 py-0.5 rounded text-[10px] font-black uppercase">
                            {isUrdu ? "غیر معمولی منافع!" : "Cartel Anomaly!"}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-stone-300">{isUrdu ? "کسان کو ملا:" : "Farmgate Price:"}</span>
                        <span className="font-bold text-emerald-400" dir="ltr">₨ {d.farmgate}/kg</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-stone-300">{isUrdu ? "ریٹیل قیمت:" : "Retail City Price:"}</span>
                        <span className="font-bold text-indigo-300" dir="ltr">₨ {d.retail}/kg</span>
                      </div>
                      <div className="flex justify-between py-1 border-t border-[#2A3B30] mt-1.5">
                        <span className="text-stone-300 font-medium">{isUrdu ? "کل منافع مارجن:" : "Total Spread:"}</span>
                        <span className={`font-black ${d.isAnomaly ? "text-[#FECACA]" : "text-white"}`} dir="ltr">
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
