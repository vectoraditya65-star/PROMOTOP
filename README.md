# Promo Top

A pay-to-outbid product leaderboard: anyone can claim a rank in a category by
paying more than whoever currently holds it. Built with Next.js (App
Router), Prisma, NextAuth, and Stripe.

This is an original implementation of the "outbid leaderboard" concept —
built from scratch, with its own name, design, and code — not a copy of any
existing site's code or assets.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **NextAuth** (credentials + bcrypt) for real user accounts and roles
- **Prisma** + SQLite locally / Postgres in production
- **Stripe Checkout** for payments, **Stripe Refunds API** for admin refunds
- **Tailwind CSS** for styling
- **Upstash Redis** for distributed rate limiting (optional in dev)
- **Jest** for unit tests, **GitHub Actions** for CI

## Local setup

```bash
npm install
cp .env.example .env      # then fill in your Stripe test keys + NEXTAUTH_SECRET
npx prisma db push        # creates dev.db and applies the schema
npx prisma db seed        # adds starter categories (and an admin account if configured)
npm run dev
```

Visit `http://localhost:3000`.

Generate `NEXTAUTH_SECRET` with `openssl rand -hex 32`.

### Accounts and roles

- Anyone can sign up at `/register` and claim a rank — every listing and
  payment is tied to their account (`/dashboard` shows their own listings).
- To get an `ADMIN` account on a fresh database, set `SEED_ADMIN_EMAIL` and
  `SEED_ADMIN_PASSWORD` in `.env` before running `npx prisma db seed`. Log in
  with those credentials, then change the password (there's no in-app
  password-change flow yet — update it directly via `npx prisma studio` or
  a follow-up migration).
- Admins get an "Admin" link in the header, leading to `/admin` (listings:
  remove/restore, issue refunds) and `/admin/users` (ban/unban).

