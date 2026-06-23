import type { Prisma } from "@prisma/client";
import { prisma, DEMO_COMPANY_ID } from "@/lib/db";
import type {
  CompanyRecord,
  FollowUpLogRecord,
  FollowUpSequenceRecord,
  NotificationRecord,
  ProposalRecord,
  ProspectRecord,
  TrackingEventRecord,
} from "@/lib/store/types";
import type { IntakeFormValues } from "@/lib/validations/intake";
import type { LineItem, ProposalContent, PricingConfig } from "@/lib/types/proposal";
import { generateProposalNumber } from "@/lib/utils";
import { calculatePricing } from "@/lib/pricing/engine";
import type { FacilityType, ServiceType, VisitFrequency, ContractDuration } from "@/lib/constants";
import { resolvePromoDiscount } from "@/lib/constants";
import { proposalToContentFields } from "@/lib/store/types";
import { sendEmail } from "@/lib/services/email/resend";

const COMPANY_ID = DEMO_COMPANY_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function num(v: Prisma.Decimal | number | null | undefined): number {
  if (v == null) return 0;
  return typeof v === "number" ? v : Number(v);
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function dateOnly(d: Date | null | undefined): string | undefined {
  if (!d) return undefined;
  return d.toISOString().split("T")[0];
}

function iso(d: Date | null | undefined): string | undefined {
  return d?.toISOString();
}

function toCompany(c: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  tagline: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  baseLaborRate: Prisma.Decimal;
  overheadPct: Prisma.Decimal;
  targetMarginPct: Prisma.Decimal;
  smtpFromEmail: string | null;
  smtpFromName: string | null;
  differentiators: string[];
  certifications: string[];
}): CompanyRecord {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone ?? undefined,
    website: c.website ?? undefined,
    logoUrl: c.logoUrl ?? undefined,
    tagline: c.tagline ?? undefined,
    address: c.address ?? undefined,
    city: c.city ?? undefined,
    state: c.state ?? undefined,
    zip: c.zip ?? undefined,
    baseLaborRate: num(c.baseLaborRate),
    overheadPct: num(c.overheadPct),
    targetMarginPct: num(c.targetMarginPct),
    smtpFromEmail: c.smtpFromEmail ?? undefined,
    smtpFromName: c.smtpFromName ?? undefined,
    differentiators: c.differentiators,
    certifications: c.certifications,
  };
}

