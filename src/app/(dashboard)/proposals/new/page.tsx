import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { IntakeForm } from "@/components/proposals/intake-form";
import { Loader2 } from "lucide-react";

function IntakeFormFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
    </div>
  );
}

export default function NewProposalPage() {
  return (
    <>
      <Header
        title="New Proposal"
        subtitle="Complete the intake form to generate a professional quote in under 3 minutes"
        showNewProposal={false}
      />
      <main className="flex-1 p-4 lg:p-8">
        <Suspense fallback={<IntakeFormFallback />}>
          <IntakeForm />
        </Suspense>
      </main>
    </>
  );
}
