/**
 * Shared demo seed data used by prisma/seed.ts and database/schema.sql generation.
 * Fixed UUIDs ensure reproducible references across SQL imports and Prisma seed.
 */
import { DEMO_COMPANY, DEMO_PROPOSALS, generateSupplementaryDemoProposals } from "@/lib/demo/data";
import { DEFAULT_SEQUENCES } from "@/lib/services/follow-up/sequences";

export const SEED_COMPANY_ID = "00000000-0000-4000-8000-000000000001";
export const SEED_USER_ID = "00000000-0000-4000-8000-000000000002";

export const SEED_SEQUENCE_IDS = [
  "00000000-0000-4000-8003-000000000001",
  "00000000-0000-4000-8003-000000000002",
  "00000000-0000-4000-8003-000000000003",
  "00000000-0000-4000-8003-000000000004",
] as const;

function prospectId(index: number) {
  return `00000000-0000-4000-8001-${String(index + 1).padStart(12, "0")}`;
}

function proposalId(index: number) {
  return `00000000-0000-4000-8002-${String(index + 1).padStart(12, "0")}`;
}

function trackingToken(index: number) {
  return `00000000-0000-4000-8004-${String(index + 1).padStart(12, "0")}`;
}

function facilityType(companyName: string): string {
  if (companyName.includes("Medical") || companyName.includes("Dental") || companyName.includes("Clinic"))
    return "medical";
  if (companyName.includes("Warehouse") || companyName.includes("Manufacturing") || companyName.includes("Logistics"))
    return "industrial";
  if (companyName.includes("Hotel") || companyName.includes("Senior")) return "hospitality";
  if (companyName.includes("Retail") || companyName.includes("Market") || companyName.includes("Shopping"))
    return "retail";
  return "office";
}

export interface SeedProspect {
  id: string;
  companyId: string;
  assignedTo: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  website: string | null;
  facilityType: string;
  squareFootage: number;
  numFloors: number;
  numRestrooms: number;
  floorCarpetPct: number;
  floorHardwoodPct: number;
  floorTilePct: number;
  hasKitchen: boolean;
  specialAreas: string[];
  notes: string | null;
  source: string;
  status: string;
}

export interface SeedProposal {
  id: string;
  companyId: string;
  prospectId: string;
  createdBy: string;
  proposalNumber: string;
  version: number;
  services: string[];
  visitFrequency: string;
  serviceTime: string;
  contractDuration: string;
  startDate: Date | null;
  monthlyPrice: number;
  annualPrice: number;
  discountPct: number;
  lineItems: object[];
  executiveSummary: string;
  scopeOfWork: Record<string, string[]>;
  ourApproach: string[];
  differentiators: string[];
  pricingNarrative: string;
  terms: string;
  nextSteps: string;
  trackingToken: string;
  status: string;
  validUntil: Date;
  sentAt: Date | null;
  wonAt: Date | null;
  lostAt: Date | null;
  followUpCount: number;
  sequencePaused: boolean;
}

export interface SeedTrackingEvent {
  id: string;
  proposalId: string;
  eventType: string;
  deviceType: string | null;
  occurredAt: Date;
}

