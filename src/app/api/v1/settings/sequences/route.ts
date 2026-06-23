import { NextResponse } from "next/server";
import { getFollowUpSequences } from "@/lib/services/proposals/repository";
import { mutateStore } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ sequences: getFollowUpSequences() });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const updated = mutateStore(({ followUpSequences }) => {
      const idx = followUpSequences.findIndex((s) => s.id === id);
      if (idx === -1) return null;
      followUpSequences[idx] = { ...followUpSequences[idx], ...updates };
      return followUpSequences[idx];
    });

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ sequence: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