function toProspect(p: {
  id: string;
  companyId: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string | null;
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
  source: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): ProspectRecord {
  return {
    id: p.id,
    companyId: p.companyId,
    fullName: p.fullName,
    businessName: p.businessName,
    email: p.email,
    phone: p.phone ?? undefined,
    website: p.website ?? undefined,
    facilityType: p.facilityType,
    squareFootage: p.squareFootage,
    numFloors: p.numFloors,
    numRestrooms: p.numRestrooms,
    floorCarpetPct: p.floorCarpetPct,
    floorHardwoodPct: p.floorHardwoodPct,
    floorTilePct: p.floorTilePct,
    hasKitchen: p.hasKitchen,
    specialAreas: p.specialAreas,
    notes: p.notes ?? undefined,
    source: p.source ?? undefined,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function toProposal(p: {
  id: string;
  companyId: string;
  prospectId: string;
  proposalNumber: string;
  version: number;
  services: string[];
  visitFrequency: string;
  serviceTime: string | null;
  contractDuration: string;
  startDate: Date | null;
  monthlyPrice: Prisma.Decimal;
  annualPrice: Prisma.Decimal;
  discountPct: Prisma.Decimal;
  lineItems: Prisma.JsonValue;
  executiveSummary: string | null;
  scopeOfWork: Prisma.JsonValue;
  ourApproach: string[];
  differentiators: string[];
  pricingNarrative: string | null;
  terms: string | null;
  nextSteps: string | null;
  pdfUrl: string | null;
  trackingToken: string;
  status: string;
  validUntil: Date | null;
  sentAt: Date | null;
  wonAt: Date | null;
  lostAt: Date | null;
  lostReason: string | null;
  followUpCount: number;
  sequencePaused: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ProposalRecord {
  return {
    id: p.id,
    companyId: p.companyId,
    prospectId: p.prospectId,
    proposalNumber: p.proposalNumber,
    version: p.version,
    services: p.services,
    visitFrequency: p.visitFrequency,
    serviceTime: p.serviceTime ?? undefined,
    contractDuration: p.contractDuration,
    startDate: dateOnly(p.startDate),
    monthlyPrice: num(p.monthlyPrice),
    annualPrice: num(p.annualPrice),
    discountPct: num(p.discountPct),
    lineItems: p.lineItems as unknown as LineItem[],
    executiveSummary: p.executiveSummary ?? undefined,
    scopeOfWork: (p.scopeOfWork as unknown as Record<string, string[]>) ?? undefined,
    ourApproach: p.ourApproach,
    differentiators: p.differentiators,
    pricingNarrative: p.pricingNarrative ?? undefined,
    terms: p.terms ?? undefined,
    nextSteps: p.nextSteps ?? undefined,
    pdfUrl: p.pdfUrl ?? undefined,
    trackingToken: p.trackingToken,
    status: p.status,
    validUntil: dateOnly(p.validUntil),
    sentAt: iso(p.sentAt),
    wonAt: iso(p.wonAt),
    lostAt: iso(p.lostAt),
    lostReason: p.lostReason ?? undefined,
    followUpCount: p.followUpCount,
    sequencePaused: p.sequencePaused,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function toTrackingEvent(e: {
  id: string;
  proposalId: string;
  eventType: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceType: string | null;
  durationSeconds: number | null;
  metadata: Prisma.JsonValue;
  occurredAt: Date;
}): TrackingEventRecord {
  return {
    id: e.id,
    proposalId: e.proposalId,
    eventType: e.eventType,
    ipAddress: e.ipAddress ?? undefined,
    userAgent: e.userAgent ?? undefined,
    deviceType: e.deviceType ?? undefined,
    durationSeconds: e.durationSeconds ?? undefined,
    metadata: (e.metadata as Record<string, unknown>) ?? undefined,
    occurredAt: e.occurredAt.toISOString(),
  };
}

function toFollowUpLog(l: {
  id: string;
  proposalId: string;
  sequenceId: string | null;
  sequenceStep: number;
  triggerEvent: string;
  subject: string;
  bodyHtml: string;
  sentAt: Date;
  openedAt: Date | null;
  repliedAt: Date | null;
  resendEmailId: string | null;
}): FollowUpLogRecord {
  return {
    id: l.id,
    proposalId: l.proposalId,
    sequenceId: l.sequenceId ?? undefined,
    sequenceStep: l.sequenceStep,
    triggerEvent: l.triggerEvent,
    subject: l.subject,
    bodyHtml: l.bodyHtml,
    sentAt: l.sentAt.toISOString(),
    openedAt: iso(l.openedAt),
    repliedAt: iso(l.repliedAt),
    resendEmailId: l.resendEmailId ?? undefined,
  };
}

function toNotification(n: {
  id: string;
  companyId: string;
  proposalId: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}): NotificationRecord {
  return {
    id: n.id,
    companyId: n.companyId,
    proposalId: n.proposalId ?? undefined,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  };
}

async function notifyRepEmail(title: string, message: string) {
  const company = await getCompany();
  if (!company.email || !process.env.RESEND_API_KEY) return;
  try {
    await sendEmail({
      to: company.email,
      subject: `[CleanProposal] ${title}`,
      html: `<p>${message}</p><p><a href="${APP_URL}/dashboard">View Dashboard</a></p>`,
      from: company.smtpFromEmail,
      fromName: company.smtpFromName,
    });
  } catch (err) {
    console.warn("[rep-alert]", err);
  }
}

export async function getPricingConfig(): Promise<PricingConfig> {
  const company = await getCompany();
  return {
    baseLaborRate: company.baseLaborRate,
    overheadPct: company.overheadPct,
    targetMarginPct: company.targetMarginPct,
    supplyCostPerSqFt: 0.015,
    productivityRate: 2500,
  };
}

function resolveAdditionalDiscountPct(intake: IntakeFormValues): number {
  const manualDiscount = intake.customization.discountPct ?? 0;
  const promoDiscount = resolvePromoDiscount(intake.customization.promoCode);
  return Math.min(50, manualDiscount + promoDiscount);
}

export async function listProspects() {
  const prospects = await prisma.prospect.findMany({
    where: { companyId: COMPANY_ID },
    orderBy: { updatedAt: "desc" },
  });

  const proposals = await prisma.proposal.findMany({
    where: { companyId: COMPANY_ID },
  });

  return prospects.map((p) => {
    const related = proposals.filter((pr) => pr.prospectId === p.id);
    const latest = related.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    )[0];
    const record = toProspect(p);
    return {
      ...record,
      latestProposalStatus: latest?.status,
      monthlyValue: latest ? num(latest.monthlyPrice) : 0,
      proposalCount: related.length,
    };
  });
}

export async function getProspectById(id: string) {
  const prospect = await prisma.prospect.findFirst({
    where: { id, companyId: COMPANY_ID },
  });
  if (!prospect) return null;
  const proposals = await prisma.proposal.findMany({ where: { prospectId: id } });
  return {
    prospect: toProspect(prospect),
    proposals: proposals.map(toProposal),
  };
}

export async function createProspect(
  data: Omit<ProspectRecord, "id" | "companyId" | "createdAt" | "updatedAt" | "status">
) {
  const prospect = await prisma.prospect.create({
    data: {
      companyId: COMPANY_ID,
      fullName: data.fullName,
      businessName: data.businessName,
      email: data.email,
      phone: data.phone,
      website: data.website,
      facilityType: data.facilityType,
      squareFootage: data.squareFootage,
      numFloors: data.numFloors,
      numRestrooms: data.numRestrooms,
      floorCarpetPct: data.floorCarpetPct,
      floorHardwoodPct: data.floorHardwoodPct,
      floorTilePct: data.floorTilePct,
      hasKitchen: data.hasKitchen,
      specialAreas: data.specialAreas,
      notes: data.notes,
      source: data.source,
      status: "active",
    },
  });
  return toProspect(prospect);
}

export async function updateProspect(id: string, updates: Partial<ProspectRecord>) {
  try {
    const prospect = await prisma.prospect.update({
      where: { id },
      data: {
        fullName: updates.fullName,
        businessName: updates.businessName,
        email: updates.email,
        phone: updates.phone,
        website: updates.website,
        facilityType: updates.facilityType,
        squareFootage: updates.squareFootage,
        numFloors: updates.numFloors,
        numRestrooms: updates.numRestrooms,
        floorCarpetPct: updates.floorCarpetPct,
        floorHardwoodPct: updates.floorHardwoodPct,
        floorTilePct: updates.floorTilePct,
        hasKitchen: updates.hasKitchen,
        specialAreas: updates.specialAreas,
        notes: updates.notes,
        source: updates.source,
        status: updates.status,
      },
    });
    if (prospect.companyId !== COMPANY_ID) return null;
    return toProspect(prospect);
  } catch {
    return null;
  }
}

export async function resendProposal(id: string) {
  try {
    const current = await prisma.proposal.findFirst({ where: { id, companyId: COMPANY_ID } });
    if (!current) return null;
    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        version: current.version + 1,
        trackingToken: crypto.randomUUID(),
        status: "draft",
        sentAt: null,
        followUpCount: 0,
        sequencePaused: false,
      },
    });
    return toProposal(updated);
  } catch {
    return null;
  }
}

export async function markProposalReplied(id: string) {
  try {
    const updated = await prisma.proposal.update({
      where: { id },
      data: { sequencePaused: true },
    });
    if (updated.companyId !== COMPANY_ID) return null;
    return toProposal(updated);
  } catch {
    return null;
  }
}

export async function processExpiredProposals() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeStatuses = ["draft", "sent", "not_opened", "opened", "viewed_pricing", "hot_lead"];
  const expired = await prisma.proposal.findMany({
    where: {
      companyId: COMPANY_ID,
      validUntil: { lt: today },
      status: { in: activeStatuses },
    },
  });
  const ids: string[] = [];
  for (const p of expired) {
    await prisma.proposal.update({
      where: { id: p.id },
      data: { status: "expired", sequencePaused: true },
    });
    ids.push(p.id);
  }
  return ids;
}

export async function processNotOpenedProposals() {
  const now = Date.now();
  const sent = await prisma.proposal.findMany({
    where: { companyId: COMPANY_ID, status: "sent", sentAt: { not: null } },
    include: { trackingEvents: true },
  });
  const ids: string[] = [];
  for (const p of sent) {
    if (!p.sentAt) continue;
    const hoursSinceSent = (now - p.sentAt.getTime()) / 3600000;
    if (hoursSinceSent < 48) continue;
    const opened = p.trackingEvents.some((e) => e.eventType === "email_opened");
    if (opened) continue;
    await prisma.proposal.update({ where: { id: p.id }, data: { status: "not_opened" } });
    ids.push(p.id);
  }
  return ids;
}

export async function getFollowUpLogs(proposalId?: string) {
  const logs = await prisma.followUpLog.findMany({
    where: proposalId ? { proposalId } : undefined,
    orderBy: { sentAt: "desc" },
  });
  return logs.map(toFollowUpLog);
}

export async function createProposalFromExistingProspect(
  prospectId: string,
  intake: IntakeFormValues,
  content: ProposalContent,
  pricing: {
    monthlyPrice: number;
    annualPrice: number;
    lineItems: LineItem[];
    discountApplied: number;
  }
) {
  const existing = await prisma.prospect.findFirst({
    where: { id: prospectId, companyId: COMPANY_ID },
  });
  if (!existing) return null;

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 14);
  const fields = proposalToContentFields(content);

  const prospect = await prisma.prospect.update({
    where: { id: prospectId },
    data: {
      fullName: intake.client.fullName,
      businessName: intake.client.businessName,
      email: intake.client.email,
      phone: intake.client.phone,
      website: intake.client.website,
      facilityType: intake.facility.type,
      squareFootage: intake.facility.squareFootage,
      numFloors: intake.facility.numFloors,
      numRestrooms: intake.facility.numRestrooms,
      floorCarpetPct: intake.facility.floorCarpetPct,
      floorHardwoodPct: intake.facility.floorHardwoodPct,
      floorTilePct: intake.facility.floorTilePct,
      hasKitchen: intake.facility.hasKitchen,
      specialAreas: intake.facility.specialAreas,
      notes: intake.customization.notes,
      source: intake.customization.source,
    },
  });

  const proposal = await prisma.proposal.create({
    data: {
      companyId: COMPANY_ID,
      prospectId,
      proposalNumber: generateProposalNumber(),
      services: intake.services.types,
      visitFrequency: intake.services.visitFrequency,
      serviceTime: intake.services.serviceTime,
      contractDuration: intake.services.contractDuration,
      startDate: intake.services.startDate ? new Date(intake.services.startDate) : null,
      monthlyPrice: pricing.monthlyPrice,
      annualPrice: pricing.annualPrice,
      discountPct: pricing.discountApplied,
      lineItems: toJson(pricing.lineItems),
      ...fields,
      status: "draft",
      validUntil,
      followUpCount: 0,
      sequencePaused: false,
    },
  });

  return { proposal: toProposal(proposal), prospect: toProspect(prospect) };
}

export async function listProposals(filters?: { status?: string }) {
  const proposals = await prisma.proposal.findMany({
    where: {
      companyId: COMPANY_ID,
      ...(filters?.status ? { status: filters.status } : {}),
    },
    include: { prospect: true },
    orderBy: { updatedAt: "desc" },
  });

  return proposals
    .filter((p) => p.prospect)
    .map((p) => ({
      ...toProposal(p),
      prospect: toProspect(p.prospect),
    }));
}

export async function getProposalById(id: string) {
  const proposal = await prisma.proposal.findFirst({
    where: { id, companyId: COMPANY_ID },
    include: { prospect: true },
  });
  if (!proposal || !proposal.prospect) return null;
  const company = await prisma.company.findUnique({ where: { id: COMPANY_ID } });
  if (!company) return null;
  return {
    proposal: toProposal(proposal),
    prospect: toProspect(proposal.prospect),
    company: toCompany(company),
  };
}

export async function getProposalByToken(token: string) {
  const proposal = await prisma.proposal.findFirst({
    where: { trackingToken: token },
    include: { prospect: true },
  });
  if (!proposal || !proposal.prospect) return null;
  const company = await prisma.company.findUnique({ where: { id: proposal.companyId } });
  if (!company) return null;
  return {
    proposal: toProposal(proposal),
    prospect: toProspect(proposal.prospect),
    company: toCompany(company),
  };
}

export async function createProposalFromIntake(
  intake: IntakeFormValues,
  content: ProposalContent,
  pricing: {
    monthlyPrice: number;
    annualPrice: number;
    lineItems: LineItem[];
    discountApplied: number;
  }
) {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 14);
  const fields = proposalToContentFields(content);

  const prospect = await prisma.prospect.create({
    data: {
      companyId: COMPANY_ID,
      fullName: intake.client.fullName,
      businessName: intake.client.businessName,
      email: intake.client.email,
      phone: intake.client.phone,
      website: intake.client.website,
      facilityType: intake.facility.type,
      squareFootage: intake.facility.squareFootage,
      numFloors: intake.facility.numFloors,
      numRestrooms: intake.facility.numRestrooms,
      floorCarpetPct: intake.facility.floorCarpetPct,
      floorHardwoodPct: intake.facility.floorHardwoodPct,
      floorTilePct: intake.facility.floorTilePct,
      hasKitchen: intake.facility.hasKitchen,
      specialAreas: intake.facility.specialAreas,
      notes: intake.customization.notes,
      source: intake.customization.source,
      status: "active",
    },
  });

  const proposal = await prisma.proposal.create({
    data: {
      companyId: COMPANY_ID,
      prospectId: prospect.id,
      proposalNumber: generateProposalNumber(),
      services: intake.services.types,
      visitFrequency: intake.services.visitFrequency,
      serviceTime: intake.services.serviceTime,
      contractDuration: intake.services.contractDuration,
      startDate: intake.services.startDate ? new Date(intake.services.startDate) : null,
      monthlyPrice: pricing.monthlyPrice,
      annualPrice: pricing.annualPrice,
      discountPct: pricing.discountApplied,
      lineItems: toJson(pricing.lineItems),
      ...fields,
      status: "draft",
      validUntil,
      followUpCount: 0,
      sequencePaused: false,
    },
  });

  return { proposal: toProposal(proposal), prospect: toProspect(prospect) };
}

