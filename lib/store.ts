import { Listing, Deal } from "./types";

// In-memory persistent state (persists across server requests in the running instance)
let SEEDED_LISTINGS: Listing[] = [
  {
    id: "lst_punjab_tomato_01",
    farmerId: "farmer_malik_tariq",
    farmerName: "Malik Tariq (Okara Model Farm)",
    crop: "tomato",
    cropName: "Tomato",
    cropNameUr: "ٹماٹر",
    qtyKg: 3500,
    market: "lahore_badami_bagh",
    marketName: "Lahore (Badami Bagh Mandi)",
    readyDate: "2026-11-14",
    floorPrice: 65,
    suggestedFloor: 68,
    createdAt: new Date().toISOString(),
    status: "active",
  },
  {
    id: "lst_multan_onion_02",
    farmerId: "farmer_rasheed_ahmed",
    farmerName: "Rasheed Ahmed (Multan Citrus & Onion Estate)",
    crop: "onion",
    cropName: "Onion",
    cropNameUr: "پیاز",
    qtyKg: 8000,
    market: "multan_ghalla",
    marketName: "Multan (Ghalla Mandi)",
    readyDate: "2026-11-18",
    floorPrice: 92,
    suggestedFloor: 95,
    createdAt: new Date().toISOString(),
    status: "active",
  },
  {
    id: "lst_faisalabad_potato_03",
    farmerId: "farmer_chaudhry_aslam",
    farmerName: "Chaudhry Aslam & Brothers",
    crop: "potato",
    cropName: "Potato",
    cropNameUr: "آلو",
    qtyKg: 12000,
    market: "faisalabad_gole",
    marketName: "Faisalabad (Gole Mandi)",
    readyDate: "2026-11-15",
    floorPrice: 42,
    suggestedFloor: 44,
    createdAt: new Date().toISOString(),
    status: "active",
  },
];

let SEEDED_DEALS: Deal[] = [
  {
    id: "deal_001_initial",
    listingId: "lst_seed_wheat_historical",
    buyerId: "buyer_multan_flour",
    buyerName: "Al-Rehman Flour & Feed Mills",
    farmerId: "farmer_babar_hayat",
    farmerName: "Babar Hayat (Vehari)",
    crop: "wheat",
    qtyKg: 15000,
    pricePerKg: 91,
    totalAmountPkr: 1365000,
    fairBandP25: 86,
    fairBandP75: 94,
    settledAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function getListings(): Listing[] {
  return [...SEEDED_LISTINGS];
}

export function addListing(listing: Listing): Listing {
  SEEDED_LISTINGS.unshift(listing);
  return listing;
}

export function updateListingStatus(id: string, status: Listing["status"]): void {
  const item = SEEDED_LISTINGS.find((l) => l.id === id);
  if (item) item.status = status;
}

export function getDeals(): Deal[] {
  return [...SEEDED_DEALS];
}

export function addDeal(deal: Deal): Deal {
  SEEDED_DEALS.unshift(deal);
  updateListingStatus(deal.listingId, "sold");
  return deal;
}

export function resetDemoState(): void {
  // Resets to initial seed
  SEEDED_LISTINGS = [
    {
      id: "lst_punjab_tomato_01",
      farmerId: "farmer_malik_tariq",
      farmerName: "Malik Tariq (Okara Model Farm)",
      crop: "tomato",
      cropName: "Tomato",
      cropNameUr: "ٹماٹر",
      qtyKg: 3500,
      market: "lahore_badami_bagh",
      marketName: "Lahore (Badami Bagh Mandi)",
      readyDate: "2026-11-14",
      floorPrice: 65,
      suggestedFloor: 68,
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: "lst_multan_onion_02",
      farmerId: "farmer_rasheed_ahmed",
      farmerName: "Rasheed Ahmed (Multan Citrus & Onion Estate)",
      crop: "onion",
      cropName: "Onion",
      cropNameUr: "پیاز",
      qtyKg: 8000,
      market: "multan_ghalla",
      marketName: "Multan (Ghalla Mandi)",
      readyDate: "2026-11-18",
      floorPrice: 92,
      suggestedFloor: 95,
      createdAt: new Date().toISOString(),
      status: "active",
    },
  ];
  SEEDED_DEALS = [];
}
