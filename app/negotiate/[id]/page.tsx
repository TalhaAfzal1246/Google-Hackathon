"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Language, DICTIONARY } from "@/lib/i18n";
import {
  Building2,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Scale,
} from "lucide-react";

interface TurnMessage {
  round: number;
  farmerOffer: number;
  buyerOffer: number;
  isDeal: boolean;
  settlementPrice: number | null;
  farmerMessage: string;
  buyerMessage: string;
  rationalNotes: string;
  verified: boolean;
  usedAI: boolean;
}

function NegotiationContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lang, setLang] = useState<Language>("ur");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferred_lang") as Language;
      if (saved === "en" || saved === "ur") setLang(saved);
      const handleStorage = () => {
        const updated = localStorage.getItem("preferred_lang") as Language;
        if (updated) setLang(updated);
      };
      window.addEventListener("languageChange", handleStorage);
      return () => window.removeEventListener("languageChange", handleStorage);
    }
  }, []);

  const t = DICTIONARY[lang];
  const isUrdu = lang === "ur";
  const ArrowIcon = isUrdu ? ArrowRight : ArrowLeft;

  const buyerName = searchParams.get("buyerName") || "Metro Cash & Carry Wholesale";
  const buyerId = searchParams.get("buyerId") || "buyer_metro";
  const cropName = searchParams.get("crop") || "Tomato";
  const qtyKg = Number(searchParams.get("qty")) || 3500;
  const farmerFloor = Number(searchParams.get("floor")) || 65;

  // Statistical Fair Band parameters
  const fairBandP25 = Math.round(farmerFloor * 1.02);
  const fairBandP50 = Math.round(farmerFloor * 1.15);
  const fairBandP75 = Math.round(farmerFloor * 1.28);
  const buyerCeiling = Math.round(farmerFloor * 1.35);

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [history, setHistory] = useState<TurnMessage[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [dealSettled, setDealSettled] = useState<boolean>(false);
  const [finalDeal, setFinalDeal] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState<boolean>(false);

  // Run a single negotiation step
  const executeStep = async (roundNum: number) => {
    if (dealSettled || loadingStep) return null;
    setLoadingStep(true);

    try {
      const res = await fetch("/api/negotiate/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          round: roundNum,
          maxRounds: 5,
          farmerFloor,
          buyerCeiling,
          fairBandP25,
          fairBandP50,
          fairBandP75,
          cropName,
          qtyKg,
          buyerName,
          farmerName: "Farmer Tariq",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const turn: TurnMessage = {
          round: roundNum,
          farmerOffer: data.farmerOffer,
          buyerOffer: data.buyerOffer,
          isDeal: data.isDeal,
          settlementPrice: data.settlementPrice,
          farmerMessage: data.dialogue.farmerMessage,
          buyerMessage: data.dialogue.buyerMessage,
          rationalNotes: data.dialogue.rationalNotes,
          verified: data.verified,
          usedAI: data.usedAI,
        };

        setHistory((prev) => [...prev, turn]);
        setCurrentRound(roundNum + 1);

        if (data.isDeal) {
          handleSettleDeal(data.settlementPrice);
        }

        return turn;
      }
    } catch (err) {
      console.error("Negotiation step error:", err);
    } finally {
      setLoadingStep(false);
    }
    return null;
  };

  // Run auto-negotiate with realistic delay
  const handleAutoNegotiate = async () => {
    if (dealSettled || isAutoRunning) return;
    setIsAutoRunning(true);

    let round = currentRound;
    while (round <= 5 && !dealSettled) {
      const step = await executeStep(round);
      if (!step || step.isDeal) break;
      round += 1;
      await new Promise((r) => setTimeout(r, 1200));
    }

    setIsAutoRunning(false);
  };

  // Settle deal in API
  const handleSettleDeal = async (settledPrice: number) => {
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: id,
          buyerId,
          buyerName,
          farmerId: "farmer_malik_tariq",
          farmerName: "Malik Tariq (Okara Farms)",
          crop: cropName.toLowerCase(),
          qtyKg,
          pricePerKg: settledPrice,
          fairBandP25,
          fairBandP75,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setDealSettled(true);
        setFinalDeal(json.deal);
      }
    } catch (err) {
      console.error("Deal settlement error:", err);
    }
  };

  const latestTurn = history[history.length - 1];

  return (
    <div className={`min-h-screen bg-[#FAF7F2] text-[#1E2621] flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Back Link & Room Header */}
        <div>
          <Link
            href="/market"
            className="inline-flex items-center gap-1.5 text-xs text-[#55695C] hover:text-[#0F3E2E] mb-3 font-bold"
          >
            <ArrowIcon className="w-3.5 h-3.5" />
            <span>{isUrdu ? "واپس منڈی مارکیٹ پر جائیں" : "Back to Marketplace"}</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-[#E8F3EC] text-[#0F3E2E] px-2.5 py-0.5 rounded-full border border-[#BDE0CB]">
                  {isUrdu ? "براہ راست تجارتی کمرہ" : "Direct Fair-Trade Room"}
                </span>
                <span className="text-xs text-[#55695C] font-semibold">
                  {isUrdu ? `لاٹ: ${qtyKg.toLocaleString()} کلوگرام ${cropName === "Tomato" ? "ٹماٹر" : cropName}` : `Lot: ${qtyKg.toLocaleString()} kg ${cropName}`}
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#14231B] mt-1 tracking-tight">
                {isUrdu ? `${buyerName} کے ساتھ براہ راست سودا` : `Bilateral Negotiation with ${buyerName}`}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoNegotiate}
                disabled={isAutoRunning || dealSettled}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0F3E2E] hover:bg-[#144E3A] disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 border border-[#0A2D21]"
              >
                {isAutoRunning ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-[#FBBF24]" />
                )}
                <span>{isUrdu ? "خودکار سودا شروع کریں" : "Auto-Negotiate"}</span>
              </button>

              <button
                onClick={() => executeStep(currentRound)}
                disabled={isAutoRunning || dealSettled || loadingStep || currentRound > 5}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#FEFDFB] border border-[#EAE4D8] text-[#2A3B30] hover:bg-[#FAF8F3] rounded-xl text-xs font-bold shadow-2xs transition-all"
              >
                <span>{isUrdu ? `راؤنڈ ${currentRound}` : `Round ${currentRound}`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistical Fair Band Bar Component */}
        <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 text-xs gap-1">
            <span className="font-extrabold text-[#14231B] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{isUrdu ? "شماریاتی منصفانہ حد [P25 - P75]" : "Statistical Fair Band Anchor [P25 - P75]"}</span>
            </span>
            <span className="text-[#55695C] font-semibold">
              {isUrdu
                ? `کم سے کم: ${farmerFloor} روپے • میڈین: ${fairBandP50} روپے • خریدار حد: ${buyerCeiling} روپے`
                : `Floor: ₨ ${farmerFloor} • Median P50: ₨ ${fairBandP50} • Ceiling: ₨ ${buyerCeiling}`}
            </span>
          </div>

          {/* Visual Band Gauge */}
          <div className="relative h-4 bg-[#FAF8F3] rounded-full overflow-hidden border border-[#EAE4D8] my-3" dir="ltr">
            {/* Fair Band Range Highlight */}
            <div
              style={{
                left: `${((fairBandP25 - farmerFloor) / (buyerCeiling - farmerFloor)) * 100}%`,
                width: `${((fairBandP75 - fairBandP25) / (buyerCeiling - farmerFloor)) * 100}%`,
              }}
              className="absolute top-0 bottom-0 bg-[#A7F3D0]/80 border-x border-[#10B981]"
              title={`Fair Band: ₨${fairBandP25} - ₨${fairBandP75}`}
            />

            {/* Current Buyer Bid Pointer */}
            {latestTurn && (
              <div
                style={{
                  left: `${((latestTurn.buyerOffer - farmerFloor) / (buyerCeiling - farmerFloor)) * 100}%`,
                }}
                className="absolute top-0 bottom-0 w-2.5 bg-[#3730A3] rounded-full -ml-1 transition-all"
                title={`Buyer Bid: ₨${latestTurn.buyerOffer}`}
              />
            )}

            {/* Current Farmer Ask Pointer */}
            {latestTurn && (
              <div
                style={{
                  left: `${((latestTurn.farmerOffer - farmerFloor) / (buyerCeiling - farmerFloor)) * 100}%`,
                }}
                className="absolute top-0 bottom-0 w-2.5 bg-[#0F3E2E] rounded-full -ml-1 transition-all"
                title={`Farmer Ask: ₨${latestTurn.farmerOffer}`}
              />
            )}
          </div>

          <div className="flex justify-between text-[11px] text-[#55695C] font-semibold" dir="ltr">
            <span>{isUrdu ? `${farmerFloor} روپے (کم از کم)` : `₨ ${farmerFloor} (Floor)`}</span>
            <span className="text-[#0F3E2E]">{isUrdu ? `${fairBandP25} روپے (P25)` : `₨ ${fairBandP25} (P25)`}</span>
            <span className="text-[#0F3E2E] font-black">{isUrdu ? `${fairBandP50} روپے (P50)` : `₨ ${fairBandP50} (P50)`}</span>
            <span className="text-[#0F3E2E]">{isUrdu ? `${fairBandP75} روپے (P75)` : `₨ ${fairBandP75} (P75)`}</span>
            <span>{isUrdu ? `${buyerCeiling} روپے (خریدار حد)` : `₨ ${buyerCeiling} (Ceiling)`}</span>
          </div>
        </div>

        {/* Deal Succeeded Banner */}
        {dealSettled && finalDeal && (
          <div className="bg-[#0F3E2E] text-white p-6 sm:p-7 rounded-3xl shadow-md border border-[#0A2D21] animate-in fade-in zoom-in-95">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-[#FDE68A]" />
                  <span className="font-black text-lg">
                    {isUrdu ? `منصفانہ سودا طے پا گیا: ₨ ${finalDeal.pricePerKg} فی کلو!` : `Fair-Trade Deal Agreed at ₨ ${finalDeal.pricePerKg}/kg!`}
                  </span>
                </div>
                <p className="text-xs text-[#A7D9C0] max-w-xl font-medium">
                  {isUrdu ? "شماریاتی منصفانہ حد کے اندر تصفیہ مکمل ہوا۔ کل مالیت: " : "Settled at equilibrium inside the statistical fair band. Total contract value: "}
                  <strong dir="ltr">₨ {finalDeal.totalAmountPkr.toLocaleString()} PKR</strong>
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur px-4 py-2.5 rounded-2xl border border-white/20 text-right">
                <div className="text-[10px] text-[#FDE68A] uppercase font-bold">{isUrdu ? "معاہدے کی کل رقم" : "Contract Total"}</div>
                <div className="text-xl font-black" dir="ltr">₨ {finalDeal.totalAmountPkr.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bilateral Message Timeline */}
        <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE4D8] pb-3">
            <h3 className="font-black text-[#14231B] text-sm sm:text-base">
              {isUrdu ? "براہ راست بولی و جوابی پیشکش کا تبادلہ" : "Live Concession Exchange & Direct Mandi Dialogue"}
            </h3>
            <span className="text-xs text-[#55695C] font-semibold">
              {isUrdu ? `راؤنڈ ${Math.min(currentRound - 1, 5)} از 5` : `Round ${Math.min(currentRound - 1, 5)} of 5`}
            </span>
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7A8C80]">
              {isUrdu
                ? 'خودکار یا دستی مذاکرات شروع کرنے کے لیے اوپر دیے گئے بٹن پر کلک کریں۔'
                : 'Click "Auto-Negotiate" or "Manual Round" to begin the automated bargaining session.'}
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((turn, i) => (
                <div key={i} className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#55695C]">
                    <span>{isUrdu ? `راؤنڈ ${turn.round}` : `Round ${turn.round}`}</span>
                    <span className="font-mono text-[#14231B]" dir="ltr">
                      Spread: ₨ {Math.abs(turn.farmerOffer - turn.buyerOffer)}/kg
                    </span>
                  </div>

                  {/* Farmer Message Bubble */}
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-[#E8F3EC] text-[#0F3E2E] flex items-center justify-center shrink-0 text-xs font-bold border border-[#BDE0CB]">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="bg-[#F5FAF6] border border-[#BDE0CB] rounded-2xl p-3 text-xs text-[#14231B]">
                      <div className="flex items-center justify-between gap-4 mb-1 font-bold text-[#0F3E2E]">
                        <span>{isUrdu ? "کسان طارق" : "Farmer Tariq"}</span>
                        <span dir="ltr">Ask: ₨ {turn.farmerOffer}/kg</span>
                      </div>
                      <p className="leading-relaxed">{turn.farmerMessage}</p>
                    </div>
                  </div>

                  {/* Buyer Message Bubble */}
                  <div className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-[#EBE9F5] text-[#3730A3] flex items-center justify-center shrink-0 text-xs font-bold border border-[#C7D2FE]">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="bg-[#FAF8F3] border border-[#EAE4D8] rounded-2xl p-3 text-xs text-[#14231B] text-right">
                      <div className="flex items-center justify-between gap-4 mb-1 font-bold text-[#3730A3] flex-row-reverse">
                        <span>{buyerName}</span>
                        <span dir="ltr">Bid: ₨ {turn.buyerOffer}/kg</span>
                      </div>
                      <p className="leading-relaxed">{turn.buyerMessage}</p>
                    </div>
                  </div>

                  {/* Verification Pill */}
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#55695C]">
                    {turn.verified ? (
                      <span className="inline-flex items-center gap-1 text-[#0F3E2E] bg-[#E8F3EC] px-2.5 py-0.5 rounded-full border border-[#BDE0CB] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>{isUrdu ? "تمام پیشکشوں کی شماریاتی تصدیق مکمل ✓" : "All numerical offers deterministically verified ✓"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#92400E] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#FCD34D] font-bold">
                        <AlertCircle className="w-3 h-3 text-amber-700" />
                        <span>{isUrdu ? "شماریاتی تخمینہ" : "Statistical Projection"}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function NegotiationPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading deal room...</div>}>
      <NegotiationContent id="deal" />
    </Suspense>
  );
}
