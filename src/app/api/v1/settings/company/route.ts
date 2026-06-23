import { NextResponse } from "next/server";
import { getCompany, updateCompany } from "@/lib/services/proposals/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ company: await getCompany() });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const company = await updateCompany(body);
    return NextResponse.json({ company });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
