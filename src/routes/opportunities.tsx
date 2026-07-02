import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, Fragment } from "react";
import { Search } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { OpportunityCard } from "@/components/site/OpportunityCard";
import { AdSlot } from "@/components/site/AdSlot";
import { listCategories, listOpportunities, buildCategoryMap } from "@/lib/content";
import type { Category, Opportunity } from "@/data/opportunities";

export const Route = createFileRoute("/opportunities")({
  loader: async () => {
    const [categories, opportunities] = await Promise.all([
      listCategories(),
      listOpportunities(),
    ]);
    return { categories, opportunities };
  },
  head: () => ({
    meta: [
      { title: "Browse All Opportunities — OpportunityHub" },
      { name: "description", content: "Search and filter every scholarship, fellowship, grant, accelerator, internship, and hackathon currently open worldwide." },
      { property: "og:title", content: "Browse All Opportunities — OpportunityHub" },
      { property: "og:description", content: "Filter live opportunities by category, country, funding, and deadline. Updated every morning." },
      { property: "og:url", content: "/opportunities" },
    ],
    links: [{ rel: "canonical", href: "/opportunities" }],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const { categories, opportunities } = Route.useLoaderData() as { categories: Category[]; opportunities: Opportunity[] };
  const catMap = buildCategoryMap(categories);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [funding, setFunding] = useState<string>("all");

  const fundingOptions = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.funding).filter(Boolean))),
    [opportunities],
  );

  const filtered = useMemo(() => {
    return opportunities.filter((op) => {
      if (category !== "all" && op.category !== category) return false;
      if (funding !== "all" && op.funding !== funding) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !op.title.toLowerCase().includes(q) &&
          !op.country.toLowerCase().includes(q) &&
          !op.excerpt.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [opportunities, query, category, funding]);

  return (
    <SiteLayout>
      <section className="container-prose pt-16 pb-10">
        <span className="eyebrow text-orange">The Bulletin</span>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl font-bold tracking-tight text-navy">All open opportunities</h1>
        <p className="mt-4 max-w-2xl text-ink-muted text-lg">
          {filtered.length} live opportunity{filtered.length === 1 ? "" : "ies"} — refreshed every morning by our editors.
        </p>

        <div className="mt-10 grid gap-3 md:grid-cols-[1fr_220px_220px] border border-rule bg-white p-3">
          <div className="flex items-center gap-2 border-r border-rule pr-3">
            <Search className="h-4 w-4 text-ink-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, country, or keyword" className="flex-1 outline-none text-sm py-2" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border-r border-rule outline-none text-sm py-2 px-2 bg-white font-mono uppercase tracking-wider text-xs">
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
          <select value={funding} onChange={(e) => setFunding(e.target.value)} className="outline-none text-sm py-2 px-2 bg-white font-mono uppercase tracking-wider text-xs">
            <option value="all">All funding</option>
            {fundingOptions.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="container-prose pb-20">
        {filtered.length === 0 ? (
          <div className="border border-rule p-16 text-center">
            <p className="font-serif text-2xl text-navy">No opportunities match those filters.</p>
            <p className="mt-2 text-ink-muted">Try widening your search.</p>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((op, idx) => (
              <Fragment key={op.slug}>
                <OpportunityCard opportunity={op} category={catMap[op.category]} />
                {idx === 2 && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <AdSlot format="leaderboard" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
