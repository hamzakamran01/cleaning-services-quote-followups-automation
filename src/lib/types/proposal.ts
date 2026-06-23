import type {
  ContractDuration,
  FacilityType,
  ServiceType,
  ServiceTime,
  VisitFrequency,
} from "@/lib/constants";

export interface LineItem {
  service: string;
  frequency: string;
  monthlyCost: number;
}

export interface PricingConfig {
  baseLaborRate: number;
  overheadPct: number;
  targetMarginPct: number;
  supplyCostPerSqFt: number;
  productivityRate: number;
}

export interface PricingInput {
  facilityType: FacilityType;
  squareFootage: number;
  numRestrooms: number;
  floorCarpetPct: number;
  floorHardwoodPct: number;
  floorTilePct: number;
  hasKitchen: boolean;
  specialAreas: string[];
  serviceTypes: ServiceType[];
  visitFrequency: VisitFrequency;
  contractDuration: ContractDuration;
  discountPct?: number;
}

export interface PricingResult {
  monthlyPrice: number;
  annualPrice: number;
  visitPrice: number;
  visitsPerMonth: number;
  lineItems: LineItem[];
  discountApplied: number;
  breakdown: {
    baseRate: number;
    laborHours: number;
    laborCost: number;
    supplyCost: number;
    overhead: number;
    subtotal: number;
    margin: number;
    frequencyMultiplier: number;
    contractDiscount: number;
    restroomCost: number;
    specialAreaCost: number;
    kitchenPremium: number;
  };
}

export interface IntakeFormData {
  client: {
    fullName: string;
    businessName: string;
    email: string;
    phone?: string;
    website?: string;
  };
  facility: {
    type: FacilityType;
    typeOther?: string;
    squareFootage: number;
    numFloors: number;
    numRestrooms: number;
    floorCarpetPct: number;
    floorHardwoodPct: number;
    floorTilePct: number;
    hasKitchen: boolean;
    specialAreas: string[];
  };
  services: {
    types: ServiceType[];
    visitFrequency: VisitFrequency;
    serviceTime: ServiceTime;
    contractDuration: ContractDuration;
    startDate?: string;
  };
  customization: {
    notes?: string;
    source?: string;
    discountPct?: number;
    promoCode?: string;
  };
}

export interface ProposalContent {
  executiveSummary: string;
  scopeOfWork: Record<string, string[]>;
  ourApproach: string[];
  differentiators: string[];
  pricingNarrative: string;
  terms: string;
  nextSteps: string;
}

export interface DashboardStats {
  proposalsSent: number;
  openRate: number;
  conversionRate: number;
  revenueWon: number;
  pipelineValue: number;
  avgProposalValue: number;
  avgDaysToClose?: number;
}

export interface MonthlyAnalytics {
  month: string;
  proposalsSent: number;
  proposalsWon: number;
  revenueWon: number;
  openRate: number;
  conversionRate: number;
}

export interface PipelineColumn {
  status: string;
  label: string;
  count: number;
  value: number;
}

export interface ActivityItem {
  id: string;
  type: "email_opened" | "proposal_viewed" | "hot_lead" | "won" | "follow_up";
  message: string;
  companyName: string;
  occurredAt: string;
  proposalId?: string;
}

export interface DemoProposal {
  id: string;
  proposalNumber: string;
  companyName: string;
  contactName: string;
  monthlyPrice: number;
  annualPrice: number;
  status: string;
  sentAt?: string;
  lastActivity?: string;
  followUpCount: number;
  nextAction?: string;
}