export async function updateProposal(
  id: string,
  updates: Partial<ProposalRecord> & { content?: Partial<ProposalContent> }
) {
  const { content, ...rest } = updates;
  const data: Prisma.ProposalUpdateInput = {
    monthlyPrice: rest.monthlyPrice,
    annualPrice: rest.annualPrice,
    discountPct: rest.discountPct,
    status: rest.status,
    pdfUrl: rest.pdfUrl,
    sentAt: rest.sentAt ? new Date(rest.sentAt) : undefined,
    wonAt: rest.wonAt ? new Date(rest.wonAt) : undefined,
    lostAt: rest.lostAt ? new Date(rest.lostAt) : undefined,
    lostReason: rest.lostReason,
    followUpCount: rest.followUpCount,
    sequencePaused: rest.sequencePaused,
    lineItems: rest.lineItems ? toJson(rest.lineItems) : undefined,
    ...(content ? proposalToContentFields(content) : {}),
  };

  try {
    const updated = await prisma.proposal.update({ where: { id }, data });
    if (updated.companyId !== COMPANY_ID) return null;
    return toProposal(updated);
  } catch {
    return null;
  }
}

export async function markProposalStatus(
  id: string,
  status: string,
  extra?: { lostReason?: string }
) {
  const now = new Date();
  const updated = await prisma.proposal.update({
    where: { id },
    data: {
      status,
      sequencePaused: status === "won" || status === "lost",
      wonAt: status === "won" ? now : undefined,
      lostAt: status === "lost" ? now : undefined,
      lostReason: extra?.lostReason,
    },
  });

  if (status === "won") {
    await prisma.notification.create({
      data: {
        companyId: COMPANY_ID,
        proposalId: id,
        type: "won",
        title: "Deal Won!",
        message: `Proposal ${updated.proposalNumber} marked as WON`,
      },
    });
  }

  return toProposal(updated);
}

