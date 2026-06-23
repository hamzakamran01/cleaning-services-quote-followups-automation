import { NextResponse } from "next/server";
import { getPipelineAnalytics } from "@/lib/services/proposals/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const analytics = await getPipelineAnalytics();
  return NextResponse.json(analytics);
}
