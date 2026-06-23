export const APP_NAME = "CleanProposal AI";

export const COLORS = {
  primary: "#1E40AF",
  accent: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  textPrimary: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
} as const;

export const FACILITY_TYPES = [
  { value: "office", label: "Office Building / Corporate" },
  { value: "medical", label: "Medical / Healthcare Facility" },
  { value: "retail", label: "Retail Store / Shopping Center" },
  { value: "industrial", label: "Industrial / Warehouse" },
  { value: "education", label: "Educational Institution" },
  { value: "government", label: "Government / Municipal" },
  { value: "restaurant", label: "Restaurant / Food Service" },
  { value: "gym", label: "Gym / Fitness Center" },
  { value: "other", label: "Other" },
] as const;

export const SERVICE_TYPES = [
  { value: "general_janitorial", label: "General Janitorial" },
  { value: "restroom_sanitization", label: "Restroom Sanitization" },
  { value: "floor_care", label: "Floor Care (waxing, buffing, stripping)" },
  { value: "carpet_cleaning", label: "Carpet Cleaning" },
  { value: "window_interior", label: "Window Washing (interior)" },
  { value: "window_exterior", label: "Window Washing (exterior)" },
  { value: "pressure_washing", label: "Pressure Washing" },
  { value: "post_construction", label: "Post-Construction Cleanup" },
  { value: "deep_clean", label: "Deep / One-Time Clean" },
] as const;

export const VISIT_FREQUENCIES = [
  { value: "daily", label: "Daily (5x/week)", visitsPerMonth: 22 },
  { value: "3x_week", label: "3x per week", visitsPerMonth: 13 },
  { value: "2x_week", label: "2x per week", visitsPerMonth: 9 },
  { value: "weekly", label: "Weekly", visitsPerMonth: 4 },
  { value: "biweekly", label: "Bi-weekly", visitsPerMonth: 2 },
  { value: "monthly", label: "Monthly", visitsPerMonth: 1 },
  { value: "one_time", label: "One-Time", visitsPerMonth: 1 },
] as const;

export const SERVICE_TIMES = [
  { value: "business_hours", label: "During Business Hours" },
  { value: "after_hours", label: "After Hours (evenings)" },
  { value: "weekends", label: "Weekends Only" },
  { value: "flexible", label: "Flexible" },
] as const;

export const CONTRACT_DURATIONS = [
  { value: "month_to_month", label: "Month-to-Month", discountPct: 0 },
  { value: "6_months", label: "6 Months", discountPct: 3 },
  { value: "12_months", label: "12 Months (recommended)", discountPct: 7 },
  { value: "24_months", label: "24 Months", discountPct: 12 },
] as const;

export const SPECIAL_AREAS = [
  "Server rooms",
  "Clean rooms",
  "Lobbies",
  "Elevators",
  "Parking garage",
] as const;

export const LEAD_SOURCES = [
  "Referral",
  "Website",
  "Google Search",
  "Cold Call",
  "Trade Show",
  "LinkedIn",
  "Other",
] as const;

/** Valid promotional codes — discount % applied on top of contract discount */
export const PROMO_CODES: Record<string, { discountPct: number; label: string }> = {
  WELCOME10: { discountPct: 10, label: "Welcome offer — 10% off" },
  SPRING2026: { discountPct: 5, label: "Spring promotion — 5% off" },
  REFERRAL15: { discountPct: 15, label: "Referral discount — 15% off" },
};

export function resolvePromoDiscount(code?: string): number {
  if (!code) return 0;
  const normalized = code.trim().toUpperCase();
  return PROMO_CODES[normalized]?.discountPct ?? 0;
}

export const PROPOSAL_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-slate-100 text-slate-700" },
  { value: "sent", label: "Sent", color: "bg-blue-100 text-blue-700" },
  { value: "not_opened", label: "Not Opened", color: "bg-orange-100 text-orange-700" },
  { value: "opened", label: "Opened", color: "bg-indigo-100 text-indigo-700" },
  { value: "viewed_pricing", label: "Viewed Pricing", color: "bg-purple-100 text-purple-700" },
  { value: "hot_lead", label: "Hot Lead", color: "bg-amber-100 text-amber-700" },
  { value: "won", label: "Won", color: "bg-emerald-100 text-emerald-700" },
  { value: "lost", label: "Lost", color: "bg-red-100 text-red-700" },
  { value: "expired", label: "Expired", color: "bg-gray-100 text-gray-600" },
] as const;

export type FacilityType = (typeof FACILITY_TYPES)[number]["value"];
export type ServiceType = (typeof SERVICE_TYPES)[number]["value"];
export type VisitFrequency = (typeof VISIT_FREQUENCIES)[number]["value"];
export type ServiceTime = (typeof SERVICE_TIMES)[number]["value"];
export type ContractDuration = (typeof CONTRACT_DURATIONS)[number]["value"];
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number]["value"];
