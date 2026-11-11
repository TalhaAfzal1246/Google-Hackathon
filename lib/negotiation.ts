/**
 * Bilateral Automated Negotiation Engine
 * Uses non-linear concession curves (Zeuthen / Faratin model) bounded by
 * the statistical Fair Band [P25, P75].
 */

export interface NegotiationTurn {
  round: number;
  maxRounds: number;
  farmerFloor: number;
  buyerCeiling: number;
  fairBandP25: number;
  fairBandP50: number;
  fairBandP75: number;
}

export function computeNegotiationStep(turn: NegotiationTurn) {
  const {
    round,
    maxRounds,
    farmerFloor,
    buyerCeiling,
    fairBandP25,
    fairBandP50,
    fairBandP75,
  } = turn;

  const r = Math.min(round, maxRounds);
  const R = maxRounds;

  // Farmer: Starts at max(floor, P75), concedes toward max(floor, P50) with beta = 2.4 (stubborn seller)
  const farmerStart = Math.max(farmerFloor, fairBandP75);
  const farmerEnd = Math.max(farmerFloor, fairBandP50);
  const farmerOffer = Math.round(
    farmerStart + (farmerEnd - farmerStart) * Math.pow(r / R, 2.4)
  );

  // Buyer: Starts at min(ceiling, P25), concedes toward min(ceiling, P50) with beta = 0.75 (early concession)
  const buyerStart = Math.min(buyerCeiling, fairBandP25);
  const buyerEnd = Math.min(buyerCeiling, fairBandP50);
  const buyerOffer = Math.round(
    buyerStart + (buyerEnd - buyerStart) * Math.pow(r / R, 0.75)
  );

  const isDeal = buyerOffer >= farmerOffer;
  const settlementPrice = isDeal
    ? Math.round((buyerOffer + farmerOffer) / 2)
    : null;

  return {
    round: r,
    farmerOffer: Math.max(farmerOffer, farmerFloor),
    buyerOffer: Math.min(buyerOffer, buyerCeiling),
    isDeal,
    settlementPrice,
    insideFairBand:
      settlementPrice !== null
        ? settlementPrice >= fairBandP25 && settlementPrice <= fairBandP75
        : false,
  };
}
