"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import {
  CONTRACT_DURATIONS,
  FACILITY_TYPES,
  LEAD_SOURCES,
  SERVICE_TIMES,
  SERVICE_TYPES,
  SPECIAL_AREAS,
  VISIT_FREQUENCIES,
} from "@/lib/constants";
import { calculatePricing, getPriceRange, DEFAULT_PRICING_CONFIG } from "@/lib/pricing/engine";
import type { PricingConfig } from "@/lib/types/proposal";
import type { FacilityType, ServiceType, VisitFrequency, ContractDuration } from "@/lib/constants";
import { PROMO_CODES, resolvePromoDiscount } from "@/lib/constants";
import {
  intakeFormSchema,
  type IntakeFormValues,
} from "@/lib/validations/intake";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PricePreview } from "@/components/proposals/price-preview";

const STEPS = ["Client", "Facility", "Services", "Custom"] as const;

const defaultValues: IntakeFormValues = {
  client: { fullName: "", businessName: "", email: "", phone: "", website: "" },
  facility: {
    type: "office",
    squareFootage: 10000,
    numFloors: 1,
    numRestrooms: 4,
    floorCarpetPct: 20,
    floorHardwoodPct: 10,
    floorTilePct: 70,
    hasKitchen: true,
    specialAreas: [],
  },
  services: {
    types: ["general_janitorial", "restroom_sanitization"],
    visitFrequency: "3x_week",
    serviceTime: "after_hours",
    contractDuration: "12_months",
    startDate: "",
  },
  customization: { notes: "", source: "", discountPct: 0, promoCode: "" },
};

