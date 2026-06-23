import type { FacilityType, VisitFrequency, ContractDuration } from "@/lib/constants";
import type { PricingConfig, PricingInput, PricingResult, LineItem } from "@/lib/types/proposal";

const FACILITY_RATE_RANGES: Record<
  FacilityType,
  { min: number; max: number; restroomPerVisit: number }
> = {
  office: { min: 0.07, max: 0.12, restroomPerVisit: 12 },
  medical: { min: 0.12, max: 0.18, restroomPerVisit: 20 },
  retail: { min: 0.08, max: 0.13, restroomPerVisit: 14 },
  industrial: { min: 0.04, max: 0.08, restroomPerVisit: 8 },
  education: { min: 0.08, max: 0.13, restroomPerVisit: 12 },
  government: { min: 0.09, max: 0.14, restroomPerVisit: 14 },
  restaurant: { min: 0.1, max: 0.16, restroomPerVisit: 18 },
  gym: { min: 0.09, max: 0.14, restroomPerVisit: 16 },
  other: { min: 0.08, max: 0.12, restroomPerVisit: 12 },
};

const FREQUENCY_MULTIPLIERS: Record<VisitFrequency, number> = {
  daily: 0.95,
  "3x_week": 1.0,
  "2x_week": 1.0,
  weekly: 1.08,
  biweekly: 1.15,
  monthly: 1.25,
  one_time: 1.0,
};

const CONTRACT_DISCOUNTS: Record<ContractDuration, number> = {
  month_to_month: 0,
  "6_months": 3,
  "12_months": 7,
  "24_months": 12,
};

const VISITS_PER_MONTH: Record<VisitFrequency, number> = {
  daily: 22,
  "3x_week": 13,
  "2x_week": 9,
  weekly: 4,
  biweekly: 2,
  monthly: 1,
  one_time: 1,
};

const SERVICE_LABELS: Record<string, string> = {
  general_janitorial: "General Janitorial",
  restroom_sanitization: "Restroom Sanitization",
  floor_care: "Floor Care",
  carpet_cleaning: "Carpet Cleaning",
  window_interior: "Window Washing (Interior)",
  window_exterior: "Window Washing (Exterior)",
  pressure_washing: "Pressure Washing",
  post_construction: "Post-Construction Cleanup",
  deep_clean: "Deep / One-Time Clean",
};

const SERVICE_PREMIUMS: Record<string, number> = {
  general_janitorial: 0,
  restroom_sanitization: 0.05,
  floor_care: 0.12,
  carpet_cleaning: 0.08,
  window_interior: 0.06,
  window_exterior: 0.1,
  pressure_washing: 0.07,
  post_construction: 0.25,
  deep_clean: 0.2,
};

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  baseLaborRate: 22,
  overheadPct: 25,
  targetMarginPct: 30,
  supplyCostPerSqFt: 0.015,
  productivityRate: 2500,
};

function getFacilityRate(facilityType: FacilityType): number {
  const range = FACILITY_RATE_RANGES[facilityType];
  return (range.min + range.max) / 2;
}

function getFloorAdjustment(carpetPct: number): number {
  return 1 + (carpetPct / 100) * 0.15;
}

function getFrequencyLabel(frequency: VisitFrequency): string {
  const labels: Record<VisitFrequency, string> = {
    daily: "Daily (5x/week)",
    "3x_week": "3x/week",
    "2x_week": "2x/week",
    weekly: "Weekly",
    biweekly: "Bi-weekly",
    monthly: "Monthly",
    one_time: "One-Time",
  };
  return labels[frequency];
}

