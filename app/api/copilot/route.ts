import { NextRequest, NextResponse } from "next/server";
import { geminiJSON } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { question, crop, market, currentPrice, arrivals, demand } = await req.json();

    const systemPrompt = `You are the Lead Agricultural Economist for Pakistan's National Food Security and Mandi Market Intelligence.
You possess deep expertise in:
- Pakistani agricultural harvest calendars (Sindh winter crop, Punjab spring/autumn crop, KP/Balochistan summer produce).
- Demand-Supply mechanics across wholesale mandis (Badami Bagh Lahore, Super Highway Karachi, Ghalla Mandi Multan, etc.).
- Logistics, diesel prices, transport delays, and cold storage infrastructure.
- Arthi (commission agent) practices, market gluts, and price elasticity of perishable vs staple crops.

Answer the user's question directly, accurately, and practically within the context of Pakistan's agricultural economy.
Provide your response in structured JSON with the following keys:
- "answer": A comprehensive 2-3 paragraph explanation in markdown formatting covering demand vs supply factors, price transmission, and farmer impact.
- "answer_ur": A brief Urdu summary (2 sentences) for local farmers.
- "keyDrivers": An array of 3 distinct economic drivers (e.g. "Sindh harvest supply arrival", "Transport fuel inflation", "Festival/Ramadan demand spike").
- "marketOutlook": One of "Bullish (Prices rising)", "Bearish (Prices softening)", or "Stable / Balanced".
- "riskFactor": A single sentence warning about the largest volatility risk (e.g. unseasonal rain, border trade policy, fuel tariffs).`;

    const userPrompt = `Question: "${question}"
Current Context:
- Target Crop: ${crop || "Tomato"}
- Mandi Hub: ${market || "Lahore Badami Bagh"}
- Current Farmgate Baseline: ₨ ${currentPrice || 65}/kg
- Mandi Arrivals: ${arrivals || 240} tons/day
- Mandi Demand: ${demand || 250} tons/day

Provide the economic breakdown.`;

    const fallback = {
      answer: `### Demand & Supply Dynamics for ${crop || "Agricultural Crops"}\n\n` +
        `Current market data indicates a balanced supply of **${arrivals || 240} tons/day** against urban consumption demand of **${demand || 250} tons/day** in the ${market || "major wholesale"} hub.\n\n` +
        `- **Supply Side:** Supply arrivals are influenced by harvest seasonality, regional logistics, and transit spoilage rates.\n` +
        `- **Demand Side:** Consumer demand remains relatively inelastic for staple cooking ingredients (onions, tomatoes, potatoes), meaning even modest arrival shortages of 15-20% can cause noticeable upward price swings in wholesale auctions.\n` +
        `- **Strategic Action:** Farmers with access to ventilated or cold storage can defer sales during temporary morning gluts to capture evening or weekend auction premiums.`,
      answer_ur: `منڈی میں مال کی آمد اور شہری کھپت کے توازن کے مطابق قیمتیں مستحکم ہیں۔ عارضی مندی کے وقت مال روک کر بہتر قیمت حاصل کی جا سکتی ہے۔`,
      keyDrivers: [
        "Regional harvest arrival volume",
        "Transport fuel & mandi logistics",
        "Urban daily retail consumption",
      ],
      marketOutlook: "Stable / Balanced",
      riskFactor: "Unseasonal weather fluctuations impacting transit time and post-harvest spoilage.",
    };

    const { data, usedAI } = await geminiJSON<typeof fallback>(
      systemPrompt,
      userPrompt,
      fallback
    );

    return NextResponse.json({
      ...data,
      usedAI,
    });
  } catch (err) {
    console.error("Copilot error:", err);
    return NextResponse.json(
      {
        answer: "Unable to process dynamic query. Demand and supply remain in equilibrium based on recent mandi arrival trends.",
        answer_ur: "طلب اور رسد کے توازن کے مطابق ریٹ مستحکم ہیں۔",
        keyDrivers: ["Supply Volume", "Logistics Cost", "Daily Demand"],
        marketOutlook: "Stable / Balanced",
        riskFactor: "Transport cost fluctuations.",
        usedAI: false,
      },
      { status: 200 }
    );
  }
}
