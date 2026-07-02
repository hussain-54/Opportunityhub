import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listCategories, listOpportunities, listBlogPosts } from "@/lib/content";

const BASE_URL = "";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [categories, opportunities, blogPosts] = await Promise.all([
          listCategories().catch(() => []),
          listOpportunities().catch(() => []),
          listBlogPosts().catch(() => []),
        ]);

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/opportunities", changefreq: "daily", priority: "0.9" },
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
          { path: "/about", changefreq: "monthly", priority: "0.5" },
          { path: "/submit", changefreq: "monthly", priority: "0.5" },
          ...categories.map((c) => ({ path: `/category/${c.slug}`, changefreq: "daily" as const, priority: "0.8" })),
          ...opportunities.map((o) => ({ path: `/opportunity/${o.slug}`, lastmod: o.publishedAt, changefreq: "weekly" as const, priority: "0.8" })),
          ...blogPosts.map((b) => ({ path: `/blog/${b.slug}`, lastmod: b.publishedAt, changefreq: "monthly" as const, priority: "0.6" })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
