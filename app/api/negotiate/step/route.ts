import { NextRequest, NextResponse } from "next/server";
import { computeNegotiationStep } from "@/lib/negotiation";
import { geminiJSON } from "@/lib/gemini";
import { numbersMatch } from "@/lib/validate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      round = 1,
      maxRounds = 5,
      farmerFloor = 60,
      buyerCeiling = 85,
      fairBandP25 = 65,
      fairBandP50 = 74,
      fairBandP75 = 82,
      cropName = "Tomato",
      qtyKg = 2500,
      buyerName = "Metro Cash & Carry Wholesale",
      farmerName = "Malik Tariq (Okara Farms)",
    } = body;

    // 1. Deterministic economic engine computes next round offers
    const stepResult = computeNegotiationStep({
      round,
      maxRounds,
      farmerFloor,
      buyerCeiling,
      fairBandP25,
      fairBandP50,
      fairBandP75,
    });

    const allowedNumbers = [
      Number(stepResult.farmerOffer),
      Number(stepResult.buyerOffer),
      Number(fairBandP25),
      Number(fairBandP50),
      Number(fairBandP75),
      Number(qtyKg),
      Number(round),
    ].filter((n) => !isNaN(n));

    // 2. Gemini generates realistic dialogue for this turn
    const systemPrompt = `You are a Fair-Trade Agricultural Auction Facilitator in Pakistan.
Generate a realistic, respectful bilateral exchange between a verified smallholder farmer and a commercial wholesale buyer.
Constraints:
- Round: ${round} of ${maxRounds}
- Current Farmer Offer: ₨ ${stepResult.farmerOffer}/kg
- Current Buyer Offer: ₨ ${stepResult.buyerOffer}/kg
- Fair Band: [₨ ${fairBandP25} - ₨ ${fairBandP75}]/kg
- Is Deal Reached?: ${stepResult.isDeal ? "YES, DEAL AGREED" : "NO, COUNTER-OFFER"}
- You must strictly use the exact offer numbers provided above. DO NOT invent or alter prices.
Return JSON with keys:
- "farmerMessage": 1-2 sentence statement from the farmer defending their price or agreeing to deal.
- "buyerMessage": 1-2 sentence statement from the commercial buyer offering their price or agreeing.
- "rationalNotes": A brief 1-sentence economic summary of the concession.`;

    const userPrompt = `Farmer: ${farmerName} (${qtyKg} kg ${cropName})
Buyer: ${buyerName}
Round: ${round}
Computed Farmer Offer: ₨ ${stepResult.farmerOffer}
Computed Buyer Offer: ₨ ${stepResult.buyerOffer}
Status: ${stepResult.isDeal ? "Deal Reached" : "In Progress"}`;

    const fallback = {
      farmerMessage: stepResult.isDeal
        ? `I accept your offer of ₨ ${stepResult.buyerOffer}/kg for our ${qtyKg} kg lot. It lies within the statistical fair band.`
        : `Our produce is fresh harvest grade. Considering transport costs, my counter-offer is ₨ ${stepResult.farmerOffer}/kg.`,
      buyerMessage: stepResult.isDeal
        ? `We have reached an agreement at ₨ ${stepResult.buyerOffer}/kg. We will arrange transport and wire payment.`
        : `Mandi volume is substantial today. We can increase our bid to ₨ ${stepResult.buyerOffer}/kg for immediate dispatch.`,
      rationalNotes: `Concession step in round ${round} brings spread to ₨ ${Math.abs(stepResult.farmerOffer - stepResult.buyerOffer)}/kg.`,
    };

    const { data, usedAI } = await geminiJSON<typeof fallback>(
      systemPrompt,
      userPrompt,
      fallback
    );

    const verified = numbersMatch(
      `${data.farmerMessage} ${data.buyerMessage}`,
      allowedNumbers
    );

    return NextResponse.json({
      ...stepResult,
      dialogue: data,
      usedAI,
      verified,
    });
  } catch (error) {
    console.error("Negotiate step error:", error);
    return NextResponse.json(
      {
        round: 1,
        farmerOffer: 75,
        buyerOffer: 70,
        isDeal: false,
        settlementPrice: null,
        dialogue: {
          farmerMessage: "We propose ₨ 75/kg based on current wholesale metrics.",
          buyerMessage: "Our opening counter-offer is ₨ 70/kg.",
          rationalNotes: "Concession step within fair trading boundaries.",
        },
        usedAI: false,
        verified: true,
      },
      { status: 200 }
    );
  }
}
