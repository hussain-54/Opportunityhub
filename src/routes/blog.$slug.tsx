import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AdSlot } from "@/components/site/AdSlot";
import { Newsletter } from "@/components/site/Newsletter";
import { getBlogPostBySlug } from "@/lib/content";
import type { BlogPost } from "@/data/opportunities";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getBlogPostBySlug(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Article — OpportunityHub" }] };
    return {
      meta: [
        { title: `${loaderData.title} — OpportunityHub` },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${params.slug}` },
        { property: "og:image", content: loaderData.image },
        { name: "twitter:image", content: loaderData.image },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData.title,
            datePublished: loaderData.publishedAt,
            author: { "@type": "Person", name: loaderData.author },
            image: loaderData.image,
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-prose py-32 text-center">
        <h1 className="font-serif text-4xl text-navy">Article not found</h1>
        <Link to="/blog" className="mt-6 inline-flex bg-navy px-5 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white hover:bg-orange">Back to Journal</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout><div className="container-prose py-32 text-center text-danger">Something went wrong.</div></SiteLayout>
  ),
  component: BlogPostPage,
});

function BlogPostPage() {
  const post = Route.useLoaderData() as BlogPost;
  return (
    <SiteLayout>
      <article className="container-prose pt-12 pb-16 max-w-4xl">
        <span className="eyebrow text-orange">{post.category}</span>
        <h1 className="mt-3 font-serif text-4xl md:text-6xl font-bold leading-[1.1] text-navy text-balance">{post.title}</h1>
        <p className="mt-5 text-xl text-ink-muted leading-relaxed">{post.excerpt}</p>
        <div className="mt-6 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-widest text-ink-muted/70">
          <span>{post.author}</span><span>·</span>
          <span>{formatDate(post.publishedAt)}</span><span>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>
        <div className="my-10 aspect-[16/8] overflow-hidden bg-navy-soft">
          <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-6 text-lg leading-relaxed text-ink-muted">
          {post.body.map((p, i) => (<p key={i}>{p}</p>))}
        </div>
        <div className="my-12"><AdSlot format="in-article" /></div>
      </article>
      <Newsletter />
    </SiteLayout>
  );
}
