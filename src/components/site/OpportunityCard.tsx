import { Link } from "@tanstack/react-router";
import { type Opportunity, type Category } from "@/data/opportunities";
import { deadlineLabel } from "@/lib/format";

interface Props {
  opportunity: Opportunity;
  variant?: "feature" | "default";
  category?: Category;
}

export function OpportunityCard({ opportunity, variant = "default", category }: Props) {
  const isFeature = variant === "feature";
  const label = category?.label ?? opportunity.category.replace(/-/g, " ");

  return (
    <Link
      to="/opportunity/$slug"
      params={{ slug: opportunity.slug }}
      className="group block"
    >
      <div
        className={`relative overflow-hidden bg-navy-soft ${
          isFeature ? "aspect-[16/10]" : "aspect-[4/3]"
        }`}
      >
        <img
          src={opportunity.image}
          alt={opportunity.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="bg-orange px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white capitalize">
          {label}
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
          {opportunity.country}
        </span>
      </div>
      <h3
        className={`mt-3 font-serif font-bold leading-snug text-navy group-hover:text-orange transition-colors ${
          isFeature ? "text-2xl" : "text-lg"
        }`}
      >
        {opportunity.title}
      </h3>
      {isFeature && (
        <p className="mt-2 text-sm text-ink-muted leading-relaxed line-clamp-2">
          {opportunity.excerpt}
        </p>
      )}
      <div className="mt-4 flex justify-between items-center border-t border-rule pt-3">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] uppercase text-ink-muted/70">Deadline</span>
          <span className="font-mono text-xs font-bold text-danger">
            {deadlineLabel(opportunity.deadline)}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="font-mono text-[9px] uppercase text-ink-muted/70">Funding</span>
          <span className="font-mono text-xs font-bold text-navy">{opportunity.funding}</span>
        </div>
      </div>
    </Link>
  );
}
