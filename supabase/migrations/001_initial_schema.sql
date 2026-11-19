-- FutureBridge (OpportunityHub legacy schema) + admin RLS
-- Run this in your new Supabase project's SQL editor (or via supabase db push).

-- Profiles (admin roles)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  icon text not null default 'Sparkles',
  blurb text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Public read categories"
  on public.categories for select
  using (true);

create policy "Admins manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- Opportunities
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  image text not null default '',
  category_slug text not null references public.categories (slug) on update cascade,
  country text not null default '',
  deadline date,
  funding text not null default '',
  funding_amount text,
  organizer text not null default '',
  eligibility text[] not null default '{}',
  benefits text[] not null default '{}',
  documents text[] not null default '{}',
  process text[] not null default '{}',
  overview text[] not null default '{}',
  official_url text not null default '',
  featured boolean not null default false,
  trending boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  reading_minutes int not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.opportunities enable row level security;

create policy "Public read published opportunities"
  on public.opportunities for select
  using (published = true or public.is_admin());

create policy "Admins manage opportunities"
  on public.opportunities for insert
  with check (public.is_admin());

create policy "Admins update opportunities"
  on public.opportunities for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete opportunities"
  on public.opportunities for delete
  using (public.is_admin());

-- Blog posts
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text[] not null default '{}',
  author text not null default 'OpportunityHub Editors',
  category text not null default 'Editorial',
  image text not null default '',
  published boolean not null default false,
  published_at timestamptz,
  reading_minutes int not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

create policy "Public read published blog posts"
  on public.blog_posts for select
  using (published = true or public.is_admin());

create policy "Admins manage blog posts"
  on public.blog_posts for all
  using (public.is_admin())
  with check (public.is_admin());

-- Newsletter
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  source text not null default 'site',
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

create policy "Admins read subscribers"
  on public.newsletter_subscribers for select
  using (public.is_admin());

-- Storage bucket for opportunity images
insert into storage.buckets (id, name, public)
values ('opportunity-images', 'opportunity-images', false)
on conflict (id) do nothing;

create policy "Admins upload opportunity images"
  on storage.objects for insert
  with check (
    bucket_id = 'opportunity-images'
    and public.is_admin()
  );

create policy "Admins update opportunity images"
  on storage.objects for update
  using (bucket_id = 'opportunity-images' and public.is_admin());

create policy "Admins delete opportunity images"
  on storage.objects for delete
  using (bucket_id = 'opportunity-images' and public.is_admin());

create policy "Authenticated read opportunity images"
  on storage.objects for select
  using (bucket_id = 'opportunity-images' and auth.role() = 'authenticated');

-- Grant your first admin after signing up:
-- update public.profiles set role = 'admin' where email = 'your@email.com';
