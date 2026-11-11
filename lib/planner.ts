/**
 * Next-Quarter Crop Planning & Predictive ROI Engine for Pakistan Smallholder Farmers
 * Grounded in PARC (Pakistan Agricultural Research Council), Punjab Agriculture Extension,
 * and PBS actual cost of production bulletins.
 */

export type SeasonKey = "rabi" | "kharif" | "zaid_spring";
export type WaterSourceKey = "canal" | "tubewell" | "rainfed";
export type BudgetTierKey = "low" | "medium" | "high";

export interface CostBreakdown {
  seedPkr: number;
  dapFertilizerPkr: number;
  ureaFertilizerPkr: number;
  irrigationFuelPkr: number;
  pesticideLaborPkr: number;
  harvestingPkr: number;
  totalPerAcrePkr: number;
}

export interface CropRecommendation {
  cropKey: string;
  name_en: string;
  name_ur: string;
  emoji: string;
  season: SeasonKey;
  season_ur: string;
  rank: number;
  badge_en: string;
  badge_ur: string;
  
  // Per-acre economics
  costPerAcre: number;
  expectedYieldMaundsPerAcre: number;
  expectedHarvestPricePerMaund: number;
  expectedHarvestPricePerKg: number;
  grossRevenuePerAcre: number;
  netProfitPerAcre: number;
  roiPercent: number;

  // Farm-total economics
  totalCostPkr: number;
  totalRevenuePkr: number;
  totalNetProfitPkr: number;

  // Agronomic metadata
  sowingWindow_ur: string;
  sowingWindow_en: string;
  harvestWindow_ur: string;
  harvestWindow_en: string;
  durationDays: number;
  waterRequirement_ur: string;
  waterRequirement_en: string;
  riskLevel_ur: string;
  riskLevel_en: string;

  // Detailed Cost Breakdown
  costBreakdown: CostBreakdown;

  // Economic & Market Rationale
  rationale_ur: string;
  rationale_en: string;
}

export interface PlanInputs {
  season: SeasonKey;
  acres: number;
  region: string;
  waterSource: WaterSourceKey;
  budgetTier?: BudgetTierKey;
}

