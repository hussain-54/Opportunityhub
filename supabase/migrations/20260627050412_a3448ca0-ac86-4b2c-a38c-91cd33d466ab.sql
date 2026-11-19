
-- Updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Admin check (hardcoded email)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT lower(email) = 'hussainad920@gmail.com'
       FROM auth.users
       WHERE id = auth.uid()),
    false
  );
$$;

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Folder',
  blurb TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin can insert categories"
  ON public.categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update categories"
  ON public.categories FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin can delete categories"
  ON public.categories FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ OPPORTUNITIES ============
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  category_slug TEXT NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE,
  country TEXT NOT NULL DEFAULT '',
  deadline DATE,
  funding TEXT NOT NULL DEFAULT 'Fully Funded',
  funding_amount TEXT,
  organizer TEXT NOT NULL DEFAULT '',
  eligibility TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  documents TEXT[] NOT NULL DEFAULT '{}',
  process TEXT[] NOT NULL DEFAULT '{}',
  overview TEXT[] NOT NULL DEFAULT '{}',
  official_url TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT false,
  trending BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  reading_minutes INT NOT NULL DEFAULT 5,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.opportunities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published opportunities are public"
  ON public.opportunities FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "Admin can insert opportunities"
  ON public.opportunities FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update opportunities"
  ON public.opportunities FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin can delete opportunities"
  ON public.opportunities FOR DELETE TO authenticated USING (public.is_admin());
CREATE INDEX opportunities_category_idx ON public.opportunities(category_slug);
CREATE INDEX opportunities_published_idx ON public.opportunities(published, published_at DESC);
CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ BLOG POSTS ============
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  author TEXT NOT NULL DEFAULT 'OpportunityHub Editors',
  reading_minutes INT NOT NULL DEFAULT 5,
  image TEXT NOT NULL DEFAULT '',
  body TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are public"
  ON public.blog_posts FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "Admin can insert posts"
  ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin can update posts"
  ON public.blog_posts FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin can delete posts"
  ON public.blog_posts FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
