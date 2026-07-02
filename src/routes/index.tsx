import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, Globe2, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { OpportunityCard } from "@/components/site/OpportunityCard";
import { AdSlot } from "@/components/site/AdSlot";
import { Newsletter } from "@/components/site/Newsletter";
import { listCategories, listOpportunities, buildCategoryMap } from "@/lib/content";
import type { Category, Opportunity } from "@/data/opportunities";
import { formatDate } from "@/lib/format";

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
      { title: "OpportunityHub — Discover Scholarships, Fellowships & Startup Opportunities Worldwide" },
      { name: "description", content: "Find scholarships, fellowships, grants, accelerators, internships, conferences, and hackathons curated daily by our editors. Free, global, updated daily." },
      { property: "og:title", content: "OpportunityHub — Global Opportunities for Students, Founders & Researchers" },
      { property: "og:description", content: "The newsroom for life-changing global opportunities. Scholarships, fellowships, grants, and accelerators curated daily." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const popularTags = ["Fully funded", "Women in STEM", "Africa", "PhD 2026", "Climate tech", "Europe"];

function HomePage() {
  const { categories, all, featured, trending } = Route.useLoaderData() as { categories: Category[]; all: Opportunity[]; featured: Opportunity[]; trending: Opportunity[] };
  const catMap = buildCategoryMap(categories);
  const latest = all.slice(0, 8);

  return (
    <SiteLayout>
      <section className="container-prose pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="max-w-4xl">
          <span className="eyebrow text-orange">Updated daily · {all.length}+ live opportunities</span>
          <h1 className="mt-5 font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight text-navy text-balance">
            Discover scholarships, fellowships, grants &{" "}
            <span className="italic text-orange">startup opportunities</span> worldwide.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink-muted leading-relaxed">
            The global newsroom for ambitious students, entrepreneurs, researchers, and
            changemakers — curated by editors, updated every morning.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="mt-10 flex items-stretch border-2 border-navy bg-white p-1 max-w-2xl">
            <div className="pl-3 grid place-items-center text-ink-muted"><Search className="h-4 w-4" /></div>
            <input type="search" placeholder="Search scholarships, grants, fellowships, accelerators…" className="flex-1 px-3 py-3 outline-none font-sans text-sm placeholder:text-ink-muted/60" />
            <Link to="/opportunities" className="bg-navy px-6 md:px-8 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-orange transition-colors grid place-items-center">Search</Link>
          </form>

          <div className="mt-5 flex flex-wrap gap-2 items-center">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/60 mr-1">Popular:</span>
            {popularTags.map((tag) => (
              <Link key={tag} to="/opportunities" className="px-3 py-1 bg-navy-soft font-mono text-[10px] font-bold uppercase text-navy hover:bg-navy hover:text-white transition-colors">{tag}</Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container-prose pb-12"><AdSlot format="leaderboard" /></div>

      <section className="container-prose py-12 border-t border-rule">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <span className="eyebrow text-orange">Editor's Choice</span>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl font-bold text-navy">Featured opportunities</h2>
          </div>
          <Link to="/opportunities" className="hidden sm:inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-navy hover:text-orange">View all <ArrowRight className="h-3 w-3" /></Link>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {featured.map((op) => (
            <OpportunityCard key={op.slug} opportunity={op} variant="feature" category={catMap[op.category]} />
          ))}
        </div>
      </section>

      <section className="container-prose py-16 border-t border-rule">
        <div className="mb-10">
          <span className="eyebrow text-orange">Browse the desk</span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl font-bold text-navy">Twelve categories. One global desk.</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-rule">
          {categories.map((cat) => {
            const Icon = (Icons as unknown as Record<string, typeof Globe2>)[cat.icon] ?? Sparkles;
            return (
              <Link key={cat.slug} to="/category/$slug" params={{ slug: cat.slug }} className="group bg-paper p-6 hover:bg-navy hover:text-white transition-colors">
                <Icon className="h-6 w-6 text-orange" />
                <h3 className="mt-4 font-serif text-lg font-bold text-navy group-hover:text-white">{cat.label}</h3>
                <p className="mt-1 text-xs text-ink-muted group-hover:text-white/70 leading-relaxed">{cat.blurb}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-prose py-16 border-t border-rule grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        <div>
          <span className="eyebrow text-orange">The Wire</span>
          <h2 className="mt-2 mb-8 font-serif text-3xl md:text-4xl font-bold text-navy">Latest briefings</h2>
          <div className="space-y-10">
            {latest.map((op, idx) => (
              <article key={op.slug} className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[220px_1fr] gap-6 pb-10 border-b border-rule last:border-b-0">
                <Link to="/opportunity/$slug" params={{ slug: op.slug }} className="block overflow-hidden bg-navy-soft aspect-square">
                  <img src={op.image} alt={op.title} loading="lazy" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
                </Link>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-orange">{(catMap[op.category]?.label ?? op.category).toString()}</span>
                  <h3 className="mt-2 font-serif text-2xl font-bold leading-tight text-navy">
                    <Link to="/opportunity/$slug" params={{ slug: op.slug }} className="hover:underline decoration-2 underline-offset-4">{op.title}</Link>
                  </h3>
                  <p className="mt-3 text-sm text-ink-muted leading-relaxed line-clamp-2">{op.excerpt}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70">
                    <span>{formatDate(op.publishedAt)}</span><span>·</span>
                    <span>{op.readingMinutes} min read</span><span>·</span>
                    <span>{op.country}</span>
                  </div>
                </div>
                {idx === 1 && <div className="md:col-span-2"><AdSlot format="in-article" /></div>}
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-10">
          <AdSlot format="rectangle" />
          <div>
            <h3 className="eyebrow text-ink-muted/70 mb-4 border-b border-rule pb-3">Trending now</h3>
            <ol className="space-y-4">
              {trending.map((op, i) => (
                <li key={op.slug} className="flex gap-3">
                  <span className="font-serif text-2xl font-black italic text-navy/10 leading-none">{String(i + 1).padStart(2, "0")}</span>
                  <Link to="/opportunity/$slug" params={{ slug: op.slug }} className="text-sm font-bold leading-snug text-navy hover:text-orange">{op.title}</Link>
                </li>
              ))}
            </ol>
          </div>
          <Newsletter variant="card" />
          <AdSlot format="skyscraper" />
        </aside>
      </section>

      <Newsletter />

      <section className="container-prose py-20 text-center border-t border-rule">
        <span className="eyebrow text-orange">From our readers</span>
        <blockquote className="mt-6 mx-auto max-w-3xl font-serif text-3xl md:text-4xl leading-snug text-navy text-balance">
          "I found my Chevening scholarship through OpportunityHub — and three months later I was on a plane to London. This site changes lives."
        </blockquote>
        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-ink-muted">Amara K. — Chevening Scholar, LSE '25</p>
      </section>
    </SiteLayout>
  );
}
