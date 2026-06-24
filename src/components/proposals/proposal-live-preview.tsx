"use client";

import { useState } from "react";
import { formatCurrency, formatCurrencyPrecise } from "@/lib/utils";
import type { LineItem } from "@/lib/types/proposal";
import type { IntakeFormValues } from "@/lib/validations/intake";
import { FACILITY_TYPES, SERVICE_TYPES, VISIT_FREQUENCIES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProposalLivePreviewProps {
  values: IntakeFormValues;
  monthlyPrice: number;
  annualPrice: number;
  lineItems: LineItem[];
  discountApplied: number;
}

export function ProposalLivePreview({
  values,
  monthlyPrice,
  annualPrice,
  lineItems,
  discountApplied,
}: ProposalLivePreviewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const companyName = values.client.businessName || "Company Name";
  const contactName = values.client.fullName || "Contact Name";
  const facilityLabel =
    FACILITY_TYPES.find((f) => f.value === values.facility.type)?.label ??
    values.facility.type;
  const frequencyLabel =
    VISIT_FREQUENCIES.find((f) => f.value === values.services.visitFrequency)?.label ??
    values.services.visitFrequency;

  return (
    <>
      <div
        className="sticky top-6 rounded-lg bg-white p-6"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
      >
        <h3
          className="text-xl font-bold text-[#1A1D23]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {companyName}
        </h3>
        <p className="mt-1 text-sm text-[#64748B]">{contactName}</p>

        <div className="mt-5 space-y-3 border-t border-[#F1F5F9] pt-5">
          <PreviewRow label="Facility" value={`${facilityLabel} · ${values.facility.squareFootage.toLocaleString()} sq ft`} />
          <PreviewRow label="Frequency" value={frequencyLabel} />
          <PreviewRow
            label="Services"
            value={
              values.services.types.length
                ? values.services.types
                    .map((t) => SERVICE_TYPES.find((s) => s.value === t)?.label ?? t)
                    .slice(0, 2)
                    .join(", ") + (values.services.types.length > 2 ? "…" : "")
                : "—"
            }
          />
        </div>

        <div className="mt-5 border-t border-[#F1F5F9] pt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">Monthly Fee</p>
          <p
            className="mt-1 text-2xl font-bold text-[#1A1D23]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {formatCurrency(monthlyPrice)}
            <span className="text-sm font-normal text-[#64748B]">/mo</span>
          </p>
          <p
            className="mt-2 text-lg font-bold text-[#1A1D23]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {formatCurrency(annualPrice)}
            <span className="text-sm font-normal text-[#64748B]">/yr</span>
          </p>
          {discountApplied > 0 && (
            <p className="mt-1 text-xs text-[#059669]">{discountApplied}% discount applied</p>
          )}
        </div>

        {lineItems.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-[#F1F5F9] pt-4">
            {lineItems.slice(0, 4).map((item, i) => (
              <li key={i} className="flex justify-between text-xs">
                <span className="truncate text-[#64748B]">{item.service}</span>
                <span className="ml-2 shrink-0 font-medium text-[#334155]">
                  {item.monthlyCost === 0 ? "Included" : formatCurrencyPrecise(item.monthlyCost)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="mt-5 w-full text-center text-sm font-medium text-[#00C5A1] hover:underline"
        >
          Preview full proposal →
        </button>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              className="text-xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Proposal Preview — {companyName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 text-sm">
            <section className="rounded-lg bg-gradient-to-br from-[#1A1D23] to-[#334155] p-6 text-white">
              <p className="text-xs uppercase tracking-widest opacity-70">Commercial Cleaning Proposal</p>
              <h4 className="mt-2 text-2xl font-bold">{companyName}</h4>
              <p className="mt-1 opacity-90">Prepared for {contactName}</p>
            </section>

            <section>
              <h5 className="mb-2 font-semibold text-[#1A1D23]">Facility Overview</h5>
              <p className="text-[#64748B]">
                {facilityLabel} · {values.facility.squareFootage.toLocaleString()} sq ft ·{" "}
                {values.facility.numRestrooms} restrooms · {frequencyLabel}
              </p>
            </section>

            <section>
              <h5 className="mb-2 font-semibold text-[#1A1D23]">Scope of Services</h5>
              <ul className="list-inside list-disc space-y-1 text-[#64748B]">
                {values.services.types.map((t) => (
                  <li key={t}>{SERVICE_TYPES.find((s) => s.value === t)?.label ?? t}</li>
                ))}
              </ul>
            </section>

            <section id="pricing-section" className="rounded-lg border border-[#E2E8F0] p-4">
              <h5 className="mb-3 font-semibold text-[#1A1D23]">Investment Summary</h5>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[#94A3B8]">
                    <th className="pb-2">Service</th>
                    <th className="pb-2">Frequency</th>
                    <th className="pb-2 text-right">Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, i) => (
                    <tr key={i} className="border-b border-[#F1F5F9]">
                      <td className="py-2">{item.service}</td>
                      <td className="py-2 text-[#64748B]">{item.frequency}</td>
                      <td className="py-2 text-right font-medium">
                        {item.monthlyCost === 0 ? "Included" : formatCurrencyPrecise(item.monthlyCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-between border-t pt-3">
                <span className="font-semibold">Total Monthly</span>
                <span className="text-lg font-bold text-[#00C5A1]">{formatCurrencyPrecise(monthlyPrice)}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-[#64748B]">Annual Value</span>
                <span className="font-semibold">{formatCurrencyPrecise(annualPrice)}</span>
              </div>
            </section>

            {values.customization.notes && (
              <section>
                <h5 className="mb-2 font-semibold text-[#1A1D23]">Special Instructions</h5>
                <p className="text-[#64748B]">{values.customization.notes}</p>
              </section>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p className="text-sm text-[#334155]">{value}</p>
    </div>
  );
}
