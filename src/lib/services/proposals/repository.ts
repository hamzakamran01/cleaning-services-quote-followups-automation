import { isDatabaseConfigured } from "@/lib/db";
import type {
  NotificationRecord,
  ProposalRecord,
  ProspectRecord,
  TrackingEventRecord,
} from "@/lib/store/types";
import type { IntakeFormValues } from "@/lib/validations/intake";
import type { LineItem, ProposalContent } from "@/lib/types/proposal";
import * as jsonRepo from "./json-repository";
import * as prismaRepo from "./prisma-repository";
import { withDbFallback } from "./repository-utils";

const useDb = isDatabaseConfigured();

function db<T>(dbFn: () => Promise<T>, jsonFn: () => T | Promise<T>): Promise<T> {
  if (!useDb) return Promise.resolve(jsonFn());
  return withDbFallback(dbFn, jsonFn);
}

export async function getPricingConfig() {
  return db(() => prismaRepo.getPricingConfig(), () => jsonRepo.getPricingConfig());
}

export async function listProspects() {
  return db(() => prismaRepo.listProspects(), () => jsonRepo.listProspects());
}

export async function getProspectById(id: string) {
  return db(() => prismaRepo.getProspectById(id), () => jsonRepo.getProspectById(id));
}

export async function createProspect(
  data: Omit<ProspectRecord, "id" | "companyId" | "createdAt" | "updatedAt" | "status">
) {
  return db(() => prismaRepo.createProspect(data), () => jsonRepo.createProspect(data));
}

export async function updateProspect(id: string, updates: Partial<ProspectRecord>) {
  return db(() => prismaRepo.updateProspect(id, updates), () => jsonRepo.updateProspect(id, updates));
}

export async function resendProposal(id: string) {
  return db(() => prismaRepo.resendProposal(id), () => jsonRepo.resendProposal(id));
}

export async function markProposalReplied(id: string) {
  return db(() => prismaRepo.markProposalReplied(id), () => jsonRepo.markProposalReplied(id));
}

export async function processExpiredProposals() {
  return db(() => prismaRepo.processExpiredProposals(), () => jsonRepo.processExpiredProposals());
}

export async function processNotOpenedProposals() {
  return db(() => prismaRepo.processNotOpenedProposals(), () => jsonRepo.processNotOpenedProposals());
}

export async function getFollowUpLogs(proposalId?: string) {
  return db(() => prismaRepo.getFollowUpLogs(proposalId), () => jsonRepo.getFollowUpLogs(proposalId));
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
  return db(
    () => prismaRepo.createProposalFromExistingProspect(prospectId, intake, content, pricing),
    () => jsonRepo.createProposalFromExistingProspect(prospectId, intake, content, pricing)
  );
}

export async function listProposals(filters?: { status?: string }) {
  return db(() => prismaRepo.listProposals(filters), () => jsonRepo.listProposals(filters));
}

export async function getProposalById(id: string) {
  return db(() => prismaRepo.getProposalById(id), () => jsonRepo.getProposalById(id));
}

export async function getProposalByToken(token: string) {
  return db(() => prismaRepo.getProposalByToken(token), () => jsonRepo.getProposalByToken(token));
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
  return db(
    () => prismaRepo.createProposalFromIntake(intake, content, pricing),
    () => jsonRepo.createProposalFromIntake(intake, content, pricing)
  );
}

export async function updateProposal(
  id: string,
  updates: Partial<ProposalRecord> & { content?: Partial<ProposalContent> }
) {
  return db(() => prismaRepo.updateProposal(id, updates), () => jsonRepo.updateProposal(id, updates));
}

export async function markProposalStatus(
  id: string,
  status: string,
  extra?: { lostReason?: string }
) {
  return db(
    () => prismaRepo.markProposalStatus(id, status, extra),
    () => jsonRepo.markProposalStatus(id, status, extra)
  );
}

export async function recordTrackingEvent(
  proposalId: string,
  eventType: string,
  meta?: Partial<TrackingEventRecord>
) {
  return db(
    () => prismaRepo.recordTrackingEvent(proposalId, eventType, meta),
    () => jsonRepo.recordTrackingEvent(proposalId, eventType, meta)
  );
}

export async function getTrackingEvents(proposalId?: string) {
  return db(() => prismaRepo.getTrackingEvents(proposalId), () => jsonRepo.getTrackingEvents(proposalId));
}

export async function getNotifications(unreadOnly = false): Promise<NotificationRecord[]> {
  return db(() => prismaRepo.getNotifications(unreadOnly), () => jsonRepo.getNotifications(unreadOnly));
}

export async function markNotificationsRead(ids?: string[]) {
  return db(() => prismaRepo.markNotificationsRead(ids), () => jsonRepo.markNotificationsRead(ids));
}

export async function getPipelineAnalytics() {
  return db(() => prismaRepo.getPipelineAnalytics(), () => jsonRepo.getPipelineAnalytics());
}

export async function getMonthlyAnalytics(months = 6) {
  return db(() => prismaRepo.getMonthlyAnalytics(months), () => jsonRepo.getMonthlyAnalytics(months));
}

export async function getCompany() {
  return db(() => prismaRepo.getCompany(), () => jsonRepo.getCompany());
}

export async function updateCompany(updates: Partial<Awaited<ReturnType<typeof getCompany>>>) {
  return db(() => prismaRepo.updateCompany(updates), () => jsonRepo.updateCompany(updates));
}

export async function getFollowUpSequences() {
  return db(() => prismaRepo.getFollowUpSequences(), () => jsonRepo.getFollowUpSequences());
}

export async function updateFollowUpSequence(
  id: string,
  updates: Partial<{ delayHours: number; subjectPrompt: string; bodyPrompt: string; isActive: boolean }>
) {
  return db(
    () => prismaRepo.updateFollowUpSequence(id, updates),
    () => jsonRepo.updateFollowUpSequence(id, updates)
  );
}

export async function pricingFromIntake(intake: IntakeFormValues) {
  return db(() => prismaRepo.pricingFromIntake(intake), () => jsonRepo.pricingFromIntake(intake));
}

export async function getStoreSnapshotForFollowUp() {
  return db(
    () => prismaRepo.getStoreSnapshotForFollowUp(),
    () => Promise.resolve(jsonRepo.getStoreSnapshotForFollowUp())
  );
}

export async function appendFollowUpLog(data: Parameters<typeof prismaRepo.appendFollowUpLog>[0]) {
  return db(() => prismaRepo.appendFollowUpLog(data), () => jsonRepo.appendFollowUpLog(data));
}

export async function createFollowUpNotification(
  proposalId: string,
  companyId: string,
  title: string,
  message: string
) {
  return db(
    () => prismaRepo.createFollowUpNotification(proposalId, companyId, title, message),
    () => jsonRepo.createFollowUpNotification(proposalId, companyId, title, message)
  );
}

export async function markProposalSent(proposalId: string) {
  return db(() => prismaRepo.markProposalSent(proposalId), () => jsonRepo.markProposalSent(proposalId));
}
