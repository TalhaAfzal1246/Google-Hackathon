import { NextRequest, NextResponse } from "next/server";
import { computeCropPlan, PlanInputs, SeasonKey, WaterSourceKey } from "@/lib/planner";
import { aiJSON } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const season: SeasonKey = body.season || "rabi";
    const acres: number = Math.max(0.5, Math.min(1000, Number(body.acres) || 5));
    const region: string = body.region || "Central Punjab (Lahore, Gujranwala, Faisalabad)";
    const waterSource: WaterSourceKey = body.waterSource || "canal";

    const inputs: PlanInputs = {
      season,
      acres,
      region,
      waterSource,
    };

    const recommendations = computeCropPlan(inputs);

    // Call GPT-6.1 Terra / Gemini for regional agronomist synthesis
    const topCrop = recommendations[0];
    const systemPrompt = `You are Pakistan's Chief Agricultural Planning Specialist advising a smallholder farmer.
You possess deep field expertise in:
- Soil and canal water regimes in Punjab (Central, South, Potohar) and Sindh.
- Next-quarter fertilizer availability (DAP, Urea) and diesel tube-well economics.
- Anticipated mandi harvest gluts, export windows, and commodity price trends in Pakistan.

Provide actionable, practical guidance for the farmer based on their land size and season.
Return JSON with the following schema:
- "headline_ur": Catchy Urdu headline (e.g. "اگلے سیزن میں پیاز اور گندم کا امتزاج سب سے زیادہ منافع بخش رہے گا")
- "headline_en": Concise English headline
- "agronomicAdvice_ur": 2-3 paragraph plain Urdu advice covering seed quality, fertilizer timing, and water management.
- "agronomicAdvice_en": 2-3 paragraph English version.
- "diversificationStrategy_ur": A recommendation on how to split their acreage (e.g. 70% high-profit crop, 30% staple food security).
- "diversificationStrategy_en": English diversification strategy.
- "keyAlert": 1 sentence critical warning (e.g. "Ensure certified disease-free tubers to avoid early blight loss").`;

    const userPrompt = `Farmer Scenario:
- Target Season: ${season.toUpperCase()}
- Total Landholding: ${acres} Acres
- Geographic Agro-Ecological Zone: ${region}
- Irrigation Infrastructure: ${waterSource.toUpperCase()}
- Top Ranked Analytical Crop: ${topCrop ? topCrop.name_en : "Onion"} (Projected Net Profit: ₨ ${topCrop ? topCrop.totalNetProfitPkr.toLocaleString() : "0"} on ${acres} acres)

Provide the agronomist advisory.`;

    const fallback = {
      headline_ur: `اگلی سہ ماہی کے لیے ${topCrop ? topCrop.name_ur : "پیاز"} اور گندم کا باہمی توازن سب سے محفوظ اور منافع بخش رہے گا۔`,
      headline_en: `Optimizing for ${topCrop ? topCrop.name_en : "Onion"} combined with staple wheat provides the highest risk-adjusted yield.`,
      agronomicAdvice_ur: `موسمی تجزیے اور منڈی میں رسد کی قلت کے پیش نظر، اگلے سیزن میں مصدقہ بیج اور وقت پر ڈی اے پی کھاد کا استعمال یقینی بنائیں۔ اگر پانی نہری دستیاب ہے تو لاگت 30 فیصد کم ہوگی۔ کٹائی کے وقت منڈی کے عارضی گراؤٹ سے بچنے کے لیے ابتدائی یا درمیانی بجائی کو ترجیح دیں۔`,
      agronomicAdvice_en: `Given regional mandi deficits and fertilizer availability, planting certified seed varieties with early DAP application yields optimal results. Canal irrigation maintains low operational overhead. Stagger planting slightly to avoid peak-harvest market gluts.`,
      diversificationStrategy_ur: `کل ${acres} ایکڑ رقبے میں سے تقریباً 65% پر زیادہ منافع والی نقد فصل لگائیں، جبکہ باقی 35% پر خاندانی ضرورت اور یقینی آمدن کے لیے بنیادی اناج رکھیں۔`,
      diversificationStrategy_en: `Allocate roughly 65% of your ${acres} acres to the highest ROI cash crop, and reserve 35% for lower-risk staple grain to balance cash-flow.`,
      keyAlert: `Always procure certified germination-tested seeds from registered Punjab/Sindh Agriculture Extension dealers.`,
    };

    const { data: aiData, usedAI } = await aiJSON<typeof fallback>(
      systemPrompt,
      userPrompt,
      fallback
    );

    return NextResponse.json({
      recommendations,
      inputs,
      aiAdvisory: aiData,
      usedAI,
    });
  } catch (err: any) {
    console.error("Crop planning error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to compute crop plan" },
      { status: 500 }
    );
  }
}
