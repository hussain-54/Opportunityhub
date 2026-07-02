import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { slugify, parseLines } from "@/lib/admin-utils";

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlog,
});

interface Row {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  author: string | null;
  image: string | null;
  body: string[] | null;
  reading_minutes: number | null;
  published: boolean;
  published_at: string | null;
}

const empty = (): Partial<Row> => ({
  slug: "", title: "", excerpt: "", category: "Editorial",
  author: "OpportunityHub Editors", image: "", body: [],
  reading_minutes: 5, published: true,
});

function AdminBlog() {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("published_at", { ascending: false });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function onDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted.");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-navy">Journal posts</h2>
        <button onClick={() => setEditing(empty())} className="inline-flex items-center gap-2 bg-navy px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:bg-orange">
          <Plus className="h-3 w-3" /> New
        </button>
      </div>

      {loading ? <p className="text-ink-muted">Loading…</p> : (
        <div className="border border-rule bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper">
              <tr className="text-left font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Author</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-rule">
                  <td className="p-3 font-serif font-bold text-navy">{r.title}</td>
                  <td className="p-3 text-ink-muted">{r.category}</td>
                  <td className="p-3 text-ink-muted">{r.author}</td>
                  <td className="p-3 font-mono text-[10px] uppercase">{r.published ? <span className="text-navy">Published</span> : <span className="text-ink-muted">Draft</span>}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(r)} className="p-2 text-navy hover:text-orange"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(r.id)} className="p-2 text-danger hover:opacity-70"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-ink-muted">No posts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && <BlogEditor value={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function BlogEditor({ value, onClose, onSaved }: { value: Partial<Row>; onClose: () => void; onSaved: () => void }) {
  const [v, setV] = useState<Partial<Row>>(value);
  const [busy, setBusy] = useState(false);
  const isNew = !v.id;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!v.title) return toast.error("Title required.");
    setBusy(true);
    const payload: any = {
      slug: v.slug || slugify(v.title!),
      title: v.title!,
      excerpt: v.excerpt || null,
      category: v.category || "Editorial",
      author: v.author || "OpportunityHub Editors",
      image: v.image || null,
      body: v.body ?? [],
      reading_minutes: Number(v.reading_minutes) || 5,
      published: v.published ?? true,
      published_at: v.published_at ?? new Date().toISOString(),
    };
    try {
      const res = isNew
        ? await supabase.from("blog_posts").insert(payload)
        : await supabase.from("blog_posts").update(payload).eq("id", v.id!);
      if (res.error) throw res.error;
      toast.success("Saved.");
      onSaved();
    } catch (err: any) {
      toast.error(err?.message ?? "Save failed.");
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full p-4 md:p-10">
        <div className="mx-auto max-w-3xl bg-white border border-rule" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-rule sticky top-0 bg-white z-10">
            <h3 className="font-serif text-2xl font-bold text-navy">{isNew ? "New post" : "Edit post"}</h3>
            <button onClick={onClose} className="p-2 hover:text-orange"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={onSubmit} className="p-6 space-y-5">
            <Field label="Title" value={v.title ?? ""} onChange={(t) => setV({ ...v, title: t, slug: v.slug || slugify(t) })} required />
            <Field label="Slug" value={v.slug ?? ""} onChange={(t) => setV({ ...v, slug: slugify(t) })} required />
            <Area label="Excerpt" value={v.excerpt ?? ""} onChange={(t) => setV({ ...v, excerpt: t })} rows={2} />
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Category" value={v.category ?? ""} onChange={(t) => setV({ ...v, category: t })} placeholder="Guides, Essays, Field Notes…" />
              <Field label="Author" value={v.author ?? ""} onChange={(t) => setV({ ...v, author: t })} />
            </div>
            <div>
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-2 block">Cover image</label>
              <ImageUploader value={v.image ?? ""} onChange={(url) => setV({ ...v, image: url })} />
            </div>
            <div>
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-2 block">Body (one paragraph per line)</label>
              <textarea rows={12} value={(v.body ?? []).join("\n")} onChange={(e) => setV({ ...v, body: parseLines(e.target.value) })}
                className="w-full border border-rule px-3 py-2 outline-none text-sm focus:border-navy" />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Reading minutes" type="number" value={String(v.reading_minutes ?? 5)} onChange={(t) => setV({ ...v, reading_minutes: Number(t) })} />
              <label className="flex items-end gap-2 cursor-pointer pb-2">
                <input type="checkbox" checked={v.published ?? true} onChange={(e) => setV({ ...v, published: e.target.checked })} className="h-4 w-4 accent-navy" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-navy">Published</span>
              </label>
            </div>
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

function Field({ label, value, onChange, type = "text", placeholder, required }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-2 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full border border-rule px-3 py-2 outline-none text-sm focus:border-navy" />
    </div>
  );
}

function Area({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-2 block">{label}</label>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-rule px-3 py-2 outline-none text-sm focus:border-navy" />
    </div>
  );
}
