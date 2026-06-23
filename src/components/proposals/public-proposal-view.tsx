"use client";

import { useEffect, useRef } from "react";
import { formatCurrencyPrecise } from "@/lib/utils";

interface PublicProposalViewProps {
  token: string;
  companyName: string;
  prospectName: string;
  businessName: string;
  proposalNumber: string;
  validUntil?: string;
  monthlyPrice: number;
  annualPrice: number;
  executiveSummary?: string;
  scopeOfWork?: Record<string, string[]>;
  ourApproach?: string[];
  lineItems: { service: string; frequency: string; monthlyCost: number }[];
  terms?: string;
  nextSteps?: string;
  pricingNarrative?: string;
}

export function PublicProposalView(props: PublicProposalViewProps) {
  const pricingSeenRef = useRef(false);

  useEffect(() => {
    const startedAt = Date.now();
    sendHeartbeat(props.token);

    const interval = setInterval(() => sendHeartbeat(props.token), 15000);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !pricingSeenRef.current) {
            pricingSeenRef.current = true;
            sendHeartbeat(props.token, "pricing");
          }
        }
      },
      { threshold: 0.5 }
    );

    const pricingEl = document.getElementById("pricing-section");
    if (pricingEl) observer.observe(pricingEl);

    return () => {
      clearInterval(interval);
      observer.disconnect();
      const duration = Math.round((Date.now() - startedAt) / 1000);
      sendHeartbeat(props.token, undefined, duration);
    };
  }, [props.token]);

  const lineItemsHtml = props.lineItems.map((item, i) => (
    <tr key={i} className="border-b border-brand-border">
      <td className="py-3 pr-4">{item.service}</td>
      <td className="py-3 pr-4 text-brand-muted">{item.frequency}</td>
      <td className="py-3 text-right font-medium">
        {item.monthlyCost === 0 ? "Included" : formatCurrencyPrecise(item.monthlyCost)}
      </td>
    </tr>
  ));

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="mx-auto max-w-3xl bg-white shadow-lg">
        <div className="bg-gradient-to-br from-brand-primary to-blue-900 px-8 py-12 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">{props.companyName}</p>
          <h1 className="mt-4 text-3xl font-bold">Commercial Cleaning Proposal</h1>
          <p className="mt-2 opacity-90">Prepared for <strong>{props.businessName}</strong></p>
          <p className="text-sm opacity-80">{props.prospectName}</p>
          <p className="mt-6 text-sm opacity-80">
            {props.proposalNumber} · Valid until {props.validUntil ?? "—"}
          </p>
        </div>

        <div className="space-y-8 px-8 py-10">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-brand-primary">Executive Summary</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-text">
              {props.executiveSummary}
            </p>
          </section>

          {props.scopeOfWork && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-brand-primary">Scope of Work</h2>
              {Object.entries(props.scopeOfWork).map(([area, tasks]) => (
                <div key={area} className="mb-4">
                  <h3 className="font-medium text-brand-text">{area}</h3>
                  <ul className="mt-1 list-inside list-disc text-sm text-brand-muted">
                    {tasks.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {props.ourApproach && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-brand-primary">Our Approach</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-brand-muted">
                {props.ourApproach.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </section>
          )}

          <section id="pricing-section">
            <h2 className="mb-3 text-lg font-semibold text-brand-primary">Pricing</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="pb-2 font-medium">Service</th>
                  <th className="pb-2 font-medium">Frequency</th>
                  <th className="pb-2 text-right font-medium">Monthly</th>
                </tr>
              </thead>
              <tbody>{lineItemsHtml}</tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={2} className="py-3 pl-2">Monthly Total</td>
                  <td className="py-3 pr-2 text-right text-brand-primary text-lg">
                    {formatCurrencyPrecise(props.monthlyPrice)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="py-2 pl-2 text-brand-muted">Annual Value</td>
                  <td className="py-2 pr-2 text-right font-semibold">
                    {formatCurrencyPrecise(props.annualPrice)}
                  </td>
                </tr>
              </tfoot>
            </table>
            {props.pricingNarrative && (
              <p className="mt-4 text-sm text-brand-muted">{props.pricingNarrative}</p>
            )}
          </section>

          {props.terms && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-brand-primary">Terms</h2>
              <p className="text-sm text-brand-muted">{props.terms}</p>
            </section>
          )}

          {props.nextSteps && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-brand-primary">Next Steps</h2>
              <p className="text-sm text-brand-text">{props.nextSteps}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function sendHeartbeat(token: string, section?: string, durationSeconds?: number) {
  fetch("/api/track/heartbeat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, section, durationSeconds }),
  }).catch(() => {});
}
