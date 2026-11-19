import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BRAND_NAME, pageTitle } from "@/lib/brand";
import { absoluteUrl } from "@/lib/site-url";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: pageTitle("Privacy Policy") },
      {
        name: "description",
        content: `How ${BRAND_NAME} collects, uses, and protects personal information including newsletter and submission data.`,
      },
      { property: "og:url", content: absoluteUrl("/privacy") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/privacy") }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteLayout>
      <article className="container-prose max-w-3xl py-16">
        <span className="eyebrow text-bridge">Legal</span>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl font-bold text-navy">Privacy Policy</h1>
        <p className="mt-4 text-sm text-ink-muted">Last updated: {new Date().toISOString().slice(0, 10)}</p>

        <div className="mt-10 space-y-6 text-ink-muted leading-relaxed">
          <p>
            {BRAND_NAME} provides opportunity discovery and editorial content. This policy describes how
            we handle personal data when you browse the site, subscribe to our newsletter, sign in as
            staff, or submit an opportunity for review.
          </p>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-navy">Information we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Newsletter:</strong> email and optional first name, stored in Supabase to
                operate the list.
              </li>
              <li>
                <strong>Submissions:</strong> form fields and contact email for editorial review.
              </li>
              <li>
                <strong>Staff accounts:</strong> credentials managed by Supabase Auth.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-navy">How we use information</h2>
            <p>
              We use data to deliver the newsletter, review submissions, secure admin access, and
              improve the platform. We do not sell personal information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-navy">Contact</h2>
            <p>
              Privacy questions:{" "}
              <a href="mailto:privacy@futurebridge.app" className="text-bridge underline underline-offset-4">
                privacy@futurebridge.app
              </a>{" "}
              (update before production launch).
            </p>
          </section>
        </div>
      </article>
    </SiteLayout>
  );
}