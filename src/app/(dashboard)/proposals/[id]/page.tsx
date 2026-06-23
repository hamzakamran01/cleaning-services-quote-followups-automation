import { ProposalDetailClient } from "@/components/proposals/proposal-detail-client";

interface ProposalDetailPageProps {
  params: { id: string };
}

export default function ProposalDetailPage({ params }: ProposalDetailPageProps) {
  return <ProposalDetailClient proposalId={params.id} />;
}
