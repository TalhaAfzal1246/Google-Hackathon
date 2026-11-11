import { WindowParams, WindowResult, VerdictResult } from './types';

/**
 * Computes risk-adjusted net return for holding produce until horizon `step`.
 * Net return accounts for expected market price, spoilage losses,
 * cold storage costs, interest/financing carry cost, and transport.
 */
export function windowScore(w: WindowParams): WindowResult {
  const cost = w.storage * w.step + w.rate * w.p50Now * w.step + w.transport;
  const net50 = w.p50 * (1 - w.spoil * w.step) - cost;
  const net10 = w.p10 * (1 - w.spoil * w.step) - cost;
  // 70% weight on median expectation, 30% on downside risk protection
  const score = 0.7 * net50 + 0.3 * net10;
  return {
    step: w.step,
    net50: Math.round(net50 * 10) / 10,
    net10: Math.round(net10 * 10) / 10,
    score: Math.round(score * 10) / 10,
  };
}

export function computeVerdict(
  p50Now: number,
  windows: Array<{ step: number; p50: number; p10: number }>,
  costs: { spoil: number; storage: number; rate: number; transport: number }
): VerdictResult {
  const todayNet = p50Now - costs.transport;
  let bestStep = 0;
  let bestScore = todayNet;
  let bestNet50 = todayNet;
  let recommendedPrice = p50Now;

  const evaluatedWindows: WindowResult[] = windows.map((w) => {
    const res = windowScore({ ...w, ...costs, p50Now });
    if (res.score > bestScore) {
      bestScore = res.score;
      bestStep = w.step;
      bestNet50 = res.net50;
      recommendedPrice = w.p50;
    }
    return res;
  });

  // Recommend hold only if the expected risk-adjusted gain exceeds a 3% threshold
  const shouldHold = bestScore > todayNet * 1.03 && bestStep > 0;
  const gain = bestNet50 - todayNet;
  const gainPercent = todayNet > 0 ? (gain / todayNet) * 100 : 0;

  return {
    verdict: shouldHold ? `Hold ${bestStep} Days` : 'Sell Now',
    verdict_ur: shouldHold ? `${bestStep} دن انتظار کریں` : 'ابھی فروخت کریں',
    bestStep,
    gain: Math.round(gain * 10) / 10,
    gainPercent: Math.round(gainPercent * 10) / 10,
    windows: evaluatedWindows,
    recommendedPrice: Math.round(recommendedPrice * 10) / 10,
  };
}
