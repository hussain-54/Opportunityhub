import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, Fragment, useEffect } from "react";
import { Search } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { OpportunityCard } from "@/components/site/OpportunityCard";
import { AdSlot } from "@/components/site/AdSlot";
import { listCategories, listOpportunities, buildCategoryMap } from "@/lib/content";
import type { Category, Opportunity } from "@/data/opportunities";
import { getDeadlineStatus } from "@/lib/opportunity-status";
import { BRAND_NAME, pageTitle } from "@/lib/brand";
import { absoluteUrl } from "@/lib/site-url";

type SortKey = "newest" | "deadline" | "title";

type OpportunitiesSearch = {
  q?: string;
  category?: string;
};

export const Route = createFileRoute("/opportunities")({
  validateSearch: (search: Record<string, unknown>): OpportunitiesSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  loader: async () => {
    const [categories, opportunities] = await Promise.all([
      listCategories(),
      listOpportunities(),
    ]);
    return { categories, opportunities };
  },
  head: () => ({
    meta: [
      { title: pageTitle("Browse Opportunities") },
      {
        name: "description",
        content:
          "Search and filter scholarships, fellowships, grants, accelerators, internships, and programs by category, country, funding, and deadline.",
      },
      { property: "og:title", content: `${BRAND_NAME} — Browse Opportunities` },
      {
        property: "og:description",
        content: "Filter live opportunities by category, country, funding, and deadline.",
      },
      { property: "og:url", content: absoluteUrl("/opportunities") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/opportunities") }],
  }),
  component: OpportunitiesPage,
});

const PAGE_SIZE = 24;

function OpportunitiesPage() {
  const { categories, opportunities } = Route.useLoaderData() as {
    categories: Category[];
    opportunities: Opportunity[];
  };
  const { q: initialQ, category: initialCategory } = Route.useSearch();
  const catMap = buildCategoryMap(categories);

  const [query, setQuery] = useState(initialQ ?? "");
  const [category, setCategory] = useState<string>(initialCategory ?? "all");
  const [country, setCountry] = useState<string>("all");
  const [funding, setFunding] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "open" | "closed">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    if (initialQ) setQuery(initialQ);
    if (initialCategory) setCategory(initialCategory);
  }, [initialQ, initialCategory]);

  const fundingOptions = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.funding).filter(Boolean))).sort(),
    [opportunities],
  );

  const countryOptions = useMemo(
    () => Array.from(new Set(opportunities.map((o) => o.country).filter(Boolean))).sort(),
    [opportunities],
  );

  const filtered = useMemo(() => {
    let list = opportunities.filter((op) => {
      if (category !== "all" && op.category !== category) return false;
      if (funding !== "all" && op.funding !== funding) return false;
      if (country !== "all" && op.country !== country) return false;

      if (status === "open") {
        const ds = getDeadlineStatus(op.deadline);
        if (ds === "closed") return false;
      }
      if (status === "closed") {
        if (getDeadlineStatus(op.deadline) !== "closed") return false;
      }

      if (query.trim()) {
        const q = query.toLowerCase();
        const haystack = [
          op.title,
          op.country,
          op.excerpt,
          op.organizer,
          op.category,
          catMap[op.category]?.label,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "deadline") {
        const da = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
        const db = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
        return da - db;
      }
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return list;
  }, [opportunities, query, category, funding, country, status, sort, catMap]);

  const page = filtered.slice(0, visible);

  return (
    <SiteLayout>
      <section className="container-prose pt-16 pb-10">
        <span className="eyebrow text-bridge">Discover</span>
        <h1 className="mt-3 font-serif text-4xl md:text-6xl font-bold tracking-tight text-navy">All opportunities</h1>
        <p className="mt-4 max-w-2xl text-ink-muted text-lg">
          {filtered.length} {filtered.length === 1 ? "listing" : "listings"} match your filters.
          {status === "open" ? " Showing programs with open or rolling deadlines." : ""}
        </p>

        <div className="mt-10 space-y-3">
          <div className="flex items-center gap-2 border border-rule bg-white px-3 py-2">
            <Search className="h-4 w-4 text-ink-muted shrink-0" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Search by title, country, organization, or keyword"
              className="flex-1 outline-none text-sm py-2"
              aria-label="Search opportunities"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5 border border-rule bg-white p-3">
            <FilterSelect
              label="Category"
              value={category}
              onChange={(v) => {
                setCategory(v);
                setVisible(PAGE_SIZE);
              }}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect label="Country" value={country} onChange={setCountry}>
              <option value="all">All countries</option>
              {countryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect label="Funding" value={funding} onChange={setFunding}>
              <option value="all">All funding</option>
              {fundingOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect label="Status" value={status} onChange={(v) => setStatus(v as typeof status)}>
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </FilterSelect>
            <FilterSelect label="Sort" value={sort} onChange={(v) => setSort(v as SortKey)}>
              <option value="newest">Newest first</option>
              <option value="deadline">Deadline soonest</option>
              <option value="title">Title A–Z</option>
            </FilterSelect>
          </div>
        </div>
      </section>

      <section className="container-prose pb-20">
        {filtered.length === 0 ? (
          <div className="border border-rule p-16 text-center rounded-sm bg-white">
            <p className="font-serif text-2xl text-navy">No opportunities match those filters.</p>
            <p className="mt-2 text-ink-muted">Try widening your search or clearing status filters.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {page.map((op, idx) => (
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
            {visible < filtered.length && (
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="bg-navy px-8 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-bridge transition-colors"
                >
                  Load more ({filtered.length - visible} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-ink-muted/70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="outline-none text-sm py-2 px-2 bg-white font-sans border border-rule"
      >
        {children}
      </select>
    </label>
  );
}