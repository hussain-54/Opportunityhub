import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { listCategories } from "@/lib/content";
import type { Category } from "@/data/opportunities";
import { supabase } from "@/integrations/supabase/client";
import { BRAND_NAME, pageTitle } from "@/lib/brand";
import { absoluteUrl } from "@/lib/site-url";
import { assertFormCooldown, FORM_KEYS, isHoneypotFilled, markFormSubmitted } from "@/lib/form-guard";

export const Route = createFileRoute("/submit")({
  loader: async () => ({ categories: await listCategories() }),
  head: () => ({
    meta: [
      { title: pageTitle("Submit an Opportunity") },
      {
        name: "description",
        content: `Suggest a scholarship, fellowship, grant, or program for review on ${BRAND_NAME}. Listings are verified before publication.`,
      },
      { property: "og:title", content: pageTitle("Submit an Opportunity") },
      {
        property: "og:description",
        content: "Share a verified opportunity with our editorial team for review.",
      },
      { property: "og:url", content: absoluteUrl("/submit") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/submit") }],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  const { categories } = Route.useLoaderData() as { categories: Category[] };
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    if (isHoneypotFilled(data.get("company"))) {
      toast.success("Thank you — our editors will review your submission.");
      form.reset();
      return;
    }

    const cooldown = assertFormCooldown(FORM_KEYS.submit, 60_000);
    if (cooldown) {
      toast.error(cooldown);
      return;
    }

    const title = String(data.get("title") ?? "").trim();
    const organization = String(data.get("org") ?? "").trim();
    const category_slug = String(data.get("category") ?? "").trim() || null;
    const country = String(data.get("country") ?? "").trim() || null;
    const deadline = String(data.get("deadline") ?? "").trim() || null;
    const funding = String(data.get("funding") ?? "").trim() || null;
    const official_url = String(data.get("url") ?? "").trim() || null;
    const summary = String(data.get("summary") ?? "").trim();
    const submitter_email = String(data.get("email") ?? "").trim().toLowerCase();

    if (title.length < 3 || organization.length < 2 || summary.length < 20) {
      toast.error("Please complete all required fields with enough detail.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitter_email)) {
      toast.error("Please enter a valid contact email.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("opportunity_submissions").insert({
      title,
      organization,
      category_slug,
      country,
      deadline,
      funding,
      official_url,
      summary,
      submitter_email,
    });
    setSubmitting(false);

    if (error) {
      if (error.message.includes("relation") || error.code === "PGRST205") {
        toast.error(
          "Submission storage is not set up on this database yet. Run supabase/migrations/002_opportunity_submissions.sql, then try again.",
        );
      } else {
        toast.error(error.message || "Submission failed. Please try again later.");
      }
      return;
    }

    markFormSubmitted(FORM_KEYS.submit);
    toast.success("Thank you — our editors will review your submission.");
    form.reset();
  }

  return (
    <SiteLayout>
      <section className="container-prose pt-16 pb-10 max-w-3xl">
        <span className="eyebrow text-bridge">Submit</span>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl font-bold text-navy tracking-tight">List your opportunity</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Share a scholarship, fellowship, grant, or program with {BRAND_NAME}. Our editors verify
          every submission against official sources. Approved listings are published manually — they
          do not go live automatically.
        </p>
      </section>

      <section className="container-prose pb-24 max-w-3xl">
        <form onSubmit={onSubmit} className="space-y-6 border border-rule bg-white p-6 md:p-10 rounded-sm">
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <Field label="Opportunity title" name="title" placeholder="e.g. Chevening Scholarship 2026" required />
          <Field label="Organization" name="org" placeholder="Awarding institution" required />
          <div className="grid md:grid-cols-2 gap-6">
            <Select label="Category" name="category">
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </Select>
            <Field label="Country / region" name="country" placeholder="e.g. United Kingdom" required />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Application deadline" name="deadline" type="date" />
            <Field label="Funding amount" name="funding" placeholder="e.g. Fully funded · £18,180/yr" />
          </div>
          <Field label="Official application URL" name="url" type="url" placeholder="https://" required />
          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-2 block">
              Summary
            </label>
            <textarea
              name="summary"
              rows={5}
              required
              minLength={20}
              placeholder="What the opportunity is, who can apply, and why it matters."
              className="w-full border border-rule px-3 py-3 outline-none text-sm focus:border-bridge"
            />
          </div>
          <Field label="Your email (for follow-up)" name="email" type="email" required />
          <p className="text-xs text-ink-muted">
            By submitting, you confirm the information is accurate and from an official source. See our{" "}
            <a href="/privacy" className="text-bridge underline">
              Privacy Policy
            </a>
            .
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="bg-navy px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-bridge transition-colors disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Submit for review"}
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-2 block">
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full border border-rule px-3 py-3 outline-none text-sm focus:border-bridge"
      />
    </div>
  );
}

function Select({ label, name, children }: { label: string; name: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-2 block">
        {label}
      </label>
      <select name={name} className="w-full border border-rule px-3 py-3 outline-none text-sm bg-white focus:border-bridge">
        {children}
      </select>
    </div>
  );
}