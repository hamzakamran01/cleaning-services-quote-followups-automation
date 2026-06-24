"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  ExternalLink,
  Loader2,
  Send,
  XCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SendProposalDialog } from "@/components/proposals/send-proposal-dialog";
import { PROPOSAL_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { ProposalContent } from "@/lib/types/proposal";

interface ProposalDetailClientProps {
  proposalId: string;
}

export function ProposalDetailClient({ proposalId }: ProposalDetailClientProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [showSend, setShowSend] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/v1/proposals/${proposalId}`);
    if (!res.ok) {
      setData(null);
      setLoading(false);
      return;
    }
    setData(await res.json());
    setLoading(false);
  }, [proposalId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatus(status: "won" | "lost") {
    const res = await fetch(`/api/v1/proposals/${proposalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(status === "won" ? "Marked as Won!" : "Marked as Lost");
      load();
    }
  }

  async function handleResendFlow() {
    const currentStatus = (data?.proposal as Record<string, unknown> | undefined)?.status as string | undefined;
    if (currentStatus && currentStatus !== "draft") {
      const res = await fetch(`/api/v1/proposals/${proposalId}/resend`, { method: "POST" });
      if (!res.ok) {
        toast.error("Failed to create new version");
        return;
      }
      toast.success(`Created version ${((await res.json()) as { version: number }).version}`);
      await load();
    }
    setShowSend(true);
  }

  async function handleMarkReplied() {
    const res = await fetch(`/api/v1/proposals/${proposalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replied: true }),
    });
    if (res.ok) {
      toast.success("Follow-up sequences paused — prospect replied");
      load();
    }
  }

  async function saveContent(content: ProposalContent) {
    setSaving(true);
    const res = await fetch(`/api/v1/proposals/${proposalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Proposal updated");
      setEditing(false);
      load();
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Loading..." showNewProposal={false} />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header title="Not Found" showNewProposal={false} />
        <main className="flex-1 p-8 text-center">
          <p className="text-brand-muted">Proposal not found.</p>
          <Button asChild className="mt-4">
            <Link href="/proposals">Back</Link>
          </Button>
        </main>
      </>
    );
  }

  const proposal = data.proposal as Record<string, unknown>;
  const prospect = data.prospect as Record<string, unknown>;
  const company = data.company as Record<string, unknown>;
  const content = proposal.content as ProposalContent;
  const status = proposal.status as string;
  const statusConfig = PROPOSAL_STATUSES.find((s) => s.value === status);
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const viewUrl = `${appUrl}/p/${proposal.trackingToken}`;

  const defaultSubject = `Commercial Cleaning Proposal for ${prospect.businessName}`;
  const defaultBody = `I have attached your customized commercial cleaning proposal.\n\nYour estimated investment is $${(proposal.monthlyPrice as number).toLocaleString()}/mo.\n\nPlease let me know if you have any questions or if you'd like to schedule a quick call to walk through the details.\n\nLooking forward to working with you!`;

  return (
    <>
      <Header
        title={prospect.businessName as string}
        subtitle={proposal.proposalNumber as string}
        showNewProposal={false}
      />
      <main className="flex-1 p-4 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/proposals"><ArrowLeft className="h-4 w-4" /> Back</Link>
          </Button>
          <Badge className={statusConfig?.color}>{statusConfig?.label ?? status}</Badge>
          {(proposal.version as number) > 1 && (
            <Badge variant="outline">v{proposal.version as number}</Badge>
          )}
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/v1/proposals/${proposalId}/document?format=pdf`} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4" /> PDF
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/v1/proposals/${proposalId}/document`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" /> HTML
              </a>
            </Button>
            {!["won", "lost"].includes(status) && (
              <>
                <Button variant="outline" size="sm" onClick={handleMarkReplied}>
                  Mark Replied
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleStatus("won")}>
                  <CheckCircle className="h-4 w-4 text-brand-accent" /> Won
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleStatus("lost")}>
                  <XCircle className="h-4 w-4 text-brand-danger" /> Lost
                </Button>
              </>
            )}
            <Button size="sm" onClick={handleResendFlow} disabled={status === "won"}>
              <Send className="h-4 w-4" /> {status === "draft" ? "Send" : "Revise & Resend"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Executive Summary</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
                  {editing ? "Cancel" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <EditableContent content={content} onSave={saveContent} saving={saving} />
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{content.executiveSummary}</p>
                )}
              </CardContent>
            </Card>

            {content.scopeOfWork && (
              <Card>
                <CardHeader><CardTitle>Scope of Work</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(content.scopeOfWork).map(([area, tasks]) => (
                    <div key={area}>
                      <h4 className="font-medium">{area}</h4>
                      <ul className="mt-1 list-inside list-disc text-sm text-brand-muted">
                        {tasks.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle>Next Steps</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-brand-muted">{content.nextSteps}</p></CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-brand-muted">Monthly</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {formatCurrency(proposal.monthlyPrice as number)}
                </p>
                <p className="mt-2 text-sm text-brand-muted">Annual</p>
                <p className="font-semibold">{formatCurrency(proposal.annualPrice as number)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
              <CardContent className="text-sm text-brand-muted">
                <p className="font-medium text-brand-text">{prospect.fullName as string}</p>
                <p>{prospect.email as string}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Follow-ups</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>{proposal.followUpCount as number} automated emails sent</p>
                <p className="text-brand-muted">
                  {proposal.sequencePaused ? "Sequences paused" : "Auto-sequences armed after send"}
                </p>
                {(data.followUpLogs as Array<{ subject: string; sentAt: string; triggerEvent?: string }> | undefined)?.length ? (
                  <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto border-t border-brand-border pt-2">
                    {(data.followUpLogs as Array<{ subject: string; sentAt: string; triggerEvent?: string }>).map((log, i) => (
                      <li key={i} className="text-xs">
                        <p className="font-medium text-brand-text">{log.subject}</p>
                        <p className="text-brand-muted">
                          {log.triggerEvent?.replace(/_/g, " ")} · {new Date(log.sentAt).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Tracking Activity</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {(data.trackingEvents as Array<{ eventType: string; occurredAt: string }> | undefined)?.length ? (
                  <ul className="max-h-40 space-y-2 overflow-y-auto">
                    {(data.trackingEvents as Array<{ eventType: string; occurredAt: string }>).slice(0, 8).map((event, i) => (
                      <li key={i} className="flex justify-between text-xs">
                        <span className="capitalize text-brand-text">{event.eventType.replace(/_/g, " ")}</span>
                        <span className="text-brand-muted">{new Date(event.occurredAt).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-brand-muted">No tracking events yet</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Prepared By</CardTitle></CardHeader>
              <CardContent className="text-sm text-brand-muted">
                <p className="font-medium text-brand-text">{company.name as string}</p>
                <p>{company.email as string}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {showSend && (
        <SendProposalDialog
          proposalId={proposalId}
          defaultTo={prospect.email as string}
          defaultSubject={defaultSubject}
          defaultBody={defaultBody}
          onSent={() => {
            setShowSend(false);
            toast.success("Proposal sent!");
            load();
          }}
          onCancel={() => setShowSend(false)}
        />
      )}
    </>
  );
}

function EditableContent({
  content,
  onSave,
  saving,
}: {
  content: ProposalContent;
  onSave: (c: ProposalContent) => void;
  saving: boolean;
}) {
  const [summary, setSummary] = useState(content.executiveSummary);
  const [nextSteps, setNextSteps] = useState(content.nextSteps);

  return (
    <div className="space-y-4">
      <Textarea rows={6} value={summary} onChange={(e) => setSummary(e.target.value)} />
      <Textarea rows={3} value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} placeholder="Next steps" />
      <Button size="sm" disabled={saving} onClick={() => onSave({ ...content, executiveSummary: summary, nextSteps })}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
      </Button>
    </div>
  );
}
