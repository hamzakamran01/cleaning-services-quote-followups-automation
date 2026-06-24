import { NextResponse } from "next/server";
import { z } from "zod";
import { intakeFormSchema } from "@/lib/validations/intake";
import { generateProposalContent } from "@/lib/services/ai/openai";
import { generateProposalPdf } from "@/lib/services/pdf/generator";
import {
  createProposalFromIntake,
  createProposalFromExistingProspect,
  getCompany,
  pricingFromIntake,
  updateProposal,
} from "@/lib/services/proposals/repository";
import { requireApiAuth } from "@/lib/auth/api";

export const dynamic = "force-dynamic";

const generateSchema = intakeFormSchema.extend({
  prospectId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await requireApiAuth();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid intake data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { prospectId, ...intakeData } = parsed.data;
    const intake = intakeData;
    const pricing = await pricingFromIntake(intake);
    const company = await getCompany();

    const content = await generateProposalContent(
      {
        client: intake.client,
        facility: intake.facility,
        services: intake.services,
        notes: intake.customization.notes,
      },
      {
        monthlyPrice: pricing.monthlyPrice,
        annualPrice: pricing.annualPrice,
        lineItems: pricing.lineItems,
      },
      company
    );

    const pricingPayload = {
      monthlyPrice: pricing.monthlyPrice,
      annualPrice: pricing.annualPrice,
      lineItems: pricing.lineItems,
      discountApplied: pricing.discountApplied,
    };

    const result = prospectId
      ? await createProposalFromExistingProspect(prospectId, intake, content, pricingPayload)
      : await createProposalFromIntake(intake, content, pricingPayload);

    if (!result) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    const { proposal, prospect } = result;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const pdfUrl = `${appUrl}/api/v1/proposals/${proposal.id}/document?format=pdf`;

    // Enterprise Architecture Note: We intentionally skip executing generateProposalPdf() 
    // synchronously here. Puppeteer + OpenAI compounding execution time regularly exceeds 
    // serverless lambda execution limits. PDF is generated lazily on first GET.

    return NextResponse.json(
      {
        proposalId: proposal.id,
        proposalNumber: proposal.proposalNumber,
        trackingToken: proposal.trackingToken,
        pricing: {
          monthlyPrice: pricing.monthlyPrice,
          annualPrice: pricing.annualPrice,
          lineItems: pricing.lineItems,
          discountApplied: pricing.discountApplied,
        },
        content,
        pdfUrl,
        viewUrl: `${appUrl}/p/${proposal.trackingToken}`,
        status: proposal.status,
        validUntil: proposal.validUntil,
        prospect: {
          id: prospect.id,
          fullName: prospect.fullName,
          businessName: prospect.businessName,
          email: prospect.email,
          facility: intake.facility,
          services: intake.services,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[proposals/generate]", error);
    return NextResponse.json({ error: "Proposal generation failed" }, { status: 500 });
  }
}
