# PRD: CleanProposal AI
## Automated Proposal Generation & Intelligent Follow-up System for Commercial Cleaning Companies

---

> **Document Classification:** Product Requirements Document — Demo Version  
> **Version:** 1.0.0  
> **Status:** APPROVED FOR DEMO BUILD  
> **Author:** Product & Engineering  
> **Last Updated:** June 2026

---

## Table of Contents

1. [Strategic Context & Decision Rationale](#1-strategic-context--decision-rationale)
2. [Problem Statement & Pain Classification](#2-problem-statement--pain-classification)
3. [Target User Profile](#3-target-user-profile)
4. [Product Vision & Positioning](#4-product-vision--positioning)
5. [Core Feature Scope](#5-core-feature-scope)
6. [Functional Requirements](#6-functional-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [Data Models](#8-data-models)
9. [User Flows](#9-user-flows)
10. [UI/UX Requirements](#10-uiux-requirements)
11. [API Contracts](#11-api-contracts)
12. [Demo Scope & Build Plan](#12-demo-scope--build-plan)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Out of Scope (v1 Demo)](#14-out-of-scope-v1-demo)
15. [Success Metrics](#15-success-metrics)
16. [Appendix: Industry Research & Pricing Intelligence](#16-appendix-industry-research--pricing-intelligence)

---

## 1. Strategic Context & Decision Rationale

### 1.1 The Central Decision: Follow-up Only vs. Proposal + Follow-up

Before defining scope, the foundational strategic question must be answered and locked in with rigorous justification.

**Option A — Follow-up System Only:**  
Build an automated email nurture/follow-up engine that triggers sequences after a proposal is manually sent.

**Option B — Proposal Generation + Follow-up System (SELECTED):**  
Build a unified system that generates AI-powered quotes AND auto-executes intelligent follow-up sequences.

### 1.2 Why Option A is a Losing Bet

| Factor | Reality |
|---|---|
| Market saturation | HubSpot, Pipedrive, Close.io, Mailchimp, Lemlist — all do automated follow-up sequences |
| Willingness to pay | Standalone follow-up tools are priced at $30–$80/mo and competing on commodity |
| Value perception | "Another follow-up tool" triggers instant mental comparison to tools they already own |
| Integration friction | They still have to create proposals manually — you've solved 40% of the problem |
| Competitive moat | Near zero — any developer can replicate a follow-up sequence engine |

### 1.3 Why Option B is the Winning Architecture

**The brutal truth about commercial cleaning sales:**

A cleaning company sales rep or owner creating a proposal manually goes through this:

1. Site walkthrough or client call → take notes
2. Open Excel or Word template (if they have one)
3. Calculate: sq footage × service type × visit frequency × labor rate × supply cost + overhead + margin
4. Write a scope of work paragraph
5. Format it into a presentable document
6. Email it manually from Gmail
7. Move on and **forget about it**

This process takes **45–90 minutes per proposal.** A company quoting 10 clients/week burns **8–15 hours/week** on proposal generation alone — before a single follow-up is sent.

**The compounded pain:**
- Slow proposal turnaround = prospects go cold or sign with a faster competitor
- Manual process = pricing inconsistency across reps
- Zero follow-up automation = 80%+ of warm leads die in silence
- No visibility = owner has no idea what's in the pipeline

**The financial hemorrhage this causes:**
- Average commercial cleaning contract: **$1,800–$12,000/year** (office buildings, medical, retail, industrial)
- Enterprise contracts (hospitals, warehouses): **$30K–$200K/year**
- If a company sends 10 proposals/week at avg $4,000/contract with 15% close rate = **$312K ARR**
- With systematic follow-up: industry data shows 2–3× conversion lift → **$624K–$936K ARR from same lead volume**
- The software literally prints money for them. That is the pitch.

**Why the combo creates an unbreakable value proposition:**

```
Pain Surface 1: "Creating proposals wastes half my week"
Pain Surface 2: "I send quotes and never hear back"

Combined Solution: Generate a professional, branded, accurate proposal 
in under 3 minutes → auto-track when it's opened → auto-execute 
intelligent follow-up sequences until they respond.

The system turns a 90-minute manual workflow into a 3-minute automated 
revenue engine. That's a 30× productivity improvement on the most 
critical step of their sales process.
```

**This is the only answer. The scope is locked: Proposal Generation + Follow-up Automation, unified.**

---

## 2. Problem Statement & Pain Classification

### 2.1 Pain Tier Framework

Pain is classified into three tiers based on urgency and willingness to pay:

| Tier | Description | WTP Signal |
|---|---|---|
| **Tier 1 — Critical Bleeding** | Active daily revenue loss; owner feels it viscerally | Will pay immediately, high price sensitivity to solving it |
| **Tier 2 — Operational Friction** | Significant time waste; recognized inefficiency | Will pay if ROI is clear and immediate |
| **Tier 3 — Nice-to-Have** | Acknowledged improvement but not urgent | Weak buying signal; avoid building to this tier |

### 2.2 Pain Map for Commercial Cleaning Companies

#### TIER 1 — CRITICAL BLEEDING PAINS (Build to these)

**Pain #1: Proposal Creation is Destroying Selling Time**
- Symptom: Sales reps/owners spend 1–2 hours per proposal
- Root Cause: No standardized quoting system; pricing lives in someone's head
- Financial Impact: 10 proposals/week = 10–20 hours lost; that's 25–50% of work week on admin
- Loophole: **The AI can calculate commercial cleaning rates accurately** based on sq footage, facility type, floor composition, restroom count, and service frequency — this is a solvable, bounded problem with known pricing parameters
- Emotional Hook: "Your best salespeople are becoming document formatters"

**Pain #2: Proposals Vanish Into a Black Hole**
- Symptom: Proposal sent → no response → rep assumes rejection → moves on
- Root Cause: No proposal tracking, no behavioral triggers, no follow-up discipline
- Financial Impact: Industry average — 80% of deals require 5+ follow-ups; most reps quit after 1
- Loophole: **Commercial cleaning is a considered purchase** — facility managers are comparing 3–5 vendors; the company that persists professionally wins
- Emotional Hook: "You're working hard to generate leads and then letting them die on the vine"

**Pain #3: Inconsistent Pricing Loses Deals and Margin**
- Symptom: Two reps quote the same job at wildly different prices
- Root Cause: No pricing engine; rates live in spreadsheets or tribal knowledge
- Financial Impact: Under-quoting erodes margin; over-quoting loses deals
- Loophole: **AI-enforced pricing logic** creates consistency and protects margin while staying competitive

#### TIER 2 — OPERATIONAL FRICTION PAINS (Support, don't lead with)

**Pain #4: No Pipeline Visibility**
- Symptom: Owner doesn't know how many proposals are out, at what stage, or what revenue is pending
- Impact: Can't forecast staffing, supplies, or cash flow

**Pain #5: Proposals Look Amateur**
- Symptom: Word docs or plain emails without branding, professional formatting, or clear scope breakdowns
- Impact: Losing deals to competitors with polished PDFs; prospect confidence is lower

**Pain #6: No CRM for Pre-Sale Prospects**
- Symptom: Prospects are tracked in spreadsheets, sticky notes, or not at all
- Impact: Duplicated outreach, missed follow-ups, no historical context

#### TIER 3 — NICE TO HAVE (Out of Scope for Demo)
- Contract e-signature integration
- Job scheduling post-win
- Client invoicing
- Crew management

### 2.3 The Insight That Changes the Pitch

> **The proposal is not just a document. It is the first impression of your operational competence.**

A cleaning company that sends a professional, itemized, branded proposal in under 15 minutes of the discovery call **signals to the prospect that they run a tight, professional operation.** That signal is worth more than the price.

This is the psychological lever. The software doesn't just save time — it **changes how their prospects perceive them.**

---

## 3. Target User Profile

### 3.1 Primary User — The Sales Owner/Manager

| Attribute | Detail |
|---|---|
| Company Size | 5–75 employees, $500K–$5M revenue |
| Title | Owner, Sales Manager, Business Development Rep |
| Tech Comfort | Low-to-medium; uses Gmail, maybe Jobber or Swept |
| Daily Reality | Wears multiple hats; sales, ops, sometimes cleaning |
| Buying Motivation | Revenue growth, time recovery, look more professional |
| Key Frustration | "I know I'm leaving money on the table but I don't have time to fix it" |
| Decision Authority | Full — they write the check |
| Ideal Demo Moment | When they see a professional proposal generated in under 3 minutes |

### 3.2 Secondary User — The Sales Rep

| Attribute | Detail |
|---|---|
| Role | Field sales, account manager |
| Goal | Close more deals, hit commission targets |
| Key Pain | Proposal creation kills their selling time |
| Success Signal | "This would save me 2 hours a day" |

### 3.3 Prospect Persona (The Facility Manager Being Pitched)

Understanding the *recipient* of the proposal matters for UX design:

| Attribute | Detail |
|---|---|
| Role | Facilities Manager, Office Manager, Property Manager |
| Decision Style | Comparison-driven; evaluating 3–5 vendors simultaneously |
| Annoyance | Generic proposals with no specificity to their facility |
| Trust Signal | Professional formatting, clear scope, transparent pricing |
| Response Pattern | Opens proposal, compares, waits 1–3 weeks before deciding |

---

## 4. Product Vision & Positioning

### 4.1 Product Vision Statement

> **CleanProposal AI** is the revenue infrastructure for commercial cleaning companies — turning their longest sales bottleneck (proposal creation + follow-up) into a 3-minute automated workflow that generates professional, accurate quotes and intelligently nurtures every prospect until they convert or explicitly decline.

### 4.2 Positioning Statement

**For** commercial cleaning company owners and sales teams  
**Who** are losing revenue to slow proposals and zero follow-up discipline,  
**CleanProposal AI** is the only AI-powered proposal and follow-up system  
**That** was built specifically for the commercial cleaning industry pricing model,  
**Unlike** generic CRMs or template builders  
**That** require hours of setup and generic follow-up sequences that don't reference the actual quote.

### 4.3 The One-Line Pitch

> "We turn your 90-minute proposal process into 3 minutes, then automatically follow up until they sign — or tell you no."

### 4.4 Competitive Differentiation

| Capability | CleanProposal AI | Generic CRM (HubSpot/Pipedrive) | Jobber/Swept |
|---|---|---|---|
| Cleaning-specific pricing engine | ✅ | ❌ | Partial |
| AI proposal generation from inputs | ✅ | ❌ | ❌ |
| Behavioral follow-up triggers | ✅ | Paid add-on | ❌ |
| Proposal open/view tracking | ✅ | Sales Hub ($$$) | ❌ |
| Industry-aware email sequences | ✅ | ❌ (generic) | ❌ |
| Revenue pipeline dashboard | ✅ | ✅ | Partial |
| Setup time | < 15 min | Days-weeks | Days |
| Price point | $97–$297/mo | $400–$800/mo | $49–$149/mo |

---

## 5. Core Feature Scope

### 5.1 Feature Modules — Demo Build

The demo includes **four interconnected modules** that demonstrate the full end-to-end sales workflow:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLEANPROPOSAL AI                             │
│                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │   MODULE 1      │    │   MODULE 2      │    │   MODULE 3      │ │
│  │   INTAKE &      │───▶│   PROPOSAL      │───▶│   DELIVERY &   │ │
│  │   QUOTING       │    │   GENERATION    │    │   TRACKING      │ │
│  └─────────────────┘    └─────────────────┘    └────────┬────────┘ │
│                                                          │          │
│                                                          ▼          │
│                         ┌─────────────────────────────────────┐    │
│                         │          MODULE 4                   │    │
│                         │   FOLLOW-UP AUTOMATION ENGINE       │    │
│                         │   + PIPELINE DASHBOARD              │    │
│                         └─────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Functional Requirements

### 6.1 Module 1 — Smart Intake & Quoting Engine

**FR-1.1: Guided Prospect Intake Form**

The system SHALL provide a multi-step intake form that collects all inputs required to generate an accurate proposal without any manual calculation.

**Form Steps:**

**Step 1 — Client Information**
```
Fields:
- Contact Full Name (required)
- Company/Business Name (required)  
- Email Address (required, validated)
- Phone Number (optional)
- Website (optional, used for company research)
```

**Step 2 — Facility Details**
```
Fields:
- Facility Type (dropdown):
    * Office Building / Corporate
    * Medical / Healthcare Facility
    * Retail Store / Shopping Center
    * Industrial / Warehouse
    * Educational Institution
    * Government / Municipal
    * Restaurant / Food Service
    * Gym / Fitness Center
    * Other (text field)
- Total Square Footage (number input with range: 500–500,000 sq ft)
- Number of Floors (number)
- Number of Restrooms (number)
- Floor Type Composition (%):
    * Hardwood/Laminate %
    * Carpet %
    * Tile/Concrete %
- Does the facility have a kitchen/break room? (Yes/No)
- Special Areas (multi-select): Server rooms, Clean rooms, Lobbies, Elevators, Parking garage
```

**Step 3 — Service Configuration**
```
Fields:
- Service Type (multi-select):
    * General Janitorial (floors, surfaces, trash)
    * Restroom Sanitization
    * Floor Care (waxing, buffing, stripping)
    * Carpet Cleaning
    * Window Washing (interior)
    * Window Washing (exterior)
    * Pressure Washing
    * Post-Construction Cleanup
    * Deep / One-Time Clean
    
- Visit Frequency:
    * Daily (5x/week)
    * 3x per week
    * 2x per week  
    * Weekly
    * Bi-weekly
    * Monthly
    * One-Time
    
- Preferred Service Time:
    * During Business Hours
    * After Hours (evenings)
    * Weekends Only
    * Flexible
    
- Contract Duration:
    * Month-to-Month
    * 6 Months
    * 12 Months (recommended — price incentive)
    * 24 Months
```

**Step 4 — Customization**
```
Fields:
- Special Instructions / Notes (text area)
- Urgency: When do they need service to start? (date picker)
- How did they hear about you? (dropdown — for analytics)
- Discount / Promotional Code (optional)
```

**FR-1.2: Real-Time Price Preview**

As the user completes the form, the system SHALL display a real-time estimated price range that updates dynamically. This serves as an internal sanity check before generating the formal proposal.

**FR-1.3: Pricing Engine Logic**

The system SHALL calculate proposals using the following industry-standard pricing formula:

```
BASE CALCULATION:
─────────────────────────────────────────────
Base Rate = Sq Footage × Facility Rate Multiplier
Labor Hours = Base Rate / Productivity Rate
Labor Cost = Labor Hours × Hourly Labor Rate
Supply Cost = Sq Footage × Supply Cost Per SqFt
Overhead = (Labor Cost + Supply Cost) × Overhead %
Subtotal = Labor Cost + Supply Cost + Overhead
Margin = Subtotal × Target Margin %
Visit Price = Subtotal + Margin

MONTHLY PRICE = Visit Price × Visits Per Month
─────────────────────────────────────────────

FACILITY RATE MULTIPLIERS (per sq ft per visit):
- Office (standard): $0.07–$0.12
- Medical/Healthcare: $0.12–$0.18 (higher due to sanitization standards)
- Industrial/Warehouse: $0.04–$0.08
- Retail: $0.08–$0.13
- Restaurant: $0.10–$0.16

FLOOR TYPE ADJUSTMENTS:
- Carpet: +15% labor (vacuuming time)
- Hardwood/Laminate: Standard
- Tile: Standard
- Mixed: Weighted average

RESTROOM MULTIPLIER:
- Per restroom, per visit: $8–$20 depending on facility type

FREQUENCY DISCOUNT:
- Daily: -5% (volume)
- 3x/week: Standard
- Weekly: +8%
- Bi-weekly: +15%
- Monthly: +25%

CONTRACT TERM DISCOUNT:
- Month-to-Month: Standard
- 6-Month: -3%
- 12-Month: -7%
- 24-Month: -12%

ALL RATES CONFIGURABLE by admin (Settings panel)
```

---

### 6.2 Module 2 — AI Proposal Generation

**FR-2.1: AI-Powered Proposal Content Generation**

Upon form submission, the system SHALL invoke the Claude API (claude-sonnet-4-6) to generate the following proposal sections:

1. **Executive Summary** — Personalized opening paragraph addressing the prospect's specific facility, their implied priorities based on facility type, and a brief value statement
2. **Scope of Work** — Detailed, facility-specific scope broken into areas (common areas, restrooms, offices, special areas) with explicit task descriptions per visit
3. **Our Approach** — 3–4 bullet points describing methodology, quality assurance, and compliance (OSHA, EPA-compliant products, etc.)
4. **Why Choose Us** — 2–3 differentiating points (configurable based on company profile)
5. **Pricing Summary** — Structured line-item table (see FR-2.3)
6. **Terms & Conditions** — Standard commercial cleaning contract terms (configurable)
7. **Next Steps** — Clear CTA with acceptance deadline

**FR-2.2: Proposal Personalization Variables**

The AI generation prompt SHALL incorporate:
- Prospect's company name and contact name (salutation personalization)
- Facility type and specific characteristics from intake form
- Service configuration and frequency
- Any special notes entered during intake
- The cleaning company's name, tagline, and contact info (from company profile)

**FR-2.3: Proposal Output Format**

The system SHALL generate a professional PDF proposal with the following layout:

```
PAGE 1 — COVER PAGE
─────────────────────────────────────────────────────
[Company Logo]                    [Date]

COMMERCIAL CLEANING PROPOSAL
Prepared for: [Prospect Company Name]
[Prospect Address if provided]

Prepared by: [Cleaning Company Name]
[Contact Info]
[Proposal #: CLN-2024-XXXX]
Valid Until: [Date + 14 days]
─────────────────────────────────────────────────────

PAGE 2 — EXECUTIVE SUMMARY & SCOPE OF WORK
─────────────────────────────────────────────────────
Dear [Contact Name],

[AI-Generated executive summary paragraph]

SCOPE OF WORK
─────────────────────────────────────────────────────
[AI-generated detailed scope by area]

PAGE 3 — PRICING BREAKDOWN
─────────────────────────────────────────────────────
Service               Frequency    Monthly Cost
─────────────────     ─────────    ────────────
General Janitorial    3x/week      $X,XXX.00
Restroom Service      3x/week      Included
Floor Care            Monthly      $XXX.00
─────────────         ─────────    ────────────
                      MONTHLY TOTAL: $X,XXX.00
                      ANNUAL VALUE:  $XX,XXX.00
                      
[Contract term note, discount applied if applicable]

PAGE 4 — TERMS & NEXT STEPS
─────────────────────────────────────────────────────
[Standard terms]
[Accept button if digital / signature line if printed]
```

**FR-2.4: Proposal Preview**

Before sending, the user SHALL be able to preview the full proposal in a browser-based modal. The user can make inline edits to any text field.

**FR-2.5: Proposal Versioning**

Each saved proposal SHALL have a version number. If a proposal is revised and resent, it creates v2, v3, etc. — and the system tracks which version the prospect viewed.

---

### 6.3 Module 3 — Proposal Delivery & Tracking

**FR-3.1: Email Delivery**

The system SHALL send the proposal via email with:
- Personalized subject line (AI-generated): e.g., "Commercial Cleaning Proposal for [Company] — [Sq Footage] sq ft [Facility Type]"
- Personalized body email with key pricing summary highlight
- PDF attachment OR trackable web link to proposal (both options available)
- From: The cleaning company's email (via SMTP configuration or SendGrid)

**FR-3.2: Proposal Open Tracking**

The system SHALL track:
- **Email Open:** 1×1 pixel beacon in email body records when email is opened (timestamp, device, approximate location)
- **Proposal View:** When the proposal link is clicked, server logs the view with full analytics
- **Time on Page:** How long the prospect spent reading the proposal (page-level, using JS heartbeat)
- **Return Visits:** Tracks when the same prospect returns to view the proposal again (strong buying signal)
- **Section Engagement:** Which sections were scrolled through (pricing section view is high-signal)

**FR-3.3: Real-Time Notification Triggers**

When a tracking event occurs, the system SHALL immediately notify the sales rep via:
- In-app notification badge
- Optional: Email alert to rep ("Your proposal to [Company] was just opened!")
- Optional: SMS alert (via Twilio) for high-signal events (multiple views in same day)

**FR-3.4: Proposal Status States**

Each proposal SHALL have a clearly defined status:

```
DRAFT → SENT → OPENED → VIEWED_PRICING → HOT_LEAD → WON / LOST / EXPIRED
         │
         └─ NOT_OPENED (after 48h)
```

Status transitions SHALL trigger the appropriate follow-up sequence (see Module 4).

---

### 6.4 Module 4 — Intelligent Follow-up Automation Engine

**FR-4.1: Follow-up Sequence Architecture**

The system SHALL support behavior-triggered follow-up sequences with the following branching logic:

```
PROPOSAL SENT
      │
      ├─── [48h] Email NOT Opened ──────────────────────────────────►
      │                                                    SEQ-A: "Gentle Nudge"
      │                                                    (Did you receive my proposal?)
      │                                                    
      ├─── [24h] Email Opened, No Reply ───────────────────────────►
      │                                                    SEQ-B: "Value Follow-up"  
      │                                                    (Address common objections,
      │                                                     highlight specific benefit
      │                                                     for their facility type)
      │
      ├─── [Same Day] Proposal Viewed 3+ Times ────────────────────►
      │                                                    SEQ-C: "HOT ALERT"
      │                                                    (Rep notified immediately;
      │                                                     auto-email sent within 1h
      │                                                     with urgency/bonus offer)
      │
      └─── [7 Days] No Response at All ───────────────────────────►
                                                           SEQ-D: "Final Attempt"
                                                           (Personalized breakup email
                                                            — highest reply rate)
```

**FR-4.2: AI-Generated Follow-up Email Content**

Each follow-up email SHALL be generated by Claude API with:
- Reference to the specific proposal (company name, scope, price)
- Sequence-appropriate tone (curious → value-add → urgent → breakup)
- The prospect's facility type referenced naturally
- Clear CTA in each email

**Default Sequence Templates:**

**SEQ-A (Day 2 — Not Opened):**
> Subject: "Quick check-in — Proposal for [Company Name]"
> Body: Reference the proposal, confirm they received it, offer to answer questions or schedule a quick call. Keep it short (3 sentences max).

**SEQ-B (Day 3 — Opened, No Reply):**
> Subject: "One thing [Company Name]'s cleaning company should know"
> Body: Relevant insight for their facility type (e.g., for medical: "HIPAA-compliant cleaning protocols we follow") + soft CTA to schedule a walkthrough.

**SEQ-C (Same-day — Multiple Views):**
> Subject: "Are you ready to move forward?"
> Body: "I noticed you've taken a close look at the proposal. I'd love to answer any remaining questions. Can we connect for a 10-minute call this week?"

**SEQ-D (Day 7 — No Response):**
> Subject: "Should I close your file?"
> Body: The "breakup email" — classic high-performing format: "I've reached out a few times. If the timing isn't right or you've gone in a different direction, no worries at all. Just let me know and I'll stop following up." (This triggers the most replies.)

**FR-4.3: Sequence Management**

- Each sequence SHALL have configurable timing (hours/days after trigger)
- Sequences SHALL pause automatically when prospect replies to any email
- Sequences SHALL pause if prospect is marked WON or LOST manually
- Maximum follow-up depth: 5 emails per prospect (configurable)
- Rep can manually override, pause, or add a note to any sequence step

**FR-4.4: Pipeline Dashboard**

The system SHALL display a real-time sales pipeline with:

**Kanban View:**
```
[DRAFT] → [SENT] → [OPENED] → [HOT LEAD] → [WON] → [LOST/EXPIRED]
  3           8         5            2          12        7
$14,200    $42,000   $28,500      $9,800     $52,400   $31,000
```

**List View (sortable table):**
```
Columns:
- Company Name
- Contact Name  
- Proposal #
- Amount (Monthly)
- Annual Value
- Status
- Sent Date
- Last Activity
- Follow-up #
- Next Action
- Actions (View / Edit / Mark Won / Mark Lost)
```

**Analytics Panel:**
- Total proposals sent (this week / month / all time)
- Open rate (%)
- Conversion rate (%)
- Average proposal value
- Revenue won (month / quarter)
- Pipeline value (total active proposals × monthly value × 12)
- Average days to close

---

## 7. Technical Architecture

### 7.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                 │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                    Next.js 14 (App Router)                      │  │
│   │           TypeScript + Tailwind CSS + shadcn/ui                 │  │
│   └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             API LAYER                                   │
│                                                                         │
│   ┌─────────────────┐  ┌─────────────────┐  ┌───────────────────────┐ │
│   │  Next.js API    │  │  Webhooks        │  │  Background Jobs      │ │
│   │  Routes         │  │  (Tracking)      │  │  (Follow-up Engine)   │ │
│   │  /api/v1/...    │  │  /api/track/...  │  │  (Cron / Queue)       │ │
│   └─────────────────┘  └─────────────────┘  └───────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                      ┌─────────────┼─────────────┐
                      ▼             ▼              ▼
┌──────────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐
│  ANTHROPIC   │  │ SUPABASE │  │  RESEND   │  │   CLOUDFLARE R2      │
│  CLAUDE API  │  │ PostgreSQL│  │  (Email)  │  │  (PDF Storage)       │
│  Proposal    │  │ + Auth   │  │           │  │                      │
│  Generation  │  │ + RLS    │  │           │  │                      │
└──────────────┘  └──────────┘  └───────────┘  └──────────────────────┘
```

### 7.2 Tech Stack — Production Demo

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | Next.js 14 (App Router) | SSR for proposal preview; fast iteration; Vercel deploy |
| **Language** | TypeScript | Type safety, maintainability |
| **Styling** | Tailwind CSS + shadcn/ui | Professional UI, rapid development |
| **Database** | Supabase (PostgreSQL) | Auth included, real-time subscriptions, RLS, generous free tier |
| **ORM** | Prisma | Type-safe queries, schema migrations |
| **AI Engine** | Anthropic Claude API (claude-sonnet-4-6) | Best-in-class content generation; structured output |
| **PDF Generation** | Puppeteer + custom HTML template | Full layout control, pixel-perfect output |
| **Email Delivery** | Resend | Developer-first, best deliverability, React Email templates |
| **File Storage** | Supabase Storage or Cloudflare R2 | PDF hosting for trackable links |
| **Background Jobs** | Vercel Cron + Supabase Edge Functions | Follow-up scheduling without extra infrastructure |
| **Email Tracking** | Custom 1×1 pixel + signed link tracking | No third-party dependency |
| **Authentication** | Supabase Auth | Built-in; supports multi-user (owner + reps) |
| **Deployment** | Vercel | Zero-config, preview deployments, edge network |
| **Monitoring** | Vercel Analytics + Supabase Logs | Observability without overhead |

### 7.3 AI Integration Architecture

**Proposal Generation Flow:**

```
User submits intake form
        │
        ▼
API Route: POST /api/v1/proposals/generate
        │
        ▼
┌───────────────────────────────────────────────┐
│            PROMPT BUILDER SERVICE              │
│                                               │
│  1. Load company profile (name, logo, USPs)   │
│  2. Load prospect data from form              │
│  3. Calculate pricing using pricing engine    │
│  4. Build structured system prompt            │
│  5. Build user prompt with all variables      │
└───────────────────────────────────────────────┘
        │
        ▼
Claude API: claude-sonnet-4-6
System: "You are a professional proposal writer 
         specialized in commercial cleaning services..."
User:   [Structured intake data + pricing data + 
         company profile + output format instructions]
        │
        ▼
┌───────────────────────────────────────────────┐
│            RESPONSE PARSER                     │
│                                               │
│  Parse JSON response containing:             │
│  - executive_summary: string                 │
│  - scope_of_work: object (by area)           │
│  - our_approach: string[]                    │
│  - differentiators: string[]                 │
│  - pricing_narrative: string                 │
│  - terms: string                             │
│  - next_steps: string                        │
└───────────────────────────────────────────────┘
        │
        ▼
PDF Generator (Puppeteer)
        │
        ▼
Upload to Storage → Generate trackable URL
        │
        ▼
Save proposal to database → Return proposal ID
```

**Follow-up Email Generation Flow:**

```
Cron Job fires / Tracking event triggers
        │
        ▼
Check: Does this proposal qualify for next follow-up?
  - Is it within the sequence timing window?
  - Has prospect replied?
  - Has max follow-up count been reached?
        │
        ▼ (YES — send follow-up)
Load: Proposal details + follow-up sequence config + previous emails sent
        │
        ▼
Claude API: Generate personalized follow-up email
  - Sequence type (A/B/C/D)
  - Prospect name + company
  - Proposal specifics (price, scope)
  - Previous follow-up count
        │
        ▼
Resend: Send email → Log in follow_up_logs table
```

---

## 8. Data Models

### 8.1 Database Schema

```sql
-- ─────────────────────────────────────────────────
-- COMPANIES (the cleaning companies using our app)
-- ─────────────────────────────────────────────────
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
  -- Pricing configuration
  base_labor_rate   DECIMAL(10,2) DEFAULT 22.00,  -- hourly
  overhead_pct      DECIMAL(5,2)  DEFAULT 25.00,   -- %
  target_margin_pct DECIMAL(5,2)  DEFAULT 30.00,   -- %
  -- Email configuration
  smtp_from_email   TEXT,
  smtp_from_name    TEXT,
  resend_api_key    TEXT,
  -- Differentiators (for AI proposals)
  differentiators   TEXT[],
  certifications    TEXT[],
  -- Meta
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- USERS (reps/owners within a company)
-- ─────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id),
  company_id    UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT DEFAULT 'rep',  -- 'owner' | 'rep'
  phone         TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- PROSPECTS
-- ─────────────────────────────────────────────────
CREATE TABLE prospects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
  assigned_to     UUID REFERENCES users(id),
  -- Contact info
  full_name       TEXT NOT NULL,
  business_name   TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  website         TEXT,
  -- Facility details
  facility_type   TEXT NOT NULL,
  square_footage  INTEGER NOT NULL,
  num_floors      INTEGER DEFAULT 1,
  num_restrooms   INTEGER DEFAULT 1,
  floor_carpet_pct     INTEGER DEFAULT 0,
  floor_hardwood_pct   INTEGER DEFAULT 0,
  floor_tile_pct       INTEGER DEFAULT 100,
  has_kitchen     BOOLEAN DEFAULT false,
  special_areas   TEXT[],
  -- Notes
  notes           TEXT,
  source          TEXT,  -- how they heard about us
  -- Status
  status          TEXT DEFAULT 'active',  -- 'active' | 'won' | 'lost' | 'archived'
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- PROPOSALS
-- ─────────────────────────────────────────────────
CREATE TABLE proposals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID REFERENCES companies(id) ON DELETE CASCADE,
  prospect_id         UUID REFERENCES prospects(id) ON DELETE CASCADE,
  created_by          UUID REFERENCES users(id),
  proposal_number     TEXT NOT NULL UNIQUE,  -- CLN-2024-0001
  version             INTEGER DEFAULT 1,
  -- Services & configuration
  services            TEXT[] NOT NULL,
  visit_frequency     TEXT NOT NULL,
  service_time        TEXT,
  contract_duration   TEXT DEFAULT '12_months',
  start_date          DATE,
  -- Pricing
  monthly_price       DECIMAL(10,2) NOT NULL,
  annual_price        DECIMAL(10,2) NOT NULL,
  discount_pct        DECIMAL(5,2) DEFAULT 0,
  line_items          JSONB NOT NULL,  -- array of {service, frequency, monthly_cost}
  -- AI-generated content
  executive_summary   TEXT,
  scope_of_work       JSONB,           -- {area: [tasks]}
  our_approach        TEXT[],
  differentiators     TEXT[],
  pricing_narrative   TEXT,
  terms               TEXT,
  next_steps          TEXT,
  -- Files
  pdf_url             TEXT,
  tracking_token      TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  -- Status
  status              TEXT DEFAULT 'draft',
    -- 'draft' | 'sent' | 'opened' | 'viewed_pricing' | 'hot_lead' | 'won' | 'lost' | 'expired'
  valid_until         DATE,
  sent_at             TIMESTAMPTZ,
  won_at              TIMESTAMPTZ,
  lost_at             TIMESTAMPTZ,
  lost_reason         TEXT,
  -- Meta
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- PROPOSAL TRACKING EVENTS
-- ─────────────────────────────────────────────────
CREATE TABLE proposal_tracking_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id     UUID REFERENCES proposals(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
    -- 'email_opened' | 'proposal_viewed' | 'pricing_viewed' | 'link_clicked' | 'download'
  ip_address      TEXT,
  user_agent      TEXT,
  device_type     TEXT,    -- 'mobile' | 'desktop' | 'tablet'
  city            TEXT,
  country         TEXT,
  duration_seconds INTEGER,  -- time spent on proposal
  metadata        JSONB,
  occurred_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- FOLLOW-UP SEQUENCES (templates)
-- ─────────────────────────────────────────────────
CREATE TABLE follow_up_sequences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  trigger_event   TEXT NOT NULL,
    -- 'not_opened_48h' | 'opened_no_reply_24h' | 'viewed_3x' | 'no_response_7d'
  delay_hours     INTEGER NOT NULL,
  sequence_order  INTEGER NOT NULL,
  subject_prompt  TEXT NOT NULL,   -- prompt for AI subject generation
  body_prompt     TEXT NOT NULL,   -- prompt for AI body generation
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────
-- FOLLOW-UP LOGS (sent emails)
-- ─────────────────────────────────────────────────
CREATE TABLE follow_up_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id     UUID REFERENCES proposals(id) ON DELETE CASCADE,
  sequence_id     UUID REFERENCES follow_up_sequences(id),
  sequence_step   INTEGER NOT NULL,
  subject         TEXT NOT NULL,
  body_html       TEXT NOT NULL,
  sent_at         TIMESTAMPTZ DEFAULT NOW(),
  opened_at       TIMESTAMPTZ,
  replied_at      TIMESTAMPTZ,
  resend_email_id TEXT  -- reference from Resend API
);

-- ─────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────
CREATE INDEX idx_proposals_company ON proposals(company_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_tracking_token ON proposals(tracking_token);
CREATE INDEX idx_tracking_events_proposal ON proposal_tracking_events(proposal_id);
CREATE INDEX idx_follow_up_logs_proposal ON follow_up_logs(proposal_id);
CREATE INDEX idx_prospects_company ON prospects(company_id);
```

---

## 9. User Flows

### 9.1 Primary Flow — Generate & Send Proposal

```
1. Rep logs into CleanProposal AI dashboard
        │
2. Clicks "New Proposal" button
        │
3. Completes 4-step intake form (Prospect → Facility → Services → Custom)
        │
4. System shows real-time price estimate preview
        │
5. Rep clicks "Generate Proposal"
        │
6. Loading screen: "Generating your professional proposal..." (5–10 seconds)
        │
7. Proposal preview displays in full-screen modal
   - Rep can edit any section inline
   - Rep can adjust pricing (override)
        │
8. Rep clicks "Send Proposal"
        │
9. Email composer modal appears:
   - Pre-filled personalized subject line (AI-generated)
   - Pre-filled personalized email body
   - PDF attached OR link selected
   - Rep can edit before sending
        │
10. Clicks "Send Now" → Email delivered via Resend
        │
11. Proposal status → SENT
    Follow-up sequence armed and counting
        │
12. Rep sees proposal appear in pipeline dashboard
```

### 9.2 Tracking Event Flow

```
Prospect opens email
        │
Tracking pixel fires → POST /api/track/email-open?token={tracking_token}
        │
System records event → Updates proposal status to OPENED
        │
Rep receives in-app notification: "📧 [Company] opened your proposal!"
        │
If viewed_count >= 3 within 24h → Status = HOT_LEAD
        │
Rep receives urgent notification: "🔥 [Company] is hot — viewed 3x today"
        │
System triggers SEQ-C immediately (within 1 hour)
```

### 9.3 Follow-up Automation Flow

```
Cron Job: Runs every 30 minutes
        │
        ├── Query: All proposals in SENT/OPENED status
        │
        ├── For each proposal:
        │     Check: Time since sent
        │     Check: Tracking events
        │     Check: Last follow-up sent
        │     Check: Follow-ups sent count
        │
        ├── Evaluate trigger conditions:
        │     - 48h passed, email never opened → Trigger SEQ-A
        │     - 24h passed, opened but no reply → Trigger SEQ-B
        │     - viewed_count >= 3 → Trigger SEQ-C (one-time)
        │     - 7d passed, no response → Trigger SEQ-D
        │
        └── For each qualified follow-up:
              → Call Claude API to generate personalized email
              → Send via Resend
              → Log in follow_up_logs
              → Update proposal.follow_up_count
```

---

## 10. UI/UX Requirements

### 10.1 Design Principles

1. **Zero Cognitive Load** — Every action should be self-evident. No training required.
2. **Data-First Dashboard** — The pipeline state should be visible at a glance.
3. **Speed Perception** — Proposal generation takes 5–10 seconds; use animated skeleton states and progress indicators to make it feel fast and impressive.
4. **Professional Aesthetics** — The software must look more premium than anything they currently use. This is part of the pitch. If the software looks cheap, the prospect won't believe it will make them look professional.
5. **Mobile-Aware** — Sales reps may generate proposals on tablets or phones after a site visit.

### 10.2 Color Palette & Brand

```
Primary:      #1E40AF  (Deep Blue — trust, professionalism)
Accent:       #059669  (Emerald Green — growth, cleanliness)
Warning:      #D97706  (Amber — follow-up alerts, hot leads)
Danger:       #DC2626  (Red — lost deals, expired)
Background:   #F8FAFC  (Off-white)
Surface:      #FFFFFF
Text Primary: #0F172A
Text Muted:   #64748B
Border:       #E2E8F0
```

### 10.3 Page Structure

**Page: Dashboard (Root)**
```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] CleanProposal AI        [Notifications 🔔]  [User Menu]  │
├─────────────────────────────────────────────────────────────────┤
│ [Dashboard] [Proposals] [Prospects] [Analytics] [Settings]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ PIPELINE OVERVIEW                    [+ New Proposal]          │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│ │ Draft  │ │  Sent  │ │Opened │ │Hot 🔥  │ │  Won  │       │
│ │   3    │ │   8    │ │   5   │ │   2   │ │  12  │       │
│ │$14,200 │ │$42,000 │ │$28,500│ │$9,800 │ │$52,400│       │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                                 │
│ RECENT ACTIVITY                    THIS MONTH                   │
│ ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│ │ 📧 Acme Corp opened your   │  │ Proposals Sent:    23    │  │
│ │    proposal (2 min ago)    │  │ Open Rate:         67%   │  │
│ │ 🔥 Tech Hub viewed 4x     │  │ Conversion Rate:   22%   │  │
│ │ ✅ Green Office — WON!    │  │ Revenue Won:   $42,600   │  │
│ └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                 │
│ PROPOSALS TABLE                                                 │
│ [sortable, filterable table with all proposals]                 │
└─────────────────────────────────────────────────────────────────┘
```

**Page: New Proposal — Step Indicator**
```
Step 1 ●─────── Step 2 ○─────── Step 3 ○─────── Step 4 ○
 Client         Facility         Services         Custom
```

**Page: Proposal Preview Modal**
```
┌────────────────────────────────────────────────────────────┐
│ PROPOSAL PREVIEW           [Edit]  [Send]  [Download PDF]  │
├────────────────────────────────────────────────────────────┤
│ [Full proposal rendered in clean HTML — mimics PDF layout] │
│                                                            │
│ Live pricing calculator on right:                          │
│ ┌───────────────────────────────┐                         │
│ │ Monthly:   $2,400             │                         │
│ │ Annual:    $28,800            │                         │
│ │ [Adjust Frequency ▼]          │                         │
│ │ [Contract Term ▼]             │                         │
│ └───────────────────────────────┘                         │
└────────────────────────────────────────────────────────────┘
```

---

## 11. API Contracts

### 11.1 Core Endpoints

```
POST   /api/v1/proposals/generate        Generate proposal (AI + pricing)
GET    /api/v1/proposals/:id             Get single proposal
GET    /api/v1/proposals                 List all proposals (with filters)
PATCH  /api/v1/proposals/:id             Update proposal (status, edits)
POST   /api/v1/proposals/:id/send        Send proposal email
POST   /api/v1/proposals/:id/resend      Resend with new version

GET    /api/v1/prospects                 List all prospects
POST   /api/v1/prospects                 Create prospect
PATCH  /api/v1/prospects/:id            Update prospect

GET    /api/track/email?token=:token     Email open pixel (1x1 gif + log)
GET    /api/track/view/:token            Proposal view tracking (redirect to PDF/page + log)
POST   /api/track/heartbeat             Time-on-page beacon

GET    /api/v1/analytics/pipeline       Pipeline totals by status
GET    /api/v1/analytics/monthly        Monthly performance metrics

GET    /api/v1/settings/company         Get company profile
PATCH  /api/v1/settings/company         Update company profile + pricing config
GET    /api/v1/settings/sequences       Get follow-up sequence templates
PATCH  /api/v1/settings/sequences/:id   Update sequence template
```

### 11.2 Proposal Generate Request/Response

```typescript
// POST /api/v1/proposals/generate

interface GenerateProposalRequest {
  prospect: {
    fullName: string;
    businessName: string;
    email: string;
    phone?: string;
  };
  facility: {
    type: FacilityType;
    squareFootage: number;
    numFloors: number;
    numRestrooms: number;
    floorCarpetPct: number;
    floorHardwoodPct: number;
    floorTilePct: number;
    hasKitchen: boolean;
    specialAreas: string[];
  };
  services: {
    types: ServiceType[];
    visitFrequency: VisitFrequency;
    serviceTime: ServiceTime;
    contractDuration: ContractDuration;
    startDate?: string;
  };
  customization: {
    notes?: string;
    discountPct?: number;
  };
}

interface GenerateProposalResponse {
  proposalId: string;
  proposalNumber: string;
  pricing: {
    monthlyPrice: number;
    annualPrice: number;
    lineItems: LineItem[];
    discountApplied: number;
  };
  content: {
    executiveSummary: string;
    scopeOfWork: Record<string, string[]>;
    ourApproach: string[];
    differentiators: string[];
    pricingNarrative: string;
    terms: string;
    nextSteps: string;
  };
  pdfUrl: string;
  trackingToken: string;
  status: 'draft';
}
```

---

## 12. Demo Scope & Build Plan

### 12.1 Demo Objectives

The demo must accomplish **three things** in under 5 minutes of runtime:

1. **The "WOW" moment** — Show a complete, professional proposal generated from a form in under 10 seconds. This is the hook.
2. **The "Aha" moment** — Show the pipeline dashboard with tracking events, follow-up status, and revenue numbers. This shows the system works end-to-end.
3. **The "Close" moment** — Show the follow-up email that references the prospect's actual proposal data. This seals the deal.

### 12.2 Demo Build Phases

**Phase 1 — Foundation (Days 1–3)**
- [ ] Initialize Next.js 14 project with TypeScript + Tailwind + shadcn/ui
- [ ] Set up Supabase project: schema, RLS policies, seed data
- [ ] Implement authentication (Supabase Auth)
- [ ] Company onboarding flow (name, logo, pricing defaults)
- [ ] Basic routing structure: Dashboard → Proposals → Settings

**Phase 2 — Intake & Pricing Engine (Days 4–6)**
- [ ] Build 4-step intake form with step indicator
- [ ] Implement client-side form validation (zod)
- [ ] Build pricing engine (TypeScript service)
- [ ] Real-time price preview component
- [ ] Prospect save to database

**Phase 3 — AI Proposal Generation (Days 7–10)**
- [ ] Claude API integration service
- [ ] Build prompt templates for each proposal section
- [ ] Response parser with JSON structured output
- [ ] PDF generation with Puppeteer (custom HTML template)
- [ ] PDF upload to Supabase Storage
- [ ] Proposal preview modal with inline editing

**Phase 4 — Delivery & Tracking (Days 11–13)**
- [ ] Resend email integration
- [ ] Personalized email template (React Email)
- [ ] Tracking pixel endpoint
- [ ] Proposal view page (web-rendered version of proposal)
- [ ] Heartbeat API for time-on-page
- [ ] Real-time notification system (Supabase Realtime)

**Phase 5 — Follow-up Engine (Days 14–16)**
- [ ] Vercel Cron Job setup
- [ ] Follow-up trigger evaluation logic
- [ ] Claude API integration for follow-up email generation
- [ ] Follow-up log tracking
- [ ] Sequence management UI

**Phase 6 — Dashboard & Polish (Days 17–20)**
- [ ] Pipeline kanban + list view
- [ ] Analytics panel (won revenue, conversion rate, open rate)
- [ ] Activity feed (real-time tracking events)
- [ ] Settings: company profile, pricing config, sequence templates
- [ ] Demo data seeder (pre-filled prospects and proposals in various stages)
- [ ] Mobile responsiveness pass
- [ ] Final QA and demo script prep

### 12.3 Demo Seed Data

The demo environment SHALL be pre-populated with:

```
5 Pre-built prospects at different pipeline stages:
  1. "Meridian Financial" — HOT_LEAD (viewed 4× today) → shows urgency
  2. "CoreTech Office Park" — OPENED (1 day ago, no reply) → shows follow-up armed
  3. "Riverside Medical Center" — SENT (2 days, not opened) → shows nudge queued
  4. "The Grand Hotel Group" — WON ($8,400/mo) → shows revenue impact
  5. "Apex Logistics Warehouse" — DRAFT → shows form workflow

Revenue dashboard pre-populated:
  - Monthly proposals sent: 18
  - Revenue won this month: $31,200
  - Pipeline value: $94,400
  - Conversion rate: 24%
```

---

## 13. Non-Functional Requirements

### 13.1 Performance

| Metric | Target |
|---|---|
| Proposal generation (AI + PDF) | < 12 seconds end-to-end |
| Page load (dashboard) | < 1.5 seconds (LCP) |
| Tracking pixel response | < 100ms |
| Email delivery | < 30 seconds after "Send" |
| Database query response | < 200ms (P95) |

### 13.2 Reliability

- Uptime target: 99.5% (Vercel + Supabase SLA covers this)
- PDF generation failures: Auto-retry 3× with exponential backoff
- Email delivery failures: Log, notify user, provide manual resend
- AI API failures: Graceful fallback with pre-built template proposal + error state

### 13.3 Security

- All routes protected by Supabase Auth JWT
- Row-Level Security on all database tables (company_id isolation)
- Tracking tokens: UUID v4 (unguessable, single-use read)
- PDF URLs: Signed, time-limited (72 hours) — force refresh via tracking link
- SMTP credentials: Stored encrypted in Supabase Vault
- No PII logged in analytics events beyond necessary tracking

### 13.4 Scalability Considerations (Post-Demo)

- Pricing engine: Pure function, stateless, horizontally scalable
- PDF generation: Move to dedicated worker (Browserless.io or AWS Lambda) at scale
- Email queue: Move to BullMQ or Inngest for reliable background processing at volume
- AI calls: Implement request queue to respect rate limits; cache proposals

---

## 14. Out of Scope (v1 Demo)

The following are explicitly excluded from the demo build to maintain focus and quality:

| Feature | Reason for Exclusion | Future Version |
|---|---|---|
| E-signature integration (DocuSign/Adobe) | Significant complexity; not needed for demo | v2 |
| CRM sync (HubSpot, Salesforce) | Integration overhead; demo is standalone | v2 |
| Job scheduling / dispatch after win | Different product surface (ops vs. sales) | v3 |
| Client-facing portal | Scope creep; trackable link is sufficient | v2 |
| SMS notifications (Twilio) | Nice-to-have; email notifications sufficient for demo | v2 |
| Multi-language proposals | Unnecessary for US market demo | v3 |
| Invoicing / billing | Post-win workflow; out of sales scope | v3 |
| Native mobile app | Web is responsive enough for demo | v3 |
| Team management / permissions | Single-user demo sufficient | v2 |
| A/B testing follow-up sequences | Requires data volume | v3 |

---

## 15. Success Metrics

### 15.1 Demo Success Metrics (Qualitative)

The demo is successful if the prospect says any of the following during or after viewing:

- "How long does it take to set this up?"
- "Can I connect this to my email?"
- "How much does it cost?"
- "We need this."
- "Can I try it right now?"

### 15.2 Product Success Metrics (Post-Launch KPIs)

| Metric | Definition | Target (Month 3) |
|---|---|---|
| Proposals Generated / User / Week | Active usage signal | ≥ 5 |
| Time to Generate Proposal | Intake form start → PDF ready | < 3 minutes |
| Email Open Rate (proposals) | Opened proposals / sent proposals | ≥ 55% |
| Follow-up Activation Rate | Proposals with ≥ 1 auto-follow-up sent | ≥ 80% |
| Conversion Lift | Client-reported close rate improvement | ≥ +25% vs. baseline |
| Weekly Active Users | Users who generate ≥ 1 proposal that week | ≥ 70% of paying accounts |
| NPS Score | Net Promoter Score at 30 days | ≥ 50 |
| Churn Rate (MoM) | Accounts cancelled / active | ≤ 5% |

---

## 16. Appendix: Industry Research & Pricing Intelligence

### 16.1 Commercial Cleaning Market Context

- US commercial cleaning industry: $78B+ annually (2024)
- Number of commercial cleaning companies (US): ~1.1 million
- Average company size: 3–15 employees (SMB-dominant market)
- Primary sales challenge: Commoditization — prospects choose on price when proposals look identical
- Key differentiator when using this software: **Professional proposal + fast follow-up = premium perception = price resilience**

### 16.2 Typical Proposal Volume by Company Size

| Company Revenue | Proposals / Week | Current Time/Proposal | Time Wasted/Week |
|---|---|---|---|
| < $500K | 3–5 | 90 min | 4.5–7.5 hrs |
| $500K–$2M | 7–15 | 60 min | 7–15 hrs |
| $2M–$5M | 15–30 | 45 min | 11–22.5 hrs |

### 16.3 Industry-Standard Pricing Benchmarks

```
OFFICE BUILDINGS:
  Standard: $0.07–$0.12 per sq ft per visit
  Premium Class A: $0.12–$0.18 per sq ft per visit

MEDICAL / HEALTHCARE:
  Clinic / Doctor's Office: $0.12–$0.18 per sq ft per visit
  Hospital / Surgical: $0.18–$0.28 per sq ft per visit

RETAIL:
  Standard Retail: $0.08–$0.14 per sq ft per visit
  Food Service: $0.10–$0.16 per sq ft per visit

INDUSTRIAL / WAREHOUSE:
  Basic Sweep/Mop: $0.04–$0.07 per sq ft per visit
  Full Clean: $0.07–$0.10 per sq ft per visit

TYPICAL CONTRACT VALUES:
  Small Office (5,000 sq ft, 3x/week): $800–$1,400/month
  Medium Office (25,000 sq ft, 5x/week): $4,000–$7,500/month
  Large Building (100,000 sq ft, 5x/week): $14,000–$25,000/month
  Medical Clinic (8,000 sq ft, daily): $2,200–$3,800/month
```

### 16.4 Follow-up Statistics Justifying the Automation Module

- **44%** of salespeople give up after one follow-up (Marketing Donut)
- **80%** of sales require 5 follow-ups after initial contact (National Sales Executive Association)
- **60%** of customers say no four times before saying yes (Marketing Donut)
- The average response rate for a "breakup email" (SEQ-D) is **33–47%** — the highest of any follow-up in a sequence
- **Proposals viewed 3+ times** by the same prospect convert at **4.8×** the rate of single-view proposals — justifying the HOT_LEAD trigger

---

*End of Document*

---

**Document Control:**

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | June 2026 | Product & Engineering | Initial release — Demo build approved |
