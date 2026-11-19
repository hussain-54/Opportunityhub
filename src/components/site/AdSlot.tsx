interface Props {
  format?: "leaderboard" | "rectangle" | "skyscraper" | "in-article";
  className?: string;
}

const sizes: Record<NonNullable<Props["format"]>, string> = {
  leaderboard: "aspect-[728/90] max-h-28",
  rectangle: "aspect-[300/250]",
  skyscraper: "aspect-[160/600]",
  "in-article": "aspect-[336/280]",
};

/**
 * Google AdSense-ready ad slot.
 *
 * Drop in a real <ins class="adsbygoogle"> element once your AdSense account is approved
 * and your publisher ID is wired in __root.tsx. The container honors the canonical ad
 * sizes so layout shift stays at zero either way.
 */
export function AdSlot({ format = "rectangle", className = "" }: Props) {
  return (
    <aside aria-label="Advertisement" className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-ink-muted/50">
          Advertisement
        </span>
      </div>
      <div
        className={`${sizes[format]} w-full grid place-items-center bg-navy-soft border border-rule`}
        data-ad-slot={format}
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted/40">
          Sponsor your message here
        </span>
      </div>
    </aside>
  );
}
