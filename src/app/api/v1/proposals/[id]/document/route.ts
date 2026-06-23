import { NextResponse } from "next/server";
import { getProposalById } from "@/lib/services/proposals/repository";
import { buildProposalHtml } from "@/lib/services/proposals/document";
import { generateProposalPdf, readStoredPdf } from "@/lib/services/pdf/generator";
import { updateProposal } from "@/lib/services/proposals/repository";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const data = getProposalById(params.id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  if (format === "pdf") {
    let buffer = readStoredPdf(data.proposal.id, data.proposal.proposalNumber, data.proposal.version);
    if (!buffer) {
      const result = await generateProposalPdf(data.company, data.prospect, data.proposal);
      if (result) {
        buffer = result.buffer;
        updateProposal(params.id, { pdfUrl: result.publicUrl });
      }
    }

    if (buffer) {
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="proposal-${data.proposal.proposalNumber}.pdf"`,
        },
      });
    }
  }

  const html = buildProposalHtml(data.company, data.prospect, data.proposal);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="proposal-${data.proposal.proposalNumber}.html"`,
    },
  });
}
