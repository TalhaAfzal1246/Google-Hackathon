import { NextRequest, NextResponse } from "next/server";
import { getDeals, addDeal } from "@/lib/store";
import { Deal } from "@/lib/types";

export async function GET() {
  const deals = getDeals();
  return NextResponse.json({ deals });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const newDeal: Deal = {
      id: `deal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      listingId: data.listingId,
      buyerId: data.buyerId,
      buyerName: data.buyerName,
      farmerId: data.farmerId,
      farmerName: data.farmerName,
      crop: data.crop,
      qtyKg: Number(data.qtyKg),
      pricePerKg: Number(data.pricePerKg),
      totalAmountPkr: Number(data.qtyKg) * Number(data.pricePerKg),
      fairBandP25: Number(data.fairBandP25),
      fairBandP75: Number(data.fairBandP75),
      settledAt: new Date().toISOString(),
    };
    addDeal(newDeal);
    return NextResponse.json({ success: true, deal: newDeal });
  } catch (err) {
    return NextResponse.json({ error: "Failed to record deal" }, { status: 400 });
  }
}
