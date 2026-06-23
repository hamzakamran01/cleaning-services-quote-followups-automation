import { NextResponse } from "next/server";
import { getPipelineAnalytics } from "@/lib/services/proposals/repository";

export async function GET() {
  const analytics = getPipelineAnalytics();
  return NextResponse.json(analytics);
}
