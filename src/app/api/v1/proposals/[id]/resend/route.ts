import { NextResponse } from "next/server";
import { getProposalById, resendProposal } from "@/lib/services/proposals/repository";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const existing = getProposalById(params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const proposal = resendProposal(params.id);
  if (!proposal) return NextResponse.json({ error: "Resend failed" }, { status: 500 });

  return NextResponse.json({
    proposalId: proposal.id,
    proposalNumber: proposal.proposalNumber,
    version: proposal.version,
    trackingToken: proposal.trackingToken,
    status: proposal.status,
  });
}