export const CROP_BASE_DATABASE = [
  // --- RABI CROPS (سردیوں کی فصلیں) ---
  {
    cropKey: "onion_rabi",
    name_en: "Onion (Autumn/Rabi)",
    name_ur: "پیاز (سرمائی فصل)",
    emoji: "🧅",
    season: "rabi" as SeasonKey,
    season_ur: "ربیع (سردیاں)",
    baseSeed: 18000,
    baseDap: 13500, // 1 bag DAP
    baseUrea: 9200, // 2 bags Urea
    baseIrrigation: 22000,
    basePesticideLabor: 38000,
    baseHarvesting: 18000,
    yieldMaundsMin: 180,
    yieldMaundsMax: 230,
    expectedPricePerMaund: 6600, // ₨ 165/kg
    sowingWindow_ur: "اکتوبر تا نومبر",
    sowingWindow_en: "Oct – Nov",
    harvestWindow_ur: "مارچ تا اپریل",
    harvestWindow_en: "March – April",
    durationDays: 135,
    waterRequirement_ur: "درمیانی (4 تا 6 پانیاں)",
    waterRequirement_en: "Moderate (4-6 Irrigations)",
    riskLevel_ur: "درمیانہ (قیمتوں کا اتار چڑھاؤ)",
    riskLevel_en: "Moderate (Price Elasticity)",
    rationale_ur: "ملک بھر میں پیاز کے پرانے ذخائر کم ہو چکے ہیں اور طلب زیادہ ہے۔ اگلے کوارٹر میں نئی فصل کی قیمت ₨ 160 تا 180 فی کلو رہنے کی توقع ہے، جس سے سب سے زیادہ فی ایکڑ منافع مل سکتا ہے۔",
    rationale_en: "Low carryover stocks in Punjab and Sindh will maintain tight wholesale supply through Q1. Wholesale auctions expected to hover between ₨ 160-180/kg, maximizing net returns.",
    badge_en: "Highest Profit Potential",
    badge_ur: "سب سے زیادہ منافع بخش فصل",
  },
  {
    cropKey: "wheat_rabi",
    name_en: "Wheat (National Staple)",
    name_ur: "گندم (قومی بنیادی خوراک)",
    emoji: "🌾",
    season: "rabi" as SeasonKey,
    season_ur: "ربیع (سردیاں)",
    baseSeed: 7500,
    baseDap: 13500,
    baseUrea: 9200,
    baseIrrigation: 15000,
    basePesticideLabor: 12000,
    baseHarvesting: 14000,
    yieldMaundsMin: 42,
    yieldMaundsMax: 50,
    expectedPricePerMaund: 3920, // ₨ 98/kg government baseline
    sowingWindow_ur: "1 نومبر تا 30 نومبر",
    sowingWindow_en: "Nov 1 – Nov 30",
    harvestWindow_ur: "اپریل تا مئی",
    harvestWindow_en: "April – May",
    durationDays: 150,
    waterRequirement_ur: "کم (3 تا 4 پانیاں)",
    waterRequirement_en: "Low to Moderate (3-4 Irrigations)",
    riskLevel_ur: "سب سے کم (حکومتی امدادی قیمت)",
    riskLevel_en: "Lowest (Guaranteed Floor Price)",
    rationale_ur: "گندم پاکستان کی سب سے محفوظ ترین فصل ہے۔ حکومتی سپورٹ پرائس اور فلور ملز کی یقینی خریداری کی وجہ سے مارکیٹ ڈوبنے کا خطرہ صفر ہے۔ ہر کسان کو کچھ رقبے پر گندم لازمی رکھنی چاہیے۔",
    rationale_en: "Lowest risk profile with guaranteed cash liquidation via PASSCO and provincial food departments. Essential baseline crop for food security.",
    badge_en: "Safest Guaranteed Return",
    badge_ur: "سب سے محفوظ و یقینی آمدن",
  },
  {
    cropKey: "potato_rabi",
    name_en: "Potato (Spring/Rabi Crop)",
    name_ur: "آلو (سرمائی/بہاریہ فصل)",
    emoji: "🥔",
    season: "rabi" as SeasonKey,
    season_ur: "ربیع (سردیاں)",
    baseSeed: 65000, // Seed tubers are costly
    baseDap: 27000, // 2 bags DAP
    baseUrea: 14000, // 3 bags Urea + Potash
    baseIrrigation: 25000,
    basePesticideLabor: 28000,
    baseHarvesting: 22000,
    yieldMaundsMin: 220,
    yieldMaundsMax: 280,
    expectedPricePerMaund: 1920, // ₨ 48/kg
    sowingWindow_ur: "اکتوبر تا نومبر",
    sowingWindow_en: "Oct – Nov",
    harvestWindow_ur: "جنوری تا فروری",
    harvestWindow_en: "Jan – Feb",
    durationDays: 105,
    waterRequirement_ur: "زیادہ (ہلکے بار بار پانیاں)",
    waterRequirement_en: "High (Frequent Light Irrigations)",
    riskLevel_ur: "درمیانہ تا زیادہ (کولڈ سٹوریج پر انحصار)",
    riskLevel_en: "Moderate-High (Cold Chain Dependent)",
    rationale_ur: "آلو کی پیداوار فی ایکڑ 250 من سے زیادہ ہوتی ہے۔ اگر آپ کے پاس کولڈ سٹوریج کی سہولت یا اوکاڑہ، ساہیوال، پاکپتن منڈی تک رسائی ہے تو کم وقت (100 دن) میں موٹا منافع ملتا ہے۔",
    rationale_en: "High-density tuber crop yielding 250+ maunds/acre. Generates swift cash turnover in under 110 days for farmers linked to core processing and export hubs.",
    badge_en: "High Density Yield",
    badge_ur: "زیادہ پیداوار اور تیز واپسی",
  },
  {
    cropKey: "mustard_canola",
    name_en: "Canola / Mustard (Oilseed)",
    name_ur: "کینولا / رایا و سرسوں",
    emoji: "🌼",
    season: "rabi" as SeasonKey,
    season_ur: "ربیع (سردیاں)",
    baseSeed: 4000,
    baseDap: 9000,
    baseUrea: 6500,
    baseIrrigation: 10000,
    basePesticideLabor: 9000,
    baseHarvesting: 9000,
    yieldMaundsMin: 22,
    yieldMaundsMax: 28,
    expectedPricePerMaund: 7500,
    sowingWindow_ur: "ستمبر تا اکتوبر",
    sowingWindow_en: "Sept – Oct",
    harvestWindow_ur: "فروری تا مارچ",
    harvestWindow_en: "Feb – March",
    durationDays: 120,
    waterRequirement_ur: "بہت کم (2 تا 3 پانیاں)",
    waterRequirement_en: "Low (2-3 Irrigations)",
    riskLevel_ur: "کم (خوردنی تیل کی شدید طلب)",
    riskLevel_en: "Low (Import Substitution Demand)",
    rationale_ur: "پاکستان خوردنی تیل درآمد کرنے پر اربوں ڈالر خرچ کرتا ہے۔ آئل ملز کینولا اور سرسوں ہاتھوں ہاتھ خریدتی ہیں۔ کم کھاد اور پانی میں یہ کم خرچ کسانوں کے لیے شاندار انتخاب ہے۔",
    rationale_en: "Import-substitution oilseed with urgent domestic demand. Low fertilizer and water footprint makes it ideal for water-scarce or lower-budget farmers.",
    badge_en: "Low Water & Low Input Cost",
    badge_ur: "کم خرچ اور کم پانی",
  },

  // --- KHARIF CROPS (گرمیوں کی فصلیں) ---
  {
    cropKey: "basmati_rice",
    name_en: "Super Basmati Rice (Paddy)",
    name_ur: "سپر باسمتی چاول (دھان)",
    emoji: "🍚",
    season: "kharif" as SeasonKey,
    season_ur: "خریف (گرمیاں)",
    baseSeed: 6000,
    baseDap: 13500,
    baseUrea: 12000,
    baseIrrigation: 32000, // Water intensive puddling
    basePesticideLabor: 28000,
    baseHarvesting: 16000,
    yieldMaundsMin: 42,
    yieldMaundsMax: 50,
    expectedPricePerMaund: 8800, // ₨ 220/kg
    sowingWindow_ur: "20 مئی تا 25 جون",
    sowingWindow_en: "May 20 – June 25",
    harvestWindow_ur: "اکتوبر تا نومبر",
    harvestWindow_en: "Oct – Nov",
    durationDays: 140,
    waterRequirement_ur: "بہت زیادہ (مسلسل کھڑا پانی)",
    waterRequirement_en: "High (Submerged Field Conditions)",
    riskLevel_ur: "درمیانہ (برآمدی مانگ)",
    riskLevel_en: "Moderate (Export Commodity)",
    rationale_ur: "کالر ٹریکٹ (شیخوپورہ، گوجرانوالہ، حافظ آباد، سیالکوٹ) کے نہری کاشتکاروں کے لیے باسمتی چاول بین الاقوامی برآمدی ڈیمانڈ کی وجہ سے ریکارڈ قیمت پر بکے گا۔",
    rationale_en: "Premium long-grain Basmati commands high export prices to GCC and EU markets. Exceptional ROI for canal-irrigated rice belt farmers.",
    badge_en: "Top Export Earner",
    badge_ur: "بہترین برآمدی فصل",
  },
  {
    cropKey: "cotton_kharif",
    name_en: "Cotton (Silver Fiber)",
    name_ur: "کپاس (سفید سونا)",
    emoji: "🌱",
    season: "kharif" as SeasonKey,
    season_ur: "خریف (گرمیاں)",
    baseSeed: 8500,
    baseDap: 13500,
    baseUrea: 14000,
    baseIrrigation: 24000,
    basePesticideLabor: 36000, // Bollworm sprays
    baseHarvesting: 25000, // Picking labor
    yieldMaundsMin: 25,
    yieldMaundsMax: 35,
    expectedPricePerMaund: 8200,
    sowingWindow_ur: "اپریل تا مئی",
    sowingWindow_en: "April – May",
    harvestWindow_ur: "ستمبر تا نومبر",
    harvestWindow_en: "Sept – Nov",
    durationDays: 160,
    waterRequirement_ur: "درمیانی (خشک گرم موسم پسند)",
    waterRequirement_en: "Moderate (Hot Dry Climate)",
    riskLevel_ur: "زیادہ (سفید مکھی اور گلابی سنڈی کا خطرہ)",
    riskLevel_en: "Higher (Pest Sensitivity)",
    rationale_ur: "جنوبی پنجاب اور سندھ کے کاشتکاروں کے لیے ملکی ٹیکسٹائل انڈسٹری کو کاٹن کی اشد ضرورت ہے۔ جدید بیج اور بروقت سپرے سے فی ایکڑ شاندار منافع ممکن ہے۔",
    rationale_en: "High domestic textile demand. Requires disciplined integrated pest management, but offers strong cash-flow during phased pickings.",
    badge_en: "Industrial Cash Crop",
    badge_ur: "صنعتی کیش کراپ",
  },
  {
    cropKey: "tomato_kharif",
    name_en: "Tomato (Summer/Monsoon Crop)",
    name_ur: "ٹماٹر (گرمیوں اور ستمبر فصل)",
    emoji: "🍅",
    season: "kharif" as SeasonKey,
    season_ur: "خریف (گرمیاں)",
    baseSeed: 15000,
    baseDap: 14000,
    baseUrea: 10000,
    baseIrrigation: 22000,
    basePesticideLabor: 32000,
    baseHarvesting: 22000,
    yieldMaundsMin: 190,
    yieldMaundsMax: 250,
    expectedPricePerMaund: 7000, // ₨ 175/kg
    sowingWindow_ur: "جولائی تا اگست",
    sowingWindow_en: "July – Aug",
    harvestWindow_ur: "اکتوبر تا دسمبر",
    harvestWindow_en: "Oct – Dec",
    durationDays: 110,
    waterRequirement_ur: "درمیانی (بغیر کھڑا پانی)",
    waterRequirement_en: "Moderate (Well Drained Soils)",
    riskLevel_ur: "زیادہ (بارش اور فنگس)",
    riskLevel_en: "High (Perishable & Rain Sensitive)",
    rationale_ur: "مون سون کے بعد ستمبر اور اکتوبر میں لاہور اور کراچی میں ٹماٹر کی سپلائی کم ہو جاتی ہے جس سے منڈی میں نیلامی ریٹ ₨ 200 فی کلو تک اچھلتا ہے۔ زیادہ رسک، زبردست منافع۔",
    rationale_en: "Post-monsoon harvest captures annual price spikes across Punjab & Sindh terminals. High volatility compensated by exceptional potential profit margins.",
    badge_en: "Highest Fast Return",
    badge_ur: "تیز ترین منافع",
  },

  // --- ZAID / SPRING CROPS (بہاریہ سہ ماہی) ---
  {
    cropKey: "spring_maize",
    name_en: "Spring Maize (Corn)",
    name_ur: "بہاریہ مکئی",
    emoji: "🌽",
    season: "zaid_spring" as SeasonKey,
    season_ur: "بہاریہ (درمیانی سہ ماہی)",
    baseSeed: 14000, // Hybrid seed
    baseDap: 14000,
    baseUrea: 16000, // High nitrogen feeder
    baseIrrigation: 26000,
    basePesticideLabor: 16000,
    baseHarvesting: 14000,
    yieldMaundsMin: 85,
    yieldMaundsMax: 110,
    expectedPricePerMaund: 2850,
    sowingWindow_ur: "20 جنوری تا 25 فروری",
    sowingWindow_en: "Jan 20 – Feb 25",
    harvestWindow_ur: "مئی تا جون",
    harvestWindow_en: "May – June",
    durationDays: 115,
    waterRequirement_ur: "زیادہ (6 تا 8 پانیاں)",
    waterRequirement_en: "High (6-8 Irrigations)",
    riskLevel_ur: "کم (پولٹری فیڈ انڈسٹری کی مستقل طلب)",
    riskLevel_en: "Low (Steady Poultry Feed Demand)",
    rationale_ur: "پاکستان کی پولٹری فیڈ اور سائلج انڈسٹری بہاریہ مکئی کی مستقل خریدار ہے۔ اس کی فی ایکڑ پیداوار 100 من تک جاتی ہے اور کٹائی کے بعد اسی کھیت میں خریف چاول یا کپاس لگ سکتی ہے۔",
    rationale_en: "Guaranteed procurement by commercial poultry feed and starch mills. Yields reach 100+ maunds/acre, vacating fields in time for Kharif Basmati.",
    badge_en: "Industrial Feed Demand",
    badge_ur: "فیڈ ملز کی یقینی خریداری",
  },
  {
    cropKey: "sunflower_spring",
    name_en: "Sunflower (Spring Oilseed)",
    name_ur: "سورج مکھی (بہاریہ)",
    emoji: "🌻",
    season: "zaid_spring" as SeasonKey,
    season_ur: "بہاریہ (درمیانی سہ ماہی)",
    baseSeed: 7000,
    baseDap: 10000,
    baseUrea: 8000,
    baseIrrigation: 15000,
    basePesticideLabor: 10000,
    baseHarvesting: 11000,
    yieldMaundsMin: 24,
    yieldMaundsMax: 30,
    expectedPricePerMaund: 7800,
    sowingWindow_ur: "15 جنوری تا 15 فروری",
    sowingWindow_en: "Jan 15 – Feb 15",
    harvestWindow_ur: "مئی تا جون",
    harvestWindow_en: "May – June",
    durationDays: 110,
    waterRequirement_ur: "کم (3 تا 4 پانیاں)",
    waterRequirement_en: "Low (3-4 Irrigations)",
    riskLevel_ur: "کم (خوردنی تیل)",
    riskLevel_en: "Low (Oil Seed Stability)",
    rationale_ur: "سورج مکھی گندم کے کٹنے سے پہلے یا ربیع کے خالی کھیتوں میں تیار ہو جاتی ہے۔ کم پانی میں بھی عمدہ پیداوار اور نقد قیمت حاصل ہوتی ہے۔",
    rationale_en: "Short duration oilseed fitting between harvest cycles. Solves irrigation shortages with minimal water needs and immediate mill cash settlement.",
    badge_en: "Water Efficient",
    badge_ur: "کم پانی کا شاہکار",
  },
];

