import { NextResponse } from "next/server";
import { runFollowUpEngine } from "@/lib/services/follow-up/engine";
import { processNotOpenedProposals, processExpiredProposals } from "@/lib/services/proposals/repository";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
    }
  } else if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = processExpiredProposals();
  const notOpened = processNotOpenedProposals();
  const results = await runFollowUpEngine();

  return NextResponse.json({
    success: true,
    expiredUpdated: expired.length,
    notOpenedUpdated: notOpened.length,
    processed: results.length,
    results,
    ranAt: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  return GET(request);
}
