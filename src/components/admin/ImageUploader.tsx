import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/admin-utils";
import { resolveImage } from "@/lib/images";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploader({ value, onChange }: Props) {
  const [busy, setBusy] = useState(false);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success("Image uploaded.");
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or seed filename"
          className="flex-1 min-w-[200px] border border-rule px-3 py-2 outline-none text-sm focus:border-navy"
        />
        <label className="cursor-pointer bg-navy px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:bg-orange transition-colors">
          {busy ? "Uploading…" : "Upload"}
          <input type="file" accept="image/*" onChange={onFile} disabled={busy} className="hidden" />
        </label>
      </div>
      {value && (
        <div className="border border-rule p-2 inline-block bg-white">
          <img src={resolveImage(value)} alt="" className="h-24 w-auto object-cover" />
        </div>
      )}
    </div>
  );
}
