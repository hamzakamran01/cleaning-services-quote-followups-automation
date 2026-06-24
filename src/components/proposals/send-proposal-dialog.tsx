"use client";

import { useState } from "react";
import { Loader2, Link2, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 shadow-2xl rounded-[16px] max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-5 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent border-border shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-2xl font-heading text-foreground">
            <Send className="h-6 w-6 text-primary" />
            Send Proposal
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-3">
            <Label className="text-[13px] uppercase tracking-wide font-bold text-muted-foreground/80">Delivery Method</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDeliveryMode("link")}
                className={`flex items-center justify-center gap-2.5 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${deliveryMode === "link"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border/60 text-muted-foreground hover:border-primary/40 hover:bg-muted/20"
                  }`}
              >
                <Link2 className="h-4.5 w-4.5" />
                Trackable Link
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode("pdf")}
                className={`flex items-center justify-center gap-2.5 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${deliveryMode === "pdf"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border/60 text-muted-foreground hover:border-primary/40 hover:bg-muted/20"
                  }`}
              >
                <Paperclip className="h-4.5 w-4.5" />
                Link + PDF
              </button>
            </div>
            <p className="text-[12px] font-medium text-muted-foreground/80 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
              {deliveryMode === "link"
                ? "Prospect receives a secure online link with open tracking."
                : "Includes standard link plus a direct PDF attachment."}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] uppercase tracking-wide font-bold text-muted-foreground/80">To</Label>
            <Input value={to} onChange={(e) => setTo(e.target.value)} className="h-10 bg-background shadow-none border-border/80 focus-visible:ring-primary/20 text-md rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] uppercase tracking-wide font-bold text-muted-foreground/80">Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-10 bg-background shadow-none border-border/80 focus-visible:ring-primary/20 text-md rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] uppercase tracking-wide font-bold text-muted-foreground/80 flex items-center justify-between">
              <span>Personalized Message</span>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">OPTIONAL</span>
            </Label>
            <Textarea
              rows={3}
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              placeholder="Hi there, I've attached the proposal we discussed..."
              className="text-md p-3 leading-relaxed bg-background shadow-none border-border/80 focus-visible:ring-primary/20 resize-none rounded-lg"
            />
            <p className="text-[12px] font-medium text-muted-foreground/60 flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
              Message will be cleanly formatted. HTML is not required.
            </p>
          </div>
          {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm font-semibold text-destructive border border-destructive/20 shrink-0">{error}</div>}
        </div>
        <DialogFooter className="px-6 py-4 border-t bg-muted/10 flex justify-between gap-4 items-center shrink-0">
          <Button variant="ghost" onClick={onCancel} disabled={sending} className="text-muted-foreground hover:bg-muted/50 hover:text-foreground font-semibold px-6">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending} className="gap-2 shadow-elevated hover:shadow-glow hover:-translate-y-[1px] transition-all duration-200 h-10 px-6 rounded-lg font-bold">
            {sending ? <Loader2 className="h-4 max-w-4 animate-spin" /> : <Send className="h-4 max-w-4" />}
            Send Proposal Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
