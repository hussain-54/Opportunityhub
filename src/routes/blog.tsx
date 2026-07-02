import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AdSlot } from "@/components/site/AdSlot";
import { Newsletter } from "@/components/site/Newsletter";
import { listBlogPosts } from "@/lib/content";
import type { BlogPost } from "@/data/opportunities";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/blog")({
  loader: async () => ({ posts: await listBlogPosts() }),
  head: () => ({
    meta: [
      { title: "Journal — OpportunityHub" },
      { name: "description", content: "Essays and guides on scholarships, startup funding, fellowships, and study abroad from OpportunityHub's editors." },
      { property: "og:title", content: "Journal — OpportunityHub" },
      { property: "og:description", content: "Essays and guides for ambitious global readers." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { posts } = Route.useLoaderData() as { posts: BlogPost[] };
  return (
    <SiteLayout>
      <section className="container-prose pt-16 pb-10">
        <span className="eyebrow text-orange">Journal</span>
        <h1 className="mt-3 font-serif text-5xl md:text-7xl font-bold text-navy tracking-tight">Essays & guides</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          Reported essays and field-tested guides for scholarship hunters, founders, and researchers chasing global opportunities.
        </p>
      </section>

      <section className="container-prose pb-20 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12">
          {posts.length === 0 && (
            <p className="text-ink-muted">No articles published yet. Check back soon.</p>
          )}
          {posts.map((post, idx) => (
            <article key={post.slug} className="grid md:grid-cols-[260px_1fr] gap-8 pb-12 border-b border-rule">
              <Link to="/blog/$slug" params={{ slug: post.slug }} className="block overflow-hidden bg-navy-soft aspect-[4/3]">
                <img src={post.image} alt={post.title} loading={idx === 0 ? "eager" : "lazy"} className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
              </Link>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-orange">{post.category}</span>
                <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-navy">
                  <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:underline decoration-2 underline-offset-4">{post.title}</Link>
                </h2>
                <p className="mt-3 text-ink-muted leading-relaxed">{post.excerpt}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70">
                  <span>{formatDate(post.publishedAt)}</span><span>·</span>
                  <span>{post.readingMinutes} min read</span><span>·</span>
                  <span>{post.author}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <aside className="space-y-10">
          <AdSlot format="rectangle" />
          <Newsletter variant="card" />
          <AdSlot format="skyscraper" />
        </aside>
      </section>
    </SiteLayout>
  );
}
