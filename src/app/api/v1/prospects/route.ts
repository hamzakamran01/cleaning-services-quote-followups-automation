import { NextResponse } from "next/server";
import { z } from "zod";
import { createProspect, listProspects } from "@/lib/services/proposals/repository";

const createProspectSchema = z.object({
  fullName: z.string().min(2),
  businessName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().optional(),
  facilityType: z.string().default("office"),
  squareFootage: z.coerce.number().min(500).default(5000),
  numFloors: z.coerce.number().min(1).default(1),
  numRestrooms: z.coerce.number().min(0).default(2),
  floorCarpetPct: z.coerce.number().min(0).max(100).default(30),
  floorHardwoodPct: z.coerce.number().min(0).max(100).default(10),
  floorTilePct: z.coerce.number().min(0).max(100).default(60),
  hasKitchen: z.boolean().default(false),
  specialAreas: z.array(z.string()).default([]),
  notes: z.string().optional(),
  source: z.string().optional(),
});

export async function GET() {
  return NextResponse.json({ prospects: listProspects() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createProspectSchema.parse(body);
    const prospect = createProspect(parsed);
    return NextResponse.json({ prospect }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Create failed" },
      { status: 500 }
    );
  }
}
