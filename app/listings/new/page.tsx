"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Language, DICTIONARY } from "@/lib/i18n";
import { CropKey, MarketKey } from "@/lib/types";
import { Sprout, MapPin, Scale, Tag, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";

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
  const ArrowIcon = isUrdu ? ArrowLeft : ArrowRight;

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
          cropNameUr: crop === "tomato" ? "ٹماٹر" : crop === "onion" ? "پیاز" : crop === "potato" ? "آلو" : crop === "wheat" ? "گندم" : "چاول",
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
    <div className={`min-h-screen bg-[#FAF7F2] text-[#1E2621] flex flex-col ${isUrdu ? "font-urdu" : ""}`} dir={isUrdu ? "rtl" : "ltr"}>
      <Navbar lang={lang} onToggleLang={() => setLang(lang === "en" ? "ur" : "en")} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#E8F3EC] text-[#0F3E2E] px-3 py-1 rounded-full border border-[#BDE0CB]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isUrdu ? "مصدقہ منڈی لسٹنگ" : "Verified Mandi Direct Listing"}</span>
            </span>
          </div>

          <h1 className="text-2xl font-black text-[#14231B] tracking-tight">
            {isUrdu ? "منصفانہ منڈی میں فصل فروخت کے لیے پیش کریں" : "List Harvest Batch for Fair Trade"}
          </h1>
          <p className="text-xs text-[#55695C] mt-1 mb-6 font-medium">
            Pre-filled with statistical floor price and quantity from your predictive harvest advisory.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#14231B] mb-1">
                {isUrdu ? "کسان / فارم کا نام" : "Farmer / Farm Identity"}
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                required
                className="w-full bg-[#FAF8F3] border border-[#DCD3C3] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#14231B] focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#14231B] mb-1">
                  {isUrdu ? "فصل" : "Produce Crop"}
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value as CropKey)}
                  className="w-full bg-[#FAF8F3] border border-[#DCD3C3] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-[#14231B] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="tomato">Tomato / ٹماٹر</option>
                  <option value="onion">Onion / پیاز</option>
                  <option value="potato">Potato / آلو</option>
                  <option value="wheat">Wheat / گندم</option>
                  <option value="rice_basmati">Basmati Rice / چاول</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14231B] mb-1">
                  {isUrdu ? "ہدف منڈی" : "Target Mandi"}
                </label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value as MarketKey)}
                  className="w-full bg-[#FAF8F3] border border-[#DCD3C3] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold text-[#14231B] focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
                <label className="block text-xs font-bold text-[#14231B] mb-1">
                  {isUrdu ? "مقدار (کلوگرام)" : "Volume (kg)"}
                </label>
                <input
                  type="number"
                  min={100}
                  step={40}
                  value={qtyKg}
                  onChange={(e) => setQtyKg(Number(e.target.value))}
                  required
                  className="w-full bg-[#FAF8F3] border border-[#DCD3C3] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-black text-[#14231B] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14231B] mb-1">
                  {isUrdu ? "کم سے کم محفوظ قیمت (روپے فی کلو)" : "Floor Price (PKR / kg)"}
                </label>
                <input
                  type="number"
                  min={1}
                  step={0.5}
                  value={floorPrice}
                  onChange={(e) => setFloorPrice(Number(e.target.value))}
                  required
                  className="w-full bg-[#FAF8F3] border border-[#DCD3C3] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-black text-[#0F3E2E] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#0F3E2E] hover:bg-[#144E3A] disabled:bg-[#BAC6BF] text-white rounded-2xl text-xs sm:text-sm font-black shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 border border-[#0A2D21]"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sprout className="w-4 h-4 text-[#FBBF24]" />
                )}
                <span>{isUrdu ? "فصل منڈی میں لسٹ کریں" : "Publish to Wholesale Exchange"}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading form...</div>}>
      <ListingFormContent />
    </Suspense>
  );
}
