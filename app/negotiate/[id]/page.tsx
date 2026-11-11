"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Language, DICTIONARY } from "@/lib/i18n";
import {
  Sparkles,
  Bot,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  ArrowLeft,
  DollarSign,
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

  const [lang, setLang] = useState<Language>("en");
  const t = DICTIONARY[lang];
  const isUrdu = lang === "ur";

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
    <div className={`min-h-screen bg-slate-50 flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Back Link & Room Header */}
        <div>
          <Link
            href="/market"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                  Autonomous Room
                </span>
                <span className="text-xs text-slate-500">Lot: {qtyKg.toLocaleString()} kg {cropName}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                Bilateral Negotiation with {buyerName}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoNegotiate}
                disabled={isAutoRunning || dealSettled}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                {isAutoRunning ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>Auto-Negotiate</span>
              </button>

              <button
                onClick={() => executeStep(currentRound)}
                disabled={isAutoRunning || dealSettled || loadingStep || currentRound > 5}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <span>Manual Round {currentRound}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistical Fair Band Bar Component */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Statistical Fair Band Anchor [P25 - P75]</span>
            </span>
            <span className="text-slate-500">
              Floor: ₨ {farmerFloor} &bull; Median P50: ₨ {fairBandP50} &bull; Ceiling: ₨ {buyerCeiling}
            </span>
          </div>

          {/* Visual Band Gauge */}
          <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 my-3">
            {/* Fair Band Range Highlight */}
            <div
              style={{
                left: `${((fairBandP25 - farmerFloor) / (buyerCeiling - farmerFloor)) * 100}%`,
                width: `${((fairBandP75 - fairBandP25) / (buyerCeiling - farmerFloor)) * 100}%`,
              }}
              className="absolute top-0 bottom-0 bg-emerald-300/80 border-x border-emerald-500"
              title={`Fair Band: ₨${fairBandP25} - ₨${fairBandP75}`}
            />

            {/* Current Buyer Bid Pointer */}
            {latestTurn && (
              <div
                style={{
                  left: `${((latestTurn.buyerOffer - farmerFloor) / (buyerCeiling - farmerFloor)) * 100}%`,
                }}
                className="absolute top-0 bottom-0 w-2 bg-indigo-600 rounded-full -ml-1 transition-all"
                title={`Buyer Bid: ₨${latestTurn.buyerOffer}`}
              />
            )}

            {/* Current Farmer Ask Pointer */}
            {latestTurn && (
              <div
                style={{
                  left: `${((latestTurn.farmerOffer - farmerFloor) / (buyerCeiling - farmerFloor)) * 100}%`,
                }}
                className="absolute top-0 bottom-0 w-2 bg-emerald-600 rounded-full -ml-1 transition-all"
                title={`Farmer Ask: ₨${latestTurn.farmerOffer}`}
              />
            )}
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>₨ {farmerFloor} (Floor)</span>
            <span className="text-emerald-700 font-bold">₨ {fairBandP25} (P25)</span>
            <span className="text-emerald-800 font-extrabold">₨ {fairBandP50} (P50)</span>
            <span className="text-emerald-700 font-bold">₨ {fairBandP75} (P75)</span>
            <span>₨ {buyerCeiling} (Ceiling)</span>
          </div>
        </div>

        {/* Deal Succeeded Banner */}
        {dealSettled && finalDeal && (
          <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg animate-in fade-in zoom-in-95">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  <span className="font-extrabold text-lg">
                    Fair-Trade Deal Agreed at ₨ {finalDeal.pricePerKg}/kg!
                  </span>
                </div>
                <p className="text-xs text-emerald-100 max-w-xl">
                  Settled at equilibrium inside the statistical fair band. Total contract value:{" "}
                  <strong>₨ {finalDeal.totalAmountPkr.toLocaleString()} PKR</strong>.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur px-4 py-2.5 rounded-xl border border-white/20 text-right">
                <div className="text-[10px] text-emerald-200 uppercase font-semibold">Contract Settle</div>
                <div className="text-xl font-extrabold">₨ {finalDeal.totalAmountPkr.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bilateral Message Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Live Concession Exchange &amp; AI Dialogue
            </h3>
            <span className="text-xs text-slate-500">
              Round {Math.min(currentRound - 1, 5)} of 5
            </span>
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Click &quot;Auto-Negotiate&quot; or &quot;Manual Round&quot; to begin the automated bargaining session.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((turn, i) => (
                <div key={i} className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                    <span>Round {turn.round}</span>
                    <span className="font-mono text-slate-600">
                      Spread: ₨ {Math.abs(turn.farmerOffer - turn.buyerOffer)}/kg
                    </span>
                  </div>

                  {/* Farmer Message Bubble */}
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3 text-xs text-emerald-950">
                      <div className="flex items-center justify-between gap-4 mb-1 font-semibold text-emerald-900">
                        <span>Farmer Tariq</span>
                        <span className="font-bold text-emerald-700">Ask: ₨ {turn.farmerOffer}/kg</span>
                      </div>
                      <p>{turn.farmerMessage}</p>
                    </div>
                  </div>

                  {/* Buyer Message Bubble */}
                  <div className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3 text-xs text-indigo-950 text-right">
                      <div className="flex items-center justify-between gap-4 mb-1 font-semibold text-indigo-900 flex-row-reverse">
                        <span>{buyerName}</span>
                        <span className="font-bold text-indigo-700">Bid: ₨ {turn.buyerOffer}/kg</span>
                      </div>
                      <p>{turn.buyerMessage}</p>
                    </div>
                  </div>

                  {/* Number Verification Pill */}
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    {turn.verified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>All numerical offers deterministically verified ✓</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <AlertCircle className="w-3 h-3" />
                        <span>AI Approximated</span>
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

export default function NegotiationPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading negotiation room...</div>}>
      <NegotiationContent id={params?.id || "lst_01"} />
    </Suspense>
  );
}
