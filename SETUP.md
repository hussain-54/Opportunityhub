# FutureBridge setup

## 1. Environment

Copy `.env.example` to `.env` (already present locally) and confirm:

```env
NEXT_PUBLIC_SUPABASE_URL=https://eymsgnsgrdmnmqrjpnmk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-key
SUPABASE_URL=https://eymsgnsgrdmnmqrjpnmk.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-key
```

## 2. Database migrations (Supabase SQL editor)

Run in order if the project is empty:

1. `supabase/migrations/001_initial_schema.sql` — schema, RLS, profiles, storage  
2. `supabase/migrations/002_opportunity_submissions.sql` — public submit inbox  
3. `supabase/migrations/003_newsletter_unsubscribe.sql` — unsubscribe RPC  
4. `supabase/migrations/004_admin_subscriber_delete.sql` — admin delete on subscribers  

If core tables already exist, run **`002`**, **`003`**, and **`004`**.

## 3. First admin

1. Sign up at `/auth`
2. In SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

## 4. Local run

```bash
npm install
npm run dev
```

## 5. Editorial workflow

1. Public users submit via `/submit` → `opportunity_submissions`
2. Admins review at `/admin/submissions`
3. Use **Create draft opportunity** to insert an unpublished listing, then edit/publish under `/admin/opportunities`

## 6. Newsletter unsubscribe

After migration `003`, visitors can leave the list at `/unsubscribe`.
