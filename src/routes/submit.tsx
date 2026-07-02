import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { listCategories } from "@/lib/content";
import type { Category } from "@/data/opportunities";

export const Route = createFileRoute("/submit")({
  loader: async () => ({ categories: await listCategories() }),
  head: () => ({
    meta: [
      { title: "Submit an Opportunity — OpportunityHub" },
      { name: "description", content: "Share a scholarship, fellowship, grant, accelerator, or hackathon with our global audience of 100,000+ readers." },
      { property: "og:title", content: "Submit an Opportunity — OpportunityHub" },
      { property: "og:description", content: "Reach 100,000+ ambitious students, founders, and researchers worldwide." },
      { property: "og:url", content: "/submit" },
    ],
    links: [{ rel: "canonical", href: "/submit" }],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  const { categories } = Route.useLoaderData() as { categories: Category[] };
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Submission received. Our editors will review within 48 hours.");
      (e.target as HTMLFormElement).reset();
    }, 600);
  }

  return (
    <SiteLayout>
      <section className="container-prose pt-16 pb-10 max-w-3xl">
        <span className="eyebrow text-orange">Submit</span>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl font-bold text-navy tracking-tight">
          List your opportunity
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          OpportunityHub reaches 100,000+ students, founders, and researchers worldwide. Our
          editors review every submission within 48 hours. Free listings are accepted from
          accredited universities, foundations, and registered organizations.
        </p>
      </section>

      <section className="container-prose pb-24 max-w-3xl">
        <form onSubmit={onSubmit} className="space-y-6 border border-rule bg-white p-6 md:p-10">
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
            <Field label="Application deadline" name="deadline" type="date" required />
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
              placeholder="Tell readers what the opportunity is, who can apply, and why it matters."
              className="w-full border border-rule px-3 py-3 outline-none text-sm focus:border-navy"
            />
          </div>
          <Field label="Your email (for follow-up)" name="email" type="email" required />
          <button
            type="submit"
            disabled={submitting}
            className="bg-navy px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white hover:bg-orange transition-colors disabled:opacity-60"
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
        className="w-full border border-rule px-3 py-3 outline-none text-sm focus:border-navy"
      />
    </div>
  );
}

function Select({
  label,
  name,
  children,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-2 block">
        {label}
      </label>
      <select
        name={name}
        className="w-full border border-rule px-3 py-3 outline-none text-sm bg-white focus:border-navy"
      >
        {children}
      </select>
    </div>
  );
}
