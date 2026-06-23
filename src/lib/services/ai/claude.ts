import type { ProposalContent } from "@/lib/types/proposal";
import type { CompanyRecord } from "@/lib/store/types";
import { getCompany } from "@/lib/services/proposals/repository";

export async function generateProposalContent(
  input: {
    client: { fullName: string; businessName: string; email: string };
    facility: Record<string, unknown>;
    services: Record<string, unknown>;
    notes?: string;
  },
  pricing: { monthlyPrice: number; annualPrice: number; lineItems: unknown[] },
  companyOverride?: CompanyRecord
): Promise<ProposalContent> {
  const company = companyOverride ?? (await getCompany());

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return (await callClaude(
        `You are a professional proposal writer for commercial cleaning companies. Return ONLY valid JSON with keys: executiveSummary, scopeOfWork (object with area keys and string[] task values), ourApproach (string[]), differentiators (string[]), pricingNarrative, terms, nextSteps.`,
        JSON.stringify({
          company: {
            name: company.name,
            tagline: company.tagline,
            email: company.email,
            phone: company.phone,
            differentiators: company.differentiators,
            certifications: company.certifications,
          },
          prospect: input.client,
          facility: input.facility,
          services: input.services,
          notes: input.notes,
          pricing,
        })
      )) as ProposalContent;
    } catch {
      // fall through
    }
  }
  return buildFallbackContent(
    input.client.fullName,
    input.client.businessName,
    String(input.facility.type),
    pricing.monthlyPrice,
    company
  );
}

export async function generateFollowUpEmail(
  sequenceType: string,
  context: {
    contactName: string;
    companyName: string;
    facilityType: string;
    monthlyPrice: number;
    proposalNumber: string;
  }
): Promise<{ subject: string; bodyHtml: string }> {
  const company = await getCompany();
  const templates: Record<string, { subject: string; body: string }> = {
    not_opened_48h: {
      subject: `Quick check-in — Proposal for ${context.companyName}`,
      body: `<p>Hi ${context.contactName},</p><p>I wanted to make sure you received the commercial cleaning proposal I sent for ${context.companyName} (${context.proposalNumber}). Happy to walk through the ${context.monthlyPrice.toLocaleString()}/mo scope whenever works for you.</p><p>Best regards,<br/>${company.name}</p>`,
    },
    opened_no_reply_24h: {
      subject: `One thing ${context.companyName}'s facility should know`,
      body: `<p>Hi ${context.contactName},</p><p>For ${context.facilityType.replace("_", " ")} facilities like yours, consistent sanitization protocols make a measurable difference in occupant confidence. I'd love to show you how our team handles this — can we schedule a brief walkthrough?</p><p>${company.name}</p>`,
    },
    viewed_3x: {
      subject: `Ready to move forward, ${context.contactName}?`,
      body: `<p>Hi ${context.contactName},</p><p>I noticed you've reviewed our proposal for ${context.companyName}. I'd love to answer any remaining questions — do you have 10 minutes this week for a quick call?</p><p>${company.name}</p>`,
    },
    no_response_7d: {
      subject: `Should I close your file, ${context.contactName}?`,
      body: `<p>Hi ${context.contactName},</p><p>I've reached out a few times about the cleaning proposal for ${context.companyName}. If the timing isn't right or you've chosen another vendor, no worries — just let me know and I'll stop following up.</p><p>If you'd still like to explore options, I'm here.</p><p>${company.name}</p>`,
    },
  };

  const key = sequenceType as keyof typeof templates;
  if (templates[key] && !process.env.ANTHROPIC_API_KEY) {
    const t = templates[key];
    return { subject: t.subject, bodyHtml: t.body };
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const result = await callClaude(
        `Write a follow-up email for sequence ${sequenceType}. Return ONLY JSON: { "subject": string, "bodyHtml": string } where bodyHtml is HTML paragraphs. Sign off as ${company.name}.`,
        JSON.stringify({ ...context, senderCompany: company.name })
      );
      return result as { subject: string; bodyHtml: string };
    } catch {
      // fall through
    }
  }

  const fallback = templates.not_opened_48h;
  return { subject: fallback.subject, bodyHtml: fallback.body };
}

function buildFallbackContent(
  contactName: string,
  businessName: string,
  facilityType: string,
  monthlyPrice: number,
  company: CompanyRecord
): ProposalContent {
  return {
    executiveSummary: `Dear ${contactName},\n\nThank you for considering ${company.name} for your ${facilityType.replace("_", " ")} cleaning needs at ${businessName}. We understand the importance of maintaining a clean, safe, and professional environment for your team and visitors.`,
    scopeOfWork: {
      "Common Areas": ["Vacuum and mop all hard floors", "Dust and wipe all surfaces", "Empty trash and replace liners"],
      Restrooms: ["Sanitize fixtures and dispensers", "Clean mirrors and countertops", "Mop and disinfect floors"],
      Offices: ["Dust desks and workstations", "Clean glass partitions", "Vacuum carpeted areas"],
    },
    ourApproach: [
      "Dedicated cleaning team assigned to your facility",
      "Quality inspections after every service",
      "EPA-compliant, green-certified products",
      "Flexible scheduling to minimize disruption",
    ],
    differentiators: company.differentiators.length ? company.differentiators : ["Licensed, bonded & insured", "24/7 emergency response"],
    pricingNarrative: `Your customized monthly service investment of $${monthlyPrice.toLocaleString()} reflects the scope, frequency, and facility requirements outlined in this proposal.`,
    terms: "Services commence upon signed agreement. 30-day cancellation notice required. Payment due net-15.",
    nextSteps: "Please review this proposal and reply to confirm acceptance. This proposal is valid for 14 days.",
  };
}

async function callClaude(system: string, userContent: string): Promise<ProposalContent | Record<string, unknown>> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!response.ok) throw new Error("Claude API error");
  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid Claude response");
  return JSON.parse(jsonMatch[0]);
}
