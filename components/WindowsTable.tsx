"use client";

import { WindowResult, HorizonQuantile } from "@/lib/types";
import { Language } from "@/lib/i18n";

interface WindowsTableProps {
  windows: WindowResult[];
  horizons: HorizonQuantile[];
  todayPrice: number;
  bestStep: number;
  lang?: Language;
}

export default function WindowsTable({
  windows,
  horizons,
  todayPrice,
  bestStep,
  lang = "ur",
}: WindowsTableProps) {
  const isUrdu = lang === "ur";

  return (
    <div className={`bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] overflow-hidden shadow-xs ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <div className="px-5 py-3.5 bg-[#FAF8F3] border-b border-[#EAE4D8] flex items-center justify-between">
        <h3 className="font-black text-[#14231B] text-sm">
          {isUrdu ? "فصل کٹائی کی مدت اور منافع کا موازنہ (3 تا 30 دن)" : "Harvest Horizon Evaluation Window (t+3 to t+30 Days)"}
        </h3>
        <span className="text-xs text-[#55695C] font-semibold">
          {isUrdu ? "خطرے کے مطابق خالص منافع کا حساب" : "Evaluated against Risk-Adjusted Net Return"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left" dir={isUrdu ? "rtl" : "ltr"}>
          <thead className="bg-[#FAF8F3] text-[#55695C] font-bold border-b border-[#EAE4D8]">
            <tr>
              <th className="py-2.5 px-4">{isUrdu ? "مدت" : "Horizon"}</th>
              <th className="py-2.5 px-4">{isUrdu ? "تاریخ" : "Target Date"}</th>
              <th className="py-2.5 px-4">{isUrdu ? "میڈین قیمت (P50)" : "P50 Price"}</th>
              <th className="py-2.5 px-4">{isUrdu ? "کم ترین (P10)" : "P10 Downside"}</th>
              <th className="py-2.5 px-4">{isUrdu ? "زیادہ ترین (P90)" : "P90 Upside"}</th>
              <th className="py-2.5 px-4">{isUrdu ? "خالص منافع (50%)" : "Net Return (50%)"}</th>
              <th className="py-2.5 px-4">{isUrdu ? "خالص منافع (10%)" : "Net Return (10%)"}</th>
              <th className="py-2.5 px-4">{isUrdu ? "حکمت عملی" : "Strategic Status"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE4D8]">
            {/* Immediate Sale Baseline */}
            <tr className={`hover:bg-[#FAF8F3] ${bestStep === 0 ? "bg-[#E8F3EC] font-semibold" : ""}`}>
              <td className="py-2.5 px-4 font-bold text-[#14231B]">{isUrdu ? "آج کا دن" : "Today (t+0)"}</td>
              <td className="py-2.5 px-4 text-[#55695C]">{isUrdu ? "موجودہ منڈی بولی" : "Current Mandi Auction"}</td>
              <td className="py-2.5 px-4 font-mono font-bold text-[#14231B]" dir="ltr">₨ {todayPrice}</td>
              <td className="py-2.5 px-4 font-mono text-[#55695C]" dir="ltr">₨ {todayPrice}</td>
              <td className="py-2.5 px-4 font-mono text-[#55695C]" dir="ltr">₨ {todayPrice}</td>
              <td className="py-2.5 px-4 font-mono text-[#14231B]" dir="ltr">₨ {todayPrice}</td>
              <td className="py-2.5 px-4 font-mono text-[#14231B]" dir="ltr">₨ {todayPrice}</td>
              <td className="py-2.5 px-4">
                {bestStep === 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#BDE0CB] text-[#0F3E2E]">
                    ★ {isUrdu ? "بہترین وقت" : "Optimal Window"}
                  </span>
                ) : (
                  <span className="text-[#7A8C80]">{isUrdu ? "بنیادی ریٹ" : "Baseline"}</span>
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
                  className={`hover:bg-[#FAF8F3] transition-colors ${
                    isBest ? "bg-[#FEF3C7] font-semibold" : ""
                  }`}
                >
                  <td className="py-2.5 px-4 font-bold text-[#14231B]">
                    +{w.step} {isUrdu ? "دن" : "Days"}
                  </td>
                  <td className="py-2.5 px-4 text-[#55695C]" dir="ltr">
                    {h?.target_date || `Day +${w.step}`}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[#14231B]" dir="ltr">
                    ₨ {h?.p50 ?? "—"}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[#55695C]" dir="ltr">
                    ₨ {h?.p10 ?? "—"}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[#55695C]" dir="ltr">
                    ₨ {h?.p90 ?? "—"}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-[#0F3E2E]" dir="ltr">
                    ₨ {w.net50}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[#55695C]" dir="ltr">
                    ₨ {w.net10}
                  </td>
                  <td className="py-2.5 px-4">
                    {isBest ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FDE68A] text-[#92400E]">
                        ★ {isUrdu ? "تجویز کردہ ہدف" : "Recommended Target"}
                      </span>
                    ) : (
                      <span className="text-[#8A9B8F]">{isUrdu ? "قابل عمل" : "Viable"}</span>
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
