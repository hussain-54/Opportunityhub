import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BRAND_NAME, pageTitle } from "@/lib/brand";
import { absoluteUrl } from "@/lib/site-url";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: pageTitle("Terms of Use") },
      {
        name: "description",
        content: `Terms governing use of ${BRAND_NAME}, including editorial content, listings, and user submissions.`,
      },
      { property: "og:url", content: absoluteUrl("/terms") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/terms") }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteLayout>
      <article className="container-prose max-w-3xl py-16">
        <span className="eyebrow text-bridge">Legal</span>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl font-bold text-navy">Terms of Use</h1>
        <p className="mt-4 text-sm text-ink-muted">Last updated: {new Date().toISOString().slice(0, 10)}</p>

        <div className="mt-10 space-y-6 text-ink-muted leading-relaxed">
          <p>
            By using {BRAND_NAME}, you agree to these terms. If you do not agree, please do not use the platform.
          </p>

          <h2 className="font-serif text-2xl font-bold text-navy">Editorial content</h2>
          <p>
            Listings and articles are compiled from official sources and editorial research. Deadlines, eligibility,
            and funding details may change. Always confirm requirements on the official provider&apos;s website
            before applying.
          </p>

          <h2 className="font-serif text-2xl font-bold text-navy">Submissions</h2>
          <p>
            When you submit an opportunity, you represent that you have authority to share the information. Submissions
            are reviewed manually and are not guaranteed publication. {BRAND_NAME} may edit summaries for clarity and
            style.
          </p>

          <h2 className="font-serif text-2xl font-bold text-navy">Acceptable use</h2>
          <p>
            Do not misuse the site, attempt unauthorized access, scrape at scale, or upload malicious content. We may
            suspend access for abuse.
          </p>

          <h2 className="font-serif text-2xl font-bold text-navy">Disclaimer</h2>
          <p>
            The platform is provided &quot;as is.&quot; {BRAND_NAME} is not responsible for third-party programs,
            application outcomes, or external websites linked from listings.
          </p>

          <h2 className="font-serif text-2xl font-bold text-navy">Contact</h2>
          <p>
            Legal inquiries:{" "}
            <a href="mailto:legal@futurebridge.app" className="text-bridge underline underline-offset-4">
              legal@futurebridge.app
            </a>
            . Replace with your production contact before launch.
          </p>
        </div>
      </article>
    </SiteLayout>
  );
}