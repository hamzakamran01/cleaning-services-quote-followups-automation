import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { IntakeForm } from "@/components/proposals/intake-form";
import { Loader2 } from "lucide-react";

function IntakeFormFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-[#00C5A1]" />
    </div>
  );
}

export default function NewProposalPage() {
  return (
    <>
      <Header title="New Proposal" showNewProposal={false} />
      <main className="flex-1 p-6">
        <Suspense fallback={<IntakeFormFallback />}>
          <IntakeForm />
        </Suspense>
      </main>
    </>
  );
}
