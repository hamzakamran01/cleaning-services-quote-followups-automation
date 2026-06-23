-- =============================================================================
-- CleanProposal AI — Complete Database Schema & Demo Data
-- PostgreSQL 14+ (Supabase compatible)
-- Generated from src/lib/demo/seed-data.ts
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- DROP EXISTING (safe re-import)
-- =============================================================================
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS follow_up_logs CASCADE;
DROP TABLE IF EXISTS proposal_tracking_events CASCADE;
DROP TABLE IF EXISTS follow_up_sequences CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS prospects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- =============================================================================
-- TABLE: companies
-- Core tenant entity — cleaning service company using CleanProposal AI
-- =============================================================================
CREATE TABLE companies (
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
);

-- =============================================================================
-- TABLE: users
-- Sales reps / admins — id matches Supabase auth.users.id in production
-- =============================================================================
CREATE TABLE users (
  id          UUID PRIMARY KEY,
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'rep',
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- TABLE: prospects
-- Potential clients with facility details for pricing
-- =============================================================================
CREATE TABLE prospects (
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
CREATE INDEX idx_prospects_company_id ON prospects(company_id);

-- =============================================================================
-- TABLE: proposals
-- Generated cleaning proposals with pricing, content, and lifecycle status
-- Status flow: draft → sent → not_opened|opened → viewed_pricing → hot_lead → won|lost|expired
-- =============================================================================
CREATE TABLE proposals (
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
CREATE INDEX idx_proposals_tracking_token ON proposals(tracking_token);

-- =============================================================================
-- TABLE: proposal_tracking_events
-- Email opens, page views, pricing views, engagement heartbeats
-- =============================================================================
CREATE TABLE proposal_tracking_events (
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
CREATE INDEX idx_tracking_events_proposal_id ON proposal_tracking_events(proposal_id);

-- =============================================================================
-- TABLE: follow_up_sequences
-- Automated email sequence templates (SEQ-A through SEQ-D)
-- =============================================================================
CREATE TABLE follow_up_sequences (
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
);

-- =============================================================================
-- TABLE: follow_up_logs
-- Record of sent follow-up emails per proposal
-- =============================================================================
CREATE TABLE follow_up_logs (
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
CREATE INDEX idx_follow_up_logs_proposal_id ON follow_up_logs(proposal_id);

-- =============================================================================
-- TABLE: notifications
-- In-app alerts for reps (hot leads, opens, wins, follow-ups)
-- =============================================================================
CREATE TABLE notifications (
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
CREATE INDEX idx_notifications_proposal_id ON notifications(proposal_id);

-- =============================================================================
-- DEMO DATA
-- =============================================================================

INSERT INTO companies (id, name, email, phone, website, tagline, address, city, state, zip, base_labor_rate, overhead_pct, target_margin_pct, smtp_from_email, smtp_from_name, differentiators, certifications) VALUES (
  '00000000-0000-4000-8000-000000000001', 'SparkleClean Commercial Services', 'hello@sparkleclean.com', '(555) 234-8900', 'https://www.sparkleclean.com', 'Professional cleaning. Predictable results.',
  '1200 Commerce Blvd, Suite 400', 'Austin', 'TX', '78701',
  22, 25, 30,
  'hello@sparkleclean.com', 'SparkleClean Commercial Services',
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['OSHA Compliant', 'Green Seal Certified', 'ISSA Member']
);
INSERT INTO users (id, company_id, full_name, email, role, phone) VALUES (
  '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Sarah Chen', 'sarah@sparkleclean.com', 'admin', '(555) 234-8901'
);
INSERT INTO follow_up_sequences (id, company_id, name, trigger_event, delay_hours, sequence_order, subject_prompt, body_prompt, is_active) VALUES (
  '00000000-0000-4000-8003-000000000001', '00000000-0000-4000-8000-000000000001', 'SEQ-A: Gentle Nudge', 'not_opened_48h', 48, 1,
  'Quick check-in about the proposal for {companyName}', 'Write a short 3-sentence email confirming they received the proposal for {companyName}. Offer to answer questions or schedule a call. Reference the {monthlyPrice} monthly proposal.', true
);
INSERT INTO follow_up_sequences (id, company_id, name, trigger_event, delay_hours, sequence_order, subject_prompt, body_prompt, is_active) VALUES (
  '00000000-0000-4000-8003-000000000002', '00000000-0000-4000-8000-000000000001', 'SEQ-B: Value Follow-up', 'opened_no_reply_24h', 24, 2,
  'One thing {companyName}''s cleaning company should know', 'Write a value-add follow-up for a {facilityType} facility. Include one industry-specific insight and a soft CTA to schedule a walkthrough. Reference their proposal.', true
);
INSERT INTO follow_up_sequences (id, company_id, name, trigger_event, delay_hours, sequence_order, subject_prompt, body_prompt, is_active) VALUES (
  '00000000-0000-4000-8003-000000000003', '00000000-0000-4000-8000-000000000001', 'SEQ-C: Hot Alert', 'viewed_3x', 1, 3,
  'Are you ready to move forward, {contactName}?', 'The prospect viewed the proposal 3+ times. Write an urgent but professional email offering a 10-minute call this week to answer remaining questions about the {monthlyPrice}/mo proposal.', true
);
INSERT INTO follow_up_sequences (id, company_id, name, trigger_event, delay_hours, sequence_order, subject_prompt, body_prompt, is_active) VALUES (
  '00000000-0000-4000-8003-000000000004', '00000000-0000-4000-8000-000000000001', 'SEQ-D: Final Attempt', 'no_response_7d', 168, 4,
  'Should I close your file, {contactName}?', 'Write a breakup email. Mention you''ve reached out a few times about the cleaning proposal for {companyName}. Give them an easy out but invite them to reply if timing changes.', true
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000001', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Sarah Chen', 'Meridian Financial', 'sarah.chen@example.com',
  '(555) 100-2000', 'https://www.meridianfinancial.com', 'office', 8000, 1, 4,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], 'High-priority account — decision maker engaged.', 'referral', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000002', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'James Rodriguez', 'CoreTech Office Park', 'james.rodriguez@example.com',
  '(555) 101-2001', 'https://www.coretechofficepark.com', 'office', 8500, 2, 5,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'website', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000003', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Dr. Anita Patel', 'Riverside Medical Center', 'dr..anita.patel@example.com',
  '(555) 102-2002', 'https://www.riversidemedicalcenter.com', 'medical', 9000, 3, 6,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'cold_outreach', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000004', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Michael Torres', 'The Grand Hotel Group', 'michael.torres@example.com',
  '(555) 103-2003', 'https://www.thegrandhotelgroup.com', 'hospitality', 9500, 1, 7,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'trade_show', 'won'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000005', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Kevin Walsh', 'Apex Logistics Warehouse', 'kevin.walsh@example.com',
  '(555) 104-2004', 'https://www.apexlogisticswarehouse.com', 'industrial', 10000, 2, 8,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], 'High-priority account — decision maker engaged.', 'referral', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000006', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Lisa Nguyen', 'Summit Law Partners', 'lisa.nguyen@example.com',
  '(555) 105-2005', 'https://www.summitlawpartners.com', 'office', 10500, 3, 4,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'website', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000007', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Maria Santos', 'BrightPath Daycare', 'maria.santos@example.com',
  '(555) 106-2006', 'https://www.brightpathdaycare.com', 'office', 11000, 1, 5,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'cold_outreach', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000008', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Tom Bradley', 'Northgate Shopping Plaza', 'tom.bradley@example.com',
  '(555) 107-2007', 'https://www.northgateshoppingplaza.com', 'retail', 11500, 2, 6,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'trade_show', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000009', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Dr. Kim Lee', 'Pacific Dental Group', 'dr..kim.lee@example.com',
  '(555) 108-2008', 'https://www.pacificdentalgroup.com', 'medical', 12000, 3, 7,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], 'High-priority account — decision maker engaged.', 'referral', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000010', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Robert Hayes', 'Metro Transit Authority', 'robert.hayes@example.com',
  '(555) 109-2009', 'https://www.metrotransitauthority.com', 'office', 12500, 1, 8,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'website', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000011', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Amanda Wright', 'Coastal Insurance Co', 'amanda.wright@example.com',
  '(555) 110-2010', 'https://www.coastalinsuranceco.com', 'office', 13000, 2, 4,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'cold_outreach', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000012', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Chris Dalton', 'Harbor View Apartments', 'chris.dalton@example.com',
  '(555) 111-2011', 'https://www.harborviewapartments.com', 'office', 13500, 3, 5,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'trade_show', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000013', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Priya Sharma', 'TechStart Incubator', 'priya.sharma@example.com',
  '(555) 112-2012', 'https://www.techstartincubator.com', 'office', 14000, 1, 6,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], 'High-priority account — decision maker engaged.', 'referral', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000014', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'James O''Brien', 'Valley Credit Union', 'james.o''brien@example.com',
  '(555) 113-2013', 'https://www.valleycreditunion.com', 'office', 14500, 2, 7,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'website', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000015', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Helen Park', 'Sunrise Senior Living', 'helen.park@example.com',
  '(555) 114-2014', 'https://www.sunriseseniorliving.com', 'hospitality', 15000, 3, 8,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'cold_outreach', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000016', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Marcus Webb', 'Urban Fitness Club', 'marcus.webb@example.com',
  '(555) 115-2015', 'https://www.urbanfitnessclub.com', 'office', 15500, 1, 4,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'trade_show', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000017', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Director Walsh', 'City Hall Annex', 'director.walsh@example.com',
  '(555) 116-2016', 'https://www.cityhallannex.com', 'office', 16000, 2, 5,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], 'High-priority account — decision maker engaged.', 'referral', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000018', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Sara Bloom', 'GreenLeaf Organic Market', 'sara.bloom@example.com',
  '(555) 117-2017', 'https://www.greenleaforganicmarket.com', 'retail', 16500, 3, 6,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'website', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000019', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Frank Miller', 'Atlas Manufacturing', 'frank.miller@example.com',
  '(555) 118-2018', 'https://www.atlasmanufacturing.com', 'industrial', 17000, 1, 7,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'cold_outreach', 'active'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000020', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Derek Chen', 'Premier Auto Group', 'derek.chen@example.com',
  '(555) 119-2019', 'https://www.premierautogroup.com', 'office', 17500, 2, 8,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'trade_show', 'won'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000021', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Dr. Evans', 'Westside Medical Clinic', 'dr..evans@example.com',
  '(555) 120-2020', 'https://www.westsidemedicalclinic.com', 'medical', 18000, 3, 4,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], 'High-priority account — decision maker engaged.', 'referral', 'won'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000022', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Susan Grant', 'Liberty Bank HQ', 'susan.grant@example.com',
  '(555) 121-2021', 'https://www.libertybankhq.com', 'office', 18500, 1, 5,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'website', 'won'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000023', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Michael Torres', 'Cascade Hotel', 'michael.torres@example.com',
  '(555) 122-2022', 'https://www.cascadehotel.com', 'hospitality', 19000, 2, 6,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'cold_outreach', 'won'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000024', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Kevin Walsh', 'Pioneer Logistics', 'kevin.walsh@example.com',
  '(555) 123-2023', 'https://www.pioneerlogistics.com', 'industrial', 19500, 3, 7,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'trade_show', 'won'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000025', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Janet Cole', 'Evergreen Office Park', 'janet.cole@example.com',
  '(555) 124-2024', 'https://www.evergreenofficepark.com', 'office', 20000, 1, 8,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], 'High-priority account — decision maker engaged.', 'referral', 'won'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000026', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Paul Singh', 'Ridgeview Apartments', 'paul.singh@example.com',
  '(555) 125-2025', 'https://www.ridgeviewapartments.com', 'office', 20500, 2, 4,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'website', 'won'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000027', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'David Park', 'Sterling Wealth Mgmt', 'david.park@example.com',
  '(555) 126-2026', 'https://www.sterlingwealthmgmt.com', 'office', 21000, 3, 5,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'cold_outreach', 'won'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000028', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Principal Adams', 'Oakwood Elementary', 'principal.adams@example.com',
  '(555) 127-2027', 'https://www.oakwoodelementary.com', 'office', 21500, 1, 6,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'trade_show', 'won'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000029', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Nina Patel', 'BlueStar Retail', 'nina.patel@example.com',
  '(555) 128-2028', 'https://www.bluestarretail.com', 'retail', 22000, 2, 7,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], 'High-priority account — decision maker engaged.', 'referral', 'won'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000030', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Alex Rivera', 'Horizon Tech Campus', 'alex.rivera@example.com',
  '(555) 129-2029', 'https://www.horizontechcampus.com', 'office', 22500, 3, 8,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'website', 'won'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000031', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Carlos Mendez', 'Legacy Foods Inc', 'carlos.mendez@example.com',
  '(555) 130-2030', 'https://www.legacyfoodsinc.com', 'office', 23000, 1, 4,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'cold_outreach', 'won'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000032', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Jake Morrison', 'Old Town Brewery', 'jake.morrison@example.com',
  '(555) 131-2031', 'https://www.oldtownbrewery.com', 'office', 23500, 2, 5,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'trade_show', 'lost'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000033', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Tony Russo', 'FastFreight Depot', 'tony.russo@example.com',
  '(555) 132-2032', 'https://www.fastfreightdepot.com', 'office', 24000, 3, 6,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], 'High-priority account — decision maker engaged.', 'referral', 'lost'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000034', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Amy Cho', 'Downtown Fitness', 'amy.cho@example.com',
  '(555) 133-2033', 'https://www.downtownfitness.com', 'office', 24500, 1, 7,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'website', 'lost'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000035', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Rick Barnes', 'Suburban Auto Parts', 'rick.barnes@example.com',
  '(555) 134-2034', 'https://www.suburbanautoparts.com', 'office', 25000, 2, 8,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'cold_outreach', 'lost'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000036', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Pastor Ellis', 'Community Church', 'pastor.ellis@example.com',
  '(555) 135-2035', 'https://www.communitychurch.com', 'office', 25500, 3, 4,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'trade_show', 'lost'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000037', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Dan Foster', 'Budget Storage Co', 'dan.foster@example.com',
  '(555) 136-2036', 'https://www.budgetstorageco.com', 'office', 26000, 1, 5,
  30, 10, 60, true,
  ARRAY['Lobbies', 'Break Rooms'], 'High-priority account — decision maker engaged.', 'referral', 'lost'
);
INSERT INTO prospects (id, company_id, assigned_to, full_name, business_name, email, phone, website, facility_type, square_footage, num_floors, num_restrooms, floor_carpet_pct, floor_hardwood_pct, floor_tile_pct, has_kitchen, special_areas, notes, source, status) VALUES (
  '00000000-0000-4000-8001-000000000038', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'Linda Wu', 'QuickPrint Express', 'linda.wu@example.com',
  '(555) 137-2037', 'https://www.quickprintexpress.com', 'office', 26500, 2, 6,
  30, 10, 60, false,
  ARRAY['Lobbies', 'Break Rooms'], NULL, 'website', 'lost'
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000001', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000001', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1042', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  4800, 57600, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":4080},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":720}]'::jsonb, 'Dear Sarah Chen,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Meridian Financial. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $4,800 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000001', 'hot_lead', '2026-07-07',
  '2026-06-22T21:01:49.661Z',
  NULL,
  NULL,
  1, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000002', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000002', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1038', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  6200, 74400, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":5270},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":930}]'::jsonb, 'Dear James Rodriguez,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at CoreTech Office Park. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $6,200 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000002', 'opened', '2026-07-07',
  '2026-06-22T21:01:49.662Z',
  NULL,
  NULL,
  0, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000003', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000003', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1031', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  3400, 40800, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":2890},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":510}]'::jsonb, 'Dear Dr. Anita Patel,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Riverside Medical Center. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $3,400 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000003', 'sent', '2026-07-07',
  '2026-06-21T21:01:49.662Z',
  NULL,
  NULL,
  0, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000004', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000004', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1033', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  8400, 100800, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":7140},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":1260}]'::jsonb, 'Dear Michael Torres,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at The Grand Hotel Group. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $8,400 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000004', 'won', '2026-07-07',
  '2026-06-16T21:01:49.662Z',
  '2026-06-20T21:01:49.662Z',
  NULL,
  2, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000005', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000005', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1045', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  2800, 33600, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":2380},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":420}]'::jsonb, 'Dear Kevin Walsh,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Apex Logistics Warehouse. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $2,800 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000005', 'draft', '2026-07-07',
  NULL,
  NULL,
  NULL,
  0, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000006', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000006', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1000', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  3900, 46800, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":3315},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":585}]'::jsonb, 'Dear Lisa Nguyen,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Summit Law Partners. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $3,900 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000006', 'draft', '2026-07-07',
  NULL,
  NULL,
  NULL,
  1, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000007', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000007', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1001', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  2100, 25200, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":1785},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":315}]'::jsonb, 'Dear Maria Santos,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at BrightPath Daycare. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $2,100 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000007', 'draft', '2026-07-07',
  NULL,
  NULL,
  NULL,
  1, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000008', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000008', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1002', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  5600, 67200, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":4760},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":840}]'::jsonb, 'Dear Tom Bradley,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Northgate Shopping Plaza. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $5,600 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000008', 'sent', '2026-07-07',
  '2026-06-16T21:01:49.666Z',
  NULL,
  NULL,
  0, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000009', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000009', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1003', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  3200, 38400, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":2720},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":480}]'::jsonb, 'Dear Dr. Kim Lee,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Pacific Dental Group. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $3,200 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000009', 'sent', '2026-07-07',
  '2026-06-14T21:01:49.666Z',
  NULL,
  NULL,
  0, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000010', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000010', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1004', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  7800, 93600, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":6630},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":1170}]'::jsonb, 'Dear Robert Hayes,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Metro Transit Authority. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $7,800 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000010', 'sent', '2026-07-07',
  '2026-06-12T21:01:49.666Z',
  NULL,
  NULL,
  0, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000011', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000011', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1005', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  4100, 49200, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":3485},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":615}]'::jsonb, 'Dear Amanda Wright,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Coastal Insurance Co. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $4,100 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000011', 'sent', '2026-07-07',
  '2026-06-10T21:01:49.666Z',
  NULL,
  NULL,
  0, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000012', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000012', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1006', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  5200, 62400, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":4420},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":780}]'::jsonb, 'Dear Chris Dalton,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Harbor View Apartments. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $5,200 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000012', 'sent', '2026-07-07',
  '2026-06-08T21:01:49.666Z',
  NULL,
  NULL,
  0, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000013', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000013', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1007', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  2900, 34800, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":2465},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":435}]'::jsonb, 'Dear Priya Sharma,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at TechStart Incubator. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $2,900 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000013', 'sent', '2026-07-07',
  '2026-06-06T21:01:49.666Z',
  NULL,
  NULL,
  0, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000014', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000014', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1008', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  3600, 43200, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":3060},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":540}]'::jsonb, 'Dear James O''Brien,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Valley Credit Union. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $3,600 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000014', 'sent', '2026-07-07',
  '2026-06-04T21:01:49.666Z',
  NULL,
  NULL,
  0, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000015', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000015', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1009', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  4400, 52800, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":3740},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":660}]'::jsonb, 'Dear Helen Park,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Sunrise Senior Living. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $4,400 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000015', 'opened', '2026-07-07',
  '2026-06-02T21:01:49.666Z',
  NULL,
  NULL,
  1, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000016', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000016', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1010', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  3100, 37200, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":2635},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":465}]'::jsonb, 'Dear Marcus Webb,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Urban Fitness Club. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $3,100 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000016', 'opened', '2026-07-07',
  '2026-05-31T21:01:49.667Z',
  NULL,
  NULL,
  1, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000017', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000017', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1011', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  6700, 80400, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":5695},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":1005}]'::jsonb, 'Dear Director Walsh,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at City Hall Annex. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $6,700 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000017', 'opened', '2026-07-07',
  '2026-05-29T21:01:49.667Z',
  NULL,
  NULL,
  1, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000018', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000018', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1012', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  3800, 45600, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":3230},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":570}]'::jsonb, 'Dear Sara Bloom,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at GreenLeaf Organic Market. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $3,800 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000018', 'opened', '2026-07-07',
  '2026-05-27T21:01:49.667Z',
  NULL,
  NULL,
  1, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000019', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000019', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1013', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  5900, 70800, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":5015},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":885}]'::jsonb, 'Dear Frank Miller,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Atlas Manufacturing. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $5,900 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000019', 'hot_lead', '2026-07-07',
  '2026-05-25T21:01:49.667Z',
  NULL,
  NULL,
  1, false
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000020', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000020', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1014', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  4500, 54000, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":3825},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":675}]'::jsonb, 'Dear Derek Chen,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Premier Auto Group. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $4,500 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000020', 'won', '2026-07-07',
  '2026-05-23T21:01:49.667Z',
  '2026-05-23T21:01:49.667Z',
  NULL,
  1, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000021', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000021', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1015', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  3700, 44400, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":3145},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":555}]'::jsonb, 'Dear Dr. Evans,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Westside Medical Clinic. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $3,700 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000021', 'won', '2026-07-07',
  '2026-05-21T21:01:49.667Z',
  '2026-05-21T21:01:49.667Z',
  NULL,
  1, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000022', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000022', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1016', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  9200, 110400, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":7820},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":1380}]'::jsonb, 'Dear Susan Grant,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Liberty Bank HQ. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $9,200 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000022', 'won', '2026-07-07',
  '2026-05-19T21:01:49.667Z',
  '2026-05-19T21:01:49.667Z',
  NULL,
  1, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000023', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000023', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1017', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  7100, 85200, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":6035},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":1065}]'::jsonb, 'Dear Michael Torres,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Cascade Hotel. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $7,100 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000023', 'won', '2026-07-07',
  '2026-05-17T21:01:49.667Z',
  '2026-05-17T21:01:49.667Z',
  NULL,
  1, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000024', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000024', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1018', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  3300, 39600, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":2805},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":495}]'::jsonb, 'Dear Kevin Walsh,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Pioneer Logistics. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $3,300 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000024', 'won', '2026-07-07',
  '2026-05-15T21:01:49.667Z',
  '2026-05-15T21:01:49.667Z',
  NULL,
  1, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000025', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000025', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1019', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  4800, 57600, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":4080},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":720}]'::jsonb, 'Dear Janet Cole,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Evergreen Office Park. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $4,800 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000025', 'won', '2026-07-07',
  '2026-05-13T21:01:49.667Z',
  '2026-05-13T21:01:49.667Z',
  NULL,
  1, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000026', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000026', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1020', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  2600, 31200, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":2210},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":390}]'::jsonb, 'Dear Paul Singh,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Ridgeview Apartments. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $2,600 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000026', 'won', '2026-07-07',
  '2026-05-11T21:01:49.667Z',
  '2026-05-11T21:01:49.667Z',
  NULL,
  1, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000027', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000027', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1021', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  5400, 64800, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":4590},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":810}]'::jsonb, 'Dear David Park,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Sterling Wealth Mgmt. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $5,400 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000027', 'won', '2026-07-07',
  '2026-05-09T21:01:49.667Z',
  '2026-05-09T21:01:49.667Z',
  NULL,
  1, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000028', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000028', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1022', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  4200, 50400, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":3570},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":630}]'::jsonb, 'Dear Principal Adams,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Oakwood Elementary. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $4,200 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000028', 'won', '2026-07-07',
  '2026-05-07T21:01:49.667Z',
  '2026-05-07T21:01:49.667Z',
  NULL,
  1, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000029', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000029', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1023', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  3500, 42000, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":2975},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":525}]'::jsonb, 'Dear Nina Patel,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at BlueStar Retail. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $3,500 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000029', 'won', '2026-07-07',
  '2026-05-05T21:01:49.667Z',
  '2026-05-05T21:01:49.667Z',
  NULL,
  1, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000030', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000030', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1024', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  6100, 73200, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":5185},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":915}]'::jsonb, 'Dear Alex Rivera,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Horizon Tech Campus. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $6,100 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000030', 'won', '2026-07-07',
  '2026-05-03T21:01:49.667Z',
  '2026-05-03T21:01:49.667Z',
  NULL,
  1, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000031', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000031', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1025', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  4900, 58800, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":4165},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":735}]'::jsonb, 'Dear Carlos Mendez,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Legacy Foods Inc. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $4,900 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000031', 'won', '2026-07-07',
  '2026-05-01T21:01:49.667Z',
  '2026-05-01T21:01:49.667Z',
  NULL,
  1, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000032', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000032', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1026', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  2700, 32400, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":2295},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":405}]'::jsonb, 'Dear Jake Morrison,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Old Town Brewery. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $2,700 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000032', 'lost', '2026-07-07',
  '2026-04-29T21:01:49.667Z',
  NULL,
  '2026-04-29T21:01:49.667Z',
  3, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000033', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000033', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1027', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  5100, 61200, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":4335},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":765}]'::jsonb, 'Dear Tony Russo,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at FastFreight Depot. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $5,100 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000033', 'lost', '2026-07-07',
  '2026-04-27T21:01:49.667Z',
  NULL,
  '2026-04-27T21:01:49.667Z',
  3, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000034', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000034', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1028', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  2400, 28800, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":2040},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":360}]'::jsonb, 'Dear Amy Cho,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Downtown Fitness. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $2,400 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000034', 'lost', '2026-07-07',
  '2026-04-25T21:01:49.667Z',
  NULL,
  '2026-04-25T21:01:49.667Z',
  3, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000035', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000035', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1029', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  3800, 45600, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":3230},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":570}]'::jsonb, 'Dear Rick Barnes,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Suburban Auto Parts. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $3,800 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000035', 'lost', '2026-07-07',
  '2026-04-23T21:01:49.667Z',
  NULL,
  '2026-04-23T21:01:49.667Z',
  3, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000036', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000036', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1030', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  1900, 22800, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":1615},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":285}]'::jsonb, 'Dear Pastor Ellis,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Community Church. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $1,900 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000036', 'lost', '2026-07-07',
  '2026-04-21T21:01:49.667Z',
  NULL,
  '2026-04-21T21:01:49.667Z',
  3, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000037', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000037', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1034', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  2200, 26400, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":1870},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":330}]'::jsonb, 'Dear Dan Foster,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at Budget Storage Co. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $2,200 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000037', 'lost', '2026-07-07',
  '2026-04-19T21:01:49.667Z',
  NULL,
  '2026-04-19T21:01:49.667Z',
  3, true
);
INSERT INTO proposals (id, company_id, prospect_id, created_by, proposal_number, version, services, visit_frequency, service_time, contract_duration, monthly_price, annual_price, discount_pct, line_items, executive_summary, scope_of_work, our_approach, differentiators, pricing_narrative, terms, next_steps, tracking_token, status, valid_until, sent_at, won_at, lost_at, follow_up_count, sequence_paused) VALUES (
  '00000000-0000-4000-8002-000000000038', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8001-000000000038', '00000000-0000-4000-8000-000000000002', 'CLN-2026-1032', 1,
  ARRAY['general_janitorial', 'restroom_sanitization'], '3x_week', 'after_hours', '12_months',
  1600, 19200, 7,
  '[{"service":"General Janitorial","frequency":"3x/week","monthlyCost":1360},{"service":"Restroom Sanitization","frequency":"3x/week","monthlyCost":240}]'::jsonb, 'Dear Linda Wu,

Thank you for considering SparkleClean Commercial Services for your commercial cleaning needs at QuickPrint Express. We understand the importance of maintaining a pristine, healthy environment for your team and visitors.', '{"Common Areas":["Vacuum and mop all hard floors","Dust surfaces and fixtures","Empty trash receptacles"],"Restrooms":["Sanitize fixtures and dispensers","Clean mirrors and countertops","Restock supplies"],"Offices":["Dust workstations","Vacuum carpeted areas","Clean interior glass"]}'::jsonb,
  ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], ARRAY['ISO-certified cleaning protocols', 'Dedicated account manager on every contract', '24/7 emergency response team'], 'Your monthly investment of $1,600 reflects the scope and frequency outlined herein.', 'Services commence upon signed agreement. 30-day cancellation notice. Net-15 payment terms.', 'Please review and reply to confirm. Valid for 14 days from issue date.',
  '00000000-0000-4000-8004-000000000038', 'lost', '2026-07-07',
  '2026-04-17T21:01:49.667Z',
  NULL,
  '2026-04-17T21:01:49.667Z',
  3, true
);
INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '00000000-0000-4000-8005-000000000001', '00000000-0000-4000-8002-000000000001', 'proposal_viewed', 'desktop', '2026-06-23T21:01:49.688Z'
);
INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '00000000-0000-4000-8005-000000000002', '00000000-0000-4000-8002-000000000001', 'proposal_viewed', 'mobile', '2026-06-23T20:01:49.688Z'
);
INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '00000000-0000-4000-8005-000000000003', '00000000-0000-4000-8002-000000000001', 'proposal_viewed', 'desktop', '2026-06-23T19:01:49.688Z'
);
INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '00000000-0000-4000-8005-000000000004', '00000000-0000-4000-8002-000000000001', 'proposal_viewed', 'mobile', '2026-06-23T18:01:49.688Z'
);
INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '00000000-0000-4000-8005-000000000019', '00000000-0000-4000-8002-000000000002', 'email_opened', 'desktop', '2026-06-23T20:01:49.688Z'
);
INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '00000000-0000-4000-8005-000000000149', '00000000-0000-4000-8002-000000000015', 'email_opened', 'desktop', '2026-06-23T20:01:49.689Z'
);
INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '00000000-0000-4000-8005-000000000159', '00000000-0000-4000-8002-000000000016', 'email_opened', 'desktop', '2026-06-23T20:01:49.689Z'
);
INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '00000000-0000-4000-8005-000000000169', '00000000-0000-4000-8002-000000000017', 'email_opened', 'desktop', '2026-06-23T20:01:49.689Z'
);
INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '00000000-0000-4000-8005-000000000179', '00000000-0000-4000-8002-000000000018', 'email_opened', 'desktop', '2026-06-23T20:01:49.689Z'
);
INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '00000000-0000-4000-8005-000000000181', '00000000-0000-4000-8002-000000000019', 'proposal_viewed', 'desktop', '2026-06-23T21:01:49.689Z'
);
INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '00000000-0000-4000-8005-000000000182', '00000000-0000-4000-8002-000000000019', 'proposal_viewed', 'mobile', '2026-06-23T20:01:49.689Z'
);
INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '00000000-0000-4000-8005-000000000183', '00000000-0000-4000-8002-000000000019', 'proposal_viewed', 'desktop', '2026-06-23T19:01:49.689Z'
);
INSERT INTO proposal_tracking_events (id, proposal_id, event_type, device_type, occurred_at) VALUES (
  '00000000-0000-4000-8005-000000000184', '00000000-0000-4000-8002-000000000019', 'proposal_viewed', 'mobile', '2026-06-23T18:01:49.689Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000001', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000001', 'hot_lead', 'Hot Lead Alert', 'Meridian Financial viewed your proposal 4× today', false, '2026-06-23T20:46:49.688Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000101', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000002', 'email_opened', 'Proposal Opened', 'CoreTech Office Park opened your proposal email', false, '2026-06-23T20:01:49.688Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000203', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000004', 'won', 'Deal Won!', 'Proposal CLN-2026-1033 marked as WON', true, '2026-06-20T21:01:49.662Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000114', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000015', 'email_opened', 'Proposal Opened', 'Sunrise Senior Living opened your proposal email', false, '2026-06-23T20:01:49.689Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000115', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000016', 'email_opened', 'Proposal Opened', 'Urban Fitness Club opened your proposal email', true, '2026-06-23T20:01:49.689Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000116', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000017', 'email_opened', 'Proposal Opened', 'City Hall Annex opened your proposal email', false, '2026-06-23T20:01:49.689Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000117', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000018', 'email_opened', 'Proposal Opened', 'GreenLeaf Organic Market opened your proposal email', false, '2026-06-23T20:01:49.689Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000019', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000019', 'hot_lead', 'Hot Lead Alert', 'Atlas Manufacturing viewed your proposal 4× today', false, '2026-06-23T20:46:49.689Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000219', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000020', 'won', 'Deal Won!', 'Proposal CLN-2026-1014 marked as WON', true, '2026-05-23T21:01:49.667Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000220', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000021', 'won', 'Deal Won!', 'Proposal CLN-2026-1015 marked as WON', true, '2026-05-21T21:01:49.667Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000221', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000022', 'won', 'Deal Won!', 'Proposal CLN-2026-1016 marked as WON', true, '2026-05-19T21:01:49.667Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000222', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000023', 'won', 'Deal Won!', 'Proposal CLN-2026-1017 marked as WON', true, '2026-05-17T21:01:49.667Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000223', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000024', 'won', 'Deal Won!', 'Proposal CLN-2026-1018 marked as WON', true, '2026-05-15T21:01:49.667Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000224', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000025', 'won', 'Deal Won!', 'Proposal CLN-2026-1019 marked as WON', true, '2026-05-13T21:01:49.667Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000225', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000026', 'won', 'Deal Won!', 'Proposal CLN-2026-1020 marked as WON', true, '2026-05-11T21:01:49.667Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000226', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000027', 'won', 'Deal Won!', 'Proposal CLN-2026-1021 marked as WON', true, '2026-05-09T21:01:49.667Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000227', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000028', 'won', 'Deal Won!', 'Proposal CLN-2026-1022 marked as WON', true, '2026-05-07T21:01:49.667Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000228', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000029', 'won', 'Deal Won!', 'Proposal CLN-2026-1023 marked as WON', true, '2026-05-05T21:01:49.667Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000229', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000030', 'won', 'Deal Won!', 'Proposal CLN-2026-1024 marked as WON', true, '2026-05-03T21:01:49.667Z'
);
INSERT INTO notifications (id, company_id, proposal_id, type, title, message, read, created_at) VALUES (
  '00000000-0000-4000-8006-000000000230', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8002-000000000031', 'won', 'Deal Won!', 'Proposal CLN-2026-1025 marked as WON', true, '2026-05-01T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000001', '00000000-0000-4000-8002-000000000001', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Meridian Financial', '<p>Hi Sarah Chen, just checking in on the cleaning proposal we sent.</p>', '2026-06-24T21:01:49.661Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000004', '00000000-0000-4000-8002-000000000004', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for The Grand Hotel Group', '<p>Hi Michael Torres, just checking in on the cleaning proposal we sent.</p>', '2026-06-18T21:01:49.662Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000015', '00000000-0000-4000-8002-000000000015', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Sunrise Senior Living', '<p>Hi Helen Park, just checking in on the cleaning proposal we sent.</p>', '2026-06-04T21:01:49.666Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000016', '00000000-0000-4000-8002-000000000016', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Urban Fitness Club', '<p>Hi Marcus Webb, just checking in on the cleaning proposal we sent.</p>', '2026-06-02T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000017', '00000000-0000-4000-8002-000000000017', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for City Hall Annex', '<p>Hi Director Walsh, just checking in on the cleaning proposal we sent.</p>', '2026-05-31T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000018', '00000000-0000-4000-8002-000000000018', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for GreenLeaf Organic Market', '<p>Hi Sara Bloom, just checking in on the cleaning proposal we sent.</p>', '2026-05-29T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000019', '00000000-0000-4000-8002-000000000019', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Atlas Manufacturing', '<p>Hi Frank Miller, just checking in on the cleaning proposal we sent.</p>', '2026-05-27T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000020', '00000000-0000-4000-8002-000000000020', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Premier Auto Group', '<p>Hi Derek Chen, just checking in on the cleaning proposal we sent.</p>', '2026-05-25T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000021', '00000000-0000-4000-8002-000000000021', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Westside Medical Clinic', '<p>Hi Dr. Evans, just checking in on the cleaning proposal we sent.</p>', '2026-05-23T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000022', '00000000-0000-4000-8002-000000000022', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Liberty Bank HQ', '<p>Hi Susan Grant, just checking in on the cleaning proposal we sent.</p>', '2026-05-21T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000023', '00000000-0000-4000-8002-000000000023', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Cascade Hotel', '<p>Hi Michael Torres, just checking in on the cleaning proposal we sent.</p>', '2026-05-19T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000024', '00000000-0000-4000-8002-000000000024', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Pioneer Logistics', '<p>Hi Kevin Walsh, just checking in on the cleaning proposal we sent.</p>', '2026-05-17T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000025', '00000000-0000-4000-8002-000000000025', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Evergreen Office Park', '<p>Hi Janet Cole, just checking in on the cleaning proposal we sent.</p>', '2026-05-15T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000026', '00000000-0000-4000-8002-000000000026', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Ridgeview Apartments', '<p>Hi Paul Singh, just checking in on the cleaning proposal we sent.</p>', '2026-05-13T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000027', '00000000-0000-4000-8002-000000000027', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Sterling Wealth Mgmt', '<p>Hi David Park, just checking in on the cleaning proposal we sent.</p>', '2026-05-11T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000028', '00000000-0000-4000-8002-000000000028', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Oakwood Elementary', '<p>Hi Principal Adams, just checking in on the cleaning proposal we sent.</p>', '2026-05-09T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000029', '00000000-0000-4000-8002-000000000029', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for BlueStar Retail', '<p>Hi Nina Patel, just checking in on the cleaning proposal we sent.</p>', '2026-05-07T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000030', '00000000-0000-4000-8002-000000000030', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Horizon Tech Campus', '<p>Hi Alex Rivera, just checking in on the cleaning proposal we sent.</p>', '2026-05-05T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000031', '00000000-0000-4000-8002-000000000031', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Legacy Foods Inc', '<p>Hi Carlos Mendez, just checking in on the cleaning proposal we sent.</p>', '2026-05-03T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000032', '00000000-0000-4000-8002-000000000032', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Old Town Brewery', '<p>Hi Jake Morrison, just checking in on the cleaning proposal we sent.</p>', '2026-05-01T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000033', '00000000-0000-4000-8002-000000000033', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for FastFreight Depot', '<p>Hi Tony Russo, just checking in on the cleaning proposal we sent.</p>', '2026-04-29T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000034', '00000000-0000-4000-8002-000000000034', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Downtown Fitness', '<p>Hi Amy Cho, just checking in on the cleaning proposal we sent.</p>', '2026-04-27T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000035', '00000000-0000-4000-8002-000000000035', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Suburban Auto Parts', '<p>Hi Rick Barnes, just checking in on the cleaning proposal we sent.</p>', '2026-04-25T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000036', '00000000-0000-4000-8002-000000000036', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Community Church', '<p>Hi Pastor Ellis, just checking in on the cleaning proposal we sent.</p>', '2026-04-23T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000037', '00000000-0000-4000-8002-000000000037', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for Budget Storage Co', '<p>Hi Dan Foster, just checking in on the cleaning proposal we sent.</p>', '2026-04-21T21:01:49.667Z'
);
INSERT INTO follow_up_logs (id, proposal_id, sequence_id, sequence_step, trigger_event, subject, body_html, sent_at) VALUES (
  '00000000-0000-4000-8007-000000000038', '00000000-0000-4000-8002-000000000038', '00000000-0000-4000-8003-000000000001', 1, 'not_opened_48h',
  'Quick check-in about the proposal for QuickPrint Express', '<p>Hi Linda Wu, just checking in on the cleaning proposal we sent.</p>', '2026-04-19T21:01:49.667Z'
);

-- =============================================================================
-- Seed complete: 38 proposals, 38 prospects
-- Demo login: sarah@sparkleclean.com (DEMO_MODE=true bypasses auth)
-- Demo company ID: 00000000-0000-4000-8000-000000000001
-- =============================================================================