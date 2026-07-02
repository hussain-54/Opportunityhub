import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { OpportunityCard } from "@/components/site/OpportunityCard";
import { AdSlot } from "@/components/site/AdSlot";
import { getCategoryBySlug, listOpportunities } from "@/lib/content";
import type { Category, Opportunity } from "@/data/opportunities";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const cat = await getCategoryBySlug(params.slug);
    if (!cat) throw notFound();
    const items = await listOpportunities({ category: cat.slug });
    return { cat, items };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Category — OpportunityHub" }] };
    const { cat } = loaderData;
    return {
      meta: [
        { title: `${cat.label} — Open opportunities | OpportunityHub` },
        { name: "description", content: `${cat.blurb} Live, fully curated, and updated daily.` },
        { property: "og:title", content: `${cat.label} — OpportunityHub` },
        { property: "og:description", content: cat.blurb },
        { property: "og:url", content: `/category/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/category/${params.slug}` }],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-prose py-32 text-center">
        <h1 className="font-serif text-4xl text-navy">Category not found</h1>
        <Link to="/" className="mt-6 inline-flex bg-navy px-5 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white hover:bg-orange">Back to home</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout><div className="container-prose py-32 text-center text-danger">Something went wrong.</div></SiteLayout>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat, items } = Route.useLoaderData() as { cat: Category; items: Opportunity[] };

  return (
    <SiteLayout>
      <section className="container-prose pt-16 pb-10">
        <span className="eyebrow text-orange">Category</span>
        <h1 className="mt-3 font-serif text-5xl md:text-7xl font-bold text-navy tracking-tight">{cat.label}</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{cat.blurb}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-ink-muted/70">
          {items.length} live opportunity{items.length === 1 ? "" : "ies"}
        </p>
      </section>

      <section className="container-prose pb-20">
        {items.length === 0 ? (
          <div className="border border-rule p-16 text-center">
            <p className="font-serif text-2xl text-navy">No live opportunities right now.</p>
            <p className="mt-2 text-ink-muted">Check back soon or subscribe to The Briefing.</p>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {items.map((op) => (
              <OpportunityCard key={op.slug} opportunity={op} category={cat} />
            ))}
          </div>
        )}
        <div className="mt-16"><AdSlot format="leaderboard" /></div>
      </section>
    </SiteLayout>
  );
}
