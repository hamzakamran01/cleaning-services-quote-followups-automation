import { NextResponse } from "next/server";
import { listProposals } from "@/lib/services/proposals/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const proposals = await listProposals(status ? { status } : undefined);

  return NextResponse.json({
    proposals: proposals.map((p) => ({
      id: p.id,
      proposalNumber: p.proposalNumber,
      companyName: p.prospect.businessName,
      contactName: p.prospect.fullName,
      email: p.prospect.email,
      monthlyPrice: p.monthlyPrice,
      annualPrice: p.annualPrice,
      status: p.status,
      sentAt: p.sentAt,
      lastActivity: p.updatedAt,
      followUpCount: p.followUpCount,
      nextAction: getNextAction(p.status, p.followUpCount),
      trackingToken: p.trackingToken,
    })),
  });
}

function getNextAction(status: string, followUpCount: number): string {
  const map: Record<string, string> = {
    draft: "Complete & send proposal",
    sent: followUpCount ? "SEQ-A armed" : "Awaiting open",
    not_opened: "SEQ-A: Gentle nudge (queued)",
    opened: "SEQ-B: Value follow-up",
    viewed_pricing: "High intent — follow up",
    hot_lead: "SEQ-C: Hot alert",
    won: "Closed — won",
    lost: "Closed — lost",
    expired: "Expired — resend",
  };
  return map[status] ?? "—";
}
