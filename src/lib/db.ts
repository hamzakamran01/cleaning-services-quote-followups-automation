import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("[PASSWORD]"));
}

/** Default demo company UUID — matches database/schema.sql and prisma seed */
export const DEMO_COMPANY_ID =
  process.env.DEMO_COMPANY_ID ?? "00000000-0000-4000-8000-000000000001";

export const DEMO_USER_ID =
  process.env.DEMO_USER_ID ?? "00000000-0000-4000-8000-000000000002";
