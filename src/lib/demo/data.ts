import type { ActivityItem, DemoProposal, DashboardStats, PipelineColumn } from "@/lib/types/proposal";

export const DEMO_COMPANY = {
  id: "demo-company-id",
  name: "SparkleClean Commercial Services",
  email: "hello@sparkleclean.com",
  phone: "(555) 234-8900",
  tagline: "Professional cleaning. Predictable results.",
  differentiators: [
    "ISO-certified cleaning protocols",
    "Dedicated account manager on every contract",
    "24/7 emergency response team",
  ],
  certifications: ["OSHA Compliant", "Green Seal Certified", "ISSA Member"],
  baseLaborRate: 22,
  overheadPct: 25,
  targetMarginPct: 30,
};

export const DEMO_PIPELINE: PipelineColumn[] = [
  { status: "draft", label: "Draft", count: 3, value: 14200 },
  { status: "sent", label: "Sent", count: 8, value: 42000 },
  { status: "opened", label: "Opened", count: 5, value: 28500 },
  { status: "hot_lead", label: "Hot", count: 2, value: 9800 },
  { status: "won", label: "Won", count: 12, value: 52400 },
];

export const DEMO_STATS: DashboardStats = {
  proposalsSent: 23,
  openRate: 67,
  conversionRate: 22,
  revenueWon: 42600,
  pipelineValue: 94400,
  avgProposalValue: 4100,
};

export const DEMO_PROPOSALS: DemoProposal[] = [
  {
    id: "1",
    proposalNumber: "CLN-2026-1042",
    companyName: "Meridian Financial",
    contactName: "Sarah Chen",
    monthlyPrice: 4800,
    annualPrice: 57600,
    status: "hot_lead",
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    lastActivity: new Date(Date.now() - 120000).toISOString(),
    followUpCount: 1,
    nextAction: "SEQ-C: Hot alert follow-up",
  },
  {
    id: "2",
    proposalNumber: "CLN-2026-1038",
    companyName: "CoreTech Office Park",
    contactName: "James Rodriguez",
    monthlyPrice: 6200,
    annualPrice: 74400,
    status: "opened",
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
    followUpCount: 0,
    nextAction: "SEQ-B: Value follow-up (armed)",
  },
  {
    id: "3",
    proposalNumber: "CLN-2026-1031",
    companyName: "Riverside Medical Center",
    contactName: "Dr. Anita Patel",
    monthlyPrice: 3400,
    annualPrice: 40800,
    status: "sent",
    sentAt: new Date(Date.now() - 172800000).toISOString(),
    lastActivity: new Date(Date.now() - 172800000).toISOString(),
    followUpCount: 0,
    nextAction: "SEQ-A: Gentle nudge (queued)",
  },
  {
    id: "4",
    proposalNumber: "CLN-2026-1015",
    companyName: "The Grand Hotel Group",
    contactName: "Michael Torres",
    monthlyPrice: 8400,
    annualPrice: 100800,
    status: "won",
    sentAt: new Date(Date.now() - 604800000).toISOString(),
    lastActivity: new Date(Date.now() - 259200000).toISOString(),
    followUpCount: 2,
    nextAction: "Closed — won",
  },
  {
    id: "5",
    proposalNumber: "CLN-2026-1045",
    companyName: "Apex Logistics Warehouse",
    contactName: "Kevin Walsh",
    monthlyPrice: 2800,
    annualPrice: 33600,
    status: "draft",
    followUpCount: 0,
    nextAction: "Complete intake & generate",
  },
];

export const DEMO_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    type: "email_opened",
    message: "opened your proposal",
    companyName: "Acme Corp",
    occurredAt: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: "a2",
    type: "hot_lead",
    message: "viewed proposal 4× today",
    companyName: "Meridian Financial",
    occurredAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "a3",
    type: "won",
    message: "marked as WON",
    companyName: "Green Office Solutions",
    occurredAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "a4",
    type: "follow_up",
    message: "SEQ-A follow-up sent",
    companyName: "Riverside Medical Center",
    occurredAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

