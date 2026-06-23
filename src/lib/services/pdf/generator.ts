import fs from "fs";
import path from "path";
import { buildProposalHtml } from "@/lib/services/proposals/document";
import type { CompanyRecord, ProspectRecord, ProposalRecord } from "@/lib/store/types";

const PDF_DIR = path.join(process.cwd(), ".data", "pdfs");

function ensurePdfDir() {
  if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });
}

export async function generateProposalPdf(
  company: CompanyRecord,
  prospect: ProspectRecord,
  proposal: ProposalRecord
): Promise<{ buffer: Buffer; filePath: string; publicUrl: string } | null> {
  ensurePdfDir();
  const html = buildProposalHtml(company, prospect, proposal);
  const fileName = `${proposal.proposalNumber}-v${proposal.version}.pdf`;
  const filePath = path.join(PDF_DIR, fileName);
  const publicUrl = `/api/v1/proposals/${proposal.id}/document?format=pdf`;

  try {
    const chromium = await import("@sparticuz/chromium-min");
    const puppeteer = await import("puppeteer-core");

    const executablePath = await chromium.default.executablePath(
      process.env.CHROMIUM_URL ??
        "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
    );

    const browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 816, height: 1056 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const buffer = Buffer.from(
      await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: { top: "0.5in", bottom: "0.5in", left: "0.5in", right: "0.5in" },
      })
    );
    await browser.close();

    fs.writeFileSync(filePath, buffer);
    return { buffer, filePath, publicUrl };
  } catch (err) {
    console.warn("[pdf] Chromium unavailable, HTML fallback:", err);
    const htmlPath = filePath.replace(".pdf", ".html");
    fs.writeFileSync(htmlPath, html, "utf-8");
    return null;
  }
}

export function readStoredPdf(proposalId: string, proposalNumber: string, version: number): Buffer | null {
  ensurePdfDir();
  const filePath = path.join(PDF_DIR, `${proposalNumber}-v${version}.pdf`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}
