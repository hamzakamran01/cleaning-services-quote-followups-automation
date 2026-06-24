import { NextResponse } from "next/server";
import { z } from "zod";
import { updateFollowUpSequence } from "@/lib/services/proposals/repository";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  delayHours: z.coerce.number().min(1).max(720).optional(),
  subjectPrompt: z.string().min(1).optional(),
  bodyPrompt: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const parsed = updateSchema.parse(body);
    const sequence = await updateFollowUpSequence(params.id, parsed);
    if (!sequence) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ sequence });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed" },
      { status: 500 }
    );
  }
}
