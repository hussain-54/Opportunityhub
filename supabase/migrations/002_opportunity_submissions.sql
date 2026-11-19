-- User-submitted opportunities (review queue; not auto-published)
create table if not exists public.opportunity_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  category_slug text,
  country text,
  deadline date,
  funding text,
  official_url text,
  summary text not null,
  submitter_email text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'rejected', 'approved')),
  created_at timestamptz not null default now()
);

alter table public.opportunity_submissions enable row level security;

create policy "Anyone can submit an opportunity for review"
  on public.opportunity_submissions for insert
  with check (true);

create policy "Admins can read submissions"
  on public.opportunity_submissions for select
  using (public.is_admin());

create policy "Admins can update submissions"
  on public.opportunity_submissions for update
  using (public.is_admin())
  with check (public.is_admin());