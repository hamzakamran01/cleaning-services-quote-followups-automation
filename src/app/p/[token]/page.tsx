import { notFound } from "next/navigation";
import { getProposalByToken, recordTrackingEvent } from "@/lib/services/proposals/repository";
import { PublicProposalView } from "@/components/proposals/public-proposal-view";

interface PageProps {
  params: { token: string };
}

export default async function PublicProposalPage({ params }: PageProps) {
  const data = await getProposalByToken(params.token);
  if (!data) notFound();

  const { proposal, prospect, company } = data;

  await recordTrackingEvent(proposal.id, "proposal_viewed", {
    deviceType: "unknown",
  });

  return (
    <PublicProposalView
      token={proposal.trackingToken}
      companyName={company.name}
      prospectName={prospect.fullName}
      businessName={prospect.businessName}
      proposalNumber={proposal.proposalNumber}
      validUntil={proposal.validUntil}
      monthlyPrice={proposal.monthlyPrice}
      annualPrice={proposal.annualPrice}
      executiveSummary={proposal.executiveSummary}
      scopeOfWork={proposal.scopeOfWork}
      ourApproach={proposal.ourApproach}
      lineItems={proposal.lineItems}
      terms={proposal.terms}
      nextSteps={proposal.nextSteps}
      pricingNarrative={proposal.pricingNarrative}
    />
  );
}
