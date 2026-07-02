import { Link } from "@tanstack/react-router";
import { Menu, Search, Shield, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/use-auth";

const nav = [
  { to: "/opportunities", label: "Opportunities" },
  { to: "/category/scholarships", label: "Scholarships" },
  { to: "/category/grants", label: "Grants" },
  { to: "/category/fellowships", label: "Fellowships" },
  { to: "/category/accelerators", label: "Accelerators" },
  { to: "/blog", label: "Journal" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="container-prose flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-serif text-2xl font-black tracking-tight text-navy">
            OpportunityHub<span className="text-orange">.</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-ink-muted">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="hover:text-navy transition-colors"
                activeProps={{ className: "text-navy font-semibold" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/opportunities"
            aria-label="Search opportunities"
            className="hidden sm:grid h-10 w-10 place-items-center text-ink-muted hover:text-navy"
          >
            <Search className="h-4 w-4" />
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              aria-label="Admin"
              title="Admin"
              className="hidden sm:grid h-10 w-10 place-items-center text-orange hover:text-navy"
            >
              <Shield className="h-4 w-4" />
            </Link>
          )}
          <Link
            to="/submit"
            className="hidden sm:inline-flex items-center bg-navy px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-orange transition-colors"
          >
            Submit
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid h-10 w-10 place-items-center text-navy"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-rule bg-paper">
          <div className="container-prose flex flex-col py-4 gap-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium text-navy"
              >
                {n.label}
              </Link>
            ))}
         
          </div>
        </div>
      )}
    </header>
  );
}
