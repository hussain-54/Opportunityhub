import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";
import { slugify } from "@/lib/admin-utils";

export const Route = createFileRoute("/admin/submissions")({
  component: AdminSubmissions,
});

type SubmissionStatus = "pending" | "reviewed" | "rejected" | "approved";

interface Submission {
  id: string;
  title: string;
  organization: string;
  category_slug: string | null;
  country: string | null;
  deadline: string | null;
  funding: string | null;
  official_url: string | null;
  summary: string;
  submitter_email: string;
  status: string;
  created_at: string;
}

function AdminSubmissions() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | SubmissionStatus>("pending");
  const [selected, setSelected] = useState<Submission | null>(null);

  async function load() {
    setLoading(true);
    let q = supabase.from("opportunity_submissions").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    setLoading(false);
    if (error) {
      if (error.message.includes("relation") || error.code === "PGRST205") {
        toast.error("Run supabase/migrations/002_opportunity_submissions.sql in your project first.");
      } else {
        toast.error(error.message);
      }
      setRows([]);
      return;
    }
    setRows((data as Submission[]) ?? []);
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function setStatus(id: string, status: SubmissionStatus) {
    const { error } = await supabase.from("opportunity_submissions").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Marked as ${status}.`);
    if (selected?.id === id) setSelected({ ...selected, status });
    load();
  }

  async function createDraft(sub: Submission) {
    setBusy(true);
    try {
      let categorySlug = sub.category_slug;
      if (!categorySlug) {
        const { data: cats } = await supabase.from("categories").select("slug").order("sort_order").limit(1);
        categorySlug = cats?.[0]?.slug ?? null;
      }
      if (!categorySlug) {
        toast.error("Create at least one category before drafting an opportunity.");
        return;
      }

      const baseSlug = slugify(sub.title) || `submission-${sub.id.slice(0, 8)}`;
      let slug = baseSlug;
      for (let i = 0; i < 5; i++) {
        const candidate = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
        const { data: existing } = await supabase.from("opportunities").select("id").eq("slug", candidate).maybeSingle();
        if (!existing) {
          slug = candidate;
          break;
        }
        slug = `${baseSlug}-${Date.now().toString(36)}`;
      }

      const overview = sub.summary
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      const { error } = await supabase.from("opportunities").insert({
        slug,
        title: sub.title,
        excerpt: overview[0]?.slice(0, 280) ?? "",
        image: "",
        category_slug: categorySlug,
        country: sub.country ?? "",
        deadline: sub.deadline,
        funding: sub.funding ?? "",
        funding_amount: sub.funding,
        organizer: sub.organization,
        overview,
        eligibility: [],
        benefits: [],
        documents: [],
        process: [],
        official_url: sub.official_url ?? "",
        featured: false,
        trending: false,
        published: false,
        published_at: new Date().toISOString(),
        reading_minutes: 5,
      });

      if (error) throw error;

      await supabase.from("opportunity_submissions").update({ status: "approved" }).eq("id", sub.id);
      toast.success("Draft opportunity created (unpublished). Review it under Opportunities.");
      setSelected(null);
      navigate({ to: "/admin/opportunities" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not create draft.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-navy">Submissions</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Review public submissions. Create an unpublished draft when ready, then edit and publish under Opportunities.
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="border border-rule bg-white px-3 py-2 text-sm font-mono uppercase tracking-wider text-xs"
        >
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      {loading ? (
        <p className="text-ink-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="border border-rule bg-white p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-bridge" />
          <p className="mt-4 font-serif text-xl text-navy">No submissions in this view.</p>
        </div>
      ) : (
        <div className="border border-rule bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper">
              <tr className="text-left font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                <th className="p-3">Title</th>
                <th className="p-3">Organization</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-rule">
                  <td className="p-3 font-serif font-bold text-navy">{r.title}</td>
                  <td className="p-3 text-ink-muted">{r.organization}</td>
                  <td className="p-3 text-ink-muted">{formatDate(r.created_at)}</td>
                  <td className="p-3 font-mono text-[10px] uppercase tracking-wider">{r.status}</td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-navy hover:text-bridge"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="min-h-full p-4 md:p-10">
            <div
              className="mx-auto max-w-2xl bg-white border border-rule p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="eyebrow text-bridge">{selected.status}</span>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-navy">{selected.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{selected.organization}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="font-mono text-[10px] uppercase tracking-widest text-ink-muted hover:text-navy"
                >
                  Close
                </button>
              </div>

              <dl className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-ink-muted/70">Category</dt>
                  <dd className="mt-1 text-navy">{selected.category_slug ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-ink-muted/70">Country</dt>
                  <dd className="mt-1 text-navy">{selected.country ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-ink-muted/70">Deadline</dt>
                  <dd className="mt-1 text-navy">{selected.deadline ? formatDate(selected.deadline) : "—"}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-ink-muted/70">Funding</dt>
                  <dd className="mt-1 text-navy">{selected.funding ?? "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-ink-muted/70">Contact</dt>
                  <dd className="mt-1 text-navy">
                    <a href={`mailto:${selected.submitter_email}`} className="text-bridge underline">
                      {selected.submitter_email}
                    </a>
                  </dd>
                </div>
                {selected.official_url && (
                  <div className="sm:col-span-2">
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-ink-muted/70">Official URL</dt>
                    <dd className="mt-1">
                      <a
                        href={selected.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-bridge underline break-all"
                      >
                        {selected.official_url} <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-6">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-ink-muted/70 mb-2">Summary</h4>
                <p className="text-ink-muted leading-relaxed whitespace-pre-wrap">{selected.summary}</p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2 border-t border-rule pt-6">
                <Action onClick={() => createDraft(selected)} primary disabled={busy}>
                  {busy ? "Creating…" : "Create draft opportunity"}
                </Action>
                <Action onClick={() => setStatus(selected.id, "reviewed")} disabled={busy}>
                  Mark reviewed
                </Action>
                <Action onClick={() => setStatus(selected.id, "approved")} disabled={busy}>
                  Approve only
                </Action>
                <Action onClick={() => setStatus(selected.id, "rejected")} danger disabled={busy}>
                  Reject
                </Action>
              </div>
              <p className="mt-4 text-xs text-ink-muted">
                “Create draft” inserts an unpublished opportunity and marks the submission approved. Edit details before
                publishing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Action({
  children,
  onClick,
  primary,
  danger,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50",
        primary
          ? "bg-navy text-white hover:bg-bridge"
          : danger
            ? "border border-danger text-danger hover:bg-danger hover:text-white"
            : "border border-rule text-navy hover:border-navy",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
