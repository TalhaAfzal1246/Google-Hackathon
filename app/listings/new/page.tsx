"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Language, DICTIONARY } from "@/lib/i18n";
import { CropKey, MarketKey } from "@/lib/types";
import { Sprout, MapPin, Scale, Tag, ArrowRight, ShieldCheck } from "lucide-react";

function ListingFormContent() {
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

  const isUrdu = lang === "ur";

  const initialCrop = (searchParams.get("crop") as CropKey) || "tomato";
  const initialMarket = (searchParams.get("market") as MarketKey) || "lahore_badami_bagh";
  const initialQty = Number(searchParams.get("qty")) || 3000;
  const initialFloor = Number(searchParams.get("floor")) || 65;

  const [crop, setCrop] = useState<CropKey>(initialCrop);
  const [market, setMarket] = useState<MarketKey>(initialMarket);
  const [qtyKg, setQtyKg] = useState<number>(initialQty);
  const [floorPrice, setFloorPrice] = useState<number>(initialFloor);
  const [farmerName, setFarmerName] = useState<string>("Malik Tariq (Okara Farms)");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerName,
          crop,
          cropName: crop.toUpperCase(),
          cropNameUr: crop === "tomato" ? "ٹماٹر" : crop === "onion" ? "پیاز" : "آلو",
          market,
          marketName: market === "lahore_badami_bagh" ? "Lahore (Badami Bagh)" : market,
          qtyKg,
          floorPrice,
          suggestedFloor: floorPrice,
        }),
      });

      if (res.ok) {
        router.push("/market");
      }
    } catch (err) {
      console.error("Listing error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Mandi Direct Listing
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isUrdu ? "منصفانہ منڈی میں فصل فروخت کے لیے پیش کریں" : "List Harvest Batch for Fair Trade"}
          </h1>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Pre-filled with statistical floor price and quantity from your predictive harvest advisory.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Farmer / Farm Identity
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Harvest Crop</span>
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value as CropKey)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="tomato">Tomato / ٹماٹر</option>
                  <option value="onion">Onion / پیاز</option>
                  <option value="potato">Potato / آلو</option>
                  <option value="wheat">Wheat / گندم</option>
                  <option value="rice_basmati">Basmati Rice / چاول</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Delivery Mandi</span>
                </label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value as MarketKey)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="lahore_badami_bagh">Lahore (Badami Bagh)</option>
                  <option value="multan_ghalla">Multan (Ghalla Mandi)</option>
                  <option value="faisalabad_gole">Faisalabad (Gole Mandi)</option>
                  <option value="karachi_superhighway">Karachi (Super Highway)</option>
                  <option value="rawalpindi_i11">Rawalpindi / Islamabad</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Total Harvest Volume (kg)</span>
                </label>
                <input
                  type="number"
                  min={500}
                  max={100000}
                  step={500}
                  value={qtyKg}
                  onChange={(e) => setQtyKg(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Floor Reservation Price (₨/kg)</span>
                </label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  step={1}
                  value={floorPrice}
                  onChange={(e) => setFloorPrice(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900">
              <strong>Guaranteed Protection:</strong> Your autonomous negotiation agent will strictly refuse any offers below your floor price of ₨ {floorPrice}/kg.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Publish to Fair-Trade Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function ListingFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading form...</div>}>
      <ListingFormContent />
    </Suspense>
  );
}
