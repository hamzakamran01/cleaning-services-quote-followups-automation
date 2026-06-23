import { prisma } from "@/lib/db";
import { buildSeedDataset } from "@/lib/demo/seed-data";

async function main() {
  console.log("Seeding CleanProposal AI demo data...");

  const data = buildSeedDataset();

  await prisma.company.upsert({
    where: { id: data.company.id },
    update: {},
    create: {
      id: data.company.id,
      name: data.company.name,
      email: data.company.email,
      phone: data.company.phone,
      website: data.company.website,
      tagline: data.company.tagline,
      address: data.company.address,
      city: data.company.city,
      state: data.company.state,
      zip: data.company.zip,
      baseLaborRate: data.company.baseLaborRate,
      overheadPct: data.company.overheadPct,
      targetMarginPct: data.company.targetMarginPct,
      smtpFromEmail: data.company.smtpFromEmail,
      smtpFromName: data.company.smtpFromName,
      differentiators: data.company.differentiators,
      certifications: data.company.certifications,
    },
  });

  await prisma.user.upsert({
    where: { id: data.user.id },
    update: {},
    create: {
      id: data.user.id,
      companyId: data.user.companyId,
      fullName: data.user.fullName,
      email: data.user.email,
      role: data.user.role,
      phone: data.user.phone,
    },
  });

  for (const seq of data.sequences) {
    await prisma.followUpSequence.upsert({
      where: { id: seq.id },
      update: {},
      create: seq,
    });
  }

  for (const p of data.prospects) {
    await prisma.prospect.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        companyId: p.companyId,
        assignedTo: p.assignedTo,
        fullName: p.fullName,
        businessName: p.businessName,
        email: p.email,
        phone: p.phone,
        website: p.website,
        facilityType: p.facilityType,
        squareFootage: p.squareFootage,
        numFloors: p.numFloors,
        numRestrooms: p.numRestrooms,
        floorCarpetPct: p.floorCarpetPct,
        floorHardwoodPct: p.floorHardwoodPct,
        floorTilePct: p.floorTilePct,
        hasKitchen: p.hasKitchen,
        specialAreas: p.specialAreas,
        notes: p.notes,
        source: p.source,
        status: p.status,
      },
    });
  }

  for (const p of data.proposals) {
    await prisma.proposal.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        companyId: p.companyId,
        prospectId: p.prospectId,
        createdBy: p.createdBy,
        proposalNumber: p.proposalNumber,
        version: p.version,
        services: p.services,
        visitFrequency: p.visitFrequency,
        serviceTime: p.serviceTime,
        contractDuration: p.contractDuration,
        startDate: p.startDate,
        monthlyPrice: p.monthlyPrice,
        annualPrice: p.annualPrice,
        discountPct: p.discountPct,
        lineItems: p.lineItems,
        executiveSummary: p.executiveSummary,
        scopeOfWork: p.scopeOfWork,
        ourApproach: p.ourApproach,
        differentiators: p.differentiators,
        pricingNarrative: p.pricingNarrative,
        terms: p.terms,
        nextSteps: p.nextSteps,
        trackingToken: p.trackingToken,
        status: p.status,
        validUntil: p.validUntil,
        sentAt: p.sentAt,
        wonAt: p.wonAt,
        lostAt: p.lostAt,
        followUpCount: p.followUpCount,
        sequencePaused: p.sequencePaused,
      },
    });
  }

  for (const e of data.trackingEvents) {
    await prisma.proposalTrackingEvent.upsert({
      where: { id: e.id },
      update: {},
      create: {
        id: e.id,
        proposalId: e.proposalId,
        eventType: e.eventType,
        deviceType: e.deviceType,
        occurredAt: e.occurredAt,
      },
    });
  }

  for (const n of data.notifications) {
    await prisma.notification.upsert({
      where: { id: n.id },
      update: {},
      create: {
        id: n.id,
        companyId: n.companyId,
        proposalId: n.proposalId,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      },
    });
  }

  for (const l of data.followUpLogs) {
    await prisma.followUpLog.upsert({
      where: { id: l.id },
      update: {},
      create: {
        id: l.id,
        proposalId: l.proposalId,
        sequenceId: l.sequenceId,
        sequenceStep: l.sequenceStep,
        triggerEvent: l.triggerEvent,
        subject: l.subject,
        bodyHtml: l.bodyHtml,
        sentAt: l.sentAt,
      },
    });
  }

  console.log(`Seeded:`);
  console.log(`  - 1 company, 1 user`);
  console.log(`  - ${data.sequences.length} follow-up sequences`);
  console.log(`  - ${data.prospects.length} prospects`);
  console.log(`  - ${data.proposals.length} proposals`);
  console.log(`  - ${data.trackingEvents.length} tracking events`);
  console.log(`  - ${data.notifications.length} notifications`);
  console.log(`  - ${data.followUpLogs.length} follow-up logs`);
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
