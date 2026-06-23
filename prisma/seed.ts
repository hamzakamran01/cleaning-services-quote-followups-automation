import { prisma } from "@/lib/db";
import { DEMO_ACTIVITY, DEMO_COMPANY, DEMO_PROPOSALS } from "@/lib/demo/data";

async function main() {
  console.log("Seeding CleanProposal AI demo data...");

  const company = await prisma.company.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      name: DEMO_COMPANY.name,
      email: DEMO_COMPANY.email,
      phone: DEMO_COMPANY.phone,
      tagline: DEMO_COMPANY.tagline,
      differentiators: DEMO_COMPANY.differentiators,
      certifications: DEMO_COMPANY.certifications,
      baseLaborRate: DEMO_COMPANY.baseLaborRate,
      overheadPct: DEMO_COMPANY.overheadPct,
      targetMarginPct: DEMO_COMPANY.targetMarginPct,
    },
  });

  console.log(`Company: ${company.name}`);

  for (const p of DEMO_PROPOSALS) {
    const prospect = await prisma.prospect.create({
      data: {
        companyId: company.id,
        fullName: p.contactName,
        businessName: p.companyName,
        email: `${p.contactName.toLowerCase().replace(/\s/g, ".")}@example.com`,
        facilityType: "office",
        squareFootage: 15000,
        numRestrooms: 6,
        status: p.status === "won" ? "won" : "active",
      },
    });

    await prisma.proposal.create({
      data: {
        companyId: company.id,
        prospectId: prospect.id,
        proposalNumber: p.proposalNumber,
        services: ["general_janitorial"],
        visitFrequency: "3x_week",
        contractDuration: "12_months",
        monthlyPrice: p.monthlyPrice,
        annualPrice: p.annualPrice,
        lineItems: [{ service: "General Janitorial", frequency: "3x/week", monthlyCost: p.monthlyPrice }],
        status: p.status,
        followUpCount: p.followUpCount,
        sentAt: p.sentAt ? new Date(p.sentAt) : null,
        executiveSummary: `Proposal for ${p.companyName}`,
      },
    });
  }

  console.log(`Seeded ${DEMO_PROPOSALS.length} proposals`);
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