/**
 * Compute personalized Next-Quarter Crop Planning recommendations
 */
export function computeCropPlan(inputs: PlanInputs): CropRecommendation[] {
  const { season, acres, waterSource } = inputs;
  const filteredCrops = CROP_BASE_DATABASE.filter((c) => c.season === season);

  const recommendations = filteredCrops.map((c) => {
    // Water cost adjustment based on source
    let waterMult = 1.0;
    if (waterSource === "tubewell") {
      waterMult = 1.35; // Tube-well electricity/diesel adds 35% to irrigation
    } else if (waterSource === "rainfed") {
      waterMult = 0.35; // Minimal irrigation costs, but yield drops slightly
    }

    const irrigationCost = Math.round(c.baseIrrigation * waterMult);

    const costBreakdown: CostBreakdown = {
      seedPkr: c.baseSeed,
      dapFertilizerPkr: c.baseDap,
      ureaFertilizerPkr: c.baseUrea,
      irrigationFuelPkr: irrigationCost,
      pesticideLaborPkr: c.basePesticideLabor,
      harvestingPkr: c.baseHarvesting,
      totalPerAcrePkr:
        c.baseSeed +
        c.baseDap +
        c.baseUrea +
        irrigationCost +
        c.basePesticideLabor +
        c.baseHarvesting,
    };

    const costPerAcre = costBreakdown.totalPerAcrePkr;
    const avgYield = Math.round((c.yieldMaundsMin + c.yieldMaundsMax) / 2);
    const expectedHarvestPricePerMaund = c.expectedPricePerMaund;
    const expectedHarvestPricePerKg = Math.round(c.expectedPricePerMaund / 40);

    const grossRevenuePerAcre = avgYield * expectedHarvestPricePerMaund;
    const netProfitPerAcre = grossRevenuePerAcre - costPerAcre;
    const roiPercent = Math.round((netProfitPerAcre / costPerAcre) * 100);

    const totalCostPkr = costPerAcre * acres;
    const totalRevenuePkr = grossRevenuePerAcre * acres;
    const totalNetProfitPkr = netProfitPerAcre * acres;

    return {
      cropKey: c.cropKey,
      name_en: c.name_en,
      name_ur: c.name_ur,
      emoji: c.emoji,
      season: c.season,
      season_ur: c.season_ur,
      rank: 1, // Will sort and assign below
      badge_en: c.badge_en,
      badge_ur: c.badge_ur,
      costPerAcre,
      expectedYieldMaundsPerAcre: avgYield,
      expectedHarvestPricePerMaund,
      expectedHarvestPricePerKg,
      grossRevenuePerAcre,
      netProfitPerAcre,
      roiPercent,
      totalCostPkr,
      totalRevenuePkr,
      totalNetProfitPkr,
      sowingWindow_ur: c.sowingWindow_ur,
      sowingWindow_en: c.sowingWindow_en,
      harvestWindow_ur: c.harvestWindow_ur,
      harvestWindow_en: c.harvestWindow_en,
      durationDays: c.durationDays,
      waterRequirement_ur: c.waterRequirement_ur,
      waterRequirement_en: c.waterRequirement_en,
      riskLevel_ur: c.riskLevel_ur,
      riskLevel_en: c.riskLevel_en,
      costBreakdown,
      rationale_ur: c.rationale_ur,
      rationale_en: c.rationale_en,
    };
  });

  // Sort by net profit per acre descending
  recommendations.sort((a, b) => b.netProfitPerAcre - a.netProfitPerAcre);

  // Assign ranks
  recommendations.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return recommendations;
}
