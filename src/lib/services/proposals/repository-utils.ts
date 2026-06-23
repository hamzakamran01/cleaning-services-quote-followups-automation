
/** Prevent Next.js from statically prerendering API routes at build time */
export const dynamic = "force-dynamic";

export function isDbConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; name?: string; message?: string };
  return (
    e.name === "PrismaClientInitializationError" ||
    e.code === "P1001" ||
    e.code === "P1002" ||
    Boolean(e.message?.includes("Can't reach database server")) ||
    Boolean(e.message?.includes("Company not found"))
  );
}

export async function withDbFallback<T>(
  dbFn: () => Promise<T>,
  jsonFn: () => T | Promise<T>
): Promise<T> {
  try {
    return await dbFn();
  } catch (error) {
    if (isDbConnectionError(error)) {
      console.warn("[repository] Database unavailable — using local JSON store fallback");
      return jsonFn();
    }
    throw error;
  }
}
