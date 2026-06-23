import { NextResponse } from "next/server";
import { getProposalByToken, recordTrackingEvent } from "@/lib/services/proposals/repository";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(request: Request, { params }: { params: { token: string } }) {
  const data = getProposalByToken(params.token);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userAgent = request.headers.get("user-agent") ?? undefined;
  const deviceType = /mobile|android|iphone/i.test(userAgent ?? "") ? "mobile" : "desktop";

  recordTrackingEvent(data.proposal.id, "proposal_viewed", {
    userAgent,
    deviceType,
  });

  return NextResponse.redirect(`${APP_URL}/p/${params.token}`, 302);
}
