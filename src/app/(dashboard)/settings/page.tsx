"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Sequence {
  id: string;
  name: string;
  triggerEvent: string;
  delayHours: number;
  subjectPrompt: string;
  bodyPrompt: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<Record<string, unknown>>({});
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [editingSeqId, setEditingSeqId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/settings/company").then((r) => r.json()),
      fetch("/api/v1/settings/sequences").then((r) => r.json()),
    ]).then(([companyData, seqData]) => {
      setCompany(companyData.company ?? {});
      setSequences(seqData.sequences ?? []);
      setLoading(false);
    });
  }, []);

  async function saveCompany() {
    setSaving(true);
    const res = await fetch("/api/v1/settings/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(company),
    });
    setSaving(false);
    if (res.ok) toast.success("Settings saved");
    else toast.error("Save failed");
  }

  async function saveSequence(seq: Sequence) {
    const res = await fetch(`/api/v1/settings/sequences/${seq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        delayHours: seq.delayHours,
        subjectPrompt: seq.subjectPrompt,
        bodyPrompt: seq.bodyPrompt,
        isActive: seq.isActive,
      }),
    });
    if (res.ok) {
      toast.success("Sequence updated");
      setEditingSeqId(null);
    } else {
      toast.error("Sequence update failed");
    }
  }

  async function toggleSequence(id: string, isActive: boolean) {
    await fetch(`/api/v1/settings/sequences/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    setSequences((prev) => prev.map((s) => (s.id === id ? { ...s, isActive } : s)));
    toast.success(isActive ? "Sequence enabled" : "Sequence paused");
  }

  if (loading) {
    return (
      <>
        <Header title="Settings" showNewProposal={false} />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </main>
      </>
    );
  }

  const differentiators = (company.differentiators as string[] | undefined) ?? [];

  return (
    <>
      <Header title="Settings" subtitle="Company profile, pricing & follow-up sequences" showNewProposal={false} />
      <main className="flex-1 space-y-6 p-4 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>Used in proposals and email personalization</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {[
              { key: "name", label: "Company Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "website", label: "Website" },
              { key: "tagline", label: "Tagline" },
              { key: "address", label: "Address" },
              { key: "city", label: "City" },
              { key: "state", label: "State" },
              { key: "smtpFromEmail", label: "From Email" },
              { key: "smtpFromName", label: "From Name" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input
                  value={String(company[key] ?? "")}
                  onChange={(e) => setCompany({ ...company, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="space-y-2 sm:col-span-2">
              <Label>Differentiators (one per line)</Label>
              <Textarea
                rows={4}
                value={differentiators.join("\n")}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    differentiators: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Certifications (one per line)</Label>
              <Textarea
                rows={3}
                value={((company.certifications as string[] | undefined) ?? []).join("\n")}
                onChange={(e) =>
                  setCompany({
                    ...company,
                    certifications: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing Defaults</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {[
              { key: "baseLaborRate", label: "Labor Rate ($/hr)" },
              { key: "overheadPct", label: "Overhead %" },
              { key: "targetMarginPct", label: "Target Margin %" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input
                  type="number"
                  value={String(company[key] ?? "")}
                  onChange={(e) => setCompany({ ...company, [key]: Number(e.target.value) })}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follow-up Sequences</CardTitle>
            <CardDescription>Behavior-triggered automation (Module 4)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sequences.map((seq) => (
              <div key={seq.id} className="rounded-lg border border-brand-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-brand-text">{seq.name}</p>
                    <p className="text-xs text-brand-muted">
                      Trigger: {seq.triggerEvent.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={seq.isActive ? "success" : "outline"}>
                      {seq.isActive ? "Active" : "Paused"}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => setEditingSeqId(editingSeqId === seq.id ? null : seq.id)}>
                      {editingSeqId === seq.id ? "Close" : "Edit"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleSequence(seq.id, !seq.isActive)}>
                      {seq.isActive ? "Pause" : "Enable"}
                    </Button>
                  </div>
                </div>

                {editingSeqId === seq.id && (
                  <div className="mt-4 grid gap-3 border-t border-brand-border pt-4">
                    <div className="space-y-2">
                      <Label>Delay (hours after trigger)</Label>
                      <Input
                        type="number"
                        value={seq.delayHours}
                        onChange={(e) =>
                          setSequences((prev) =>
                            prev.map((s) =>
                              s.id === seq.id ? { ...s, delayHours: Number(e.target.value) } : s
                            )
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject Prompt</Label>
                      <Textarea
                        rows={2}
                        value={seq.subjectPrompt}
                        onChange={(e) =>
                          setSequences((prev) =>
                            prev.map((s) =>
                              s.id === seq.id ? { ...s, subjectPrompt: e.target.value } : s
                            )
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Body Prompt</Label>
                      <Textarea
                        rows={3}
                        value={seq.bodyPrompt}
                        onChange={(e) =>
                          setSequences((prev) =>
                            prev.map((s) =>
                              s.id === seq.id ? { ...s, bodyPrompt: e.target.value } : s
                            )
                          )
                        }
                      />
                    </div>
                    <Button size="sm" onClick={() => saveSequence(seq)}>
                      Save Sequence
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={saveCompany} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </main>
    </>
  );
}
