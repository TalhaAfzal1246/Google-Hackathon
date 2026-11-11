import { NextRequest, NextResponse } from "next/server";
import { getListings, addListing } from "@/lib/store";
import { Listing } from "@/lib/types";

export async function GET() {
  const listings = getListings();
  return NextResponse.json({ listings });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const newListing: Listing = {
      id: `lst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      farmerId: data.farmerId || "farmer_current_user",
      farmerName: data.farmerName || "Verified Punjab Farmer",
      crop: data.crop || "tomato",
      cropName: data.cropName || "Tomato",
      cropNameUr: data.cropNameUr || "ٹماٹر",
      qtyKg: Number(data.qtyKg) || 1000,
      market: data.market || "lahore_badami_bagh",
      marketName: data.marketName || "Lahore (Badami Bagh Mandi)",
      readyDate: data.readyDate || new Date().toISOString().split("T")[0],
      floorPrice: Number(data.floorPrice) || 50,
      suggestedFloor: Number(data.suggestedFloor) || 55,
      createdAt: new Date().toISOString(),
      status: "active",
    };
    addListing(newListing);
    return NextResponse.json({ success: true, listing: newListing });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create listing" }, { status: 400 });
  }
}
