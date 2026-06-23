/**
 * Generates database/schema.sql from shared seed data.
 * Run: npx tsx scripts/generate-schema-sql.ts
 */
import fs from "fs";
import path from "path";
import { buildSeedDataset } from "../src/lib/demo/seed-data";

function esc(s: string | null | undefined): string {
  if (s == null) return "NULL";
  return `'${s.replace(/'/g, "''")}'`;
}

function escJson(obj: unknown): string {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

function arr(items: string[]): string {
  return `ARRAY[${items.map((i) => esc(i)).join(", ")}]`;
}

function main() {
  const data = buildSeedDataset();
  const lines: string[] = [];

  lines.push("-- =============================================================================");
  lines.push("-- CleanProposal AI — Complete Database Schema & Demo Data");
  lines.push("-- PostgreSQL 14+ (Supabase compatible)");
  lines.push("-- Generated from src/lib/demo/seed-data.ts");
  lines.push("-- =============================================================================");
  lines.push("");
  lines.push("-- Enable UUID extension");
  lines.push('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
  lines.push("");
  lines.push("-- =============================================================================");
  lines.push("-- DROP EXISTING (safe re-import)");
  lines.push("-- =============================================================================");
  lines.push("DROP TABLE IF EXISTS notifications CASCADE;");
  lines.push("DROP TABLE IF EXISTS follow_up_logs CASCADE;");
  lines.push("DROP TABLE IF EXISTS proposal_tracking_events CASCADE;");
  lines.push("DROP TABLE IF EXISTS follow_up_sequences CASCADE;");
  lines.push("DROP TABLE IF EXISTS proposals CASCADE;");
  lines.push("DROP TABLE IF EXISTS prospects CASCADE;");
  lines.push("DROP TABLE IF EXISTS users CASCADE;");
  lines.push("DROP TABLE IF EXISTS companies CASCADE;");
  lines.push("");
  lines.push("-- =============================================================================");
  lines.push("-- TABLE: companies");
  lines.push("-- Core tenant entity — cleaning service company using CleanProposal AI");
  lines.push("-- =============================================================================");
  lines.push(`CREATE TABLE companies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  website           TEXT,
  logo_url          TEXT,
  tagline           TEXT,
  address           TEXT,
  city              TEXT,
  state             TEXT,
  zip               TEXT,
  base_labor_rate   DECIMAL(10,2) NOT NULL DEFAULT 22.00,
  overhead_pct      DECIMAL(5,2) NOT NULL DEFAULT 25.00,
  target_margin_pct DECIMAL(5,2) NOT NULL DEFAULT 30.00,
  smtp_from_email   TEXT,
  smtp_from_name    TEXT,
  resend_api_key    TEXT,
  differentiators   TEXT[] NOT NULL DEFAULT '{}',
  certifications    TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`);
  lines.push("");
  lines.push("-- =============================================================================");
  lines.push("-- TABLE: users");
  lines.push("-- Sales reps / admins — id matches Supabase auth.users.id in production");
  lines.push("-- =============================================================================");
  lines.push(`CREATE TABLE users (
  id          UUID PRIMARY KEY,
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'rep',
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`);
  lines.push("");
  lines.push("-- =============================================================================");
  lines.push("-- TABLE: prospects");
  lines.push("-- Potential clients with facility details for pricing");
  lines.push("-- =============================================================================");
  lines.push(`CREATE TABLE prospects (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  assigned_to        UUID REFERENCES users(id),
  full_name          TEXT NOT NULL,
  business_name      TEXT NOT NULL,
  email              TEXT NOT NULL,
  phone              TEXT,
  website            TEXT,
  facility_type      TEXT NOT NULL,
  square_footage     INTEGER NOT NULL,
  num_floors         INTEGER NOT NULL DEFAULT 1,
  num_restrooms      INTEGER NOT NULL DEFAULT 1,
  floor_carpet_pct   INTEGER NOT NULL DEFAULT 0,
  floor_hardwood_pct INTEGER NOT NULL DEFAULT 0,
  floor_tile_pct     INTEGER NOT NULL DEFAULT 100,
  has_kitchen        BOOLEAN NOT NULL DEFAULT FALSE,
  special_areas      TEXT[] NOT NULL DEFAULT '{}',
  notes              TEXT,
  source             TEXT,
  status             TEXT NOT NULL DEFAULT 'active',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_prospects_company_id ON prospects(company_id);`);
  lines.push("");
  lines.push("-- =============================================================================");
  lines.push("-- TABLE: proposals");
  lines.push("-- Generated cleaning proposals with pricing, content, and lifecycle status");
  lines.push("-- Status flow: draft → sent → not_opened|opened → viewed_pricing → hot_lead → won|lost|expired");
  lines.push("-- =============================================================================");
  lines.push(`CREATE TABLE proposals (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  prospect_id        UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  created_by         UUID REFERENCES users(id),
  proposal_number    TEXT NOT NULL UNIQUE,
  version            INTEGER NOT NULL DEFAULT 1,
  services           TEXT[] NOT NULL DEFAULT '{}',
  visit_frequency    TEXT NOT NULL,
  service_time       TEXT,
  contract_duration  TEXT NOT NULL DEFAULT '12_months',
  start_date         DATE,
  monthly_price      DECIMAL(10,2) NOT NULL,
  annual_price       DECIMAL(10,2) NOT NULL,
  discount_pct       DECIMAL(5,2) NOT NULL DEFAULT 0,
  line_items         JSONB NOT NULL DEFAULT '[]',
  executive_summary  TEXT,
  scope_of_work      JSONB,
  our_approach       TEXT[] NOT NULL DEFAULT '{}',
  differentiators    TEXT[] NOT NULL DEFAULT '{}',
  pricing_narrative  TEXT,
  terms              TEXT,
  next_steps           TEXT,
  pdf_url              TEXT,
  tracking_token       TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  status               TEXT NOT NULL DEFAULT 'draft',
  valid_until          DATE,
  sent_at              TIMESTAMPTZ,
  won_at               TIMESTAMPTZ,
  lost_at              TIMESTAMPTZ,
  lost_reason          TEXT,
  follow_up_count      INTEGER NOT NULL DEFAULT 0,
  sequence_paused      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_proposals_company_id ON proposals(company_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_tracking_token ON proposals(tracking_token);`);
  lines.push("");
  lines.push("-- =============================================================================");
  lines.push("-- TABLE: proposal_tracking_events");
  lines.push("-- Email opens, page views, pricing views, engagement heartbeats");
  lines.push("-- =============================================================================");
  lines.push(`CREATE TABLE proposal_tracking_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id      UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  event_type       TEXT NOT NULL,
  ip_address       TEXT,
  user_agent       TEXT,
  device_type      TEXT,
  city             TEXT,
  country          TEXT,
  duration_seconds INTEGER,
  metadata         JSONB,
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tracking_events_proposal_id ON proposal_tracking_events(proposal_id);`);
  lines.push("");
  lines.push("-- =============================================================================");
  lines.push("-- TABLE: follow_up_sequences");
  lines.push("-- Automated email sequence templates (SEQ-A through SEQ-D)");
  lines.push("-- =============================================================================");
  lines.push(`CREATE TABLE follow_up_sequences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  trigger_event   TEXT NOT NULL,
  delay_hours     INTEGER NOT NULL,
  sequence_order  INTEGER NOT NULL,
  subject_prompt  TEXT NOT NULL,
  body_prompt     TEXT NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`);
  lines.push("");
  lines.push("-- =============================================================================");
  lines.push("-- TABLE: follow_up_logs");
  lines.push("-- Record of sent follow-up emails per proposal");
  lines.push("-- =============================================================================");
  lines.push(`CREATE TABLE follow_up_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id     UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  sequence_id     UUID REFERENCES follow_up_sequences(id),
  sequence_step   INTEGER NOT NULL,
  trigger_event   TEXT NOT NULL,
  subject         TEXT NOT NULL,
  body_html       TEXT NOT NULL,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opened_at       TIMESTAMPTZ,
  replied_at      TIMESTAMPTZ,
  resend_email_id TEXT
);
CREATE INDEX idx_follow_up_logs_proposal_id ON follow_up_logs(proposal_id);`);
  lines.push("");
  lines.push("-- =============================================================================");
  lines.push("-- TABLE: notifications");
  lines.push("-- In-app alerts for reps (hot leads, opens, wins, follow-ups)");
  lines.push("-- =============================================================================");
  lines.push(`CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  proposal_id  UUID REFERENCES proposals(id) ON DELETE SET NULL,
  type         TEXT NOT NULL,
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_company_id ON notifications(company_id);
CREATE INDEX idx_notifications_proposal_id ON notifications(proposal_id);`);
  lines.push("");
  lines.push("-- =============================================================================");
  lines.push("-- DEMO DATA");
  lines.push("-- =============================================================================");
  lines.push("");

  const c = data.company;
  lines.push(`INSERT INTO companies (id, name, email, phone, website, tagline, address, city, state, zip, base_labor_rate, overhead_pct, target_margin_pct, smtp_from_email, smtp_from_name, differentiators, certifications) VALUES (
  '${c.id}', ${esc(c.name)}, ${esc(c.email)}, ${esc(c.phone)}, ${esc(c.website)}, ${esc(c.tagline)},
  ${esc(c.address)}, ${esc(c.city)}, ${esc(c.state)}, ${esc(c.zip)},
  ${c.baseLaborRate}, ${c.overheadPct}, ${c.targetMarginPct},
  ${esc(c.smtpFromEmail)}, ${esc(c.smtpFromName)},
  ${arr(c.differentiators)}, ${arr(c.certifications)}
);`);

  const u = data.user;
  lines.push(`INSERT INTO users (id, company_id, full_name, email, role, phone) VALUES (
  '${u.id}', '${u.companyId}', ${esc(u.fullName)}, ${esc(u.email)}, ${esc(u.role)}, ${esc(u.phone)}
);`);

  for (const s of data.sequences) {
    lines.push(`INSERT INTO follow_up_sequences (id, company_id, name, trigger_event, delay_hours, sequence_order, subject_prompt, body_prompt, is_active) VALUES (
  '${s.id}', '${s.companyId}', ${esc(s.name)}, ${esc(s.triggerEvent)}, ${s.delayHours}, ${s.sequenceOrder},
  ${esc(s.subjectPrompt)}, ${esc(s.bodyPrompt)}, ${s.isActive}
);`);
  }

  for (const p of data.prospects) {
    lines.push(`INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '${p.id}', '${p.companyId}', '${p.assignedTo}', ${esc(p.fullName)}, ${esc(p.businessName)}, ${esc(p.email)},
  ${esc(p.phone)}, ${esc(p.website)}, ${esc(p.facilityType)}, ${p.squareFootage}, ${p.numFloors}, ${p.numRestrooms},
  ${p.floorCarpetPct}, ${p.floorHardwoodPct}, ${p.floorTilePct}, ${p.hasKitchen},
  ${arr(p.specialAreas)}, ${esc(p.notes)}, ${esc(p.source)}, ${esc(p.status)}
);`);
  }

  for (const p of data.proposals) {
    lines.push(`INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '${p.id}', '${p.companyId}', '${p.prospectId}', '${p.createdBy}', ${esc(p.proposalNumber)}, ${p.version},
  ${arr(p.services)}, ${esc(p.visitFrequency)}, ${esc(p.serviceTime)}, ${esc(p.contractDuration)},
  ${p.monthlyPrice}, ${p.annualPrice}, ${p.discountPct},
  ${escJson(p.lineItems)}, ${esc(p.executiveSummary)}, ${escJson(p.scopeOfWork)},
  ${arr(p.ourApproach)}, ${arr(p.differentiators)}, ${esc(p.pricingNarrative)}, ${esc(p.terms)}, ${esc(p.nextSteps)},
  '${p.trackingToken}', ${esc(p.status)}, ${p.validUntil ? `'${p.validUntil.toISOString().split("T")[0]}'` : "NULL"},
  ${p.sentAt ? `'${p.sentAt.toISOString()}'` : "NULL"},
  ${p.wonAt ? `'${p.wonAt.toISOString()}'` : "NULL"},
  ${p.lostAt ? `'${p.lostAt.toISOString()}'` : "NULL"},
  ${p.followUpCount}, ${p.sequencePaused}
);`);
  }

  for (const e of data.trackingEvents) {
    lines.push(`INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '${e.id}', '${e.proposalId}', ${esc(e.eventType)}, ${esc(e.deviceType)}, '${e.occurredAt.toISOString()}'
);`);
  }

  for (const n of data.notifications) {
    lines.push(`INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '${n.id}', '${n.companyId}', '${n.proposalId}', ${esc(n.type)}, ${esc(n.title)}, ${esc(n.message)}, ${n.read}, '${n.createdAt.toISOString()}'
);`);
  }

  for (const l of data.followUpLogs) {
    lines.push(`INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '${l.id}', '${l.proposalId}', '${l.sequenceId}', ${l.sequenceStep}, ${esc(l.triggerEvent)},
  ${esc(l.subject)}, ${esc(l.bodyHtml)}, '${l.sentAt.toISOString()}'
);`);
  }

  lines.push("");
  lines.push("-- =============================================================================");
  lines.push(`-- Seed complete: ${data.proposals.length} proposals, ${data.prospects.length} prospects`);
  lines.push("-- Demo login: sarah@sparkleclean.com (DEMO_MODE=true bypasses auth)");
  lines.push("-- Demo company ID: 00000000-0000-4000-8000-000000000001");
  lines.push("-- =============================================================================");

  const outPath = path.join(process.cwd(), "database", "schema.sql");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log(`Wrote ${outPath} (${lines.length} lines)`);
}

main();
