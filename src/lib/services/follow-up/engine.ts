import { generateFollowUpEmail } from "@/lib/services/ai/claude";
import { sendEmail } from "@/lib/services/email/resend";
import {
  listProposals,
  getStoreSnapshotForFollowUp,
  appendFollowUpLog,
  createFollowUpNotification,
  markProposalSent,
  getProposalById,
} from "@/lib/services/proposals/repository";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getFirstEventTime(events: { eventType: string; occurredAt: string }[], type: string): number | null {
  const match = events
    .filter((e) => e.eventType === type)
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime())[0];
  return match ? new Date(match.occurredAt).getTime() : null;
}

function hoursSince(timestamp: number | null, now: number): number {
  if (!timestamp) return Infinity;
  return (now - timestamp) / 3600000;
}

export async function runFollowUpEngine() {
  const store = await getStoreSnapshotForFollowUp();
  const results: { proposalId: string; sequence: string; sent: boolean }[] = [];
  const now = Date.now();

  const eligible = (await listProposals()).filter(
    (p) =>
      !p.sequencePaused &&
      p.status !== "won" &&
      p.status !== "lost" &&
      p.status !== "draft" &&
      p.status !== "expired" &&
      p.sentAt
  );

  for (const item of eligible) {
    const proposal = item;
    const prospect = item.prospect;
    const sentAt = new Date(proposal.sentAt!).getTime();
    const hoursSinceSent = (now - sentAt) / 3600000;

    const events = store.trackingEvents.filter((e) => e.proposalId === proposal.id);
    const emailOpened = events.some((e) => e.eventType === "email_opened");
    const firstOpenAt = getFirstEventTime(events, "email_opened");
    const viewsToday = events.filter(
      (e) =>
        e.eventType === "proposal_viewed" &&
        new Date(e.occurredAt).toDateString() === new Date().toDateString()
    ).length;

    const logs = store.followUpLogs.filter((l) => l.proposalId === proposal.id);
    const triggeredEvents = new Set(logs.map((l) => l.triggerEvent));

    const seqA = store.followUpSequences.find((s) => s.triggerEvent === "not_opened_48h");
    const seqB = store.followUpSequences.find((s) => s.triggerEvent === "opened_no_reply_24h");
    const seqC = store.followUpSequences.find((s) => s.triggerEvent === "viewed_3x");
    const seqD = store.followUpSequences.find((s) => s.triggerEvent === "no_response_7d");

    const triggers: { event: string; condition: boolean; sequence?: typeof seqA }[] = [
      {
        event: "viewed_3x",
        condition:
          viewsToday >= 3 &&
          !triggeredEvents.has("viewed_3x") &&
          (seqC?.isActive ?? false) &&
          hoursSinceSent >= (seqC?.delayHours ?? 1),
        sequence: seqC,
      },
      {
        event: "not_opened_48h",
        condition:
          ((!emailOpened && hoursSinceSent >= (seqA?.delayHours ?? 48)) ||
            (proposal.status === "not_opened" && hoursSinceSent >= (seqA?.delayHours ?? 48))) &&
          !triggeredEvents.has("not_opened_48h") &&
          (seqA?.isActive ?? false),
        sequence: seqA,
      },
      {
        event: "opened_no_reply_24h",
        condition:
          emailOpened &&
          hoursSince(firstOpenAt, now) >= (seqB?.delayHours ?? 24) &&
          !triggeredEvents.has("opened_no_reply_24h") &&
          proposal.status !== "hot_lead" &&
          (seqB?.isActive ?? false),
        sequence: seqB,
      },
      {
        event: "no_response_7d",
        condition:
          hoursSinceSent >= (seqD?.delayHours ?? 168) &&
          !triggeredEvents.has("no_response_7d") &&
          (seqD?.isActive ?? false),
        sequence: seqD,
      },
    ];

    let sentThisRun = false;

    for (const trigger of triggers) {
      if (sentThisRun || !trigger.condition || !trigger.sequence) continue;
      if (proposal.followUpCount >= 5) break;

      const sequence = trigger.sequence;
      const { subject, bodyHtml } = await generateFollowUpEmail(trigger.event, {
        contactName: prospect.fullName,
        companyName: prospect.businessName,
        facilityType: prospect.facilityType,
        monthlyPrice: proposal.monthlyPrice,
        proposalNumber: proposal.proposalNumber,
      });

      const pixelUrl = `${APP_URL}/api/track/email?token=${proposal.trackingToken}`;

      try {
        const emailResult = await sendEmail({
          to: prospect.email,
          subject,
          html: bodyHtml,
          from: store.company.smtpFromEmail,
          fromName: store.company.smtpFromName,
          trackingPixelUrl: pixelUrl,
        });

        await appendFollowUpLog({
          proposalId: proposal.id,
          sequenceId: sequence.id,
          sequenceStep: sequence.sequenceOrder,
          triggerEvent: trigger.event,
          subject,
          bodyHtml,
          resendEmailId: emailResult.id,
        });

        await createFollowUpNotification(
          proposal.id,
          proposal.companyId,
          `${sequence.name} sent`,
          `Follow-up sent to ${prospect.businessName}`
        );

        results.push({ proposalId: proposal.id, sequence: trigger.event, sent: true });
        sentThisRun = true;
      } catch (err) {
        console.error("[follow-up]", err);
        results.push({ proposalId: proposal.id, sequence: trigger.event, sent: false });
      }
    }
  }

  return results;
}

export async function sendProposalEmail(
  proposalId: string,
  options: {
    subject?: string;
    bodyHtml?: string;
    to?: string;
    attachPdf?: boolean;
    pdfUrl?: string;
  }
) {
  const data = await getProposalById(proposalId);
  if (!data) throw new Error("Proposal not found");

  const { proposal, prospect, company } = data;
  const proposalUrl = `${APP_URL}/p/${proposal.trackingToken}`;
  const pixelUrl = `${APP_URL}/api/track/email?token=${proposal.trackingToken}`;
  const pdfDownloadUrl =
    options.pdfUrl ?? `${APP_URL}/api/v1/proposals/${proposalId}/document?format=pdf`;

  const subject =
    options.subject ??
    `Commercial Cleaning Proposal for ${prospect.businessName} — ${prospect.squareFootage.toLocaleString()} sq ft`;

  let bodyHtml =
    options.bodyHtml ??
    `<p>Dear ${prospect.fullName},</p>
     <p>Please review your customized cleaning proposal for <strong>${prospect.businessName}</strong>.</p>
     <p>Monthly investment: <strong>$${proposal.monthlyPrice.toLocaleString()}</strong></p>
     <p><a href="${proposalUrl}">View Proposal Online</a></p>`;

  if (options.attachPdf && !bodyHtml.includes(pdfDownloadUrl)) {
    bodyHtml += `<p><a href="${pdfDownloadUrl}">Download PDF Proposal</a></p>`;
  }

  const result = await sendEmail({
    to: options.to ?? prospect.email,
    subject,
    html: bodyHtml,
    from: company.smtpFromEmail,
    fromName: company.smtpFromName,
    trackingPixelUrl: pixelUrl,
  });

  await markProposalSent(proposalId);
  return result;
}
