import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEMO_COMPANY_ID = "00000000-0000-0000-0000-000000000000";

async function main() {
    const proposals = await prisma.proposal.findMany({});
    console.log("Proposals count:", proposals.length);
    const company = await prisma.company.findUnique({ where: { id: DEMO_COMPANY_ID } });
    console.log("Company exists?", !!company, company?.id);

    if (proposals.length > 0) {
        console.log("First proposal company ID:", proposals[0].companyId);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
