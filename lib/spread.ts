import { MarketRecord } from './types';

export interface SpreadDecomposition {
  fuelTransportPkr: number;
  handlingCommissionPkr: number;
  normalStoragePkr: number;
  normalMarginTotalPkr: number;
  unexplainedSurplusPkr: number;
  unexplainedSurplusPct: number;
  isGouging: boolean;
}

export function decomposeSpread(record: MarketRecord): SpreadDecomposition {
  const actualSpread = Math.max(0, record.retail_price - record.farmgate_price);
  
  // Benchmark logistics costs modeled for Pakistani transport
  const fuelTransportPkr = Math.round((2.5 + record.fuel_index * 1.8) * 10) / 10;
  const handlingCommissionPkr = Math.round(record.wholesale_price * 0.05 * 10) / 10;
  const normalStoragePkr = Math.round(record.farmgate_price * 0.04 * 10) / 10;
  
  const normalMarginTotalPkr = Math.round(
    (fuelTransportPkr + handlingCommissionPkr + normalStoragePkr + record.farmgate_price * 0.12) * 10
  ) / 10;

  const unexplainedSurplusPkr = Math.max(0, Math.round((actualSpread - normalMarginTotalPkr) * 10) / 10);
  const unexplainedSurplusPct = actualSpread > 0
    ? Math.round((unexplainedSurplusPkr / actualSpread) * 100)
    : 0;

  return {
    fuelTransportPkr,
    handlingCommissionPkr,
    normalStoragePkr,
    normalMarginTotalPkr,
    unexplainedSurplusPkr,
    unexplainedSurplusPct,
    isGouging: record.is_anomaly || unexplainedSurplusPct > 35,
  };
}
