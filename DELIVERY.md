# FutureBridge — Delivery Report

**Status:** Implementation complete for core rebrand + product hardening. Local `npm install` / build must be verified on your machine.

## Architecture (unchanged stack)

- React 19 + TanStack Start/Router + Vite 8 + Tailwind 4
- Supabase Auth + Postgres + Storage + RLS
- Public reads via `src/lib/content.ts`
- Admin CMS under `/admin/*`

## Database (additive only — no resets)

| Migration | Purpose | Status |
|-----------|---------|--------|
| `001_initial_schema.sql` | Core tables, profiles, RLS | Run if empty project |
| `002_opportunity_submissions.sql` | Public submit inbox | **Required** |
| `003_newsletter_unsubscribe.sql` | Unsubscribe RPC | **Required** |
| `004_admin_subscriber_delete.sql` | Admin delete subscribers | **Required** |

Do **not** re-run `001` on a populated database.

## Feature inventory

| Area | Status |
|------|--------|
| FutureBridge rebrand (UI, SEO, footer, admin) | Completed |
| Homepage hero + search + categories | Completed |
| Opportunities filters / sort / load-more | Completed |
| Deadline open/closed logic | Completed |
| Journal rebrand | Completed |
| Newsletter (real insert + unsubscribe) | Completed |
| Submit (real insert + honeypot/cooldown) | Completed |
| About (live DB stats only) | Completed |
| Privacy / Terms | Completed |
| Admin opportunities / categories / blog | Completed |
| Admin submissions + create draft | Completed |
| Admin subscribers + CSV | Completed |
| Absolute canonical / OG / sitemap | Completed |
| Published-only public detail pages | Completed |
| Custom domain / official logo | Requires approval |
| Edge rate limiting | Partially completed (client guards only) |
| Production build in agent environment | Blocked (npm network/EPERM) |

## Security notes

- Admin writes rely on Supabase RLS + `profiles.role = admin`
- Public opportunity/blog detail queries now filter `published = true`
- Drafts stay unpublished until admin publishes
- Client honeypot/cooldown is not a substitute for edge rate limits

## Local launch

```bash
npm install
npm run dev
```

1. Run SQL migrations `002`–`004` in Supabase
2. Sign up at `/auth`
3. `update public.profiles set role = 'admin' where email = 'your@email.com';`
4. Confirm `.env` has `NEXT_PUBLIC_SITE_URL` (currently Vercel preview host)

## Deployment readiness

- **Code:** Ready for review
- **Deploy:** Do not push without your approval
- **Domain:** Keep `opportunityhub-iota.vercel.app` until FutureBridge DNS is approved
