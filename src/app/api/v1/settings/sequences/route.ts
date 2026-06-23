import { NextResponse } from "next/server";
import { getFollowUpSequences, updateFollowUpSequence } from "@/lib/services/proposals/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ sequences: await getFollowUpSequences() });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updated = await updateFollowUpSequence(id, updates);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ sequence: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
