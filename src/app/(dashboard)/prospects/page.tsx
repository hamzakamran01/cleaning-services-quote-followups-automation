"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { AddProspectDialog } from "@/components/prospects/add-prospect-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PROPOSAL_STATUSES, FACILITY_TYPES } from "@/lib/constants";
import { Building2, Mail, MapPin, Plus, User, Users } from "lucide-react";

interface ProspectRow {
  id: string;
  fullName: string;
  businessName: string;
  email: string;
  phone?: string;
  facilityType: string;
  squareFootage: number;
  latestProposalStatus?: string;
  monthlyValue: number;
}

function facilityLabel(type: string) {
  return FACILITY_TYPES.find((f) => f.value === type)?.label ?? type.replace("_", " ");
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<ProspectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/v1/prospects")
      .then((r) => r.json())
      .then((d) => {
        setProspects(d.prospects ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Header title="Prospects" subtitle="Pre-sale contacts and pipeline leads" />
      <main className="flex-1 space-y-6 p-4 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div>
            <p className="text-sm text-brand-muted">
              {prospects.length} prospect{prospects.length !== 1 ? "s" : ""} in your pipeline
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Add Prospect
          </Button>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : prospects.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No prospects yet"
            description="Add your first prospect to start building your sales pipeline before generating proposals."
            actionLabel="Add Prospect"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 animate-fade-in">
            {prospects.map((p) => {
              const statusConfig = PROPOSAL_STATUSES.find(
                (s) => s.value === p.latestProposalStatus
              );
              return (
                <Card key={p.id} className="group overflow-hidden transition-all hover:shadow-elevated">
                  <CardContent className="p-0">
                    <div className="border-b border-brand-border/40 bg-gradient-to-r from-brand-primary/[0.04] to-transparent px-5 py-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-brand-text">{p.businessName}</h3>
                            <p className="text-xs text-brand-muted">{facilityLabel(p.facilityType)}</p>
                          </div>
                        </div>
                        {statusConfig && (
                          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2.5 px-5 py-4 text-sm">
                      <div className="flex items-center gap-2 text-brand-muted">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span>{p.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-brand-muted">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{p.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-brand-muted">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{p.squareFootage.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-brand-border/40 pt-3">
                        <span className="text-xs text-brand-muted">Est. monthly value</span>
                        <span className="font-bold text-brand-accent">
                          {formatCurrency(p.monthlyValue)}/mo
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-brand-border/40 bg-slate-50/50 px-5 py-3">
                      <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link href={`/proposals/new?prospect=${p.id}`}>Create Proposal</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <AddProspectDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={load} />
    </>
  );
}
