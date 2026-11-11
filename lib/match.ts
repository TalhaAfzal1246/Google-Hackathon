import { BuyerProfile, CropKey } from './types';
import { haversineDistance } from './geo';

export interface MatchScoreBreakdown {
  buyer: BuyerProfile;
  totalScore: number;
  distanceKm: number;
  distanceScore: number;
  priceFitScore: number;
  volumeFitScore: number;
  trustScore: number;
  suggestedOpeningOffer: number;
}

/**
 * Matches wholesale buyers against farmer requirements.
 * Scores 0.0 to 1.0 based on distance, price ceiling, capacity, and trust.
 */
export function rankBuyers(
  buyers: BuyerProfile[],
  crop: CropKey,
  qtyKg: number,
  mandiLat: number,
  mandiLng: number,
  fairBandP50: number,
  floorPrice: number
): MatchScoreBreakdown[] {
  const eligible = buyers.filter((b) => b.crops.includes(crop));

  const ranked = eligible.map((buyer) => {
    // 1. Distance score (closer is better, max 500km)
    const dist = haversineDistance(mandiLat, mandiLng, buyer.lat, buyer.lng);
    const distanceScore = Math.max(0, 1 - dist / 500);

    // 2. Price fit score: buyer willingness to pay above floor
    const buyerCeiling = Math.round(fairBandP50 * buyer.ceiling_mult);
    const priceFitScore = buyerCeiling >= floorPrice
      ? Math.min(1.0, 0.5 + ((buyerCeiling - floorPrice) / Math.max(1, fairBandP50)) * 0.5)
      : 0.2;

    // 3. Volume fit score
    const volumeFitScore =
      qtyKg >= buyer.min_qty_kg && qtyKg <= buyer.max_qty_kg
        ? 1.0
        : qtyKg < buyer.min_qty_kg
        ? Math.max(0.3, qtyKg / buyer.min_qty_kg)
        : Math.max(0.4, buyer.max_qty_kg / qtyKg);

    // 4. Trust score
    const trustScore = buyer.trust_score;

    // Weighted composite score (0 to 1.0)
    const totalScore =
      priceFitScore * 0.35 +
      distanceScore * 0.25 +
      volumeFitScore * 0.20 +
      trustScore * 0.20;

    const suggestedOpeningOffer = Math.round(
      fairBandP50 * 0.92 + (buyerCeiling - fairBandP50 * 0.92) * 0.3
    );

    return {
      buyer,
      totalScore: Math.round(totalScore * 100) / 100,
      distanceKm: dist,
      distanceScore: Math.round(distanceScore * 100) / 100,
      priceFitScore: Math.round(priceFitScore * 100) / 100,
      volumeFitScore: Math.round(volumeFitScore * 100) / 100,
      trustScore: Math.round(trustScore * 100) / 100,
      suggestedOpeningOffer,
    };
  });

  return ranked.sort((a, b) => b.totalScore - a.totalScore);
}