/** Supplementary proposals to reach PRD demo pipeline targets (§12.3) */
export function generateSupplementaryDemoProposals(): DemoProposal[] {
  const companies = [
    { name: "Summit Law Partners", contact: "Lisa Nguyen", price: 3900, status: "draft" },
    { name: "BrightPath Daycare", contact: "Maria Santos", price: 2100, status: "draft" },
    { name: "Northgate Shopping Plaza", contact: "Tom Bradley", price: 5600, status: "sent" },
    { name: "Pacific Dental Group", contact: "Dr. Kim Lee", price: 3200, status: "sent" },
    { name: "Metro Transit Authority", contact: "Robert Hayes", price: 7800, status: "sent" },
    { name: "Coastal Insurance Co", contact: "Amanda Wright", price: 4100, status: "sent" },
    { name: "Harbor View Apartments", contact: "Chris Dalton", price: 5200, status: "sent" },
    { name: "TechStart Incubator", contact: "Priya Sharma", price: 2900, status: "sent" },
    { name: "Valley Credit Union", contact: "James O'Brien", price: 3600, status: "sent" },
    { name: "Sunrise Senior Living", contact: "Helen Park", price: 4400, status: "opened" },
    { name: "Urban Fitness Club", contact: "Marcus Webb", price: 3100, status: "opened" },
    { name: "City Hall Annex", contact: "Director Walsh", price: 6700, status: "opened" },
    { name: "GreenLeaf Organic Market", contact: "Sara Bloom", price: 3800, status: "opened" },
    { name: "Atlas Manufacturing", contact: "Frank Miller", price: 5900, status: "hot_lead" },
    { name: "Premier Auto Group", contact: "Derek Chen", price: 4500, status: "won" },
    { name: "Westside Medical Clinic", contact: "Dr. Evans", price: 3700, status: "won" },
    { name: "Liberty Bank HQ", contact: "Susan Grant", price: 9200, status: "won" },
    { name: "Cascade Hotel", contact: "Michael Torres", price: 7100, status: "won" },
    { name: "Pioneer Logistics", contact: "Kevin Walsh", price: 3300, status: "won" },
    { name: "Evergreen Office Park", contact: "Janet Cole", price: 4800, status: "won" },
    { name: "Ridgeview Apartments", contact: "Paul Singh", price: 2600, status: "won" },
    { name: "Sterling Wealth Mgmt", contact: "David Park", price: 5400, status: "won" },
    { name: "Oakwood Elementary", contact: "Principal Adams", price: 4200, status: "won" },
    { name: "BlueStar Retail", contact: "Nina Patel", price: 3500, status: "won" },
    { name: "Horizon Tech Campus", contact: "Alex Rivera", price: 6100, status: "won" },
    { name: "Legacy Foods Inc", contact: "Carlos Mendez", price: 4900, status: "won" },
    { name: "Old Town Brewery", contact: "Jake Morrison", price: 2700, status: "lost" },
    { name: "FastFreight Depot", contact: "Tony Russo", price: 5100, status: "lost" },
    { name: "Downtown Fitness", contact: "Amy Cho", price: 2400, status: "lost" },
    { name: "Suburban Auto Parts", contact: "Rick Barnes", price: 3800, status: "lost" },
    { name: "Community Church", contact: "Pastor Ellis", price: 1900, status: "lost" },
    { name: "Budget Storage Co", contact: "Dan Foster", price: 2200, status: "lost" },
    { name: "QuickPrint Express", contact: "Linda Wu", price: 1600, status: "lost" },
  ];

  return companies.map((c, i) => {
    const daysAgo = 3 + i * 2;
    const sentAt = c.status !== "draft"
      ? new Date(Date.now() - daysAgo * 86400000).toISOString()
      : undefined;
    return {
      id: `supp-${i + 10}`,
      proposalNumber: `CLN-2026-${1000 + i}`,
      companyName: c.name,
      contactName: c.contact,
      monthlyPrice: c.price,
      annualPrice: c.price * 12,
      status: c.status,
      sentAt,
      lastActivity: sentAt ?? new Date(Date.now() - i * 3600000).toISOString(),
      followUpCount: c.status === "sent" ? 0 : c.status === "lost" ? 3 : 1,
      nextAction: undefined,
    };
  });
}
