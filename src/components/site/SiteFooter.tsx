import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listCategories } from "@/lib/content";
import type { Category } from "@/data/opportunities";
import { BrandLogo } from "@/components/site/BrandLogo";
import { BRAND_COPYRIGHT, BRAND_JOURNAL, BRAND_SITE_DESCRIPTION, BRAND_TAGLINE } from "@/lib/brand";

export function SiteFooter() {
  const [cats, setCats] = useState<Category[]>([]);
  useEffect(() => {
    listCategories().then(setCats).catch(() => setCats([]));
  }, []);

  return (
    <footer className="mt-24 bg-navy text-white">
      <div className="container-prose py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <BrandLogo className="text-white hover:text-white [&_span]:text-bridge" size="large" />
          <p className="mt-4 max-w-sm text-sm text-white/60 leading-relaxed">{BRAND_TAGLINE}</p>
          <p className="mt-2 max-w-sm text-sm text-white/50 leading-relaxed">{BRAND_SITE_DESCRIPTION}</p>
        </div>
        <div>
          <h4 className="eyebrow text-white/50 mb-5">Discover</h4>
          <ul className="space-y-2.5 text-sm">
            {cats.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="text-white/75 hover:text-bridge transition-colors"
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
            <li>
              <Link to="/submit" className="text-white/75 hover:text-bridge">
                Submit Opportunity
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-white/75 hover:text-bridge">
                About
              </Link>
            </li>
            <li>
              <Link to="/blog" className="text-white/75 hover:text-bridge">
                {BRAND_JOURNAL}
              </Link>
            </li>
            <li>
              <Link to="/opportunities" className="text-white/75 hover:text-bridge">
                Browse All
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-prose flex flex-col sm:flex-row items-center justify-between gap-3 py-6 font-mono text-[10px] uppercase tracking-widest text-white/40">
          <span>© {new Date().getFullYear()} {BRAND_COPYRIGHT}</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link to="/unsubscribe" className="hover:text-white">
              Unsubscribe
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}