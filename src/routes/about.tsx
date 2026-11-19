import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Newsletter } from "@/components/site/Newsletter";
import { listCategories, listOpportunities } from "@/lib/content";
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_TAGLINE_ALT,
  pageTitle,
} from "@/lib/brand";
import { absoluteUrl } from "@/lib/site-url";

export const Route = createFileRoute("/about")({
  loader: async () => {
    const [opportunities, categories] = await Promise.all([
      listOpportunities(),
      listCategories(),
    ]);
    const countries = new Set(opportunities.map((o) => o.country).filter(Boolean));
    return {
      opportunityCount: opportunities.length,
      categoryCount: categories.length,
      countryCount: countries.size,
    };
  },
  head: () => ({
    meta: [
      { title: pageTitle("About") },
      {
        name: "description",
        content: `${BRAND_NAME} connects ambitious people with opportunities to learn, lead, research, build, and make a global impact.`,
      },
      { property: "og:title", content: `About ${BRAND_NAME}` },
      {
        property: "og:description",
        content: BRAND_TAGLINE,
      },
      { property: "og:url", content: absoluteUrl("/about") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/about") }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { opportunityCount, categoryCount, countryCount } = Route.useLoaderData();

  return (
    <SiteLayout>
      <section className="container-prose pt-16 pb-16 max-w-4xl">
        <span className="eyebrow text-bridge">About {BRAND_NAME}</span>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl font-bold text-navy tracking-tight leading-[1.05] text-balance">
          {BRAND_TAGLINE}
        </h1>
        <p className="mt-8 text-xl text-ink-muted leading-relaxed">{BRAND_TAGLINE_ALT}</p>
        <p className="mt-6 text-lg text-ink-muted leading-relaxed">
          {BRAND_NAME} connects ambitious people with opportunities to learn, lead, research, build,
          and make a global impact. We publish verified listings across scholarships, fellowships,
          grants, accelerators, conferences, internships, research programs, and more — with clear
          deadlines and links to official providers.
        </p>
      </section>

      <section className="bg-navy text-white">
        <div className="container-prose py-16 grid md:grid-cols-3 gap-12">
          <Stat number={String(opportunityCount)} label="Published opportunities" footnote="Live in database" />
          <Stat number={String(categoryCount)} label="Categories" footnote="Browse paths" />
          <Stat number={String(countryCount)} label="Countries represented" footnote="From current listings" />
        </div>
      </section>

      <section className="container-prose py-20 grid md:grid-cols-2 gap-12 max-w-5xl">
        <div>
          <h2 className="font-serif text-3xl font-bold text-navy mb-4">Editorial standards</h2>
          <p className="text-ink-muted leading-relaxed">
            Every opportunity is checked against an official source before publication. We do not
            fabricate eligibility, funding, or deadlines. When information is missing, we say so and
            link you to the provider.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-3xl font-bold text-navy mb-4">For organizations</h2>
          <p className="text-ink-muted leading-relaxed">
            Universities, foundations, and accelerators can{" "}
            <Link to="/submit" className="text-bridge underline underline-offset-4">
              submit an opportunity
            </Link>{" "}
            for editorial review. Submissions are not published automatically — our team verifies
            details before a listing goes live.
          </p>
        </div>
      </section>

      <Newsletter />
    </SiteLayout>
  );
}

function Stat({
  number,
  label,
  footnote,
}: {
  number: string;
  label: string;
  footnote: string;
}) {
  return (
    <div>
      <p className="font-serif text-5xl md:text-6xl font-black italic text-bridge leading-none">{number}</p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-white/80">{label}</p>
      <p className="mt-1 text-xs text-white/40">{footnote}</p>
    </div>
  );
}