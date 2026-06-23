import { NextResponse } from "next/server";
import { recordTrackingEvent } from "@/lib/services/proposals/repository";
import { getProposalByToken } from "@/lib/services/proposals/repository";

export const dynamic = "force-dynamic";

const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token) {
    const data = await getProposalByToken(token);
    if (data) {
      const ua = request.headers.get("user-agent") ?? undefined;
      await recordTrackingEvent(data.proposal.id, "email_opened", {
        userAgent: ua,
        deviceType: ua?.includes("Mobile") ? "mobile" : "desktop",
      });
    }
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