export interface SeedNotification {
  id: string;
  companyId: string;
  proposalId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface SeedFollowUpLog {
  id: string;
  proposalId: string;
  sequenceId: string;
  sequenceStep: number;
  triggerEvent: string;
  subject: string;
  bodyHtml: string;
  sentAt: Date;
}

export interface SeedDataset {
  company: {
    id: string;
    name: string;
    email: string;
    phone: string;
    website: string;
    tagline: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    baseLaborRate: number;
    overheadPct: number;
    targetMarginPct: number;
    smtpFromEmail: string;
    smtpFromName: string;
    differentiators: string[];
    certifications: string[];
  };
  user: {
    id: string;
    companyId: string;
    fullName: string;
    email: string;
    role: string;
    phone: string;
  };
  sequences: {
    id: string;
    companyId: string;
    name: string;
    triggerEvent: string;
    delayHours: number;
    sequenceOrder: number;
    subjectPrompt: string;
    bodyPrompt: string;
    isActive: boolean;
  }[];
  prospects: SeedProspect[];
  proposals: SeedProposal[];
  trackingEvents: SeedTrackingEvent[];
  notifications: SeedNotification[];
  followUpLogs: SeedFollowUpLog[];
}

export function buildSeedDataset(): SeedDataset {
  const allDemos = [...DEMO_PROPOSALS, ...generateSupplementaryDemoProposals()];
  const prospects: SeedProspect[] = [];
  const proposals: SeedProposal[] = [];
  const trackingEvents: SeedTrackingEvent[] = [];
  const notifications: SeedNotification[] = [];
  const followUpLogs: SeedFollowUpLog[] = [];

  allDemos.forEach((demo, index) => {
    const pId = prospectId(index);
    const prId = proposalId(index);
    const token = trackingToken(index);
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 14);

    prospects.push({
      id: pId,
      companyId: SEED_COMPANY_ID,
      assignedTo: SEED_USER_ID,
      fullName: demo.contactName,
      businessName: demo.companyName,
      email: `${demo.contactName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: `(555) ${String(100 + index).padStart(3, "0")}-${String(2000 + index).padStart(4, "0")}`,
      website: `https://www.${demo.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com`,
      facilityType: facilityType(demo.companyName),
      squareFootage: 8000 + index * 500,
      numFloors: index % 3 === 0 ? 1 : index % 3 === 1 ? 2 : 3,
      numRestrooms: 4 + (index % 5),
      floorCarpetPct: 30,
      floorHardwoodPct: 10,
      floorTilePct: 60,
      hasKitchen: index % 2 === 0,
      specialAreas: ["Lobbies", "Break Rooms"],
      notes: index % 4 === 0 ? "High-priority account — decision maker engaged." : null,
      source: ["referral", "website", "cold_outreach", "trade_show"][index % 4],
      status: demo.status === "won" ? "won" : demo.status === "lost" ? "lost" : "active",
    });

    proposals.push({
      id: prId,
      companyId: SEED_COMPANY_ID,
      prospectId: pId,
      createdBy: SEED_USER_ID,
      proposalNumber: demo.proposalNumber,
      version: 1,
      services: ["general_janitorial", "restroom_sanitization"],
      visitFrequency: "3x_week",
      serviceTime: "after_hours",
      contractDuration: "12_months",
      startDate: null,
      monthlyPrice: demo.monthlyPrice,
      annualPrice: demo.annualPrice,
      discountPct: 7,
      lineItems: [
        { service: "General Janitorial", frequency: "3x/week", monthlyCost: demo.monthlyPrice * 0.85 },
        { service: "Restroom Sanitization", frequency: "3x/week", monthlyCost: demo.monthlyPrice * 0.15 },
      ],
      executiveSummary: `Dear ${demo.contactName},\n\nThank you for considering ${DEMO_COMPANY.name} for your commercial cleaning needs at ${demo.companyName}. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.`,
      scopeOfWork: {
        "Common Areas": [
          "Vacuum and mop all hard floors",
          "Dust surfaces and fixtures",
          "Empty trash receptacles",
        ],
        Restrooms: [
          "Sanitize fixtures and dispensers",
          "Clean mirrors and countertops",
          "Restock supplies",
        ],
        Offices: ["Dust workstations", "Vacuum carpeted areas", "Clean interior glass"],
      },
      ourApproach: DEMO_COMPANY.differentiators,
      differentiators: DEMO_COMPANY.differentiators,
      pricingNarrative: `Your monthly investment of $${demo.monthlyPrice.toLocaleString()} reflects the scope and frequency outlined herein.`,
      terms:
        "Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.",
      nextSteps: "Please review and reply to confirm. Valid for 14 days from issue date.",
      trackingToken: token,
      status: demo.status,
      validUntil,
      sentAt: demo.sentAt ? new Date(demo.sentAt) : null,
      wonAt: demo.status === "won" && demo.lastActivity ? new Date(demo.lastActivity) : null,
      lostAt: demo.status === "lost" && demo.sentAt ? new Date(demo.sentAt) : null,
      followUpCount: demo.followUpCount,
      sequencePaused: demo.status === "won" || demo.status === "lost",
    });

    if (demo.status === "hot_lead") {
      for (let i = 0; i < 4; i++) {
        trackingEvents.push({
          id: `00000000-0000-4000-8005-${String(index * 10 + i + 1).padStart(12, "0")}`,
          proposalId: prId,
          eventType: "proposal_viewed",
          deviceType: i % 2 === 0 ? "desktop" : "mobile",
          occurredAt: new Date(Date.now() - i * 3600000),
        });
      }
      notifications.push({
        id: `00000000-0000-4000-8006-${String(index + 1).padStart(12, "0")}`,
        companyId: SEED_COMPANY_ID,
        proposalId: prId,
        type: "hot_lead",
        title: "Hot Lead Alert",
        message: `${demo.companyName} viewed your proposal 4× today`,
        read: false,
        createdAt: new Date(Date.now() - 900000),
      });
    }

    if (demo.status === "opened" || demo.status === "viewed_pricing") {
      trackingEvents.push({
        id: `00000000-0000-4000-8005-${String(index * 10 + 9).padStart(12, "0")}`,
        proposalId: prId,
        eventType: "email_opened",
        deviceType: "desktop",
        occurredAt: new Date(Date.now() - 3600000),
      });
      notifications.push({
        id: `00000000-0000-4000-8006-${String(100 + index).padStart(12, "0")}`,
        companyId: SEED_COMPANY_ID,
        proposalId: prId,
        type: "email_opened",
        title: "Proposal Opened",
        message: `${demo.companyName} opened your proposal email`,
        read: index % 3 === 0,
        createdAt: new Date(Date.now() - 3600000),
      });
    }

    if (demo.status === "won") {
      notifications.push({
        id: `00000000-0000-4000-8006-${String(200 + index).padStart(12, "0")}`,
        companyId: SEED_COMPANY_ID,
        proposalId: prId,
        type: "won",
        title: "Deal Won!",
        message: `Proposal ${demo.proposalNumber} marked as WON`,
        read: true,
        createdAt: demo.lastActivity ? new Date(demo.lastActivity) : new Date(),
      });
    }

    if (demo.followUpCount > 0 && demo.sentAt) {
      followUpLogs.push({
        id: `00000000-0000-4000-8007-${String(index + 1).padStart(12, "0")}`,
        proposalId: prId,
        sequenceId: SEED_SEQUENCE_IDS[0],
        sequenceStep: 1,
        triggerEvent: "not_opened_48h",
        subject: `Quick check-in about the proposal for ${demo.companyName}`,
        bodyHtml: `<p>Hi ${demo.contactName}, just checking in on the cleaning proposal we sent.</p>`,
        sentAt: new Date(new Date(demo.sentAt).getTime() + 48 * 3600000),
      });
    }
  });

