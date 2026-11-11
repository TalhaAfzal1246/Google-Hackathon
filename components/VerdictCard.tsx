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
  ArrowLeft,
  Volume2,
  VolumeX,
  Store,
  Coins,
  Scale,
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
  const [activeVoiceLang, setActiveVoiceLang] = useState<"ur" | "en" | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const t = DICTIONARY[lang];
  const isUrdu = lang === "ur";
  const isHold = verdict.bestStep > 0;
  const ArrowIcon = isUrdu ? ArrowLeft : ArrowRight;

  // Maund calculations (1 Maund = 40 kg in Pakistan)
  const maunds = Math.round(qtyKg / 40);
  const totalExtraCash = Math.max(0, Math.round(verdict.gain * qtyKg));
  const maundPriceToday = Math.round(todayPrice * 40);
  const maundPriceFuture = Math.round((todayPrice + Math.max(0, verdict.gain)) * 40);

  // Stop speech when unmounting
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setActiveVoiceLang(null);
  };

  const fallbackSpeechSynthesis = (text: string, targetLang: "ur" | "en") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setActiveVoiceLang(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang === "ur" ? "ur-PK" : "en-US";
    utterance.rate = 0.92;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) =>
      targetLang === "ur"
        ? v.lang.startsWith("ur") || v.name.toLowerCase().includes("urdu") || v.lang.startsWith("hi")
        : v.lang.startsWith("en")
    );
    if (match) utterance.voice = match;

    utterance.onend = () => setActiveVoiceLang(null);
    utterance.onerror = () => setActiveVoiceLang(null);

    window.speechSynthesis.speak(utterance);
  };

  const playVoice = (targetLang: "ur" | "en") => {
    if (activeVoiceLang === targetLang) {
      stopAudio();
      return;
    }

    stopAudio();

    const spokenText =
      targetLang === "ur"
        ? isHold
          ? `کسان بھائی! مشورہ ہے کہ ${cropNameUr} کو ${verdict.bestStep} دن روکیں۔ متوقع منافع ₨ ${Math.round(verdict.gain)} فی کلو زیادہ ہوگا۔ کل متوقع اضافی منافع ₨ ${totalExtraCash.toLocaleString()} بنے گا۔`
          : `کسان بھائی! مشورہ ہے کہ ${cropNameUr} آج ہی فروخت کر دیں۔ آج کا ریٹ ₨ ${todayPrice} فی کلو ہے جو کہ ₨ ${maundPriceToday.toLocaleString()} فی من بنتا ہے۔ آگے قیمت گرنے کا خدشہ ہے۔`
        : isHold
        ? `Advisory recommendation: Hold ${cropName} for ${verdict.bestStep} days in ${marketName}. Projected net gain is PKR ${Math.round(verdict.gain)} per kilogram. Total projected extra income is PKR ${totalExtraCash.toLocaleString()}.`
        : `Advisory recommendation: Sell ${cropName} now in ${marketName}. Today's price is PKR ${todayPrice} per kilogram, or PKR ${maundPriceToday.toLocaleString()} per maund.`;

    setActiveVoiceLang(targetLang);

    // Primary: Google Neural Voice API
    try {
      const audioUrl = `/api/voice?lang=${targetLang}&text=${encodeURIComponent(spokenText)}`;
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);

      audio.onended = () => {
        setActiveVoiceLang(null);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        fallbackSpeechSynthesis(spokenText, targetLang);
      };

      audio.play().catch(() => {
        fallbackSpeechSynthesis(spokenText, targetLang);
      });
    } catch {
      fallbackSpeechSynthesis(spokenText, targetLang);
    }
  };

  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 border-2 shadow-sm transition-all ${
        isHold
          ? "border-[#F59E0B] bg-gradient-to-br from-[#FFFDF5] via-[#FFFBEB] to-[#FEF3C7]/40"
          : "border-[#10B981] bg-gradient-to-br from-[#F5FAF6] via-[#FAF7F2] to-[#E8F3EC]/50"
      }`}
    >
      {/* Top Tag & Audio Readout Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              isHold
                ? "bg-[#D97706] text-white shadow-xs"
                : "bg-[#0F3E2E] text-white shadow-xs"
            }`}
          >
            {isHold ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {isUrdu ? "سرکاری منڈی مشورہ" : "Mandi Advisory Decision"}
          </span>

          <span className="inline-flex items-center gap-1 text-xs text-[#2A3B30] bg-[#FEFDFB] border border-[#EAE4D8] px-3 py-1 rounded-full font-bold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            {isUrdu ? "حقیقی سرکاری منڈی ریٹ" : "Authentic AMIS Mandi Data"}
          </span>
        </div>

        {/* 🔊 Explicit Urdu & English Audio Buttons */}
        <div className="flex items-center gap-2">
          {/* Urdu Voice Button */}
          <button
            onClick={() => playVoice("ur")}
            type="button"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all shadow-sm active:scale-95 border ${
              activeVoiceLang === "ur"
                ? "bg-[#D97706] text-white border-[#B45309] ring-2 ring-amber-300 animate-pulse"
                : "bg-[#0F3E2E] hover:bg-[#144E3A] text-white border-[#0A2D21]"
            }`}
            title="اردو میں سنیں"
          >
            {activeVoiceLang === "ur" ? (
              <>
                <VolumeX className="w-4 h-4 text-[#FDE68A]" />
                <span className="font-urdu">⏹ آواز بند کریں</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#FDE68A]" />
                <span className="font-urdu">🔊 اردو میں سنیں</span>
              </>
            )}
          </button>

          {/* English Voice Button */}
          <button
            onClick={() => playVoice("en")}
            type="button"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 border ${
              activeVoiceLang === "en"
                ? "bg-[#3730A3] text-white border-[#312E81] ring-2 ring-indigo-300 animate-pulse"
                : "bg-[#1E2621] hover:bg-[#2B3630] text-white border-[#141A17]"
            }`}
            title="Listen in English"
          >
            {activeVoiceLang === "en" ? (
              <>
                <VolumeX className="w-4 h-4 text-indigo-300" />
                <span>⏹ Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#D6CEBF]" />
                <span>🔊 English</span>
              </>
            )}
          </button>
        </div>
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
                  isHold ? "text-[#78350F]" : "text-[#0F3E2E]"
                } ${isUrdu ? "font-urdu text-3xl sm:text-4xl" : ""}`}
              >
                {isUrdu ? verdict.verdict_ur : verdict.verdict}
              </h2>
              <div className="text-xs sm:text-sm font-bold text-[#55695C] mt-1">
                {cropName} ({cropNameUr}) &bull; {marketName}
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm sm:text-base text-[#2A3B30] leading-relaxed font-medium">
            {isHold ? (
              isUrdu ? (
                <>
                  منڈی میں سپلائی کم ہو رہی ہے۔ فصل <strong className="text-[#853E06] font-extrabold">{verdict.bestStep} دن</strong> روک کر کولڈ سٹوریج اور ممکنہ نقصان کا خرچ نکالنے کے بعد بھی زیادہ منافع ملے گا۔
                </>
              ) : (
                <>
                  Expected wholesale arrivals are tightening. Holding for{" "}
                  <strong className="text-[#853E06] font-extrabold">{verdict.bestStep} days</strong> yields net profit after factoring in daily storage and spoilage costs.
                </>
              )
            ) : (
              isUrdu ? (
                <>
                  منڈی میں رسد تیزی سے بڑھنے والی ہے اور آگے قیمت گرنے کا خدشہ ہے۔ اپنی فصل <strong className="text-[#0F3E2E] font-extrabold">آج ہی فوری</strong> فروخت کرنا محفوظ ترین فیصلہ ہے۔
                </>
              ) : (
                <>
                  Supply inflows are accelerating into wholesale markets. Selling today locks in your top harvest margin before downstream supply gluts depress prices.
                </>
              )
            )}
          </p>
        </div>

        {/* Financial Net Metric Card (Warm Cream Surface) */}
        <div className="lg:col-span-5 bg-[#FEFDFB] rounded-3xl p-5 border border-[#EAE4D8] shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#EAE4D8] pb-3 mb-3">
            <span className="text-xs text-[#55695C] font-bold">
              {isUrdu ? "آج کا منڈی ریٹ:" : "Today's Mandi Rate:"}
            </span>
            <div className="text-right">
              <span className="text-base font-black text-[#14231B]">₨ {todayPrice}/kg</span>
              <span className="text-xs text-[#55695C] block">₨ {maundPriceToday.toLocaleString()}/من</span>
            </div>
          </div>

          {isHold && (
            <div className="flex items-center justify-between border-b border-[#EAE4D8] pb-3 mb-3">
              <span className="text-xs text-[#55695C] font-bold">
                {isUrdu ? `متوقع ریٹ (${verdict.bestStep} دن بعد):` : `Target Price (+${verdict.bestStep}d):`}
              </span>
              <div className="text-right">
                <span className="text-base font-black text-[#853E06]">₨ {Math.round(todayPrice + verdict.gain)}/kg</span>
                <span className="text-xs text-[#853E06] font-bold block">₨ {maundPriceFuture.toLocaleString()}/من</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-black text-[#14231B] uppercase tracking-wider">
              {isHold ? (isUrdu ? "کل متوقع اضافی منافع:" : "Total Extra Cash:") : (isUrdu ? "محفوظ شدہ آمدن:" : "Guaranteed Cash:")}
            </span>
            <div className="text-right">
              <span className={`text-xl sm:text-2xl font-black ${isHold ? "text-[#0F3E2E]" : "text-[#14231B]"}`}>
                ₨ {(isHold ? totalExtraCash : todayPrice * qtyKg).toLocaleString()}
              </span>
              <span className="text-[11px] text-[#55695C] block">
                {maunds.toLocaleString()} {isUrdu ? "من کے لیے" : "Maunds"}
              </span>
            </div>
          </div>

          {onListProduce && (
            <button
              onClick={onListProduce}
              className="w-full mt-4 py-3 bg-[#0F3E2E] hover:bg-[#144E3A] text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <Store className="w-4 h-4 text-[#FBBF24]" />
              <span>{isUrdu ? "منصفانہ منڈی میں فصل پیش کریں" : "Sell on Wholesale Exchange"}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
