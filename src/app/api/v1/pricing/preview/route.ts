import { NextResponse } from "next/server";
import { calculatePricing } from "@/lib/pricing/engine";
import { pricingPreviewSchema } from "@/lib/validations/intake";
import type { FacilityType, ServiceType, VisitFrequency, ContractDuration } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = pricingPreviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const result = calculatePricing({
      facilityType: data.facilityType as FacilityType,
      squareFootage: data.squareFootage,
      numRestrooms: data.numRestrooms,
      floorCarpetPct: data.floorCarpetPct,
      floorHardwoodPct: data.floorHardwoodPct,
      floorTilePct: data.floorTilePct,
      hasKitchen: data.hasKitchen,
      specialAreas: data.specialAreas,
      serviceTypes: data.serviceTypes as ServiceType[],
      visitFrequency: data.visitFrequency as VisitFrequency,
      contractDuration: data.contractDuration as ContractDuration,
      discountPct: data.discountPct,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[pricing/preview]", error);
    return NextResponse.json({ error: "Pricing calculation failed" }, { status: 500 });
  }
}