export function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prospectId = searchParams.get("prospect");
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
  const [prefillLoading, setPrefillLoading] = useState(!!prospectId);

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    fetch("/api/v1/settings/company")
      .then((r) => r.json())
      .then((d) => {
        if (d.company) {
          setPricingConfig({
            baseLaborRate: d.company.baseLaborRate ?? DEFAULT_PRICING_CONFIG.baseLaborRate,
            overheadPct: d.company.overheadPct ?? DEFAULT_PRICING_CONFIG.overheadPct,
            targetMarginPct: d.company.targetMarginPct ?? DEFAULT_PRICING_CONFIG.targetMarginPct,
            supplyCostPerSqFt: DEFAULT_PRICING_CONFIG.supplyCostPerSqFt,
            productivityRate: DEFAULT_PRICING_CONFIG.productivityRate,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!prospectId) {
      setPrefillLoading(false);
      return;
    }

    fetch(`/api/v1/prospects/${prospectId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.prospect) return;
        const p = data.prospect;
        form.reset({
          client: {
            fullName: p.fullName ?? "",
            businessName: p.businessName ?? "",
            email: p.email ?? "",
            phone: p.phone ?? "",
            website: p.website ?? "",
          },
          facility: {
            type: p.facilityType ?? "office",
            squareFootage: p.squareFootage ?? 10000,
            numFloors: p.numFloors ?? 1,
            numRestrooms: p.numRestrooms ?? 4,
            floorCarpetPct: p.floorCarpetPct ?? 20,
            floorHardwoodPct: p.floorHardwoodPct ?? 10,
            floorTilePct: p.floorTilePct ?? 70,
            hasKitchen: p.hasKitchen ?? false,
            specialAreas: p.specialAreas ?? [],
          },
          services: {
            types: ["general_janitorial", "restroom_sanitization"],
            visitFrequency: "3x_week",
            serviceTime: "after_hours",
            contractDuration: "12_months",
            startDate: "",
          },
          customization: {
            notes: p.notes ?? "",
            source: p.source ?? "",
            discountPct: 0,
            promoCode: "",
          },
        });
      })
      .finally(() => setPrefillLoading(false));
  }, [prospectId, form]);

  const values = form.watch();

  const pricingPreview = useMemo(() => {
    try {
      const additionalDiscount = Math.min(
        50,
        (values.customization.discountPct ?? 0) + resolvePromoDiscount(values.customization.promoCode)
      );
      const input = {
        facilityType: values.facility.type as FacilityType,
        squareFootage: values.facility.squareFootage,
        numRestrooms: values.facility.numRestrooms,
        floorCarpetPct: values.facility.floorCarpetPct,
        floorHardwoodPct: values.facility.floorHardwoodPct,
        floorTilePct: values.facility.floorTilePct,
        hasKitchen: values.facility.hasKitchen,
        specialAreas: values.facility.specialAreas,
        serviceTypes: values.services.types as ServiceType[],
        visitFrequency: values.services.visitFrequency as VisitFrequency,
        contractDuration: values.services.contractDuration as ContractDuration,
        discountPct: additionalDiscount,
      };
      const pricing = calculatePricing(input, pricingConfig);
      const range = getPriceRange(input, pricingConfig);
      return { ...pricing, priceLow: range.low, priceHigh: range.high };
    } catch {
      return null;
    }
  }, [values, pricingConfig]);

  const promoInfo = useMemo(() => {
    const code = values.customization.promoCode?.trim().toUpperCase();
    if (!code) return null;
    return PROMO_CODES[code] ?? { invalid: true };
  }, [values.customization.promoCode]);

  async function validateCurrentStep(): Promise<boolean> {
    const fields: (keyof IntakeFormValues)[] = ["client", "facility", "services", "customization"];
    const field = fields[step];
    return form.trigger(field);
  }

  async function handleNext() {
    const valid = await validateCurrentStep();
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleGenerate() {
    const valid = await form.trigger();
    if (!valid) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...form.getValues(),
        ...(prospectId ? { prospectId } : {}),
      };

      const res = await fetch("/api/v1/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to generate proposal");
      }

      const data = await res.json();
      router.push(`/proposals/${data.proposalId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  if (prefillLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="relative mb-6 flex items-center justify-between">
              {STEPS.map((label, i) => (
                <div key={label} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${
                      i < step
                        ? "bg-brand-accent text-white shadow-glow-accent"
                        : i === step
                          ? "bg-brand-primary text-white shadow-glow scale-110"
                          : "bg-slate-100 text-brand-muted"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`hidden text-xs font-medium sm:block ${
                      i <= step ? "text-brand-text" : "text-brand-muted"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
              <div className="absolute left-[10%] right-[10%] top-5 -z-0 h-0.5 bg-slate-200" />
              <div
                className="absolute left-[10%] top-5 -z-0 h-0.5 bg-brand-primary transition-all duration-500"
                style={{ width: `${(step / (STEPS.length - 1)) * 80}%` }}
              />
            </div>
            <Progress value={progress} className="h-2 rounded-full" />
            <CardTitle className="mt-6 text-xl">
              Step {step + 1}: {STEPS[step]} Information
            </CardTitle>
            <CardDescription>
              {step === 0 && "Who are you quoting?"}
              {step === 1 && "Tell us about the facility."}
              {step === 2 && "Configure services and frequency."}
              {step === 3 && "Add notes and finalize."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Contact Full Name *</Label>
                  <Input id="fullName" {...form.register("client.fullName")} />
                  {form.formState.errors.client?.fullName && (
                    <p className="text-xs text-brand-danger">{form.formState.errors.client.fullName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Company / Business Name *</Label>
                  <Input id="businessName" {...form.register("client.businessName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...form.register("client.email")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...form.register("client.phone")} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="https://" {...form.register("client.website")} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Facility Type *</Label>
                  <Select
                    value={values.facility.type}
                    onValueChange={(v) => form.setValue("facility.type", v, { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FACILITY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {values.facility.type === "other" && (
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="typeOther">Describe Facility Type</Label>
                    <Input
                      id="typeOther"
                      placeholder="e.g. Data center, co-working space..."
                      {...form.register("facility.typeOther")}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="sqft">Square Footage *</Label>
                  <Input id="sqft" type="number" {...form.register("facility.squareFootage")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floors">Number of Floors</Label>
                  <Input id="floors" type="number" {...form.register("facility.numFloors")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restrooms">Restrooms</Label>
                  <Input id="restrooms" type="number" {...form.register("facility.numRestrooms")} />
                </div>
                <div className="space-y-2">
                  <Label>Kitchen / Break Room</Label>
                  <Select
                    value={values.facility.hasKitchen ? "yes" : "no"}
                    onValueChange={(v) => form.setValue("facility.hasKitchen", v === "yes")}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carpet">Carpet %</Label>
                  <Input id="carpet" type="number" {...form.register("facility.floorCarpetPct")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hardwood">Hardwood %</Label>
                  <Input id="hardwood" type="number" {...form.register("facility.floorHardwoodPct")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tile">Tile / Concrete %</Label>
                  <Input id="tile" type="number" {...form.register("facility.floorTilePct")} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Special Areas</Label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIAL_AREAS.map((area) => {
                      const selected = values.facility.specialAreas.includes(area);
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => {
                            const next = selected
                              ? values.facility.specialAreas.filter((a) => a !== area)
                              : [...values.facility.specialAreas, area];
                            form.setValue("facility.specialAreas", next);
                          }}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            selected
                              ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                              : "border-brand-border text-brand-muted hover:border-brand-primary/50"
                          }`}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Service Types *</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SERVICE_TYPES.map((svc) => {
                      const checked = values.services.types.includes(svc.value);
                      return (
                        <label
                          key={svc.value}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${
                            checked ? "border-brand-primary bg-brand-primary/5" : "border-brand-border"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const next = checked
                                ? values.services.types.filter((t) => t !== svc.value)
                                : [...values.services.types, svc.value];
                              form.setValue("services.types", next, { shouldValidate: true });
                            }}
                            className="rounded border-brand-border"
                          />
                          {svc.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Visit Frequency</Label>
                    <Select
                      value={values.services.visitFrequency}
                      onValueChange={(v) => form.setValue("services.visitFrequency", v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {VISIT_FREQUENCIES.map((f) => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Service Time</Label>
                    <Select
                      value={values.services.serviceTime}
                      onValueChange={(v) => form.setValue("services.serviceTime", v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SERVICE_TIMES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Contract Duration</Label>
                    <Select
                      value={values.services.contractDuration}
                      onValueChange={(v) => form.setValue("services.contractDuration", v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CONTRACT_DURATIONS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Service Start Date</Label>
                    <Input id="startDate" type="date" {...form.register("services.startDate")} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions</Label>
                  <Textarea id="notes" rows={4} {...form.register("customization.notes")} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>How did they hear about you?</Label>
                    <Select
                      value={values.customization.source ?? ""}
                      onValueChange={(v) => form.setValue("customization.source", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                      <SelectContent>
                        {LEAD_SOURCES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Additional Discount %</Label>
                    <Input id="discount" type="number" {...form.register("customization.discountPct")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promoCode">Promotional Code</Label>
                    <Input
                      id="promoCode"
                      placeholder="e.g. WELCOME10"
                      {...form.register("customization.promoCode")}
                    />
                    {promoInfo && "invalid" in promoInfo && (
                      <p className="text-xs text-brand-danger">Invalid promo code</p>
                    )}
                    {promoInfo && !("invalid" in promoInfo) && (
                      <p className="text-xs text-brand-accent">{promoInfo.label}</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-brand-muted">
                  Valid codes: {Object.keys(PROMO_CODES).join(", ")}
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={handleGenerate} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Proposal
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        {pricingPreview && (
          <PricePreview
            monthlyPrice={pricingPreview.monthlyPrice}
            annualPrice={pricingPreview.annualPrice}
            lineItems={pricingPreview.lineItems}
            discountApplied={pricingPreview.discountApplied}
            priceLow={pricingPreview.priceLow}
            priceHigh={pricingPreview.priceHigh}
          />
        )}
        {step >= 1 && pricingPreview && (
          <p className="mt-4 text-center text-xs text-brand-muted">
            Estimate for {formatCurrency(values.facility.squareFootage)} sq ft · {values.facility.type.replace("_", " ")}
          </p>
        )}
      </div>
    </div>
  );
}
