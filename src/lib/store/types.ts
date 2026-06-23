import type { LineItem, ProposalContent } from "@/lib/types/proposal";

export interface CompanyRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  tagline?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  baseLaborRate: number;
  overheadPct: number;
  targetMarginPct: number;
  smtpFromEmail?: string;
  smtpFromName?: string;
  differentiators: string[];
  certifications: string[];
}

export interface ProspectRecord {
  id: string;
  companyId: string;
  fullName: string;
  businessName: string;
  email: string;
  phone?: string;
  website?: string;
  facilityType: string;
  squareFootage: number;
  numFloors: number;
  numRestrooms: number;
  floorCarpetPct: number;
  floorHardwoodPct: number;
  floorTilePct: number;
  hasKitchen: boolean;
  specialAreas: string[];
  notes?: string;
  source?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalRecord {
  id: string;
  companyId: string;
  prospectId: string;
  proposalNumber: string;
  version: number;
  services: string[];
  visitFrequency: string;
  serviceTime?: string;
  contractDuration: string;
  startDate?: string;
  monthlyPrice: number;
  annualPrice: number;
  discountPct: number;
  lineItems: LineItem[];
  executiveSummary?: string;
  scopeOfWork?: Record<string, string[]>;
  ourApproach: string[];
  differentiators: string[];
  pricingNarrative?: string;
  terms?: string;
  nextSteps?: string;
  pdfUrl?: string;
  trackingToken: string;
  status: string;
  validUntil?: string;
  sentAt?: string;
  wonAt?: string;
  lostAt?: string;
  lostReason?: string;
  followUpCount: number;
  sequencePaused: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEventRecord {
  id: string;
  proposalId: string;
  eventType: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
  occurredAt: string;
}

export interface FollowUpSequenceRecord {
  id: string;
  companyId: string;
  name: string;
  triggerEvent: string;
  delayHours: number;
  sequenceOrder: number;
  subjectPrompt: string;
  bodyPrompt: string;
  isActive: boolean;
}

export interface FollowUpLogRecord {
  id: string;
  proposalId: string;
  sequenceId?: string;
  sequenceStep: number;
  triggerEvent: string;
  subject: string;
  bodyHtml: string;
  sentAt: string;
  openedAt?: string;
  repliedAt?: string;
  resendEmailId?: string;
}

export interface NotificationRecord {
  id: string;
  companyId: string;
  proposalId?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AppStore {
  company: CompanyRecord;
  prospects: ProspectRecord[];
  proposals: ProposalRecord[];
  trackingEvents: TrackingEventRecord[];
  followUpSequences: FollowUpSequenceRecord[];
  followUpLogs: FollowUpLogRecord[];
  notifications: NotificationRecord[];
}

export function contentFromProposal(p: ProposalRecord): ProposalContent {
  return {
    executiveSummary: p.executiveSummary ?? "",
    scopeOfWork: p.scopeOfWork ?? {},
    ourApproach: p.ourApproach,
    differentiators: p.differentiators,
    pricingNarrative: p.pricingNarrative ?? "",
    terms: p.terms ?? "",
    nextSteps: p.nextSteps ?? "",
  };
}

export function proposalToContentFields(content: Partial<ProposalContent>) {
  return {
    executiveSummary: content.executiveSummary,
    scopeOfWork: content.scopeOfWork,
    ourApproach: content.ourApproach ?? [],
    differentiators: content.differentiators ?? [],
    pricingNarrative: content.pricingNarrative,
    terms: content.terms,
    nextSteps: content.nextSteps,
  };
}