  return {
    company: {
      id: SEED_COMPANY_ID,
      name: DEMO_COMPANY.name,
      email: DEMO_COMPANY.email,
      phone: DEMO_COMPANY.phone ?? "(555) 234-8900",
      website: "https://www.sparkleclean.com",
      tagline: DEMO_COMPANY.tagline ?? "Professional cleaning. Predictable results.",
      address: "1200 Commerce Blvd, Suite 400",
      city: "Austin",
      state: "TX",
      zip: "78701",
      baseLaborRate: DEMO_COMPANY.baseLaborRate,
      overheadPct: DEMO_COMPANY.overheadPct,
      targetMarginPct: DEMO_COMPANY.targetMarginPct,
      smtpFromEmail: DEMO_COMPANY.email,
      smtpFromName: DEMO_COMPANY.name,
      differentiators: DEMO_COMPANY.differentiators,
      certifications: DEMO_COMPANY.certifications,
    },
    user: {
      id: SEED_USER_ID,
      companyId: SEED_COMPANY_ID,
      fullName: "Sarah Chen",
      email: "sarah@sparkleclean.com",
      role: "admin",
      phone: "(555) 234-8901",
    },
    sequences: DEFAULT_SEQUENCES.map((s, i) => ({
      id: SEED_SEQUENCE_IDS[i],
      companyId: SEED_COMPANY_ID,
      name: s.name,
      triggerEvent: s.triggerEvent,
      delayHours: s.delayHours,
      sequenceOrder: s.sequenceOrder,
      subjectPrompt: s.subjectPrompt,
      bodyPrompt: s.bodyPrompt,
      isActive: s.isActive,
    })),
    prospects,
    proposals,
    trackingEvents,
    notifications,
    followUpLogs,
  };
}
