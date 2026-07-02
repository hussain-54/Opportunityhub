import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listCategories } from "@/lib/content";
import type { Category } from "@/data/opportunities";

export function SiteFooter() {
  const [cats, setCats] = useState<Category[]>([]);
  useEffect(() => {
    listCategories().then(setCats).catch(() => setCats([]));
  }, []);

  return (
    <footer className="mt-24 bg-navy text-white">
      <div className="container-prose py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="font-serif text-3xl font-black italic">
            OpportunityHub<span className="text-orange">.</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-white/60 leading-relaxed">
            The global newsroom for scholarships, fellowships, grants, accelerators, and life-changing
            opportunities — curated daily by our editors.
          </p>
        </div>
        <div>
          <h4 className="eyebrow text-white/50 mb-5">Discover</h4>
          <ul className="space-y-2.5 text-sm">
            {cats.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="text-white/75 hover:text-orange transition-colors"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="eyebrow text-white/50 mb-5">Platform</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/submit" className="text-white/75 hover:text-orange">Submit Opportunity</Link></li>
            <li><Link to="/about" className="text-white/75 hover:text-orange">About</Link></li>
            <li><Link to="/blog" className="text-white/75 hover:text-orange">Journal</Link></li>
            <li><Link to="/opportunities" className="text-white/75 hover:text-orange">Browse All</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-prose flex flex-col sm:flex-row items-center justify-between gap-3 py-6 font-mono text-[10px] uppercase tracking-widest text-white/40">
          <span>© {new Date().getFullYear()} OpportunityHub Media Group</span>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Advertise</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