### Testing payments locally

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Run `stripe listen --forward-to localhost:3000/api/webhook`.
3. Copy the `whsec_...` value it prints into `.env` as `STRIPE_WEBHOOK_SECRET`.
4. Use a [Stripe test card](https://stripe.com/docs/testing) like
   `4242 4242 4242 4242` with any future expiry and any CVC.

### Running tests

```bash
npm test          # run once
npm run test:watch
```

Covers the zod validation/sanitization schema, the rate limiter, and the
money-formatting helpers. `npm run lint` runs Next's ESLint config.
`.github/workflows/ci.yml` runs lint, test, and build on every push and PR
to `main`.

## Troubleshooting

**Page loads but nothing is clickable / leaderboard never finishes loading.**
This means the browser's JavaScript never started up — check your browser
console for a `Content-Security-Policy` / `unsafe-eval` error. `middleware.ts`
relaxes the CSP automatically in development (`npm run dev` sets
`NODE_ENV=development` for you), so this should only come up if you're
running `npm run build && npm start` locally and expecting dev behavior, or
if you changed how the app is started. If you still see it, hard-refresh
(the old CSP may be cached) or restart `npm run dev`.

**Categories tab only shows "All".** Run `npx prisma db push` and then
`npx prisma db seed` — the category list comes from the database, so
without seeding it there's nothing to show.

## Deploying

1. **Database**: create a free Postgres instance (Neon, Supabase, or
   Railway all work). Set `DATABASE_PROVIDER="postgresql"` and
   `DATABASE_URL` in your host's environment variables, then run
   `npx prisma db push` once against it.
2. **App**: deploy to Vercel (or any Node host). Set every variable from
   `.env.example` in the host's dashboard — never commit `.env`.
3. **Stripe webhook**: in the Stripe dashboard, add a production webhook
   endpoint pointing at `https://yourdomain.com/api/webhook`, subscribed to
   `checkout.session.completed`, `checkout.session.expired`, and
   `payment_intent.payment_failed`. Copy its signing secret into
   `STRIPE_WEBHOOK_SECRET` on your host.
4. **Rate limiting**: create a free Upstash Redis database and set
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. Without this,
   rate limiting only works correctly on a single server instance.
5. Switch Stripe keys from `sk_test_...` to `sk_live_...` only once you've
   tested the full flow end to end.

## Security measures included

- **Real accounts, hashed passwords.** NextAuth credentials auth; passwords
  are bcrypt-hashed (cost factor 12) and never stored or logged in plaintext.
- **Role-based access control**, enforced twice: in `middleware.ts` (blocks
  the request before any admin/dashboard page renders) and again inside
  every `/api/admin/*` route handler (`requireAdmin()`), so a compromised or
  buggy page component can't accidentally expose admin data.
- **Payments never touch our server.** Card details go straight to Stripe
  via Checkout; we only ever see a session ID and payment intent ID. There
  is no card-storage liability (PCI scope stays minimal).
- **Webhook signature verification.** `/api/webhook` rejects any request
  whose Stripe signature doesn't verify — this is what stops someone from
  granting themselves a free rank by POSTing a fake "payment succeeded"
  event directly to the endpoint.
- **Idempotent webhook processing.** Each Stripe session ID is only applied
  once, since Stripe may deliver the same event more than once.
- **Server-side price authority.** The minimum bid to take a rank is
  recomputed from the database on the server for every checkout request —
  the price shown in the browser is never trusted as-is.
- **Input validation & sanitization.** Every field is validated with zod
  (type, length, format) and free-text fields are run through DOMPurify to
  strip HTML before being stored or rendered, closing off stored XSS.
- **Rate limiting** on checkout, registration, and other write endpoints to
  blunt payment-spam, credential-stuffing, and scraping abuse.
- **Security headers** (via `middleware.ts`): a Content-Security-Policy
  restricted to Stripe's own domains, `X-Frame-Options: DENY`, HSTS,
  `X-Content-Type-Options: nosniff`, and a restrictive Permissions-Policy.
- **Least-privilege secrets.** `STRIPE_SECRET_KEY` is loaded only in
  server-only modules (enforced by the `server-only` package).
- **Real refunds, not just a status flag.** Admin refunds call the Stripe
  Refunds API against the actual payment intent, so money genuinely moves
  back to the customer.
- **Audit trail.** Every payment attempt is recorded as an immutable `Bid`
  row, so rankings and disputes can always be reconstructed.

### Still worth doing before a real launch

- Put the app behind a WAF/CDN (Cloudflare, Vercel's built-in DDoS
  protection) for network-layer abuse.
- Add monitoring/alerting on webhook failures (e.g. Sentry) — a silently
  failing webhook means paid customers never get activated.
- Add email verification and a password-reset flow (not included yet —
  accounts currently have no "forgot password" path).
- Get a real Terms of Service and refund policy reviewed by a lawyer before
  taking live payments; this codebase doesn't include one.
- Consider a manual moderation queue before a submitted product goes live,
  to keep out spam/scam listings regardless of payment.
- Expand test coverage to the API routes themselves (currently only the
  pure helper functions — validation, rate limiting, formatting — have
  tests; the route handlers are integration-tested manually via the Stripe
  CLI flow described above).

## Project structure

```
app/
  page.tsx                    leaderboard + claim modal (client component)
  login/, register/           auth pages
  dashboard/page.tsx           signed-in user's own listings
  admin/page.tsx               admin: manage listings, issue refunds
  admin/users/page.tsx         admin: ban/unban users
  claimed/page.tsx             post-checkout landing page
  api/
    auth/[...nextauth]/        NextAuth handler
    auth/register/route.ts     account creation
    categories/route.ts        GET category list
    products/route.ts          GET leaderboard (public, read-only)
    me/products/route.ts       GET current user's own listings
    checkout/route.ts          POST create a Stripe Checkout session (auth required)
    webhook/route.ts           POST Stripe webhook (payment confirmation)
    admin/products/route.ts    admin: list/remove/restore listings
    admin/users/route.ts       admin: list/ban users
    admin/refund/route.ts      admin: issue a real Stripe refund
lib/
  auth.ts                     NextAuth config (credentials + bcrypt)
  session.ts                  requireUser() / requireAdmin() helpers
  db.ts                       Prisma client
  stripe.ts                   Stripe client (server-only)
  validation.ts                zod schemas + sanitization
  rateLimit.ts                 Upstash-backed rate limiter with in-memory fallback
  format.ts                    money-formatting helpers
  __tests__/                   Jest unit tests
prisma/
  schema.prisma                User / Category / Product / Bid models
  seed.ts                      starter categories + optional admin bootstrap
middleware.ts                  security headers + admin/dashboard route gating
.github/workflows/ci.yml       lint + test + build on every push/PR
```
