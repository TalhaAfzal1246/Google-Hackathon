"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Language, DICTIONARY } from "@/lib/i18n";
import { Listing, BuyerProfile } from "@/lib/types";
import { rankBuyers, MatchScoreBreakdown } from "@/lib/match";
import {
  Store,
  Sprout,
  Plus,
  RefreshCw,
  Building,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Scale,
  MapPin,
} from "lucide-react";

export default function MarketPage() {
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

  const [listings, setListings] = useState<Listing[]>([]);
  const [buyers, setBuyers] = useState<BuyerProfile[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [matches, setMatches] = useState<MatchScoreBreakdown[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch listings and buyers
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const [listRes, buyerRes] = await Promise.all([
        fetch("/api/listings"),
        fetch("/data/buyers.json"),
      ]);
      const listJson = await listRes.json();
      const buyerJson = await buyerRes.json();

      setListings(listJson.listings || []);
      setBuyers(buyerJson || []);

      if (listJson.listings?.length > 0) {
        setSelectedListing(listJson.listings[0]);
      }
    } catch (err) {
      console.error("Failed to load market data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  // Compute matches when selected listing changes
  useEffect(() => {
    if (!selectedListing || buyers.length === 0) return;

    // Default mandi coordinates for Lahore Badami Bagh
    const lat = 31.5925;
    const lng = 74.3095;
    const fairP50 = selectedListing.floorPrice * 1.08;

    const ranked = rankBuyers(
      buyers,
      selectedListing.crop,
      selectedListing.qtyKg,
      lat,
      lng,
      fairP50,
      selectedListing.floorPrice
    );

    setMatches(ranked);
  }, [selectedListing, buyers]);

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Store className="w-7 h-7 text-emerald-600" />
              <span>{isUrdu ? "منصفانہ منڈی اور بیوپاری رابطہ" : "Fair-Trade Exchange & Buyer Matches"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Direct institutional wholesale trading without exploitative arthi commission intermediaries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMarketData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh Feed</span>
            </button>

            <Link
              href="/listings/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Harvest Listing</span>
            </Link>
          </div>
        </div>

        {/* Content Layout: Left Listings, Right Buyer Matching */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Listings Column (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Active Mandi Listings</span>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {listings.length} Lots
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading listings...</div>
            ) : listings.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-3">No active listings posted yet.</p>
                <Link
                  href="/listings/new"
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                >
                  Create First Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((lst) => {
                  const isSelected = selectedListing?.id === lst.id;
                  return (
                    <div
                      key={lst.id}
                      onClick={() => setSelectedListing(lst)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10"
                          : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm">
                              {lst.qtyKg.toLocaleString()} kg {lst.cropName}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {lst.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{lst.farmerName}</p>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-slate-400">Floor Price</div>
                          <div className="text-base font-extrabold text-emerald-700">
                            ₨ {lst.floorPrice}
                            <span className="text-[10px] font-normal text-slate-500">/kg</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lst.marketName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-slate-400" />
                          <span>Batch Lot</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: AI Buyer Matching & Ranked Bidders (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Ranked Institutional Wholesale Buyers</span>
                <span className="text-[11px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  {matches.length} Matches
                </span>
              </h2>
              <span className="text-xs text-slate-500">
                Sorted by Price Fit, Trust &amp; Distance
              </span>
            </div>

            {matches.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                Select a listing on the left to see ranked buyer matches.
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => {
                  const b = m.buyer;
                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                            <Building className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                {b.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {b.city} &bull; {m.distanceKm} km away &bull; {b.payment_terms}
                            </p>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-slate-400">Match Compatibility</div>
                          <div className="text-lg font-extrabold text-indigo-600">
                            {Math.round(m.totalScore * 100)}% Match
                          </div>
                        </div>
                      </div>

                      {/* Score breakdown metrics */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs mb-4 border border-slate-100">
                        <div>
                          <div className="text-[10px] text-slate-400">Buyer Ceiling</div>
                          <div className="font-bold text-slate-800">
                            ₨ {Math.round((selectedListing?.floorPrice || 65) * b.ceiling_mult)}/kg
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Trust Score</div>
                          <div className="font-bold text-emerald-600">
                            {Math.round(b.trust_score * 100)}% Rating
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Opening Bid</div>
                          <div className="font-bold text-indigo-600">
                            ₨ {m.suggestedOpeningOffer}/kg
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-500">
                          Bilateral automated room ready with fair-trade guardrails.
                        </span>
                        <Link
                          href={`/negotiate/${selectedListing?.id || "lst_01"}?buyerId=${b.id}&buyerName=${encodeURIComponent(
                            b.name
                          )}&crop=${selectedListing?.cropName || "Tomato"}&qty=${
                            selectedListing?.qtyKg || 3000
                          }&floor=${selectedListing?.floorPrice || 65}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:gap-2 active:scale-95"
                        >
                          <span>Enter Negotiation Room</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
