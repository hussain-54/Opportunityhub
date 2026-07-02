import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { slugify, parseLines } from "@/lib/admin-utils";

export const Route = createFileRoute("/admin/opportunities")({
  component: AdminOpportunities,
});

interface Row {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  category_slug: string;
  country: string | null;
  deadline: string | null;
  funding: string | null;
  funding_amount: string | null;
  organizer: string | null;
  eligibility: string[] | null;
  benefits: string[] | null;
  documents: string[] | null;
  process: string[] | null;
  overview: string[] | null;
  official_url: string | null;
  featured: boolean;
  trending: boolean;
  published: boolean;
  published_at: string | null;
  reading_minutes: number | null;
}

interface CatRow { slug: string; label: string }

const empty = (): Partial<Row> => ({
  slug: "",
  title: "",
  excerpt: "",
  image: "",
  category_slug: "",
  country: "",
  deadline: "",
  funding: "",
  funding_amount: "",
  organizer: "",
  eligibility: [],
  benefits: [],
  documents: [],
  process: [],
  overview: [],
  official_url: "",
  featured: false,
  trending: false,
  published: true,
  reading_minutes: 5,
});

function AdminOpportunities() {
  const [rows, setRows] = useState<Row[]>([]);
  const [cats, setCats] = useState<CatRow[]>([]);
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [{ data: o }, { data: c }] = await Promise.all([
      supabase.from("opportunities").select("*").order("published_at", { ascending: false }),
      supabase.from("categories").select("slug,label").order("label"),
    ]);
    setRows((o as Row[]) ?? []);
    setCats((c as CatRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function onDelete(id: string) {
    if (!confirm("Delete this opportunity?")) return;
    const { error } = await supabase.from("opportunities").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted.");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-navy">Opportunities</h2>
        <button
          onClick={() => setEditing(empty())}
          className="inline-flex items-center gap-2 bg-navy px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:bg-orange"
        >
          <Plus className="h-3 w-3" /> New
        </button>
      </div>

      {loading ? (
        <p className="text-ink-muted">Loading…</p>
      ) : (
        <div className="border border-rule bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper">
              <tr className="text-left font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-rule">
                  <td className="p-3 font-serif font-bold text-navy">{r.title}</td>
                  <td className="p-3 text-ink-muted">{r.category_slug}</td>
                  <td className="p-3 text-ink-muted">{r.deadline ?? "—"}</td>
                  <td className="p-3 font-mono text-[10px] uppercase">
                    {r.published ? <span className="text-navy">Published</span> : <span className="text-ink-muted">Draft</span>}
                    {r.featured && <span className="ml-2 text-orange">Featured</span>}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(r)} className="p-2 text-navy hover:text-orange"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(r.id)} className="p-2 text-danger hover:opacity-70"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-ink-muted">No opportunities yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <OpportunityEditor
          value={editing}
          categories={cats}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function OpportunityEditor({
  value, categories, onClose, onSaved,
}: {
  value: Partial<Row>;
  categories: CatRow[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [v, setV] = useState<Partial<Row>>(value);
  const [busy, setBusy] = useState(false);
  const isNew = !v.id;

  function patch(p: Partial<Row>) { setV((prev) => ({ ...prev, ...p })); }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!v.title || !v.category_slug) {
      toast.error("Title and category are required.");
      return;
    }
    setBusy(true);
    const slug = v.slug || slugify(v.title);
    const payload: any = {
      slug,
      title: v.title,
      excerpt: v.excerpt || null,
      image: v.image || null,
      category_slug: v.category_slug,
      country: v.country || null,
      deadline: v.deadline || null,
      funding: v.funding || null,
      funding_amount: v.funding_amount || null,
      organizer: v.organizer || null,
      eligibility: v.eligibility ?? [],
      benefits: v.benefits ?? [],
      documents: v.documents ?? [],
      process: v.process ?? [],
      overview: v.overview ?? [],
      official_url: v.official_url || null,
      featured: !!v.featured,
      trending: !!v.trending,
      published: v.published ?? true,
      reading_minutes: Number(v.reading_minutes) || 5,
      published_at: v.published_at ?? new Date().toISOString(),
    };
    try {
      if (isNew) {
        const { error } = await supabase.from("opportunities").insert(payload);
        if (error) throw error;
        toast.success("Opportunity created.");
      } else {
        const { error } = await supabase.from("opportunities").update(payload).eq("id", v.id!);
        if (error) throw error;
        toast.success("Saved.");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.message ?? "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full p-4 md:p-10">
        <div className="mx-auto max-w-3xl bg-white border border-rule" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-rule sticky top-0 bg-white z-10">
            <h3 className="font-serif text-2xl font-bold text-navy">
              {isNew ? "New opportunity" : "Edit opportunity"}
            </h3>
            <button onClick={onClose} className="p-2 hover:text-orange"><X className="h-5 w-5" /></button>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-5">
            <Text label="Title" value={v.title ?? ""} onChange={(t) => patch({ title: t, slug: v.slug || slugify(t) })} required />
            <Text label="Slug (URL)" value={v.slug ?? ""} onChange={(t) => patch({ slug: slugify(t) })} required />
            <Area label="Excerpt" value={v.excerpt ?? ""} onChange={(t) => patch({ excerpt: t })} rows={2} />

            <div>
              <Label>Cover image</Label>
              <ImageUploader value={v.image ?? ""} onChange={(url) => patch({ image: url })} />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label>Category</Label>
                <select
                  value={v.category_slug ?? ""}
                  onChange={(e) => patch({ category_slug: e.target.value })}
                  className="w-full border border-rule px-3 py-2 outline-none text-sm bg-white focus:border-navy"
                  required
                >
                  <option value="">Select…</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
              </div>
              <Text label="Country / Region" value={v.country ?? ""} onChange={(t) => patch({ country: t })} />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <Text label="Deadline" type="date" value={v.deadline ?? ""} onChange={(t) => patch({ deadline: t })} />
              <Text label="Organizer" value={v.organizer ?? ""} onChange={(t) => patch({ organizer: t })} />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <Text label="Funding (short)" value={v.funding ?? ""} onChange={(t) => patch({ funding: t })} placeholder="Fully funded" />
              <Text label="Funding amount (long)" value={v.funding_amount ?? ""} onChange={(t) => patch({ funding_amount: t })} placeholder="£18,000/yr + travel" />
            </div>

            <Text label="Official URL" type="url" value={v.official_url ?? ""} onChange={(t) => patch({ official_url: t })} />

            <LinesField label="Overview (one paragraph per line)" value={v.overview ?? []} onChange={(arr) => patch({ overview: arr })} />
            <LinesField label="Benefits (one per line)" value={v.benefits ?? []} onChange={(arr) => patch({ benefits: arr })} />
            <LinesField label="Eligibility (one per line)" value={v.eligibility ?? []} onChange={(arr) => patch({ eligibility: arr })} />
            <LinesField label="Required documents (one per line)" value={v.documents ?? []} onChange={(arr) => patch({ documents: arr })} />
            <LinesField label="Application process (one step per line)" value={v.process ?? []} onChange={(arr) => patch({ process: arr })} />

            <div className="grid md:grid-cols-3 gap-5">
              <Text label="Reading minutes" type="number" value={String(v.reading_minutes ?? 5)} onChange={(t) => patch({ reading_minutes: Number(t) })} />
              <Toggle label="Featured" checked={!!v.featured} onChange={(b) => patch({ featured: b })} />
              <Toggle label="Trending" checked={!!v.trending} onChange={(b) => patch({ trending: b })} />
            </div>
            <Toggle label="Published (visible to public)" checked={v.published ?? true} onChange={(b) => patch({ published: b })} />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-rule">
              <button type="button" onClick={onClose} className="px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted hover:text-navy">Cancel</button>
              <button type="submit" disabled={busy} className="bg-navy px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:bg-orange disabled:opacity-60">
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-2 block">{children}</label>;
}

function Text({ label, value, onChange, type = "text", placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full border border-rule px-3 py-2 outline-none text-sm focus:border-navy" />
    </div>
  );
}

function Area({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-rule px-3 py-2 outline-none text-sm focus:border-navy" />
    </div>
  );
}

function LinesField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea rows={4} value={(value ?? []).join("\n")} onChange={(e) => onChange(parseLines(e.target.value))}
        className="w-full border border-rule px-3 py-2 outline-none text-sm focus:border-navy font-mono" />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-navy" />
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-navy">{label}</span>
    </label>
  );
}
