"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import {
  CONTRACT_DURATIONS,
  FACILITY_TYPES,
  LEAD_SOURCES,
  SERVICE_TIMES,
  SERVICE_TYPES,
  SPECIAL_AREAS,
  VISIT_FREQUENCIES,
  PROMO_CODES,
  resolvePromoDiscount,
} from "@/lib/constants";
import { calculatePricing, getPriceRange, DEFAULT_PRICING_CONFIG } from "@/lib/pricing/engine";
import type { PricingConfig } from "@/lib/types/proposal";
import type { FacilityType, ServiceType, VisitFrequency, ContractDuration } from "@/lib/constants";
import { intakeFormSchema, type IntakeFormValues } from "@/lib/validations/intake";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SectionHeader from "@/components/ui/clean/SectionHeader";
import { ProposalLivePreview } from "@/components/proposals/proposal-live-preview";
import { cn } from "@/lib/utils";

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

const fieldClass =
  "h-10 rounded-md border border-[#E2E8F0] bg-white text-sm text-[#1A1D23] focus-visible:border-[#00C5A1] focus-visible:ring-[3px] focus-visible:ring-[rgba(0,197,161,0.12)]";
const labelClass = "mb-1.5 block text-xs font-medium text-[#64748B]";
const errorClass = "mt-1 text-xs text-[#F43F5E]";

