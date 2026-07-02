import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, FolderTree, Newspaper, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [counts, setCounts] = useState({ opportunities: 0, categories: 0, posts: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("opportunities").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    ]).then(([o, c, b]) => {
      setCounts({
        opportunities: o.count ?? 0,
        categories: c.count ?? 0,
        posts: b.count ?? 0,
      });
    });
  }, []);

  const cards = [
    { to: "/admin/opportunities", label: "Opportunities", count: counts.opportunities, Icon: FileText },
    { to: "/admin/categories", label: "Categories", count: counts.categories, Icon: FolderTree },
    { to: "/admin/blog", label: "Journal posts", count: counts.posts, Icon: Newspaper },
  ];

  return (
    <div>
      <p className="text-ink-muted text-lg max-w-2xl">
        Manage every piece of content on OpportunityHub. Changes go live immediately for published items.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {cards.map(({ to, label, count, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group block border border-rule bg-white p-6 hover:border-navy transition-colors"
          >
            <Icon className="h-6 w-6 text-orange" />
            <div className="mt-4 font-serif text-4xl font-bold text-navy">{count}</div>
            <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted group-hover:text-orange">
              {label}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 max-w-2xl">
        <Link to="/" className="flex items-center justify-between border border-rule bg-paper px-5 py-4 hover:bg-navy hover:text-white transition-colors group">
          <span className="font-mono text-xs font-bold uppercase tracking-widest">View live site</span>
          <ExternalLink className="h-4 w-4 text-orange group-hover:text-white" />
        </Link>
        <Link to="/sitemap.xml" className="flex items-center justify-between border border-rule bg-paper px-5 py-4 hover:bg-navy hover:text-white transition-colors group">
          <span className="font-mono text-xs font-bold uppercase tracking-widest">Sitemap</span>
          <ExternalLink className="h-4 w-4 text-orange group-hover:text-white" />
        </Link>
      </div>
    </div>
  );
}