export function calculatePricing(
  input: PricingInput,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): PricingResult {
  const facilityRange = FACILITY_RATE_RANGES[input.facilityType];
  const sqFtRate = getFacilityRate(input.facilityType);
  const floorMultiplier = getFloorAdjustment(input.floorCarpetPct);

  const baseRate = input.squareFootage * sqFtRate * floorMultiplier;
  const laborHours = baseRate / config.productivityRate;
  const laborCost = laborHours * config.baseLaborRate;
  const supplyCost = input.squareFootage * config.supplyCostPerSqFt;
  const overhead = (laborCost + supplyCost) * (config.overheadPct / 100);
  const subtotal = laborCost + supplyCost + overhead;

  const restroomCost =
    input.numRestrooms * facilityRange.restroomPerVisit * VISITS_PER_MONTH[input.visitFrequency];

  const specialAreaCost = input.specialAreas.length * 45 * VISITS_PER_MONTH[input.visitFrequency];
  const kitchenPremium = input.hasKitchen ? subtotal * 0.08 : 0;

  let servicePremium = 0;
  for (const svc of input.serviceTypes) {
    servicePremium += subtotal * (SERVICE_PREMIUMS[svc] ?? 0);
  }

  const adjustedSubtotal = subtotal + restroomCost + specialAreaCost + kitchenPremium + servicePremium;
  const margin = adjustedSubtotal * (config.targetMarginPct / 100);
  let visitPrice = adjustedSubtotal + margin;

  visitPrice *= FREQUENCY_MULTIPLIERS[input.visitFrequency];

  const contractDiscount = CONTRACT_DISCOUNTS[input.contractDuration];
  const additionalDiscount = input.discountPct ?? 0;
  const discountApplied = Math.min(50, contractDiscount + additionalDiscount);
  visitPrice *= 1 - discountApplied / 100;

  const visitsPerMonth = VISITS_PER_MONTH[input.visitFrequency];
  const monthlyPrice = Math.round(visitPrice * visitsPerMonth);
  const annualPrice = Math.round(monthlyPrice * 12);

  const lineItems = buildLineItems(input, monthlyPrice);

  return {
    monthlyPrice,
    annualPrice,
    visitPrice: Math.round(visitPrice * 100) / 100,
    visitsPerMonth,
    lineItems,
    discountApplied,
    breakdown: {
      baseRate: Math.round(baseRate * 100) / 100,
      laborHours: Math.round(laborHours * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      supplyCost: Math.round(supplyCost * 100) / 100,
      overhead: Math.round(overhead * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      frequencyMultiplier: FREQUENCY_MULTIPLIERS[input.visitFrequency],
      contractDiscount,
      restroomCost: Math.round(restroomCost * 100) / 100,
      specialAreaCost: Math.round(specialAreaCost * 100) / 100,
      kitchenPremium: Math.round(kitchenPremium * 100) / 100,
    },
  };
}

function buildLineItems(
  input: PricingInput,
  monthlyTotal: number
): LineItem[] {
  const freqLabel = getFrequencyLabel(input.visitFrequency);
  const items: LineItem[] = [];

  const primaryServices = input.serviceTypes.filter(
    (s) => s !== "restroom_sanitization"
  );

  if (primaryServices.length === 0) {
    primaryServices.push("general_janitorial");
  }

  const perServiceShare = Math.floor(monthlyTotal / primaryServices.length);
  let allocated = 0;

  primaryServices.forEach((svc, idx) => {
    const isLast = idx === primaryServices.length - 1;
    const cost = isLast ? monthlyTotal - allocated : perServiceShare;
    allocated += cost;
    items.push({
      service: SERVICE_LABELS[svc] ?? svc,
      frequency: freqLabel,
      monthlyCost: cost,
    });
  });

  if (input.serviceTypes.includes("restroom_sanitization")) {
    items.push({
      service: "Restroom Sanitization",
      frequency: freqLabel,
      monthlyCost: 0,
    });
  }

  if (input.visitFrequency === "one_time") {
    return items.map((item) => ({
      ...item,
      frequency: "One-Time",
      monthlyCost: monthlyTotal,
    }));
  }

  return items;
}

export function getPriceRange(
  input: PricingInput,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): { low: number; high: number; midpoint: number } {
  const base = calculatePricing(input, config);
  const lowInput = { ...input, discountPct: (input.discountPct ?? 0) + 5 };
  const highInput = { ...input, discountPct: Math.max(0, (input.discountPct ?? 0) - 5) };

  const low = calculatePricing(lowInput, config);
  const high = calculatePricing(highInput, config);

  return {
    low: low.monthlyPrice,
    high: high.monthlyPrice,
    midpoint: base.monthlyPrice,
  };
}
