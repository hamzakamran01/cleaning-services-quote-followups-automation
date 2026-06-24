import { NextResponse } from "next/server";
import { z } from "zod";
import { getProspectById, updateProspect } from "@/lib/services/proposals/repository";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  businessName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  facilityType: z.string().optional(),
  squareFootage: z.coerce.number().min(500).optional(),
  numRestrooms: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await getProspectById(params.id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const parsed = updateSchema.parse(body);
    const prospect = await updateProspect(params.id, parsed);
    if (!prospect) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ prospect });
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
