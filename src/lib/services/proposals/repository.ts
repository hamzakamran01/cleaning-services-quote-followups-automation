import { getStore, mutateStore } from "@/lib/store";
import type {
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

const COMPANY_ID = "demo-company-id";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function ts() {
  return new Date().toISOString();
}

export function getPricingConfig(): PricingConfig {
  const company = getStore().company;
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

async function notifyRepEmail(title: string, message: string) {
  const company = getStore().company;
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

export function listProspects() {
  const store = getStore();
  return store.prospects
    .filter((p) => p.companyId === COMPANY_ID)
    .map((p) => {
      const proposals = store.proposals.filter((pr) => pr.prospectId === p.id);
      const latest = proposals.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      return {
        ...p,
        latestProposalStatus: latest?.status,
        monthlyValue: latest?.monthlyPrice ?? 0,
        proposalCount: proposals.length,
      };
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getProspectById(id: string) {
  const store = getStore();
  const prospect = store.prospects.find((p) => p.id === id && p.companyId === COMPANY_ID);
  if (!prospect) return null;
  const proposals = store.proposals.filter((p) => p.prospectId === id);
  return { prospect, proposals };
}

export function createProspect(data: Omit<ProspectRecord, "id" | "companyId" | "createdAt" | "updatedAt" | "status">) {
  return mutateStore(({ prospects }) => {
    const now = ts();
    const prospect: ProspectRecord = {
      id: crypto.randomUUID(),
      companyId: COMPANY_ID,
      status: "active",
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    prospects.push(prospect);
    return prospect;
  });
}

export function updateProspect(id: string, updates: Partial<ProspectRecord>) {
  return mutateStore(({ prospects }) => {
    const idx = prospects.findIndex((p) => p.id === id && p.companyId === COMPANY_ID);
    if (idx === -1) return null;
    prospects[idx] = { ...prospects[idx], ...updates, updatedAt: ts() };
    return prospects[idx];
  });
}

export function resendProposal(id: string) {
  return mutateStore(({ proposals }) => {
    const idx = proposals.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const current = proposals[idx];
    proposals[idx] = {
      ...current,
      version: current.version + 1,
      trackingToken: crypto.randomUUID(),
      status: "draft",
      sentAt: undefined,
      followUpCount: 0,
      sequencePaused: false,
      updatedAt: ts(),
    };
    return proposals[idx];
  });
}

export function markProposalReplied(id: string) {
  return mutateStore(({ proposals }) => {
    const idx = proposals.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    proposals[idx] = {
      ...proposals[idx],
      sequencePaused: true,
      updatedAt: ts(),
    };
    return proposals[idx];
  });
}

export function processExpiredProposals() {
  const today = new Date().toISOString().split("T")[0];
  return mutateStore(({ proposals }) => {
    const updated: string[] = [];
    for (let i = 0; i < proposals.length; i++) {
      const p = proposals[i];
      if (!p.validUntil || p.status === "won" || p.status === "lost" || p.status === "expired") {
        continue;
      }
      if (p.validUntil < today && ["draft", "sent", "not_opened", "opened", "viewed_pricing", "hot_lead"].includes(p.status)) {
        proposals[i] = { ...p, status: "expired", sequencePaused: true, updatedAt: ts() };
        updated.push(p.id);
      }
    }
    return updated;
  });
}

export function processNotOpenedProposals() {
  const now = Date.now();
  return mutateStore(({ proposals, trackingEvents }) => {
    const updated: string[] = [];
    for (let i = 0; i < proposals.length; i++) {
      const p = proposals[i];
      if (p.status !== "sent" || !p.sentAt) continue;
      const hoursSinceSent = (now - new Date(p.sentAt).getTime()) / 3600000;
      if (hoursSinceSent < 48) continue;
      const opened = trackingEvents.some(
        (e) => e.proposalId === p.id && e.eventType === "email_opened"
      );
      if (opened) continue;
      proposals[i] = { ...p, status: "not_opened", updatedAt: ts() };
      updated.push(p.id);
    }
    return updated;
  });
}

export function getFollowUpLogs(proposalId?: string) {
  const store = getStore();
  let logs = store.followUpLogs;
  if (proposalId) logs = logs.filter((l) => l.proposalId === proposalId);
  return logs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

export function createProposalFromExistingProspect(
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
  return mutateStore(({ prospects, proposals }) => {
    const prospectIdx = prospects.findIndex((p) => p.id === prospectId && p.companyId === COMPANY_ID);
    if (prospectIdx === -1) return null;

    const now = ts();
    const proposalId = crypto.randomUUID();
    const trackingToken = crypto.randomUUID();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 14);

    prospects[prospectIdx] = {
      ...prospects[prospectIdx],
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
      updatedAt: now,
    };

    const fields = proposalToContentFields(content);
    const proposal: ProposalRecord = {
      id: proposalId,
      companyId: COMPANY_ID,
      prospectId,
      proposalNumber: generateProposalNumber(),
      version: 1,
      services: intake.services.types,
      visitFrequency: intake.services.visitFrequency,
      serviceTime: intake.services.serviceTime,
      contractDuration: intake.services.contractDuration,
      startDate: intake.services.startDate,
      monthlyPrice: pricing.monthlyPrice,
      annualPrice: pricing.annualPrice,
      discountPct: pricing.discountApplied,
      lineItems: pricing.lineItems,
      ...fields,
      trackingToken,
      status: "draft",
      validUntil: validUntil.toISOString().split("T")[0],
      followUpCount: 0,
      sequencePaused: false,
      createdAt: now,
      updatedAt: now,
    };

    proposals.push(proposal);
    return { proposal, prospect: prospects[prospectIdx] };
  });
}

export function listProposals(filters?: { status?: string }): (ProposalRecord & { prospect: ProspectRecord })[] {
  const store = getStore();
  let proposals = store.proposals.filter((p) => p.companyId === COMPANY_ID);

  if (filters?.status) {
    proposals = proposals.filter((p) => p.status === filters.status);
  }

  return proposals
    .map((p) => ({
      ...p,
      prospect: store.prospects.find((pr) => pr.id === p.prospectId)!,
    }))
    .filter((p) => p.prospect)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getProposalById(id: string) {
  const store = getStore();
  const proposal = store.proposals.find((p) => p.id === id);
  if (!proposal) return null;
  const prospect = store.prospects.find((p) => p.id === proposal.prospectId);
  if (!prospect) return null;
  return { proposal, prospect, company: store.company };
}

export function getProposalByToken(token: string) {
  const store = getStore();
  const proposal = store.proposals.find((p) => p.trackingToken === token);
  if (!proposal) return null;
  const prospect = store.prospects.find((p) => p.id === proposal.prospectId);
  if (!prospect) return null;
  return { proposal, prospect, company: store.company };
}

export function createProposalFromIntake(
  intake: IntakeFormValues,
  content: ProposalContent,
  pricing: {
    monthlyPrice: number;
    annualPrice: number;
    lineItems: LineItem[];
    discountApplied: number;
  }
) {
  return mutateStore(({ prospects, proposals }) => {
    const now = ts();
    const prospectId = crypto.randomUUID();
    const proposalId = crypto.randomUUID();
    const trackingToken = crypto.randomUUID();

    const prospect: ProspectRecord = {
      id: prospectId,
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
      createdAt: now,
      updatedAt: now,
    };

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 14);

    const fields = proposalToContentFields(content);

    const proposal: ProposalRecord = {
      id: proposalId,
      companyId: COMPANY_ID,
      prospectId,
      proposalNumber: generateProposalNumber(),
      version: 1,
      services: intake.services.types,
      visitFrequency: intake.services.visitFrequency,
      serviceTime: intake.services.serviceTime,
      contractDuration: intake.services.contractDuration,
      startDate: intake.services.startDate,
      monthlyPrice: pricing.monthlyPrice,
      annualPrice: pricing.annualPrice,
      discountPct: pricing.discountApplied,
      lineItems: pricing.lineItems,
      ...fields,
      trackingToken,
      status: "draft",
      validUntil: validUntil.toISOString().split("T")[0],
      followUpCount: 0,
      sequencePaused: false,
      createdAt: now,
      updatedAt: now,
    };

    prospects.push(prospect);
    proposals.push(proposal);

    return { proposal, prospect };
  });
}

export function updateProposal(id: string, updates: Partial<ProposalRecord> & { content?: Partial<ProposalContent> }) {
  return mutateStore(({ proposals }) => {
    const idx = proposals.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const { content, ...rest } = updates;
    const current = proposals[idx];

    proposals[idx] = {
      ...current,
      ...rest,
      ...(content ? proposalToContentFields(content) : {}),
      updatedAt: ts(),
    };

    return proposals[idx];
  });
}

export function markProposalStatus(id: string, status: string, extra?: { lostReason?: string }) {
  return mutateStore(({ proposals, notifications }) => {
    const idx = proposals.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const now = ts();
    proposals[idx] = {
      ...proposals[idx],
      status,
      sequencePaused: status === "won" || status === "lost",
      wonAt: status === "won" ? now : proposals[idx].wonAt,
      lostAt: status === "lost" ? now : proposals[idx].lostAt,
      lostReason: extra?.lostReason ?? proposals[idx].lostReason,
      updatedAt: now,
    };

    if (status === "won") {
      notifications.push({
        id: crypto.randomUUID(),
        companyId: COMPANY_ID,
        proposalId: id,
        type: "won",
        title: "Deal Won!",
        message: `Proposal ${proposals[idx].proposalNumber} marked as WON`,
        read: false,
        createdAt: now,
      });
    }

    return proposals[idx];
  });
}

export function recordTrackingEvent(
  proposalId: string,
  eventType: string,
  meta?: Partial<TrackingEventRecord>
) {
  return mutateStore(({ trackingEvents, proposals, notifications }) => {
    const idx = proposals.findIndex((p) => p.id === proposalId);
    if (idx === -1) return null;

    const event: TrackingEventRecord = {
      id: crypto.randomUUID(),
      proposalId,
      eventType,
      occurredAt: ts(),
      ...meta,
    };
    trackingEvents.push(event);

    const proposal = proposals[idx];
    const store = getStore();
    const prospect = store.prospects.find((p) => p.id === proposal.prospectId);

    if (eventType === "email_opened" && ["sent", "not_opened"].includes(proposal.status)) {
      proposals[idx] = { ...proposal, status: "opened", updatedAt: ts() };
      const msg = `${prospect?.businessName ?? "Prospect"} opened your proposal email`;
      notifications.push({
        id: crypto.randomUUID(),
        companyId: COMPANY_ID,
        proposalId,
        type: "email_opened",
        title: "Proposal Opened",
        message: msg,
        read: false,
        createdAt: ts(),
      });
      void notifyRepEmail("Proposal Opened", msg);
    }

    if (eventType === "proposal_viewed") {
      const viewsToday = trackingEvents.filter(
        (e) =>
          e.proposalId === proposalId &&
          e.eventType === "proposal_viewed" &&
          new Date(e.occurredAt).toDateString() === new Date().toDateString()
      ).length;

      let newStatus = proposals[idx].status;
      if (viewsToday >= 3) newStatus = "hot_lead";
      else if (["sent", "opened", "not_opened"].includes(proposals[idx].status)) newStatus = "opened";

      proposals[idx] = { ...proposals[idx], status: newStatus, updatedAt: ts() };

      if (viewsToday >= 3) {
        const msg = `${prospect?.businessName ?? "Prospect"} viewed proposal ${viewsToday}× today`;
        notifications.push({
          id: crypto.randomUUID(),
          companyId: COMPANY_ID,
          proposalId,
          type: "hot_lead",
          title: "Hot Lead Alert",
          message: msg,
          read: false,
          createdAt: ts(),
        });
        void notifyRepEmail("Hot Lead Alert", msg);
      }
    }

    if (eventType === "pricing_viewed" && proposals[idx].status !== "hot_lead") {
      proposals[idx] = { ...proposals[idx], status: "viewed_pricing", updatedAt: ts() };
    }

    return event;
  });
}

export function getTrackingEvents(proposalId?: string) {
  const store = getStore();
  let events = store.trackingEvents;
  if (proposalId) events = events.filter((e) => e.proposalId === proposalId);
  return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

export function getNotifications(unreadOnly = false): NotificationRecord[] {
  const store = getStore();
  let items = store.notifications.filter((n) => n.companyId === COMPANY_ID);
  if (unreadOnly) items = items.filter((n) => !n.read);
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function markNotificationsRead(ids?: string[]) {
  return mutateStore(({ notifications }) => {
    for (const n of notifications) {
      if (!ids || ids.includes(n.id)) n.read = true;
    }
  });
}

export function getPipelineAnalytics() {
  const proposals = listProposals();
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
    activity: buildActivityFeed(),
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

export function getMonthlyAnalytics(months = 6) {
  const proposals = listProposals();
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

function buildActivityFeed() {
  const store = getStore();
  const events: { id: string; type: string; message: string; companyName: string; occurredAt: string; proposalId?: string }[] = [];

  for (const n of store.notifications.slice(0, 10)) {
    const proposal = store.proposals.find((p) => p.id === n.proposalId);
    const prospect = proposal ? store.prospects.find((p) => p.id === proposal.prospectId) : null;
    events.push({
      id: n.id,
      type: n.type,
      message: n.message.replace(`${prospect?.businessName ?? ""} `, "").trim() || n.title,
      companyName: prospect?.businessName ?? "Unknown",
      occurredAt: n.createdAt,
      proposalId: n.proposalId,
    });
  }

  return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()).slice(0, 8);
}

export function getCompany() {
  return getStore().company;
}

export function updateCompany(updates: Partial<ReturnType<typeof getCompany>>) {
  return mutateStore(({ company }) => {
    Object.assign(company, updates);
    return company;
  });
}

export function getFollowUpSequences() {
  return getStore().followUpSequences;
}

export function updateFollowUpSequence(id: string, updates: Partial<{ delayHours: number; subjectPrompt: string; bodyPrompt: string; isActive: boolean }>) {
  return mutateStore(({ followUpSequences }) => {
    const idx = followUpSequences.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    followUpSequences[idx] = { ...followUpSequences[idx], ...updates };
    return followUpSequences[idx];
  });
}

export function pricingFromIntake(intake: IntakeFormValues) {
  const config = getPricingConfig();
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
