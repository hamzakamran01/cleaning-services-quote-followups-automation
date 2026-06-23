import { NextResponse } from "next/server";
import { getMonthlyAnalytics } from "@/lib/services/proposals/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const months = Math.min(12, Math.max(1, parseInt(searchParams.get("months") ?? "6", 10)));
  return NextResponse.json({ months: getMonthlyAnalytics(months) });
}
