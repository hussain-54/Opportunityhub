import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth, ADMIN_EMAIL } from "@/lib/use-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — OpportunityHub" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { session, isAdmin, loading, email, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="container-prose py-32 text-center text-ink-muted">Loading…</div>
      </SiteLayout>
    );
  }

  if (!session) return null;

  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="container-prose py-24 max-w-xl">
          <span className="eyebrow text-orange">Access denied</span>
          <h1 className="mt-3 font-serif text-4xl font-bold text-navy">Not an admin</h1>
          <p className="mt-4 text-ink-muted">
            You are signed in as <span className="font-mono text-navy">{email}</span>, but the admin panel is restricted to <span className="font-mono text-navy">{ADMIN_EMAIL}</span>.
          </p>
          <button
            onClick={() => signOut()}
            className="mt-6 inline-flex bg-navy px-5 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white hover:bg-orange"
          >
            Sign out
          </button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-prose pt-10 pb-4 flex flex-wrap items-end justify-between gap-4 border-b border-rule">
        <div>
          <span className="eyebrow text-orange">Newsroom</span>
          <h1 className="mt-2 font-serif text-3xl font-bold text-navy">Admin</h1>
        </div>
        <nav className="flex flex-wrap gap-1 font-mono text-[10px] font-bold uppercase tracking-widest">
          <AdminLink to="/admin">Dashboard</AdminLink>
          <AdminLink to="/admin/opportunities">Opportunities</AdminLink>
          <AdminLink to="/admin/categories">Categories</AdminLink>
          <AdminLink to="/admin/blog">Journal</AdminLink>
          <button
            onClick={() => signOut()}
            className="px-3 py-2 text-ink-muted hover:text-orange"
          >
            Sign out
          </button>
        </nav>
      </div>
      <div className="container-prose py-10">
        <Outlet />
      </div>
    </SiteLayout>
  );
}

function AdminLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/admin" }}
      className="px-3 py-2 text-navy hover:text-orange"
      activeProps={{ className: "px-3 py-2 bg-navy text-white" }}
    >
      {children}
    </Link>
  );
}
