# Mehula ADMediaTek – Enterprise SEO SaaS & B2B Agency Platform
**Engineered by XENO Webworks**

## 1. Overview & Architecture
This repository contains the complete B2B lead-generation website and Search Intelligence SaaS platform for **Mehula ADMediaTek** (Ahmedabad, India).

### Technology Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 (`Plus Jakarta Sans` display, `Public Sans` body, `JetBrains Mono` tabular numerals).
- **Backend**: Express (`server.ts`) serving full-stack API routes (`/api/audit`, `/api/chatbot`, `/api/leads`, `/api/cms/articles`, `/api/billing/calculate`, `/robots.txt`, `/sitemap.xml`).
- **Database & Auth**:
  - **Firebase Authentication & Cloud Firestore** (`firebase-applet-config.json` + zero-trust `firestore.rules` validated by ESLint & Dirty Dozen unit tests) for user accounts, PII split-collection isolation, SaaS subscriptions, invoices, saved audits, and tracked keywords.
  - **Server-Side Persistent Store** (`.data/server_store.json`) for public lead capture, CMS articles, 301 slug redirects, and audit history.

## 2. Commands
```bash
# Install dependencies
npm install

# Run unit tests (SaaS billing, SSRF protection, Audit scoring, and Firestore security rules)
npx --yes tsx --test src/utils/saasEngine.test.ts firestore.rules.test.ts

# Start full-stack development server on port 3000
npm run dev

# Type-check codebase
npm run lint

# Build production bundle
npm run build
```

## 3. Conversion Events Tracked (`/api/analytics/event`)
No PII (names, emails, or form text) is ever sent to analytics events:
- `audit_form_started`
- `audit_request_submitted`
- `audit_completed`
- `contact_form_submitted`
- `consultation_requested`
- `service_cta_clicked`
- `chatbot_opened`
- `chatbot_lead_submitted`
- `article_cta_clicked`
