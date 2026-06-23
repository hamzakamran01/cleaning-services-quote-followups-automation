import fs from "fs";
import path from "path";
import { DEMO_COMPANY, DEMO_PROPOSALS, generateSupplementaryDemoProposals } from "@/lib/demo/data";
import { DEFAULT_SEQUENCES } from "@/lib/services/follow-up/sequences";
import type {
  AppStore,
  CompanyRecord,
  FollowUpLogRecord,
  FollowUpSequenceRecord,
  NotificationRecord,
  ProspectRecord,
  ProposalRecord,
  TrackingEventRecord,
} from "./types";

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(STORE_DIR, "store.json");

let memoryStore: AppStore | null = null;

function now() {
  return new Date().toISOString();
}

function buildInitialStore(): AppStore {
  const companyId = "demo-company-id";
  const company: CompanyRecord = {
    id: companyId,
    name: DEMO_COMPANY.name,
    email: DEMO_COMPANY.email,
    phone: DEMO_COMPANY.phone,
    tagline: DEMO_COMPANY.tagline,
    differentiators: DEMO_COMPANY.differentiators,
    certifications: DEMO_COMPANY.certifications,
    baseLaborRate: DEMO_COMPANY.baseLaborRate,
    overheadPct: DEMO_COMPANY.overheadPct,
    targetMarginPct: DEMO_COMPANY.targetMarginPct,
    smtpFromEmail: DEMO_COMPANY.email,
    smtpFromName: DEMO_COMPANY.name,
  };

  const prospects: ProspectRecord[] = [];
  const proposals: ProposalRecord[] = [];
  const trackingEvents: TrackingEventRecord[] = [];
  const notifications: NotificationRecord[] = [];

  for (const demo of [...DEMO_PROPOSALS, ...generateSupplementaryDemoProposals()]) {
    const prospectId = `prospect-${demo.id}`;
    const proposalId = demo.id;

    prospects.push({
      id: prospectId,
      companyId,
      fullName: demo.contactName,
      businessName: demo.companyName,
      email: `${demo.contactName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      facilityType: demo.companyName.includes("Medical") ? "medical" : demo.companyName.includes("Warehouse") ? "industrial" : "office",
      squareFootage: 15000,
      numFloors: 2,
      numRestrooms: 6,
      floorCarpetPct: 30,
      floorHardwoodPct: 10,
      floorTilePct: 60,
      hasKitchen: true,
      specialAreas: ["Lobbies"],
      status: demo.status === "won" ? "won" : "active",
      createdAt: now(),
      updatedAt: now(),
    });

    proposals.push({
      id: proposalId,
      companyId,
      prospectId,
      proposalNumber: demo.proposalNumber,
      version: 1,
      services: ["general_janitorial", "restroom_sanitization"],
      visitFrequency: "3x_week",
      serviceTime: "after_hours",
      contractDuration: "12_months",
      monthlyPrice: demo.monthlyPrice,
      annualPrice: demo.annualPrice,
      discountPct: 7,
      lineItems: [
        { service: "General Janitorial", frequency: "3x/week", monthlyCost: demo.monthlyPrice },
        { service: "Restroom Sanitization", frequency: "3x/week", monthlyCost: 0 },
      ],
      executiveSummary: `Dear ${demo.contactName},\n\nThank you for considering ${DEMO_COMPANY.name} for your commercial cleaning needs at ${demo.companyName}.`,
      scopeOfWork: {
        "Common Areas": ["Vacuum and mop all hard floors", "Dust surfaces and fixtures", "Empty trash receptacles"],
        Restrooms: ["Sanitize fixtures and dispensers", "Clean mirrors and countertops", "Restock supplies"],
        Offices: ["Dust workstations", "Vacuum carpeted areas", "Clean interior glass"],
      },
      ourApproach: DEMO_COMPANY.differentiators,
      differentiators: DEMO_COMPANY.differentiators,
      pricingNarrative: `Your monthly investment of $${demo.monthlyPrice.toLocaleString()} reflects the scope and frequency outlined herein.`,
      terms: "Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.",
      nextSteps: "Please review and reply to confirm. Valid for 14 days from issue date.",
      trackingToken: `token-${demo.id}`,
      status: demo.status,
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      sentAt: demo.sentAt,
      wonAt: demo.status === "won" ? demo.lastActivity : undefined,
      followUpCount: demo.followUpCount,
      sequencePaused: demo.status === "won" || demo.status === "lost",
      createdAt: demo.sentAt ?? now(),
      updatedAt: demo.lastActivity ?? now(),
    });

    if (demo.status === "hot_lead") {
      for (let i = 0; i < 4; i++) {
        trackingEvents.push({
          id: `evt-${demo.id}-${i}`,
          proposalId,
          eventType: "proposal_viewed",
          deviceType: i % 2 === 0 ? "desktop" : "mobile",
          occurredAt: new Date(Date.now() - i * 3600000).toISOString(),
        });
      }
      notifications.push({
        id: `notif-hot-${demo.id}`,
        companyId,
        proposalId,
        type: "hot_lead",
        title: "Hot Lead Alert",
        message: `${demo.companyName} viewed your proposal 4× today`,
        read: false,
        createdAt: new Date(Date.now() - 900000).toISOString(),
      });
    }

    if (demo.status === "opened") {
      trackingEvents.push({
        id: `evt-open-${demo.id}`,
        proposalId,
        eventType: "email_opened",
        occurredAt: new Date(Date.now() - 3600000).toISOString(),
      });
    }
  }

  const followUpSequences: FollowUpSequenceRecord[] = DEFAULT_SEQUENCES.map((s) => ({
    ...s,
    companyId,
  }));

  return {
    company,
    prospects,
    proposals,
    trackingEvents,
    followUpSequences,
    followUpLogs: [],
    notifications,
  };
}

function readFromDisk(): AppStore | null {
  try {
    if (!fs.existsSync(STORE_FILE)) return null;
    const raw = fs.readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(raw) as AppStore;
  } catch {
    return null;
  }
}

function writeToDisk(store: AppStore) {
  try {
    if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("[store] Failed to persist:", err);
  }
}

export function getStore(): AppStore {
  if (memoryStore) return memoryStore;
  memoryStore = readFromDisk() ?? buildInitialStore();
  writeToDisk(memoryStore);
  return memoryStore;
}

export function saveStore(store: AppStore) {
  memoryStore = store;
  writeToDisk(store);
}

export function mutateStore<T>(fn: (store: AppStore) => T): T {
  const store = getStore();
  const result = fn(store);
  saveStore(store);
  return result;
}

export function resetStore() {
  memoryStore = buildInitialStore();
  saveStore(memoryStore);
}

export type { AppStore, ProposalRecord, ProspectRecord, TrackingEventRecord, FollowUpLogRecord, NotificationRecord };
