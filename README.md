# CleanProposal AI

AI-powered proposal generation and intelligent follow-up automation for commercial cleaning companies.

## Features

- **Module 1 — Smart Intake & Quoting**: 4-step guided intake form with real-time pricing engine
- **Module 2 — AI Proposal Generation**: Claude-powered content + PDF generation
- **Module 3 — Delivery & Tracking**: Email delivery, open/view tracking, hot-lead detection
- **Module 4 — Follow-up Automation**: SEQ-A/B/C/D behavior-triggered sequences + pipeline dashboard

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in (demo mode bypasses auth).

## Environment Variables

| Variable | Description |
|---|---|
| `DEMO_MODE` | Set `true` for local demo (JSON store, no auth required) |
| `ANTHROPIC_API_KEY` | Claude API for AI proposal/follow-up content |
| `RESEND_API_KEY` | Email delivery via Resend |
| `CRON_SECRET` | Secures `/api/cron/follow-ups` in production |
| `NEXT_PUBLIC_APP_URL` | Public app URL for tracking links |

## Demo Workflow

1. **Dashboard** — Pipeline kanban, analytics, activity feed
2. **New Proposal** — Complete 4-step intake → Generate → Preview → Send
3. **Public Link** — `/p/[token]` tracks views and pricing engagement
4. **Follow-ups** — Cron evaluates SEQ-A/B/C/D triggers every 30 minutes

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:push      # Push Prisma schema (when using Postgres)
npm run db:seed      # Seed database
```

## Architecture

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui
- **Data (Demo)**: JSON file store (`.data/store.json`)
- **Data (Production)**: Prisma + Supabase PostgreSQL (schema ready)
- **AI**: Anthropic Claude API
- **Email**: Resend with tracking pixel
- **PDF**: Puppeteer + Chromium

## Production Checklist

- [ ] Set `DEMO_MODE=false` and configure Supabase Auth
- [ ] Wire repository to Prisma instead of JSON store
- [ ] Configure `CRON_SECRET` and Vercel Cron
- [ ] Set `RESEND_API_KEY` and verified sender domain
- [ ] Deploy to Vercel with persistent storage for PDFs
