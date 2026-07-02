import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, ADMIN_EMAIL } from "@/lib/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — OpportunityHub" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, isAdmin } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session && isAdmin) navigate({ to: "/admin" });
  }, [session, isAdmin, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const redirectTo = `${window.location.origin}/admin`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) throw error;
        toast.success("Account created. You can sign in now.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="container-prose py-20 max-w-md">
        <span className="eyebrow text-orange">Staff access</span>
        <h1 className="mt-3 font-serif text-4xl font-bold text-navy">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-3 text-ink-muted text-sm">
          The OpportunityHub admin panel is restricted to{" "}
          <span className="font-mono text-navy">{ADMIN_EMAIL}</span>.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5 border border-rule bg-white p-6">
          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-2 block">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-rule px-3 py-3 outline-none text-sm focus:border-navy"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-2 block">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-rule px-3 py-3 outline-none text-sm focus:border-navy"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-navy px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-orange transition-colors disabled:opacity-60"
          >
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-xs text-ink-muted hover:text-navy"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </form>
        <Link to="/" className="mt-6 inline-block text-xs font-mono uppercase tracking-widest text-ink-muted hover:text-navy">
          ← Back to site
        </Link>
      </section>
    </SiteLayout>
  );
}
