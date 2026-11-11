export type CropKey = 'tomato' | 'onion' | 'potato' | 'wheat' | 'rice_basmati';
export type MarketKey =
  | 'lahore_badami_bagh'
  | 'multan_ghalla'
  | 'faisalabad_gole'
  | 'karachi_superhighway'
  | 'rawalpindi_i11';

export interface CropInfo {
  name_en: string;
  name_ur: string;
  unit: string;
  perishable: boolean;
  base_farmgate: number;
}

export interface MarketInfo {
  name: string;
  name_ur: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  retail_markup: number;
  normal_margin_pct: number;
  volume_tier: string;
}

export interface MarketRecord {
  date: string;
  crop: CropKey;
  crop_name: string;
  crop_name_ur: string;
  market: MarketKey;
  market_name: string;
  market_name_ur: string;
  farmgate_price: number;
  wholesale_price: number;
  retail_price: number;
  spread_pkr: number;
  normal_spread_pkr: number;
  daily_arrivals_tons: number;
  daily_demand_tons: number;
  fuel_index: number;
  is_anomaly: boolean;
  source: string;
}

export interface HorizonQuantile {
  horizon_days: number;
  target_date: string;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  realized: number | null;
}

export interface AsOfEvaluation {
  as_of_date: string;
  current_price: number;
  daily_arrivals: number;
  daily_demand: number;
  horizons: HorizonQuantile[];
}

export interface ForecastEntry {
  crop: CropKey;
  market: MarketKey;
  as_of_evaluations: Record<string, AsOfEvaluation>;
}

export interface BuyerProfile {
  id: string;
  name: string;
  name_ur: string;
  type: string;
  city: string;
  lat: number;
  lng: number;
  crops: CropKey[];
  min_qty_kg: number;
  max_qty_kg: number;
  ceiling_mult: number;
  trust_score: number;
  payment_terms: string;
}

export interface WindowParams {
  p50: number;
  p10: number;
  step: number;        // days ahead
  spoil: number;       // spoilage fraction per day
  storage: number;     // storage cost per kg per day (PKR)
  rate: number;        // financing interest rate per day
  p50Now: number;      // current farmgate price (PKR)
  transport: number;   // transport cost per kg (PKR)
}

export interface WindowResult {
  step: number;
  net50: number;
  net10: number;
  score: number;
}

export interface VerdictResult {
  verdict: 'Sell Now' | `Hold ${number} Days`;
  verdict_ur: string;
  bestStep: number;
  gain: number;
  gainPercent: number;
  windows: WindowResult[];
  recommendedPrice: number;
}

export interface Listing {
  id: string;
  farmerId: string;
  farmerName: string;
  crop: CropKey;
  cropName: string;
  cropNameUr: string;
  qtyKg: number;
  market: MarketKey;
  marketName: string;
  readyDate: string;
  floorPrice: number;
  suggestedFloor: number;
  createdAt: string;
  status: 'active' | 'negotiating' | 'sold';
}

export interface Deal {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  crop: CropKey;
  qtyKg: number;
  pricePerKg: number;
  totalAmountPkr: number;
  fairBandP25: number;
  fairBandP75: number;
  settledAt: string;
}
