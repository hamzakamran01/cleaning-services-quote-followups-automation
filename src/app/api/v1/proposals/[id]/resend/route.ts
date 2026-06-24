import { NextResponse } from "next/server";
import { getProposalById, resendProposal } from "@/lib/services/proposals/repository";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const existing = await getProposalById(params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const proposal = await resendProposal(params.id);
  if (!proposal) return NextResponse.json({ error: "Resend failed" }, { status: 500 });

  return NextResponse.json({
    proposalId: proposal.id,
    proposalNumber: proposal.proposalNumber,
    version: proposal.version,
    trackingToken: proposal.trackingToken,
    status: proposal.status,
  });
}
