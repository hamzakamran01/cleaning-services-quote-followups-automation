import type { CompanyRecord, ProposalRecord, ProspectRecord } from "@/lib/store/types";
import { formatCurrencyPrecise } from "@/lib/utils";

export function buildProposalHtml(
  company: CompanyRecord,
  prospect: ProspectRecord,
  proposal: ProposalRecord
): string {
  const lineItemsHtml = proposal.lineItems
    .map(
      (item) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${item.service}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${item.frequency}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">
            ${item.monthlyCost === 0 ? "Included" : formatCurrencyPrecise(item.monthlyCost)}
          </td>
        </tr>`
    )
    .join("");

  const scopeHtml = proposal.scopeOfWork
    ? Object.entries(proposal.scopeOfWork)
        .map(
          ([area, tasks]) =>
            `<div style="margin-bottom:16px;">
              <h4 style="margin:0 0 8px;color:#0f172a;font-size:14px;">${area}</h4>
              <ul style="margin:0;padding-left:20px;color:#64748b;font-size:13px;">
                ${tasks.map((t) => `<li>${t}</li>`).join("")}
              </ul>
            </div>`
        )
        .join("")
    : "";

  const approachHtml = proposal.ourApproach
    .map((a) => `<li style="margin-bottom:6px;color:#64748b;">${a}</li>`)
    .join("");

  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Proposal ${proposal.proposalNumber} — ${prospect.businessName}</title>
  <style>
    @media print { body { margin: 0; } .no-print { display: none; } }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #0f172a; margin: 0; background: #f8fafc; }
    .page { max-width: 800px; margin: 0 auto; background: white; }
    .cover { background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; padding: 48px 40px; }
    .section { padding: 32px 40px; border-bottom: 1px solid #e2e8f0; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    h2 { margin: 0 0 16px; font-size: 18px; color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 8px; }
    .meta { font-size: 13px; opacity: 0.9; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .total-row { background: #f1f5f9; font-weight: 700; }
  </style>
</head>
<body>
  <div class="page">
    <div class="cover">
      <div style="font-size:12px;opacity:0.8;margin-bottom:24px;">${company.name.toUpperCase()}</div>
      <h1>Commercial Cleaning Proposal</h1>
      <p class="meta">Prepared for: <strong>${prospect.businessName}</strong></p>
      <p class="meta">Contact: ${prospect.fullName} · ${prospect.email}</p>
      <p class="meta" style="margin-top:24px;">Proposal #${proposal.proposalNumber} · ${date}</p>
      <p class="meta">Valid until: ${proposal.validUntil ?? "—"}</p>
    </div>

    <div class="section">
      <h2>Executive Summary</h2>
      <p style="line-height:1.7;font-size:14px;white-space:pre-wrap;">${proposal.executiveSummary ?? ""}</p>
    </div>

    <div class="section">
      <h2>Scope of Work</h2>
      ${scopeHtml}
    </div>

    <div class="section">
      <h2>Our Approach</h2>
      <ul style="padding-left:20px;font-size:14px;">${approachHtml}</ul>
    </div>

    <div class="section" id="pricing-section">
      <h2>Pricing Breakdown</h2>
      <table>
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;">Service</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;">Frequency</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#64748b;">Monthly Cost</th>
          </tr>
        </thead>
        <tbody>${lineItemsHtml}</tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="2" style="padding:12px;">MONTHLY TOTAL</td>
            <td style="padding:12px;text-align:right;color:#1e40af;font-size:16px;">${formatCurrencyPrecise(proposal.monthlyPrice)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:10px 12px;color:#64748b;">ANNUAL VALUE</td>
            <td style="padding:10px 12px;text-align:right;font-weight:600;">${formatCurrencyPrecise(proposal.annualPrice)}</td>
          </tr>
        </tfoot>
      </table>
      ${proposal.pricingNarrative ? `<p style="margin-top:16px;font-size:13px;color:#64748b;">${proposal.pricingNarrative}</p>` : ""}
    </div>

    <div class="section">
      <h2>Terms & Conditions</h2>
      <p style="font-size:13px;line-height:1.7;color:#64748b;">${proposal.terms ?? ""}</p>
    </div>

    <div class="section">
      <h2>Next Steps</h2>
      <p style="font-size:14px;line-height:1.7;">${proposal.nextSteps ?? ""}</p>
      <p style="margin-top:24px;font-size:13px;color:#64748b;">
        ${company.name} · ${company.email} · ${company.phone ?? ""}
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function buildProposalEmailHtml(
  contactName: string,
  businessName: string,
  monthlyPrice: number,
  proposalUrl: string,
  companyName: string
): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#0f172a;">
      <p>Dear ${contactName},</p>
      <p>Thank you for considering ${companyName} for your commercial cleaning needs at <strong>${businessName}</strong>.</p>
      <p>Please find your customized proposal below. Your estimated monthly investment is <strong>$${monthlyPrice.toLocaleString()}</strong>.</p>
      <p style="margin:24px 0;">
        <a href="${proposalUrl}" style="background:#1e40af;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          View Your Proposal
        </a>
      </p>
      <p style="color:#64748b;font-size:14px;">If you have any questions, simply reply to this email.</p>
      <p>Best regards,<br/>${companyName}</p>
    </div>
  `;
}
