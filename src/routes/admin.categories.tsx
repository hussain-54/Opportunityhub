import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/admin-utils";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

interface Row {
  id: string;
  slug: string;
  label: string;
  icon: string | null;
  blurb: string | null;
  sort_order: number | null;
}

const empty = (): Partial<Row> => ({ slug: "", label: "", icon: "Sparkles", blurb: "", sort_order: 0 });

function AdminCategories() {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order").order("label");
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function onDelete(id: string) {
    if (!confirm("Delete category? Opportunities in it must be moved first.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted.");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-navy">Categories</h2>
        <button onClick={() => setEditing(empty())} className="inline-flex items-center gap-2 bg-navy px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:bg-orange">
          <Plus className="h-3 w-3" /> New
        </button>
      </div>

      {loading ? <p className="text-ink-muted">Loading…</p> : (
        <div className="border border-rule bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper">
              <tr className="text-left font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                <th className="p-3">Label</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Icon</th>
                <th className="p-3">Order</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-rule">
                  <td className="p-3 font-serif font-bold text-navy">{r.label}</td>
                  <td className="p-3 font-mono text-xs text-ink-muted">{r.slug}</td>
                  <td className="p-3 font-mono text-xs text-ink-muted">{r.icon}</td>
                  <td className="p-3 font-mono text-xs text-ink-muted">{r.sort_order}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(r)} className="p-2 text-navy hover:text-orange"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(r.id)} className="p-2 text-danger hover:opacity-70"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-ink-muted">No categories yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <CategoryEditor value={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}
    </div>
  );
}

function CategoryEditor({ value, onClose, onSaved }: { value: Partial<Row>; onClose: () => void; onSaved: () => void }) {
  const [v, setV] = useState<Partial<Row>>(value);
  const [busy, setBusy] = useState(false);
  const isNew = !v.id;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!v.label) return toast.error("Label required.");
    setBusy(true);
    const payload: any = {
      slug: v.slug || slugify(v.label!),
      label: v.label!,
      icon: v.icon || "Sparkles",
      blurb: v.blurb || null,
      sort_order: Number(v.sort_order) || 0,
    };
    try {
      const res = isNew
        ? await supabase.from("categories").insert(payload)
        : await supabase.from("categories").update(payload).eq("id", v.id!);
      if (res.error) throw res.error;
      toast.success("Saved.");
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
        <div className="mx-auto max-w-xl bg-white border border-rule" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-rule">
            <h3 className="font-serif text-2xl font-bold text-navy">{isNew ? "New category" : "Edit category"}</h3>
            <button onClick={onClose} className="p-2 hover:text-orange"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={onSubmit} className="p-6 space-y-5">
            <Field label="Label" value={v.label ?? ""} onChange={(t) => setV({ ...v, label: t, slug: v.slug || slugify(t) })} required />
            <Field label="Slug" value={v.slug ?? ""} onChange={(t) => setV({ ...v, slug: slugify(t) })} required />
            <Field label="Icon (lucide-react name)" value={v.icon ?? "Sparkles"} onChange={(t) => setV({ ...v, icon: t })} placeholder="e.g. GraduationCap, Trophy, Rocket" />
            <div>
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted/70 mb-2 block">Blurb</label>
              <textarea rows={3} value={v.blurb ?? ""} onChange={(e) => setV({ ...v, blurb: e.target.value })} className="w-full border border-rule px-3 py-2 outline-none text-sm focus:border-navy" />
            </div>
            <Field label="Sort order" type="number" value={String(v.sort_order ?? 0)} onChange={(t) => setV({ ...v, sort_order: Number(t) })} />
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
