import { NextResponse } from "next/server";
import { getProposalById } from "@/lib/services/proposals/repository";
import { sendProposalEmail } from "@/lib/services/follow-up/engine";
import { buildProposalEmailHtml } from "@/lib/services/proposals/document";
import { buildEmailSubject } from "@/lib/services/email/resend";
import { requireApiAuth } from "@/lib/auth/api";

export const dynamic = "force-dynamic";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const auth = await requireApiAuth();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json().catch(() => ({}));
    const data = await getProposalById(params.id);

    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { proposal, prospect, company } = data;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const proposalUrl = `${appUrl}/p/${proposal.trackingToken}`;
    const pdfUrl = proposal.pdfUrl ?? `${appUrl}/api/v1/proposals/${params.id}/document?format=pdf`;

    const subject =
      body.subject ??
      buildEmailSubject(prospect.businessName, prospect.squareFootage, prospect.facilityType);

    const bodyHtml =
      body.bodyHtml ??
      buildProposalEmailHtml(
        prospect.fullName,
        prospect.businessName,
        proposal.monthlyPrice,
        proposalUrl,
        company.name
      );

    const result = await sendProposalEmail(params.id, {
      subject,
      bodyHtml,
      to: body.to ?? prospect.email,
      attachPdf: body.deliveryMode === "pdf",
      pdfUrl,
    });

    return NextResponse.json({
      success: true,
      emailId: result.id,
      status: "sent",
    });
  } catch (error) {
    console.error("[proposals/send]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Send failed" },
      { status: 500 }
    );
  }
}
