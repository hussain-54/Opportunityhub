import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Newsletter } from "@/components/site/Newsletter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About OpportunityHub" },
      {
        name: "description",
        content:
          "OpportunityHub is the global newsroom for scholarships, fellowships, grants, and startup opportunities. Learn about our editors, mission, and standards.",
      },
      { property: "og:title", content: "About OpportunityHub" },
      {
        property: "og:description",
        content:
          "The global newsroom for life-changing scholarships, fellowships, grants, and startup opportunities.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="container-prose pt-16 pb-16 max-w-4xl">
        <span className="eyebrow text-orange">Our mission</span>
        <h1 className="mt-3 font-serif text-5xl md:text-7xl font-bold text-navy tracking-tight leading-[1.05] text-balance">
          The global newsroom for{" "}
          <span className="italic text-orange">life-changing</span> opportunities.
        </h1>
        <p className="mt-8 text-xl text-ink-muted leading-relaxed">
          OpportunityHub is a daily destination for students, entrepreneurs, researchers, and
          changemakers searching for the funding, fellowships, and platforms that will define
          their next decade.
        </p>
        <p className="mt-6 text-lg text-ink-muted leading-relaxed">
          Our editors track more than 1,200 active programs across 90 countries — scholarships,
          fellowships, grants, accelerators, conferences, hackathons, internships, and research
          placements — and publish what's open, what's worth applying to, and how to win.
        </p>
      </section>

      <section className="bg-navy text-white">
        <div className="container-prose py-20 grid md:grid-cols-3 gap-12">
          <Stat number="100k+" label="Monthly readers" />
          <Stat number="1,200" label="Live opportunities" />
          <Stat number="90" label="Countries covered" />
        </div>
      </section>

      <section className="container-prose py-20 grid md:grid-cols-2 gap-12 max-w-5xl">
        <div>
          <h2 className="font-serif text-3xl font-bold text-navy mb-4">
            Editorial standards
          </h2>
          <p className="text-ink-muted leading-relaxed">
            Every opportunity is verified against the official source before publication. We never
            charge organizations for editorial coverage and we disclose every sponsored listing.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-3xl font-bold text-navy mb-4">For organizations</h2>
          <p className="text-ink-muted leading-relaxed">
            Universities, foundations, and accelerators can{" "}
            <Link to="/submit" className="text-orange underline underline-offset-4">
              submit an opportunity
            </Link>{" "}
            for free editorial review or contact our partnerships team about featured placements,
            newsletter sponsorships, and recruiting packages.
          </p>
        </div>
      </section>

      <Newsletter />
    </SiteLayout>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-6xl md:text-7xl font-black italic text-orange leading-none">
        {number}
      </p>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-white/60">{label}</p>
    </div>
  );
}
