"use client";

import { useState } from "react";
import { Loader2, Link2, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SendProposalDialogProps {
  proposalId: string;
  defaultTo: string;
  defaultSubject: string;
  defaultBody: string;
  onSent: () => void;
  onCancel: () => void;
}

export function SendProposalDialog({
  proposalId,
  defaultTo,
  defaultSubject,
  defaultBody,
  onSent,
  onCancel,
}: SendProposalDialogProps) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [bodyHtml, setBodyHtml] = useState(defaultBody);
  const [deliveryMode, setDeliveryMode] = useState<"link" | "pdf">("link");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/proposals/${proposalId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, bodyHtml, deliveryMode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to send");
      }
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Proposal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Delivery Method</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryMode("link")}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
                  deliveryMode === "link"
                    ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                    : "border-brand-border text-brand-muted"
                }`}
              >
                <Link2 className="h-4 w-4" />
                Trackable Link
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode("pdf")}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors ${
                  deliveryMode === "pdf"
                    ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                    : "border-brand-border text-brand-muted"
                }`}
              >
                <Paperclip className="h-4 w-4" />
                Link + PDF Download
              </button>
            </div>
            <p className="text-xs text-brand-muted">
              {deliveryMode === "link"
                ? "Prospect views proposal online with open/view tracking."
                : "Email includes trackable link plus a direct PDF download link."}
            </p>
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <Input value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email Body (HTML)</Label>
            <Textarea rows={6} value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} />
          </div>
          {error && <p className="text-sm text-brand-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