export async function recordTrackingEvent(
  proposalId: string,
  eventType: string,
  meta?: Partial<TrackingEventRecord>
) {
  const proposal = await prisma.proposal.findFirst({
    where: { id: proposalId },
    include: { prospect: true },
  });
  if (!proposal) return null;

  const event = await prisma.proposalTrackingEvent.create({
    data: {
      proposalId,
      eventType,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      deviceType: meta?.deviceType,
      durationSeconds: meta?.durationSeconds,
      metadata: meta?.metadata ? toJson(meta.metadata) : undefined,
    },
  });

  const prospect = proposal.prospect;

  if (eventType === "email_opened" && ["sent", "not_opened"].includes(proposal.status)) {
    await prisma.proposal.update({ where: { id: proposalId }, data: { status: "opened" } });
    const msg = `${prospect?.businessName ?? "Prospect"} opened your proposal email`;
    await prisma.notification.create({
      data: {
        companyId: proposal.companyId,
        proposalId,
        type: "email_opened",
        title: "Proposal Opened",
        message: msg,
      },
    });
    void notifyRepEmail("Proposal Opened", msg);
  }

  if (eventType === "proposal_viewed") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const viewsToday = await prisma.proposalTrackingEvent.count({
      where: {
        proposalId,
        eventType: "proposal_viewed",
        occurredAt: { gte: today },
      },
    });

    let newStatus = proposal.status;
    if (viewsToday >= 3) newStatus = "hot_lead";
    else if (["sent", "opened", "not_opened"].includes(proposal.status)) newStatus = "opened";

    await prisma.proposal.update({ where: { id: proposalId }, data: { status: newStatus } });

    if (viewsToday >= 3) {
      const msg = `${prospect?.businessName ?? "Prospect"} viewed proposal ${viewsToday}× today`;
      await prisma.notification.create({
        data: {
          companyId: proposal.companyId,
          proposalId,
          type: "hot_lead",
          title: "Hot Lead Alert",
          message: msg,
        },
      });
      void notifyRepEmail("Hot Lead Alert", msg);
    }
  }

  if (eventType === "pricing_viewed" && proposal.status !== "hot_lead") {
    await prisma.proposal.update({ where: { id: proposalId }, data: { status: "viewed_pricing" } });
  }

  return toTrackingEvent(event);
}

