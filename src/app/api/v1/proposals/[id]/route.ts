import { NextResponse } from "next/server";
import { getProposalById, updateProposal, markProposalStatus, markProposalReplied, getTrackingEvents, getFollowUpLogs } from "@/lib/services/proposals/repository";
import { contentFromProposal } from "@/lib/store/types";
import { requireApiAuth } from "@/lib/auth/api";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiAuth();
  if (auth instanceof NextResponse) return auth;

  const data = getProposalById(params.id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { proposal, prospect, company } = data;
  const events = getTrackingEvents(proposal.id);
  const followUpLogs = getFollowUpLogs(proposal.id);

  return NextResponse.json({
    proposal: {
      ...proposal,
      content: contentFromProposal(proposal),
    },
    prospect,
    company,
    trackingEvents: events,
    followUpLogs,
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    if (body.status === "won" || body.status === "lost") {
      const updated = markProposalStatus(params.id, body.status, { lostReason: body.lostReason });
      if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ proposal: updated });
    }

    if (body.replied === true) {
      const updated = markProposalReplied(params.id);
      if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ proposal: updated });
    }

    const updated = updateProposal(params.id, {
      content: body.content,
      monthlyPrice: body.monthlyPrice,
      annualPrice: body.annualPrice,
      lineItems: body.lineItems,
      ...body,
    });

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ proposal: { ...updated, content: contentFromProposal(updated) } });
  } catch (error) {
    console.error("[proposals/patch]", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
