import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "./images";
import type { Opportunity, Category, BlogPost } from "@/data/opportunities";

function mapOpportunity(r: any): Opportunity {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    image: resolveImage(r.image),
    category: r.category_slug,
    country: r.country ?? "",
    deadline: r.deadline ?? "",
    funding: r.funding ?? "",
    fundingAmount: r.funding_amount ?? undefined,
    organizer: r.organizer ?? "",
    eligibility: r.eligibility ?? [],
    benefits: r.benefits ?? [],
    documents: r.documents ?? [],
    process: r.process ?? [],
    overview: r.overview ?? [],
    officialUrl: r.official_url ?? "",
    featured: r.featured ?? false,
    trending: r.trending ?? false,
    publishedAt: r.published_at ?? r.created_at,
    readingMinutes: r.reading_minutes ?? 5,
  };
}

function mapCategory(r: any): Category {
  return {
    slug: r.slug,
    label: r.label,
    icon: r.icon ?? "Sparkles",
    blurb: r.blurb ?? "",
  };
}

function mapBlogPost(r: any): BlogPost {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    category: r.category ?? "Editorial",
    author: r.author ?? "OpportunityHub Editors",
    publishedAt: r.published_at ?? r.created_at,
    readingMinutes: r.reading_minutes ?? 5,
    image: resolveImage(r.image),
    body: r.body ?? [],
  };
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCategory(data) : null;
}

export async function listOpportunities(opts?: {
  published?: boolean;
  category?: string;
  featured?: boolean;
  trending?: boolean;
  limit?: number;
}): Promise<Opportunity[]> {
  let q = supabase.from("opportunities").select("*");
  if (opts?.published !== false) q = q.eq("published", true);
  if (opts?.category) q = q.eq("category_slug", opts.category);
  if (opts?.featured) q = q.eq("featured", true);
  if (opts?.trending) q = q.eq("trending", true);
  q = q.order("published_at", { ascending: false });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(mapOpportunity);
}

export async function getOpportunityBySlug(slug: string): Promise<Opportunity | null> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOpportunity(data) : null;
}

export async function listBlogPosts(opts?: { published?: boolean; limit?: number }): Promise<BlogPost[]> {
  let q = supabase.from("blog_posts").select("*");
  if (opts?.published !== false) q = q.eq("published", true);
  q = q.order("published_at", { ascending: false });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(mapBlogPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapBlogPost(data) : null;
}

export function buildCategoryMap(cats: Category[]): Record<string, Category> {
  return Object.fromEntries(cats.map((c) => [c.slug, c]));
}
