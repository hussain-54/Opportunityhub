import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, MapPin, Calendar, Coins, Building2, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AdSlot } from "@/components/site/AdSlot";
import { Newsletter } from "@/components/site/Newsletter";
import { OpportunityCard } from "@/components/site/OpportunityCard";
import { getOpportunityBySlug, listOpportunities, getCategoryBySlug } from "@/lib/content";
import type { Category, Opportunity } from "@/data/opportunities";
import { formatDate, deadlineLabel } from "@/lib/format";

export const Route = createFileRoute("/opportunity/$slug")({
  loader: async ({ params }) => {
    const op = await getOpportunityBySlug(params.slug);
    if (!op) throw notFound();
    const [cat, sameCat] = await Promise.all([
      getCategoryBySlug(op.category),
      listOpportunities({ category: op.category, limit: 4 }),
    ]);
    const related = sameCat.filter((o) => o.slug !== op.slug).slice(0, 3);
    return { op, cat, related };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Opportunity — OpportunityHub" }] };
    const { op, cat } = loaderData;
    return {
      meta: [
        { title: `${op.title} — OpportunityHub` },
        { name: "description", content: op.excerpt },
        { property: "og:title", content: op.title },
        { property: "og:description", content: op.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/opportunity/${params.slug}` },
        { property: "og:image", content: op.image },
        { name: "twitter:image", content: op.image },
        { name: "twitter:title", content: op.title },
        { name: "twitter:description", content: op.excerpt },
        ...(cat ? [{ name: "article:section", content: cat.label }] : []),
      ],
      links: [{ rel: "canonical", href: `/opportunity/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: op.title,
            description: op.excerpt,
            datePosted: op.publishedAt,
            validThrough: op.deadline,
            employmentType: "OTHER",
            hiringOrganization: { "@type": "Organization", name: op.organizer },
            jobLocation: {
              "@type": "Place",
              address: { "@type": "PostalAddress", addressCountry: op.country },
            },
          }),
        },
      ],
    };
  },
  component: OpportunityDetail,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-prose py-32 text-center">
        <h1 className="font-serif text-4xl text-navy">Opportunity not found</h1>
        <Link to="/opportunities" className="mt-6 inline-flex bg-navy px-5 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white hover:bg-orange transition-colors">
          Browse all opportunities
        </Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="container-prose py-32 text-center"><p className="text-danger">{error.message}</p></div>
    </SiteLayout>
  ),
});

function OpportunityDetail() {
  const { op, cat, related } = Route.useLoaderData() as { op: Opportunity; cat: Category | null; related: Opportunity[] };
  const catLabel = cat?.label ?? op.category;

  return (
    <SiteLayout>
      <article>
        <header className="container-prose pt-12 pb-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-6">
            <Link to="/" className="hover:text-navy">Home</Link>
            <span>/</span>
            <Link to="/category/$slug" params={{ slug: op.category }} className="hover:text-navy">{catLabel}</Link>
            <span>/</span>
            <span className="text-navy">Opportunity</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-orange text-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">{catLabel}</span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">{op.country}</span>
            {op.deadline && (
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-danger">Closes {deadlineLabel(op.deadline)}</span>
            )}
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold leading-[1.1] text-navy text-balance max-w-4xl">{op.title}</h1>
          <p className="mt-5 max-w-3xl text-xl text-ink-muted leading-relaxed">{op.excerpt}</p>

          <div className="mt-6 flex flex-wrap gap-4 font-mono text-[11px] uppercase tracking-widest text-ink-muted/70">
            <span>Published {formatDate(op.publishedAt)}</span>
            <span>·</span>
            <span>{op.readingMinutes} min read</span>
          </div>
        </header>

        <div className="container-prose">
          <div className="aspect-[16/7] overflow-hidden bg-navy-soft">
            <img src={op.image} alt={op.title} className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="container-prose mt-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 pb-20">
          <div>
            <div className="border border-rule bg-white p-6 mb-10">
              <h2 className="eyebrow text-ink-muted/70 mb-5">Quick facts</h2>
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Fact icon={<Coins className="h-4 w-4" />} label="Funding" value={op.fundingAmount ?? op.funding} />
                <Fact icon={<MapPin className="h-4 w-4" />} label="Location" value={op.country} />
                <Fact icon={<Calendar className="h-4 w-4" />} label="Deadline" value={op.deadline ? formatDate(op.deadline) : "Rolling"} />
                <Fact icon={<Building2 className="h-4 w-4" />} label="Organizer" value={op.organizer} />
              </dl>
            </div>

            {op.overview.length > 0 && (
              <Section title="Overview">
                {op.overview.map((p, i) => (
                  <p key={i} className="text-ink-muted leading-relaxed text-lg mb-4">{p}</p>
                ))}
              </Section>
            )}

            {op.benefits.length > 0 && (
              <Section title="Benefits"><BulletList items={op.benefits} /></Section>
            )}

            <div className="my-10"><AdSlot format="in-article" /></div>

            {op.eligibility.length > 0 && (
              <Section title="Eligibility"><BulletList items={op.eligibility} /></Section>
            )}

            {op.documents.length > 0 && (
              <Section title="Required documents"><BulletList items={op.documents} /></Section>
            )}

            {op.process.length > 0 && (
              <Section title="Application process">
                <ol className="space-y-4 text-ink-muted">
                  {op.process.map((step, i) => (
                    <li key={i} className="grid grid-cols-[40px_1fr] gap-4">
                      <span className="font-serif text-3xl italic font-black text-orange leading-none">{i + 1}</span>
                      <span className="leading-relaxed text-lg pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            <div className="mt-12 border-t-2 border-navy pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="eyebrow text-ink-muted/70">Ready to apply?</span>
                <p className="mt-1 font-serif text-2xl font-bold text-navy">Visit the official portal for {op.organizer}.</p>
              </div>
              <a href={op.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-navy px-6 py-4 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-orange transition-colors">
                Apply now <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <aside className="space-y-10">
            <AdSlot format="rectangle" />
            <div>
              <h3 className="eyebrow text-ink-muted/70 mb-4 border-b border-rule pb-3">More in {catLabel}</h3>
              <ul className="space-y-5">
                {related.length === 0 && <li className="text-sm text-ink-muted">No related opportunities yet.</li>}
                {related.map((r, i) => (
                  <li key={r.slug} className="flex gap-3">
                    <span className="font-serif text-2xl font-black italic text-navy/10 leading-none">{String(i + 1).padStart(2, "0")}</span>
                    <Link to="/opportunity/$slug" params={{ slug: r.slug }} className="text-sm font-bold leading-snug text-navy hover:text-orange">{r.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <Newsletter variant="card" />
            <AdSlot format="skyscraper" />
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="container-prose py-16 border-t border-rule">
          <span className="eyebrow text-orange">Keep exploring</span>
          <h2 className="mt-2 mb-10 font-serif text-3xl md:text-4xl font-bold text-navy">Related opportunities</h2>
          <div className="grid gap-10 md:grid-cols-3">
            {related.map((r) => (
              <OpportunityCard key={r.slug} opportunity={r} category={cat ?? undefined} />
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-orange mb-2">{icon}</div>
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 block">{label}</span>
      <span className="mt-1 block font-serif text-base font-bold text-navy leading-tight">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-5 border-l-4 border-orange pl-4">{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[20px_1fr] gap-3 text-ink-muted text-lg leading-relaxed">
          <CheckCircle2 className="h-5 w-5 text-orange mt-1" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
