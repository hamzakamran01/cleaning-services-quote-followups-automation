import { NextResponse } from "next/server";
import { recordTrackingEvent, getProposalByToken } from "@/lib/services/proposals/repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, section, durationSeconds } = body;

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const data = getProposalByToken(token);
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const eventType =
      section === "pricing"
        ? "pricing_viewed"
        : durationSeconds != null
          ? "page_session"
          : "page_engagement";

    recordTrackingEvent(data.proposal.id, eventType, {
      durationSeconds,
      metadata: { section },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
  }
}
