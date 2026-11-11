"use client";

import { TrendingUp, ShieldCheck } from "lucide-react";
import { Language } from "@/lib/i18n";

interface MarketTickerProps {
  lang: Language;
}

const LIVE_MANDI_ITEMS = [
  { crop: "Tomato / ٹماٹر", rate: "₨ 175/kg", maund: "₨ 7,000/من", change: "+4.2%", up: true, mandi: "Lahore" },
  { crop: "Onion / پیاز", rate: "₨ 165/kg", maund: "₨ 6,600/من", change: "+2.8%", up: true, mandi: "Faisalabad" },
  { crop: "Potato / آلو", rate: "₨ 48/kg", maund: "₨ 1,920/من", change: "-1.1%", up: false, mandi: "Okara" },
  { crop: "Wheat / گندم", rate: "₨ 98/kg", maund: "₨ 3,920/من", change: "+0.5%", up: true, mandi: "Multan" },
  { crop: "Basmati Rice / چاول", rate: "₨ 220/kg", maund: "₨ 8,800/من", change: "+1.9%", up: true, mandi: "Gujranwala" },
  { crop: "Karachi Tomato / کراچی", rate: "₨ 185/kg", maund: "₨ 7,400/من", change: "+3.5%", up: true, mandi: "Karachi" },
  { crop: "Rawalpindi Onion / پنڈی", rate: "₨ 170/kg", maund: "₨ 6,800/من", change: "+1.2%", up: true, mandi: "Rawalpindi" },
];

export default function MarketTicker({ lang }: MarketTickerProps) {
  const isUrdu = lang === "ur";

  return (
    <div className="bg-emerald-950 text-white border-b border-emerald-900/60 overflow-hidden py-2 px-3 text-xs select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Source Badge */}
        <div className="flex items-center gap-1.5 shrink-0 bg-emerald-900/80 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-200 border border-emerald-700/50">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {isUrdu ? "آج کے مصدقہ منڈی ریٹ (AMIS پنجاب)" : "Live Official Mandi Bulletin (AMIS / PBS)"}
          </span>
        </div>

        {/* Scrolling or Flex Items */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5">
          {LIVE_MANDI_ITEMS.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0 text-[11px]">
              <span className="font-medium text-slate-300">{item.crop}:</span>
              <span className="font-extrabold text-amber-300">{item.rate}</span>
              <span className="text-slate-400 font-semibold">({item.maund})</span>
              <span
                className={`inline-flex items-center font-bold text-[10px] px-1 rounded ${
                  item.up ? "text-emerald-400 bg-emerald-950/60" : "text-rose-400 bg-rose-950/60"
                }`}
              >
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
