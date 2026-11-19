import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/subscribers")({
  component: AdminSubscribers,
});

interface Subscriber {
  id: string;
  email: string;
  first_name: string | null;
  source: string;
  created_at: string;
}

function AdminSubscribers() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      setRows([]);
      return;
    }
    setRows((data as Subscriber[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.email.toLowerCase().includes(q) ||
        (r.first_name ?? "").toLowerCase().includes(q) ||
        (r.source ?? "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  async function onDelete(id: string, email: string) {
    if (!confirm(`Remove ${email} from the briefing list?`)) return;
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Subscriber removed.");
    load();
  }

  function exportCsv() {
    const header = ["email", "first_name", "source", "created_at"];
    const lines = [
      header.join(","),
      ...filtered.map((r) =>
        [r.email, r.first_name ?? "", r.source, r.created_at]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `futurebridge-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-navy">Subscribers</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {rows.length} {rows.length === 1 ? "person" : "people"} on The Briefing list.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="border border-rule px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-navy hover:border-navy disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 border border-rule bg-white px-3 py-2 max-w-md">
        <Search className="h-4 w-4 text-ink-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search email, name, or source"
          className="flex-1 outline-none text-sm py-1"
        />
      </div>

      {loading ? (
        <p className="text-ink-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="border border-rule bg-white p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-bridge" />
          <p className="mt-4 font-serif text-xl text-navy">No subscribers match.</p>
        </div>
      ) : (
        <div className="border border-rule bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper">
              <tr className="text-left font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                <th className="p-3">Email</th>
                <th className="p-3">Name</th>
                <th className="p-3">Source</th>
                <th className="p-3">Joined</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-rule">
                  <td className="p-3 text-navy">{r.email}</td>
                  <td className="p-3 text-ink-muted">{r.first_name || "—"}</td>
                  <td className="p-3 font-mono text-[10px] uppercase tracking-wider text-ink-muted">{r.source}</td>
                  <td className="p-3 text-ink-muted">{formatDate(r.created_at)}</td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(r.id, r.email)}
                      className="p-2 text-danger hover:opacity-70"
                      aria-label={`Remove ${r.email}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