export async function getTrackingEvents(proposalId?: string) {
  const events = await prisma.proposalTrackingEvent.findMany({
    where: proposalId ? { proposalId } : undefined,
    orderBy: { occurredAt: "desc" },
  });
  return events.map(toTrackingEvent);
}

export async function getNotifications(unreadOnly = false) {
  const notifications = await prisma.notification.findMany({
    where: {
      companyId: COMPANY_ID,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return notifications.map(toNotification);
}

export async function markNotificationsRead(ids?: string[]) {
  await prisma.notification.updateMany({
    where: {
      companyId: COMPANY_ID,
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
    data: { read: true },
  });
}

export async function getPipelineAnalytics() {
  const proposals = await listProposals();
  const activeStatuses = ["draft", "sent", "not_opened", "opened", "viewed_pricing", "hot_lead"];

  const columnDefs = [
    { status: "draft", label: "Draft", match: (s: string) => s === "draft" },
    { status: "sent", label: "Sent", match: (s: string) => s === "sent" || s === "not_opened" },
    { status: "opened", label: "Opened", match: (s: string) => s === "opened" || s === "viewed_pricing" },
    { status: "hot_lead", label: "Hot", match: (s: string) => s === "hot_lead" },
    { status: "won", label: "Won", match: (s: string) => s === "won" },
    { status: "lost", label: "Lost", match: (s: string) => s === "lost" || s === "expired" },
  ];

  const columns = columnDefs.map(({ status, label, match }) => {
    const items = proposals.filter((p) => match(p.status));
    return {
      status,
      label,
      count: items.length,
      value: items.reduce((sum, p) => sum + p.monthlyPrice, 0),
    };
  });

  const sent = proposals.filter((p) => p.sentAt);
  const opened = sent.filter((p) =>
    ["opened", "viewed_pricing", "hot_lead", "won"].includes(p.status)
  );
  const won = proposals.filter((p) => p.status === "won");
  const active = proposals.filter((p) => activeStatuses.includes(p.status));

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sentThisMonth = sent.filter((p) => p.sentAt && new Date(p.sentAt) >= monthStart);
  const wonThisMonth = won.filter((p) => p.wonAt && new Date(p.wonAt) >= monthStart);

  const closedWithDates = won.filter((p) => p.sentAt && p.wonAt);
  const avgDaysToClose = closedWithDates.length
    ? Math.round(
        closedWithDates.reduce((sum, p) => {
          const days =
            (new Date(p.wonAt!).getTime() - new Date(p.sentAt!).getTime()) / 86400000;
          return sum + days;
        }, 0) / closedWithDates.length
      )
    : 0;

  return {
    pipeline: columns,
    stats: {
      proposalsSent: sentThisMonth.length,
      openRate: sent.length ? Math.round((opened.length / sent.length) * 100) : 0,
      conversionRate: sent.length ? Math.round((won.length / sent.length) * 100) : 0,
      revenueWon: wonThisMonth.reduce((s, p) => s + p.monthlyPrice, 0),
      pipelineValue: active.reduce((s, p) => s + p.monthlyPrice * 12, 0),
      avgProposalValue: proposals.length
        ? Math.round(proposals.reduce((s, p) => s + p.monthlyPrice, 0) / proposals.length)
        : 0,
      avgDaysToClose,
    },
    activity: await buildActivityFeed(),
    proposals: proposals.map((p) => ({
      id: p.id,
      proposalNumber: p.proposalNumber,
      companyName: p.prospect.businessName,
      contactName: p.prospect.fullName,
      monthlyPrice: p.monthlyPrice,
      annualPrice: p.annualPrice,
      status: p.status,
      sentAt: p.sentAt,
      lastActivity: p.updatedAt,
      followUpCount: p.followUpCount,
      version: p.version,
    })),
  };
}

export async function getMonthlyAnalytics(months = 6) {
  const proposals = await listProposals();
  const results = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const sentInMonth = proposals.filter(
      (p) => p.sentAt && new Date(p.sentAt) >= monthStart && new Date(p.sentAt) <= monthEnd
    );
    const wonInMonth = proposals.filter(
      (p) => p.wonAt && new Date(p.wonAt) >= monthStart && new Date(p.wonAt) <= monthEnd
    );
    const openedInMonth = sentInMonth.filter((p) =>
      ["opened", "viewed_pricing", "hot_lead", "won"].includes(p.status)
    );

    results.push({
      month: monthStart.toLocaleString("default", { month: "short", year: "numeric" }),
      proposalsSent: sentInMonth.length,
      proposalsWon: wonInMonth.length,
      revenueWon: wonInMonth.reduce((s, p) => s + p.monthlyPrice, 0),
      openRate: sentInMonth.length
        ? Math.round((openedInMonth.length / sentInMonth.length) * 100)
        : 0,
      conversionRate: sentInMonth.length
        ? Math.round((wonInMonth.length / sentInMonth.length) * 100)
        : 0,
    });
  }

  return results;
}

async function buildActivityFeed() {
  const notifications = await getNotifications();
  const proposals = await listProposals();
  const events: {
    id: string;
    type: string;
    message: string;
    companyName: string;
    occurredAt: string;
    proposalId?: string;
  }[] = [];

  for (const n of notifications.slice(0, 10)) {
    const proposal = proposals.find((p) => p.id === n.proposalId);
    events.push({
      id: n.id,
      type: n.type,
      message: n.message.replace(`${proposal?.prospect.businessName ?? ""} `, "").trim() || n.title,
      companyName: proposal?.prospect.businessName ?? "Unknown",
      occurredAt: n.createdAt,
      proposalId: n.proposalId,
    });
  }

  return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()).slice(0, 8);
}

export async function getCompany(): Promise<CompanyRecord> {
  const company = await prisma.company.findUnique({ where: { id: COMPANY_ID } });
  if (!company) {
    throw new Error(
      "Company not found — import database/schema.sql in Supabase SQL Editor or run: npm run db:setup"
    );
  }
  return toCompany(company);
}

export async function updateCompany(updates: Partial<CompanyRecord>) {
  const company = await prisma.company.update({
    where: { id: COMPANY_ID },
    data: {
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      website: updates.website,
      logoUrl: updates.logoUrl,
      tagline: updates.tagline,
      address: updates.address,
      city: updates.city,
      state: updates.state,
      zip: updates.zip,
      baseLaborRate: updates.baseLaborRate,
      overheadPct: updates.overheadPct,
      targetMarginPct: updates.targetMarginPct,
      smtpFromEmail: updates.smtpFromEmail,
      smtpFromName: updates.smtpFromName,
      differentiators: updates.differentiators,
      certifications: updates.certifications,
    },
  });
  return toCompany(company);
}

export async function getFollowUpSequences(): Promise<FollowUpSequenceRecord[]> {
  const sequences = await prisma.followUpSequence.findMany({
    where: { companyId: COMPANY_ID },
    orderBy: { sequenceOrder: "asc" },
  });
  return sequences.map((s) => ({
    id: s.id,
    companyId: s.companyId,
    name: s.name,
    triggerEvent: s.triggerEvent,
    delayHours: s.delayHours,
    sequenceOrder: s.sequenceOrder,
    subjectPrompt: s.subjectPrompt,
    bodyPrompt: s.bodyPrompt,
    isActive: s.isActive,
  }));
}

export async function updateFollowUpSequence(
  id: string,
  updates: Partial<{ delayHours: number; subjectPrompt: string; bodyPrompt: string; isActive: boolean }>
) {
  try {
    const sequence = await prisma.followUpSequence.update({
      where: { id },
      data: updates,
    });
    if (sequence.companyId !== COMPANY_ID) return null;
    return {
      id: sequence.id,
      companyId: sequence.companyId,
      name: sequence.name,
      triggerEvent: sequence.triggerEvent,
      delayHours: sequence.delayHours,
      sequenceOrder: sequence.sequenceOrder,
      subjectPrompt: sequence.subjectPrompt,
      bodyPrompt: sequence.bodyPrompt,
      isActive: sequence.isActive,
    };
  } catch {
    return null;
  }
}

export async function pricingFromIntake(intake: IntakeFormValues) {
  const config = await getPricingConfig();
  return calculatePricing(
    {
      facilityType: intake.facility.type as FacilityType,
      squareFootage: intake.facility.squareFootage,
      numRestrooms: intake.facility.numRestrooms,
      floorCarpetPct: intake.facility.floorCarpetPct,
      floorHardwoodPct: intake.facility.floorHardwoodPct,
      floorTilePct: intake.facility.floorTilePct,
      hasKitchen: intake.facility.hasKitchen,
      specialAreas: intake.facility.specialAreas,
      serviceTypes: intake.services.types as ServiceType[],
      visitFrequency: intake.services.visitFrequency as VisitFrequency,
      contractDuration: intake.services.contractDuration as ContractDuration,
      discountPct: resolveAdditionalDiscountPct(intake),
    },
    config
  );
}

/** DB-backed helpers for follow-up engine */
export async function getStoreSnapshotForFollowUp() {
  const [company, sequences, rawEvents, followUpLogs] = await Promise.all([
    getCompany(),
    getFollowUpSequences(),
    prisma.proposalTrackingEvent.findMany(),
    getFollowUpLogs(),
  ]);
  const trackingEvents = rawEvents.map(toTrackingEvent);
  return { company, followUpSequences: sequences, trackingEvents, followUpLogs };
}

export async function appendFollowUpLog(data: {
  proposalId: string;
  sequenceId: string;
  sequenceStep: number;
  triggerEvent: string;
  subject: string;
  bodyHtml: string;
  resendEmailId?: string;
}) {
  await prisma.followUpLog.create({
    data: {
      proposalId: data.proposalId,
      sequenceId: data.sequenceId,
      sequenceStep: data.sequenceStep,
      triggerEvent: data.triggerEvent,
      subject: data.subject,
      bodyHtml: data.bodyHtml,
      resendEmailId: data.resendEmailId,
    },
  });
  await prisma.proposal.update({
    where: { id: data.proposalId },
    data: { followUpCount: { increment: 1 } },
  });
}

export async function createFollowUpNotification(proposalId: string, companyId: string, title: string, message: string) {
  await prisma.notification.create({
    data: { companyId, proposalId, type: "follow_up", title, message },
  });
}

export async function markProposalSent(proposalId: string) {
  await prisma.proposal.update({
    where: { id: proposalId },
    data: { status: "sent", sentAt: new Date() },
  });
}