export function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prospectId = searchParams.get("prospect");
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

  async function handleSubmit(sendAfter = false) {
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
      const dest = sendAfter
        ? `/proposals/${data.proposalId}?send=true`
        : `/proposals/${data.proposalId}`;
      router.push(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (prefillLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#00C5A1]" />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      {/* Left — Form (60%) */}
      <div className="space-y-8 lg:col-span-3">
        {/* Client Info */}
        <section className="space-y-4">
          <SectionHeader title="Client Info" accent />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName" className={labelClass}>Contact Full Name *</Label>
              <Input id="fullName" className={fieldClass} {...form.register("client.fullName")} />
              {form.formState.errors.client?.fullName && (
                <p className={errorClass}>{form.formState.errors.client.fullName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="businessName" className={labelClass}>Company / Business Name *</Label>
              <Input id="businessName" className={fieldClass} {...form.register("client.businessName")} />
            </div>
            <div>
              <Label htmlFor="email" className={labelClass}>Email *</Label>
              <Input id="email" type="email" className={fieldClass} {...form.register("client.email")} />
            </div>
            <div>
              <Label htmlFor="phone" className={labelClass}>Phone</Label>
              <Input id="phone" className={fieldClass} {...form.register("client.phone")} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="website" className={labelClass}>Website</Label>
              <Input id="website" placeholder="https://" className={fieldClass} {...form.register("client.website")} />
            </div>
          </div>
        </section>

        {/* Service Details */}
        <section className="space-y-4">
          <SectionHeader title="Service Details" accent />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className={labelClass}>Facility Type *</Label>
              <Select
                value={values.facility.type}
                onValueChange={(v) => form.setValue("facility.type", v, { shouldValidate: true })}
              >
                <SelectTrigger className={fieldClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FACILITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sqft" className={labelClass}>Square Footage *</Label>
              <Input id="sqft" type="number" className={fieldClass} {...form.register("facility.squareFootage")} />
            </div>
            <div>
              <Label htmlFor="restrooms" className={labelClass}>Restrooms</Label>
              <Input id="restrooms" type="number" className={fieldClass} {...form.register("facility.numRestrooms")} />
            </div>
            <div>
              <Label className={labelClass}>Visit Frequency</Label>
              <Select
                value={values.services.visitFrequency}
                onValueChange={(v) => form.setValue("services.visitFrequency", v)}
              >
                <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VISIT_FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={labelClass}>Contract Duration</Label>
              <Select
                value={values.services.contractDuration}
                onValueChange={(v) => form.setValue("services.contractDuration", v)}
              >
                <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTRACT_DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className={labelClass}>Service Types *</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {SERVICE_TYPES.map((svc) => {
                const checked = values.services.types.includes(svc.value);
                return (
                  <label
                    key={svc.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition-colors",
                      checked ? "border-[#00C5A1] bg-[#E6FAF6]/50" : "border-[#E2E8F0]"
                    )}
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
                      className="rounded border-[#E2E8F0]"
                    />
                    {svc.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <Label className={labelClass}>Special Areas</Label>
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
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      selected
                        ? "border-[#00C5A1] bg-[#E6FAF6] text-[#009980]"
                        : "border-[#E2E8F0] text-[#64748B]"
                    )}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-4">
          <SectionHeader title="Pricing" accent />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className={labelClass}>Monthly Fee (calculated)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B]">$</span>
                <Input
                  readOnly
                  value={pricingPreview ? pricingPreview.monthlyPrice.toLocaleString() : "—"}
                  className={cn(fieldClass, "pl-7 bg-[#F8F7F4]")}
                />
              </div>
            </div>
            <div>
              <Label className={labelClass}>Promotional Code</Label>
              <Input
                id="promoCode"
                placeholder="e.g. WELCOME10"
                className={fieldClass}
                {...form.register("customization.promoCode")}
              />
              {promoInfo && "invalid" in promoInfo && (
                <p className={errorClass}>Invalid promo code</p>
              )}
              {promoInfo && !("invalid" in promoInfo) && (
                <p className="mt-1 text-xs text-[#059669]">{promoInfo.label}</p>
              )}
            </div>
            <div>
              <Label htmlFor="discount" className={labelClass}>Additional Discount %</Label>
              <Input id="discount" type="number" className={fieldClass} {...form.register("customization.discountPct")} />
            </div>
            <div>
              <Label className={labelClass}>Service Time</Label>
              <Select
                value={values.services.serviceTime}
                onValueChange={(v) => form.setValue("services.serviceTime", v)}
              >
                <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_TIMES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {pricingPreview && (
            <div className="rounded-md border border-[#E2E8F0] bg-[#F8F7F4] p-4">
              <p className="text-xs text-[#64748B]">Auto-calculated annual value</p>
              <p
                className="text-lg font-bold text-[#1A1D23]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {formatCurrency(pricingPreview.annualPrice)}/yr
              </p>
            </div>
          )}
        </section>

        {/* Notes */}
        <section className="space-y-4">
          <SectionHeader title="Notes" accent />
          <div>
            <Label htmlFor="notes" className={labelClass}>Special Instructions</Label>
            <Textarea
              id="notes"
              rows={4}
              className={cn(fieldClass, "h-auto min-h-[100px]")}
              {...form.register("customization.notes")}
            />
          </div>
          <div>
            <Label className={labelClass}>How did they hear about you?</Label>
            <Select
              value={values.customization.source ?? ""}
              onValueChange={(v) => form.setValue("customization.source", v)}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {error && (
          <div className="rounded-md border border-[#F43F5E]/30 bg-[#FFF1F2] px-4 py-3 text-sm text-[#F43F5E]">
            {error}
          </div>
        )}

        {/* AI Generate */}
        <button
          type="button"
          disabled={submitting}
          onClick={() => handleSubmit(false)}
          className={cn(
            "relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-lg text-[15px] font-bold text-white transition-opacity disabled:opacity-70",
            submitting && "animate-shimmer bg-gradient-to-r from-[#00C5A1] via-[#33d4b5] to-[#00C5A1] bg-[length:200%_100%]"
          )}
          style={
            submitting
              ? undefined
              : { background: "linear-gradient(135deg, #00C5A1 0%, #009980 100%)" }
          }
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating with AI…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              AI Generate Proposal
            </>
          )}
        </button>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(false)}
            className="flex-1 rounded-md border border-[#E2E8F0] py-2.5 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8F7F4] disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(true)}
            className="flex-1 rounded-md bg-[#00C5A1] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#009980] disabled:opacity-50"
          >
            Send Proposal
          </button>
        </div>
      </div>

      {/* Right — Live Preview (40%) */}
      <div className="lg:col-span-2">
        {pricingPreview ? (
          <ProposalLivePreview
            values={values}
            monthlyPrice={pricingPreview.monthlyPrice}
            annualPrice={pricingPreview.annualPrice}
            lineItems={pricingPreview.lineItems}
            discountApplied={pricingPreview.discountApplied}
          />
        ) : (
          <div
            className="sticky top-6 rounded-lg border border-dashed border-[#E2E8F0] bg-white p-6 text-center text-sm text-[#64748B]"
          >
            Fill in facility and service details to see live pricing preview.
          </div>
        )}
      </div>
    </div>
  );
}
