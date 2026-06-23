import { z } from "zod";

export const clientStepSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  businessName: z.string().min(2, "Business name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const facilityStepSchema = z
  .object({
    type: z.string().min(1, "Facility type is required"),
    typeOther: z.string().optional(),
    squareFootage: z.coerce
      .number()
      .min(500, "Minimum 500 sq ft")
      .max(500000, "Maximum 500,000 sq ft"),
    numFloors: z.coerce.number().min(1).max(100),
    numRestrooms: z.coerce.number().min(0).max(200),
    floorCarpetPct: z.coerce.number().min(0).max(100),
    floorHardwoodPct: z.coerce.number().min(0).max(100),
    floorTilePct: z.coerce.number().min(0).max(100),
    hasKitchen: z.boolean(),
    specialAreas: z.array(z.string()),
  })
  .refine(
    (data) => data.floorCarpetPct + data.floorHardwoodPct + data.floorTilePct === 100,
    { message: "Floor percentages must total 100%", path: ["floorTilePct"] }
  );

export const servicesStepSchema = z.object({
  types: z.array(z.string()).min(1, "Select at least one service"),
  visitFrequency: z.string().min(1),
  serviceTime: z.string().min(1),
  contractDuration: z.string().min(1),
  startDate: z.string().optional(),
});

export const customizationStepSchema = z.object({
  notes: z.string().optional(),
  source: z.string().optional(),
  discountPct: z.coerce.number().min(0).max(50).optional(),
  promoCode: z.string().optional(),
});

export const intakeFormSchema = z.object({
  client: clientStepSchema,
  facility: facilityStepSchema,
  services: servicesStepSchema,
  customization: customizationStepSchema,
});

export type ClientStepValues = z.infer<typeof clientStepSchema>;
export type FacilityStepValues = z.infer<typeof facilityStepSchema>;
export type ServicesStepValues = z.infer<typeof servicesStepSchema>;
export type CustomizationStepValues = z.infer<typeof customizationStepSchema>;
export type IntakeFormValues = z.infer<typeof intakeFormSchema>;

export const pricingPreviewSchema = z.object({
  facilityType: z.string(),
  squareFootage: z.coerce.number().min(500).max(500000),
  numRestrooms: z.coerce.number().min(0),
  floorCarpetPct: z.coerce.number().min(0).max(100),
  floorHardwoodPct: z.coerce.number().min(0).max(100),
  floorTilePct: z.coerce.number().min(0).max(100),
  hasKitchen: z.boolean(),
  specialAreas: z.array(z.string()),
  serviceTypes: z.array(z.string()).min(1),
  visitFrequency: z.string(),
  contractDuration: z.string(),
  discountPct: z.coerce.number().optional(),
});
