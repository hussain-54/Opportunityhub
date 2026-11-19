import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { BRAND_NAME, pageTitle } from "@/lib/brand";
import { assertFormCooldown, FORM_KEYS, isHoneypotFilled, markFormSubmitted } from "@/lib/form-guard";

type UnsubscribeSearch = { email?: string };

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (search: Record<string, unknown>): UnsubscribeSearch => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  head: () => ({
    meta: [
      { title: pageTitle("Unsubscribe") },
      { name: "robots", content: "noindex,nofollow" },
      { name: "description", content: `Leave the ${BRAND_NAME} briefing list.` },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { email: initialEmail } = Route.useSearch();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (isHoneypotFilled(form.get("company"))) return;

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email address.");
      return;
    }

    const cooldown = assertFormCooldown(FORM_KEYS.unsubscribe, 20_000);
    if (cooldown) {
      toast.error(cooldown);
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.rpc("unsubscribe_newsletter", { p_email: trimmed });
    setBusy(false);

    if (error) {
      if (error.message.includes("function") || error.code === "PGRST202") {
        toast.error("Unsubscribe is not enabled yet. Run migration 003 in Supabase, or email privacy@futurebridge.app.");
      } else {
        toast.error(error.message || "Could not unsubscribe right now.");
      }
      return;
    }

    markFormSubmitted(FORM_KEYS.unsubscribe);
    setDone(true);
    toast.success(data ? "You have been unsubscribed." : "That email was not on the list.");
  }

  return (
    <SiteLayout>
      <section className="container-prose max-w-lg py-20">
        <span className="eyebrow text-bridge">Newsletter</span>
        <h1 className="mt-3 font-serif text-4xl font-bold text-navy">Unsubscribe</h1>
        <p className="mt-4 text-ink-muted">
          Leave the {BRAND_NAME} briefing. You can subscribe again anytime from the site footer.
        </p>

        {done ? (
          <p className="mt-10 border border-rule bg-white p-6 text-navy">
            Done. If you still receive mail for a short while, it may be messages already in transit.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 space-y-4 border border-rule bg-white p-6">
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
            <div>
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-2 block">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-rule px-3 py-3 outline-none text-sm focus:border-bridge"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="bg-navy px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-bridge disabled:opacity-60"
            >
              {busy ? "Working…" : "Unsubscribe"}
            </button>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}