"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Language, DICTIONARY } from "@/lib/i18n";
import { Listing, BuyerProfile } from "@/lib/types";
import { rankBuyers, MatchScoreBreakdown } from "@/lib/match";
import {
  Store,
  Plus,
  RefreshCw,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Scale,
  MapPin,
  Award,
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
  const ArrowIcon = isUrdu ? ArrowLeft : ArrowRight;

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
    <div className={`min-h-screen bg-[#FAF7F2] text-[#1E2621] flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#14231B] tracking-tight flex items-center gap-2.5">
              <Store className="w-7 h-7 text-emerald-700" />
              <span>{isUrdu ? "منصفانہ منڈی اور تصدیق شدہ خریدار" : "Wholesale Commodity Exchange & Buyer Matches"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#55695C] mt-1 font-medium">
              Direct institutional wholesale trading without exploitative arthi commission intermediaries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMarketData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FEFDFB] border border-[#EAE4D8] text-[#2A3B30] hover:bg-[#FAF8F3] rounded-xl text-xs font-bold shadow-2xs transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-700" : ""}`} />
              <span>Refresh Feed</span>
            </button>

            <Link
              href="/listings/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0F3E2E] hover:bg-[#144E3A] text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 border border-[#0A2D21]"
            >
              <Plus className="w-4 h-4 text-[#FBBF24]" />
              <span>{isUrdu ? "نئی فصل کا لاٹ درج کریں" : "New Harvest Listing"}</span>
            </Link>
          </div>
        </div>

        {/* Content Layout: Left Listings, Right Buyer Matching */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Listings Column (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-[#14231B] flex items-center gap-2">
                <span>{isUrdu ? "فعال منڈی لاٹس" : "Active Mandi Lots"}</span>
                <span className="text-[11px] font-bold bg-[#E8F3EC] text-[#0F3E2E] px-2 py-0.5 rounded-full border border-[#BDE0CB]">
                  {listings.length} Lots
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-[#7A8C80]">Loading listings...</div>
            ) : listings.length === 0 ? (
              <div className="bg-[#FEFDFB] p-8 rounded-3xl border border-[#EAE4D8] text-center">
                <p className="text-xs text-[#55695C] mb-3">No active listings posted yet.</p>
                <Link
                  href="/listings/new"
                  className="px-3.5 py-2 bg-[#0F3E2E] text-white text-xs font-bold rounded-xl"
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
                      className={`p-4 rounded-3xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#FEFDFB] border-[#0F3E2E] shadow-sm ring-2 ring-emerald-700/10"
                          : "bg-[#FEFDFB] border-[#EAE4D8] hover:border-[#DCD3C3] hover:bg-[#FAF8F3]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-[#14231B] text-sm sm:text-base">
                              {lst.qtyKg.toLocaleString()} kg {lst.cropName}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#FAF8F3] text-[#55695C] border border-[#EAE4D8]">
                              {lst.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#55695C] mt-0.5">{lst.farmerName}</p>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-[#55695C] font-semibold">{isUrdu ? "کم سے کم ریٹ" : "Floor Price"}</div>
                          <div className="text-base font-black text-[#0F3E2E]">
                            ₨ {lst.floorPrice}
                            <span className="text-[10px] font-normal text-[#55695C]">/kg</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#55695C] pt-2 border-t border-[#EAE4D8]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
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

          {/* Right Column: Buyer Matching & Ranked Bidders (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-[#14231B] flex items-center gap-2">
                <span>{isUrdu ? "تصدیق شدہ خریدار اور میچنگ" : "Verified Institutional Commodity Buyers"}</span>
                <span className="text-[11px] font-bold bg-[#E8F3EC] text-[#0F3E2E] px-2 py-0.5 rounded-full border border-[#BDE0CB]">
                  {matches.length} Matches
                </span>
              </h2>
              <span className="text-xs text-[#55695C] font-semibold">
                Ranked by Price Fit, Trust &amp; Distance
              </span>
            </div>

            {matches.length === 0 ? (
              <div className="bg-[#FEFDFB] p-8 rounded-3xl border border-[#EAE4D8] text-center text-xs text-[#7A8C80]">
                Select a listing on the left to see ranked buyer matches.
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => {
                  const b = m.buyer;
                  return (
                    <div
                      key={b.id}
                      className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-xs hover:border-[#DCD3C3] transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#E8F3EC] text-[#0F3E2E] flex items-center justify-center font-bold text-sm border border-[#BDE0CB]">
                            <Building2 className="w-5 h-5 text-emerald-800" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-[#14231B] text-sm sm:text-base">{b.name}</h3>
                              <span className="text-[10px] font-bold bg-[#FAF8F3] text-[#55695C] px-2 py-0.5 rounded-md border border-[#EAE4D8]">
                                {b.type}
                              </span>
                            </div>
                            <p className="text-xs text-[#55695C] mt-0.5">
                              {b.city} &bull; {m.distanceKm} km away &bull; {b.payment_terms}
                            </p>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-left sm:text-right">
                          <div className="text-[10px] text-[#55695C] font-bold">Match Compatibility</div>
                          <div className="text-lg font-black text-[#0F3E2E]">
                            {Math.round(m.totalScore * 100)}% Match
                          </div>
                        </div>
                      </div>

                      {/* Score breakdown metrics */}
                      <div className="grid grid-cols-3 gap-2 bg-[#FAF8F3] p-3 rounded-2xl text-center text-xs mb-4 border border-[#EAE4D8]">
                        <div>
                          <div className="text-[10px] text-[#55695C] font-semibold">{isUrdu ? "خریدار کی حد" : "Buyer Ceiling"}</div>
                          <div className="font-black text-[#14231B] mt-0.5">
                            ₨ {Math.round((selectedListing?.floorPrice || 65) * b.ceiling_mult)}/kg
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#55695C] font-semibold">{isUrdu ? "اعتماد ریٹنگ" : "Trust Score"}</div>
                          <div className="font-black text-[#0F3E2E] mt-0.5">
                            ★ {Math.round(b.trust_score * 100)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#55695C] font-semibold">{isUrdu ? "ابتدائی پیشکش" : "Opening Bid"}</div>
                          <div className="font-black text-[#853E06] mt-0.5">
                            ₨ {m.suggestedOpeningOffer}/kg
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-[#55695C] font-medium">
                          Bilateral settlement protected with fair-trade guardrails.
                        </span>
                        <Link
                          href={`/negotiate/${selectedListing?.id || "lst_01"}?buyerId=${b.id}&buyerName=${encodeURIComponent(
                            b.name
                          )}&crop=${selectedListing?.cropName || "Tomato"}&qty=${
                            selectedListing?.qtyKg || 3000
                          }&floor=${selectedListing?.floorPrice || 65}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#0F3E2E] hover:bg-[#144E3A] text-white rounded-xl text-xs font-black shadow-xs transition-all active:scale-95"
                        >
                          <span>{isUrdu ? "سودا شروع کریں" : "Enter Deal Room"}</span>
                          <ArrowIcon className="w-3.5 h-3.5" />
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
