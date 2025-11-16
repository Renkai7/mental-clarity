# SaaS Engineering Tech Stack — Final Overview

## 1. Frontend Layer
### Framework
- **Next.js 16** (App Router, Server Components, modern caching)

### Styling & UI
- **Tailwind CSS v4**
- **shadcn/ui** (primary design system)
- **Base UI** (selective use for specialized components)

## 2. Language & Tooling
- **TypeScript** (strict)
- **Node.js** (runtime)
- **pnpm** (package manager)
- **Turborepo** (monorepo orchestration)

## 3. API & Validation Layer
- **oRPC** (typesafe API layer; generates OpenAPI)
- **Zod** (validation + type inference)

## 4. Backend Logic
- Next.js Server Components and API routes
- Background logic offloaded to **Hetzner workers** or **Vercel functions**

## 5. Data & Persistence
### Database
- **PostgreSQL** (Neon)

### ORM
- **Prisma ORM**

### Vector Storage
- **pgvector** via Neon for embeddings + semantic search

## 6. Authentication & Security
- **Better-Auth**
- **Arcjet** (rate limiting, protection, API hardening)

## 7. Background Jobs & Scheduling (future integration)
- Options: **Inngest**, **Trigger.dev**, or custom Hetzner cron + queue

## 8. Caching Strategy
### Application Layer
- Next.js 16 caching primitives: `use cache`, `unstable_cache`, `revalidateTag`, `revalidatePath`

### Cross-Service (future)
- **Redis/Valkey** for shared caching, job queues, locks

## 9. File Storage & Uploads (optional)
- S3-compatible options: **Cloudflare R2**, **Backblaze B2**, **Hetzner Object Storage**
- Upload pipeline: **UploadThing** or custom signed uploads

## 10. Payments
- **Stripe**

## 11. Content & Blog
- **SyntaxKit**
- **Content Collections**

## 12. Documentation Layer
- **Fumadocs** for both internal + product docs

## 13. Observability & Quality
### Testing
- **Vitest** (unit & integration)
- **Testing Library** (React component testing)
- **Playwright** (end-to-end tests)

### Error Tracking
- **Sentry** or **OpenTelemetry** + Axiom/Logtail

### Analytics
- **Vercel Analytics** (site performance)
- Optional: **PostHog** for product usage analytics

## 14. Deployment & Infrastructure
### Primary
- **Vercel** (app, docs, marketing, serverless functions)

### Secondary
- **Hetzner** (workers, background services, optional Redis, additional microservices)

## 15. AI/LLM Layer
### Model Abstraction
- Custom `@acme/ai` package for LLM calls, retries, and tool functions

### Embeddings
- Postgres + pgvector (through Prisma)

### API Agent Integration
- OpenAPI (from oRPC) → tools for coding agents

---

## One-Sentence Summary
A TypeScript-first, Next.js 16 + Neon + Prisma monorepo, built on oRPC APIs, Better-Auth, Arcjet, Stripe, Fumadocs, Vercel + Hetzner hybrid deployment, Vitest/Playwright testing, and optional Redis for distributed caching—designed for clean, scalable, AI-assisted SaaS development.

