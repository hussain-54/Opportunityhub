import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search, Globe2, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import * as Icons from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { OpportunityCard } from "@/components/site/OpportunityCard";
import { AdSlot } from "@/components/site/AdSlot";
import { Newsletter } from "@/components/site/Newsletter";
import { listCategories, listOpportunities, buildCategoryMap } from "@/lib/content";
import type { Category, Opportunity } from "@/data/opportunities";
import { formatDate } from "@/lib/format";
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_TAGLINE_ALT,
  pageTitle,
} from "@/lib/brand";
import { absoluteUrl } from "@/lib/site-url";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [categories, all] = await Promise.all([
      listCategories(),
      listOpportunities(),
    ]);
    const featured = all.filter((o) => o.featured).slice(0, 3);
    const trending = all.filter((o) => o.trending).slice(0, 5);
    return { categories, all, featured, trending };
  },
  head: () => ({
    meta: [
      { title: pageTitle("Scholarships, Fellowships & Global Programs") },
      {
        name: "description",
        content:
          "Discover scholarships, fellowships, grants, internships, research programs, and global opportunities that move your ambitions forward.",
      },
      { property: "og:title", content: `${BRAND_NAME} — ${BRAND_TAGLINE}` },
      {
        property: "og:description",
        content: BRAND_TAGLINE_ALT,
      },
      { property: "og:url", content: absoluteUrl("/") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
  component: HomePage,
});

const popularTags = ["Fully funded", "Women in STEM", "Africa", "PhD 2026", "Climate tech", "Europe"];

function HomePage() {
  const navigate = useNavigate();
  const { categories, all, featured, trending } = Route.useLoaderData() as {
    categories: Category[];
    all: Opportunity[];
    featured: Opportunity[];
    trending: Opportunity[];
  };
  const catMap = buildCategoryMap(categories);
  const latest = all.slice(0, 8);
  const [query, setQuery] = useState("");

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate({ to: "/opportunities", search: { q: q || undefined } });
  }

  return (
    <SiteLayout>
      <section className="container-prose pt-14 pb-12 md:pt-20 md:pb-16">
        <div className="max-w-4xl fade-up">
          <span className="eyebrow text-bridge">
            {BRAND_NAME} · {all.length} live {all.length === 1 ? "opportunity" : "opportunities"}
          </span>
          <h1 className="mt-5 font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-navy text-balance">
            Your next opportunity starts here.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-muted leading-relaxed">
            {BRAND_TAGLINE_ALT} Scholarships, fellowships, grants, internships, research programs, and global
            opportunities — curated for students, researchers, entrepreneurs, and emerging leaders.
          </p>

          <form onSubmit={onSearch} className="mt-9 flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0 border border-rule bg-white sm:border-2 sm:border-navy sm:p-1 max-w-2xl rounded-sm shadow-sm">
            <div className="flex flex-1 items-center gap-2 px-3 py-2 sm:py-0">
              <Search className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Title, country, category, organization, keywords…"
                className="flex-1 min-w-0 py-2 sm:py-3 outline-none font-sans text-sm placeholder:text-ink-muted/60"
                aria-label="Search opportunities"
              />
            </div>
            <div className="flex gap-2 p-2 sm:p-0">
              <button
                type="submit"
                className="flex-1 sm:flex-none bg-navy px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-bridge transition-colors"
              >
                Explore Opportunities
              </button>
              <Link
                to="/category/$slug"
                params={{ slug: "scholarships" }}
                className="flex-1 sm:flex-none grid place-items-center border border-rule sm:border-0 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-navy hover:text-bridge"
              >
                Scholarships
              </Link>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2 items-center">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/60 mr-1">
              Popular:
            </span>
            {popularTags.map((tag) => (
              <Link
                key={tag}
                to="/opportunities"
                search={{ q: tag.toLowerCase() }}
                className="px-3 py-1 bg-bridge-soft font-mono text-[10px] font-bold uppercase text-navy hover:bg-navy hover:text-white transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container-prose pb-12">
        <AdSlot format="leaderboard" />
      </div>

      {featured.length > 0 && (
        <section className="container-prose py-12 border-t border-rule">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <span className="eyebrow text-bridge">Editor&apos;s choice</span>
              <h2 className="mt-2 font-serif text-3xl md:text-4xl font-bold text-navy">Featured opportunities</h2>
            </div>
            <Link
              to="/opportunities"
              className="hidden sm:inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-navy hover:text-bridge"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {featured.map((op) => (
              <OpportunityCard key={op.slug} opportunity={op} variant="feature" category={catMap[op.category]} />
            ))}
          </div>
        </section>
      )}

      <section className="container-prose py-16 border-t border-rule">
        <div className="mb-10">
          <span className="eyebrow text-bridge">Browse by category</span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl font-bold text-navy">Twelve paths. One global bridge.</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-rule">
          {categories.map((cat) => {
            const Icon = (Icons as unknown as Record<string, typeof Globe2>)[cat.icon] ?? Sparkles;
            return (
              <Link
                key={cat.slug}
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="group bg-paper p-6 hover:bg-navy hover:text-white transition-colors"
              >
                <Icon className="h-6 w-6 text-bridge group-hover:text-white" />
                <h3 className="mt-4 font-serif text-lg font-bold text-navy group-hover:text-white">{cat.label}</h3>
                <p className="mt-1 text-xs text-ink-muted group-hover:text-white/70 leading-relaxed">{cat.blurb}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-prose py-16 border-t border-rule grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        <div>
          <span className="eyebrow text-bridge">Latest</span>
          <h2 className="mt-2 mb-8 font-serif text-3xl md:text-4xl font-bold text-navy">New on FutureBridge</h2>
          <div className="space-y-10">
            {latest.map((op, idx) => (
              <article
                key={op.slug}
                className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[220px_1fr] gap-6 pb-10 border-b border-rule last:border-b-0"
              >
                <Link
                  to="/opportunity/$slug"
                  params={{ slug: op.slug }}
                  className="block overflow-hidden bg-navy-soft aspect-square rounded-sm"
                >
                  <img
                    src={op.image}
                    alt={op.title}
                    loading="lazy"
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-bridge">
                    {(catMap[op.category]?.label ?? op.category).toString()}
                  </span>
                  <h3 className="mt-2 font-serif text-2xl font-bold leading-tight text-navy">
                    <Link
                      to="/opportunity/$slug"
                      params={{ slug: op.slug }}
                      className="hover:underline decoration-2 underline-offset-4 decoration-bridge"
                    >
                      {op.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-xs font-mono uppercase tracking-wider text-ink-muted/80">
                    {op.organizer}
                    {op.country ? ` · ${op.country}` : ""}
                  </p>
                  <p className="mt-3 text-sm text-ink-muted leading-relaxed line-clamp-2">{op.excerpt}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70">
                    <span>{formatDate(op.publishedAt)}</span>
                    <span>·</span>
                    <span>{op.funding || "See listing"}</span>
                    <span>·</span>
                    <span>{op.readingMinutes} min read</span>
                  </div>
                </div>
                {idx === 1 && (
                  <div className="md:col-span-2">
                    <AdSlot format="in-article" />
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-10">
          <AdSlot format="rectangle" />
          <div>
            <h3 className="eyebrow text-ink-muted/70 mb-4 border-b border-rule pb-3">Trending</h3>
            <ol className="space-y-4">
              {trending.map((op, i) => (
                <li key={op.slug} className="flex gap-3">
                  <span className="font-serif text-2xl font-black italic text-navy/10 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Link
                    to="/opportunity/$slug"
                    params={{ slug: op.slug }}
                    className="text-sm font-bold leading-snug text-navy hover:text-bridge"
                  >
                    {op.title}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          <Newsletter variant="card" />
          <AdSlot format="skyscraper" />
        </aside>
      </section>

      <Newsletter />

      <section className="container-prose py-16 border-t border-rule">
        <div className="max-w-3xl mx-auto text-center">
          <span className="eyebrow text-bridge">Why {BRAND_NAME}</span>
          <p className="mt-4 font-serif text-2xl md:text-3xl text-navy leading-snug text-balance">{BRAND_TAGLINE}</p>
          <p className="mt-4 text-ink-muted">
            We verify listings against official sources, surface clear deadlines, and keep category navigation simple so
            you can focus on applying — not searching.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}