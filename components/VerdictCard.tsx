"use client";

import { useState, useEffect } from "react";
import { VerdictResult } from "@/lib/types";
import { Language, DICTIONARY } from "@/lib/i18n";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Wheat,
  Volume2,
  VolumeX,
  Sparkles,
  Store,
} from "lucide-react";

interface VerdictCardProps {
  verdict: VerdictResult;
  lang: Language;
  onListProduce?: () => void;
  todayPrice?: number;
  qtyKg?: number;
  cropName?: string;
  cropNameUr?: string;
  marketName?: string;
  marketNameUr?: string;
}

export default function VerdictCard({
  verdict,
  lang,
  onListProduce,
  todayPrice = 175,
  qtyKg = 2000,
  cropName = "Tomato",
  cropNameUr = "ٹماٹر",
  marketName = "Lahore (Badami Bagh)",
  marketNameUr = "لاہور (بادامی باغ)",
}: VerdictCardProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const t = DICTIONARY[lang];
  const isUrdu = lang === "ur";
  const isHold = verdict.bestStep > 0;

  // Maund calculations (1 Maund = 40 kg in Pakistan)
  const maunds = Math.round(qtyKg / 40);
  const totalExtraCash = Math.max(0, Math.round(verdict.gain * qtyKg));
  const maundPriceToday = Math.round(todayPrice * 40);
  const maundPriceFuture = Math.round((todayPrice + Math.max(0, verdict.gain)) * 40);

  // Stop speech when unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Audio speech synthesis is not supported on this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Prepare clear, conversational script
    let spokenText = "";
    if (isUrdu) {
      if (isHold) {
        spokenText = `السلام علیکم کسان بھائی! آج ${marketNameUr} میں ${cropNameUr} کا بھاؤ ${todayPrice} روپے کلو یعنی ${maundPriceToday} روپے فی من ہے۔ ہمارا مشورہ ہے کہ آپ اپنی فصل ${verdict.bestStep} دن روک لیں۔ متوقع ریٹ ${todayPrice + verdict.gain} روپے کلو ہو جائے گا۔ کولڈ سٹوریج کا خرچ نکالنے کے بعد آپ کے ${maunds} من پر تقریباً ${totalExtraCash.toLocaleString()} روپے اضافی منافع ہوگا۔`;
      } else {
        spokenText = `السلام علیکم کسان بھائی! آج ${marketNameUr} میں ${cropNameUr} کا بھاؤ ${todayPrice} روپے کلو یعنی ${maundPriceToday} روپے فی من ہے۔ ہمارا مشورہ ہے کہ آپ آج ہی فصل بیچ دیں۔ منڈی میں رسد زیادہ ہے اور فصل روکنے سے سٹوریج اور خراب ہونے کا نقصان ہوگا۔`;
      }
    } else {
      if (isHold) {
        spokenText = `Hello respected farmer. Today's rate for ${cropName} in ${marketName} is ₨ ${todayPrice} per kilogram, or ₨ ${maundPriceToday} per maund. Our recommendation is to hold your harvest for ${verdict.bestStep} days. The price is projected to reach ₨ ${todayPrice + verdict.gain} per kilogram. For your ${maunds} maunds, your estimated additional profit will be ₨ ${totalExtraCash.toLocaleString()}.`;
      } else {
        spokenText = `Hello respected farmer. Today's rate for ${cropName} in ${marketName} is ₨ ${todayPrice} per kilogram. Our recommendation is to sell immediately. Mandi arrivals are elevated and post-harvest storage costs will outweigh projected price gains.`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = isUrdu ? "ur-PK" : "en-US";
    utterance.rate = 0.92; // Slightly measured and friendly pace

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border-2 p-6 sm:p-8 shadow-md transition-all ${
        isHold
          ? "border-amber-400 bg-gradient-to-br from-amber-50 via-white to-amber-100/40"
          : "border-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40"
      }`}
    >
      {/* Top Tag & Audio Readout Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              isHold
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-emerald-600 text-white shadow-xs"
            }`}
          >
            {isHold ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {isUrdu ? "مستقبل کا کسان فیصلہ" : "Mandi AI Decision"}
          </span>

          <span className="inline-flex items-center gap-1 text-xs text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full font-bold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {isUrdu ? "حقیقی سرکاری منڈی ریٹ" : "Authentic AMIS Mandi Data"}
          </span>
        </div>

        {/* 🔊 Audio Voice Playback Button */}
        <button
          onClick={handleToggleAudio}
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shadow-sm active:scale-95 ${
            isPlayingAudio
              ? "bg-rose-600 text-white animate-pulse"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
          title={isUrdu ? "آواز میں سنیں" : "Listen in Voice"}
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>{isUrdu ? "آواز بند کریں" : "Stop Voice"}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>{isUrdu ? "🔊 مشورہ آواز میں سنیں (اردو)" : "🔊 Listen Spoken Advice"}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Big Verdict Headline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3">
            <span className="text-4xl sm:text-5xl">
              {isHold ? "🟡" : "🟢"}
            </span>
            <div>
              <h2
                className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight ${
                  isHold ? "text-amber-950" : "text-emerald-950"
                } ${isUrdu ? "font-urdu text-3xl sm:text-4xl" : ""}`}
              >
                {isUrdu ? verdict.verdict_ur : verdict.verdict}
              </h2>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                {cropName} ({cropNameUr}) &bull; {marketName}
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
            {isHold ? (
              isUrdu ? (
                <>
                  منڈی میں سپلائی کم ہو رہی ہے۔ فصل <strong className="text-amber-900 font-extrabold">{verdict.bestStep} دن</strong> روک کر کولڈ سٹوریج اور ممکنہ نقصان کا خرچ نکالنے کے بعد بھی زیادہ منافع ملے گا۔
                </>
              ) : (
                <>
                  Market supply is tightening. Holding for <strong className="text-amber-900 font-extrabold">{verdict.bestStep} days</strong> yields higher net returns even after subtracting cold storage and spoilage costs.
                </>
              )
            ) : (
              isUrdu ? (
                <>
                  منڈی میں مال کی آمد بہت تیز ہے۔ فصل روکنے سے سٹوریج اور خراب ہونے کا نقصان زیادہ ہوگا۔ <strong className="text-emerald-900 font-extrabold">آج ہی منڈی میں بیچنا</strong> سب سے محفوظ فیصلہ ہے۔
                </>
              ) : (
                <>
                  Mandi arrivals are heavy. Post-harvest storage and perishability costs exceed projected price gains. <strong className="text-emerald-900 font-extrabold">Selling today</strong> protects your hard-earned profit.
                </>
              )
            )}
          </p>

          {/* Maund and Cash summary badge */}
          {isHold && totalExtraCash > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100/90 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {isUrdu
                  ? `آپ کے ${maunds} من (${qtyKg.toLocaleString()} کلو) پر کل متوقع اضافی بچت: ₨ ${totalExtraCash.toLocaleString()}`
                  : `Total estimated extra profit on your ${maunds} Maunds (${qtyKg.toLocaleString()} kg): ₨ ${totalExtraCash.toLocaleString()}`}
              </span>
            </div>
          )}
        </div>

        {/* Right Metric Boxes - Layman numbers */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          {/* Today's Price */}
          <div className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-xs text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isUrdu ? "آج کا ریٹ" : "Today's Rate"}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              ₨ {todayPrice}
              <span className="text-xs font-semibold text-slate-500">/kg</span>
            </div>
            <div className="text-xs font-bold text-slate-600 mt-0.5">
              ₨ {maundPriceToday.toLocaleString()} <span className="font-normal text-[11px]">{isUrdu ? "/من" : "/Maund"}</span>
            </div>
          </div>

          {/* Target Future Rate */}
          <div className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-xs text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isHold ? (isUrdu ? `${verdict.bestStep} دن بعد متوقع` : `In ${verdict.bestStep} Days`) : (isUrdu ? "منصفانہ کم سے کم ریٹ" : "Floor Rate")}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              ₨ {todayPrice + Math.max(0, verdict.gain)}
              <span className="text-xs font-semibold text-slate-500">/kg</span>
            </div>
            <div className="text-xs font-bold text-emerald-800 mt-0.5">
              ₨ {maundPriceFuture.toLocaleString()} <span className="font-normal text-[11px]">{isUrdu ? "/من" : "/Maund"}</span>
            </div>
          </div>

          {/* Net Extra Per Kg */}
          <div className="col-span-2 bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-200">
                {isUrdu ? "خالص اضافی منافع (سٹوریج نکال کر)" : "Net Extra Gain (Post Costs)"}
              </span>
              <div className="text-2xl sm:text-3xl font-black mt-0.5 flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-amber-300" />
                <span>+₨ {verdict.gain}</span>
                <span className="text-xs font-semibold text-emerald-200">/kg</span>
                <span className="text-xs font-bold text-amber-300 ml-1">
                  (+₨ {Math.round(verdict.gain * 40)}/من)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-200">ROI Yield</span>
              <div className="text-lg font-black text-amber-300">
                {verdict.gainPercent > 0 ? `+${verdict.gainPercent}%` : "Benchmark"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {onListProduce && (
        <div className="mt-6 pt-5 border-t border-slate-300/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600 font-medium">
            {isUrdu
              ? "مستقبل کے کسان پلیٹ فارم کے ذریعے بغیر آڑھتی کٹوتی کے تصدیق شدہ بیوپاریوں کو براہ راست بیچیں۔"
              : "Sell directly to verified buyers without exploitative middleman commission deductions."}
          </p>

          <button
            onClick={onListProduce}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm hover:shadow transition-all active:scale-95"
          >
            <Store className="w-4 h-4 text-amber-300" />
            <span>{isUrdu ? "براہ راست خریداروں کو آفر بھیجیں" : t.listProduceBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
