interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  trackingPixelUrl?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ id: string; success: boolean }> {
  const fromEmail = options.from ?? process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const fromName = options.fromName ?? process.env.RESEND_FROM_NAME ?? "CleanProposal AI";

  let html = options.html;
  if (options.trackingPixelUrl) {
    html += `<img src="${options.trackingPixelUrl}" width="1" height="1" alt="" style="display:none" />`;
  }

  if (!process.env.RESEND_API_KEY) {
    console.log("[email:demo]", { to: options.to, subject: options.subject });
    return { id: `demo-${Date.now()}`, success: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [options.to],
      subject: options.subject,
      html,
      reply_to: options.replyTo,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }

  const data = await res.json();
  return { id: data.id, success: true };
}

export function buildEmailSubject(businessName: string, squareFootage: number, facilityType: string): string {
  const label = facilityType.replace("_", " ");
  return `Commercial Cleaning Proposal for ${businessName} — ${squareFootage.toLocaleString()} sq ft ${label}`;
}
