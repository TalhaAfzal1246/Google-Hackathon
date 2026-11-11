import assert from "assert";
import { computeVerdict, windowScore } from "../lib/advice";
import { decomposeSpread } from "../lib/spread";
import { rankBuyers } from "../lib/match";
import { computeNegotiationStep } from "../lib/negotiation";
import { numbersMatch } from "../lib/validate";
import { MarketRecord, BuyerProfile } from "../lib/types";

console.log("=== Running Farm-to-Future Sanity Test Suite ===");

// Check 1: Flat price series gives "Sell Now" verdict because storage/spoilage decays net return
const flatWindows = [
  { step: 3, p50: 60, p10: 55 },
  { step: 7, p50: 60, p10: 55 },
  { step: 14, p50: 60, p10: 55 },
];
const costs = { spoil: 0.01, storage: 0.2, rate: 0.0005, transport: 2.0 };
const flatVerdict = computeVerdict(60, flatWindows, costs);
assert.strictEqual(
  flatVerdict.verdict,
  "Sell Now",
  "Flat prices must recommend 'Sell Now' due to storage and spoilage carry costs"
);
console.log("✓ Check 1 Passed: Flat price series correctly recommends 'Sell Now'.");

// Check 2: Injected anomaly gets flagged by decomposeSpread
const anomalyRecord: MarketRecord = {
  date: "2026-10-15",
  crop: "tomato",
  crop_name: "Tomato",
  crop_name_ur: "ٹماٹر",
  market: "lahore_badami_bagh",
  market_name: "Lahore (Badami Bagh)",
  market_name_ur: "لاہور",
  farmgate_price: 50,
  wholesale_price: 65,
  retail_price: 130, // massive retail price jump while farmgate is low
  spread_pkr: 80,
  normal_spread_pkr: 25,
  daily_arrivals_tons: 200,
  daily_demand_tons: 220,
  fuel_index: 1.1,
  is_anomaly: true,
  source: "test",
};
const decomp = decomposeSpread(anomalyRecord);
assert.ok(decomp.isGouging, "Anomaly record must be flagged as gouging");
assert.ok(decomp.unexplainedSurplusPct > 35, "Unexplained surplus should exceed 35%");
console.log("✓ Check 2 Passed: Injected middleman cartel anomaly correctly flagged.");

// Check 3: Buyer match scores stay within [0, 1]
const testBuyers: BuyerProfile[] = [
  {
    id: "b1",
    name: "Test Metro",
    name_ur: "ٹیسٹ",
    type: "Wholesale",
    city: "Lahore",
    lat: 31.5,
    lng: 74.3,
    crops: ["tomato"],
    min_qty_kg: 1000,
    max_qty_kg: 10000,
    ceiling_mult: 1.15,
    trust_score: 0.95,
    payment_terms: "Raast",
  },
];
const matches = rankBuyers(testBuyers, "tomato", 3000, 31.5, 74.3, 70, 60);
assert.ok(matches.length > 0, "Must return matches");
assert.ok(matches[0].totalScore >= 0 && matches[0].totalScore <= 1.0, "Score must be bounded between 0 and 1");
console.log("✓ Check 3 Passed: Match compatibility scores stay strictly bounded in [0, 1].");

// Check 4: Negotiation concession curve respects farmer floor
const neg = computeNegotiationStep({
  round: 5,
  maxRounds: 5,
  farmerFloor: 65,
  buyerCeiling: 80,
  fairBandP25: 68,
  fairBandP50: 72,
  fairBandP75: 78,
});
assert.ok(neg.farmerOffer >= 65, "Farmer offer must never drop below floor");
assert.ok(neg.buyerOffer <= 80, "Buyer offer must never exceed ceiling");
assert.ok(neg.isDeal, "Round 5 should converge to a deal");
console.log("✓ Check 4 Passed: Autonomous bilateral bargaining converges within fair bounds.");

// Check 5: Anti-Hallucination Number Validator
const allowed = [65, 12, 14.8, 250];
assert.ok(
  numbersMatch("Holding for 12 days provides a gain of ₨ 14.8 with 250 tons demand.", allowed),
  "Matching claim must pass validator"
);
assert.ok(
  !numbersMatch("Holding for 12 days provides a gain of ₨ 999.0 with 250 tons demand.", allowed),
  "Hallucinated price claim (₨ 999) must be rejected by validator"
);
console.log("✓ Check 5 Passed: Deterministic anti-hallucination validation engine works perfectly.");

console.log("\nALL 5 SANITY CHECKS PASSED SUCCESSFULLY! 100% MATH INTEGRITY.");
